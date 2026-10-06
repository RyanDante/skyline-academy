import * as seed from '@/data/seed';
import { findRelatedQuestions } from '@/domain/search';
import { config } from '@/lib/config';
import { callable } from '@/lib/firebase';

export interface TutorTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface TutorRequest {
  message: string;
  history: TutorTurn[];
  mode: 'explain' | 'solve-with-me';
  level?: 'O' | 'A';
  /** JPEG, base64 without the data: prefix, already resized on-device. */
  imageBase64?: string;
}

export interface TutorResponse {
  reply: string;
  relatedQuestionIds: string[];
  suggestTeacher: boolean;
  /** Remaining free questions today, as counted by the server. */
  remainingToday: number | null;
}

const tutorAsk = callable<TutorRequest, TutorResponse>('tutorAsk');

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const tutorService = {
  async ask(request: TutorRequest): Promise<TutorResponse> {
    if (!config.useMocks) return tutorAsk(request);

    await wait(900);
    const related = findRelatedQuestions(request.message, seed.questions);
    if (related.length > 0) {
      return {
        reply:
          'This looks like a past GCE question that a Skyline teacher has already solved. Open it below to see the marked solution, then try a similar one yourself.',
        relatedQuestionIds: related.map((q) => q.id),
        suggestTeacher: false,
        remainingToday: null,
      };
    }
    return {
      reply:
        request.mode === 'solve-with-me'
          ? 'Let’s work through it together. First, what is the question asking you to find, and which quantities are you given?'
          : 'Demo mode can only match questions from the sample papers. Connect Firebase to get full Tutor answers. If you are stuck, a Skyline teacher can help.',
      relatedQuestionIds: [],
      suggestTeacher: request.mode !== 'solve-with-me',
      remainingToday: null,
    };
  },
};
