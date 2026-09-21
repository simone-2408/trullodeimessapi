import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ACCOMMODATIONS } from '../data/accommodations';
import { Calendar, Users, ArrowRight } from 'lucide-react';

interface HeroProps {
  lang: Language;
  onQuickSearch: (params: {
    checkIn?: string;
    checkOut?: string;
    accommodationId?: 'quercia' | 'corbezzolo' | 'melograno';
  }) => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onQuickSearch }) => {
  const t = TRANSLATIONS[lang];
  const [selectedSuite, setSelectedSuite] = useState<
    'quercia' | 'corbezzolo' | 'melograno'
  >('quercia');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch({
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      accommodationId: selectedSuite,
    });
  };

  return (
    <div className="relative min-h-[95vh] flex items-center justify-center pt-32 sm:pt-36 lg:pt-40 pb-20 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/50" />
      </div>

      {/* 2. HERO EDITORIAL CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-2">
        {/* Understated Location Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#EAD8C0] text-xs font-semibold tracking-[0.25em] uppercase mb-5">
          <span>
            {lang === 'it'
              ? 'Relais di Puglia • Ceglie Messapica'
              : 'Boutique Relais • Puglia'}
          </span>
        </div>

        {/* Editorial Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.12] mb-5 max-w-4xl mx-auto text-balance drop-shadow-md">
          {t.hero.title}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto mb-10 leading-relaxed font-sans drop-shadow-sm">
          {t.hero.subtitle}
        </p>

        {/* Bianco Pietra Luxury Booking Bar (Torre Coccaro style) */}
        <div className="max-w-4xl mx-auto bg-[#F7F4EE]/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(20,15,10,0.6)] border border-[#E2DDD3] text-[#332F2A]">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end text-left"
          >
            {/* Suite selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
                <Users size={13} className="text-[#B99470]" />
                {lang === 'it' ? 'Alloggio' : 'Suite'}
              </label>
              <select
                value={selectedSuite}
                onChange={(e) => setSelectedSuite(e.target.value as any)}
                className="w-full bg-[#EFECE5]/90 border border-[#DDD7CC] rounded-xl px-3 py-2.5 text-sm font-medium text-[#332F2A] focus:outline-none focus:ring-2 focus:ring-[#B99470]"
              >
                {ACCOMMODATIONS.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (max {acc.capacityMax} pax)
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#B99470]" />
                Check-In
              </label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-[#EFECE5]/90 border border-[#DDD7CC] rounded-xl px-3 py-2.5 text-sm font-medium text-[#332F2A] focus:outline-none focus:ring-2 focus:ring-[#B99470]"
              />
            </div>

            {/* Check-Out */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#B99470]" />
                Check-Out
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-[#EFECE5]/90 border border-[#DDD7CC] rounded-xl px-3 py-2.5 text-sm font-medium text-[#332F2A] focus:outline-none focus:ring-2 focus:ring-[#B99470]"
              />
            </div>

            {/* Submit CTA */}
            <div>
              <button
                type="submit"
                className="w-full bg-[#B99470] hover:bg-[#A37E5A] text-white py-2.5 px-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{lang === 'it' ? 'Verifica' : 'Check'}</span>
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </form>

          <div className="mt-3 pt-2.5 border-t border-[#E8E3D9] flex flex-wrap items-center justify-between text-[11px] text-stone-500 px-1">
            <span>
              {lang === 'it'
                ? 'Miglior tariffa garantita • Prenotazione diretta senza commissioni'
                : 'Best rate guaranteed • Direct booking without commission fees'}
            </span>
            <span className="hidden sm:inline text-gray-400">
              {lang === 'it'
                ? 'Accordi personalizzati direttamente con Antonella'
                : 'Direct contact with owner Antonella'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

