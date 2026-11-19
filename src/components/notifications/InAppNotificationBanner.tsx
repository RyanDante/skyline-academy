import React, { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import {
  Bell,
  Play,
  X,
  Flame,
  Target,
  Sparkles,
  UserCheck,
  DownloadCloud,
  Award,
  BookOpen,
} from 'lucide-react';

interface InAppNotificationBannerProps {
  onStartQuiz?: () => void;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  onStartQuiz,
}) => {
  const { activeInAppReminder, dismissInAppReminder, setActiveTab } = useAppStore();

  useEffect(() => {
    if (!activeInAppReminder) return;

    // Auto-dismiss after 8 seconds if not interacted
    const timer = setTimeout(() => {
      dismissInAppReminder();
    }, 8000);

    return () => clearTimeout(timer);
  }, [activeInAppReminder, dismissInAppReminder]);

  if (!activeInAppReminder) return null;

  const getBadgeAndIcon = () => {
    switch (activeInAppReminder.type) {
      case 'signin':
        return {
          icon: <UserCheck className="w-5 h-5 text-white" />,
          badge: 'Account Synced',
          color: 'from-[#00B8B0] to-[#087F7A]',
        };
      case 'download':
        return {
          icon: <DownloadCloud className="w-5 h-5 text-white" />,
          badge: 'Offline Storage',
          color: 'from-blue-500 to-indigo-600',
        };
      case 'pass_unlocked':
        return {
          icon: <Award className="w-5 h-5 text-white" />,
          badge: 'Pass Active',
          color: 'from-[#FF8A00] to-[#D97200]',
        };
      case 'streak':
        return {
          icon: <Flame className="w-5 h-5 fill-current text-white" />,
          badge: 'Streak',
          color: 'from-[#FF8A00] to-amber-600',
        };
      case 'syllabus':
        return {
          icon: <BookOpen className="w-5 h-5 text-white" />,
          badge: 'New Materials',
          color: 'from-[#00B8B0] to-teal-700',
        };
      default:
        return {
          icon: <Target className="w-5 h-5 text-white" />,
          badge: 'Study Reminder',
          color: 'from-[#00B8B0] to-[#087F7A]',
        };
    }
  };

  const { icon, badge, color } = getBadgeAndIcon();

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto animate-in slide-in-from-top-4 fade-in duration-200">
      <div className="p-4 rounded-3xl bg-white dark:bg-[#121D20] border-2 border-[#00B8B0] shadow-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shrink-0 shadow-xs`}
            >
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xs text-[#173A43] dark:text-[#EDF3F4]">
                  {activeInAppReminder.title}
                </span>
                <span className="text-[10px] font-bold text-[#FF8A00] bg-[#FF8A00]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {badge}
                </span>
              </div>
              <p className="text-xs text-[#55737B] dark:text-[#A8B6BA] mt-0.5 leading-snug">
                {activeInAppReminder.message}
              </p>
            </div>
          </div>

          <button
            onClick={dismissInAppReminder}
            className="p-1 rounded-xl text-[#55737B] hover:text-[#173A43] dark:hover:text-[#EDF3F4] hover:bg-[#F5FAFA] dark:hover:bg-[#1A282C] transition-colors"
            title="Dismiss reminder"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {activeInAppReminder.type === 'daily_goal' || activeInAppReminder.type === 'test' ? (
            onStartQuiz && (
              <button
                onClick={() => {
                  dismissInAppReminder();
                  onStartQuiz();
                }}
                className="flex-1 py-2 px-3 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Practice Quiz</span>
              </button>
            )
          ) : activeInAppReminder.type === 'download' ? (
            <button
              onClick={() => {
                dismissInAppReminder();
                setActiveTab('gce');
              }}
              className="flex-1 py-2 px-3 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>View Offline Papers</span>
            </button>
          ) : (
            <button
              onClick={() => {
                dismissInAppReminder();
                setActiveTab('home');
              }}
              className="flex-1 py-2 px-3 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>View Study Dashboard</span>
            </button>
          )}

          <button
            onClick={dismissInAppReminder}
            className="px-4 py-2 rounded-full border border-[#D5EAE9] dark:border-[#263A3E] text-xs font-semibold text-[#55737B] dark:text-[#A8B6BA] hover:bg-[#F5FAFA] dark:hover:bg-[#1A282C] transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
