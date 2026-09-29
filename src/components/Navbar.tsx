import { routePath } from '../utils/routes';
import { SiteLink } from './SiteLink';
import { SmartImage } from './SmartImage';
import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { AppRoute } from '../three/types';
import { TRANSLATIONS } from '../data/translations';
import { CONTACT_INFO } from '../constants/contact';
import { Menu, X, Calendar, Phone, MapPin } from 'lucide-react';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

const LanguageSwitch: React.FC<Pick<NavbarProps, 'lang' | 'onLanguageChange'>> = ({ lang, onLanguageChange }) => (
  <div className="flex items-center gap-1 text-xs font-semibold shrink-0">
    <button onClick={() => onLanguageChange('it')} aria-pressed={lang === 'it'}
      className={`px-1.5 py-2 cursor-pointer ${lang === 'it' ? 'text-[#87613F]' : 'text-stone-600 hover:text-[#87613F]'}`}>IT</button>
    <span className="text-stone-400">/</span>
    <button onClick={() => onLanguageChange('en')} aria-pressed={lang === 'en'}
      className={`px-1.5 py-2 cursor-pointer ${lang === 'en' ? 'text-[#87613F]' : 'text-stone-600 hover:text-[#87613F]'}`}>EN</button>
  </div>
);

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  lang,
  onLanguageChange,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang];
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setIsMobileMenuOpen(false); menuButton.current?.focus(); } };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 48);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (route: AppRoute) => {
    setIsMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Contact strip collapses as the fixed navigation becomes compact. */}
      <div inert={isScrolled} className={`hidden md:block overflow-hidden transition-[max-height,opacity] duration-300 ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'}`}>
      <div className="bg-[#1C1C1C] text-white/80 text-xs font-sans tracking-wider py-1.5 px-4 sm:px-8 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-white/70">
              <MapPin size={11} className="text-[#B99470]" />
              <span>Ceglie Messapica • Valle d’Itria, Puglia</span>
            </span>
            <a
              href={`tel:${CONTACT_INFO.phoneTel}`}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
            >
              <Phone size={11} className="text-[#B99470]" />
              <span>{CONTACT_INFO.phoneDisplay}</span>
            </a>
          </div>

          <div className="flex items-center space-x-5">
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="text-white/70 hover:text-white transition-colors"
            >
              {CONTACT_INFO.email}
            </a>
          </div>
        </div>
      </div>
      </div>

      {/* 2. Main Luxury Limestone Navigation Bar */}
      <nav
        className={`w-full transition-all duration-300 bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[#E2DDD3] ${
          isScrolled ? 'py-1.5 lg:py-2 shadow-[0_4px_25px_-5px_rgba(40,30,20,0.08)]' : 'py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <a
            href={routePath('home', lang)}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              handleNavClick('home');
            }}
            className="flex items-center gap-3 group py-0.5"
          >
            <SmartImage loading="eager"
              src="./images/logo.png"
              alt="Trullo dei Messapi - Relais di Puglia"
              className={`${isScrolled ? 'h-11 lg:h-12' : 'h-12 sm:h-14'} w-auto object-contain transition-[height,transform] duration-300 group-hover:scale-[1.02]`}
            />
          </a>

          {/* Desktop Navigation Links (Understated, Editorial Typography) */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-6">
            <SiteLink route="home" lang={lang} onNavigate={handleNavClick}
              className={`text-xs uppercase tracking-[0.12em] xl:tracking-[0.2em] whitespace-nowrap font-semibold transition-colors cursor-pointer py-1 ${
                currentRoute === 'home'
                  ? 'text-[#B99470] border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              Home
            </SiteLink>
            <SiteLink route="suites" lang={lang} onNavigate={handleNavClick}
              className={`text-xs uppercase tracking-[0.12em] xl:tracking-[0.2em] whitespace-nowrap font-semibold transition-colors cursor-pointer py-1 ${
                currentRoute === 'suites'
                  ? 'text-[#B99470] border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.accommodations}
            </SiteLink>
            <SiteLink route="piscina" lang={lang} onNavigate={handleNavClick}
              className={`text-xs uppercase tracking-[0.12em] xl:tracking-[0.2em] whitespace-nowrap font-semibold transition-colors cursor-pointer py-1 ${
                currentRoute === 'piscina'
                  ? 'text-[#B99470] border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.pool}
            </SiteLink>
            <SiteLink route="preventivo" lang={lang} onNavigate={handleNavClick}
              className={`text-xs uppercase tracking-[0.12em] xl:tracking-[0.2em] whitespace-nowrap font-semibold transition-colors cursor-pointer py-1 ${
                currentRoute === 'preventivo'
                  ? 'text-[#B99470] border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.calculator}
            </SiteLink>
            <SiteLink route="contatti" lang={lang} onNavigate={handleNavClick}
              className={`text-xs uppercase tracking-[0.12em] xl:tracking-[0.2em] whitespace-nowrap font-semibold transition-colors cursor-pointer py-1 ${
                currentRoute === 'contatti'
                  ? 'text-[#B99470] border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.contact}
            </SiteLink>
          </div>

          {/* Right actions: Direct Booking Button */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
            <SiteLink route="preventivo" lang={lang} onNavigate={handleNavClick}
              className="stay-action whitespace-nowrap bg-[#87613F] hover:bg-[#715033] text-white px-5 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar size={13} />
              <span>{t.nav.bookNow}</span>
            </SiteLink>
            <LanguageSwitch lang={lang} onLanguageChange={onLanguageChange} />
          </div>

          {/* Mobile Actions: Language + Hamburger Menu */}
          <div className="flex items-center space-x-3 lg:hidden">
            <LanguageSwitch lang={lang} onLanguageChange={onLanguageChange} />

            <button
              ref={menuButton} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#34302B] hover:text-[#B99470] transition-colors"
              aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation" aria-label={lang === 'it' ? 'Menu di navigazione' : 'Navigation menu'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div id="mobile-navigation" className={`lg:hidden overflow-y-auto bg-[#F7F4EE] border-t border-[#E2DDD3] px-6 py-6 shadow-2xl animate-in slide-in-from-top duration-200 ${isScrolled ? 'max-h-[calc(100dvh-70px)]' : 'max-h-[calc(100dvh-80px)] md:max-h-[calc(100dvh-120px)]'}`}>
            <div className="flex flex-col space-y-4">
              <SiteLink route="home" lang={lang} onNavigate={handleNavClick}
                className="text-left text-sm uppercase tracking-wider font-semibold py-2 border-b border-[#EBE6DC] text-[#34302B] hover:text-[#B99470] transition-colors"
              >
                Home
              </SiteLink>
              <SiteLink route="suites" lang={lang} onNavigate={handleNavClick}
                className="text-left text-sm uppercase tracking-wider font-semibold py-2 border-b border-[#EBE6DC] text-[#34302B] hover:text-[#B99470] transition-colors"
              >
                {t.nav.accommodations}
              </SiteLink>
              <SiteLink route="piscina" lang={lang} onNavigate={handleNavClick}
                className="text-left text-sm uppercase tracking-wider font-semibold py-2 border-b border-[#EBE6DC] text-[#34302B] hover:text-[#B99470] transition-colors"
              >
                {t.nav.pool}
              </SiteLink>
              <SiteLink route="preventivo" lang={lang} onNavigate={handleNavClick}
                className="text-left text-sm uppercase tracking-wider font-semibold py-2 border-b border-[#EBE6DC] text-[#34302B] hover:text-[#B99470] transition-colors"
              >
                {t.nav.calculator}
              </SiteLink>
              <SiteLink route="contatti" lang={lang} onNavigate={handleNavClick}
                className="text-left text-sm uppercase tracking-wider font-semibold py-2 border-b border-[#EBE6DC] text-[#34302B] hover:text-[#B99470] transition-colors"
              >
                {t.nav.contact}
              </SiteLink>

              <SiteLink route="preventivo" lang={lang} onNavigate={handleNavClick}
                className="stay-action w-full mt-3 bg-[#87613F] hover:bg-[#715033] text-white py-3 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                <span>{t.nav.bookNow}</span>
              </SiteLink>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
