import React, { useState } from 'react';
import { SkylineLogo } from '../brand/SkylineLogo';
import { X, Phone, Lock, Eye, EyeOff, User as UserIcon, Check } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { updateProfile, pushNotification } = useAppStore();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [phone, setPhone] = useState('671234567');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('Brenda N.');
  const [nickname, setNickname] = useState('Brenda');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && !agreed) {
      setFeedback('Please accept the Terms of Service to continue.');
      return;
    }

    const studentName = name.trim() || 'Student';

    updateProfile({
      name: studentName,
      phone: `+237 ${phone.trim()}`,
    });

    // Notify user of successful sign in/up
    pushNotification({
      title: mode === 'signin' ? `Welcome back, ${studentName}! 👋` : `Account Created, ${studentName}! 🎉`,
      message:
        mode === 'signin'
          ? 'You are signed in. Your GCE study streaks, offline cached papers, and teacher answers are ready.'
          : 'Welcome to Skyline Academy! Offline past papers and formula sheets have been saved to your device.',
      type: 'signin',
      actionTab: 'home',
    });

    setFeedback('Successfully signed in! Welcome back.');
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#F5FAFA] dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#55737B] hover:text-[#173A43] dark:hover:text-[#EDF3F4] hover:bg-white dark:hover:bg-[#1A282C] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <SkylineLogo size="md" />
        </div>

        {/* Heading */}
        <div className="text-center mb-5">
          <h2 className="font-display font-extrabold text-xl text-[#173A43] dark:text-[#EDF3F4]">
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-[#55737B] dark:text-[#A8B6BA] mt-0.5">
            {mode === 'signin'
              ? 'Sign in to access your offline past papers and study streak.'
              : 'Get started with Cameroon GCE prep in seconds.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#00B8B0] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] text-xs text-[#173A43] dark:text-[#EDF3F4] placeholder-[#55737B]/70 focus:outline-none focus:border-[#00B8B0]"
                  required
                />
              </div>

              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#00B8B0] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] text-xs text-[#173A43] dark:text-[#EDF3F4] placeholder-[#55737B]/70 focus:outline-none focus:border-[#00B8B0]"
                  required
                />
              </div>
            </>
          )}

          {/* Phone */}
          <div className="relative">
            <Phone className="w-4 h-4 text-[#00B8B0] absolute left-3.5 top-3.5" />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] text-xs text-[#173A43] dark:text-[#EDF3F4] placeholder-[#55737B]/70 focus:outline-none focus:border-[#00B8B0]"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="w-4 h-4 text-[#00B8B0] absolute left-3.5 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] text-xs text-[#173A43] dark:text-[#EDF3F4] placeholder-[#55737B]/70 focus:outline-none focus:border-[#00B8B0]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-[#55737B] dark:text-[#A8B6BA] hover:text-[#173A43]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {mode === 'signin' ? (
            <div className="text-right">
              <button
                type="button"
                onClick={() => alert('Demo credentials: use any phone number and password to sign in')}
                className="text-[11px] font-semibold text-[#00B8B0] hover:underline"
              >
                Need help signing in?
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 text-[11px] text-[#55737B] dark:text-[#A8B6BA] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#00B8B0] focus:ring-[#00B8B0]"
              />
              <span>
                I agree to the <strong className="text-[#00B8B0]">Terms of Service</strong> and{' '}
                <strong className="text-[#00B8B0]">Privacy Policy</strong>
              </span>
            </label>
          )}

          {feedback && (
            <div className="p-2 rounded-xl bg-[#00B8B0]/15 text-[#087F7A] dark:text-[#6ECDD0] text-[11px] font-semibold text-center">
              {feedback}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs shadow-md transition-all mt-2 active:scale-95"
          >
            {mode === 'signin' ? 'Sign In & Sync' : 'Create Account'}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-4 pt-3 border-t border-[#D5EAE9] dark:border-[#263A3E] text-center text-xs text-[#55737B] dark:text-[#A8B6BA]">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="font-bold text-[#00B8B0] hover:underline ml-1"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="font-bold text-[#00B8B0] hover:underline ml-1"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
