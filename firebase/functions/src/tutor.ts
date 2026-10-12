import Anthropic from '@anthropic-ai/sdk';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { cameroonDayKey, db, getEntitlement, isPassActive, requireUid } from './admin.js';
import { ANTHROPIC_API_KEY, FREE_TUTOR_QUESTIONS_PER_DAY, REGION } from './config.js';
import { findGrounding, loadQuestionContext, type QuestionContext } from './search.js';

type TutorIntent = 'hint' | 'explain' | 'check' | 'solution' | 'chat';
type TutorMode = 'quiz' | 'explain' | 'solve-with-me';

interface TutorRequest {
  intent: TutorIntent;
  mode: TutorMode;
  message: string;
  history: { role: 'user' | 'assistant'; text: string }[];
  level?: 'O' | 'A';
  /** The past-paper question in focus; its text and solution are loaded here, never trusted from the app. */
  questionId?: string;
  topicNames?: string[];
  studentAnswer?: string;
  imageBase64?: string;
}

const INTENTS: TutorIntent[] = ['hint', 'explain', 'check', 'solution', 'chat'];
const MODES: TutorMode[] = ['quiz', 'explain', 'solve-with-me'];

/** What to do this turn. Lives in the user turn so the system prompt stays cacheable. */
const INTENT_INSTRUCTIONS: Record<TutorIntent, string> = {
  hint: 'Give ONE short hint that moves the student forward. Do not reveal the final answer or the full method.',
  explain:
    'Briefly teach the idea this question tests, then show how it applies here. Keep it short and step by step.',
  check:
    "Check the student's answer. If a Skyline solution with mark points is given, compare against it: say which steps earn marks and where marks are lost. Be encouraging and specific.",
  solution:
    'Skyline has no worked solution for this question. Write a clear, step-by-step worked solution with the final answer and units. The app labels this "AI explanation: check with your teacher".',
  chat: "Answer the student's message about the question or topic in focus.",
};

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
const SYSTEM_PROMPT = `You are the GCE Tutor, the study assistant of Skyline Academy, a Cameroonian institution that prepares students for the Anglophone GCE (O Level and A Level) and for competitive entrance exams (Concours).

Who you are talking to: secondary students in Cameroon, often on a phone with a slow connection. Write in clear, warm, direct English, like a respected older sibling who is also an excellent teacher. Keep answers short enough to read on a phone; use short paragraphs and numbered steps.

How you teach:
- Teach, don't just answer. Explain the idea, show the method, then the result.
- Follow the GCE syllabus and the way GCE examiners award marks. When it helps, say where marks are won or lost (method marks, units, significant figures).
- When "Skyline solutions" are provided in the student's message, treat them as the authoritative method and stay consistent with them. Point the student to them.
- Write maths in plain text that reads well on a phone (for example: v = u + at, x², ∫ 2x dx). Use $...$ only for expressions that cannot be written plainly.
- In "solve-with-me" mode, never give the full solution at once: ask one guiding question at a time and wait for the student.
- If the student shares a photo, read the question from it first. If it is unreadable, ask for a clearer photo.
- Each turn comes with a task (hint, explain, check, solution or chat). Do exactly that task.

Scope:
- Stay on GCE study. If asked about something else, politely bring the student back to their revision. For Concours and career questions, point them to Skyler in the app.
- Past-paper questions come only from Skyline's question bank, given to you in the message. Never invent a question and call it a past paper.

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
  if (!d.mode || !MODES.includes(d.mode)) {
    throw new HttpsError('invalid-argument', 'Unknown mode.');
  }
  if (!d.intent || !INTENTS.includes(d.intent)) {
    throw new HttpsError('invalid-argument', 'Unknown request.');
  }
  if (d.questionId !== undefined && (typeof d.questionId !== 'string' || !/^[\w-]{1,100}$/.test(d.questionId))) {
    throw new HttpsError('invalid-argument', 'Unknown question.');
  }
  const topicNames = Array.isArray(d.topicNames)
    ? d.topicNames.slice(0, 10).map((t) => String(t).slice(0, 100))
    : undefined;
  const studentAnswer = typeof d.studentAnswer === 'string' ? d.studentAnswer.slice(0, MAX_TEXT) : undefined;
  const history = Array.isArray(d.history) ? d.history.slice(-MAX_HISTORY) : [];
  for (const turn of history) {
    if ((turn.role !== 'user' && turn.role !== 'assistant') || typeof turn.text !== 'string' || turn.text.length > MAX_TEXT) {
      throw new HttpsError('invalid-argument', 'Invalid conversation history.');
    }
  }
  if (d.imageBase64 !== undefined && (typeof d.imageBase64 !== 'string' || d.imageBase64.length > MAX_IMAGE_CHARS)) {
    throw new HttpsError('invalid-argument', 'That photo is too large. Try again with a closer crop.');
  }
  return {
    intent: d.intent,
    mode: d.mode,
    message: d.message,
    history,
    level: d.level === 'O' ? 'O' : 'A',
    questionId: d.questionId,
    topicNames,
    studentAnswer,
    imageBase64: d.imageBase64,
  };
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
function buildMessages(
  req: TutorRequest,
  focus: QuestionContext | null,
  groundingText: string,
): Anthropic.Beta.BetaMessageParam[] {
  const messages: Anthropic.Beta.BetaMessageParam[] = req.history.map((t) => ({ role: t.role, content: t.text }));
  // The first message must come from the user.
  while (messages[0]?.role === 'assistant') messages.shift();

  const focusText = focus
    ? [
        `Past-paper question in focus (${focus.source}, ${focus.marks} marks):\n${focus.stem}`,
        focus.optionsText ? `Options:\n${focus.optionsText}` : '',
        focus.solutionText
          ? `Skyline solution with mark points (authoritative; ${
              req.intent === 'hint' ? 'do NOT reveal it' : 'stay consistent with it'
            }):\n${focus.solutionText}`
          : 'There is no Skyline solution for this question yet.',
      ]
        .filter(Boolean)
        .join('\n')
    : req.topicNames?.length
      ? `Topic in focus: ${req.topicNames.join(', ')}. There is no specific question; teach the topic.`
      : '';

  const context = [
    `Task: ${req.intent}. ${INTENT_INSTRUCTIONS[req.intent]}`,
    `Mode: ${req.mode}. Level: GCE ${req.level ?? 'A'} Level.`,
    focusText,
    groundingText ? `Skyline solutions for similar past questions:\n${groundingText}` : '',
    req.studentAnswer ? `Student's answer:\n${req.studentAnswer}` : '',
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

    const focus = req.questionId
      ? await loadQuestionContext(req.questionId).catch((e: unknown) => {
          logger.warn('question context failed', e);
          return null;
        })
      : null;

    // Free-form chat without a question in focus: look for related past questions instead.
    const grounding = focus
      ? []
      : await findGrounding(req.message).catch((e: unknown) => {
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
        messages: buildMessages(req, focus, groundingText),
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
