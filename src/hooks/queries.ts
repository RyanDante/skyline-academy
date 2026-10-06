import { useQuery } from '@tanstack/react-query';

import { concoursService } from '@/services/concours';
import { contentService } from '@/services/content';
import { downloadsService } from '@/services/downloads';
import { groupsService } from '@/services/groups';
import { attemptsService } from '@/services/attempts';
import type { Level, PathwayFamilyId } from '@/types/models';

/** Content changes rarely; keep it fresh for an hour and cached for a day. */
const CONTENT = { staleTime: 60 * 60 * 1000, gcTime: 24 * 60 * 60 * 1000 };

export const queryKeys = {
  attempts: ['attempts'] as const,
  downloads: ['downloads'] as const,
};

export const useSubjects = (level: Level) =>
  useQuery({ queryKey: ['subjects', level], queryFn: () => contentService.subjects(level), ...CONTENT });

export const useSubject = (id: string | undefined) =>
  useQuery({
    queryKey: ['subject', id],
    queryFn: () => contentService.subject(id!),
    enabled: !!id,
    ...CONTENT,
  });

export const useTopics = (subjectId: string | undefined) =>
  useQuery({
    queryKey: ['topics', subjectId],
    queryFn: () => contentService.topics(subjectId!),
    enabled: !!subjectId,
    ...CONTENT,
  });

export const usePapers = (subjectId: string | undefined) =>
  useQuery({
    queryKey: ['papers', subjectId],
    queryFn: () => contentService.papers(subjectId!),
    enabled: !!subjectId,
    ...CONTENT,
  });

export const usePaper = (id: string) =>
  useQuery({ queryKey: ['paper', id], queryFn: () => contentService.paper(id), ...CONTENT });

export const usePaperQuestions = (paperId: string) =>
  useQuery({
    queryKey: ['questions', 'paper', paperId],
    queryFn: () => contentService.questionsForPaper(paperId),
    ...CONTENT,
  });

export const useSubjectQuestions = (subjectId: string | undefined) =>
  useQuery({
    queryKey: ['questions', 'subject', subjectId],
    queryFn: () => contentService.questionsForSubject(subjectId!),
    enabled: !!subjectId,
    ...CONTENT,
  });

export const useQuestion = (id: string | undefined) =>
  useQuery({
    queryKey: ['question', id],
    queryFn: () => contentService.question(id!),
    enabled: !!id,
    ...CONTENT,
  });

export const useSolution = (questionId: string) =>
  useQuery({
    queryKey: ['solution', questionId],
    queryFn: () => contentService.solutionForQuestion(questionId),
    ...CONTENT,
  });

export const useHighlights = () =>
  useQuery({ queryKey: ['highlights'], queryFn: contentService.highlights, staleTime: 10 * 60 * 1000 });

export const useFamilies = () =>
  useQuery({ queryKey: ['families'], queryFn: concoursService.families, ...CONTENT });

export const useInstitutions = (familyId?: PathwayFamilyId) =>
  useQuery({
    queryKey: ['institutions', familyId ?? 'all'],
    queryFn: () => concoursService.institutions(familyId),
    ...CONTENT,
  });

export const useInstitution = (id: string) =>
  useQuery({ queryKey: ['institution', id], queryFn: () => concoursService.institution(id), ...CONTENT });

export const useAttempts = () =>
  useQuery({ queryKey: queryKeys.attempts, queryFn: attemptsService.all, staleTime: 0 });

export const useDownload = (paperId: string) =>
  useQuery({ queryKey: [...queryKeys.downloads, paperId], queryFn: () => downloadsService.get(paperId) });

export const useDownloads = () =>
  useQuery({ queryKey: queryKeys.downloads, queryFn: downloadsService.all });

export const useGroups = (ids: string[]) =>
  useQuery({ queryKey: ['groups', ...ids], queryFn: () => groupsService.byIds(ids), enabled: ids.length > 0 });

export const useLeaderboard = (groupId: string) =>
  useQuery({ queryKey: ['leaderboard', groupId], queryFn: () => groupsService.leaderboard(groupId) });
