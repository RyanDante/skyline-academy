import React, { useState, useMemo } from 'react';
import { subjects, topics, questions } from '@/data/seed';
import { useAppStore } from '@/stores/appStore';
import { computeTopicMastery } from '@/domain/mastery';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  Filter,
  BarChart2,
  Zap,
  GraduationCap,
} from 'lucide-react';

export type ProficiencyTier = 'all' | 'beginner' | 'intermediate' | 'advanced';

interface TopicQuizSectionProps {
  onStartQuiz: (subjectId: string, topicId?: string, difficulty?: number) => void;
}

const PROFICIENCY_CONFIG: Record<
  ProficiencyTier,
  {
    label: string;
    sublabel: string;
    difficulty?: number;
    description: string;
    accentColor: string;
    badge: string;
  }
> = {
  all: {
    label: 'All Levels',
    sublabel: 'Mixed Syllabus',
    description: 'Comprehensive mix of foundational, standard GCE, and high-rigor questions.',
    accentColor: '#00B8B0',
    badge: 'Mixed',
  },
  beginner: {
    label: 'Beginner',
    sublabel: 'Foundation',
    difficulty: 1,
    description: 'Core definitions, SI units, direct formula substitutions, and conceptual checks.',
    accentColor: '#10B981',
    badge: 'Foundation',
  },
  intermediate: {
    label: 'Intermediate',
    sublabel: 'Standard GCE',
    difficulty: 2,
    description: 'Standard Cameroon GCE Paper 1 & 2 past questions with multi-step reasoning.',
    accentColor: '#00B8B0',
    badge: 'GCE Standard',
  },
  advanced: {
    label: 'Advanced',
    sublabel: 'Concours / High Rigor',
    difficulty: 3,
    description: 'High-rigor synthesis, complex calculus, proofs, and University Concours entrance problems.',
    accentColor: '#FF8A00',
    badge: 'Concours Caliber',
  },
};

export const TopicQuizSection: React.FC<TopicQuizSectionProps> = ({ onStartQuiz }) => {
  const { profile, attempts } = useAppStore();

  const userSubjects = subjects.filter((s) => s.paperCount > 0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    profile.level === 'A' ? 'a-physics' : 'o-physics'
  );

  const [selectedProficiency, setSelectedProficiency] = useState<ProficiencyTier>('all');

  const subjectTopics = topics.filter((t) => t.subjectId === selectedSubjectId);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    subjectTopics[0]?.id || ''
  );

  const [questionCount, setQuestionCount] = useState<number>(5);
  const [mode, setMode] = useState<'practice' | 'timed'>('practice');

  // Compute real mastery per topic
  const masteryMap = computeTopicMastery(attempts);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentTopic = topics.find((t) => t.id === selectedTopicId);
  const targetDifficulty = PROFICIENCY_CONFIG[selectedProficiency].difficulty;

  // Filter topics based on selected proficiency tier
  const filteredTopics = useMemo(() => {
    if (selectedProficiency === 'all' || !targetDifficulty) {
      return subjectTopics;
    }

    // Identify topics that contain questions matching this proficiency level
    const topicsWithMatchingQuestions = subjectTopics.filter((top) => {
      return questions.some(
        (q) =>
          q.subjectId === selectedSubjectId &&
          q.topicIds.includes(top.id) &&
          q.difficulty === targetDifficulty
      );
    });

    // If some topics have questions matching, return those; otherwise return all so user is never blocked
    return topicsWithMatchingQuestions.length > 0 ? topicsWithMatchingQuestions : subjectTopics;
  }, [subjectTopics, selectedSubjectId, selectedProficiency, targetDifficulty]);

  // If currently selected topic is not in the filtered list, automatically select the first valid one
  React.useEffect(() => {
    if (filteredTopics.length > 0 && !filteredTopics.some((t) => t.id === selectedTopicId)) {
      setSelectedTopicId(filteredTopics[0].id);
    }
  }, [filteredTopics, selectedTopicId]);

  // Questions available in the chosen topic & proficiency
  const availableQuestionsCount = useMemo(() => {
    return questions.filter((q) => {
      if (q.subjectId !== selectedSubjectId) return false;
      if (selectedTopicId && !q.topicIds.includes(selectedTopicId)) return false;
      if (targetDifficulty && q.difficulty !== targetDifficulty) return false;
      return true;
    }).length;
  }, [selectedSubjectId, selectedTopicId, targetDifficulty]);

  const handleSubjectChange = (subId: string) => {
    setSelectedSubjectId(subId);
    const newTopics = topics.filter((t) => t.subjectId === subId);
    setSelectedTopicId(newTopics[0]?.id || '');
  };

  const handleLaunch = () => {
    onStartQuiz(selectedSubjectId, selectedTopicId || undefined, targetDifficulty);
  };

  return (
    <div className="p-5 rounded-3xl bg-white border border-[#D5EAE9] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-sm text-[#173A43]">
                Topic Practice & Mastery Quiz
              </h3>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF8A00]/15 text-[#FF8A00]">
                Custom Test
              </span>
            </div>
            <p className="text-[11px] text-[#55737B] mt-0.5">
              Select any subject, proficiency level, and syllabus topic
            </p>
          </div>
        </div>
      </div>

      {/* 1. Subject Selector Pills */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold uppercase text-[#55737B]">
          1. Choose Subject
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {userSubjects.map((sub) => {
            const isSelected = sub.id === selectedSubjectId;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubjectChange(sub.id)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#00B8B0] text-white border-[#00B8B0] shadow-xs'
                    : 'bg-[#F5FAFA] text-[#173A43] border-[#D5EAE9] hover:bg-white'
                }`}
              >
                <span>{sub.name}</span>
                <span className="opacity-75 text-[10px] ml-1">({sub.level}L)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Proficiency Level Filter Bar (User Request) */}
      <div className="space-y-2 pt-1 border-t border-[#D5EAE9]/60">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#55737B]">
          <span className="uppercase flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#00B8B0]" />
            2. Subject Proficiency Level
          </span>
          <span className="text-[10px] font-semibold text-[#00B8B0]">
            {PROFICIENCY_CONFIG[selectedProficiency].badge}
          </span>
        </div>

        {/* Segmented Filter Buttons */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#F5FAFA] rounded-2xl border border-[#D5EAE9]">
          {(['all', 'beginner', 'intermediate', 'advanced'] as ProficiencyTier[]).map((tier) => {
            const isSelected = selectedProficiency === tier;
            const config = PROFICIENCY_CONFIG[tier];
            return (
              <button
                key={tier}
                onClick={() => setSelectedProficiency(tier)}
                className={`py-2 px-1.5 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-white text-[#173A43] font-display font-extrabold shadow-xs border border-[#C5F3EE]'
                    : 'text-[#55737B] hover:text-[#173A43] hover:bg-white/50 font-medium'
                }`}
              >
                <div className="text-xs leading-tight flex items-center justify-center gap-1">
                  {tier === 'advanced' && (
                    <Zap className="w-2.5 h-2.5 text-[#FF8A00] fill-current" />
                  )}
                  {tier === 'beginner' && (
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  )}
                  {tier === 'intermediate' && (
                    <span className="w-2 h-2 rounded-full bg-[#00B8B0]" />
                  )}
                  <span>{config.label}</span>
                </div>
                <div
                  className={`text-[9px] mt-0.5 truncate ${
                    isSelected ? 'text-[#00B8B0] font-semibold' : 'text-[#8EA5AB]'
                  }`}
                >
                  {config.sublabel}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Proficiency Scope Explainer */}
        <div className="p-2.5 rounded-xl bg-[#EAFBF9] border border-[#C5F3EE] flex items-center justify-between text-[11px] text-[#173A43]">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00B8B0] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#087F7A]">
                {PROFICIENCY_CONFIG[selectedProficiency].label}:{' '}
              </span>
              <span className="text-[#55737B]">
                {PROFICIENCY_CONFIG[selectedProficiency].description}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Topic Selector with Filtered Topics & Mastery Badges */}
      <div className="space-y-1.5 pt-1 border-t border-[#D5EAE9]/60">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#55737B]">
          <span className="uppercase">3. Select Syllabus Topic</span>
          <span className="text-[10px] text-[#00B8B0]">
            {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''} available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
          {filteredTopics.map((top) => {
            const isSelected = top.id === selectedTopicId;
            const tm = masteryMap.get(top.id);
            const attemptsCount = tm?.attempts || 0;
            const masteryVal = tm?.mastery;

            // Count questions in this specific topic for selected proficiency
            const topicQCount = questions.filter(
              (q) =>
                q.subjectId === selectedSubjectId &&
                q.topicIds.includes(top.id) &&
                (!targetDifficulty || q.difficulty === targetDifficulty)
            ).length;

            let badgeText = 'Untested';
            let badgeClass = 'bg-[#F5FAFA] text-[#55737B] border-[#D5EAE9]';
            if (attemptsCount > 0 && masteryVal !== null && masteryVal !== undefined) {
              if (masteryVal >= 0.7) {
                badgeText = `${Math.round(masteryVal * 100)}% Strong`;
                badgeClass = 'bg-[#10B981]/15 text-[#065F46] border-[#10B981]/30';
              } else if (masteryVal < 0.5) {
                badgeText = `${Math.round(masteryVal * 100)}% Needs Work`;
                badgeClass = 'bg-[#EF4444]/15 text-[#991B1B] border-[#EF4444]/30';
              } else {
                badgeText = `${Math.round(masteryVal * 100)}% Developing`;
                badgeClass = 'bg-[#FF8A00]/15 text-[#9A3412] border-[#FF8A00]/30';
              }
            }

            return (
              <button
                key={top.id}
                onClick={() => setSelectedTopicId(top.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'border-[#00B8B0] bg-[#EAFBF9] shadow-xs ring-1 ring-[#00B8B0]'
                    : 'border-[#D5EAE9] bg-[#F5FAFA] hover:bg-white'
                }`}
              >
                <div className="space-y-0.5">
                  <div
                    className={`text-xs font-bold leading-tight ${
                      isSelected ? 'text-[#00B8B0]' : 'text-[#173A43]'
                    }`}
                  >
                    {top.name}
                  </div>
                  <div className="text-[10px] text-[#55737B] flex items-center gap-1.5">
                    <span>{topicQCount} Qs in this tier</span>
                    <span aria-hidden="true">·</span>
                    <span>{attemptsCount} past attempts</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${badgeClass} shrink-0`}
                >
                  {badgeText}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Quiz Configuration (Questions & Mode) */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#D5EAE9]/70">
        <div>
          <label className="block text-[11px] font-semibold text-[#55737B] mb-1">
            Questions Count
          </label>
          <div className="flex gap-1">
            {[5, 10].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  questionCount === count
                    ? 'bg-[#00B8B0] text-white border-[#00B8B0]'
                    : 'bg-[#F5FAFA] text-[#173A43] border-[#D5EAE9]'
                }`}
              >
                {count} Qs
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#55737B] mb-1">
            Quiz Mode
          </label>
          <div className="flex gap-1">
            <button
              onClick={() => setMode('practice')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                mode === 'practice'
                  ? 'bg-[#00B8B0] text-white border-[#00B8B0]'
                  : 'bg-[#F5FAFA] text-[#173A43] border-[#D5EAE9]'
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => setMode('timed')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                mode === 'timed'
                  ? 'bg-[#00B8B0] text-white border-[#00B8B0]'
                  : 'bg-[#F5FAFA] text-[#173A43] border-[#D5EAE9]'
              }`}
            >
              Timed
            </button>
          </div>
        </div>
      </div>

      {/* Start Button with Dynamic Tier & Topic Summary */}
      <button
        onClick={handleLaunch}
        className="w-full py-3 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>
          Start {PROFICIENCY_CONFIG[selectedProficiency].label} Quiz • {currentTopic?.name || 'All Topics'}
        </span>
      </button>
    </div>
  );
};
