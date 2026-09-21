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
    <section className="py-12 sm:py-16 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2-Column Section Matching Screenshot media_1789998945189.png */}
        <div className="grid grid-cols-1 lg:grid-cols-2 shadow-[0_20px_50px_-20px_rgba(30,25,20,0.12)] rounded-2xl overflow-hidden border border-[#E7DEC8]">
          {/* Left Column: Authentic Pinnacle Photography */}
          <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-full bg-stone-900 overflow-hidden group">
            <img
              src="./images/pinnacolo.jpg"
              alt="Pinnacolo in pietra calcarea del Trullo dei Messapi"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

            {/* Quick 3D Explore Pill */}
            {onScrollTo3D && (
              <div className="absolute bottom-4 left-4 z-10">
                <button
                  onClick={onScrollTo3D}
                  className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-full border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Sparkles size={13} className="text-[#B99470]" />
                  <span>{lang === 'it' ? 'Esplora il modello 3D' : 'Explore 3D Model'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Sleek Charcoal Dark Box */}
          <div className="bg-[#1C1C1C] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            {/* Heading */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-wide text-white leading-tight">
              {lang === 'it' ? 'La nostra Location' : 'Our Location'}
            </h2>

            {/* Warm Gold Accent Divider Line */}
            <div className="w-16 h-[2px] bg-[#B99470] my-5" />

            {/* Body Text Matching Original Site Exactly */}
            <p className="text-white/80 font-light text-sm sm:text-base leading-relaxed mb-8">
              {lang === 'it' ? (
                <>
                  Una antica dimora di Trulli e Lamie nella meravigliosa campagna pugliese di Ceglie Messapica, in Provincia di Brindisi avvolta dai profumi tipici della Valle D’Itria e della ricca tradizione enogastronomica locale. Una location raffinata ed esclusiva in un incontaminato giardino di ulivi secolari, mandorli e piante tipiche della flora mediterranea, ideale per chi adora il relax, la comodità e per chi vuole concedersi un soggiorno nei luoghi simbolo della tradizione e cultura Pugliese. Il Trullo dei Messapi è un Relais in Puglia recentemente ristrutturato, nel pieno rispetto dell’architettura mediterranea tipica, a pochi chilometri dalle marine più esclusive del Mar Adriatico e Mar Ionio dove Vi invitiamo presto a dimorare.
                </>
              ) : (
                <>
                  An ancient residence of Trulli and Lamie nestled in the beautiful countryside of Ceglie Messapica, surrounded by the scents of the Valle d’Itria and rich local gastronomic traditions. An exclusive boutique retreat set in an unspoilt garden of centuries-old olive trees, almond groves and Mediterranean flora, ideal for those seeking relaxation, privacy and the authentic spirit of Apulian culture. Trullo dei Messapi has been meticulously restored with complete respect for traditional architecture, just minutes from the most exclusive Adriatic and Ionian shores.
                </>
              )}
            </p>

            {/* Bronze CTA Button */}
            <div>
              <button
                onClick={() => onNavigate('esperienza')}
                className="bg-[#B99470] hover:bg-[#A37E5A] text-white px-7 py-3 font-serif text-sm tracking-wider transition-all inline-flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>{lang === 'it' ? 'Leggi di più' : 'Read more'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
