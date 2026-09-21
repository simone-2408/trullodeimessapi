import React from 'react';
import { Accommodation, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Users, Maximize2, Bed, Bath, Sparkles, Images, Calendar, Waves } from 'lucide-react';

interface AccommodationCardProps {
  accommodation: Accommodation;
  lang: Language;
  onOpenDetails: (acc: Accommodation) => void;
  onSelectForQuote: (id: 'quercia' | 'corbezzolo' | 'melograno') => void;
}

export const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
  lang,
  onOpenDetails,
  onSelectForQuote,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-[#E2DDD3] flex flex-col transition-all duration-300 hover:-translate-y-1 group">
      {/* Image with overlay badge */}
      <div className="relative h-72 sm:h-80 overflow-hidden cursor-pointer" onClick={() => onOpenDetails(accommodation)}>
        <img
          src={accommodation.coverImage}
          alt={accommodation.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <span className="bg-[#B99470] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md backdrop-blur-md flex items-center gap-1.5">
            <Sparkles size={12} />
            {accommodation.badge[lang]}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(accommodation);
            }}
            className="bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-md transition-colors flex items-center gap-1 text-xs font-medium px-3"
          >
            <Images size={14} />
            <span>{accommodation.gallery.length} foto</span>
          </button>
        </div>

        {/* Bottom image caption: starting price */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#DFD0B8] font-medium block">
              {accommodation.type === 'trullo'
                ? lang === 'it' ? 'Trullo Tradizionale' : 'Traditional Trullo'
                : lang === 'it' ? 'Appartamento di Charme' : 'Charming Apartment'}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold leading-tight drop-shadow-sm">
              {accommodation.name}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/80 block">{t.accommodations.fromPrice}</span>
            <span className="text-2xl font-bold font-serif text-[#DFD0B8]">
              {accommodation.startingPrice}€
            </span>
            <span className="text-xs text-white/80">/{t.accommodations.perNight}</span>
          </div>
        </div>
      </div>

      {/* Card Body with Stone Aesthetics */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-[#FAF7F2]">
        <div>
          {/* Key Quick Stats Pills */}
          <div className="grid grid-cols-4 gap-2 pb-5 border-b border-[#EBE6DC] text-center">
            <div className="bg-[#F2EDE4]/80 border border-[#E5E0D5] p-2 rounded-xl">
              <Maximize2 size={16} className="mx-auto text-[#B99470] mb-1" />
              <span className="block text-xs font-bold text-stone-800">{accommodation.sqm} {t.accommodations.sqm}</span>
              <span className="text-[10px] text-stone-400 uppercase">Spazio</span>
            </div>
            <div className="bg-[#F2EDE4]/80 border border-[#E5E0D5] p-2 rounded-xl">
              <Users size={16} className="mx-auto text-[#B99470] mb-1" />
              <span className="block text-xs font-bold text-stone-800">{accommodation.capacityStandard}-{accommodation.capacityMax}</span>
              <span className="text-[10px] text-stone-400 uppercase">{t.accommodations.guests}</span>
            </div>
            <div className="bg-[#F2EDE4]/80 border border-[#E5E0D5] p-2 rounded-xl">
              <Bed size={16} className="mx-auto text-[#B99470] mb-1" />
              <span className="block text-xs font-bold text-stone-800">{accommodation.bedroomsCount}</span>
              <span className="text-[10px] text-stone-400 uppercase">{t.accommodations.bedrooms}</span>
            </div>
            <div className="bg-[#F2EDE4]/80 border border-[#E5E0D5] p-2 rounded-xl">
              <Bath size={16} className="mx-auto text-[#B99470] mb-1" />
              <span className="block text-xs font-bold text-stone-800">{accommodation.bathroomsCount}</span>
              <span className="text-[10px] text-stone-400 uppercase">{t.accommodations.bathrooms}</span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-sm text-stone-600 line-clamp-3 leading-relaxed">
            {accommodation.description[lang]}
          </p>

          {/* Feature Bullets Preview */}
          <ul className="mt-4 space-y-2 text-xs text-stone-700">
            {accommodation.features[lang].slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#B99470] font-bold mt-0.5">•</span>
                <span>{feat}</span>
              </li>
            ))}
            <li className="flex items-center gap-1.5 text-xs text-[#4A5645] font-medium pt-1">
              <Waves size={14} className="text-[#B99470]" />
              <span>{lang === 'it' ? 'Piscina e idromassaggio condivisi inclusi' : 'Shared pool & jacuzzi access included'}</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-5 border-t border-[#EBE6DC] flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onOpenDetails(accommodation)}
            className="flex-1 py-3 px-4 rounded-xl border border-[#D8D2C6] bg-white/70 text-stone-700 font-medium text-xs sm:text-sm hover:border-[#B99470] hover:text-[#B99470] transition-colors flex items-center justify-center gap-1.5"
          >
            <Images size={15} />
            <span>{t.accommodations.viewDetails}</span>
          </button>
          <button
            onClick={() => onSelectForQuote(accommodation.id)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#B99470] hover:bg-[#A37E5A] text-white font-medium text-xs sm:text-sm transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calendar size={15} />
            <span>{t.accommodations.selectForQuote}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
