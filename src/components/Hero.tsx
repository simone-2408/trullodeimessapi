import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ACCOMMODATIONS } from '../data/accommodations';
import { Calendar, Users, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

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
    <div className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Image with warm overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/trulli/106730545.jpg"
          alt="Trullo dei Messapi - Panoramica Trulli e Giardino"
          className="w-full h-full object-cover object-center scale-105 animate-fade-in filter brightness-90"
        />
        {/* Gradients to ensure perfect readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E2226] via-black/45 to-black/60" />
        <div className="absolute inset-0 bg-[#B99470]/10 mix-blend-overlay" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-8 md:mt-12">
        {/* Luxury pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium tracking-wider uppercase mb-6 text-[#DFD0B8]">
          <Sparkles size={14} className="text-[#B99470]" />
          <span>{t.hero.tag}</span>
        </div>

        {/* Grand luxury headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.15] mb-6 max-w-5xl mx-auto text-balance">
          {t.hero.title}
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto mb-10 leading-relaxed font-sans">
          {t.hero.subtitle}
        </p>

        {/* Quick Booking Engine Bar */}
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 text-[#1E2226] mb-12">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end text-left">
            {/* Suite selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Users size={14} className="text-[#B99470]" />
                {lang === 'it' ? 'Alloggio' : 'Suite'}
              </label>
              <select
                value={selectedSuite}
                onChange={(e) => setSelectedSuite(e.target.value as any)}
                className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#B99470]"
              >
                {ACCOMMODATIONS.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.capacityMax} pax)
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#B99470]" />
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
                <Calendar size={14} className="text-[#B99470]" />
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
                className="w-full bg-[#B99470] hover:bg-[#A37E5A] text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{lang === 'it' ? 'Calcola Prezzo' : 'Get Quote'}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500 px-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              {lang === 'it'
                ? 'Nessun pagamento online richiesto • Prenotazione diretta'
                : 'No online payment required • Direct booking inquiry'}
            </span>
            <span className="hidden sm:inline text-gray-400">
              {lang === 'it' ? 'Miglior tariffa garantita senza commissioni' : 'Best rate guaranteed without fees'}
            </span>
          </div>
        </div>

        {/* Quick Features Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          <div className="bg-black/35 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#B99470]/20 flex items-center justify-center text-[#DFD0B8] font-serif text-lg font-bold">
              3
            </div>
            <div>
              <h4 className="text-white font-medium text-sm sm:text-base">{t.hero.stats.units}</h4>
              <p className="text-white/60 text-xs">{t.hero.stats.unitsSub}</p>
            </div>
          </div>

          <div className="bg-black/35 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#B99470]/20 flex items-center justify-center text-[#DFD0B8] font-serif text-lg font-bold">
              ≈
            </div>
            <div>
              <h4 className="text-white font-medium text-sm sm:text-base">{t.hero.stats.pool}</h4>
              <p className="text-white/60 text-xs">{t.hero.stats.poolSub}</p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-black/35 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#B99470]/20 flex items-center justify-center text-[#DFD0B8] font-serif text-lg font-bold">
              ★
            </div>
            <div>
              <h4 className="text-white font-medium text-sm sm:text-base">5.0 / 5.0 Rating</h4>
              <p className="text-white/60 text-xs">{lang === 'it' ? 'Ospitalità & Relax' : 'Hospitality & Serenity'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
