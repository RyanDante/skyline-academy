import * as seed from '@/data/seed';
import { findRelatedQuestions } from '@/domain/search';
import { config } from '@/lib/config';
import { callable } from '@/lib/firebase';

export interface TutorTurn {
  role: 'user' | 'assistant';
  text: string;
}

/**
 * What the student asked the GCE Tutor for. Each successful request is one AI use
 * ("5 free left today"); MCQ marking and Skyline solutions never call the AI.
 * - hint: a nudge that doesn't give the answer away
 * - explain: teach the idea behind the current question
 * - check: feedback on a typed or photographed answer
 * - solution: a worked explanation when Skyline has no solution of its own
 * - chat: any other question about the current question or topic
 */
export type TutorIntent = 'hint' | 'explain' | 'check' | 'solution' | 'chat';
export type TutorMode = 'quiz' | 'explain' | 'solve-with-me';

export interface TutorRequest {
  intent: TutorIntent;
  mode: TutorMode;
  message: string;
  history: TutorTurn[];
  level?: 'O' | 'A';
  /** The past-paper question in focus. The server loads its text and solution itself. */
  questionId?: string;
  /** Topic names when there is no question in focus (Explain mode on a topic). */
  topicNames?: string[];
  studentAnswer?: string;
  /** JPEG, base64 without the data: prefix. */
  imageBase64?: string;
}

export interface TutorResponse {
  reply: string;
  relatedQuestionIds: string[];
  suggestTeacher: boolean;
  /** Remaining free AI replies today, as counted by the server. */
  remainingToday: number | null;
}

const tutorAsk = callable<TutorRequest, TutorResponse>('tutorAsk');

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Demo replies, so every button can be tried without Firebase. */
const MOCK_REPLIES: Record<TutorIntent, string> = {
  hint: 'Hint: start by writing down what the question gives you and what it asks for. Which formula links those quantities?',
  explain:
    'Here is the idea behind this question. Identify the physical law or rule it tests, write it as an equation, then substitute the values with units. In the full app the Tutor explains this exact question step by step.',
  check:
    'Thanks, I have looked at your answer. In the full app the Tutor checks each step against the mark scheme and tells you where marks are won or lost.',
  solution:
    'AI explanation (demo): set out the method in steps, show the substitution, and give the final value with units. Check this with your teacher.',
  chat: 'Demo mode can only give sample replies. Connect Firebase to get full Tutor answers.',
};

export const tutorService = {
  async ask(request: TutorRequest): Promise<TutorResponse> {
    if (!config.useMocks) return tutorAsk(request);

    await wait(900);
    if (request.intent === 'chat' && !request.questionId) {
      const related = findRelatedQuestions(request.message, seed.questions);
      if (related.length > 0) {
        return {
          reply:
            'This looks like a past GCE question that a Skyline teacher has already solved. Open it below to see the marked solution.',
          relatedQuestionIds: related.map((q) => q.id),
          suggestTeacher: false,
          remainingToday: null,
        };
      }
    }
    const reply =
      request.mode === 'solve-with-me' && request.intent !== 'solution'
        ? 'Let’s work through it together. First, what is the question asking you to find, and which quantities are you given?'
        : MOCK_REPLIES[request.intent];
    return { reply, relatedQuestionIds: [], suggestTeacher: false, remainingToday: null };
  },
};
