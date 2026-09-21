import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { TESTIMONIALS } from '../data/testimonials';
import { Star, MessageSquareQuote, CheckCircle } from 'lucide-react';

interface ReviewsSectionProps {
  lang: Language;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section id="recensioni" className="py-20 sm:py-28 bg-[#F3EDE3]/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B99470]/15 text-[#8A6743] text-xs font-bold uppercase tracking-widest mb-3">
            <MessageSquareQuote size={14} />
            <span>{t.reviews.sectionTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {t.reviews.title}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {t.reviews.ratingText}
            </span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-[#FAF7F2] rounded-3xl p-7 sm:p-8 shadow-sm border border-[#E2DDD3] flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                {/* Rating Stars & Room Badge */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <span className="text-xs font-medium px-3 py-1 bg-[#F2EDE4] text-[#8A6743] rounded-full border border-[#DDD7CB]">
                    {item.room}
                  </span>
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 mb-3 leading-snug">
                  "{item.title[lang]}"
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed italic">
                  "{item.content[lang]}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#B99470] text-white flex items-center justify-center font-bold text-xs">
                    {item.guest.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      {item.guest}
                    </h4>
                    <span className="text-[11px] text-gray-400">
                      {item.country} • {item.stayDate}
                    </span>
                  </div>
                </div>

                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <CheckCircle size={12} />
                  {lang === 'it' ? 'Soggiorno verificato' : 'Verified stay'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
