import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/appStore';
import { questions, solutions, subjects } from '@/data/seed';
import type { Attempt, Question, Solution } from '@/types/models';
import { MathRenderer } from '@/components/MathRenderer';
import { SolutionCard } from '@/components/SolutionCard';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Eye,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
  Filter,
  X,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface QuizSession {
  id: string;
  timestamp: number;
  subjectId: string;
  subjectName: string;
  level: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  timeSpentMs: number;
  highestDifficulty: number;
  attempts: Attempt[];
}

export const RecentQuizzes: React.FC<{
  onStartNewQuiz?: (subjectId: string) => void;
}> = ({ onStartNewQuiz }) => {
  const { attempts, profile } = useAppStore();
  const [selectedSession, setSelectedSession] = useState<QuizSession | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');

  // Group raw attempts into logical quiz sessions
  const sessions = useMemo(() => {
    if (!attempts || attempts.length === 0) return [];

    // Sort attempts by createdAt descending
    const sorted = [...attempts].sort((a, b) => b.createdAt - a.createdAt);

    const grouped: QuizSession[] = [];
    let currentGroup: Attempt[] = [];

    sorted.forEach((att, index) => {
      if (currentGroup.length === 0) {
        currentGroup.push(att);
      } else {
        const prevAtt = currentGroup[currentGroup.length - 1];
        // If within 10 minutes and same subject or source, treat as part of same session (max 10 questions)
        const timeDiff = Math.abs(prevAtt.createdAt - att.createdAt);
        const sameSubject = prevAtt.subjectId === att.subjectId;

        if (timeDiff < 1000 * 60 * 15 && sameSubject && currentGroup.length < 10) {
          currentGroup.push(att);
        } else {
          // Finalize current group
          finalizeSession(currentGroup, grouped);
          currentGroup = [att];
        }
      }

      if (index === sorted.length - 1 && currentGroup.length > 0) {
        finalizeSession(currentGroup, grouped);
      }
    });

    return grouped;
  }, [attempts]);

  function finalizeSession(group: Attempt[], list: QuizSession[]) {
    if (group.length === 0) return;
    const first = group[0];
    const sub = subjects.find((s) => s.id === first.subjectId);
    const correctCount = group.filter((a) => a.correct).length;
    const totalTime = group.reduce((sum, a) => sum + (a.timeMs || 25000), 0);

    // Find highest difficulty in this session's questions
    let maxDiff = 1;
    group.forEach((att) => {
      const q = questions.find((item) => item.id === att.questionId);
      if (q && q.difficulty && q.difficulty > maxDiff) {
        maxDiff = q.difficulty;
      }
    });

    list.push({
      id: `session-${first.id}-${first.createdAt}`,
      timestamp: first.createdAt,
      subjectId: first.subjectId,
      subjectName: sub ? sub.name : 'General Science',
      level: sub?.level || profile.level,
      totalQuestions: group.length,
      correctCount,
      scorePercent: Math.round((correctCount / group.length) * 100),
      timeSpentMs: totalTime,
      highestDifficulty: maxDiff,
      attempts: [...group],
    });
  }

  const formatSessionDate = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today at ${timeStr}`;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return `Yesterday at ${timeStr}`;

    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  };

  const formatDuration = (ms: number) => {
    const totalSecs = Math.max(15, Math.round(ms / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-5 rounded-3xl bg-white border border-[#D5EAE9] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-sm text-[#173A43]">
                Recent Quizzes & Performance
              </h3>
              <span className="text-[10px] font-bold text-[#087F7A] bg-[#00B8B0]/15 px-2 py-0.5 rounded-full font-mono">
                {sessions.length} Sessions
              </span>
            </div>
            <p className="text-[11px] text-[#55737B] mt-0.5">
              Review your answers and official teacher marking schemes
            </p>
          </div>
        </div>

        {onStartNewQuiz && (
          <button
            onClick={() => onStartNewQuiz(profile.level === 'A' ? 'a-maths' : 'o-physics')}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#00B8B0] hover:text-[#087F7A]"
          >
            <span>Take Quiz</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quiz Sessions List */}
      {sessions.length === 0 ? (
        <div className="p-6 rounded-2xl bg-[#F5FAFA] border border-dashed border-[#D5EAE9] text-center space-y-2.5">
          <p className="text-xs text-[#55737B]">
            No completed quiz sessions recorded yet. Start practicing to track your performance and review teacher solutions.
          </p>
          {onStartNewQuiz && (
            <button
              onClick={() => onStartNewQuiz(profile.level === 'A' ? 'a-physics' : 'o-physics')}
              className="px-4 py-2 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs shadow-xs transition-all"
            >
              Start First Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.slice(0, 5).map((session) => {
            const isPassing = session.scorePercent >= 70;
            const isMedium = session.scorePercent >= 50 && session.scorePercent < 70;

            return (
              <div
                key={session.id}
                className="p-3.5 rounded-2xl bg-[#F5FAFA] border border-[#D5EAE9] hover:border-[#00B8B0]/50 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xs text-[#173A43]">
                        {session.subjectName}
                      </span>
                      <span className="text-[10px] font-semibold text-[#55737B] bg-white px-2 py-0.5 rounded-md border border-[#D5EAE9]">
                        {session.level} Level
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          session.highestDifficulty === 3
                            ? 'bg-[#FF8A00]/15 text-[#9A3412] border-[#FF8A00]/30'
                            : session.highestDifficulty === 2
                            ? 'bg-[#00B8B0]/15 text-[#087F7A] border-[#00B8B0]/30'
                            : 'bg-[#10B981]/15 text-[#065F46] border-[#10B981]/30'
                        }`}
                      >
                        {session.highestDifficulty === 3
                          ? 'Advanced'
                          : session.highestDifficulty === 2
                          ? 'Intermediate'
                          : 'Beginner'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#55737B] pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#00B8B0]" />
                        {formatSessionDate(session.timestamp)}
                      </span>
                      <span>•</span>
                      <span>Time: {formatDuration(session.timeSpentMs)}</span>
                    </div>
                  </div>

                  {/* Score Badge */}
                  <div className="text-right shrink-0">
                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-display font-extrabold text-xs shadow-2xs ${
                        isPassing
                          ? 'bg-[#00B8B0]/15 text-[#087F7A] border border-[#00B8B0]/30'
                          : isMedium
                          ? 'bg-[#FF8A00]/15 text-[#B45309] border border-[#FF8A00]/30'
                          : 'bg-[#EF4444]/15 text-[#B91C1C] border border-[#EF4444]/30'
                      }`}
                    >
                      <span>
                        {session.correctCount}/{session.totalQuestions}
                      </span>
                      <span className="text-[10px] font-sans opacity-80">
                        ({session.scorePercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-[#D5EAE9]/70 text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-[#55737B]">
                    <span>
                      {session.correctCount === session.totalQuestions
                        ? '🎉 Perfect score!'
                        : `${session.totalQuestions - session.correctCount} question(s) to review`}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSession(session);
                      setFilterMode('all');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EAFBF9] border border-[#00B8B0]/40 text-[#087F7A] font-display font-bold text-[11px] transition-colors shadow-2xs active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#00B8B0]" />
                    <span>Review Solutions</span>
                    <ChevronRight className="w-3 h-3 text-[#00B8B0]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Solutions Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-[#D5EAE9] rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#F5FAFA] border-b border-[#D5EAE9] flex items-start justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-base text-[#173A43]">
                    {selectedSession.subjectName} — Quiz Review
                  </h3>
                  <span className="text-[10px] font-bold text-[#087F7A] bg-[#00B8B0]/15 px-2 py-0.5 rounded-full">
                    {selectedSession.level} Level
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#55737B]">
                  <span>{formatSessionDate(selectedSession.timestamp)}</span>
                  <span>•</span>
                  <span>Duration: {formatDuration(selectedSession.timeSpentMs)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSession(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#D5EAE9] text-[#55737B] hover:text-[#173A43] flex items-center justify-center transition-colors shadow-2xs"
                title="Close review"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Performance Summary Banner */}
            <div className="px-5 py-3 bg-gradient-to-r from-[#EAFBF9] to-white border-b border-[#D5EAE9] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#00B8B0] text-white flex flex-col items-center justify-center font-display shadow-xs">
                  <span className="font-black text-base leading-none">
                    {selectedSession.scorePercent}%
                  </span>
                  <span className="text-[9px] uppercase font-bold leading-none mt-0.5">Score</span>
                </div>
                <div>
                  <div className="font-display font-bold text-xs text-[#173A43]">
                    {selectedSession.correctCount} of {selectedSession.totalQuestions} questions correct
                  </div>
                  <div className="text-[11px] text-[#55737B]">
                    {selectedSession.scorePercent >= 80
                      ? 'Excellent mastery! Ready for exam conditions.'
                      : selectedSession.scorePercent >= 60
                      ? 'Good effort! Review the missed examiner mark points below.'
                      : 'Recommended: study the step-by-step solutions carefully.'}
                  </div>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D5EAE9]">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    filterMode === 'all'
                      ? 'bg-[#00B8B0] text-white shadow-2xs'
                      : 'text-[#55737B] hover:text-[#173A43]'
                  }`}
                >
                  All ({selectedSession.totalQuestions})
                </button>
                <button
                  onClick={() => setFilterMode('incorrect')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    filterMode === 'incorrect'
                      ? 'bg-[#EF4444] text-white shadow-2xs'
                      : 'text-[#55737B] hover:text-[#173A43]'
                  }`}
                >
                  Incorrect ({selectedSession.totalQuestions - selectedSession.correctCount})
                </button>
                <button
                  onClick={() => setFilterMode('correct')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    filterMode === 'correct'
                      ? 'bg-[#10B981] text-white shadow-2xs'
                      : 'text-[#55737B] hover:text-[#173A43]'
                  }`}
                >
                  Correct ({selectedSession.correctCount})
                </button>
              </div>
            </div>

            {/* Questions Breakdown List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1">
              {selectedSession.attempts
                .filter((att) => {
                  if (filterMode === 'incorrect') return !att.correct;
                  if (filterMode === 'correct') return att.correct;
                  return true;
                })
                .map((att, idx) => {
                  const q = questions.find((item) => item.id === att.questionId);
                  const sol = solutions.find((s) => s.questionId === att.questionId);

                  if (!q) {
                    return (
                      <div key={att.id} className="p-3 bg-[#F5FAFA] rounded-xl text-xs text-[#55737B]">
                        Question data unavailable.
                      </div>
                    );
                  }

                  const userPicked = att.selectedKey;
                  const isUserCorrect = att.correct;

                  return (
                    <div
                      key={att.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D5EAE9] shadow-xs space-y-3.5 relative"
                    >
                      {/* Question Header & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-extrabold text-xs text-[#173A43]">
                            Question {idx + 1}
                          </span>
                          {q.difficulty && (
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                q.difficulty === 3
                                  ? 'bg-[#FF8A00]/15 text-[#9A3412] border-[#FF8A00]/30'
                                  : q.difficulty === 2
                                  ? 'bg-[#00B8B0]/15 text-[#087F7A] border-[#00B8B0]/30'
                                  : 'bg-[#10B981]/15 text-[#065F46] border-[#10B981]/30'
                              }`}
                            >
                              {q.difficulty === 3 ? 'Advanced' : q.difficulty === 2 ? 'Intermediate' : 'Beginner'}
                            </span>
                          )}
                        </div>

                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isUserCorrect
                              ? 'bg-[#10B981]/15 text-[#065F46]'
                              : 'bg-[#EF4444]/15 text-[#B91C1C]'
                          }`}
                        >
                          {isUserCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Correct (+1)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Incorrect</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Question Stem */}
                      <div className="text-sm text-[#173A43] font-medium leading-relaxed bg-[#F5FAFA] p-3.5 rounded-xl border border-[#E0F2F1]">
                        <MathRenderer text={q.stem} />
                      </div>

                      {/* Options Grid */}
                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isOptionCorrect = opt.key === q.correctKey;
                          const wasSelected = opt.key === userPicked;

                          let optionStyle =
                            'bg-white border-[#D5EAE9] text-[#173A43] hover:border-[#00B8B0]/40';

                          if (wasSelected && isOptionCorrect) {
                            optionStyle =
                              'bg-[#EAFBF9] border-2 border-[#00B8B0] text-[#087F7A] font-semibold';
                          } else if (wasSelected && !isOptionCorrect) {
                            optionStyle =
                              'bg-[#FEF2F2] border-2 border-[#EF4444] text-[#B91C1C] font-semibold';
                          } else if (isOptionCorrect) {
                            optionStyle =
                              'bg-[#F0FDF4] border-2 border-[#10B981] text-[#065F46] font-semibold';
                          }

                          return (
                            <div
                              key={opt.key}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-md bg-[#F5FAFA] border border-[#D5EAE9] flex items-center justify-center font-bold text-[11px] shrink-0">
                                  {opt.key}
                                </span>
                                <div>
                                  <MathRenderer text={opt.text} />
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold">
                                {wasSelected && !isOptionCorrect && (
                                  <span className="text-[#EF4444] flex items-center gap-1">
                                    <XCircle className="w-3.5 h-3.5" /> Your Choice
                                  </span>
                                )}
                                {isOptionCorrect && (
                                  <span className="text-[#10B981] flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Teacher Solution Card */}
                      {sol ? (
                        <div className="pt-2">
                          <SolutionCard solution={sol} />
                        </div>
                      ) : (
                        <div className="p-3 bg-[#EAFBF9] rounded-xl border border-[#00B8B0]/30 text-xs text-[#087F7A]">
                          <strong>Correct Key: {q.correctKey}</strong>. Refer to teacher notes for expanded breakdown.
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F5FAFA] border-t border-[#D5EAE9] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#55737B]">
                Skyline Academy • Official Marking Schemes
              </span>
              <button
                onClick={() => setSelectedSession(null)}
                className="px-5 py-2 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs shadow-xs transition-all"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
