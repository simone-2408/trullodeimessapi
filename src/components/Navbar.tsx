import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { AppRoute } from '../three/types';
import { TRANSLATIONS } from '../data/translations';
import { Menu, X, Calendar } from 'lucide-react';

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
      {/* Clean, Bright, Pure White Luxury Navbar */}
      <nav
        className={`w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-[#E8DEC8]/60 ${
          isScrolled ? 'py-2.5 shadow-sm' : 'py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Authentic Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }}
            className="flex items-center gap-3 group py-1"
          >
            <img
              src="/images/logo.png"
              alt="Trullo dei Messapi - Relais di Puglia"
              className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </a>

          {/* Desktop Navigation Links (Understated, Editorial Typography) */}
          <div className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer pb-1 ${
                currentRoute === 'home'
                  ? 'text-[#B99470] font-semibold border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('suites')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer pb-1 ${
                currentRoute === 'suites'
                  ? 'text-[#B99470] font-semibold border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.accommodations}
            </button>
            <button
              onClick={() => handleNavClick('piscina')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer pb-1 ${
                currentRoute === 'piscina'
                  ? 'text-[#B99470] font-semibold border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.pool}
            </button>
            <button
              onClick={() => handleNavClick('esperienza')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer pb-1 ${
                currentRoute === 'esperienza'
                  ? 'text-[#B99470] font-semibold border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.experience}
            </button>
            <button
              onClick={() => handleNavClick('preventivo')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer pb-1 ${
                currentRoute === 'preventivo'
                  ? 'text-[#B99470] font-semibold border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.calculator}
            </button>
            <button
              onClick={() => handleNavClick('contatti')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer pb-1 ${
                currentRoute === 'contatti'
                  ? 'text-[#B99470] font-semibold border-b-2 border-[#B99470]'
                  : 'text-[#2C2926] hover:text-[#B99470]'
              }`}
            >
              {t.nav.contact}
            </button>
          </div>

          {/* Right actions: Clean Minimalist Language Switcher & Booking Button */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Minimalist Language Switcher (IT | EN) */}
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#2C2926]">
              <button
                onClick={() => onLanguageChange('it')}
                className={`cursor-pointer transition-colors ${
                  lang === 'it' ? 'text-[#B99470] font-bold underline underline-offset-4' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                IT
              </button>
              <span className="text-gray-300">/</span>
              <button
                onClick={() => onLanguageChange('en')}
                className={`cursor-pointer transition-colors ${
                  lang === 'en' ? 'text-[#B99470] font-bold underline underline-offset-4' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                EN
              </button>
            </div>

            {/* Direct Booking Button */}
            <button
              onClick={() => {
                handleNavClick('preventivo');
                onOpenCalculator();
              }}
              className="bg-[#B99470] hover:bg-[#A37E5A] text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Calendar size={14} />
              <span>{t.nav.bookNow}</span>
            </button>
          </div>

          {/* Mobile Actions: Language + Hamburger Menu */}
          <div className="flex items-center space-x-3 lg:hidden">
            <div className="flex items-center space-x-1 text-xs font-semibold text-[#2C2926] mr-1">
              <button
                onClick={() => onLanguageChange('it')}
                className={`px-1.5 py-0.5 ${lang === 'it' ? 'text-[#B99470] font-bold' : 'text-gray-400'}`}
              >
                IT
              </button>
              <span className="text-gray-300">/</span>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-1.5 py-0.5 ${lang === 'en' ? 'text-[#B99470] font-bold' : 'text-gray-400'}`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#2C2926] hover:text-[#B99470] transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer (Clean White Background) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E8DEC8]/60 px-6 py-6 shadow-xl animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => handleNavClick('home')}
                className="text-left text-base font-medium py-2 border-b border-gray-100 text-[#2C2926] hover:text-[#B99470] transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('suites')}
                className="text-left text-base font-medium py-2 border-b border-gray-100 text-[#2C2926] hover:text-[#B99470] transition-colors"
              >
                {t.nav.accommodations}
              </button>
              <button
                onClick={() => handleNavClick('piscina')}
                className="text-left text-base font-medium py-2 border-b border-gray-100 text-[#2C2926] hover:text-[#B99470] transition-colors"
              >
                {t.nav.pool}
              </button>
              <button
                onClick={() => handleNavClick('esperienza')}
                className="text-left text-base font-medium py-2 border-b border-gray-100 text-[#2C2926] hover:text-[#B99470] transition-colors"
              >
                {t.nav.experience}
              </button>
              <button
                onClick={() => handleNavClick('preventivo')}
                className="text-left text-base font-medium py-2 border-b border-gray-100 text-[#2C2926] hover:text-[#B99470] transition-colors"
              >
                {t.nav.calculator}
              </button>
              <button
                onClick={() => handleNavClick('contatti')}
                className="text-left text-base font-medium py-2 border-b border-gray-100 text-[#2C2926] hover:text-[#B99470] transition-colors"
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
