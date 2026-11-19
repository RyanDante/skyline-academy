import React, { useState } from 'react';
import { useAppStore, type ThemeMode } from '@/stores/appStore';
import { groups, leaderboard, papers } from '@/data/seed';
import { RecentQuizzes } from '@/components/profile/RecentQuizzes';
import { DailyGoalNotificationCard } from '@/components/profile/DailyGoalNotificationCard';
import {
  ShieldCheck,
  Trophy,
  Users,
  Download,
  KeyRound,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Check,
  CheckCircle2,
  Calendar,
  Lock,
  Settings,
  Sun,
  Moon,
  Laptop,
  Wifi,
  Volume2,
} from 'lucide-react';

export const ProfileScreen: React.FC<{
  onStartQuiz?: (subjectId: string) => void;
  onOpenOfflineMaterials?: () => void;
}> = ({ onStartQuiz, onOpenOfflineMaterials }) => {
  const {
    profile,
    updateProfile,
    downloadedPaperIds,
    setShowPaywall,
    redeemCode,
    resetAttempts,
    settings,
    setTheme,
    setShowSettingsModal,
  } = useAppStore();

  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [school, setSchool] = useState(profile.schoolName);
  const [level, setLevel] = useState(profile.level);

  const hasPass = profile.plan === 'pass';

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const res = redeemCode(code);
    setFeedback(res.message);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, schoolName: school, level });
    setIsEditing(false);
  };

  const downloadedPapers = papers.filter((p) => downloadedPaperIds.includes(p.id));

  return (
    <div className="space-y-5 pb-20">
      {/* 1. Student Profile Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#00B8B0] to-[#087F7A] text-white flex items-center justify-center font-display font-extrabold text-xl shadow-xs">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-[#173A43] dark:text-[#EDF3F4]">
                {profile.name}
              </h2>
              <div className="text-xs text-[#55737B] dark:text-[#A8B6BA] flex items-center gap-1.5 mt-0.5">
                <span>{profile.schoolName}</span>
                <span>•</span>
                <span className="font-semibold text-[#00B8B0]">
                  {profile.level} Level {profile.stream}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-bold text-[#00B8B0] hover:underline"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing && (
          <form onSubmit={handleSaveProfile} className="pt-3 border-t border-[#D5EAE9] dark:border-[#263A3E] space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#173A43] dark:text-[#EDF3F4] mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] rounded-xl text-xs text-[#173A43] dark:text-[#EDF3F4] focus:outline-none focus:border-[#00B8B0]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#173A43] dark:text-[#EDF3F4] mb-1">
                  School
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] rounded-xl text-xs text-[#173A43] dark:text-[#EDF3F4] focus:outline-none focus:border-[#00B8B0]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#173A43] dark:text-[#EDF3F4] mb-1">
                  GCE Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as 'A' | 'O')}
                  className="w-full px-3 py-2 bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] rounded-xl text-xs text-[#173A43] dark:text-[#EDF3F4] focus:outline-none focus:border-[#00B8B0]"
                >
                  <option value="A">A Level (Advanced)</option>
                  <option value="O">O Level (Ordinary)</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs rounded-full shadow-xs transition-colors"
            >
              Save Profile
            </button>
          </form>
        )}

        {/* Current Plan Status */}
        <div className="p-3.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                hasPass ? 'bg-[#00B8B0]/15 text-[#00B8B0]' : 'bg-[#D5EAE9] dark:bg-[#1F2F33] text-[#55737B]'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
                {hasPass ? 'Season Pass Active' : 'Free Plan'}
              </div>
              <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                {hasPass
                  ? 'All teacher solutions & AI Tutor unlocked until 31 July 2027'
                  : 'Free question papers with locked teacher answers'}
              </div>
            </div>
          </div>

          {!hasPass && (
            <button
              onClick={() => setShowPaywall(true)}
              className="px-4 py-2 bg-[#FF8A00] hover:bg-[#D97200] text-white font-display font-bold text-xs rounded-full shadow-xs transition-all active:scale-95 shrink-0"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* 2. Daily Goal Notifications System (Preferred Time & Reminder Settings) */}
      <DailyGoalNotificationCard />

      {/* 3. App Settings & Theme Mode Switcher */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#173A43] dark:text-[#EDF3F4]">
                Application Settings
              </h3>
              <p className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                Theme, study goal pace, and data preferences
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="text-xs font-bold text-[#00B8B0] hover:underline flex items-center gap-1"
          >
            <span>All Options</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Theme mode selection pills (Light, Dark, System Default) */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-[#173A43] dark:text-[#EDF3F4]">
            Theme Mode
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light' as ThemeMode, label: 'Light', icon: Sun },
              { id: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
              { id: 'system' as ThemeMode, label: 'System', icon: Laptop },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`py-2 px-3 rounded-2xl border text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border-[#00B8B0] bg-[#00B8B0] text-white shadow-xs'
                      : 'border-[#D5EAE9] dark:border-[#263A3E] bg-[#F5FAFA] dark:bg-[#0B1618] text-[#55737B] dark:text-[#A8B6BA] hover:text-[#173A43] dark:hover:text-[#EDF3F4]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick summary metrics */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D5EAE9] dark:border-[#263A3E]">
          <div className="p-2.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] text-xs">
            <span className="text-[10px] text-[#55737B] dark:text-[#A8B6BA] block">
              Daily Target
            </span>
            <span className="font-bold text-[#173A43] dark:text-[#EDF3F4]">
              {settings.dailyGoalQuestions} Questions/day
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] text-xs">
            <span className="text-[10px] text-[#55737B] dark:text-[#A8B6BA] block">
              Data Saver Mode
            </span>
            <span className="font-bold text-[#173A43] dark:text-[#EDF3F4]">
              {settings.lowDataMode ? 'Enabled (2G/3G)' : 'Standard'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Recent Quizzes & Performance History */}
      <RecentQuizzes onStartNewQuiz={onStartQuiz} />

      {/* 5. Section 9: "Get More From Skyline" / "Explore Plans" Plan Previews */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-display font-extrabold text-sm text-[#173A43] dark:text-[#EDF3F4]">
              Get more from Skyline
            </h2>
            <p className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
              Choose a pass to unlock teacher worked solutions and unlimited AI tutoring.
            </p>
          </div>
        </div>

        {/* 3 Compact Plan Cards */}
        <div className="space-y-2.5">
          {/* Card 1: Season Pass (Featured Best Value) */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#121D20] border-2 border-[#00B8B0] relative shadow-sm space-y-2.5">
            {/* Best Value badge in orange */}
            <div className="absolute -top-2.5 right-4 bg-[#FF8A00] text-white font-display font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Best value
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-extrabold text-sm text-[#173A43] dark:text-[#EDF3F4]">
                  Season Pass
                </h3>
                <p className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                  Full access to all subjects, papers, and AI Tutor until 31 July.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-display font-extrabold text-base text-[#00B8B0]">
                  7 500
                </span>
                <span className="text-[10px] text-[#55737B] dark:text-[#A8B6BA] block font-mono">FCFA / season</span>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-[#173A43] dark:text-[#EDF3F4] pt-1 border-t border-[#D5EAE9]/60 dark:border-[#263A3E]/60">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#00B8B0]" />
                <span>All teacher solutions</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#00B8B0]" />
                <span>Unlimited AI Tutor</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#00B8B0]" />
                <span>Concours deep-dives</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#00B8B0]" />
                <span>Valid until 31 July</span>
              </li>
            </ul>

            <button
              onClick={() => setShowPaywall(true)}
              className="w-full py-2.5 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <span>{hasPass ? 'Pass Already Active' : 'Select Season Pass'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: One Subject Pass */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] shadow-xs space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-[#173A43] dark:text-[#EDF3F4]">
                  One Subject Pass
                </h3>
                <p className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                  All past papers and teacher answers for 1 chosen subject.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-display font-extrabold text-base text-[#173A43] dark:text-[#EDF3F4]">
                  2 000
                </span>
                <span className="text-[10px] text-[#55737B] dark:text-[#A8B6BA] block font-mono">FCFA / subject</span>
              </div>
            </div>

            <button
              onClick={() => setShowPaywall(true)}
              className="w-full py-2 rounded-full border border-[#D5EAE9] dark:border-[#263A3E] hover:border-[#00B8B0] text-[#173A43] dark:text-[#EDF3F4] font-display font-bold text-xs transition-colors flex items-center justify-center gap-1"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Exam Week Pass */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] shadow-xs space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-[#173A43] dark:text-[#EDF3F4]">
                  Exam Week Pass
                </h3>
                <p className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                  7 days of full intensive access across all subjects before your exams.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-display font-extrabold text-base text-[#173A43] dark:text-[#EDF3F4]">
                  1 000
                </span>
                <span className="text-[10px] text-[#55737B] dark:text-[#A8B6BA] block font-mono">FCFA / 7 days</span>
              </div>
            </div>

            <button
              onClick={() => setShowPaywall(true)}
              className="w-full py-2 rounded-full border border-[#D5EAE9] dark:border-[#263A3E] hover:border-[#00B8B0] text-[#173A43] dark:text-[#EDF3F4] font-display font-bold text-xs transition-colors flex items-center justify-center gap-1"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Access Code Redemption Box */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] shadow-xs space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
          <KeyRound className="w-4 h-4 text-[#00B8B0]" />
          <span>Redeem Access Code (Enrolled Students & Demos)</span>
        </div>
        <form onSubmit={handleRedeem} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Try code: SKYLINE-DEMO"
            className="flex-1 px-3.5 py-2.5 bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] rounded-2xl text-xs font-mono font-semibold uppercase text-[#173A43] dark:text-[#EDF3F4] focus:outline-none focus:border-[#00B8B0]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs rounded-full shadow-xs transition-colors"
          >
            Activate
          </button>
        </form>
        {feedback && (
          <div className="text-xs p-2.5 rounded-xl bg-[#00B8B0]/15 text-[#087F7A] dark:text-[#6ECDD0] font-semibold border border-[#00B8B0]/30">
            {feedback}
          </div>
        )}
      </div>

      {/* 7. Weekly National Leaderboard & Class Groups */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
            <Trophy className="w-4 h-4 text-[#FF8A00]" />
            <span>Weekly National Leaderboard</span>
          </div>
          <span className="text-[11px] font-mono text-[#55737B] dark:text-[#A8B6BA]">Week 42</span>
        </div>

        {groups && groups.length > 0 && (
          <div className="p-3 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00B8B0]" />
              <div>
                <div className="font-semibold text-[#173A43] dark:text-[#EDF3F4]">{groups[0].name}</div>
                <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                  {groups[0].memberCount} classmates
                </div>
              </div>
            </div>
            <span className="font-mono text-[11px] bg-[#00B8B0]/15 text-[#087F7A] dark:text-[#6ECDD0] px-2 py-0.5 rounded-lg font-bold">
              {groups[0].joinCode}
            </span>
          </div>
        )}

        <div className="space-y-2">
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.uid}
              className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs ${
                entry.displayName.startsWith(profile.name.slice(0, 3))
                  ? 'border-[#00B8B0] bg-[#EAFBF9] dark:bg-[#14282B] font-bold'
                  : 'border-[#D5EAE9] dark:border-[#263A3E] bg-white dark:bg-[#121D20]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                    idx === 0
                      ? 'bg-yellow-400 text-yellow-950'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-800'
                      : idx === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#F5FAFA] dark:bg-[#0B1618] text-[#55737B] dark:text-[#A8B6BA]'
                  }`}
                >
                  {idx + 1}
                </span>
                <div>
                  <div className="font-semibold text-[#173A43] dark:text-[#EDF3F4]">{entry.displayName}</div>
                  <div className="text-[10px] text-[#55737B] dark:text-[#A8B6BA]">{entry.schoolName}</div>
                </div>
              </div>

              <div className="font-display font-bold text-[#00B8B0]">
                {entry.correctThisWeek} correct
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Offline Downloaded Papers */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
          <Download className="w-4 h-4 text-[#00B8B0]" />
          <span>Downloaded Question Papers ({downloadedPapers.length})</span>
        </div>

        {downloadedPapers.length === 0 ? (
          <div className="text-xs text-[#55737B] dark:text-[#A8B6BA]">
            No question papers downloaded yet. You can download papers in the GCE tab.
          </div>
        ) : (
          <div className="space-y-2">
            {downloadedPapers.map((paper) => (
              <div
                key={paper.id}
                className="p-3 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-[#173A43] dark:text-[#EDF3F4]">
                    {paper.year} Paper {paper.paperNumber}
                  </div>
                  <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                    {paper.durationMinutes} mins • {paper.totalMarks} Marks
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#087F7A] dark:text-[#6ECDD0] bg-[#00B8B0]/15 px-2.5 py-1 rounded-full">
                  Stored on Phone
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset Progress */}
      <div className="pt-2 text-center">
        <button
          onClick={() => {
            if (confirm('Reset your test attempts history?')) {
              resetAttempts();
            }
          }}
          className="text-xs text-[#55737B] dark:text-[#A8B6BA] hover:text-[#EF4444] inline-flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Practice History</span>
        </button>
      </div>
    </div>
  );
};
