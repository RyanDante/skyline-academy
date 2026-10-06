/**
 * SAMPLE DATA for mock mode (EXPO_PUBLIC_USE_MOCKS=true) and for seeding a fresh Firestore
 * project (firebase/scripts/seed.ts reads this shape). Questions are written for demonstration;
 * Concours weights, requirements and dates are placeholders until Skyline teachers confirm them.
 */
import type {
  ClassGroup,
  Highlight,
  Institution,
  LeaderboardEntry,
  Paper,
  PathwayFamily,
  Question,
  Solution,
  Subject,
  Topic,
} from '@/types/models';

// ─── Subjects ────────────────────────────────────────────────────────────────

export const subjects: Subject[] = [
  { id: 'a-maths', code: '765/770', name: 'Pure Mathematics', level: 'A', paperCount: 1, yearRange: [2024, 2024] },
  { id: 'a-physics', code: '780', name: 'Physics', level: 'A', paperCount: 3, yearRange: [2022, 2024] },
  { id: 'a-chemistry', code: '715', name: 'Chemistry', level: 'A', paperCount: 1, yearRange: [2024, 2024] },
  { id: 'a-biology', code: '710', name: 'Biology', level: 'A', paperCount: 1, yearRange: [2024, 2024] },
  { id: 'o-maths', name: 'Mathematics', level: 'O', paperCount: 0, yearRange: null },
  { id: 'o-physics', name: 'Physics', level: 'O', paperCount: 1, yearRange: [2024, 2024] },
  { id: 'o-chemistry', name: 'Chemistry', level: 'O', paperCount: 0, yearRange: null },
  { id: 'o-biology', name: 'Biology', level: 'O', paperCount: 0, yearRange: null },
];

// ─── Topics ──────────────────────────────────────────────────────────────────

const t = (subjectId: string, id: string, name: string, order: number): Topic => ({
  id,
  subjectId,
  name,
  parentId: null,
  order,
});

export const topics: Topic[] = [
  t('a-physics', 'a-phy-mechanics', 'Mechanics', 1),
  t('a-physics', 'a-phy-electricity', 'Electricity', 2),
  t('a-physics', 'a-phy-waves', 'Waves', 3),
  t('a-physics', 'a-phy-thermal', 'Thermal physics', 4),
  t('a-physics', 'a-phy-atomic', 'Atomic and nuclear physics', 5),
  t('a-maths', 'a-mat-calculus', 'Calculus', 1),
  t('a-maths', 'a-mat-algebra', 'Algebra and functions', 2),
  t('a-maths', 'a-mat-complex', 'Complex numbers', 3),
  t('a-maths', 'a-mat-vectors', 'Vectors', 4),
  t('a-chemistry', 'a-che-physical', 'Physical chemistry', 1),
  t('a-chemistry', 'a-che-organic', 'Organic chemistry', 2),
  t('a-chemistry', 'a-che-kinetics', 'Reaction kinetics', 3),
  t('a-biology', 'a-bio-cells', 'Cell biology', 1),
  t('a-biology', 'a-bio-biomolecules', 'Biomolecules', 2),
  t('a-biology', 'a-bio-genetics', 'Genetics', 3),
  t('o-physics', 'o-phy-forces', 'Forces and motion', 1),
  t('o-physics', 'o-phy-electricity', 'Electricity', 2),
];

// ─── Papers ──────────────────────────────────────────────────────────────────

export const papers: Paper[] = [
  { id: 'a-physics-2024-p1', subjectId: 'a-physics', year: 2024, paperNumber: 1, durationMinutes: 90, totalMarks: 50, questionCount: 7, pdfPath: 'papers/a-physics/2024-p1.pdf' },
  { id: 'a-physics-2023-p2', subjectId: 'a-physics', year: 2023, paperNumber: 2, durationMinutes: 150, totalMarks: 100, questionCount: 1, pdfPath: 'papers/a-physics/2023-p2.pdf' },
  { id: 'a-physics-2022-p1', subjectId: 'a-physics', year: 2022, paperNumber: 1, durationMinutes: 90, totalMarks: 50, questionCount: 0, pdfPath: 'papers/a-physics/2022-p1.pdf' },
  { id: 'a-maths-2024-p1', subjectId: 'a-maths', year: 2024, paperNumber: 1, durationMinutes: 90, totalMarks: 50, questionCount: 4 },
  { id: 'a-chemistry-2024-p1', subjectId: 'a-chemistry', year: 2024, paperNumber: 1, durationMinutes: 90, totalMarks: 50, questionCount: 3 },
  { id: 'a-biology-2024-p1', subjectId: 'a-biology', year: 2024, paperNumber: 1, durationMinutes: 90, totalMarks: 50, questionCount: 3 },
  { id: 'o-physics-2024-p1', subjectId: 'o-physics', year: 2024, paperNumber: 1, durationMinutes: 75, totalMarks: 50, questionCount: 3 },
];

// ─── Questions ───────────────────────────────────────────────────────────────

const mcq = (
  id: string,
  paperId: string,
  subjectId: string,
  order: number,
  stem: string,
  options: [string, string, string, string],
  correctKey: Question['correctKey'],
  topicIds: string[],
  difficulty: Question['difficulty'] = 1,
): Question => ({
  id,
  paperId,
  subjectId,
  label: String(order),
  order,
  type: 'mcq',
  stem,
  marks: 1,
  topicIds,
  difficulty,
  options: [
    { key: 'A', text: options[0] },
    { key: 'B', text: options[1] },
    { key: 'C', text: options[2] },
    { key: 'D', text: options[3] },
  ],
  correctKey,
});

const AP1 = 'a-physics-2024-p1';
const AM1 = 'a-maths-2024-p1';
const AC1 = 'a-chemistry-2024-p1';
const AB1 = 'a-biology-2024-p1';
const OP1 = 'o-physics-2024-p1';

export const questions: Question[] = [
  mcq('ap24-1', AP1, 'a-physics', 1, 'A body of mass 2.0 kg accelerates uniformly at 3.0 m s⁻². What is the resultant force on it?', ['1.5 N', '5.0 N', '6.0 N', '0.67 N'], 'C', ['a-phy-mechanics']),
  mcq('ap24-2', AP1, 'a-physics', 2, 'Which of these quantities is a vector?', ['Speed', 'Energy', 'Momentum', 'Power'], 'C', ['a-phy-mechanics']),
  mcq('ap24-3', AP1, 'a-physics', 3, 'Two 6 Ω resistors are connected in parallel. What is their combined resistance?', ['12 Ω', '6 Ω', '3 Ω', '1.5 Ω'], 'C', ['a-phy-electricity']),
  mcq('ap24-4', AP1, 'a-physics', 4, 'A 12 V battery drives a current of 2.0 A through a resistor for 10 s. How much energy is transferred?', ['24 J', '60 J', '120 J', '240 J'], 'D', ['a-phy-electricity'], 2),
  mcq('ap24-5', AP1, 'a-physics', 5, 'A sound wave travels at 340 m s⁻¹ with frequency 170 Hz. What is its wavelength?', ['0.5 m', '2.0 m', '57 800 m', '510 m'], 'B', ['a-phy-waves']),
  mcq('ap24-6', AP1, 'a-physics', 6, 'Which radiation has the greatest ionising ability?', ['Alpha particles', 'Beta particles', 'Gamma rays', 'X-rays'], 'A', ['a-phy-atomic']),
  mcq('ap24-7', AP1, 'a-physics', 7, 'The specific heat capacity of water is 4200 J kg⁻¹ K⁻¹. How much energy raises 0.50 kg of water by 10 K?', ['2 100 J', '21 000 J', '42 000 J', '84 000 J'], 'B', ['a-phy-thermal'], 2),
  {
    id: 'ap23-4b',
    paperId: 'a-physics-2023-p2',
    subjectId: 'a-physics',
    label: '4(b)',
    order: 1,
    type: 'structured',
    stem: 'A 2.0 kg block slides down a slope inclined at 30° to the horizontal. A constant friction force of 4.0 N acts on the block. Taking g = 9.8 m s⁻², calculate the acceleration of the block.',
    marks: 4,
    topicIds: ['a-phy-mechanics'],
    difficulty: 2,
    numericAnswer: { value: 2.9, unit: 'm s⁻²', tolerance: 0.05 },
  },
  mcq('am24-1', AM1, 'a-maths', 1, 'Given $y = x^3$, find $\\frac{dy}{dx}$ when $x = 2$.', ['6', '8', '12', '24'], 'C', ['a-mat-calculus']),
  mcq('am24-2', AM1, 'a-maths', 2, 'Evaluate $\\int_0^1 2x\\,dx$.', ['0', '1', '2', '1/2'], 'B', ['a-mat-calculus']),
  mcq('am24-3', AM1, 'a-maths', 3, 'What is the modulus of the complex number 3 + 4i?', ['5', '7', '25', '1'], 'A', ['a-mat-complex']),
  mcq('am24-4', AM1, 'a-maths', 4, 'Given a = (1, 2) and b = (3, −1), find the scalar product a · b.', ['1', '5', '−1', '7'], 'A', ['a-mat-vectors']),
  mcq('ac24-1', AC1, 'a-chemistry', 1, 'How many moles are in 4.0 g of sodium hydroxide (Mr = 40)?', ['0.10', '1.0', '10', '160'], 'A', ['a-che-physical']),
  mcq('ac24-2', AC1, 'a-chemistry', 2, 'Which functional group is present in ethanol?', ['Carboxyl', 'Hydroxyl', 'Carbonyl', 'Amino'], 'B', ['a-che-organic']),
  mcq('ac24-3', AC1, 'a-chemistry', 3, 'Raising the temperature increases the rate of a reaction mainly because:', ['more particles have energy at or above the activation energy', 'the activation energy decreases', 'the equilibrium position shifts', 'the particles become larger'], 'A', ['a-che-kinetics'], 2),
  mcq('ab24-1', AB1, 'a-biology', 1, 'Which organelle is the main site of aerobic respiration?', ['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Nucleus'], 'B', ['a-bio-cells']),
  mcq('ab24-2', AB1, 'a-biology', 2, 'Which bond joins two amino acids?', ['Glycosidic bond', 'Ester bond', 'Peptide bond', 'Hydrogen bond'], 'C', ['a-bio-biomolecules']),
  mcq('ab24-3', AB1, 'a-biology', 3, 'Two heterozygous parents (Aa × Aa) are crossed. What proportion of offspring is expected to be aa?', ['0', '1/4', '1/2', '3/4'], 'B', ['a-bio-genetics'], 2),
  mcq('op24-1', OP1, 'o-physics', 1, 'What is the SI unit of force?', ['Joule', 'Watt', 'Newton', 'Pascal'], 'C', ['o-phy-forces']),
  mcq('op24-2', OP1, 'o-physics', 2, 'A runner covers 100 m in 20 s. What is the average speed?', ['2000 m/s', '0.2 m/s', '5 m/s', '120 m/s'], 'C', ['o-phy-forces']),
  mcq('op24-3', OP1, 'o-physics', 3, 'Which material is a good electrical conductor?', ['Copper', 'Rubber', 'Glass', 'Dry wood'], 'A', ['o-phy-electricity']),
];

// ─── Solutions ───────────────────────────────────────────────────────────────

const MBAH = { name: 'Mr E. Mbah', initials: 'EM', subject: 'Skyline Physics' };
const NJI = { name: 'Mrs F. Nji', initials: 'FN', subject: 'Skyline Mathematics' };
const TABI = { name: 'Dr P. Tabi', initials: 'PT', subject: 'Skyline Chemistry' };
const ASHU = { name: 'Ms R. Ashu', initials: 'RA', subject: 'Skyline Biology' };

const quick = (
  questionId: string,
  author: Solution['author'],
  body: string,
  working: string,
  finalAnswer: string,
  commonSlip?: string,
): Solution => ({
  id: `sol-${questionId}`,
  questionId,
  author,
  tier: 'free',
  finalAnswer,
  commonSlip,
  steps: [{ body, working, markPoints: [{ code: 'B1', text: 'correct option' }] }],
});

export const solutions: Solution[] = [
  quick('ap24-1', MBAH, 'Use Newton’s second law.', 'F = ma = 2.0 × 3.0 = 6.0 N', 'C — 6.0 N', 'Dividing instead of multiplying gives 0.67 N (option D).'),
  quick('ap24-2', MBAH, 'A vector has both magnitude and direction. Momentum p = mv takes the direction of the velocity.', 'p = mv', 'C — Momentum'),
  quick('ap24-3', MBAH, 'For resistors in parallel, add the reciprocals.', '1/R = 1/6 + 1/6 = 1/3, so R = 3 Ω', 'C — 3 Ω', 'Adding them as if in series gives 12 Ω.'),
  quick('ap24-4', MBAH, 'Electrical energy transferred is voltage × current × time.', 'W = VIt = 12 × 2.0 × 10 = 240 J', 'D — 240 J'),
  quick('ap24-5', MBAH, 'Rearrange the wave equation v = fλ.', 'λ = v / f = 340 / 170 = 2.0 m', 'B — 2.0 m'),
  quick('ap24-6', MBAH, 'Alpha particles are heavy and doubly charged, so they ionise strongly and have the shortest range.', '', 'A — Alpha particles'),
  quick('ap24-7', MBAH, 'Use Q = mcΔθ.', 'Q = 0.50 × 4200 × 10 = 21 000 J', 'B — 21 000 J'),
  {
    id: 'sol-ap23-4b',
    questionId: 'ap23-4b',
    author: MBAH,
    tier: 'pass',
    finalAnswer: 'a = 2.9 m s⁻² down the slope',
    commonSlip: 'Forgetting that friction acts up the slope, against the motion. Costs 2 marks.',
    steps: [
      {
        body: 'Resolve forces along the slope. The weight component pulls the block down; friction acts up the slope.',
        working: 'mg sin 30° − F = ma',
        markPoints: [{ code: 'M1', text: 'correct resolution along the slope' }],
      },
      {
        body: 'Substitute the values.',
        working: '2.0 × 9.8 × 0.5 − 4.0 = 2.0a  →  9.8 − 4.0 = 2.0a',
        markPoints: [{ code: 'A1', text: 'correct substitution' }],
      },
      {
        body: 'Solve for a and state the unit.',
        working: 'a = 5.8 / 2.0 = 2.9 m s⁻²',
        markPoints: [
          { code: 'A1', text: 'correct value' },
          { code: 'B1', text: 'correct unit' },
        ],
      },
    ],
  },
  quick('am24-1', NJI, 'Differentiate using the power rule, then substitute x = 2.', 'dy/dx = 3x² = 3 × 4 = 12', 'C — 12'),
  quick('am24-2', NJI, 'Integrate 2x to get x², then evaluate between the limits.', '[x²] from 0 to 1 = 1 − 0 = 1', 'B — 1'),
  quick('am24-3', NJI, 'The modulus of a + bi is √(a² + b²).', '|3 + 4i| = √(9 + 16) = √25 = 5', 'A — 5'),
  quick('am24-4', NJI, 'Multiply matching components and add.', 'a · b = 1×3 + 2×(−1) = 3 − 2 = 1', 'A — 1'),
  quick('ac24-1', TABI, 'Moles = mass ÷ molar mass.', 'n = 4.0 / 40 = 0.10 mol', 'A — 0.10'),
  quick('ac24-2', TABI, 'Alcohols contain the –OH (hydroxyl) group.', 'CH₃CH₂OH', 'B — Hydroxyl'),
  quick('ac24-3', TABI, 'At higher temperature the energy distribution shifts, so a larger fraction of collisions exceed the activation energy.', '', 'A'),
  quick('ab24-1', ASHU, 'The Krebs cycle and oxidative phosphorylation happen in the mitochondrion.', '', 'B — Mitochondrion'),
  quick('ab24-2', ASHU, 'A condensation reaction between the amine and carboxyl groups forms a peptide bond.', '', 'C — Peptide bond'),
  quick('ab24-3', ASHU, 'A Punnett square of Aa × Aa gives AA, Aa, Aa, aa.', '1 of 4 offspring is aa', 'B — 1/4'),
  quick('op24-1', MBAH, 'Force is measured in newtons (N).', '', 'C — Newton'),
  quick('op24-2', MBAH, 'Average speed = distance ÷ time.', '100 ÷ 20 = 5 m/s', 'C — 5 m/s'),
  quick('op24-3', MBAH, 'Metals such as copper have free electrons that carry current.', '', 'A — Copper'),
];

// ─── Concours ────────────────────────────────────────────────────────────────

export const families: PathwayFamily[] = [
  {
    id: 'health',
    name: 'Health',
    tagline: 'Medicine and health sciences',
    coreSubjects: ['Biology', 'Chemistry', 'Physics or Mathematics'],
    expectedALevels: ['Biology', 'Chemistry'],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    tagline: 'Engineering, technology and technical teaching',
    coreSubjects: ['Mathematics', 'Physics', 'Chemistry'],
    expectedALevels: ['Pure Mathematics', 'Physics'],
  },
  {
    id: 'agri-vet',
    name: 'Agriculture and Vet',
    tagline: 'Agriculture and veterinary medicine',
    coreSubjects: ['Biology', 'Chemistry'],
    expectedALevels: ['Biology', 'Chemistry'],
  },
];

const engineeringSections: Institution['sections'] = [
  {
    id: 'maths',
    name: 'Mathematics',
    kind: 'academic',
    subjectId: 'a-maths',
    topics: [
      { topicId: 'a-mat-calculus', name: 'Calculus', weight: 0.35, coverage: 'full' },
      { topicId: 'a-mat-algebra', name: 'Algebra and functions', weight: 0.2, coverage: 'full' },
      { topicId: 'a-mat-complex', name: 'Complex numbers', weight: 0.15, coverage: 'full' },
      { topicId: 'a-mat-vectors', name: 'Vectors', weight: 0.15, coverage: 'partial' },
      { topicId: 'gap-matrices', name: 'Matrices and linear systems', weight: 0.15, coverage: 'none' },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    kind: 'academic',
    subjectId: 'a-physics',
    topics: [
      { topicId: 'a-phy-mechanics', name: 'Mechanics', weight: 0.35, coverage: 'full' },
      { topicId: 'a-phy-electricity', name: 'Electricity', weight: 0.3, coverage: 'full' },
      { topicId: 'a-phy-waves', name: 'Waves', weight: 0.15, coverage: 'full' },
      { topicId: 'a-phy-atomic', name: 'Atomic and nuclear physics', weight: 0.1, coverage: 'full' },
      { topicId: 'gap-electronics', name: 'Basic electronics', weight: 0.1, coverage: 'none' },
    ],
  },
  { id: 'gk', name: 'General knowledge', kind: 'non-academic', topics: [] },
];

const healthSections: Institution['sections'] = [
  {
    id: 'biology',
    name: 'Biology',
    kind: 'academic',
    subjectId: 'a-biology',
    topics: [
      { topicId: 'a-bio-cells', name: 'Cell biology', weight: 0.35, coverage: 'full' },
      { topicId: 'a-bio-biomolecules', name: 'Biomolecules', weight: 0.25, coverage: 'full' },
      { topicId: 'a-bio-genetics', name: 'Genetics', weight: 0.3, coverage: 'full' },
      { topicId: 'gap-human-anatomy', name: 'Human anatomy basics', weight: 0.1, coverage: 'none' },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    kind: 'academic',
    subjectId: 'a-chemistry',
    topics: [
      { topicId: 'a-che-physical', name: 'Physical chemistry', weight: 0.4, coverage: 'full' },
      { topicId: 'a-che-organic', name: 'Organic chemistry', weight: 0.4, coverage: 'full' },
      { topicId: 'a-che-kinetics', name: 'Reaction kinetics', weight: 0.2, coverage: 'partial' },
    ],
  },
  { id: 'english', name: 'English language', kind: 'non-academic', topics: [] },
  { id: 'interview', name: 'Interview', kind: 'non-academic', topics: [] },
];

const agriSections: Institution['sections'] = [
  healthSections[0]!,
  healthSections[1]!,
  { id: 'gk', name: 'General knowledge', kind: 'non-academic', topics: [] },
];

const GENERIC_CHECKLIST = [
  'Birth certificate (certified copy)',
  'GCE O and A Level result slips or certificates',
  'Passport photographs',
  'Application fee receipt',
  'Completed application form',
];

const inst = (
  partial: Omit<Institution, 'checklist' | 'papersAnalysed' | 'lastVerified'> &
    Partial<Pick<Institution, 'checklist' | 'papersAnalysed' | 'lastVerified'>>,
): Institution => ({
  checklist: GENERIC_CHECKLIST,
  papersAnalysed: 5,
  lastVerified: null,
  ...partial,
});

export const institutions: Institution[] = [
  inst({
    id: 'fet-buea',
    familyId: 'engineering',
    name: 'Faculty of Engineering and Technology, University of Buea',
    shortName: 'FET Buea',
    city: 'Buea',
    programmes: ['Civil engineering', 'Electrical engineering', 'Computer engineering'],
    requirements: ['A Level passes including Pure Mathematics and Physics (to confirm)'],
    sections: engineeringSections,
    examDate: '2027-08-21',
    applicationDeadline: '2027-08-06',
  }),
  inst({
    id: 'cot-buea',
    familyId: 'engineering',
    name: 'College of Technology, University of Buea',
    shortName: 'COT Buea',
    city: 'Buea',
    programmes: ['Computer engineering', 'Electrical and electronic engineering'],
    requirements: ['A Level passes including Pure Mathematics and Physics (to confirm)'],
    sections: engineeringSections,
    examDate: '2027-08-21',
    applicationDeadline: '2027-08-10',
  }),
  inst({
    id: 'nahpi-bamenda',
    familyId: 'engineering',
    name: 'National Higher Polytechnic Institute, University of Bamenda',
    shortName: 'NAHPI',
    city: 'Bamenda',
    programmes: ['Civil engineering', 'Mechanical engineering', 'Computer engineering'],
    requirements: ['A Level passes including Pure Mathematics and Physics (to confirm)'],
    sections: engineeringSections,
    examDate: '2027-08-28',
    applicationDeadline: '2027-08-13',
  }),
  inst({
    id: 'enset-douala',
    familyId: 'engineering',
    name: 'ENSET Douala',
    shortName: 'ENSET',
    city: 'Douala',
    programmes: ['Technical teacher training'],
    requirements: ['A Level or Baccalauréat in a technical or science series (to confirm)'],
    sections: [...engineeringSections, { id: 'french', name: 'French language', kind: 'non-academic', topics: [] }],
    examDate: '2027-09-04',
    applicationDeadline: '2027-08-20',
  }),
  inst({
    id: 'fhs-buea',
    familyId: 'health',
    name: 'Faculty of Health Sciences, University of Buea',
    shortName: 'FHS Buea',
    city: 'Buea',
    programmes: ['Medicine', 'Medical laboratory science', 'Nursing'],
    requirements: ['A Level passes including Biology and Chemistry (to confirm)'],
    sections: healthSections,
    examDate: '2027-08-28',
    applicationDeadline: '2027-08-06',
  }),
  inst({
    id: 'fhs-bamenda',
    familyId: 'health',
    name: 'Faculty of Health Sciences, University of Bamenda',
    shortName: 'FHS Bamenda',
    city: 'Bamenda',
    programmes: ['Medicine', 'Nursing'],
    requirements: ['A Level passes including Biology and Chemistry (to confirm)'],
    sections: healthSections,
    examDate: '2027-09-04',
    applicationDeadline: '2027-08-13',
  }),
  inst({
    id: 'favm-buea',
    familyId: 'agri-vet',
    name: 'Faculty of Agriculture and Veterinary Medicine, University of Buea',
    shortName: 'FAVM',
    city: 'Buea',
    programmes: ['Agronomy', 'Veterinary medicine'],
    requirements: ['A Level passes including Biology and Chemistry (to confirm)'],
    sections: agriSections,
    examDate: '2027-08-21',
    applicationDeadline: '2027-08-06',
  }),
];

// ─── Home and groups ─────────────────────────────────────────────────────────

export const highlights: Highlight[] = [
  {
    id: 'mock-march',
    title: 'Skyline National Mock Concours',
    body: 'One timed mock, the same day across Cameroon. See your national percentile.',
    ctaLabel: 'See details',
    ctaRoute: '/(tabs)/concours',
    publishedAt: '2026-10-01',
  },
  {
    id: 'solutions-physics',
    title: 'New: Physics Paper 2 solutions',
    body: 'Worked answers with mark points, written by Skyline Physics teachers.',
    ctaLabel: 'Open Physics',
    ctaRoute: '/gce/a-physics',
    publishedAt: '2026-09-28',
  },
];

export const groups: ClassGroup[] = [
  {
    id: 'grp-u6-sci',
    name: 'Upper Sixth Science, Skyline Buea',
    joinCode: 'SKY-4821',
    memberCount: 34,
    weeklyChallenge: '20 Electricity questions by Sunday',
  },
];

export const leaderboard: LeaderboardEntry[] = [
  { uid: 'u1', displayName: 'Brenda N.', schoolName: 'GBHS Buea', correctThisWeek: 86 },
  { uid: 'u2', displayName: 'Che A.', schoolName: 'Sasse College', correctThisWeek: 74 },
  { uid: 'u3', displayName: 'Ndifor T.', schoolName: 'BGS Molyko', correctThisWeek: 69 },
  { uid: 'u4', displayName: 'Ebai M.', schoolName: 'GBHS Buea', correctThisWeek: 51 },
];
