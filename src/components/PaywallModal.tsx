import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { X, Check, Sparkles, KeyRound, Smartphone, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaywallModal: React.FC = () => {
  const { showPaywall, setShowPaywall, redeemCode, activateMobileMoneyPass } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<'season' | 'subject' | 'week'>('season');
  const [accessCode, setAccessCode] = useState('');
  const [codeFeedback, setCodeFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [paymentPhone, setPaymentPhone] = useState('671234567');
  const [operator, setOperator] = useState<'mtn' | 'orange'>('mtn');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!showPaywall) return null;

  const PLANS = [
    {
      id: 'season' as const,
      name: 'Season Pass',
      price: '7 500 FCFA',
      period: 'full season until 31 July',
      badge: 'Best value',
      benefits: [
        'All O & A Level subjects and papers included',
        'Complete worked teacher marking schemes (M1, A1, B1)',
        'Unlimited AI Tutor queries and problem solving',
        'Concours academic readiness and gap diagnostic',
      ],
    },
    {
      id: 'subject' as const,
      name: 'One Subject Pass',
      price: '2 000 FCFA',
      period: 'per chosen subject',
      benefits: [
        'All past papers and teacher answers for 1 subject',
        'Topic mastery tests and review solutions',
        'Valid for the full academic year',
      ],
    },
    {
      id: 'week' as const,
      name: 'Exam Week Pass',
      price: '1 000 FCFA',
      period: '7 days intensive access',
      benefits: [
        'Full access across all subjects for 7 days',
        'Ideal for final mock and revision weeks',
      ],
    },
  ];

  const currentPlanObj = PLANS.find((p) => p.id === selectedPlan) || PLANS[0];

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    const res = redeemCode(accessCode);
    if (res.success) {
      setCodeFeedback({ type: 'success', text: res.message });
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch (_) {}
      setTimeout(() => setShowPaywall(false), 1500);
    } else {
      setCodeFeedback({ type: 'error', text: res.message });
    }
  };

  const handleMobileMoney = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      activateMobileMoneyPass(paymentPhone, operator);
      try {
        confetti({ particleCount: 80, spread: 70 });
      } catch (_) {}
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#F5FAFA] border border-[#D5EAE9] rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setShowPaywall(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#55737B] hover:text-[#173A43] hover:bg-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center mb-2.5 shadow-xs">
            <Sparkles className="w-6 h-6 text-[#FF8A00]" />
          </div>
          <h2 className="font-display font-extrabold text-xl text-[#173A43]">
            Upgrade Your Learning
          </h2>
          <p className="text-xs text-[#55737B] mt-1 max-w-xs mx-auto">
            Select a plan to unlock all teacher solutions and pass the GCE with confidence.
          </p>
        </div>

        {/* Visual Plan Comparison (Section 10) */}
        <div className="px-5 space-y-2.5">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-2 border-[#00B8B0] bg-white shadow-xs'
                    : 'border-[#D5EAE9] bg-white/70 hover:bg-white'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 right-4 bg-[#FF8A00] text-white font-display font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-[#00B8B0] bg-[#00B8B0]'
                          : 'border-[#55737B]/40 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-[#173A43]">
                        {plan.name}
                      </h4>
                      <span className="text-[10px] text-[#55737B] font-mono">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <div className="font-display font-extrabold text-sm text-[#00B8B0]">
                    {plan.price}
                  </div>
                </div>

                {isSelected && (
                  <ul className="mt-2.5 pt-2 border-t border-[#D5EAE9] space-y-1 text-[11px] text-[#173A43]">
                    {plan.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#00B8B0] shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Payment & Code Section */}
        <div className="p-5 space-y-3.5">
          {/* Mobile Money */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#173A43] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#00B8B0]" />
                <span>Mobile Money (Cameroon)</span>
              </span>
              <span className="text-[11px] text-[#55737B]">Instant unlock</span>
            </div>

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
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
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
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                Orange Money
              </button>
            </div>

            <div className="flex gap-2">
              <div className="px-3.5 py-2.5 bg-white border border-[#D5EAE9] rounded-2xl text-xs font-semibold text-[#55737B] flex items-center">
                +237
              </div>
              <input
                type="tel"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                placeholder="6XX XXX XXX"
                className="flex-1 px-3.5 py-2.5 bg-white border border-[#D5EAE9] rounded-2xl text-xs text-[#173A43] font-medium focus:outline-none focus:border-[#00B8B0]"
              />
            </div>

            {/* Main Payment Action Button in Orange as requested */}
            <button
              onClick={handleMobileMoney}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-full bg-[#FF8A00] hover:bg-[#D97200] transition-all text-white font-display font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Prompting USSD on phone...</span>
                </>
              ) : (
                <>
                  <span>Pay {currentPlanObj.price} & Activate</span>
                </>
              )}
            </button>
          </div>

          {/* Access Code Redeem Box */}
          <div className="pt-3 border-t border-[#D5EAE9] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#173A43]">
              <KeyRound className="w-3.5 h-3.5 text-[#00B8B0]" />
              <span>Have an Access Code?</span>
            </div>
            <form onSubmit={handleRedeem} className="flex gap-2">
              <input
                type="text"
                placeholder="SKYLINE-DEMO"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-[#D5EAE9] rounded-xl text-xs font-mono font-semibold uppercase text-[#173A43] focus:outline-none focus:border-[#00B8B0]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs rounded-full shadow-xs transition-colors"
              >
                Redeem
              </button>
            </form>
            {codeFeedback && (
              <div
                className={`text-[11px] p-2 rounded-xl font-semibold ${
                  codeFeedback.type === 'success'
                    ? 'text-[#087F7A] bg-[#00B8B0]/15'
                    : 'text-[#EF4444] bg-[#FEE2E2]'
                }`}
              >
                {codeFeedback.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
