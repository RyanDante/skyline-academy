import React, { useState, useEffect } from 'react';
import type { Question } from '@/types/models';
import { questions as allQuestions, solutions as allSolutions, subjects } from '@/data/seed';
import { useAppStore } from '@/stores/appStore';
import { MathRenderer } from './MathRenderer';
import { SolutionCard } from './SolutionCard';
import { PostQuizSummary } from './quiz/PostQuizSummary';
import { X, Clock, CheckCircle2, AlertCircle, Share2, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  subjectId?: string;
  topicId?: string;
  paperId?: string;
  difficulty?: number;
  onClose: () => void;
  onStartNextQuiz?: (subjectId: string, topicId?: string, difficulty?: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  subjectId,
  topicId,
  paperId,
  difficulty,
  onClose,
  onStartNextQuiz,
}) => {
  const { recordBatchAttempts, profile, setShowPaywall } = useAppStore();

  // Filter pool of questions
  const candidateQuestions = allQuestions.filter((q) => {
    if (paperId && q.paperId !== paperId) return false;
    if (subjectId && q.subjectId !== subjectId) return false;
    if (topicId && !q.topicIds.includes(topicId)) return false;
    if (difficulty && q.difficulty !== difficulty) return false;
    return true;
  });

  const quizQuestions =
    candidateQuestions.length > 0
      ? candidateQuestions
      : allQuestions.filter((q) => !subjectId || q.subjectId === subjectId).slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [reviewingIndex, setReviewingIndex] = useState<number | null>(null);

  // Timer
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const currentQ = quizQuestions[currentIndex];

  const handleSelectOption = (key: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: key,
    }));
  };

  const handleFinish = () => {
    setIsSubmitted(true);

    // Save batch attempts
    const attemptsToRecord = quizQuestions.map((q) => {
      const chosen = selectedAnswers[q.id] || null;
      const isCorrect = chosen === q.correctKey;
      return {
        questionId: q.id,
        subjectId: q.subjectId,
        topicIds: q.topicIds,
        selectedKey: chosen as any,
        correct: isCorrect,
        timeMs: Math.max(5000, Math.round((secondsElapsed / quizQuestions.length) * 1000)),
        source: 'quiz' as const,
      };
    });

    recordBatchAttempts(attemptsToRecord);

    const score = quizQuestions.filter((q) => selectedAnswers[q.id] === q.correctKey).length;
    if (score / quizQuestions.length >= 0.7) {
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch (_) {}
    }
  };

  const correctAnswersCount = quizQuestions.filter(
    (q) => selectedAnswers[q.id] === q.correctKey
  ).length;
  const scorePercent = Math.round((correctAnswersCount / quizQuestions.length) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentSubject = subjects.find((s) => s.id === (subjectId || currentQ?.subjectId));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-surface border border-line rounded-2xl max-w-xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-surface-alt border-b border-line flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {currentSubject?.name || 'GCE Practice'}
              </span>
              {(difficulty || currentQ?.difficulty) && (
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    (difficulty || currentQ?.difficulty) === 3
                      ? 'bg-[#FF8A00]/15 text-[#9A3412] border-[#FF8A00]/30'
                      : (difficulty || currentQ?.difficulty) === 2
                      ? 'bg-[#00B8B0]/15 text-[#087F7A] border-[#00B8B0]/30'
                      : 'bg-[#10B981]/15 text-[#065F46] border-[#10B981]/30'
                  }`}
                >
                  {(difficulty || currentQ?.difficulty) === 3
                    ? 'Advanced'
                    : (difficulty || currentQ?.difficulty) === 2
                    ? 'Intermediate'
                    : 'Beginner'}
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-ink">
              {isSubmitted ? 'Quiz Results & Review' : `Question ${currentIndex + 1} of ${quizQuestions.length}`}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-line text-xs font-mono text-muted">
              <Clock className="w-3.5 h-3.5 text-brand-deep" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-surface text-muted hover:text-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {!isSubmitted ? (
            <>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-deep transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Stem */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="font-semibold text-brand-deep">
                    Question {currentQ.label || currentIndex + 1}
                  </span>
                  <span>{currentQ.marks} {currentQ.marks === 1 ? 'Mark' : 'Marks'}</span>
                </div>
                <div className="text-sm font-medium text-ink leading-relaxed">
                  <MathRenderer text={currentQ.stem} />
                </div>
              </div>

              {/* Options */}
              {currentQ.options && currentQ.options.length > 0 ? (
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedAnswers[currentQ.id] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption(opt.key)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-brand-deep bg-brand-deep/10 text-brand-deep shadow-xs'
                            : 'border-line hover:border-muted text-ink bg-surface'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono shrink-0 text-xs transition-colors ${
                            isSelected
                              ? 'bg-brand-deep text-white'
                              : 'bg-surface-alt border border-line text-muted'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <div className="pt-0.5 leading-relaxed">
                          <MathRenderer text={opt.text} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-surface-alt border border-line rounded-xl text-xs space-y-2">
                  <div className="font-semibold text-ink">Structured Calculation Question</div>
                  <p className="text-muted leading-relaxed">
                    Work out your calculation on paper following GCE examiner steps. Check your final answer with the official marking scheme.
                  </p>
                  {currentQ.numericAnswer && (
                    <div className="font-mono text-xs text-brand-deep font-semibold">
                      Target: {currentQ.numericAnswer.value} {currentQ.numericAnswer.unit} (±{currentQ.numericAnswer.tolerance})
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Post-Quiz Performance & Concept Summary View */
            <PostQuizSummary
              quizQuestions={quizQuestions}
              selectedAnswers={selectedAnswers}
              secondsElapsed={secondsElapsed}
              subjectId={subjectId}
              topicId={topicId}
              difficulty={difficulty}
              onRetryQuiz={() => {
                setIsSubmitted(false);
                setCurrentIndex(0);
                setSelectedAnswers({});
                setSecondsElapsed(0);
              }}
              onStartNextTopic={(nextSubId, nextTopId, nextDiff) => {
                if (onStartNextQuiz) {
                  onStartNextQuiz(nextSubId, nextTopId, nextDiff);
                } else {
                  setIsSubmitted(false);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                  setSecondsElapsed(0);
                }
              }}
              onClose={onClose}
            />
          )}
        </div>

        {/* Footer Navigation (Only while taking quiz) */}
        {!isSubmitted && (
          <div className="p-4 bg-surface-alt border-t border-line flex items-center justify-between">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-3.5 py-2 text-xs font-semibold text-muted hover:text-ink disabled:opacity-40 transition-colors"
            >
              Previous
            </button>

            {currentIndex < quizQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(quizQuestions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-[#00B8B0] hover:bg-[#087F7A] transition-colors text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-5 py-2 rounded-xl bg-[#FF8A00] hover:bg-[#D97200] transition-colors text-white font-display font-bold text-xs shadow-md"
              >
                Submit & Check Answers
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
