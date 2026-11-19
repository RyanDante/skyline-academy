import React, { useState } from 'react';
import { offlineStorage, type CachedPaperData, type StudyMaterial } from '@/services/offlineStorage';
import {
  X,
  HardDrive,
  FileText,
  BookOpen,
  Play,
  Trash2,
  DownloadCloud,
  CheckCircle2,
  Atom,
  Calculator,
  Compass,
  Sparkles,
} from 'lucide-react';

interface OfflineMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuiz: (paperId: string) => void;
}

export const OfflineMaterialsModal: React.FC<OfflineMaterialsModalProps> = ({
  isOpen,
  onClose,
  onStartQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'papers' | 'materials'>('papers');
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);

  if (!isOpen) return null;

  const cachedPapers = offlineStorage.getCachedPapers();
  const cachedMaterials = offlineStorage.getCachedStudyMaterials();
  const stats = offlineStorage.getStorageUsage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#121D20] rounded-3xl border border-[#D5EAE9] dark:border-[#263A3E] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center">
              <HardDrive className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-[#173A43] dark:text-[#EDF3F4]">
                  Offline Storage & Cache
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Ready Offline
                </span>
              </div>
              <p className="text-xs text-[#55737B] dark:text-[#A8B6BA]">
                {stats.cachedPapersCount} papers • {stats.cachedMaterialsCount} revision notes • ~{stats.usedKb} KB in device storage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#55737B] hover:text-[#173A43] dark:hover:text-[#EDF3F4] hover:bg-[#F5FAFA] dark:hover:bg-[#1A282C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#D5EAE9] dark:border-[#263A3E] px-4 bg-[#F5FAFA] dark:bg-[#0B1618]">
          <button
            onClick={() => {
              setActiveTab('papers');
              setSelectedMaterial(null);
            }}
            className={`py-3 px-3 text-xs font-display font-bold border-b-2 transition-all ${
              activeTab === 'papers'
                ? 'border-[#00B8B0] text-[#00B8B0]'
                : 'border-transparent text-[#55737B] dark:text-[#A8B6BA] hover:text-[#173A43]'
            }`}
          >
            Cached Past Papers ({cachedPapers.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('materials');
              setSelectedMaterial(null);
            }}
            className={`py-3 px-3 text-xs font-display font-bold border-b-2 transition-all ${
              activeTab === 'materials'
                ? 'border-[#00B8B0] text-[#00B8B0]'
                : 'border-transparent text-[#55737B] dark:text-[#A8B6BA] hover:text-[#173A43]'
            }`}
          >
            Study Notes & Formulas ({cachedMaterials.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'papers' && (
            <div className="space-y-3">
              {cachedPapers.length === 0 ? (
                <div className="p-8 text-center bg-[#F5FAFA] dark:bg-[#0B1618] rounded-2xl border border-[#D5EAE9] dark:border-[#263A3E]">
                  <DownloadCloud className="w-8 h-8 text-[#55737B] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-[#173A43] dark:text-[#EDF3F4]">
                    No past papers cached yet
                  </p>
                  <p className="text-[11px] text-[#55737B] dark:text-[#A8B6BA] mt-1">
                    Download papers from the GCE tab to practice anywhere without internet data.
                  </p>
                </div>
              ) : (
                cachedPapers.map((cp) => (
                  <div
                    key={cp.paper.id}
                    className="p-3.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
                          {cp.paper.year} Paper {cp.paper.paperNumber}
                        </div>
                        <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                          {cp.questions.length} questions • {cp.paper.durationMinutes} mins • {cp.sizeKb} KB
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onStartQuiz(cp.paper.id);
                      }}
                      className="px-3.5 py-1.5 bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs rounded-full shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Practice Offline</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-3">
              {selectedMaterial ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedMaterial(null)}
                    className="text-xs font-bold text-[#00B8B0] hover:underline"
                  >
                    ← Back to all materials
                  </button>

                  <div className="p-4 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#00B8B0] uppercase tracking-wider">
                        {selectedMaterial.subjectName} • {selectedMaterial.level} Level
                      </span>
                      <h3 className="font-display font-bold text-sm text-[#173A43] dark:text-[#EDF3F4]">
                        {selectedMaterial.title}
                      </h3>
                      <p className="text-xs text-[#55737B] dark:text-[#A8B6BA] mt-0.5">
                        {selectedMaterial.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#D5EAE9] dark:border-[#263A3E] text-xs font-mono whitespace-pre-line text-[#173A43] dark:text-[#EDF3F4] leading-relaxed bg-white dark:bg-[#121D20] p-3 rounded-xl border">
                      {selectedMaterial.content}
                    </div>
                  </div>
                </div>
              ) : (
                cachedMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => setSelectedMaterial(mat)}
                    className="p-3.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] hover:border-[#00B8B0]/60 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center shrink-0">
                        {mat.subjectId.includes('phy') ? (
                          <Atom className="w-5 h-5" />
                        ) : mat.subjectId.includes('mat') ? (
                          <Calculator className="w-5 h-5" />
                        ) : (
                          <Compass className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
                          {mat.title}
                        </div>
                        <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA] mt-0.5">
                          {mat.description}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#00B8B0] shrink-0 ml-2">
                      Read →
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D5EAE9] dark:border-[#263A3E] bg-[#F5FAFA] dark:bg-[#0B1618] flex items-center justify-between text-xs">
          <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted local storage cache</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs rounded-full shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
