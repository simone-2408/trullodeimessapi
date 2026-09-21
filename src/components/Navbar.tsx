import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { AppRoute } from '../three/types';
import { TRANSLATIONS } from '../data/translations';
import { Phone, Menu, X, Calendar, MapPin } from 'lucide-react';

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
      setIsScrolled(window.scrollY > 30);
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
      {/* Top micro bar with contact & legal */}
      <div className="bg-[#1E2226]/90 backdrop-blur-md text-[#DFD0B8] text-xs py-1.5 px-4 hidden md:block border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 opacity-90">
              <MapPin size={13} className="text-[#B99470]" />
              Contrada Pisciacalze, 72013 Ceglie Messapica (BR)
            </span>
            <a
              href="tel:+393333339347"
              className="flex items-center gap-1.5 hover:text-white transition-colors opacity-90"
            >
              <Phone size={13} className="text-[#B99470]" />
              +39 333 333 9347
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white/60 text-[11px] font-mono">
              CIN: IT074003C100028899 • CIS: BR07400361000008508
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3'
            : 'bg-gradient-to-b from-black/70 via-black/40 to-transparent py-4 text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#B99470] flex items-center justify-center text-white font-serif font-bold text-xl shadow-inner group-hover:scale-105 transition-transform">
              M
            </div>
            <div>
              <span
                className={`font-serif text-2xl tracking-wide font-semibold block leading-tight ${
                  isScrolled ? 'text-[#1E2226]' : 'text-white'
                }`}
              >
                Trullo dei Messapi
              </span>
              <span
                className={`text-[10px] uppercase tracking-widest block font-medium ${
                  isScrolled ? 'text-[#B99470]' : 'text-[#DFD0B8]'
                }`}
              >
                Ceglie Messapica • Puglia
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-7">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                currentRoute === 'home'
                  ? 'text-[#B99470] font-bold border-b-2 border-[#B99470]'
                  : isScrolled
                  ? 'text-[#2B3037] hover:text-[#B99470]'
                  : 'text-white/90 hover:text-[#B99470]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('suites')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                currentRoute === 'suites'
                  ? 'text-[#B99470] font-bold border-b-2 border-[#B99470]'
                  : isScrolled
                  ? 'text-[#2B3037] hover:text-[#B99470]'
                  : 'text-white/90 hover:text-[#B99470]'
              }`}
            >
              {t.nav.accommodations}
            </button>
            <button
              onClick={() => handleNavClick('piscina')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                currentRoute === 'piscina'
                  ? 'text-[#B99470] font-bold border-b-2 border-[#B99470]'
                  : isScrolled
                  ? 'text-[#2B3037] hover:text-[#B99470]'
                  : 'text-white/90 hover:text-[#B99470]'
              }`}
            >
              {t.nav.pool}
            </button>
            <button
              onClick={() => handleNavClick('esperienza')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                currentRoute === 'esperienza'
                  ? 'text-[#B99470] font-bold border-b-2 border-[#B99470]'
                  : isScrolled
                  ? 'text-[#2B3037] hover:text-[#B99470]'
                  : 'text-white/90 hover:text-[#B99470]'
              }`}
            >
              {t.nav.experience}
            </button>
            <button
              onClick={() => handleNavClick('preventivo')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                currentRoute === 'preventivo'
                  ? 'text-[#B99470] font-bold border-b-2 border-[#B99470]'
                  : isScrolled
                  ? 'text-[#2B3037] hover:text-[#B99470]'
                  : 'text-white/90 hover:text-[#B99470]'
              }`}
            >
              {t.nav.calculator}
            </button>
            <button
              onClick={() => handleNavClick('contatti')}
              className={`text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                currentRoute === 'contatti'
                  ? 'text-[#B99470] font-bold border-b-2 border-[#B99470]'
                  : isScrolled
                  ? 'text-[#2B3037] hover:text-[#B99470]'
                  : 'text-white/90 hover:text-[#B99470]'
              }`}
            >
              {t.nav.contact}
            </button>
          </div>

          {/* Right actions: Language Switcher & CTA Button */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Switcher */}
            <div
              className={`flex items-center rounded-full p-0.5 border text-xs font-semibold ${
                isScrolled
                  ? 'border-[#B99470]/30 bg-[#FAF8F5]'
                  : 'border-white/20 bg-black/30 text-white'
              }`}
            >
              <button
                onClick={() => onLanguageChange('it')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'it'
                    ? 'bg-[#B99470] text-white shadow-sm'
                    : isScrolled
                    ? 'text-gray-600 hover:text-black'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                IT
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#B99470] text-white shadow-sm'
                    : isScrolled
                    ? 'text-gray-600 hover:text-black'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                handleNavClick('preventivo');
                onOpenCalculator();
              }}
              className="bg-[#B99470] hover:bg-[#A37E5A] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
            >
              <Calendar size={16} className="group-hover:scale-110 transition-transform" />
              <span>{t.nav.bookNow}</span>
            </button>
          </div>

          {/* Mobile Menu Button & Language Toggle */}
          <div className="flex items-center space-x-3 lg:hidden">
            <div
              className={`flex items-center rounded-full p-0.5 border text-xs font-semibold ${
                isScrolled
                  ? 'border-[#B99470]/30 bg-[#FAF8F5]'
                  : 'border-white/20 bg-black/40 text-white'
              }`}
            >
              <button
                onClick={() => onLanguageChange('it')}
                className={`px-2 py-0.5 rounded-full ${
                  lang === 'it'
                    ? 'bg-[#B99470] text-white'
                    : isScrolled
                    ? 'text-gray-600'
                    : 'text-white/70'
                }`}
              >
                IT
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded-full ${
                  lang === 'en'
                    ? 'bg-[#B99470] text-white'
                    : isScrolled
                    ? 'text-gray-600'
                    : 'text-white/70'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-[#1E2226]' : 'text-white'
              }`}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#1E2226] text-white border-t border-white/10 px-4 py-6 shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => handleNavClick('home')}
                className="text-left text-base font-medium py-2 border-b border-white/5 hover:text-[#B99470] transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('suites')}
                className="text-left text-base font-medium py-2 border-b border-white/5 hover:text-[#B99470] transition-colors"
              >
                {t.nav.accommodations}
              </button>
              <button
                onClick={() => handleNavClick('piscina')}
                className="text-left text-base font-medium py-2 border-b border-white/5 hover:text-[#B99470] transition-colors"
              >
                {t.nav.pool}
              </button>
              <button
                onClick={() => handleNavClick('esperienza')}
                className="text-left text-base font-medium py-2 border-b border-white/5 hover:text-[#B99470] transition-colors"
              >
                {t.nav.experience}
              </button>
              <button
                onClick={() => handleNavClick('preventivo')}
                className="text-left text-base font-medium py-2 border-b border-white/5 hover:text-[#B99470] transition-colors"
              >
                {t.nav.calculator}
              </button>
              <button
                onClick={() => handleNavClick('contatti')}
                className="text-left text-base font-medium py-2 border-b border-white/5 hover:text-[#B99470] transition-colors"
              >
                {t.nav.contact}
              </button>

              <button
                onClick={() => {
                  handleNavClick('preventivo');
                  onOpenCalculator();
                }}
                className="w-full mt-4 bg-[#B99470] hover:bg-[#A37E5A] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar size={18} />
                <span>{t.nav.bookNow}</span>
              </button>

              <div className="pt-4 text-xs text-white/50 text-center font-mono">
                CIN: IT074003C100028899 • CIS: BR07400361000008508
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
