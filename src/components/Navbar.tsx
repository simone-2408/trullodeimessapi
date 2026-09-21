import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { AppRoute } from '../three/types';
import { TRANSLATIONS } from '../data/translations';
import { Menu, X, Calendar, Phone, MapPin } from 'lucide-react';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenCalculator: (accommodationId?: 'quercia' | 'corbezzolo' | 'melograno') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  lang,
  onLanguageChange,
  onOpenCalculator,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (route: AppRoute) => {
    setIsMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* 1. Luxury Top Micro-Bar (inspired by Masseria Torre Coccaro & San Paolo Grande) */}
      <div className="bg-[#1C1C1C] text-white/80 text-[11px] font-sans tracking-wider py-1.5 px-4 sm:px-8 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-white/70">
              <MapPin size={11} className="text-[#B99470]" />
              <span>Ceglie Messapica • Valle d’Itria, Puglia</span>
            </span>
            <a
              href="tel:+393333339347"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
            >
              <Phone size={11} className="text-[#B99470]" />
              <span>+39 333 333 9347</span>
            </a>
          </div>

          <div className="flex items-center space-x-5">
            <a
              href="mailto:trullodeimessapi@gmail.com"
              className="text-white/70 hover:text-white transition-colors"
            >
              trullodeimessapi@gmail.com
            </a>
            <span className="text-white/20">|</span>
            <div className="flex items-center space-x-1.5 font-semibold">
              <button
                onClick={() => onLanguageChange('it')}
                className={`cursor-pointer transition-colors ${
                  lang === 'it' ? 'text-[#B99470] font-bold' : 'text-white/50 hover:text-white'
                }`}
              >
                IT
              </button>
              <span className="text-white/30">/</span>
              <button
                onClick={() => onLanguageChange('en')}
                className={`cursor-pointer transition-colors ${
                  lang === 'en' ? 'text-[#B99470] font-bold' : 'text-white/50 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Luxury Limestone Navigation Bar */}
      <nav
        className={`w-full transition-all duration-300 bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[#E2DDD3] ${
          isScrolled ? 'py-2 shadow-[0_4px_25px_-5px_rgba(40,30,20,0.08)]' : 'py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }}
            className="flex items-center gap-3 group py-0.5"
          >
            <img
              src="./images/logo.png"
              alt="Trullo dei Messapi - Relais di Puglia"
              className="h-12 sm:h-14 lg:h-16 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </a>

          {/* Desktop Navigation Links (Understated, Editorial Typography) */}
          <div className="hidden lg:flex items-center space-x-7 xl:space-x-8">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer py-1 ${
                currentRoute === 'home'
                  ? 'text-[#B99470] border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('suites')}
              className={`text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer py-1 ${
                currentRoute === 'suites'
                  ? 'text-[#B99470] border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.accommodations}
            </button>
            <button
              onClick={() => handleNavClick('piscina')}
              className={`text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer py-1 ${
                currentRoute === 'piscina'
                  ? 'text-[#B99470] border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.pool}
            </button>
            <button
              onClick={() => handleNavClick('esperienza')}
              className={`text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer py-1 ${
                currentRoute === 'esperienza'
                  ? 'text-[#B99470] border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.experience}
            </button>
            <button
              onClick={() => handleNavClick('preventivo')}
              className={`text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer py-1 ${
                currentRoute === 'preventivo'
                  ? 'text-[#B99470] border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.calculator}
            </button>
            <button
              onClick={() => handleNavClick('contatti')}
              className={`text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer py-1 ${
                currentRoute === 'contatti'
                  ? 'text-[#B99470] border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.contact}
            </button>
          </div>

          {/* Right actions: Direct Booking Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() => {
                handleNavClick('preventivo');
                onOpenCalculator();
              }}
              className="bg-[#B99470] hover:bg-[#A37E5A] text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-[0.18em] uppercase transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Calendar size={13} />
              <span>{t.nav.bookNow}</span>
            </button>
          </div>

          {/* Mobile Actions: Language + Hamburger Menu */}
          <div className="flex items-center space-x-3 lg:hidden">
            <div className="flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EFECE5] border border-[#DDD7CC] text-[#34302B] mr-1">
              <button
                onClick={() => onLanguageChange('it')}
                className={`px-1.5 py-0.5 ${lang === 'it' ? 'text-[#B99470] font-bold' : 'text-stone-400'}`}
              >
                IT
              </button>
              <span className="text-stone-300">/</span>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-1.5 py-0.5 ${lang === 'en' ? 'text-[#B99470] font-bold' : 'text-stone-400'}`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#34302B] hover:text-[#B99470] transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#F7F4EE] border-t border-[#E2DDD3] px-6 py-6 shadow-2xl animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => handleNavClick('home')}
                className="text-left text-sm uppercase tracking-wider font-semibold py-2 border-b border-[#EBE6DC] text-[#34302B] hover:text-[#B99470] transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('suites')}
                className="text-left text-sm uppercase tracking-wider font-semibold py-2 border-b border-[#EBE6DC] text-[#34302B] hover:text-[#B99470] transition-colors"
              >
                {t.nav.accommodations}
              </button>
              <button
                onClick={() => handleNavClick('piscina')}
                className="text-left text-sm uppercase tracking-wider font-semibold py-2 border-b border-[#EBE6DC] text-[#34302B] hover:text-[#B99470] transition-colors"
              >
                {t.nav.pool}
              </button>
              <button
                onClick={() => handleNavClick('esperienza')}
                className="text-left text-sm uppercase tracking-wider font-semibold py-2 border-b border-[#EBE6DC] text-[#34302B] hover:text-[#B99470] transition-colors"
              >
                {t.nav.experience}
              </button>
              <button
                onClick={() => handleNavClick('preventivo')}
                className="text-left text-sm uppercase tracking-wider font-semibold py-2 border-b border-[#EBE6DC] text-[#34302B] hover:text-[#B99470] transition-colors"
              >
                {t.nav.calculator}
              </button>
              <button
                onClick={() => handleNavClick('contatti')}
                className="text-left text-sm uppercase tracking-wider font-semibold py-2 border-b border-[#EBE6DC] text-[#34302B] hover:text-[#B99470] transition-colors"
              >
                {t.nav.contact}
              </button>

              <button
                onClick={() => {
                  handleNavClick('preventivo');
                  onOpenCalculator();
                }}
                className="w-full mt-3 bg-[#B99470] hover:bg-[#A37E5A] text-white py-3 rounded-xl text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <Calendar size={16} />
                <span>{t.nav.bookNow}</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
