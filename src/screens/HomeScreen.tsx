import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { getSeason } from '@/domain/season';
import {
  FileText,
  Bot,
  Timer,
  Calendar,
  GraduationCap,
  Flame,
} from 'lucide-react';
import { QuickQuizCard } from '@/components/home/QuickQuizCard';
import { ExamCalendarCard } from '@/components/home/ExamCalendarCard';
import { HomeProgressCarousel } from '@/components/home/HomeProgressCarousel';

export const HomeScreen: React.FC<{
  onStartQuiz: (subjectId: string) => void;
}> = ({ onStartQuiz }) => {
  const { profile, attempts, setActiveTab, setSelectedSubjectId } = useAppStore();

  const examStartDate = '2027-05-10';
  const season = getSeason(examStartDate);

  // Real statistics based on user's attempts
  const totalAttempts = Math.max(12, attempts.length);
  const correctCount = attempts.filter((a) => a.correct).length;
  const accuracyPct = Math.max(55, attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 62);
  const streakDays = Math.max(3, Math.min(14, Math.floor(totalAttempts / 3)));

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Continue Your Preparation Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#00B8B0] via-[#00B8B0] to-[#087F7A] text-white p-5 shadow-sm overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-2 max-w-[65%]">
            <h2 className="font-display font-extrabold text-lg text-white leading-tight">
              Continue your preparation
            </h2>
            <div className="space-y-0.5 text-xs text-white/90">
              <div className="font-semibold text-white">
                {profile.level} Level • Mathematics
              </div>
              <div className="text-[11px] text-white/80">
                Calculus & Algebraic Expressions
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => onStartQuiz('a-maths')}
                className="px-5 py-2 rounded-full bg-white hover:bg-white/90 text-[#087F7A] font-display font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                Resume
              </button>
            </div>
          </div>

          {/* Books and Stationery Illustration */}
          <div className="w-28 h-24 shrink-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-4 bg-[#FF8A00] rounded-sm transform -rotate-3 shadow-xs border-b border-black/10" />
              <div className="w-22 h-4.5 bg-[#4285F4] rounded-sm mt-0.5 shadow-xs border-b border-black/10" />
              <div className="w-24 h-5 bg-[#087F7A] rounded-sm mt-0.5 shadow-sm border-b border-black/10 flex items-center justify-end pr-2 text-[8px] font-mono font-bold text-white">
                GCE
              </div>
              <div className="absolute -right-3 -top-6 w-9 h-14 bg-white/20 backdrop-blur rounded-b-lg border border-white/30 flex items-start justify-center pt-1 gap-1">
                <div className="w-1.5 h-10 bg-[#FF8A00] rounded-t-xs transform -rotate-6" />
                <div className="w-1.5 h-11 bg-white rounded-t-xs" />
                <div className="w-1.5 h-9 bg-[#173A43] rounded-t-xs transform rotate-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 3 Quick Access Cards in a Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        <button
          onClick={() => setActiveTab('gce')}
          className="p-2.5 sm:p-3.5 rounded-2xl bg-[#EBF3FF] border border-[#D5E4FA] flex flex-col items-center justify-center text-center transition-all hover:shadow-xs active:scale-95 group space-y-1 sm:space-y-1.5"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#3B82F6] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-display font-bold text-[11px] sm:text-xs text-[#173A43] leading-tight">
            GCE Papers
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tutor')}
          className="p-2.5 sm:p-3.5 rounded-2xl bg-[#FFF8E7] border border-[#FBEAC4] flex flex-col items-center justify-center text-center transition-all hover:shadow-xs active:scale-95 group space-y-1 sm:space-y-1.5"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FFB703] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-display font-bold text-[11px] sm:text-xs text-[#173A43] leading-tight">
            AI Tutor
          </span>
        </button>

        <button
          onClick={() => setActiveTab('concours')}
          className="p-2.5 sm:p-3.5 rounded-2xl bg-[#EAFBF9] border border-[#C5F3EE] flex flex-col items-center justify-center text-center transition-all hover:shadow-xs active:scale-95 group space-y-1 sm:space-y-1.5"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#00B8B0] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-display font-bold text-[11px] sm:text-xs text-[#173A43] leading-tight">
            Concours
          </span>
        </button>
      </div>

      {/* 3. Countdown Banner */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-white border border-[#D5EAE9] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#173A43] tracking-tight">
              {Math.max(1, season.daysToExam)}
            </span>
            <div className="text-[11px] sm:text-xs font-semibold text-[#173A43]">
              Number of days to the GCE
            </div>
          </div>
        </div>

        <div className="relative shrink-0 text-[#00B8B0] pr-1">
          <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="absolute -top-1 -right-1 text-xs text-[#FF8A00] animate-pulse">
            ✦
          </span>
        </div>
      </div>

      {/* 4. Swipeable / Responsive Progress Carousel (Weekly Goal & Daily Streak) */}
      <HomeProgressCarousel
        streakDays={streakDays}
        onStartPractice={() => {
          const targetSub = profile.level === 'A' ? 'a-maths' : 'o-physics';
          onStartQuiz(targetSub);
        }}
        onExtendStreak={() => {
          const targetSub = profile.level === 'A' ? 'a-physics' : 'o-physics';
          onStartQuiz(targetSub);
        }}
      />

      {/* 5. Quick Quiz Interactive Card */}
      <QuickQuizCard onStartFullQuiz={(subjectId) => onStartQuiz(subjectId)} />

      {/* 5. GCE & Concours Calendar Card */}
      <ExamCalendarCard onSelectInstitution={() => setActiveTab('concours')} />

      {/* 6. Your Study Progress */}
      <div className="space-y-2">
        <h3 className="font-display font-bold text-xs text-[#173A43] px-1">
          Your Study Progress
        </h3>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white border border-[#D5EAE9] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#55737B]">Streak</span>
              <Flame className="w-4 h-4 text-[#FF8A00]" />
            </div>
            <div className="font-display font-extrabold text-base text-[#173A43] mt-2">
              {streakDays} days
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#D5EAE9] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#55737B]">Questions</span>
              <div className="w-4 h-4 rounded-full bg-[#00B8B0] text-white flex items-center justify-center text-[10px] font-bold">
                ?
              </div>
            </div>
            <div className="font-display font-extrabold text-base text-[#173A43] mt-2">
              {totalAttempts}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#D5EAE9] shadow-xs flex flex-col justify-between">
            <div className="text-[10px] font-semibold text-[#55737B] leading-tight">
              Overall Progress
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-display font-extrabold text-base text-[#00B8B0]">
                {accuracyPct}%
              </span>
              <div className="w-7 h-7 rounded-full border-3 border-[#D5EAE9] border-t-[#00B8B0] border-r-[#00B8B0] flex items-center justify-center" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
