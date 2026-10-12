/**
 * Skyler's 10 questions, word for word from the design brief (section 7.4). Each answer gives
 * +2 to its primary sector and sometimes +1 to a secondary sector. Every sector is the primary
 * option in exactly 8 of the 10 questions. Students never see the points.
 *
 * `reason` is a short phrase Skyler uses to explain a result ("You … and …"). It is ours,
 * not from the brief; edit freely.
 */
import type { OptionKey, SectorId } from '@/types/models';

export interface SkylerOption {
  key: OptionKey;
  text: string;
  primary: SectorId;
  secondary?: SectorId;
  reason: string;
}

export interface SkylerQuestion {
  id: string;
  text: string;
  options: SkylerOption[];
}

export const skylerQuestions: SkylerQuestion[] = [
  {
    id: 'q1',
    text: 'Imagine a free Saturday with nothing planned. What would you enjoy most?',
    options: [
      { key: 'A', text: 'Visiting or looking after someone who is not feeling well', primary: 'health', secondary: 'teaching', reason: 'enjoy looking after people' },
      { key: 'B', text: 'Taking apart a radio or phone to see how it works', primary: 'engineering', reason: 'love finding out how things work' },
      { key: 'C', text: 'Spending time on a farm, in a garden, or with animals', primary: 'agriculture', reason: 'enjoy time with plants and animals' },
      { key: 'D', text: 'Organising a community event or following the news', primary: 'administration', secondary: 'teaching', reason: 'like organising people and following public life' },
    ],
  },
  {
    id: 'q2',
    text: 'In group work at school, which role do you naturally take?',
    options: [
      { key: 'A', text: 'I check that everyone is okay and keep the group calm', primary: 'health', secondary: 'teaching', reason: 'keep people calm and cared for' },
      { key: 'B', text: 'I work out how to build it or make it work', primary: 'engineering', secondary: 'agriculture', reason: 'work out how to make things work' },
      { key: 'C', text: 'I explain things until everyone understands', primary: 'teaching', secondary: 'administration', reason: 'explain things until everyone understands' },
      { key: 'D', text: 'I take the hands-on, practical jobs', primary: 'agriculture', secondary: 'engineering', reason: 'like hands-on, practical work' },
    ],
  },
  {
    id: 'q3',
    text: 'Which problem would you most like to solve?',
    options: [
      { key: 'A', text: 'A hospital with too few nurses and very long waiting lines', primary: 'health', secondary: 'administration', reason: 'want to fix how patients are cared for' },
      { key: 'B', text: 'A road or bridge that breaks down every rainy season', primary: 'engineering', secondary: 'administration', reason: 'want to build things that last' },
      { key: 'C', text: 'Pupils in a village school who cannot follow their lessons', primary: 'teaching', reason: 'want every pupil to keep up' },
      { key: 'D', text: 'A public office where files get lost and people wait for months', primary: 'administration', reason: 'want public services to run properly' },
    ],
  },
  {
    id: 'q4',
    text: 'Which of these sounds like a good working day?',
    options: [
      { key: 'A', text: 'Examining patients, reading test results, helping people recover', primary: 'health', reason: 'picture yourself helping patients recover' },
      { key: 'B', text: 'Walking through fields, checking crops or animals, advising farmers', primary: 'agriculture', secondary: 'engineering', reason: 'picture yourself working in the fields' },
      { key: 'C', text: 'Standing in front of a class and seeing students finally understand', primary: 'teaching', reason: 'love the moment a student finally understands' },
      { key: 'D', text: 'Writing reports, preparing decisions, or representing people in law or diplomacy', primary: 'administration', reason: 'picture yourself preparing decisions and representing people' },
    ],
  },
  {
    id: 'q5',
    text: 'Which kind of school subject do you enjoy even when it is hard?',
    options: [
      { key: 'A', text: 'Maths and Physics problems that take a long time to crack', primary: 'engineering', reason: 'enjoy hard Maths and Physics problems' },
      { key: 'B', text: 'Biology and Geography: living things, soil, climate', primary: 'agriculture', secondary: 'health', reason: 'enjoy Biology, soil and climate' },
      { key: 'C', text: 'History, Literature, Government or Citizenship', primary: 'administration', secondary: 'teaching', reason: 'enjoy History, Government and Citizenship' },
      { key: 'D', text: 'Any subject, as long as I can explain it to a classmate afterwards', primary: 'teaching', reason: 'love explaining what you learn to others' },
    ],
  },
  {
    id: 'q6',
    text: 'How do you handle pressure and long hours of work?',
    options: [
      { key: 'A', text: 'I stay calm and focused, even when something is urgent or stressful', primary: 'health', reason: 'stay calm under pressure' },
      { key: 'B', text: 'I can spend hours on one difficult problem until it is solved', primary: 'engineering', reason: 'stick with a hard problem until it is solved' },
      { key: 'C', text: 'I prefer a steady pace and work where I see results grow over time', primary: 'agriculture', reason: 'like seeing results grow over time' },
      { key: 'D', text: 'I work best with clear rules, deadlines and structure', primary: 'administration', reason: 'work best with clear rules and structure' },
    ],
  },
  {
    id: 'q7',
    text: 'What would make you proudest in ten years?',
    options: [
      { key: 'A', text: 'Having saved or improved the lives of many people', primary: 'health', reason: 'want to improve many lives' },
      { key: 'B', text: 'Something I designed that is standing and working: a building, machine, system or app', primary: 'engineering', secondary: 'agriculture', reason: 'want to design something that stands and works' },
      { key: 'C', text: 'A farm or business I started that feeds people and gives them jobs', primary: 'agriculture', secondary: 'administration', reason: 'dream of a farm or business that feeds people' },
      { key: 'D', text: 'A former student of mine who became a doctor, engineer or minister', primary: 'teaching', reason: 'want to shape the people who lead tomorrow' },
    ],
  },
  {
    id: 'q8',
    text: 'When you see a problem in your neighbourhood, what do you usually do first?',
    options: [
      { key: 'A', text: 'Ask who is hurt or sick and how to help them right now', primary: 'health', reason: 'think first of who needs help' },
      { key: 'B', text: 'Work out what is technically broken and how to fix it', primary: 'engineering', secondary: 'agriculture', reason: 'look for what is broken and how to fix it' },
      { key: 'C', text: 'Explain to people what to do and why', primary: 'teaching', reason: 'explain to people what to do and why' },
      { key: 'D', text: 'Think about which authority or rule should deal with it, and push for action', primary: 'administration', reason: 'push the right authority to act' },
    ],
  },
  {
    id: 'q9',
    text: 'Where could you picture yourself working every day?',
    options: [
      { key: 'A', text: 'A hospital or clinic', primary: 'health', reason: 'can picture yourself in a hospital' },
      { key: 'B', text: 'A farm, a lab or out in the field', primary: 'agriculture', secondary: 'engineering', reason: 'can picture yourself on a farm or in the field' },
      { key: 'C', text: 'A school or university', primary: 'teaching', reason: 'can picture yourself in a school' },
      { key: 'D', text: 'An office, court, ministry or embassy', primary: 'administration', reason: 'can picture yourself in a ministry or embassy' },
    ],
  },
  {
    id: 'q10',
    text: 'Be honest: which sentence sounds most like you?',
    options: [
      { key: 'A', text: 'I like to measure, calculate and build. I trust numbers and logic.', primary: 'engineering', reason: 'trust numbers and logic' },
      { key: 'B', text: 'I am happiest outdoors, and I care about food, land and the environment.', primary: 'agriculture', reason: 'care about food, land and the environment' },
      { key: 'C', text: 'I am good with words and ideas, and I like guiding people.', primary: 'teaching', secondary: 'administration', reason: 'are good with words and like guiding people' },
      { key: 'D', text: 'I want to serve my country and have a say in how things are run.', primary: 'administration', reason: 'want to serve your country' },
    ],
  },
];

/** What each sector needs, in one line, for Skyler's "why" text. */
export const SECTOR_NEEDS: Record<SectorId, string> = {
  health: 'Health careers need people who care and stay calm.',
  engineering: 'Engineering needs people who love solving hard problems.',
  agriculture: 'Agriculture needs people who care about food, land and steady work.',
  administration: 'Administration needs people who want public services to work.',
  teaching: 'Teaching needs people who love helping others understand.',
};

/** Skyler's quick-profile stages (brief 7.2). */
export const SKYLER_STAGES = [
  { id: 'form5', label: 'Form 5 / O Level done' },
  { id: 'lower6', label: 'Lower Sixth' },
  { id: 'upper6', label: 'Upper Sixth' },
  { id: 'a-done', label: 'A Level done' },
] as const;

export type SkylerStage = (typeof SKYLER_STAGES)[number]['id'];

/** Subjects offered in the quick profile (multi-select). */
export const SKYLER_SUBJECTS = [
  'Biology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Further Mathematics',
  'Computer Science',
  'Geography',
  'Economics',
  'History',
  'Literature in English',
  'French',
  'Religious Studies',
];
