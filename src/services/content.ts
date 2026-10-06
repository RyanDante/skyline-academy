import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from '@react-native-firebase/firestore';

import * as seed from '@/data/seed';
import { COLLECTIONS, db } from '@/lib/firebase';
import type { Highlight, Level, Paper, Question, Solution, Subject, Topic } from '@/types/models';

import { cachedFetch } from './cachedFetch';

type WithId<T> = T & { id: string };

async function listWhere<T>(
  name: string,
  field: string,
  value: string | number,
  order?: string,
): Promise<WithId<T>[]> {
  const base = collection(db(), name);
  const q = order
    ? query(base, where(field, '==', value), orderBy(order))
    : query(base, where(field, '==', value));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
}

async function getById<T>(name: string, id: string): Promise<WithId<T> | null> {
  const snap = await getDoc(doc(db(), name, id));
  const data = snap.data();
  return data ? { ...(data as T), id: snap.id } : null;
}

export const contentService = {
  subjects: (level: Level) =>
    cachedFetch(
      `subjects:${level}`,
      () => listWhere<Subject>(COLLECTIONS.subjects, 'level', level),
      () => seed.subjects.filter((s) => s.level === level),
    ),

  subject: (id: string) =>
    cachedFetch(
      `subject:${id}`,
      () => getById<Subject>(COLLECTIONS.subjects, id),
      () => seed.subjects.find((s) => s.id === id) ?? null,
    ),

  topics: (subjectId: string) =>
    cachedFetch(
      `topics:${subjectId}`,
      () => listWhere<Topic>(COLLECTIONS.topics, 'subjectId', subjectId, 'order'),
      () => seed.topics.filter((t) => t.subjectId === subjectId),
    ),

  papers: (subjectId: string) =>
    cachedFetch(
      `papers:${subjectId}`,
      async () => {
        const list = await listWhere<Paper>(COLLECTIONS.papers, 'subjectId', subjectId);
        return list.sort((a, b) => b.year - a.year || a.paperNumber - b.paperNumber);
      },
      () =>
        seed.papers
          .filter((p) => p.subjectId === subjectId)
          .sort((a, b) => b.year - a.year || a.paperNumber - b.paperNumber),
    ),

  paper: (id: string) =>
    cachedFetch(
      `paper:${id}`,
      () => getById<Paper>(COLLECTIONS.papers, id),
      () => seed.papers.find((p) => p.id === id) ?? null,
    ),

  questionsForPaper: (paperId: string) =>
    cachedFetch(
      `questions:paper:${paperId}`,
      () => listWhere<Question>(COLLECTIONS.questions, 'paperId', paperId, 'order'),
      () => seed.questions.filter((q) => q.paperId === paperId).sort((a, b) => a.order - b.order),
    ),

  questionsForSubject: (subjectId: string) =>
    cachedFetch(
      `questions:subject:${subjectId}`,
      () => listWhere<Question>(COLLECTIONS.questions, 'subjectId', subjectId),
      () => seed.questions.filter((q) => q.subjectId === subjectId),
    ),

  question: (id: string) =>
    cachedFetch(
      `question:${id}`,
      () => getById<Question>(COLLECTIONS.questions, id),
      () => seed.questions.find((q) => q.id === id) ?? null,
    ),

  solutionForQuestion: (questionId: string) =>
    cachedFetch(
      `solution:${questionId}`,
      async () => {
        const list = await listWhere<Solution>(COLLECTIONS.solutions, 'questionId', questionId);
        return list[0] ?? null;
      },
      () => seed.solutions.find((s) => s.questionId === questionId) ?? null,
    ),

  highlights: () =>
    cachedFetch(
      'highlights',
      async () => {
        const snap = await getDocs(
          query(collection(db(), COLLECTIONS.highlights), orderBy('publishedAt', 'desc')),
        );
        return snap.docs.map((d) => ({ ...(d.data() as Highlight), id: d.id }));
      },
      () => seed.highlights,
    ),
};
