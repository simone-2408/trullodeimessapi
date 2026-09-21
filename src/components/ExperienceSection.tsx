import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { HeartHandshake, UtensilsCrossed, Trees, SunMedium, Sparkles } from 'lucide-react';

interface ExperienceSectionProps {
  lang: Language;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section id="esperienza" className="py-20 sm:py-28 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B99470]/15 text-[#8A6743] text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles size={14} />
            <span>{t.experience.sectionTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {t.experience.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 font-light leading-relaxed">
            {t.experience.subtitle}
          </p>
        </div>

        {/* 4 Storytelling Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Card 1: Antonella */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E7D7C1]/50 flex flex-col justify-between hover:shadow-xl transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B99470]/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#B99470]/30 flex items-center justify-center text-[#B99470] mb-6 shadow-sm">
                <HeartHandshake size={28} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">
                {t.experience.card1Title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {t.experience.card1Desc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-semibold text-[#B99470] uppercase tracking-wider">
              {lang === 'it' ? 'Ospitalità sincera & riservata' : 'Genuine & thoughtful hospitality'}
            </div>
          </div>

          {/* Card 2: Self-Catering & Kitchen */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E7D7C1]/50 flex flex-col justify-between hover:shadow-xl transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4A5645]/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#4A5645]/30 flex items-center justify-center text-[#4A5645] mb-6 shadow-sm">
                <UtensilsCrossed size={28} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">
                {t.experience.card2Title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {t.experience.card2Desc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-semibold text-[#4A5645] uppercase tracking-wider">
              {lang === 'it' ? 'Massima libertà nei vostri orari' : 'Total freedom on your schedule'}
            </div>
          </div>

          {/* Card 3: Estate Olive Oil */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E7D7C1]/50 flex flex-col justify-between hover:shadow-xl transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B99470]/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#B99470]/30 flex items-center justify-center text-[#B99470] mb-6 shadow-sm">
                <SunMedium size={28} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">
                {t.experience.card3Title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {t.experience.card3Desc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-semibold text-[#B99470] uppercase tracking-wider">
              {lang === 'it' ? 'Sapori e profumi del territorio' : 'Authentic taste of Apulian terroir'}
            </div>
          </div>

          {/* Card 4: Peace & Nature */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E7D7C1]/50 flex flex-col justify-between hover:shadow-xl transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4A5645]/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#4A5645]/30 flex items-center justify-center text-[#4A5645] mb-6 shadow-sm">
                <Trees size={28} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">
                {t.experience.card4Title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {t.experience.card4Desc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-semibold text-[#4A5645] uppercase tracking-wider">
              {lang === 'it' ? 'Silenzio, stelle e macchia mediterranea' : 'Silence, starlight & Mediterranean nature'}
            </div>
          </div>
        </div>

        {/* Visual Callout Quote */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#1E2226] text-white p-8 sm:p-12 md:p-16 text-center">
          <div className="absolute inset-0 opacity-25">
            <img
              src="./images/giardino/106725339.jpg"
              alt="Giardino e Chianche Trullo dei Messapi"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="font-serif text-4xl sm:text-5xl text-[#B99470] block mb-2 leading-none">“</span>
            <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl italic font-normal leading-relaxed text-[#FAF8F5]">
              {lang === 'it'
                ? 'Un piccolo paradiso terrestre dove fermare il tempo, ascoltare la natura e ritrovare la bellezza autentica delle cose semplici.'
                : 'A small earthly paradise to pause time, listen to nature, and rediscover the authentic beauty of simple moments.'}
            </blockquote>
            <p className="mt-6 text-xs uppercase tracking-widest text-[#DFD0B8] font-semibold">
              Antonella • Trullo dei Messapi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
