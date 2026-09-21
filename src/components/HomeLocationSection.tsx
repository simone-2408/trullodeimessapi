import React from 'react';
import { Language } from '../types';
import { AppRoute } from '../three/types';
import { ChevronRight, Sparkles } from 'lucide-react';

interface HomeLocationSectionProps {
  lang: Language;
  onNavigate: (route: AppRoute) => void;
  onScrollTo3D?: () => void;
}

export const HomeLocationSection: React.FC<HomeLocationSectionProps> = ({
  lang,
  onNavigate,
  onScrollTo3D,
}) => {
  return (
    <section className="w-full bg-[#1C1C1C] border-b border-[#2C2C2C]">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[500px] lg:min-h-[680px]">
        {/* Left Column: Authentic Pinnacle Photography Full-Bleed */}
        <div className="relative min-h-[420px] sm:min-h-[500px] lg:min-h-full bg-stone-900 overflow-hidden group">
          <img
            src="./images/pinnacolo.jpg"
            alt="Pinnacolo in pietra calcarea del Trullo dei Messapi"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
            loading="lazy"
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

          {/* Quick 3D Explore Pill */}
          {onScrollTo3D && (
            <div className="absolute bottom-6 left-6 z-10">
              <button
                onClick={onScrollTo3D}
                className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs px-4 py-2.5 rounded-full border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:border-[#B99470]"
              >
                <Sparkles size={14} className="text-[#B99470]" />
                <span>{lang === 'it' ? 'Esplora il modello 3D' : 'Explore 3D Model'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sleek Charcoal Dark Box Full-Bleed */}
        <div className="bg-[#1C1C1C] text-white p-8 sm:p-14 lg:p-16 xl:p-24 flex flex-col justify-center">
          <div className="max-w-xl">
            {/* Minimal Eyebrow & Heading */}
            <span className="text-xs uppercase tracking-[0.25em] text-[#B99470] font-semibold block mb-3">
              {lang === 'it' ? 'La Terra e i Trulli' : 'Earth & Trulli'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-wide text-white leading-tight">
              {lang === 'it' ? 'Un rifugio antico nella natura' : 'An ancient sanctuary in nature'}
            </h2>

            {/* Warm Gold Accent Divider Line */}
            <div className="w-16 h-[2px] bg-[#B99470] my-6" />

            {/* Minimal & Evocative Body Copy */}
            <div className="space-y-4 text-white/80 font-light text-sm sm:text-base leading-relaxed mb-8">
              {lang === 'it' ? (
                <>
                  <p>
                    Il Trullo dei Messapi sorge tra la terra rossa e gli ulivi secolari di Ceglie Messapica. Un luogo protetto dal silenzio della campagna, dove il tempo rallenta e la pietra viva racconta la memoria contadina della Valle d’Itria.
                  </p>
                  <p>
                    Tre dimore indipendenti ricavate da trulli storici e lamie, restaurate preservando la purezza della calce e il fresco naturale delle spesse mura. Qui ogni risveglio è accompagnato dalla luce limpida e dal respiro quieto della natura.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Trullo dei Messapi rises amidst the red earth and ancient olive groves of Ceglie Messapica. A sanctuary embraced by countryside silence, where time slows down and authentic limestone speaks of timeless rural heritage.
                  </p>
                  <p>
                    Three independent dwellings carved from historic trulli and lamie, restored to preserve the purity of white lime and the natural coolness of thick stone walls. Here, each day awakens with golden light and the peaceful rhythm of nature.
                  </p>
                </>
              )}
            </div>

            {/* Bronze CTA Button */}
            <div>
              <button
                onClick={() => onNavigate('esperienza')}
                className="bg-[#B99470] hover:bg-[#A37E5A] text-white px-8 py-3.5 font-serif text-sm tracking-wider transition-all inline-flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>{lang === 'it' ? 'Scopri la tenuta' : 'Explore the estate'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
