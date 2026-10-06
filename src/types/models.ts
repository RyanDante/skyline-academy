/**
 * Domain model shared by the app, the SQLite cache and Firestore documents.
 * Firestore collection names live in src/lib/firebase.ts (`COLLECTIONS`).
 */

export type Level = 'O' | 'A';
export type Stream = 'science' | 'arts' | 'commercial' | 'technical';
export type PathwayFamilyId = 'health' | 'engineering' | 'agri-vet';
export type PathwayChoice = PathwayFamilyId | 'undecided';
export type Plan = 'free' | 'pass';

// ─── Syllabus ────────────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  /** Official GCE subject code, when confirmed (e.g. "780" for A Level Physics). */
  code?: string;
  name: string;
  level: Level;
  paperCount: number;
  yearRange: [number, number] | null;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  parentId: string | null;
  order: number;
}

// ─── Papers and questions ────────────────────────────────────────────────────

export interface Paper {
  id: string;
  subjectId: string;
  year: number;
  paperNumber: 1 | 2 | 3;
  durationMinutes: number;
  totalMarks: number;
  questionCount: number;
  /** Cloud Storage path of the original scan, e.g. "papers/a-physics/2024-p1.pdf". */
  pdfPath?: string;
}

export type QuestionType = 'mcq' | 'structured' | 'essay' | 'practical';
export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type Difficulty = 1 | 2 | 3;

export interface QuestionOption {
  key: OptionKey;
  text: string;
}

export interface NumericAnswer {
  value: number;
  unit: string;
  /** Accepted absolute margin either side of `value`. */
  tolerance: number;
}

export interface Question {
  id: string;
  paperId: string;
  subjectId: string;
  /** Display label within the paper, e.g. "23" or "4(b)". */
  label: string;
  order: number;
  type: QuestionType;
  /** Plain text; inline LaTeX is written between `$...$`. */
  stem: string;
  marks: number;
  topicIds: string[];
  difficulty: Difficulty;
  options?: QuestionOption[];
  correctKey?: OptionKey;
  numericAnswer?: NumericAnswer;
  imageUrl?: string;
}

export interface MarkPoint {
  /** Examiner code such as "M1", "A1", "B1". */
  code: string;
  text: string;
}

export interface SolutionStep {
  body: string;
  /** Optional working line, rendered in the "script" style. LaTeX allowed between `$...$`. */
  working?: string;
  markPoints: MarkPoint[];
}

export interface TeacherCredit {
  name: string;
  initials: string;
  subject: string;
}

export interface Solution {
  id: string;
  questionId: string;
  steps: SolutionStep[];
  finalAnswer: string;
  commonSlip?: string;
  author: TeacherCredit;
  /** `free`: everyone sees every step. `pass`: free users see the first step only. */
  tier: Plan;
}

// ─── Attempts and progress ───────────────────────────────────────────────────

export type AttemptSource = 'quiz' | 'mock' | 'paper';

export interface Attempt {
  id: string;
  questionId: string;
  subjectId: string;
  topicIds: string[];
  selectedKey: OptionKey | null;
  correct: boolean;
  timeMs: number;
  source: AttemptSource;
  createdAt: number;
}

export interface TopicMastery {
  topicId: string;
  attempts: number;
  /** Recency-weighted accuracy 0..1, or null when there is too little data. */
  mastery: number | null;
}

// ─── Concours ────────────────────────────────────────────────────────────────

export type GceCoverage = 'full' | 'partial' | 'none';

export interface ConcoursTopicWeight {
  /** GCE topic id when the topic maps onto the GCE syllabus; a free id for gap topics. */
  topicId: string;
  name: string;
  /** Share of the section's marks across the analysed papers, 0..1. */
  weight: number;
  coverage: GceCoverage;
}

export interface ConcoursSection {
  id: string;
  name: string;
  kind: 'academic' | 'non-academic';
  /** GCE subject practised for this section (academic sections only). */
  subjectId?: string;
  topics: ConcoursTopicWeight[];
}

export interface PathwayFamily {
  id: PathwayFamilyId;
  name: string;
  tagline: string;
  coreSubjects: string[];
  /** A-Level subject names a student needs for most programmes in this family. */
  expectedALevels: string[];
}

export interface Institution {
  id: string;
  familyId: PathwayFamilyId;
  name: string;
  shortName: string;
  city: string;
  programmes: string[];
  requirements: string[];
  sections: ConcoursSection[];
  checklist: string[];
  papersAnalysed: number;
  /** ISO dates. Null until Skyline confirms them for the current season. */
  examDate: string | null;
  applicationDeadline: string | null;
  sourceUrl?: string;
  /** ISO date Skyline last checked the official source, or null if never verified. */
  lastVerified: string | null;
}

export type TopicStatus = 'strong' | 'developing' | 'weak' | 'untested' | 'gap';

export interface TopicReadiness {
  topicId: string;
  name: string;
  weight: number;
  attempts: number;
  mastery: number | null;
  status: TopicStatus;
}

export interface Readiness {
  institutionId: string;
  /** Weighted academic readiness 0..1. */
  score: number;
  questionsAnswered: number;
  topics: TopicReadiness[];
  nonAcademicSections: string[];
}

// ─── Home, groups, profile ───────────────────────────────────────────────────

export interface Highlight {
  id: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaRoute?: string;
  publishedAt: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  joinCode: string;
  memberCount: number;
  weeklyChallenge: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  schoolName?: string;
  correctThisWeek: number;
}

export interface UserProfile {
  uid: string | null;
  firstName: string;
  level: Level;
  form: string;
  stream: Stream;
  subjectIds: string[];
  examYear: number;
  pathway: PathwayChoice;
  schoolName?: string;
}

export interface Entitlement {
  plan: Plan;
  /** ISO date the paid plan ends. */
  expiresAt: string | null;
  /** Subject ids unlocked by per-subject passes. */
  subjectPasses: string[];
}
