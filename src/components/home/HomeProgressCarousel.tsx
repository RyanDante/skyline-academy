import React, { useState, useRef, useEffect } from 'react';
import { WeeklyGoalTracker } from './WeeklyGoalTracker';
import { StudyStreakTracker } from './StudyStreakTracker';
import { Target, Flame, ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';

interface HomeProgressCarouselProps {
  streakDays: number;
  onStartPractice?: () => void;
  onExtendStreak?: () => void;
}

export const HomeProgressCarousel: React.FC<HomeProgressCarouselProps> = ({
  streakDays,
  onStartPractice,
  onExtendStreak,
}) => {
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync active slide index when user swiped horizontally
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth === 0) return;
    const index = Math.round(scrollLeft / clientWidth);
    if (index === 0 || index === 1) {
      setActiveSlide(index);
    }
  };

  const scrollToSlide = (index: 0 | 1) => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: index * width,
      behavior: 'smooth',
    });
    setActiveSlide(index);
  };

  return (
    <div className="space-y-2.5">
      {/* Mobile Swipe Navigation Bar (Visible only on < lg screens) */}
      <div className="flex lg:hidden items-center justify-between px-1">
        {/* Toggle Pills */}
        <div className="flex items-center gap-1.5 bg-[#EAFBF9] p-1 rounded-2xl border border-[#D5EAE9]">
          <button
            onClick={() => scrollToSlide(0)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
              activeSlide === 0
                ? 'bg-[#00B8B0] text-white shadow-xs'
                : 'text-[#55737B] hover:text-[#173A43]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Weekly Goal</span>
          </button>

          <button
            onClick={() => scrollToSlide(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
              activeSlide === 1
                ? 'bg-[#FF8A00] text-white shadow-xs'
                : 'text-[#55737B] hover:text-[#173A43]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Daily Streak ({streakDays}d)</span>
          </button>
        </div>

        {/* Swipe Hint & Dots */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#55737B] font-medium">
            <MoveHorizontal className="w-3 h-3 text-[#00B8B0]" />
            <span>Swipe</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollToSlide(0)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeSlide === 0 ? 'w-5 bg-[#00B8B0]' : 'bg-[#D5EAE9]'
              }`}
              title="View Weekly Study Goal"
            />
            <button
              onClick={() => scrollToSlide(1)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeSlide === 1 ? 'w-5 bg-[#FF8A00]' : 'bg-[#D5EAE9]'
              }`}
              title="View Daily Study Streak"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollToSlide(activeSlide === 0 ? 1 : 0)}
              className="p-1 rounded-lg bg-white border border-[#D5EAE9] text-[#55737B] hover:text-[#173A43] shadow-2xs transition-colors"
              title="Switch view"
            >
              {activeSlide === 0 ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Mobile Swipe Carousel (< lg) & Desktop Side-by-Side Grid (>= lg) */}
      <div className="relative">
        {/* On mobile (< lg): Horizontal Snap Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex lg:hidden overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-3 w-full touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Slide 1: Weekly Goal Tracker */}
          <div className="w-full min-w-full snap-center shrink-0">
            <WeeklyGoalTracker onStartPractice={onStartPractice} />
          </div>

          {/* Slide 2: Daily Streak Tracker */}
          <div className="w-full min-w-full snap-center shrink-0">
            <StudyStreakTracker streakDays={streakDays} onExtendStreak={onExtendStreak} />
          </div>
        </div>

        {/* On Desktop (>= lg): Simultaneous Side-by-Side Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-3.5 items-stretch">
          <div className="lg:col-span-2 h-full">
            <WeeklyGoalTracker onStartPractice={onStartPractice} />
          </div>
          <div className="lg:col-span-1 h-full">
            <StudyStreakTracker streakDays={streakDays} onExtendStreak={onExtendStreak} />
          </div>
        </div>
      </div>
    </div>
  );
};
