import { SiteLink } from './SiteLink';
import { SmartImage } from './SmartImage';
import React from 'react';
import { Language } from '../types';
import { AppRoute } from '../three/types';
import { ArrowRight } from 'lucide-react';

interface HomeDualPhotoSectionProps {
  lang: Language;
  onNavigate: (route: AppRoute) => void;
}

export const HomeDualPhotoSection: React.FC<HomeDualPhotoSectionProps> = ({
  lang,
  onNavigate,
}) => {
  return (
    <section className="w-full bg-white">
      {/* 1. Minimal Editorial Intro Header */}
      <div className="py-20 sm:py-28 text-center px-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B99470] font-semibold block mb-3">
          {lang === 'it' ? 'Benvenuti in Valle d’Itria' : 'Welcome to the Itria Valley'}
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-normal text-stone-900 leading-tight">
          {lang === 'it' ? 'Storia & natura' : 'History & nature'}
        </h2>
        <div className="w-12 h-[1.5px] bg-[#B99470]/60 mx-auto my-5" />
        <p className="text-sm sm:text-base text-stone-600 font-light max-w-xl mx-auto leading-relaxed">
          {lang === 'it'
            ? 'Scegli la tua dimora e scopri la Puglia'
            : 'Choose your residence and explore Puglia'}
        </p>
      </div>

      {/* 2. Sequential Full-Screen Visual Panoramas */}
      <div className="w-full flex flex-col">
        {/* Full-Screen Photo 1: I Trulli in pietra viva */}
        <SiteLink route="suites" lang={lang} onNavigate={onNavigate}
          className="group relative w-full h-[85vh] sm:h-screen min-h-[400px] sm:min-h-[580px] mobile-landscape-full-photo overflow-hidden bg-stone-950 cursor-pointer"
        >
          <SmartImage sizes="100vw"
            src="./images/quercia/IMG_3145.JPG"
            alt={lang === 'it' ? 'I trulli in pietra viva del Trullo dei Messapi' : 'The limestone trulli at Trullo dei Messapi'}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
            loading="lazy"
          />
          {/* Subtle Vignette & Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent group-hover:via-black/20 transition-colors duration-700" />

          {/* Full-Screen Caption Overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pb-16 sm:pb-20 lg:pb-24 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="max-w-2xl text-white">
                <span className="text-xs uppercase tracking-[0.25em] text-[#EAD8C0] font-medium block mb-2">
                  {lang === 'it' ? 'Architettura Rurale' : 'Rural Architecture'}
                </span>
                <h3 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight mb-3">
                  {lang === 'it' ? 'I coni in pietra viva' : 'The ancient stone cones'}
                </h3>
                <p className="text-white/85 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-xl">
                  {lang === 'it'
                    ? 'Tre dimore indipendenti custodite da spesse mura in calce e pietra locale, per un riposo fresco e protetto.'
                    : 'Three independent suites embraced by thick stone walls and white lime, for cool, authentic quiet.'}
                </p>
              </div>

              <div className="shrink-0">
                <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-white/15 hover:bg-[#B99470] backdrop-blur-md border border-white/25 hover:border-[#B99470] text-white text-sm font-serif tracking-wider transition-all duration-300 shadow-xl group-hover:scale-105">
                  <span>{lang === 'it' ? 'Scopri le dimore' : 'Explore the suites'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </SiteLink>

        {/* Piccolo spazio bianco tra le foto */}
        <div className="w-full h-12 sm:h-20 bg-white" />

        {/* Full-Screen Photo 2: La Piscina tra gli ulivi */}
        <SiteLink route="piscina" lang={lang} onNavigate={onNavigate}
          className="group relative w-full h-[85vh] sm:h-screen min-h-[400px] sm:min-h-[580px] mobile-landscape-full-photo overflow-hidden bg-stone-950 cursor-pointer"
        >
          <SmartImage sizes="100vw"
            src="./images/piscina/106724803.jpg"
            alt={lang === 'it' ? 'La piscina tra gli ulivi del Trullo dei Messapi' : 'The pool among olive trees at Trullo dei Messapi'}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
            loading="lazy"
          />
          {/* Subtle Vignette & Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent group-hover:via-black/20 transition-colors duration-700" />

          {/* Full-Screen Caption Overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pb-16 sm:pb-20 lg:pb-24 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="max-w-2xl text-white">
                <span className="text-xs uppercase tracking-[0.25em] text-[#EAD8C0] font-medium block mb-2">
                  {lang === 'it' ? 'Acqua & Silenzio' : 'Water & Silence'}
                </span>
                <h3 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight mb-3">
                  {lang === 'it' ? 'Uno specchio d’acqua tra ulivi e piante mediterranee' : 'A mirror of water among olive trees and Mediterranean plants'}
                </h3>
                <p className="text-white/85 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-xl">
                  {lang === 'it'
                    ? 'Un’oasi di puro benessere con idromassaggio e spazi dedicati in esclusiva agli ospiti delle dimore.'
                    : 'An oasis of pure wellbeing, with hydromassage and spaces reserved exclusively for guests of the residences.'}
                </p>
              </div>

              <div className="shrink-0">
                <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-white/15 hover:bg-[#B99470] backdrop-blur-md border border-white/25 hover:border-[#B99470] text-white text-sm font-serif tracking-wider transition-all duration-300 shadow-xl group-hover:scale-105">
                  <span>{lang === 'it' ? 'Scopri l’area relax' : 'Explore the pool'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </SiteLink>
      </div>
    </section>
  );
};
