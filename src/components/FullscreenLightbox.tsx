import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '../types';

interface FullscreenLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
  subtitle?: string;
  lang?: Language;
}

export const FullscreenLightbox: React.FC<FullscreenLightboxProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title,
  subtitle,
  lang = 'it',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Sync initialIndex when lightbox opens or initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), images.length - 1));
    }
  }, [isOpen, initialIndex, images.length]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToPrev, goToNext]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (isOpen && thumbnailsRef.current) {
      const activeBtn = thumbnailsRef.current.children[currentIndex] as HTMLElement | undefined;
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [isOpen, currentIndex]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    setTouchStartX(null);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Galleria a schermo intero'}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 select-none"
      onClick={onClose}
    >
      {/* Top Bar: Title, Counter & Close Button */}
      <div
        className="w-full flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          {title && (
            <h3 className="font-serif text-white text-base sm:text-xl font-normal tracking-wide flex items-center gap-2">
              <span>{title}</span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#B99470]" />
              <span className="text-xs sm:text-sm font-sans text-stone-400 font-light">
                {currentIndex + 1} / {images.length}
              </span>
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-[#B99470] font-medium tracking-wider uppercase mt-0.5">
              {subtitle}
            </p>
          )}
          {!title && (
            <span className="text-sm font-mono text-white/80">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-block text-[11px] text-white/40 tracking-wider font-light">
            ESC {lang === 'it' ? 'per chiudere' : 'to close'}
          </span>
          <button
            onClick={onClose}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/15 hover:border-white/30 cursor-pointer shadow-lg hover:scale-105"
            aria-label={lang === 'it' ? 'Chiudi a schermo intero' : 'Close fullscreen'}
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Main Center Area: Large Responsive Image & Navigation Arrows */}
      <div
        className="relative flex-1 w-full flex items-center justify-center px-3 sm:px-16 md:px-20 py-2 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Prev Arrow */}
        <button
          onClick={goToPrev}
          className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/15 hover:border-[#B99470] z-20 cursor-pointer shadow-2xl group hover:scale-110"
          aria-label={lang === 'it' ? 'Foto precedente' : 'Previous photo'}
        >
          <ChevronLeft size={26} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Current Image (Centered, max bounds, high quality) */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <img
            key={images[currentIndex]}
            src={images[currentIndex]}
            alt={title ? `${title} - foto ${currentIndex + 1}` : `Foto ${currentIndex + 1}`}
            className="max-h-[72vh] sm:max-h-[76vh] lg:max-h-[78vh] max-w-[94vw] lg:max-w-[88vw] object-contain rounded-lg sm:rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-250"
          />
        </div>

        {/* Next Arrow */}
        <button
          onClick={goToNext}
          className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/15 hover:border-[#B99470] z-20 cursor-pointer shadow-2xl group hover:scale-110"
          aria-label={lang === 'it' ? 'Foto successiva' : 'Next photo'}
        >
          <ChevronRight size={26} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Bar: Thumbnail Strip & Keyboard Hint */}
      <div
        className="w-full flex flex-col items-center pb-4 sm:pb-6 pt-2 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={thumbnailsRef}
          className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-[94vw] sm:max-w-[85vw] px-4 py-2 scrollbar-none"
        >
          {images.map((img, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative shrink-0 w-12 h-10 sm:w-18 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#B99470] scale-110 shadow-lg ring-2 ring-[#B99470]/50'
                    : 'border-white/20 opacity-40 hover:opacity-100 hover:scale-105'
                }`}
                aria-label={`Vai a foto ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-white/40 tracking-wider font-light mt-1.5 flex items-center gap-2">
          <span>← → {lang === 'it' ? 'tasti freccia per scorrere' : 'arrow keys to navigate'}</span>
          <span>•</span>
          <span>{currentIndex + 1} / {images.length}</span>
        </div>
      </div>
    </div>
  );
};
