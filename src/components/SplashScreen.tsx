import React, { useState } from 'react';
import { SkylineLogo } from './brand/SkylineLogo';
import { ArrowRight, BookOpen, Compass, GraduationCap, X } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: 'Your Exams. Your Future. Your Pathway.',
      subtitle:
        'Everything you need to prepare for GCE, explore career opportunities and achieve your dreams.',
      tagline: 'Dream • Plan • Achieve',
      image: '/assets/aistudio/2._Onboarding_-_welcome_fb7c7964.png',
      features: [
        { icon: BookOpen, label: 'Past Questions & Answers', bg: 'bg-[#00B8B0]/15 text-[#00B8B0]' },
        { icon: Compass, label: 'Career Guidance', bg: 'bg-[#FF8A00]/15 text-[#FF8A00]' },
        { icon: GraduationCap, label: 'Expert Tutors', bg: 'bg-[#00B8B0]/15 text-[#00B8B0]' },
      ],
    },
    {
      title: 'Prepare Smarter with Skyline',
      subtitle:
        'Access past questions and answers for O & A Level, get help from AI Tutors, and discover top Concours.',
      tagline: 'Learn • Prepare • Rise',
      image: '/assets/aistudio/1._Splash_Screen_846059eb.png',
      features: [
        { icon: BookOpen, label: 'Download Papers', bg: 'bg-[#00B8B0]/15 text-[#00B8B0]' },
        { icon: Compass, label: 'Concours Readiness', bg: 'bg-[#FF8A00]/15 text-[#FF8A00]' },
        { icon: GraduationCap, label: 'Teacher Worked Solutions', bg: 'bg-[#00B8B0]/15 text-[#00B8B0]' },
      ],
    },
  ];

  const current = slides[slide];

  return (
    <div className="fixed inset-0 z-50 bg-[#F5FAFA] flex flex-col justify-between overflow-y-auto max-w-md mx-auto shadow-2xl animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="p-4 pt-6 flex items-center justify-between">
        <SkylineLogo size="md" />
        <button
          onClick={onDismiss}
          className="text-xs font-bold text-[#00B8B0] hover:text-[#087F7A] px-3 py-1.5 rounded-full bg-[#00B8B0]/10 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="px-6 py-2 space-y-4">
        {/* Headings */}
        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-2xl text-[#173A43] leading-tight">
            {current.title.split('. ').map((part, i) => (
              <span key={i} className={i === 2 ? 'text-[#FF8A00] block' : 'block'}>
                {part}{i < 2 ? '.' : ''}
              </span>
            ))}
          </h1>
          <p className="text-xs text-[#55737B] leading-relaxed">
            {current.subtitle}
          </p>
        </div>

        {/* 3 Pills Feature row */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {current.features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-2.5 rounded-2xl bg-white border border-[#D5EAE9] flex flex-col items-center text-center shadow-xs space-y-1.5"
              >
                <div className={`w-8 h-8 rounded-xl ${feat.bg} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#173A43] leading-tight line-clamp-2">
                  {feat.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Graphic / Image Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-[#D5EAE9] shadow-md bg-gradient-to-b from-[#00B8B0]/20 to-[#00B8B0]/5 h-64 flex items-center justify-center">
          <img
            src={current.image}
            alt="Skyline Students"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full border border-[#00B8B0]/30 shadow-xs">
            <span className="text-[11px] font-bold text-[#FF8A00] italic font-display">
              {current.tagline}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-6 pt-2 pb-8 flex items-center justify-between gap-4">
        {/* Pagination Dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === slide ? 'w-6 bg-[#00B8B0]' : 'w-2 bg-[#D5EAE9]'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        {slide < slides.length - 1 ? (
          <button
            onClick={() => setSlide((prev) => prev + 1)}
            className="px-6 py-3 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onDismiss}
            className="px-7 py-3 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
