import { db } from './admin.js';
import { keywords } from './keywords.js';

export interface GroundingItem {
  questionId: string;
  stem: string;
  solutionText: string | null;
}

interface QuestionDoc {
  stem: string;
  keywords?: string[];
}

interface SolutionDoc {
  steps: { body: string; working?: string; markPoints: { code: string; text: string }[] }[];
  finalAnswer: string;
  commonSlip?: string;
}

function solutionToText(s: SolutionDoc): string {
  const steps = s.steps
    .map((step, i) => {
      const marks = step.markPoints.map((m) => `${m.code} ${m.text}`).join('; ');
      return `${i + 1}. ${step.body}${step.working ? ` Working: ${step.working}` : ''}${marks ? ` [${marks}]` : ''}`;
    })
    .join('\n');
  return `${steps}\nAnswer: ${s.finalAnswer}${s.commonSlip ? `\nCommon slip: ${s.commonSlip}` : ''}`;
}

/**
 * Finds stored past questions that overlap the student's message (via the `keywords` array on
 * each question) and returns them with their teacher-written solutions.
 */
export async function findGrounding(message: string, limit = 3): Promise<GroundingItem[]> {
  const tokens = keywords(message).slice(0, 30); // array-contains-any accepts up to 30 values
  if (tokens.length === 0) return [];

  const snap = await db.collection('questions').where('keywords', 'array-contains-any', tokens).limit(25).get();

  const ranked = snap.docs
    .map((d) => {
      const data = d.data() as QuestionDoc;
      const words = new Set(data.keywords ?? []);
      const overlap = tokens.filter((t) => words.has(t)).length;
      return { id: d.id, stem: data.stem, score: overlap / Math.sqrt(words.size || 1) };
    })
    .filter((r) => r.score > 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return Promise.all(
    ranked.map(async (r) => {
      const sol = await db.collection('solutions').where('questionId', '==', r.id).limit(1).get();
      const doc = sol.docs[0];
      return {
        questionId: r.id,
        stem: r.stem,
        solutionText: doc ? solutionToText(doc.data() as SolutionDoc) : null,
      };
    }),
  );
}
