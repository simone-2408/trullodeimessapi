import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { POOL_DATA } from '../data/accommodations';
import { Waves, Sparkles, Check, Images, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PoolSectionProps {
  lang: Language;
}

export const PoolSection: React.FC<PoolSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const pool = POOL_DATA;
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  return (
    <section id="piscina" className="py-20 sm:py-28 bg-[#F3EDE3]/60 relative overflow-hidden">
      {/* Decorative subtle background elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#B99470]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-[#4A5645]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B99470]/15 text-[#8A6743] text-xs font-bold uppercase tracking-widest mb-3">
            <Waves size={14} />
            <span>{t.pool.sectionTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {pool.title[lang]}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 font-light leading-relaxed">
            {pool.subtitle[lang]}
          </p>
        </div>

        {/* Feature Grid: Interactive Visuals on Left + Highlights on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12">
          {/* Main Large Hero Image */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group aspect-[4/3]">
              <img
                src={pool.gallery[0]}
                alt="Piscina con Idromassaggio Trullo dei Messapi"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Float badge */}
              <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end text-white">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#DFD0B8] font-semibold block">
                    {lang === 'it' ? 'Oasi di Quiete' : 'Quiet Oasis'}
                  </span>
                  <h4 className="font-serif text-xl sm:text-2xl font-bold drop-shadow">
                    {lang === 'it' ? 'Piscina & Angolo Idromassaggio' : 'Pool & Hydromassage Jacuzzi'}
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setActivePhotoIdx(0);
                    setIsGalleryOpen(true);
                  }}
                  className="bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5"
                >
                  <Images size={14} className="text-[#B99470]" />
                  <span>{lang === 'it' ? 'Guarda 9 foto' : 'View 9 photos'}</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {pool.gallery.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActivePhotoIdx(idx + 1);
                    setIsGalleryOpen(true);
                  }}
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md border-2 border-white cursor-pointer group"
                >
                  <img
                    src={img}
                    alt={`Piscina ${idx + 2}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Description and Highlights List */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-7 sm:p-8 rounded-3xl shadow-xl border border-[#E7D7C1]/50">
              <span className="inline-block px-3 py-1 bg-[#4A5645]/10 text-[#4A5645] text-xs font-semibold rounded-full mb-3">
                {lang === 'it' ? 'Condivisa per le sole 3 dimore' : 'Shared exclusively for 3 suites'}
              </span>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">
                {lang === 'it' ? 'Il cuore del vostro benessere' : 'The heart of your wellbeing'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {pool.description[lang]}
              </p>

              <div className="space-y-3.5">
                {pool.highlights[lang].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#B99470]/20 text-[#8A6743] flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm text-gray-700 leading-snug">{item}</span>
                  </div>
                ))}
              </div>

              {/* Note badge */}
              <div className="mt-8 pt-5 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500">
                <Sparkles size={16} className="text-[#B99470] shrink-0" />
                <span>
                  {lang === 'it'
                    ? 'Teli piscina in morbida spugna forniti in dotazione per ogni ospite.'
                    : 'Complimentary plush pool towels provided for all staying guests.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pool Photo Lightbox Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors z-50"
          >
            <X size={24} />
          </button>

          <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center">
            <div className="relative w-full aspect-[16/10] max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
              <img
                src={pool.gallery[activePhotoIdx]}
                alt="Piscina Trullo dei Messapi"
                className="w-full h-full object-contain"
              />

              <button
                onClick={() =>
                  setActivePhotoIdx((prev) =>
                    prev === 0 ? pool.gallery.length - 1 : prev - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() =>
                  setActivePhotoIdx((prev) =>
                    prev === pool.gallery.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white"
              >
                <ChevronRight size={24} />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-1.5 rounded-full text-white text-xs font-mono">
                {activePhotoIdx + 1} / {pool.gallery.length}
              </div>
            </div>

            {/* Thumbnails below */}
            <div className="flex gap-2 mt-4 overflow-x-auto max-w-full pb-2">
              {pool.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    activePhotoIdx === idx
                      ? 'border-[#B99470] scale-105'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
