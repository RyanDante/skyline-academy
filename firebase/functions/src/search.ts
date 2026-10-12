import { db } from './admin.js';
import { keywords } from './keywords.js';

export interface GroundingItem {
  questionId: string;
  stem: string;
  solutionText: string | null;
}

interface QuestionDoc {
  stem: string;
  paperId: string;
  label: string;
  marks: number;
  options?: { key: string; text: string }[];
  keywords?: string[];
}

export interface QuestionContext {
  stem: string;
  marks: number;
  /** e.g. "GCE 2024 Paper 1 Q3". */
  source: string;
  optionsText: string | null;
  solutionText: string | null;
}

/** The question in focus and its Skyline solution, loaded from the bank by id. */
export async function loadQuestionContext(questionId: string): Promise<QuestionContext | null> {
  const snap = await db.collection('questions').doc(questionId).get();
  if (!snap.exists) return null;
  const q = snap.data() as QuestionDoc;

  const [paperSnap, solSnap] = await Promise.all([
    db.collection('papers').doc(q.paperId).get(),
    db.collection('solutions').where('questionId', '==', questionId).limit(1).get(),
  ]);
  const paper = paperSnap.data() as { year?: number; paperNumber?: number } | undefined;
  const solution = solSnap.docs[0];

  return {
    stem: q.stem,
    marks: q.marks,
    source: paper ? `GCE ${paper.year} Paper ${paper.paperNumber} Q${q.label}` : `Q${q.label}`,
    optionsText: q.options?.length ? q.options.map((o) => `${o.key}. ${o.text}`).join('\n') : null,
    solutionText: solution ? solutionToText(solution.data() as SolutionDoc) : null,
  };
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
