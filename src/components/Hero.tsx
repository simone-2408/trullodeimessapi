import { asset } from '../utils/assets';
import { Pause, Play } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface HeroProps {
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [paused, setPaused] = useState(false);
  // Landscape desktops only ever show the central band of the portrait clip: serve a full-resolution
  // 4:3 crop there and the lighter 720p portrait encode everywhere else. Chosen client-side (SSR-safe).
  const [source, setSource] = useState<string>();
  useEffect(() => {
    const wide = window.matchMedia('(min-aspect-ratio: 4/3) and (min-width: 1024px)');
    const pick = () => setSource(asset(wide.matches ? 'media/pool-hero-wide.mp4' : 'media/pool-hero.mp4'));
    pick();
    wide.addEventListener('change', pick);
    return () => wide.removeEventListener('change', pick);
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => { if (visible && !document.hidden && !paused && !reduced.matches) video.play().catch(() => {}); else video.pause(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', sync); video.pause(); };
  }, [paused, source]);

  return (
    <div className="relative min-h-[90vh] lg:min-h-[95vh] flex items-center justify-center pt-32 sm:pt-36 lg:pt-40 pb-20 overflow-hidden">
      {/* 1. BACKGROUND MEDIA: Always-playing cinematic video in original inquadratura */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <video
          ref={videoRef}
          src={source}
          poster={asset('media/piscina/106724803-1024.webp')}
          muted
          loop
          playsInline
          preload="metadata" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Elegant Vignette Overlay for Contrast & Typography Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/40" />
      </div>

      <button type="button" onClick={() => setPaused(value => !value)} aria-label={lang === 'it' ? (paused ? 'Riprendi video' : 'Pausa video') : (paused ? 'Resume video' : 'Pause video')} className="absolute bottom-6 left-6 z-20 p-3 rounded-full bg-black/60 text-white">{paused ? <Play size={16} /> : <Pause size={16} />}</button>
      {/* 2. HERO EDITORIAL CONTENT (Minimal & Clean) */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-4">

        {/* Editorial Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.12] max-w-4xl mx-auto text-balance drop-shadow-lg tracking-tight">
          {t.hero.title}
        </h1>

        {t.hero.subtitle && (
          <p className="mt-6 text-base sm:text-xl md:text-2xl text-white/95 font-light max-w-2xl mx-auto leading-relaxed font-sans drop-shadow-md">
            {t.hero.subtitle}
          </p>
        )}
      </div>
    </div>
  );
};


