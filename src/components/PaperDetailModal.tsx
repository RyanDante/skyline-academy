import React, { useState } from 'react';
import type { Paper } from '@/types/models';
import { subjects, questions as allQuestions, solutions as allSolutions } from '@/data/seed';
import { useAppStore } from '@/stores/appStore';
import { MathRenderer } from './MathRenderer';
import { SolutionCard } from './SolutionCard';
import {
  X,
  Clock,
  Award,
  Download,
  FileCheck,
  Play,
  CheckCircle,
  FileText,
  Lock,
} from 'lucide-react';

interface PaperDetailModalProps {
  paper: Paper;
  onClose: () => void;
  onStartQuiz: (paperId: string) => void;
}

export const PaperDetailModal: React.FC<PaperDetailModalProps> = ({
  paper,
  onClose,
  onStartQuiz,
}) => {
  const { downloadedPaperIds, toggleDownloadPaper, profile, setShowPaywall } = useAppStore();
  const subject = subjects.find((s) => s.id === paper.subjectId);
  const isDownloaded = downloadedPaperIds.includes(paper.id);
  const [activeTab, setActiveTab] = useState<'questions' | 'solutions'>('questions');

  const paperQuestions = allQuestions.filter((q) => q.paperId === paper.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-surface border border-line rounded-2xl max-w-xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-surface-alt border-b border-line">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                {subject?.name} • GCE {subject?.level} Level
              </div>
              <h2 className="font-display font-extrabold text-lg text-ink">
                {paper.year} Paper {paper.paperNumber}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-surface text-muted hover:text-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap gap-2.5 mt-3 text-xs">
            <span className="flex items-center gap-1 text-muted bg-surface px-2.5 py-1 rounded-full border border-line">
              <Clock className="w-3.5 h-3.5 text-brand-deep" />
              <span>{paper.durationMinutes} mins</span>
            </span>
            <span className="flex items-center gap-1 text-muted bg-surface px-2.5 py-1 rounded-full border border-line">
              <Award className="w-3.5 h-3.5 text-accent-deep" />
              <span>{paper.totalMarks} Marks</span>
            </span>
            <span className="flex items-center gap-1 text-muted bg-surface px-2.5 py-1 rounded-full border border-line">
              <FileText className="w-3.5 h-3.5 text-brand" />
              <span>{paper.questionCount} Questions</span>
            </span>

            <button
              onClick={() => toggleDownloadPaper(paper.id)}
              className={`ml-auto flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                isDownloaded
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'bg-surface hover:bg-surface-alt text-muted border border-line'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloaded ? 'Downloaded Offline' : 'Save Offline'}</span>
            </button>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="px-5 py-3 bg-surface border-b border-line flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'questions'
                  ? 'bg-brand-deep text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Questions ({paperQuestions.length})
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'solutions'
                  ? 'bg-brand-deep text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Teacher Solutions
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onStartQuiz(paper.id);
            }}
            className="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-deep text-ink font-display font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Practice Paper</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {paperQuestions.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted">
              PDF scan is available for download. Interactive digitised questions for this session are coming next.
            </div>
          ) : activeTab === 'questions' ? (
            <div className="space-y-4">
              {paperQuestions.map((q) => (
                <div key={q.id} className="p-4 rounded-xl border border-line bg-surface space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-semibold text-brand-deep">
                      Question {q.label || q.order}
                    </span>
                    <span className="text-[11px] font-mono text-muted">{q.marks} Mark</span>
                  </div>

                  <div className="text-xs font-medium text-ink leading-relaxed">
                    <MathRenderer text={q.stem} />
                  </div>

                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.key}
                          className="p-2 rounded-lg bg-surface-alt border border-line text-xs flex items-start gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-surface border border-line text-[10px] font-bold flex items-center justify-center shrink-0">
                            {opt.key}
                          </span>
                          <span className="text-ink">
                            <MathRenderer text={opt.text} />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paperQuestions.map((q) => {
                const sol = allSolutions.find((s) => s.questionId === q.id);
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-line bg-surface space-y-2">
                    <div className="text-xs font-semibold text-brand-deep">
                      Question {q.label || q.order} Worked Solution
                    </div>
                    <div className="text-xs text-muted line-clamp-2">
                      <MathRenderer text={q.stem} />
                    </div>
                    {sol ? (
                      <SolutionCard solution={sol} onUnlockPass={() => setShowPaywall(true)} />
                    ) : (
                      <div className="text-xs text-muted italic">Solution being finalized.</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
