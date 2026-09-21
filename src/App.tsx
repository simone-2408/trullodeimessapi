import React, { useState, useEffect } from 'react';
import { Language, Accommodation } from './types';
import { useAppRouter } from './utils/router';
import { TRANSLATIONS } from './data/translations';
import { ACCOMMODATIONS } from './data/accommodations';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HomeDualPhotoSection } from './components/HomeDualPhotoSection';
import { HomeLocationSection } from './components/HomeLocationSection';
import { PinnacleShowcase } from './components/PinnacleShowcase';
import { ReviewsSection } from './components/ReviewsSection';
import { CtaBanner } from './components/CtaBanner';
import { AccommodationCard } from './components/AccommodationCard';
import { AccommodationModal } from './components/AccommodationModal';
import { PoolSection } from './components/PoolSection';
import { QuoteCalculator } from './components/QuoteCalculator';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { getWhatsAppUrl } from './constants/contact';
import { MessageCircle, ShieldCheck, Waves, Sun, Utensils } from 'lucide-react';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('it');
  const [currentRoute, navigate] = useAppRouter();
  const [activeModalAccommodation, setActiveModalAccommodation] =
    useState<Accommodation | null>(null);

  // Disable automatic browser scroll restoration so SPA route transitions always start at the top
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Guarantee that every route change immediately resets scroll position to the top of the page
  useEffect(() => {
    const scrollToTopImmediate = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTopImmediate();

    // Re-verify on the next animation frame and a short delay to account for dynamic DOM rendering
    const rafId = requestAnimationFrame(scrollToTopImmediate);
    const timeoutId = setTimeout(scrollToTopImmediate, 40);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [currentRoute]);

  // States passed to QuoteCalculator
  const [calculatorSuite, setCalculatorSuite] = useState<
    'quercia' | 'corbezzolo' | 'melograno'
  >('quercia');
  const [calculatorCheckIn, setCalculatorCheckIn] = useState<string>('');
  const [calculatorCheckOut, setCalculatorCheckOut] = useState<string>('');

  const t = TRANSLATIONS[lang];

  const handleSelectAccommodationForQuote = (
    suiteId: 'quercia' | 'corbezzolo' | 'melograno'
  ) => {
    setCalculatorSuite(suiteId);
    navigate('preventivo');
  };

  const handleScrollTo3D = () => {
    const el = document.getElementById('trullo-3d');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#22252A] flex flex-col selection:bg-[#B99470] selection:text-white">
      {/* 1. REFINED LUXURY NAVIGATION BAR */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        lang={lang}
        onLanguageChange={setLang}
        onOpenCalculator={(suiteId) => {
          if (suiteId) setCalculatorSuite(suiteId);
          navigate('preventivo');
        }}
      />

      {/* 2. MAIN CONTENT (ROUTED) */}
      <main className="relative z-10 flex-grow pt-16">
        {/* ==================================================== */}
        {/* === ROUTE: HOME (MINIMAL, ELEGANT, BOUTIQUE STYLE) === */}
        {/* ==================================================== */}
        {currentRoute === 'home' && (
          <div className="animate-in fade-in duration-500">
            {/* 1. Cinematic Hero with video (videopiscina.mp4) & photos */}
            <Hero
              lang={lang}
              onQuickSearch={({ accommodationId, checkIn, checkOut }) => {
                if (accommodationId) setCalculatorSuite(accommodationId);
                if (checkIn) setCalculatorCheckIn(checkIn);
                if (checkOut) setCalculatorCheckOut(checkOut);
                navigate('preventivo');
              }}
            />

            {/* 2. Subito dopo il video: Le due foto (IMG_3145.JPG & 106724803.jpg) */}
            <HomeDualPhotoSection
              lang={lang}
              onNavigate={navigate}
            />

            {/* Spazio bianco di respiro tra i blocchi */}
            <div className="w-full h-14 sm:h-20 bg-white" />

            {/* 3. "La nostra Location" 2-Column Section (dallo screenshot) */}
            <HomeLocationSection
              lang={lang}
              onNavigate={navigate}
              onScrollTo3D={handleScrollTo3D}
            />

            {/* Spazio bianco di respiro tra Location e 3D */}
            <div className="w-full h-14 sm:h-20 bg-white" />

            {/* 4. Dedicated 3D Interactive Trullo & Pinnacle Section */}
            <PinnacleShowcase
              currentRoute={currentRoute}
              lang={lang}
              onNavigate={navigate}
            />

            {/* Spazio bianco di respiro tra 3D e Recensioni */}
            <div className="w-full h-14 sm:h-20 bg-white" />

            {/* 5. Testimonianze (Reviews) */}
            <ReviewsSection lang={lang} />

            {/* 6. Call To Action Banner (like trullodeimessapi.it) */}
            <CtaBanner
              lang={lang}
              onNavigate={navigate}
            />
          </div>
        )}

        {/* ==================================================== */}
        {/* === ROUTE: SUITES (LE DIMORE) === */}
        {/* ==================================================== */}
        {currentRoute === 'suites' && (
          <div className="animate-in fade-in duration-500 bg-white">
            {/* Grand Editorial Header & 4 Pillars (Centered) */}
            <div className="pt-10 sm:pt-16 pb-12 sm:pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-4xl mx-auto">
                <span className="text-xs uppercase tracking-[0.25em] text-[#B99470] font-bold block mb-3">
                  {t.accommodations.eyebrow}
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-stone-900 leading-[1.1] tracking-tight">
                  {t.accommodations.title}
                </h1>
                <p className="mt-4 text-base sm:text-lg text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
                  {t.accommodations.subtitle}
                </p>

                {/* 4 Pillars of the Estate */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10 pt-8 border-t border-[#E8E1D5] text-left">
                  <div className="flex items-start gap-3 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE4D8]/80">
                    <div className="w-9 h-9 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#B99470] shrink-0 mt-0.5">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug">
                        {t.accommodations.pillar1Title}
                      </h4>
                      <p className="text-xs text-stone-500 font-light mt-0.5">
                        {t.accommodations.pillar1Desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE4D8]/80">
                    <div className="w-9 h-9 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#B99470] shrink-0 mt-0.5">
                      <Waves size={18} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug">
                        {t.accommodations.pillar2Title}
                      </h4>
                      <p className="text-xs text-stone-500 font-light mt-0.5">
                        {t.accommodations.pillar2Desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE4D8]/80">
                    <div className="w-9 h-9 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#B99470] shrink-0 mt-0.5">
                      <Sun size={18} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug">
                        {t.accommodations.pillar3Title}
                      </h4>
                      <p className="text-xs text-stone-500 font-light mt-0.5">
                        {t.accommodations.pillar3Desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE4D8]/80">
                    <div className="w-9 h-9 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#B99470] shrink-0 mt-0.5">
                      <Utensils size={18} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug">
                        {t.accommodations.pillar4Title}
                      </h4>
                      <p className="text-xs text-stone-500 font-light mt-0.5">
                        {t.accommodations.pillar4Desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spazio bianco di respiro */}
            <div className="w-full h-8 sm:h-12 bg-white" />

            {/* 3 Full-Bleed Edge-to-Edge Accommodation Showcases */}
            <div className="w-full">
              {ACCOMMODATIONS.map((acc, idx) => (
                <React.Fragment key={acc.id}>
                  <AccommodationCard
                    accommodation={acc}
                    lang={lang}
                    index={idx}
                    onOpenDetails={(item) => setActiveModalAccommodation(item)}
                    onSelectForQuote={(id) => handleSelectAccommodationForQuote(id)}
                  />
                  {idx < ACCOMMODATIONS.length - 1 && (
                    <div className="w-full h-12 sm:h-20 bg-white" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Spazio bianco di respiro */}
            <div className="w-full h-14 sm:h-20 bg-white" />

            {/* Exclusive Estate Booking Pavilion (Sophisticated & Harmonious) */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
              <div className="bg-[#FAF7F2] border border-[#E8E1D5] rounded-3xl sm:rounded-[36px] p-8 sm:p-14 lg:p-16 text-center relative overflow-hidden shadow-sm">
                <span className="text-xs uppercase tracking-[0.25em] text-[#B99470] font-bold block mb-3">
                  {t.accommodations.estateExclusiveTag}
                </span>

                <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 leading-tight tracking-tight">
                  {t.accommodations.estateExclusiveTitle}
                </h3>

                <div className="w-12 h-[1.5px] bg-[#B99470] mx-auto my-5" />

                <p className="text-stone-600 font-light text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                  {t.accommodations.estateExclusiveDesc}
                </p>

                {/* 3 Minimalist Exclusive Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10 pt-6 border-t border-[#EAE3D7] text-stone-700 text-xs sm:text-sm">
                  <div className="flex flex-col items-center">
                    <span className="font-serif font-bold text-stone-900 text-base mb-0.5">
                      {lang === 'it' ? '3 Dimore Riservate' : '3 Private Suites'}
                    </span>
                    <span className="text-stone-500 font-light text-xs">
                      {lang === 'it' ? 'Fino a 12 ospiti in totale privacy' : 'Up to 12 guests in complete privacy'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center border-t sm:border-t-0 sm:border-x border-[#EAE3D7] pt-3 sm:pt-0 sm:px-3">
                    <span className="font-serif font-bold text-stone-900 text-base mb-0.5">
                      {lang === 'it' ? 'Piscina & Oasi Esclusiva' : 'Exclusive Pool & Oasis'}
                    </span>
                    <span className="text-stone-500 font-light text-xs">
                      {lang === 'it' ? 'Nessun altro ospite nella tenuta' : 'No other guests on the property'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center pt-3 sm:pt-0">
                    <span className="font-serif font-bold text-stone-900 text-base mb-0.5">
                      {lang === 'it' ? 'Accoglienza Dedicata' : 'Dedicated Care'}
                    </span>
                    <span className="text-stone-500 font-light text-xs">
                      {lang === 'it' ? 'Contatto e consigli di Antonella' : 'Direct host support from Antonella'}
                    </span>
                  </div>
                </div>

                {/* Refined Luxury Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
                  <a
                    href={getWhatsAppUrl(
                      lang === 'it'
                        ? "Salve Antonella, vorrei richiedere disponibilità e informazioni per affittare l'intera tenuta Trullo dei Messapi in esclusiva."
                        : "Hello Antonella, I would like to request availability and information to rent the entire Trullo dei Messapi estate exclusively."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#B99470] hover:bg-[#A37E5A] text-white font-medium text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle size={17} />
                    <span>
                      {lang === 'it'
                        ? 'Richiedi l’esclusiva su WhatsApp'
                        : 'Request exclusivity on WhatsApp'}
                    </span>
                  </a>

                  <button
                    onClick={() => navigate('preventivo')}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl border border-[#D5CCC0] bg-white hover:bg-[#FAF7F2] text-stone-800 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-[#B99470]"
                  >
                    <span>{t.accommodations.estateExclusiveBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* === ROUTE: PISCINA & JACUZZI === */}
        {/* ==================================================== */}
        {currentRoute === 'piscina' && (
          <div className="animate-in fade-in duration-500 bg-white">
            <PoolSection lang={lang} onNavigate={navigate} />
          </div>
        )}

        {/* ==================================================== */}
        {/* === ROUTE: PRENOTA (PREVENTIVO) === */}
        {/* ==================================================== */}
        {currentRoute === 'preventivo' && (
          <div className="animate-in fade-in duration-500 bg-white">
            <QuoteCalculator
              lang={lang}
              preselectedSuite={calculatorSuite}
              initialCheckIn={calculatorCheckIn}
              initialCheckOut={calculatorCheckOut}
            />
          </div>
        )}

        {/* ==================================================== */}
        {/* === ROUTE: CONTATTI & DOVE SIAMO === */}
        {/* ==================================================== */}
        {currentRoute === 'contatti' && (
          <div className="animate-in fade-in duration-500 bg-white">
            <ContactSection lang={lang} />
          </div>
        )}
      </main>

      {/* 3. LUXURY FOOTER */}
      <Footer lang={lang} onNavigate={navigate} />

      {/* 4. MODAL FOR SUITE DETAILS & FULL-SCREEN PHOTO GALLERY */}
      <AccommodationModal
        accommodation={activeModalAccommodation}
        lang={lang}
        onClose={() => setActiveModalAccommodation(null)}
        onSelectForQuote={(id) => {
          setActiveModalAccommodation(null);
          handleSelectAccommodationForQuote(id);
        }}
      />

      {/* 5. PERSISTENT FLOATING WHATSAPP BUTTON */}
      <aside aria-label="WhatsApp Quick Contact" className="fixed bottom-6 right-6 z-40">
        <a
          href={getWhatsAppUrl(
            lang === 'it'
              ? 'Salve Antonella! Vorrei informazioni su Trullo dei Messapi'
              : 'Hello Antonella! I would like information about Trullo dei Messapi'
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
          title="Contatta Antonella su WhatsApp"
        >
          <MessageCircle size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline font-semibold text-xs uppercase tracking-wider">
            {lang === 'it' ? 'Scrivici su WhatsApp' : 'Chat on WhatsApp'}
          </span>
        </a>
      </aside>
    </div>
  );
};
