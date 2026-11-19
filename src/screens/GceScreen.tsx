import React, { useState } from 'react';
import { subjects, papers } from '@/data/seed';
import { useAppStore } from '@/stores/appStore';
import {
  FileText,
  Lock,
  Unlock,
  Download,
  ChevronRight,
  ArrowLeft,
  MoreVertical,
  CheckCircle,
  Sparkles,
  Info,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Laptop,
  Grid,
} from 'lucide-react';
import type { Paper, Subject } from '@/types/models';
import { PaperUnlockModal } from '@/components/PaperUnlockModal';

export const GceScreen: React.FC<{
  onOpenPaper: (paper: Paper) => void;
  onStartQuiz: (subjectId: string, topicId?: string) => void;
}> = ({ onOpenPaper, onStartQuiz }) => {
  const {
    profile,
    selectedSubjectId,
    setSelectedSubjectId,
    setActiveTab,
    downloadedPaperIds,
    toggleDownloadPaper,
  } = useAppStore();

  const [activeLevel, setActiveLevel] = useState<'A' | 'O'>(profile.level);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [unlockedPaperIds, setUnlockedPaperIds] = useState<string[]>(['a-physics-2024-p1']);
  const [unlockingPaper, setUnlockingPaper] = useState<Paper | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const hasSeasonPass = profile.plan === 'pass';

  // Current Subject (if selected)
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Subject icons map
  const SUBJECT_ICONS: Record<string, any> = {
    'a-maths': { icon: Calculator, bg: 'bg-[#EBF3FF]', color: 'text-[#3B82F6]' },
    'o-maths': { icon: Calculator, bg: 'bg-[#EBF3FF]', color: 'text-[#3B82F6]' },
    'a-physics': { icon: Atom, bg: 'bg-[#F3E8FF]', color: 'text-[#9333EA]' },
    'o-physics': { icon: Atom, bg: 'bg-[#F3E8FF]', color: 'text-[#9333EA]' },
    'a-chemistry': { icon: FlaskConical, bg: 'bg-[#E6FBF5]', color: 'text-[#10B981]' },
    'o-chemistry': { icon: FlaskConical, bg: 'bg-[#E6FBF5]', color: 'text-[#10B981]' },
    'a-biology': { icon: Leaf, bg: 'bg-[#FEE2E2]', color: 'text-[#EF4444]' },
    'o-biology': { icon: Leaf, bg: 'bg-[#FEE2E2]', color: 'text-[#EF4444]' },
    ict: { icon: Laptop, bg: 'bg-[#FEF3C7]', color: 'text-[#D97706]' },
    further_maths: { icon: Grid, bg: 'bg-[#EBF3FF]', color: 'text-[#2563EB]' },
  };

  const ALL_SUBJECT_CARDS = [
    { id: activeLevel === 'A' ? 'a-maths' : 'o-maths', name: 'Mathematics', ...SUBJECT_ICONS['a-maths'] },
    { id: activeLevel === 'A' ? 'a-physics' : 'o-physics', name: 'Physics', ...SUBJECT_ICONS['a-physics'] },
    { id: activeLevel === 'A' ? 'a-chemistry' : 'o-chemistry', name: 'Chemistry', ...SUBJECT_ICONS['a-chemistry'] },
    { id: activeLevel === 'A' ? 'a-biology' : 'o-biology', name: 'Biology', ...SUBJECT_ICONS['a-biology'] },
    { id: 'ict', name: 'ICT', ...SUBJECT_ICONS.ict },
    { id: 'further_maths', name: 'Further Mathematics', ...SUBJECT_ICONS.further_maths },
  ];

  // If a subject is selected, filter papers
  const subjectPapers = currentSubject
    ? papers.filter(
        (p) =>
          (p.subjectId === currentSubject.id || p.subjectId.includes(currentSubject.id.replace('a-', '').replace('o-', ''))) &&
          p.year === selectedYear
      )
    : [];

  const handleDownloadPaper = (paper: Paper) => {
    toggleDownloadPaper(paper.id);

    // Create a virtual file download for the question paper
    const blob = new Blob(
      [
        `CAMEROON GENERAL CERTIFICATE OF EDUCATION BOARD\n${currentSubject?.name || 'GCE'} ${paper.year} Paper ${paper.paperNumber}\nDuration: ${paper.durationMinutes} Minutes • Total Marks: ${paper.totalMarks}\n\nThis paper has been downloaded to your phone storage for offline practice.\nAnswers are viewable exclusively in-app via Skyline Academy.`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GCE-${currentSubject?.name || 'Paper'}-${paper.year}-P${paper.paperNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadNotice(`✓ Downloaded ${paper.year} Paper ${paper.paperNumber} to device storage!`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const isPaperUnlocked = (paperId: string) => {
    return hasSeasonPass || unlockedPaperIds.includes(paperId);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 1: Main GCE Tab (Subjects Grid)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!currentSubject) {
    return (
      <div className="space-y-4 pb-20">
        {/* Hero Banner matching 7._GCE_Tab_bd22c630.png */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#00B8B0] via-[#00B8B0] to-[#087F7A] text-white p-5 shadow-sm overflow-hidden">
          <div className="space-y-2 max-w-[65%] relative z-10">
            <h2 className="font-display font-extrabold text-xl text-white leading-tight">
              GCE Past Questions
            </h2>
            <p className="text-xs text-white/90">
              Practice • Improve • Excel
            </p>
            <div className="pt-1">
              <button
                onClick={() => setSelectedSubjectId('a-maths')}
                className="px-4 py-2 rounded-full bg-white hover:bg-white/90 text-[#087F7A] font-display font-bold text-xs shadow-sm flex items-center gap-1 transition-all active:scale-95"
              >
                <span>Explore Questions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Books illustration on right */}
          <div className="absolute right-4 bottom-2 w-28 h-24 flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-4 bg-[#FF8A00] rounded-sm transform -rotate-3 shadow-xs" />
              <div className="w-22 h-5 bg-[#3B82F6] rounded-sm mt-0.5 shadow-xs" />
              <div className="w-24 h-6 bg-[#173A43] rounded-sm mt-0.5 shadow-sm flex items-center justify-center text-[9px] font-mono font-bold text-white">
                GCE
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display font-extrabold text-base text-[#173A43]">
              Subjects
            </h2>

            {/* Level switch */}
            <div className="flex p-0.5 rounded-full bg-white border border-[#D5EAE9]">
              <button
                onClick={() => setActiveLevel('A')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeLevel === 'A'
                    ? 'bg-[#00B8B0] text-white shadow-xs'
                    : 'text-[#55737B] hover:text-[#173A43]'
                }`}
              >
                A Level
              </button>
              <button
                onClick={() => setActiveLevel('O')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeLevel === 'O'
                    ? 'bg-[#00B8B0] text-white shadow-xs'
                    : 'text-[#55737B] hover:text-[#173A43]'
                }`}
              >
                O Level
              </button>
            </div>
          </div>

          {/* Grid of 6 Subjects matching 7._GCE_Tab_bd22c630.png */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ALL_SUBJECT_CARDS.map((sub) => {
              const Icon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className="p-4 rounded-2xl bg-white border border-[#D5EAE9] hover:border-[#00B8B0] hover:shadow-xs transition-all flex flex-col justify-between h-28 text-left group"
                >
                  <div className={`w-10 h-10 rounded-xl ${sub.bg} ${sub.color} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <span className="font-display font-bold text-xs text-[#173A43] group-hover:text-[#00B8B0] transition-colors leading-tight">
                      {sub.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#55737B] group-hover:text-[#00B8B0] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* View all subjects button */}
          <button
            onClick={() => setSelectedSubjectId('a-physics')}
            className="w-full py-2.5 rounded-full border border-[#00B8B0] text-[#00B8B0] hover:bg-[#00B8B0]/10 font-display font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <span>View all Subjects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Access */}
        <div className="p-4 rounded-3xl bg-white border border-[#D5EAE9] shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#173A43]">
            <span className="text-[#00B8B0]">⚡</span>
            <span>Quick Access</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedSubjectId('a-physics')}
              className="p-3 rounded-2xl bg-[#F5FAFA] hover:bg-[#EAFBF9] border border-[#D5EAE9] flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00B8B0]" />
                <span className="text-xs font-semibold text-[#173A43] group-hover:text-[#00B8B0]">
                  Past Questions
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#55737B]" />
            </button>

            <button
              onClick={() => setActiveTab('tutor')}
              className="p-3 rounded-2xl bg-[#F5FAFA] hover:bg-[#EAFBF9] border border-[#D5EAE9] flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF8A00]" />
                <span className="text-xs font-semibold text-[#173A43] group-hover:text-[#00B8B0]">
                  AI Tutor
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#55737B]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 2: Subject Papers Library View (matches 8._GCE_Tab_2_2df8d97d.png)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSelectedSubjectId(null)}
            className="p-2 rounded-full hover:bg-white text-[#173A43] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-extrabold text-xl text-[#173A43]">
            {currentSubject.name}
          </h1>
        </div>

        <button className="p-2 rounded-full text-[#55737B] hover:text-[#173A43]">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Level Selector Pills */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveLevel('O')}
          className={`py-2.5 rounded-2xl text-xs font-bold transition-all border ${
            activeLevel === 'O'
              ? 'bg-[#00B8B0] text-white border-[#00B8B0] shadow-xs'
              : 'bg-white text-[#173A43] border-[#D5EAE9] hover:bg-[#F5FAFA]'
          }`}
        >
          O Level
        </button>
        <button
          onClick={() => setActiveLevel('A')}
          className={`py-2.5 rounded-2xl text-xs font-bold transition-all border ${
            activeLevel === 'A'
              ? 'bg-[#00B8B0] text-white border-[#00B8B0] shadow-xs'
              : 'bg-white text-[#173A43] border-[#D5EAE9] hover:bg-[#F5FAFA]'
          }`}
        >
          A Level
        </button>
      </div>

      {/* Year Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[2024, 2023, 2022, 2021].map((year) => {
          const isSelected = selectedYear === year;
          return (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                isSelected
                  ? 'bg-[#00B8B0] text-white border-[#00B8B0] shadow-xs'
                  : 'bg-white text-[#173A43] border-[#D5EAE9] hover:bg-[#F5FAFA]'
              }`}
            >
              {year}
            </button>
          );
        })}
        <button className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-white text-[#55737B] border border-[#D5EAE9]">
          •••
        </button>
      </div>

      {/* Download Alert Notice */}
      {downloadNotice && (
        <div className="p-3 rounded-2xl bg-[#00B8B0]/15 border border-[#00B8B0]/30 text-xs font-semibold text-[#087F7A] flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#00B8B0]" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Document-style Papers List matching 8._GCE_Tab_2_2df8d97d.png */}
      <div className="space-y-6 pt-2">
        {/* We present Paper 1 and Paper 2 */}
        {[1, 2].map((paperNum) => {
          const matchingPaper =
            subjectPapers.find((p) => p.paperNumber === paperNum) || {
              id: `${currentSubject.id}-${selectedYear}-p${paperNum}`,
              subjectId: currentSubject.id,
              year: selectedYear,
              paperNumber: paperNum as 1 | 2,
              durationMinutes: paperNum === 1 ? 90 : 150,
              totalMarks: paperNum === 1 ? 50 : 100,
              questionCount: paperNum === 1 ? 50 : 8,
            };

          const isDownloaded = downloadedPaperIds.includes(matchingPaper.id);
          const isUnlocked = isPaperUnlocked(matchingPaper.id);

          return (
            <div key={paperNum} className="space-y-3">
              <h2 className="font-display font-extrabold text-lg text-[#173A43]">
                Paper {paperNum}
              </h2>

              {/* Row 1: Question Paper with Download Action */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#D5EAE9] shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00B8B0]/10 text-[#00B8B0] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xs text-[#173A43]">
                      Question Paper
                    </div>
                    <div className="text-[11px] text-[#55737B]">
                      PDF • {paperNum === 1 ? '2.4 MB' : '2.1 MB'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadPaper(matchingPaper)}
                  className={`px-4 py-2 rounded-full font-display font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                    isDownloaded
                      ? 'bg-[#087F7A] text-white hover:bg-[#066460]'
                      : 'bg-[#00B8B0] hover:bg-[#087F7A] text-white active:scale-95'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloaded ? 'Saved' : 'Download'}</span>
                </button>
              </div>

              {/* Row 2: Proposed Answers with 100 FCFA lock or In-App View */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#D5EAE9] shadow-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isUnlocked
                        ? 'bg-[#00B8B0]/15 text-[#00B8B0]'
                        : 'bg-[#FF8A00]/15 text-[#FF8A00]'
                    }`}
                  >
                    {isUnlocked ? (
                      <Unlock className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-display font-bold text-xs text-[#173A43]">
                      Proposed Answers
                    </div>
                    <div className="text-[11px] text-[#55737B]">
                      Skyline Solution • {paperNum === 1 ? '1.8 MB' : '1.5 MB'}
                    </div>
                  </div>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => onOpenPaper(matchingPaper)}
                    className="px-4 py-2 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>View Answers</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setUnlockingPaper(matchingPaper)}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-[#F5FAFA] border border-[#00B8B0] text-[#00B8B0] font-display font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#00B8B0]" />
                    <span>100 XAF</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Notice Box matching 8._GCE_Tab_2_2df8d97d.png */}
      <div className="p-4 rounded-3xl bg-white border border-[#D5EAE9] flex items-center gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-full bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <p className="text-xs text-[#173A43] font-medium leading-relaxed">
          Answers can be unlocked for <strong>100 FCFA</strong> each, or unlock all past papers with the{' '}
          <button
            onClick={() => useAppStore.getState().setShowPaywall(true)}
            className="text-[#FF8A00] font-bold hover:underline inline"
          >
            Season Pass
          </button>.
        </p>
      </div>

      {/* 100 FCFA Unlock Modal */}
      {unlockingPaper && (
        <PaperUnlockModal
          paperId={unlockingPaper.id}
          paperTitle={`${currentSubject.name} ${unlockingPaper.year} Paper ${unlockingPaper.paperNumber}`}
          isOpen={!!unlockingPaper}
          onClose={() => setUnlockingPaper(null)}
          onUnlocked={() => {
            setUnlockedPaperIds((prev) => [...prev, unlockingPaper.id]);
            onOpenPaper(unlockingPaper);
          }}
        />
      )}
    </div>
  );
};
