import React, { useState } from 'react';
import { Accommodation, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  Users,
  Maximize2,
  Bed,
  Bath,
  Images,
  Calendar,
  Waves,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
} from 'lucide-react';
import { FullscreenLightbox } from './FullscreenLightbox';

interface AccommodationCardProps {
  accommodation: Accommodation;
  lang: Language;
  index?: number;
  onOpenDetails: (acc: Accommodation) => void;
  onSelectForQuote: (id: 'quercia' | 'corbezzolo' | 'melograno') => void;
}

export const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
  lang,
  index = 0,
  onOpenDetails,
  onSelectForQuote,
}) => {
  const t = TRANSLATIONS[lang];
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const isReversed = index % 2 === 1;

  // Editorial subtitles / index titles
  const editorialIndexLabels = {
    quercia: {
      it: '01 / 03 — LA SUITE PADRONALE',
      en: '01 / 03 — THE MASTER SUITE',
    },
    corbezzolo: {
      it: '02 / 03 — LA LAMIA VISTA PISCINA',
      en: '02 / 03 — POOLSIDE LAMIA & PATIO',
    },
    melograno: {
      it: '03 / 03 — IL RIFUGIO ROMANTICO',
      en: '03 / 03 — THE ROMANTIC STONE RETREAT',
    },
  };

  const currentLabel =
    editorialIndexLabels[accommodation.id as keyof typeof editorialIndexLabels]?.[
      lang
    ] || `0${index + 1} / 03`;

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) =>
      prev === 0 ? accommodation.gallery.length - 1 : prev - 1
    );
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) =>
      prev === accommodation.gallery.length - 1 ? 0 : prev + 1
    );
  };

  // Preview thumbnails (first 5 photos)
  const previewPhotos = accommodation.gallery.slice(0, 5);

  return (
    <section
      id={`suite-${accommodation.id}`}
      className="w-full bg-[#FAF7F2] border-y border-[#EBE4D8] overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[560px] lg:min-h-[660px] xl:min-h-[720px]">
        {/* ==================================================== */}
        {/* PHOTO COLUMN: 50% EDGE-TO-EDGE FULL BLEED */}
        {/* ==================================================== */}
        <div
          className={`relative w-full min-h-[420px] sm:min-h-[500px] lg:min-h-[640px] xl:min-h-[720px] bg-stone-900 overflow-hidden group ${
            isReversed ? 'order-1 lg:order-2' : 'order-1 lg:order-1'
          }`}
        >
          {/* Main Active Image */}
          <img
            src={accommodation.gallery[activePhotoIndex]}
            alt={`${accommodation.name} - foto ${activePhotoIndex + 1}`}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
          />

          {/* Subtle Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Center Hover Fullscreen Cue */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/20 shadow-xl scale-95 group-hover:scale-100 transition-transform">
              <Maximize2 size={14} className="text-[#B99470]" />
              <span>{lang === 'it' ? 'Clicca per schermo intero' : 'Click for fullscreen'}</span>
            </div>
          </div>

          {/* Top Gallery Button with Fullscreen Cue */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-end pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="bg-white/90 hover:bg-white text-stone-800 text-xs font-medium px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md transition-all flex items-center gap-1.5 hover:scale-105 cursor-pointer"
              title={lang === 'it' ? 'Apri a schermo intero' : 'Open fullscreen'}
            >
              <Maximize2 size={13} className="text-[#B99470]" />
              <span>
                {accommodation.gallery.length} {t.accommodations.photosCount} • {lang === 'it' ? 'Schermo Intero' : 'Fullscreen'} ↗
              </span>
            </button>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
            aria-label="Foto precedente"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
            aria-label="Foto successiva"
          >
            <ChevronRight size={22} />
          </button>

          {/* Bottom Thumbnails Strip */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex items-end justify-between pointer-events-auto">
            <div className="flex items-center gap-2 overflow-x-auto max-w-[80%] pb-1 scrollbar-none">
              {previewPhotos.map((photoUrl, pIdx) => {
                const isActive = activePhotoIndex === pIdx;
                const isLastThumbnail =
                  pIdx === 4 && accommodation.gallery.length > 5;

                return (
                  <button
                    key={pIdx}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLastThumbnail) {
                        setIsLightboxOpen(true);
                      } else {
                        setActivePhotoIndex(pIdx);
                      }
                    }}
                    className={`relative shrink-0 w-12 h-9 sm:w-16 sm:h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#B99470] scale-105 shadow-md'
                        : 'border-white/50 opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {isLastThumbnail && (
                      <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-bold">
                        +{accommodation.gallery.length - 4}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1.5 rounded-full shrink-0 shadow-md">
              {activePhotoIndex + 1} / {accommodation.gallery.length}
            </span>
          </div>
        </div>

        {/* ==================================================== */}
        {/* TEXT COLUMN: EDITORIAL WHITESPACE & HIGHLIGHTS */}
        {/* ==================================================== */}
        <div
          className={`w-full bg-[#FAF7F2] flex flex-col justify-center p-8 sm:p-12 lg:p-14 xl:p-20 2xl:p-24 ${
            isReversed ? 'order-2 lg:order-1' : 'order-2 lg:order-2'
          }`}
        >
          <div
            className={`w-full max-w-xl mx-auto ${
              isReversed ? 'lg:ml-auto lg:mr-0' : 'lg:mr-auto lg:ml-0'
            }`}
          >
            {/* Editorial Index Eyebrow */}
            <div className="flex items-center gap-2 mb-2.5">
              <span className="h-[1px] w-6 bg-[#B99470]" />
              <span className="text-xs uppercase tracking-[0.22em] text-[#B99470] font-bold">
                {currentLabel}
              </span>
            </div>

            {/* Suite Title */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 leading-[1.15] tracking-tight">
              {accommodation.name}
            </h2>

            {/* Poetic Tagline */}
            <blockquote className="mt-3.5 font-serif italic text-base sm:text-lg text-[#786C5E] font-normal leading-snug border-l-2 border-[#D6C7B2] pl-3.5">
              "{accommodation.tagline[lang]}"
            </blockquote>

            {/* Architectural Description */}
            <p className="mt-4 text-sm sm:text-base text-stone-600 font-light leading-relaxed">
              {accommodation.description[lang]}
            </p>

            {/* Architectural Specifications Ribbon */}
            <div className="mt-6 bg-[#F2EDE4]/75 border border-[#E5E0D5] rounded-2xl p-3.5 sm:p-4 grid grid-cols-4 gap-2 text-center divide-x divide-[#E5E0D5]">
              <div className="px-1">
                <Maximize2 size={16} className="mx-auto text-[#B99470] mb-1" />
                <span className="block text-xs sm:text-sm font-bold text-stone-800 font-serif">
                  {accommodation.sqm} m²
                </span>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                  {t.accommodations.sqm}
                </span>
              </div>
              <div className="px-1">
                <Users size={16} className="mx-auto text-[#B99470] mb-1" />
                <span className="block text-xs sm:text-sm font-bold text-stone-800 font-serif">
                  {accommodation.capacityStandard} - {accommodation.capacityMax}
                </span>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                  {t.accommodations.guests}
                </span>
              </div>
              <div className="px-1">
                <Bed size={16} className="mx-auto text-[#B99470] mb-1" />
                <span className="block text-xs sm:text-sm font-bold text-stone-800 font-serif">
                  {accommodation.bedroomsCount}
                </span>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                  {t.accommodations.bedrooms}
                </span>
              </div>
              <div className="px-1">
                <Bath size={16} className="mx-auto text-[#B99470] mb-1" />
                <span className="block text-xs sm:text-sm font-bold text-stone-800 font-serif">
                  {accommodation.bathroomsCount}
                </span>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                  {t.accommodations.bathrooms}
                </span>
              </div>
            </div>

            {/* Curated Highlights */}
            <div className="mt-6 space-y-2.5">
              {accommodation.features[lang].slice(0, 4).map((feat, fIdx) => (
                <div
                  key={fIdx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700"
                >
                  <span className="w-4 h-4 rounded-full bg-[#B99470]/15 text-[#B99470] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className="font-light">{feat}</span>
                </div>
              ))}

              {/* Shared Pool Guarantee */}
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#4A5645] font-medium pt-1">
                <span className="w-4 h-4 rounded-full bg-[#4A5645]/15 text-[#4A5645] flex items-center justify-center shrink-0">
                  <Waves size={11} />
                </span>
                <span>{t.accommodations.sharedPoolIncluded}</span>
              </div>
            </div>

            {/* Pricing & CTAs */}
            <div className="mt-8 pt-6 border-t border-[#EAE3D7] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 block font-medium">
                  {t.accommodations.fromPrice}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
                    {accommodation.startingPrice}€
                  </span>
                  <span className="text-xs text-stone-500 font-light">
                    / {t.accommodations.perNight}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  {t.accommodations.directBooking}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  onClick={() => onOpenDetails(accommodation)}
                  className="px-4 py-3 rounded-xl sm:rounded-2xl border border-[#D5CCC0] bg-white hover:bg-[#F3EDE4] text-stone-800 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer hover:border-[#B99470]"
                >
                  <Images size={15} className="text-[#B99470]" />
                  <span>
                    {t.accommodations.viewAllPhotosAndDetails} ({accommodation.gallery.length})
                  </span>
                </button>

                <button
                  onClick={() => onSelectForQuote(accommodation.id)}
                  className="px-5 py-3 rounded-xl sm:rounded-2xl bg-[#B99470] hover:bg-[#A37E5A] text-white font-medium text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group/btn"
                >
                  <Calendar size={15} />
                  <span>{t.accommodations.selectForQuote}</span>
                  <ArrowRight
                    size={14}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Fullscreen Lightbox Modal */}
      <FullscreenLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={accommodation.gallery}
        initialIndex={activePhotoIndex}
        title={accommodation.name}
        subtitle={accommodation.badge[lang]}
        lang={lang}
      />
    </section>
  );
};
