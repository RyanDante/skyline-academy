import React, { useState } from 'react';
import { skylerQuestions } from '@/data/skyler';
import { useAppStore } from '@/stores/appStore';
import { X, Sparkles, Compass, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SkylerQuizModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { updateProfile, setActiveTab } = useAppStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const currentQ = skylerQuestions[currentIdx];

  const handleSelect = (key: string) => {
    const newAnswers = { ...answers, [currentQ.id]: key };
    setAnswers(newAnswers);

    if (currentIdx < skylerQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCompleted(true);
      try {
        confetti({ particleCount: 75, spread: 60 });
      } catch (_) {}
    }
  };

  // Calculate scores
  const scoreTotals: Record<string, number> = {
    health: 0,
    engineering: 0,
    agriculture: 0,
    administration: 0,
    teaching: 0,
  };

  const selectedReasons: string[] = [];

  for (const q of skylerQuestions) {
    const chosenKey = answers[q.id];
    if (chosenKey) {
      const opt = q.options.find((o) => o.key === chosenKey);
      if (opt) {
        scoreTotals[opt.primary] = (scoreTotals[opt.primary] || 0) + 2;
        if (opt.secondary) {
          scoreTotals[opt.secondary] = (scoreTotals[opt.secondary] || 0) + 1;
        }
        if (opt.reason) selectedReasons.push(opt.reason);
      }
    }
  }

  // Find top sector
  const sortedSectors = Object.entries(scoreTotals).sort((a, b) => b[1] - a[1]);
  const topSector = sortedSectors[0] ? sortedSectors[0][0] : 'engineering';

  const sectorNames: Record<string, { title: string; schools: string; desc: string }> = {
    health: {
      title: 'Health Sciences & Medicine',
      schools: 'FHS Buea, FMSB Yaoundé I, FHS Bamenda, CUSS',
      desc: 'You have a natural orientation toward patient care, diagnostics, and biomedical sciences.',
    },
    engineering: {
      title: 'Engineering & Technology',
      schools: 'FET Buea, NAHPI Bamenda, Polytechnic (ENSPY), COT Buea, ENSET',
      desc: 'You love finding out how systems work and building lasting solutions to physical and digital problems.',
    },
    agriculture: {
      title: 'Agriculture, Vet & Environment',
      schools: 'FAVM Buea, FASA Dschang',
      desc: 'You thrive in applied biology, animal health, agronomy, and sustainable food production.',
    },
    administration: {
      title: 'Public Administration & Law',
      schools: 'ENAM Yaoundé, IRIC, ESSTIC',
      desc: 'You excel at organisation, public leadership, policy, and community structures.',
    },
    teaching: {
      title: 'Education & Technical Pedagogy',
      schools: 'ENS Yaoundé, ENS Maroua, ENSET Douala',
      desc: 'You have a gift for explaining concepts until everyone grasps them and guiding future generations.',
    },
  };

  const currentResult = sectorNames[topSector] || sectorNames.engineering;

  const handleApplyResult = () => {
    let pathway: any = 'engineering';
    if (topSector === 'health') pathway = 'health';
    else if (topSector === 'agriculture') pathway = 'agri-vet';

    updateProfile({ targetPathway: pathway });
    onClose();
    setActiveTab('concours');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-surface border border-line rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-skyler-soft/70 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-skyler text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-skyler">Skyler Diagnostic</div>
              <div className="text-[11px] text-muted">Concours & Career Pathway Finder</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface text-muted hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {!completed ? (
            <>
              {/* Question indicator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="font-semibold text-skyler">
                    Question {currentIdx + 1} of {skylerQuestions.length}
                  </span>
                  <span>{Math.round(((currentIdx + 1) / skylerQuestions.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                  <div
                    className="h-full bg-skyler transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / skylerQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Stem */}
              <div className="py-2">
                <h3 className="font-display font-bold text-sm text-ink leading-relaxed">
                  {currentQ.text}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleSelect(opt.key)}
                    className="w-full p-3.5 rounded-xl border border-line hover:border-skyler hover:bg-skyler-soft/30 text-left text-xs font-medium text-ink bg-surface transition-all flex items-start gap-3 group"
                  >
                    <span className="w-6 h-6 rounded-full bg-surface-alt group-hover:bg-skyler group-hover:text-white border border-line text-muted font-bold font-mono text-xs flex items-center justify-center shrink-0 transition-colors">
                      {opt.key}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{opt.text}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Result diagnosis */
            <div className="space-y-4 py-2 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-skyler text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-7 h-7 text-cyan" />
              </div>

              <div>
                <div className="text-xs font-bold text-skyler uppercase tracking-wider">
                  Top Recommended Pathway
                </div>
                <h2 className="font-display font-extrabold text-xl text-ink mt-1">
                  {currentResult.title}
                </h2>
                <p className="text-xs text-muted mt-2 max-w-sm mx-auto leading-relaxed">
                  {currentResult.desc}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-alt border border-line text-left space-y-2 text-xs">
                <div className="font-semibold text-ink">Cameroon Entrance Exams to Target:</div>
                <div className="font-medium text-brand-deep">{currentResult.schools}</div>

                {selectedReasons.length > 0 && (
                  <div className="pt-2 border-t border-line/60 text-[11px] text-muted">
                    Based on your preferences: you {selectedReasons.slice(0, 3).join(', and ')}.
                  </div>
                )}
              </div>

              <button
                onClick={handleApplyResult}
                className="w-full py-2.5 px-4 rounded-xl bg-skyler hover:bg-skyler/90 text-white font-display font-bold text-xs shadow-md transition-colors"
              >
                Set as My Concours Goal & View Readiness →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
