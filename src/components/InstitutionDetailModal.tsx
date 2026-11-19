import React from 'react';
import type { Institution } from '@/types/models';
import { useAppStore } from '@/stores/appStore';
import { computeReadiness, nextFocusTopic } from '@/domain/readiness';
import {
  X,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  MessageCircle,
  FileCheck,
  MapPin,
  Clock,
} from 'lucide-react';

interface InstitutionDetailModalProps {
  institution: Institution;
  onClose: () => void;
  onFocusTopic: (subjectId?: string, topicId?: string) => void;
}

export const InstitutionDetailModal: React.FC<InstitutionDetailModalProps> = ({
  institution,
  onClose,
  onFocusTopic,
}) => {
  const { attempts, setShowLeadModal } = useAppStore();

  const readiness = computeReadiness(institution, attempts);
  const readinessPercent = Math.round(readiness.score * 100);
  const focusTopic = nextFocusTopic(readiness);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-surface border border-line rounded-2xl max-w-xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-brand-deep/15 via-surface to-accent/10 border-b border-line">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-brand-deep font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{institution.city}, Cameroon</span>
              </div>
              <h2 className="font-display font-extrabold text-lg text-ink mt-0.5">
                {institution.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-surface text-muted hover:text-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Academic Readiness Gauge */}
          <div className="mt-4 p-4 rounded-xl bg-surface border border-line shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Academic Readiness Score
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-display font-extrabold text-3xl text-brand-deep">
                  {readinessPercent}%
                </span>
                <span className="text-xs text-muted">
                  based on {readiness.questionsAnswered} questions answered
                </span>
              </div>
              <p className="text-[11px] text-muted mt-1">
                Reflects preparation on syllabus requirements, not guaranteed admission.
              </p>
            </div>

            <div className="w-14 h-14 rounded-full border-4 border-line relative flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border-4 border-brand-deep border-t-transparent"
                style={{ transform: `rotate(${Math.round(readinessPercent * 3.6)}deg)` }}
              />
              <span className="font-mono text-xs font-bold text-brand-deep">
                {readinessPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Recommended Next Action */}
          {focusTopic && (
            <div className="p-3.5 rounded-xl bg-accent-soft border border-accent/30 flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-accent-deep flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Recommended Focus</span>
                </div>
                <div className="text-xs font-semibold text-ink">
                  Practise {focusTopic.name}
                </div>
                <div className="text-[11px] text-muted">
                  High weighting on this exam. Currently marked as {focusTopic.status}.
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onFocusTopic(undefined, focusTopic.topicId);
                }}
                className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-deep text-ink text-xs font-bold shrink-0 transition-colors shadow-xs"
              >
                Practise Now
              </button>
            </div>
          )}

          {/* Exam Details & Dates */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-surface-alt border border-line space-y-1">
              <div className="text-muted flex items-center gap-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-brand-deep" />
                <span>Exam Date</span>
              </div>
              <div className="font-bold text-ink">
                {institution.examDate || 'Late August (Projected)'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-alt border border-line space-y-1">
              <div className="text-muted flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-accent-deep" />
                <span>Application Deadline</span>
              </div>
              <div className="font-bold text-ink">
                {institution.applicationDeadline || 'Early August'}
              </div>
            </div>
          </div>

          {/* Requirements & Degree Programmes */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Programmes Offered
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {institution.programmes.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-surface-alt border border-line text-xs font-medium text-ink"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Syllabus Topics Readiness Breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Topic Weighting & Your Status
            </h3>
            <div className="space-y-1.5">
              {readiness.topics.map((t, idx) => {
                let badgeClass = 'bg-surface-alt text-muted border-line';
                let icon = <HelpCircle className="w-3 h-3 text-muted" />;

                if (t.status === 'strong') {
                  badgeClass = 'bg-success/15 text-success border-success/30';
                  icon = <CheckCircle2 className="w-3 h-3 text-success" />;
                } else if (t.status === 'weak') {
                  badgeClass = 'bg-danger/15 text-danger border-danger/30';
                  icon = <AlertTriangle className="w-3 h-3 text-danger" />;
                } else if (t.status === 'gap') {
                  badgeClass = 'bg-purple-500/15 text-purple-700 border-purple-500/30';
                  icon = <AlertTriangle className="w-3 h-3 text-purple-600" />;
                }

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-line bg-surface flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="font-medium text-ink">{t.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted">
                        {Math.round(t.weight * 100)}% weight
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border capitalize ${badgeClass}`}
                      >
                        {t.status === 'gap' ? 'Curriculum Gap' : t.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Non-academic sections (General knowledge, English, Interview) */}
          {readiness.nonAcademicSections.length > 0 && (
            <div className="p-3 rounded-xl bg-surface-alt border border-line space-y-1 text-xs">
              <div className="font-semibold text-ink">Also Tested on Entrance Exam:</div>
              <div className="text-muted">
                {readiness.nonAcademicSections.join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-alt border-t border-line flex items-center justify-between gap-3">
          <button
            onClick={() => setShowLeadModal(true, { target: institution.shortName, readinessScore: readiness.score })}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] transition-colors text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Ask Skyline Advisor on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
