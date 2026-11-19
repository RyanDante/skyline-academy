import React from 'react';
import type { Solution } from '@/types/models';
import { MathRenderer } from './MathRenderer';
import { CheckCircle2, AlertTriangle, Lock, Award } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface SolutionCardProps {
  solution: Solution;
  onUnlockPass?: () => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution, onUnlockPass }) => {
  const { profile, setShowPaywall } = useAppStore();
  const hasPass = profile.plan === 'pass';
  const isLocked = solution.tier === 'pass' && !hasPass;

  return (
    <div className="mt-4 border border-line rounded-xl overflow-hidden bg-surface shadow-sm">
      {/* Teacher Header Bar */}
      <div className="px-4 py-2.5 bg-surface-alt border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-deep text-white flex items-center justify-center font-display text-xs font-bold">
            {solution.author.initials}
          </div>
          <div>
            <div className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <span>{solution.author.name}</span>
              <span className="text-[10px] bg-brand/10 text-brand-deep font-medium px-1.5 py-0.5 rounded">
                {solution.author.subject}
              </span>
            </div>
            <div className="text-[11px] text-muted">Official Teacher Marking Scheme</div>
          </div>
        </div>

        {solution.tier === 'pass' && !hasPass && (
          <span className="text-[11px] font-medium text-accent-deep bg-accent/15 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" /> Season Pass
          </span>
        )}
      </div>

      {/* Steps with "Marking Pen" Script Style */}
      <div className="p-4 space-y-3.5">
        {solution.steps.map((step, idx) => {
          // If locked and not first step, obscure it
          const stepLocked = isLocked && idx > 0;

          if (stepLocked) {
            return (
              <div
                key={idx}
                className="p-3 rounded-lg border border-dashed border-line bg-bg/60 text-center space-y-1.5"
              >
                <div className="flex items-center justify-center gap-1 text-xs text-muted font-medium">
                  <Lock className="w-3.5 h-3.5 text-accent-deep" />
                  <span>Step {idx + 1} locked in Free Mode</span>
                </div>
                <p className="text-xs text-muted">
                  Unlock all worked solution steps with the Season Pass.
                </p>
                <button
                  type="button"
                  onClick={() => (onUnlockPass ? onUnlockPass() : setShowPaywall(true))}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent-deep hover:underline pt-1"
                >
                  Unlock full solution →
                </button>
              </div>
            );
          }

          return (
            <div key={idx} className="relative pl-3.5 border-l-2 border-accent/70 space-y-1">
              <div className="text-xs text-ink leading-relaxed">
                <span className="font-semibold text-brand-deep mr-1.5">Step {idx + 1}:</span>
                <MathRenderer text={step.body} />
              </div>

              {step.working && (
                <div className="bg-bg/90 rounded-md p-2 font-mono text-xs text-brand-deep border border-line/60">
                  <MathRenderer text={step.working} />
                </div>
              )}

              {/* Examiner mark codes: M1, A1, B1 */}
              {step.markPoints && step.markPoints.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {step.markPoints.map((mp, mIdx) => (
                    <span
                      key={mIdx}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-accent-deep bg-accent/10 px-2 py-0.5 rounded border border-accent/20"
                    >
                      <span className="font-bold text-accent">✓ {mp.code}</span>
                      <span className="text-muted text-[10px] font-sans">({mp.text})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Final Answer */}
        <div className="pt-2 border-t border-line/70 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-ink">Final Answer: </span>
            <span className="font-bold text-brand-deep">
              <MathRenderer text={solution.finalAnswer} />
            </span>
          </div>
        </div>

        {/* Common Slip / Examiner Trap Warning */}
        {solution.commonSlip && (
          <div className="p-2.5 rounded-lg bg-accent-soft/70 border border-accent/30 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-accent-deep shrink-0 mt-0.5" />
            <div className="text-xs text-ink">
              <span className="font-semibold text-accent-deep">Examiner Trap / Common Slip: </span>
              {solution.commonSlip}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
