import React, { useState } from 'react';
import type { Question, Solution } from '@/types/models';
import { subjects, topics, solutions as allSolutions } from '@/data/seed';
import { MathRenderer } from '@/components/MathRenderer';
import { SolutionCard } from '@/components/SolutionCard';
import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Share2,
  Sparkles,
  Flame,
  ChevronRight,
  TrendingUp,
  Target,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface PostQuizSummaryProps {
  quizQuestions: Question[];
  selectedAnswers: Record<string, string>;
  secondsElapsed: number;
  subjectId?: string;
  topicId?: string;
  difficulty?: number;
  onRetryQuiz: () => void;
  onStartNextTopic: (subjectId: string, topicId?: string, difficulty?: number) => void;
  onClose: () => void;
}

interface ConceptAnalysis {
  questionId: string;
  topicName: string;
  conceptTitle: string;
  stem: string;
  isCorrect: boolean;
  userAnswerKey: string;
  correctAnswerKey: string;
  takeaway: string;
}

export const PostQuizSummary: React.FC<PostQuizSummaryProps> = ({
  quizQuestions,
  selectedAnswers,
  secondsElapsed,
  subjectId,
  topicId,
  difficulty,
  onRetryQuiz,
  onStartNextTopic,
  onClose,
}) => {
  const [showFullSolutions, setShowFullSolutions] = useState(false);

  const totalQuestions = quizQuestions.length;
  const correctCount = quizQuestions.filter(
    (q) => selectedAnswers[q.id] === q.correctKey
  ).length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  // Subject and topic details
  const currentSubject = subjects.find(
    (s) => s.id === (subjectId || quizQuestions[0]?.subjectId)
  );

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Analyze concepts tested and mastered
  const conceptAnalyses: ConceptAnalysis[] = quizQuestions.map((q) => {
    const isCorrect = selectedAnswers[q.id] === q.correctKey;
    const sol = allSolutions.find((s) => s.questionId === q.id);

    // Determine topic name
    const qTopic = topics.find((t) => q.topicIds.includes(t.id));
    const topicName = qTopic ? qTopic.name : currentSubject?.name || 'General Topic';

    // Extract concept summary from question or solution
    let conceptTitle = topicName;
    if (sol && sol.steps[0]) {
      conceptTitle = sol.steps[0].body.split('.')[0] || topicName;
    } else if (q.stem.includes('=')) {
      conceptTitle = q.stem.split('.')[0];
    }

    // Friendly takeaway
    const takeaway = isCorrect
      ? `Demonstrated accurate application of ${topicName} principles.`
      : sol?.commonSlip || `Review ${topicName} formulas and official marking schemes.`;

    return {
      questionId: q.id,
      topicName,
      conceptTitle,
      stem: q.stem,
      isCorrect,
      userAnswerKey: selectedAnswers[q.id] || 'None',
      correctAnswerKey: q.correctKey,
      takeaway,
    };
  });

  const masteredConcepts = conceptAnalyses.filter((c) => c.isCorrect);
  const needsReviewConcepts = conceptAnalyses.filter((c) => !c.isCorrect);

  // Determine next logical topic based on performance
  const subjectTopics = topics
    .filter((t) => t.subjectId === (subjectId || currentSubject?.id))
    .sort((a, b) => a.order - b.order);

  const currentTopicIndex = subjectTopics.findIndex(
    (t) => t.id === topicId || (quizQuestions[0] && quizQuestions[0].topicIds.includes(t.id))
  );

  let nextRecommendation: {
    title: string;
    description: string;
    subjectId: string;
    topicId?: string;
    difficulty?: number;
    badge: string;
  };

  if (scorePercent >= 70) {
    // Student passed well! Suggest next topic in sequence
    if (currentTopicIndex >= 0 && currentTopicIndex < subjectTopics.length - 1) {
      const nextTopic = subjectTopics[currentTopicIndex + 1];
      nextRecommendation = {
        title: nextTopic.name,
        description: `You've demonstrated solid mastery of ${subjectTopics[currentTopicIndex].name}. Step forward into ${nextTopic.name} for the next step of the GCE syllabus.`,
        subjectId: currentSubject?.id || 'a-physics',
        topicId: nextTopic.id,
        difficulty: difficulty || 2,
        badge: 'Recommended Next Topic',
      };
    } else if ((difficulty || 1) < 3) {
      // Reached end of sequence or no topic sequence, advance difficulty to Concours level
      nextRecommendation = {
        title: `${currentSubject?.name || 'Subject'} — Advanced & Concours Level`,
        description: `You scored ${scorePercent}%! Ready for high-tariff Concours and multi-step advanced questions.`,
        subjectId: currentSubject?.id || 'a-physics',
        topicId: topicId,
        difficulty: 3,
        badge: 'Difficulty Upgrade',
      };
    } else {
      // Suggest related complementary subject
      const nextSub = currentSubject?.id === 'a-physics' ? 'a-maths' : 'a-physics';
      nextRecommendation = {
        title: nextSub === 'a-maths' ? 'Pure Mathematics Calculus' : 'Advanced Physics Mechanics',
        description: 'Broaden your GCE readiness across complementary STEM papers.',
        subjectId: nextSub,
        topicId: undefined,
        difficulty: 2,
        badge: 'Cross-Subject Mastery',
      };
    }
  } else {
    // Student needs consolidation
    const activeTopicName =
      currentTopicIndex >= 0 ? subjectTopics[currentTopicIndex].name : 'this topic';
    nextRecommendation = {
      title: `${activeTopicName} — Targeted Consolidation`,
      description: `Target the ${needsReviewConcepts.length} missed question concepts with guided practice before advancing.`,
      subjectId: currentSubject?.id || 'a-physics',
      topicId: topicId,
      difficulty: 1, // Consolidate at accessible level
      badge: 'Reinforce Foundation',
    };
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Performance Overview Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#00B8B0]/15 via-white to-[#FF8A00]/10 border border-[#D5EAE9] text-center relative overflow-hidden shadow-xs">
        <div className="flex flex-col items-center gap-2">
          {/* Trophy / Status Icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${
              scorePercent >= 80
                ? 'bg-[#00B8B0] text-white'
                : scorePercent >= 60
                ? 'bg-[#FF8A00] text-white'
                : 'bg-[#173A43] text-white'
            }`}
          >
            {scorePercent >= 80 ? (
              <Trophy className="w-7 h-7 stroke-[2.2]" />
            ) : scorePercent >= 60 ? (
              <Target className="w-7 h-7 stroke-[2.2]" />
            ) : (
              <BookOpen className="w-7 h-7 stroke-[2.2]" />
            )}
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-display font-black text-3xl sm:text-4xl text-[#173A43]">
                {scorePercent}%
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  scorePercent >= 80
                    ? 'bg-[#00B8B0]/20 text-[#087F7A] border border-[#00B8B0]/30'
                    : scorePercent >= 60
                    ? 'bg-[#FF8A00]/20 text-[#9A3412] border border-[#FF8A00]/30'
                    : 'bg-[#EF4444]/20 text-[#B91C1C] border border-[#EF4444]/30'
                }`}
              >
                {scorePercent >= 80
                  ? 'Exam Ready'
                  : scorePercent >= 60
                  ? 'Solid Foundation'
                  : 'Needs Practice'}
              </span>
            </div>

            <p className="text-xs text-[#55737B] mt-1">
              You correctly solved{' '}
              <strong className="text-[#173A43] font-bold">
                {correctCount} of {totalQuestions}
              </strong>{' '}
              questions in{' '}
              <strong className="text-[#173A43] font-mono">{formatTime(secondsElapsed)}</strong>.
            </p>
          </div>

          {/* Gamification / Streak reward callout */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1 text-[#FF8A00] bg-[#FF8A00]/10 px-2.5 py-1 rounded-full border border-[#FF8A00]/20">
              <Flame className="w-3.5 h-3.5 fill-current" /> Daily Streak Extended!
            </span>
            <span className="inline-flex items-center gap-1 text-[#087F7A] bg-[#00B8B0]/10 px-2.5 py-1 rounded-full border border-[#00B8B0]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#00B8B0]" /> +{correctCount * 10} XP Earned
            </span>
          </div>
        </div>
      </div>

      {/* 2. Key Concepts Mastered & Areas to Consolidate */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#D5EAE9] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-[#173A43]">
                Concepts Mastered & Insights
              </h3>
              <p className="text-[11px] text-[#55737B]">
                Topic-by-topic competency analysis from this session
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {/* Mastered list */}
          {masteredConcepts.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#087F7A]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00B8B0]" />
                <span>Mastered Concepts ({masteredConcepts.length})</span>
              </div>
              <div className="space-y-1.5">
                {masteredConcepts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#EAFBF9]/60 border border-[#C5F3EE] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-display font-bold text-[#173A43] flex items-center gap-1.5">
                        <span>{item.topicName}</span>
                        <span className="text-[9px] font-mono text-[#087F7A] bg-[#00B8B0]/15 px-1.5 py-0.2 rounded font-semibold">
                          Option {item.correctAnswerKey}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#55737B] leading-tight">{item.takeaway}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#087F7A] bg-[#00B8B0]/15 px-2 py-0.5 rounded-full shrink-0">
                      ✓ Mastered
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Needs Review list */}
          {needsReviewConcepts.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B45309]">
                <AlertCircle className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>Areas to Consolidate ({needsReviewConcepts.length})</span>
              </div>
              <div className="space-y-1.5">
                {needsReviewConcepts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FFF9F2] border border-[#FFE2C2] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-display font-bold text-[#173A43] flex items-center gap-1.5">
                        <span>{item.topicName}</span>
                        <span className="text-[9px] font-mono text-[#B45309] bg-[#FF8A00]/15 px-1.5 py-0.2 rounded font-semibold">
                          Selected {item.userAnswerKey} vs Key {item.correctAnswerKey}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A4B17] leading-tight">{item.takeaway}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#B45309] bg-[#FF8A00]/15 px-2 py-0.5 rounded-full shrink-0">
                      Review Needed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Next Logical Topic to Study Recommendation Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#173A43] to-[#0D242B] text-white shadow-md space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00B8B0] font-bold bg-[#00B8B0]/20 px-2 py-0.5 rounded-full">
              {nextRecommendation.badge}
            </span>
            <h4 className="font-display font-extrabold text-base text-white">
              {nextRecommendation.title}
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              {nextRecommendation.description}
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-white/10 text-[#00B8B0] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={() =>
              onStartNextTopic(
                nextRecommendation.subjectId,
                nextRecommendation.topicId,
                nextRecommendation.difficulty
              )
            }
            className="flex-1 py-3 px-4 rounded-2xl bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Study Suggested Topic Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onRetryQuiz}
            className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Session</span>
          </button>
        </div>
      </div>

      {/* 4. Action Buttons (WhatsApp Share + Toggle Full Solutions) */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => {
            const text = encodeURIComponent(
              `I scored ${scorePercent}% (${correctCount}/${totalQuestions}) practicing with Skyline Academy! 🎯\nConcepts mastered: ${masteredConcepts
                .map((m) => m.topicName)
                .join(', ')}`
            );
            window.open(`https://wa.me/?text=${text}`, '_blank');
          }}
          className="flex-1 py-2.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] transition-colors text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Result to WhatsApp</span>
        </button>

        <button
          onClick={() => setShowFullSolutions(!showFullSolutions)}
          className="py-2.5 px-4 rounded-2xl bg-[#F5FAFA] hover:bg-[#EAFBF9] border border-[#D5EAE9] text-[#173A43] text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#00B8B0]" />
          <span>{showFullSolutions ? 'Hide Marking Schemes' : 'View Full Teacher Solutions'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${showFullSolutions ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* 5. Detailed Question Breakdown & Teacher Worked Solutions (Expandable) */}
      {showFullSolutions && (
        <div className="space-y-3 pt-2 animate-in fade-in duration-150">
          <div className="text-xs font-bold uppercase tracking-wider text-[#55737B] px-1">
            Question-by-Question Marking Schemes
          </div>
          {quizQuestions.map((q, idx) => {
            const userKey = selectedAnswers[q.id];
            const isCorrect = userKey === q.correctKey;
            const matchingSol = allSolutions.find((s) => s.questionId === q.id);

            return (
              <div
                key={q.id}
                className="p-4 rounded-2xl border border-[#D5EAE9] bg-white space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#F5FAFA] text-xs font-bold flex items-center justify-center text-[#173A43] border border-[#D5EAE9]">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#173A43]">
                      <MathRenderer text={q.stem} />
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      isCorrect
                        ? 'bg-[#10B981]/15 text-[#065F46] border border-[#10B981]/30'
                        : 'bg-[#EF4444]/15 text-[#B91C1C] border border-[#EF4444]/30'
                    }`}
                  >
                    {isCorrect ? 'Correct ✓' : 'Needs Review ✗'}
                  </span>
                </div>

                {matchingSol && <SolutionCard solution={matchingSol} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Back to Home / Close */}
      <div className="pt-2">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#F5FAFA] hover:bg-[#EAFBF9] border border-[#D5EAE9] text-[#173A43] font-display font-bold text-xs transition-colors"
        >
          Done & Return to Skyline
        </button>
      </div>
    </div>
  );
};
