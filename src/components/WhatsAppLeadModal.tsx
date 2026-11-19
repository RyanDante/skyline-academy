import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { X, Send, MessageCircle, CheckCircle } from 'lucide-react';

export const WhatsAppLeadModal: React.FC = () => {
  const { showLeadModal, setShowLeadModal, leadContext, profile } = useAppStore();
  const [studentName, setStudentName] = useState(profile.name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile.phone || '+237 6');
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!showLeadModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const targetInfo = leadContext?.target ? `Target: ${leadContext.target}` : `Target: Concours Prep`;
    const readinessInfo = leadContext?.readinessScore !== undefined ? `Readiness: ${Math.round(leadContext.readinessScore * 100)}%` : '';
    const message = encodeURIComponent(
      `Hello Skyline Academy,\nMy name is ${studentName}. I am a student at ${profile.schoolName} preparing for Cameroon GCE and Concours.\n${targetInfo} ${readinessInfo}\nMy question: ${question || 'I would like to inquire about admission requirements and coaching.'}`
    );

    // Give a nice confirmation feedback before opening or simulating
    setTimeout(() => {
      window.open(`https://wa.me/237671000000?text=${message}`, '_blank');
      setShowLeadModal(false);
      setSubmitted(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setShowLeadModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted hover:text-ink hover:bg-surface-alt transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
            <MessageCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-ink">Talk to Skyline Academy</h3>
            <p className="text-xs text-muted">Direct WhatsApp advice with a Cameroonian Concours teacher</p>
          </div>
        </div>

        {leadContext?.target && (
          <div className="mb-4 p-2.5 rounded-lg bg-surface-alt border border-line text-xs">
            <span className="text-muted">Target Institution: </span>
            <span className="font-semibold text-brand-deep">{leadContext.target}</span>
            {leadContext.readinessScore !== undefined && (
              <span className="ml-2 font-medium text-ink">
                (Current Readiness: {Math.round(leadContext.readinessScore * 100)}%)
              </span>
            )}
          </div>
        )}

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-success mx-auto animate-bounce" />
            <h4 className="font-bold text-sm text-ink">Opening WhatsApp...</h4>
            <p className="text-xs text-muted">Connecting you to Skyline teacher admissions support.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-alt border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-brand-deep"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">WhatsApp Phone Number</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 bg-surface-alt border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-brand-deep"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">How can our teachers help you?</label>
              <textarea
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="E.g. What are the cutoff marks for FHS Buea or FET? How do I prepare for Physics Paper 2?"
                className="w-full px-3 py-2 bg-surface-alt border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-brand-deep resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] transition-colors text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Connect on WhatsApp</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
