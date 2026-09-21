import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { MapPin, Phone, Mail, ArrowUp } from 'lucide-react';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (route: string) => {
    if (route === 'home') {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = `#${route}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#181B1E] text-white pt-16 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Mission */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src="./favicon.png"
                alt="Trullo dei Messapi"
                className="w-9 h-9 object-contain brightness-125 drop-shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <span className="font-serif text-2xl font-bold tracking-wide text-white block leading-tight">
                  Trullo dei Messapi
                </span>
                <span className="text-[11px] text-white/50 tracking-[0.2em] uppercase block">
                  Boutique Relais • Puglia
                </span>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm font-light">
              {t.footer.desc}
            </p>

            <div className="pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 inline-block font-mono text-xs text-[#DFD0B8] space-y-1">
                <div>{t.footer.cin}</div>
                <div>{t.footer.cis}</div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-lg font-semibold text-white tracking-wide">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-[#B99470] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('suites')}
                  className="hover:text-[#B99470] transition-colors cursor-pointer"
                >
                  {t.nav.accommodations}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('piscina')}
                  className="hover:text-[#B99470] transition-colors cursor-pointer"
                >
                  {t.nav.pool}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('preventivo')}
                  className="hover:text-[#B99470] transition-colors font-medium text-[#DFD0B8] cursor-pointer"
                >
                  {t.nav.calculator}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contatti')}
                  className="hover:text-[#B99470] transition-colors cursor-pointer"
                >
                  {t.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Contacts */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif text-lg font-semibold text-white tracking-wide">
              {t.footer.contactsTitle}
            </h4>
            <div className="space-y-3 text-sm text-white/70">
              <p className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#B99470] shrink-0 mt-1" />
                <span>Contrada Pisciacalze, 72013 Ceglie Messapica (BR), Puglia, Italia</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#B99470] shrink-0" />
                <a href="tel:+393333339347" className="hover:text-white transition-colors">
                  +39 333 333 9347 (Antonella)
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#B99470] shrink-0" />
                <a href="mailto:trullodeimessapi@gmail.com" className="hover:text-white transition-colors">
                  trullodeimessapi@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <div>
            © {new Date().getFullYear()} Trullo dei Messapi • {t.footer.allRights}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white/80 font-medium tracking-wide">Web by Simone Suma</span>
            <span className="text-white/20">•</span>
            <span>{t.footer.madeWithLove}</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Torna su"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
