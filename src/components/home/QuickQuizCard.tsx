import React, { useState } from 'react';
import { questions as allQuestions, subjects } from '@/data/seed';
import { useAppStore } from '@/stores/appStore';
import { MathRenderer } from '../MathRenderer';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  ChevronRight,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickQuizCardProps {
  onStartFullQuiz: (subjectId: string) => void;
}

export const QuickQuizCard: React.FC<QuickQuizCardProps> = ({ onStartFullQuiz }) => {
  const { profile, recordAttempt } = useAppStore();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    profile.level === 'A' ? 'a-physics' : 'o-physics'
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);

  // Available subjects for this level
  const availableSubjects = subjects.filter((s) => s.level === profile.level && s.paperCount > 0);

  // Pick question for selected subject
  const subjectQuestions = allQuestions.filter(
    (q) => q.subjectId === selectedSubjectId && q.type === 'mcq' && q.options && q.options.length > 0
  );
  const currentQuestion = subjectQuestions[0] || allQuestions[0];

  const handleSelectOption = (key: string) => {
    if (hasAnswered) return;
    setSelectedOption(key);
    setHasAnswered(true);

    const isCorrect = key === currentQuestion.correctKey;

    recordAttempt({
      questionId: currentQuestion.id,
      subjectId: currentQuestion.subjectId,
      topicIds: currentQuestion.topicIds,
      selectedKey: key as any,
      correct: isCorrect,
      timeMs: 15000,
      source: 'quiz',
    });

    if (isCorrect) {
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } catch (_) {}
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setHasAnswered(false);
  };

  return (
    <div className="p-4 rounded-3xl bg-white border border-[#D5EAE9] shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-extrabold text-xs text-[#173A43]">
                Quick Quiz Challenge
              </h3>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#00B8B0]/15 text-[#00B8B0]">
                Daily Practice
              </span>
            </div>
            <p className="text-[11px] text-[#55737B]">
              Answer today’s past question to boost your streak
            </p>
          </div>
        </div>

        <button
          onClick={() => onStartFullQuiz(selectedSubjectId)}
          className="px-3 py-1.5 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all active:scale-95"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Full 5-Q Blitz</span>
        </button>
      </div>

      {/* Subject Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {availableSubjects.map((sub) => {
          const isSelected = sub.id === selectedSubjectId;
          return (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubjectId(sub.id);
                handleReset();
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#00B8B0] text-white border-[#00B8B0] shadow-xs'
                  : 'bg-[#F5FAFA] text-[#55737B] border-[#D5EAE9] hover:text-[#173A43]'
              }`}
            >
              {sub.name}
            </button>
          );
        })}
      </div>

      {/* Interactive Question Card */}
      {currentQuestion && (
        <div className="p-3.5 rounded-2xl bg-[#F5FAFA] border border-[#D5EAE9] space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#55737B]">
            <span className="font-bold text-[#00B8B0]">
              Official GCE Past Question • 1 Mark
            </span>
            {hasAnswered && (
              <button
                onClick={handleReset}
                className="text-[10px] text-[#00B8B0] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Try again</span>
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-[#173A43] leading-relaxed">
            <MathRenderer text={currentQuestion.stem} />
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {currentQuestion.options?.map((opt) => {
              const isSelected = selectedOption === opt.key;
              const isCorrect = opt.key === currentQuestion.correctKey;

              let btnStyle = 'border-[#D5EAE9] bg-white text-[#173A43] hover:border-[#00B8B0]';
              if (hasAnswered) {
                if (isCorrect) {
                  btnStyle = 'border-[#10B981] bg-[#10B981]/15 text-[#065F46] font-bold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'border-[#EF4444] bg-[#EF4444]/15 text-[#991B1B] font-bold';
                } else {
                  btnStyle = 'border-[#D5EAE9] bg-white/60 text-[#55737B] opacity-60';
                }
              }

              return (
                <button
                  key={opt.key}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(opt.key)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${btnStyle}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 font-mono ${
                      isSelected
                        ? 'bg-[#00B8B0] text-white'
                        : 'bg-[#F5FAFA] border border-[#D5EAE9] text-[#55737B]'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <div className="pt-0.5 leading-tight">
                    <MathRenderer text={opt.text} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback & Examiner Note when answered */}
          {hasAnswered && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                selectedOption === currentQuestion.correctKey
                  ? 'bg-[#10B981]/15 text-[#065F46]'
                  : 'bg-[#FF8A00]/15 text-[#9A3412]'
              }`}
            >
              {selectedOption === currentQuestion.correctKey ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-[#FF8A00]" />
              )}
              <div className="leading-tight">
                <strong>
                  {selectedOption === currentQuestion.correctKey
                    ? 'Correct! +10 Points to Streak.'
                    : `Incorrect. The correct option is ${currentQuestion.correctKey}.`}
                </strong>
                <span className="block text-[11px] opacity-80 mt-0.5">
                  See the full worked solution in the past papers tab.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
