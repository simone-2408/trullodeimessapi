import React, { useState } from 'react';
import { Language } from '../types';
import { AppRoute } from '../three/types';
import { TRANSLATIONS } from '../data/translations';
import { POOL_DATA } from '../data/accommodations';
import {
  Waves,
  Sun,
  ShieldCheck,
  Sparkles,
  Check,
  Images,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { FullscreenLightbox } from './FullscreenLightbox';

interface PoolSectionProps {
  lang: Language;
  onNavigate?: (route: AppRoute) => void;
}

export const PoolSection: React.FC<PoolSectionProps> = ({
  lang,
  onNavigate,
}) => {
  const t = TRANSLATIONS[lang];
  const pool = POOL_DATA;

  // Lightbox modal state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [modalPhotoIdx, setModalPhotoIdx] = useState(0);

  // In-place interactive slider
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const openLightbox = (idx: number) => {
    setModalPhotoIdx(idx);
    setIsGalleryOpen(true);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) =>
      prev === 0 ? pool.gallery.length - 1 : prev - 1
    );
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) =>
      prev === pool.gallery.length - 1 ? 0 : prev + 1
    );
  };

  const previewPhotos = pool.gallery.slice(0, 5);

  return (
    <div className="w-full bg-white">
      {/* ==================================================== */}
      {/* 1. CLEAN, MINIMAL EDITORIAL HEADER (CENTERED) */}
      {/* ==================================================== */}
      <div className="pt-10 sm:pt-14 pb-8 sm:pb-12 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B99470] font-bold block mb-2.5">
          {t.pool.sectionTag}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-stone-900 leading-[1.1] tracking-tight">
          {pool.title[lang]}
        </h1>
        <p className="mt-3.5 text-base sm:text-lg text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
          {pool.subtitle[lang]}
        </p>
      </div>

      {/* ==================================================== */}
      {/* 2. IMMAGINE A TUTTO SCHERMO: 106724803.jpg */}
      {/* ==================================================== */}
      <div className="w-full h-[65vh] sm:h-[80vh] lg:h-[90vh] mobile-landscape-full-photo relative overflow-hidden bg-stone-900 cursor-pointer group"
        onClick={() => openLightbox(2)}
      >
        <img
          src="./images/piscina/106724803.jpg"
          alt="Piscina e Trullo dei Messapi al tramonto"
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Floating Hint with Fullscreen Action */}
        <div className="absolute bottom-6 right-6 pointer-events-auto flex items-center gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openLightbox(2);
            }}
            className="bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-xs px-4 py-2.5 rounded-full font-medium border border-white/20 hover:border-[#B99470] transition-all flex items-center gap-2 cursor-pointer shadow-xl hover:scale-105"
          >
            <Maximize2 size={14} className="text-[#B99470]" />
            <span>{lang === 'it' ? 'Schermo intero' : 'Fullscreen'}</span>
          </button>
          <span className="hidden sm:inline-block bg-black/50 backdrop-blur-md text-white/90 text-xs px-4 py-2 rounded-full font-light border border-white/15">
            {lang === 'it' ? 'Tenuta Trullo dei Messapi • Oasi al tramonto' : 'Trullo dei Messapi Estate • Twilight Oasis'}
          </span>
        </div>
      </div>

      {/* Spazio bianco di respiro */}
      <div className="w-full h-12 sm:h-20 bg-white" />

      {/* ==================================================== */}
      {/* 3. IL SINGOLO BLOCCO 50/50 EDGE-TO-EDGE PISCINA & JACUZZI */}
      {/* ==================================================== */}
      <section className="w-full bg-[#FAF7F2] border-y border-[#EBE4D8] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[460px] lg:min-h-[660px] xl:min-h-[720px]">
          {/* PHOTO COLUMN: 50% FULL BLEED LEFT */}
          <div className="relative w-full min-h-[320px] sm:min-h-[460px] lg:min-h-[640px] xl:min-h-[720px] mobile-landscape-photo-container bg-stone-900 overflow-hidden group order-1 lg:order-1">
            {/* Main Active Image */}
            <img
              src={pool.gallery[activePhotoIdx]}
              alt={`Piscina e idromassaggio - foto ${activePhotoIdx + 1}`}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out cursor-pointer"
              onClick={() => openLightbox(activePhotoIdx)}
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
                  openLightbox(activePhotoIdx);
                }}
                className="bg-white/90 hover:bg-white text-stone-800 text-xs font-medium px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md transition-all flex items-center gap-1.5 hover:scale-105 cursor-pointer"
                title={lang === 'it' ? 'Apri a schermo intero' : 'Open fullscreen'}
              >
                <Maximize2 size={13} className="text-[#B99470]" />
                <span>
                  {pool.gallery.length} {lang === 'it' ? 'foto' : 'photos'} • {lang === 'it' ? 'Schermo Intero' : 'Fullscreen'} ↗
                </span>
              </button>
            </div>

            {/* Carousel Arrows */}
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
                  const isActive = activePhotoIdx === pIdx;
                  const isLastThumbnail = pIdx === 4 && pool.gallery.length > 5;

                  return (
                    <button
                      key={pIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLastThumbnail) {
                          openLightbox(pIdx);
                        } else {
                          setActivePhotoIdx(pIdx);
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
                          +{pool.gallery.length - 4}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1.5 rounded-full shrink-0 shadow-md">
                {activePhotoIdx + 1} / {pool.gallery.length}
              </span>
            </div>
          </div>

          {/* TEXT COLUMN: 50% RIGHT WITH EDITORIAL WHITESPACE */}
          <div className="w-full bg-[#FAF7F2] flex flex-col justify-center p-8 sm:p-12 lg:p-14 xl:p-20 2xl:p-24 order-2 lg:order-2">
            <div className="w-full max-w-xl mx-auto lg:mr-auto lg:ml-0">
              {/* Editorial Eyebrow */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="h-[1px] w-6 bg-[#B99470]" />
                <span className="text-xs uppercase tracking-[0.22em] text-[#B99470] font-bold">
                  {lang === 'it' ? 'IL CUORE DEL VOSTRO BENESSERE' : 'THE HEART OF YOUR WELLBEING'}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 leading-[1.15] tracking-tight">
                {lang === 'it'
                  ? 'Piscina a sfioro e idromassaggio tra gli ulivi'
                  : 'Infinity pool & jacuzzi among olive groves'}
              </h2>

              {/* Poetic Tagline */}
              <blockquote className="mt-3.5 font-serif italic text-base sm:text-lg text-[#786C5E] font-normal leading-snug border-l-2 border-[#D6C7B2] pl-3.5">
                "{lang === 'it'
                  ? 'Un’oasi di pura quiete dove l’acqua limpida, il sole della Puglia e il silenzio cancellano ogni tensione.'
                  : 'A sanctuary of stillness where clear water, Apulian sunshine, and deep silence wash all tension away.'}"
              </blockquote>

              {/* Story Description */}
              <p className="mt-4 text-sm sm:text-base text-stone-600 font-light leading-relaxed">
                {pool.description[lang]}
              </p>

              {/* Specifications Ribbon */}
              <div className="mt-6 bg-[#F2EDE4]/75 border border-[#E5E0D5] rounded-2xl p-3.5 sm:p-4 grid grid-cols-4 gap-2 text-center divide-x divide-[#E5E0D5]">
                <div className="px-1">
                  <Waves size={16} className="mx-auto text-[#B99470] mb-1" />
                  <span className="block text-xs sm:text-sm font-bold text-stone-800 font-serif">
                    12 × 6 m
                  </span>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                    {lang === 'it' ? 'Piscina' : 'Pool'}
                  </span>
                </div>
                <div className="px-1">
                  <Sun size={16} className="mx-auto text-[#B99470] mb-1" />
                  <span className="block text-xs sm:text-sm font-bold text-stone-800 font-serif">
                    Jacuzzi
                  </span>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                    {lang === 'it' ? 'Idromassaggio' : 'Hydromassage'}
                  </span>
                </div>
                <div className="px-1">
                  <ShieldCheck size={16} className="mx-auto text-[#B99470] mb-1" />
                  <span className="block text-xs sm:text-sm font-bold text-stone-800 font-serif">
                    {lang === 'it' ? '3 Dimore' : '3 Suites'}
                  </span>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                    {lang === 'it' ? 'Solo Ospiti' : 'Private'}
                  </span>
                </div>
                <div className="px-1">
                  <Sparkles size={16} className="mx-auto text-[#B99470] mb-1" />
                  <span className="block text-xs sm:text-sm font-bold text-stone-800 font-serif">
                    {lang === 'it' ? 'Inclusi' : 'Included'}
                  </span>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                    {lang === 'it' ? 'Teli Spugna' : 'Towels'}
                  </span>
                </div>
              </div>

              {/* Curated Highlights */}
              <div className="mt-6 space-y-2.5">
                {pool.highlights[lang].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#B99470]/15 text-[#B99470] flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="font-light">{item}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-[#EAE3D7] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => openLightbox(0)}
                  className="px-5 py-3.5 rounded-xl sm:rounded-2xl border border-[#D5CCC0] bg-white hover:bg-[#F3EDE4] text-stone-800 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:border-[#B99470]"
                >
                  <Images size={15} className="text-[#B99470]" />
                  <span>
                    {lang === 'it'
                      ? `Guarda tutte le foto (${pool.gallery.length})`
                      : `View all photos (${pool.gallery.length})`}
                  </span>
                </button>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate('suites')}
                    className="px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#B99470] hover:bg-[#A37E5A] text-white font-medium text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group/btn"
                  >
                    <span>
                      {lang === 'it' ? 'Scopri le 3 Dimore' : 'Explore the 3 Suites'}
                    </span>
                    <ArrowRight
                      size={14}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spazio bianco di respiro finale */}
      <div className="w-full h-16 sm:h-24 bg-white" />

      {/* ==================================================== */}
      {/* 4. FULL PHOTO LIGHTBOX MODAL (TRUE FULLSCREEN) */}
      {/* ==================================================== */}
      <FullscreenLightbox
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={pool.gallery}
        initialIndex={modalPhotoIdx}
        title={pool.title[lang]}
        subtitle={pool.subtitle[lang]}
        lang={lang}
      />
    </div>
  );
};
