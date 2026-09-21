import React from 'react';
import { Language } from '../types';
import { AppRoute } from '../three/types';
import { Calendar, MessageCircle } from 'lucide-react';

interface CtaBannerProps {
  lang: Language;
  onNavigate: (route: AppRoute) => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ lang, onNavigate }) => {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden bg-stone-900 text-white">
      {/* Background Image with Dark Atmospheric Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="./images/piscina/106724803.jpg"
          alt="Trullo dei Messapi"
          className="w-full h-full object-cover object-center filter brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-stone-950/70" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-4 leading-tight">
          {lang === 'it'
            ? 'Prenotate online e godetevi un soggiorno rilassante con noi'
            : 'Book online and enjoy a relaxing stay with us'}
        </h2>

        {/* Contact info subtitle */}
        <p className="text-sm sm:text-base text-white/80 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
          {lang === 'it'
            ? 'Chiamaci al +39 3333339347 o scrivici a trullodeimessapi@gmail.com'
            : 'Call us at +39 3333339347 or email us at trullodeimessapi@gmail.com'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('preventivo')}
            className="bg-[#B99470] hover:bg-[#A37E5A] text-white px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
          >
            <Calendar size={16} />
            <span>{lang === 'it' ? 'Calcola preventivo e prenota' : 'Calculate quote & book'}</span>
          </button>

          <a
            href="https://wa.me/393333339347?text=Salve%20Antonella!%20Vorrei%20informazioni%20su%20Trullo%20dei%20Messapi"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/25 px-7 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all flex items-center gap-2"
          >
            <MessageCircle size={16} className="text-[#25D366]" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
