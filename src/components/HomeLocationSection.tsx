import { SiteLink } from './SiteLink';
import { SmartImage } from './SmartImage';
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
          <SmartImage
            src="./images/pinnacolo.jpg"
            alt={lang === 'it' ? 'Pinnacolo in pietra calcarea del Trullo dei Messapi' : 'Limestone pinnacle at Trullo dei Messapi'}
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
                <Sparkles size={14} className="text-[#D6B38F]" />
                <span>{lang === 'it' ? 'Esplora il modello 3D' : 'Explore 3D Model'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sleek Charcoal Dark Box Full-Bleed */}
        <div className="editorial-inset bg-[#1C1C1C] text-white flex flex-col justify-center">
          <div className="max-w-[38rem]">
            {/* Minimal Eyebrow & Heading */}
            <span className="text-xs uppercase tracking-[0.25em] text-[#D6B38F] font-semibold block mb-3">
              {lang === 'it' ? 'La Terra e i Trulli' : 'Earth & Trulli'}
            </span>
            <h2 className="editorial-title text-white">
              {lang === 'it' ? 'Nel paesaggio di Ceglie Messapica' : 'In the countryside of Ceglie Messapica'}
            </h2>

            {/* Warm Gold Accent Divider Line */}
            <div className="w-16 h-[2px] bg-[#B99470] my-6" />

            {/* Minimal & Evocative Body Copy */}
            <div className="editorial-copy space-y-5 text-white/80 mb-8">
              {lang === 'it' ? (
                <>
                  <p>
                    Siamo nella campagna di Ceglie Messapica, tra muretti a secco e ulivi. Da qui puoi esplorare i borghi della Valle d’Itria e ritrovare, al rientro, gli spazi aperti della tenuta.
                  </p>
                  <p>
                    Quercia accoglie famiglie e gruppi fino a sette persone; Corbezzolo e Melograno offrono spazi raccolti per due o tre ospiti. Ogni dimora ha la propria cucina e uno spazio esterno, con piscina e idromassaggio condivisi.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    We are in the countryside of Ceglie Messapica, among dry-stone walls and olive trees. Explore the villages of the Itria Valley, then return to the open spaces of the estate.
                  </p>
                  <p>
                    Quercia welcomes families and groups of up to seven; Corbezzolo and Melograno offer intimate spaces for two or three guests. Each residence has its own kitchen and outdoor space, with a shared pool and hydromassage.
                  </p>
                </>
              )}
            </div>

            {/* Bronze CTA Button */}
            <div>
              <SiteLink route="contatti" lang={lang} onNavigate={onNavigate}
                className="stay-action bg-[#87613F] hover:bg-[#715033] text-white px-8 py-3.5 font-serif text-sm tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{lang === 'it' ? 'Dove siamo & Contatti' : 'Location & Contacts'}</span>
                <ChevronRight size={16} />
              </SiteLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
