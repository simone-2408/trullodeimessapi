import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface HeroProps {
  lang: Language;
  onQuickSearch?: (params: {
    checkIn?: string;
    checkOut?: string;
    accommodationId?: 'quercia' | 'corbezzolo' | 'melograno';
  }) => void;
}

export const Hero: React.FC<HeroProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Video plays continuously, always muted, in loop (like Masseria Torre Coccaro)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Retry muted playback if browser policy initially intercepted
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  return (
    <div className="relative min-h-[90vh] lg:min-h-[95vh] flex items-center justify-center pt-32 sm:pt-36 lg:pt-40 pb-20 overflow-hidden">
      {/* 1. BACKGROUND MEDIA: Always-playing cinematic video in original inquadratura */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <video
          ref={videoRef}
          src="./videopiscina.mp4"
          poster="./images/piscina/106724803.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Elegant Vignette Overlay for Contrast & Typography Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/50" />
      </div>

      {/* 2. HERO EDITORIAL CONTENT (Minimal & Clean) */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-4">
        {/* Understated Location Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#EAD8C0] text-xs font-semibold tracking-[0.25em] uppercase mb-6 shadow-sm">
          <span>
            {lang === 'it'
              ? 'Relais di Puglia • Ceglie Messapica'
              : 'Boutique Relais • Puglia'}
          </span>
        </div>

        {/* Editorial Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.12] mb-6 max-w-4xl mx-auto text-balance drop-shadow-lg tracking-tight">
          {t.hero.title}
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-white/95 font-light max-w-2xl mx-auto leading-relaxed font-sans drop-shadow-md">
          {t.hero.subtitle}
        </p>
      </div>
    </div>
  );
};


