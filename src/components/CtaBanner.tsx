import { SiteLink } from './SiteLink';
import { SmartImage } from './SmartImage';
import React from 'react';
import { Language } from '../types';
import { AppRoute } from '../three/types';
import { CONTACT_INFO, getWhatsAppUrl } from '../constants/contact';
import { Calendar, MessageCircle } from 'lucide-react';

interface CtaBannerProps {
  lang: Language;
  onNavigate: (route: AppRoute) => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ lang, onNavigate }) => {
  return (
    <section className="editorial-space relative overflow-hidden bg-stone-900 text-white">
      {/* Background Image with Dark Atmospheric Overlay */}
      <div className="absolute inset-0 z-0">
        <SmartImage
          src="./images/piscina/106724803.jpg"
          alt="Trullo dei Messapi"
          className="w-full h-full object-cover object-center "
        />
        <div className="absolute inset-0 bg-stone-950/55" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title */}
        <h2 className="editorial-title text-white mb-5">
          {lang === 'it'
            ? 'Il tuo prossimo soggiorno tra i trulli'
            : 'Your next stay among the trulli'}
        </h2>

        {/* Contact info subtitle */}
        <p className="editorial-copy text-white/80 mx-auto mb-8">
          {lang === 'it'
            ? `Chiamaci al ${CONTACT_INFO.phoneDisplay} o scrivici a ${CONTACT_INFO.email}`
            : `Call us at ${CONTACT_INFO.phoneDisplay} or email us at ${CONTACT_INFO.email}`}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <SiteLink route="preventivo" lang={lang} onNavigate={onNavigate}
            className="stay-action bg-[#87613F] hover:bg-[#715033] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Calendar size={16} />
            <span>{lang === 'it' ? 'Calcola il soggiorno' : 'Estimate your stay'}</span>
          </SiteLink>

          <a
            href={getWhatsAppUrl(
              lang === 'it'
                ? 'Salve Antonella! Vorrei informazioni su Trullo dei Messapi'
                : 'Hello Antonella! I would like information about Trullo dei Messapi'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="stay-action bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/25 px-7 py-3.5 text-xs uppercase tracking-widest font-semibold transition-all flex items-center gap-2"
          >
            <MessageCircle size={16} className="text-[#25D366]" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
