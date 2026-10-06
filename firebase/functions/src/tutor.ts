import Anthropic from '@anthropic-ai/sdk';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { cameroonDayKey, db, getEntitlement, isPassActive, requireUid } from './admin.js';
import { ANTHROPIC_API_KEY, FREE_TUTOR_QUESTIONS_PER_DAY, REGION } from './config.js';
import { findGrounding } from './search.js';

interface TutorRequest {
  message: string;
  history: { role: 'user' | 'assistant'; text: string }[];
  mode: 'explain' | 'solve-with-me';
  level?: 'O' | 'A';
  imageBase64?: string;
}

interface TutorResponse {
  reply: string;
  relatedQuestionIds: string[];
  suggestTeacher: boolean;
  remainingToday: number | null;
}

const MODEL = 'claude-opus-5-5';
const TEACHER_MARKER = '[ASK_TEACHER]';
const MAX_TEXT = 4000;
const MAX_HISTORY = 8;
/** ~3 MB of base64 ≈ 2.2 MB JPEG; the app sends quality-0.5 photos well under this. */
const MAX_IMAGE_CHARS = 3_000_000;

// Kept byte-stable so the prefix can be cached; per-request context goes in the user turn.
const SYSTEM_PROMPT = `You are the Skyline Tutor, the study assistant of Skyline Academy, a Cameroonian institution that prepares students for the Anglophone GCE (O Level and A Level) and for competitive entrance exams (Concours).

Who you are talking to: secondary students in Cameroon, often on a phone with a slow connection. Write in clear, warm, direct English, like a respected older sibling who is also an excellent teacher. Keep answers short enough to read on a phone; use short paragraphs and numbered steps.

How you teach:
- Teach, don't just answer. Explain the idea, show the method, then the result.
- Follow the GCE syllabus and the way GCE examiners award marks. When it helps, say where marks are won or lost (method marks, units, significant figures).
- When "Skyline solutions" are provided in the student's message, treat them as the authoritative method and stay consistent with them. Point the student to them.
- Write maths in plain text that reads well on a phone (for example: v = u + at, x², ∫ 2x dx). Use $...$ only for expressions that cannot be written plainly.
- In "solve-with-me" mode, never give the full solution at once: ask one guiding question at a time and wait for the student.
- If the student shares a photo, read the question from it first. If it is unreadable, ask for a clearer photo.

Honesty:
- If you are not confident your answer is correct, or the question is outside the GCE syllabus, say so plainly and end your reply with the exact token ${TEACHER_MARKER} on its own line, so the app can offer a Skyline teacher.
- Never invent exam dates, Concours requirements, cut-off scores or fees. For those, tell the student to check the Concours tab or ask Skyline.`;

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() }));

function validate(data: unknown): TutorRequest {
  const d = data as Partial<TutorRequest>;
  if (typeof d?.message !== 'string' || d.message.trim().length === 0 || d.message.length > MAX_TEXT) {
    throw new HttpsError('invalid-argument', 'Ask a question of up to 4000 characters.');
  }
  if (d.mode !== 'explain' && d.mode !== 'solve-with-me') {
    throw new HttpsError('invalid-argument', 'Unknown mode.');
  }
  const history = Array.isArray(d.history) ? d.history.slice(-MAX_HISTORY) : [];
  for (const turn of history) {
    if ((turn.role !== 'user' && turn.role !== 'assistant') || typeof turn.text !== 'string' || turn.text.length > MAX_TEXT) {
      throw new HttpsError('invalid-argument', 'Invalid conversation history.');
    }
  }
  if (d.imageBase64 !== undefined && (typeof d.imageBase64 !== 'string' || d.imageBase64.length > MAX_IMAGE_CHARS)) {
    throw new HttpsError('invalid-argument', 'That photo is too large. Try again with a closer crop.');
  }
  return { message: d.message, history, mode: d.mode, level: d.level, imageBase64: d.imageBase64 };
}

/** Atomically counts today's question; returns remaining (null = unlimited) or throws when exhausted. */
async function consumeQuota(uid: string, unlimited: boolean): Promise<number | null> {
  const ref = db.collection('users').doc(uid).collection('usage').doc(cameroonDayKey());
  return db.runTransaction(async (tx) => {
    const used = ((await tx.get(ref)).get('tutorQuestions') as number | undefined) ?? 0;
    if (!unlimited && used >= FREE_TUTOR_QUESTIONS_PER_DAY) {
      throw new HttpsError('resource-exhausted', 'You have used today’s free Tutor questions.');
    }
    tx.set(ref, { tutorQuestions: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return unlimited ? null : FREE_TUTOR_QUESTIONS_PER_DAY - used - 1;
  });
}

/** Gives back a question when the Tutor failed to answer. */
async function refundQuota(uid: string): Promise<void> {
  await db
    .collection('users')
    .doc(uid)
    .collection('usage')
    .doc(cameroonDayKey())
    .set({ tutorQuestions: FieldValue.increment(-1) }, { merge: true });
}

/** Builds alternating user/assistant turns (consecutive same-role turns are merged by the API). */
function buildMessages(req: TutorRequest, groundingText: string): Anthropic.Beta.BetaMessageParam[] {
  const messages: Anthropic.Beta.BetaMessageParam[] = req.history.map((t) => ({ role: t.role, content: t.text }));
  // The first message must come from the user.
  while (messages[0]?.role === 'assistant') messages.shift();

  const context = [
    `Mode: ${req.mode}. Level: GCE ${req.level ?? 'A'} Level.`,
    groundingText ? `Skyline solutions for similar past questions:\n${groundingText}` : '',
    `Student: ${req.message}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (req.imageBase64) {
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: req.imageBase64 } });
  }
  content.push({ type: 'text', text: context });
  messages.push({ role: 'user', content });
  return messages;
}

export const tutorAsk = onCall(
  { region: REGION, secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 120, memory: '512MiB' },
  async (request): Promise<TutorResponse> => {
    const uid = requireUid(request);
    const req = validate(request.data);

    const entitlement = await getEntitlement(uid);
    const remainingToday = await consumeQuota(uid, isPassActive(entitlement));

    const grounding = await findGrounding(req.message).catch((e: unknown) => {
      logger.warn('grounding failed', e);
      return [];
    });
    const groundingText = grounding
      .filter((g) => g.solutionText)
      .map((g, i) => `(${i + 1}) Question: ${g.stem}\nSolution:\n${g.solutionText}`)
      .join('\n\n');

    let response: Anthropic.Beta.BetaMessage;
    try {
      response = await getClient().beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        // On a policy decline the API re-runs the request on a suitable fallback model in the same call.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'medium' },
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: buildMessages(req, groundingText),
      });
    } catch (error) {
      await refundQuota(uid).catch(() => undefined);
      if (error instanceof Anthropic.RateLimitError) {
        throw new HttpsError('unavailable', 'The Tutor is busy. Try again in a minute.');
      }
      if (error instanceof Anthropic.APIError) {
        logger.error('anthropic api error', { status: error.status, message: error.message });
        throw new HttpsError('internal', 'The Tutor could not answer just now.');
      }
      throw error;
    }

    if (response.stop_reason === 'refusal') {
      return {
        reply: "I can't help with that one. A Skyline teacher can talk it through with you.",
        relatedQuestionIds: grounding.map((g) => g.questionId),
        suggestTeacher: true,
        remainingToday,
      };
    }

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    const suggestTeacher = text.includes(TEACHER_MARKER);
    return {
      reply: text.replace(TEACHER_MARKER, '').trim() || 'Could you rephrase your question?',
      relatedQuestionIds: grounding.map((g) => g.questionId),
      suggestTeacher,
      remainingToday,
    };
  },
);
