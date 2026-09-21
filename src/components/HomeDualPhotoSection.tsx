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
    <section className="py-14 sm:py-20 bg-[#FAF7F2] border-b border-[#E8E2D5]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#B99470] font-semibold block mb-2">
            {lang === 'it' ? 'Trullo dei Messapi' : 'Estate & Atmosphere'}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-gray-900 leading-tight">
            {lang === 'it'
              ? 'I trulli e la piscina'
              : 'The trulli and swimming pool'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 font-light max-w-xl mx-auto leading-relaxed">
            {lang === 'it'
              ? 'Spazi autentici in pietra calcarea pugliese immersi nella quiete degli ulivi secolari.'
              : 'Authentic Apulian limestone architecture nestled in the quiet of ancient olive groves.'}
          </p>
        </div>

        {/* 2 Featured Photos Grid (IMG_3145.JPG & 106724803.jpg) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Photo 1: Quercia - Trullo Cones View */}
          <div
            onClick={() => onNavigate('suites')}
            className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-700 bg-stone-900 cursor-pointer aspect-[16/11] sm:aspect-[4/3]"
          >
            <img
              src="./images/quercia/IMG_3145.JPG"
              alt="I trulli e la corte in pietra naturale del Trullo dei Messapi"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Bottom Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white flex items-end justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#EAD8C0] font-medium block mb-1">
                  {lang === 'it' ? 'La dimora storica' : 'Historic dwelling'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-white">
                  {lang === 'it' ? 'I trulli e la corte in pietra' : 'The trulli and stone courtyard'}
                </h3>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-[#B99470] text-white flex items-center justify-center transition-colors shrink-0">
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Photo 2: Piscina - Pool & Gazebo View */}
          <div
            onClick={() => onNavigate('piscina')}
            className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-700 bg-stone-900 cursor-pointer aspect-[16/11] sm:aspect-[4/3]"
          >
            <img
              src="./images/piscina/106724803.jpg"
              alt="La piscina con idromassaggio e il gazebo del Trullo dei Messapi"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Bottom Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white flex items-end justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#EAD8C0] font-medium block mb-1">
                  {lang === 'it' ? 'Area relax e benessere' : 'Relax & wellness area'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-white">
                  {lang === 'it' ? 'La piscina e l’idromassaggio' : 'Swimming pool & hydromassage'}
                </h3>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-[#B99470] text-white flex items-center justify-center transition-colors shrink-0">
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
