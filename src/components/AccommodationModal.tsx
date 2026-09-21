import React, { useState } from 'react';
import { Accommodation, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Users,
  Bed,
  Bath,
  Check,
  Calendar,
  Sparkles,
  Wifi,
  Waves,
  Utensils,
  Flame,
  Sun,
  Shield,
  Coffee,
} from 'lucide-react';
import { FullscreenLightbox } from './FullscreenLightbox';

interface AccommodationModalProps {
  accommodation: Accommodation | null;
  lang: Language;
  onClose: () => void;
  onSelectForQuote: (id: 'quercia' | 'corbezzolo' | 'melograno') => void;
}

export const AccommodationModal: React.FC<AccommodationModalProps> = ({
  accommodation,
  lang,
  onClose,
  onSelectForQuote,
}) => {
  if (!accommodation) return null;

  const t = TRANSLATIONS[lang];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? accommodation.gallery.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === accommodation.gallery.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-white/20 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B99470] font-semibold block">
              {accommodation.badge[lang]}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {accommodation.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Main Photo Gallery Slider */}
          <div
            className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[16/10] sm:aspect-[16/9] shadow-inner group cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              src={accommodation.gallery[currentImageIndex]}
              alt={`${accommodation.name} photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]"
            />

            {/* Center Hover Fullscreen Cue */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border border-white/20 shadow-xl scale-95 group-hover:scale-100 transition-transform">
                <Maximize2 size={14} className="text-[#B99470]" />
                <span>{lang === 'it' ? 'Clicca per schermo intero' : 'Click for fullscreen'}</span>
              </div>
            </div>

            {/* Top-Right Fullscreen Button */}
            <div className="absolute top-3 right-3 z-10 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer border border-white/15 hover:border-[#B99470] shadow-md hover:scale-105"
              >
                <Maximize2 size={13} className="text-[#B99470]" />
                <span>{lang === 'it' ? 'Schermo intero' : 'Fullscreen'}</span>
              </button>
            </div>

            {/* Prev / Next controls */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-md z-10 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all shadow-md z-10 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>

            {/* Photo Counter Pill */}
            <div className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-mono">
              {currentImageIndex + 1} / {accommodation.gallery.length}
            </div>
          </div>

          {/* Thumbnails strip */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {accommodation.gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                  currentImageIndex === idx
                    ? 'border-[#B99470] scale-105 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E7D7C1]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#B99470] shadow-sm">
                <Maximize2 size={20} />
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase block font-medium">Superficie</span>
                <span className="font-semibold text-gray-800">{accommodation.sqm} mq</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#B99470] shadow-sm">
                <Users size={20} />
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase block font-medium">Capacità</span>
                <span className="font-semibold text-gray-800">
                  {accommodation.capacityStandard} - {accommodation.capacityMax} Ospiti
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#B99470] shadow-sm">
                <Bed size={20} />
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase block font-medium">Camere</span>
                <span className="font-semibold text-gray-800">{accommodation.bedroomsCount} Camere</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#B99470] shadow-sm">
                <Bath size={20} />
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase block font-medium">Bagni</span>
                <span className="font-semibold text-gray-800">{accommodation.bathroomsCount} con Doccia</span>
              </div>
            </div>
          </div>

          {/* Description & Bedding */}
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-[#B99470]" />
              {lang === 'it' ? 'Descrizione dell’Alloggio' : 'Suite Overview'}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              {accommodation.description[lang]}
            </p>
            <div className="mt-3 p-3 bg-amber-50/60 rounded-xl text-xs sm:text-sm text-amber-900 border border-amber-200/50">
              <strong>{lang === 'it' ? 'Disposizione letti:' : 'Bed arrangements:'}</strong>{' '}
              {accommodation.bedsDescription[lang]}
            </div>
          </div>

          {/* Complete Feature List */}
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">
              {t.accommodations.modalFeatures}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accommodation.features[lang].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Included Amenities Badges */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              {lang === 'it' ? 'Servizi & Comfort Inclusi' : 'Included Amenities'}
            </h4>
            <div className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-medium text-gray-700">
                <Wifi size={14} className="text-[#B99470]" /> Wi-Fi Gratuito
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-medium text-gray-700">
                <Waves size={14} className="text-[#B99470]" /> Piscina & Jacuzzi Condivisa
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-medium text-gray-700">
                <Utensils size={14} className="text-[#B99470]" /> Cucina Attrezzata
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-medium text-gray-700">
                <Coffee size={14} className="text-[#B99470]" /> Macchina Caffè & Bollitore
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-medium text-gray-700">
                <Flame size={14} className="text-[#B99470]" /> Camino in Pietra
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-medium text-gray-700">
                <Sun size={14} className="text-[#B99470]" /> Terrazza / Patio Privato
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-medium text-gray-700">
                <Shield size={14} className="text-[#B99470]" /> Cassaforte & Parcheggio
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-500 block">{t.accommodations.fromPrice}</span>
            <span className="text-2xl font-bold font-serif text-[#B99470]">
              {accommodation.startingPrice}€
            </span>
            <span className="text-xs text-gray-500"> /{t.accommodations.perNight}</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {t.accommodations.modalClose}
            </button>
            <button
              onClick={() => {
                onClose();
                onSelectForQuote(accommodation.id);
              }}
              className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-[#B99470] hover:bg-[#A37E5A] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar size={16} />
              <span>{lang === 'it' ? 'Prenota Questa Dimora' : 'Book this Suite'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* True Fullscreen Lightbox */}
      <FullscreenLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={accommodation.gallery}
        initialIndex={currentImageIndex}
        title={accommodation.name}
        subtitle={accommodation.badge[lang]}
        lang={lang}
      />
    </div>
  );
};
