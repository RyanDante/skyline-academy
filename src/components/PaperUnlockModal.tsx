import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { X, Lock, CheckCircle2, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaperUnlockModalProps {
  paperId: string;
  paperTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export const PaperUnlockModal: React.FC<PaperUnlockModalProps> = ({
  paperId,
  paperTitle,
  isOpen,
  onClose,
  onUnlocked,
}) => {
  const { profile, setShowPaywall } = useAppStore();
  const [operator, setOperator] = useState<'mtn' | 'orange'>('mtn');
  const [phone, setPhone] = useState('671234567');
  const [isProcessing, setIsProcessing] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setUnlocked(true);
      try {
        confetti({ particleCount: 50, spread: 50 });
      } catch (_) {}
      setTimeout(() => {
        onUnlocked();
        onClose();
      }, 1000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#F5FAFA] border border-[#D5EAE9] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#55737B] hover:text-[#173A43] hover:bg-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center">
            <Lock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="font-display font-extrabold text-lg text-[#173A43]">
            Unlock Proposed Answers
          </h3>
          <p className="text-xs text-[#55737B]">
            {paperTitle} • Official Skyline Teacher Solution
          </p>
        </div>

        {unlocked ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#00B8B0] mx-auto animate-bounce" />
            <h4 className="font-display font-bold text-sm text-[#173A43]">
              Paper Answers Unlocked!
            </h4>
            <p className="text-xs text-[#55737B]">Opening in-app solution viewer...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Price Box */}
            <div className="p-3 rounded-2xl bg-white border border-[#D5EAE9] flex items-center justify-between shadow-xs">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#55737B]">
                  Single Paper Unlock
                </div>
                <div className="text-xs font-semibold text-[#173A43]">
                  View full marking scheme in-app
                </div>
              </div>
              <div className="font-display font-extrabold text-lg text-[#FF8A00]">
                100 FCFA
              </div>
            </div>

            {/* Operator selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOperator('mtn')}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  operator === 'mtn'
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-900 font-bold shadow-xs'
                    : 'border-[#D5EAE9] bg-white text-[#55737B]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                MTN MoMo
              </button>
              <button
                type="button"
                onClick={() => setOperator('orange')}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  operator === 'orange'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-900 font-bold shadow-xs'
                    : 'border-[#D5EAE9] bg-white text-[#55737B]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Orange Money
              </button>
            </div>

            {/* Phone */}
            <div className="flex gap-2">
              <div className="px-3 py-2 bg-white border border-[#D5EAE9] rounded-xl text-xs font-semibold text-[#55737B] flex items-center">
                +237
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="6XX XXX XXX"
                className="flex-1 px-3 py-2 bg-white border border-[#D5EAE9] rounded-xl text-xs text-[#173A43] font-medium focus:outline-none focus:border-[#00B8B0]"
              />
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-3 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay 100 FCFA & Unlock</span>
                </>
              )}
            </button>

            {/* Or Season Pass */}
            <div className="pt-2 border-t border-[#D5EAE9] text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setShowPaywall(true);
                }}
                className="text-xs font-semibold text-[#FF8A00] hover:underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Season Pass (All Papers Unlocked) →</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
