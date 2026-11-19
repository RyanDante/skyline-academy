import React from 'react';
import { Flame, Zap, Award, Shield, ChevronRight, Check } from 'lucide-react';

interface StudyStreakTrackerProps {
  streakDays: number;
  onExtendStreak?: () => void;
}

export const StudyStreakTracker: React.FC<StudyStreakTrackerProps> = ({
  streakDays,
  onExtendStreak,
}) => {
  // Days of current week representation for streak visualization
  const now = new Date();
  const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0 = Mon, 6 = Sun
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const bestStreak = Math.max(streakDays, 14);

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#D5EAE9] shadow-xs flex flex-col justify-between space-y-4 h-full relative overflow-hidden">
      {/* Background warm flame glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#FF8A00]/10 blur-xl pointer-events-none" />

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center shrink-0 shadow-2xs">
              <Flame className="w-5 h-5 fill-current animate-pulse text-[#FF8A00]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-extrabold text-sm text-[#173A43]">
                  Daily Streak
                </h3>
                <span className="text-[10px] font-bold text-[#FF8A00] bg-[#FF8A00]/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[#55737B] mt-0.5">
                Keep daily momentum alive
              </p>
            </div>
          </div>
        </div>

        {/* Big Streak Counter Display */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF9F2] to-[#FFF3E4] border border-[#FFE2C2] flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-4xl text-[#173A43] tracking-tight">
                {streakDays}
              </span>
              <span className="font-display font-bold text-sm text-[#FF8A00] uppercase tracking-wide">
                Days Burning
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#7A4B17] mt-0.5">
              {streakDays >= 7
                ? 'Legendary habit! You are exam-ready.'
                : 'Study today to keep your streak burning.'}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-[#8C5D28] font-semibold block">Best Streak</span>
            <span className="font-mono font-bold text-xs text-[#173A43]">{bestStreak} days</span>
          </div>
        </div>

        {/* Week Streak Ring / Dots */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-semibold text-[#55737B] px-0.5">
            <span>This Week</span>
            <span className="text-[#087F7A] font-bold">
              {Math.min(currentDayIndex + 1, 7)}/7 active days
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {dayLetters.map((letter, idx) => {
              const isPast = idx < currentDayIndex;
              const isToday = idx === currentDayIndex;
              const isFuture = idx > currentDayIndex;

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl border text-center transition-all ${
                    isToday
                      ? 'bg-[#FF8A00] border-[#FF8A00] text-white shadow-xs font-bold scale-105'
                      : isPast
                      ? 'bg-[#00B8B0]/15 border-[#00B8B0]/30 text-[#087F7A]'
                      : 'bg-[#F5FAFA] border-[#D5EAE9] text-[#8EA5AB]'
                  }`}
                  title={`${letter} - ${isToday ? 'Today' : isPast ? 'Completed' : 'Upcoming'}`}
                >
                  <span className="text-[9px] font-mono leading-none mb-1">{letter}</span>
                  {isToday ? (
                    <Flame className="w-3.5 h-3.5 fill-current" />
                  ) : isPast ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#D5EAE9]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Streak Shield & Quick Action */}
      <div className="pt-2 border-t border-[#D5EAE9]/70 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-[#55737B]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#00B8B0]" />
            <span>Streak Freeze: <strong className="text-[#173A43]">1 Protected</strong></span>
          </div>
          <div className="flex items-center gap-1 text-[#FF8A00] font-semibold">
            <Zap className="w-3 h-3 fill-current" />
            <span>+15 XP Bonus</span>
          </div>
        </div>

        {onExtendStreak && (
          <button
            onClick={onExtendStreak}
            className="w-full py-2.5 rounded-2xl bg-[#FF8A00] hover:bg-[#D97200] text-white font-display font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Extend Daily Streak</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
