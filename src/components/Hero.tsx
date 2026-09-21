import React, { useState } from 'react';
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
  const [selectedSuite, setSelectedSuite] = useState<'quercia' | 'corbezzolo' | 'melograno'>('quercia');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch({
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      accommodationId: selectedSuite,
    });
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 overflow-hidden">
      {/* Background Photography: Gazebo & Piscina */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/piscina/106724803.jpg"
          alt="Trullo dei Messapi - Piscina con Gazebo e Ulivi"
          className="w-full h-full object-cover object-center scale-100 filter brightness-[0.92]"
        />
        {/* Warm, transparent vignette for optimal text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/40" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-4">
        {/* Understated Location Tag */}
        <span className="inline-block text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-[#DFD0B8] mb-4 drop-shadow-sm">
          {t.hero.tag}
        </span>

        {/* Elegant Editorial Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.12] mb-6 max-w-4xl mx-auto text-balance drop-shadow-md">
          {t.hero.title}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto mb-10 leading-relaxed font-sans drop-shadow-sm">
          {t.hero.subtitle}
        </p>

        {/* Clean Luxury Booking Bar */}
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E8DEC8]/60 text-[#2C2926]">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end text-left">
            {/* Suite selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Users size={13} className="text-[#B99470]" />
                {lang === 'it' ? 'Alloggio' : 'Suite'}
              </label>
              <select
                value={selectedSuite}
                onChange={(e) => setSelectedSuite(e.target.value as any)}
                className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B99470]"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#B99470]" />
                Check-In
              </label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B99470]"
              />
            </div>

            {/* Check-Out */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#B99470]" />
                Check-Out
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B99470]"
              />
            </div>

            {/* Submit CTA */}
            <div>
              <button
                type="submit"
                className="w-full bg-[#B99470] hover:bg-[#A37E5A] text-white py-2.5 px-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{lang === 'it' ? 'Verifica' : 'Check'}</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 px-1">
            <span>
              {lang === 'it'
                ? 'Prenotazione diretta senza commissioni intermediari'
                : 'Direct booking without booking commissions'}
            </span>
            <span className="hidden sm:inline text-gray-400">
              {lang === 'it'
                ? 'Accordi di caparra e saldo direttamente con Antonella'
                : 'Personal arrangements directly with Antonella'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
