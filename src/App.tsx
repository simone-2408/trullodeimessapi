import React, { useState } from 'react';
import { Language, Accommodation } from './types';
import { useAppRouter } from './utils/router';
import { TRANSLATIONS } from './data/translations';
import { ACCOMMODATIONS } from './data/accommodations';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AccommodationCard } from './components/AccommodationCard';
import { AccommodationModal } from './components/AccommodationModal';
import { PoolSection } from './components/PoolSection';
import { ExperienceSection } from './components/ExperienceSection';
import { QuoteCalculator } from './components/QuoteCalculator';
import { RatesTable } from './components/RatesTable';
import { LocationSection } from './components/LocationSection';
import { ReviewsSection } from './components/ReviewsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MessageCircle, Sparkles, ArrowRight, Compass } from 'lucide-react';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('it');
  const [currentRoute, navigate] = useAppRouter();
  const [activeModalAccommodation, setActiveModalAccommodation] =
    useState<Accommodation | null>(null);

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

  const handleOpenSuiteDetailsById = (
    id: 'quercia' | 'corbezzolo' | 'melograno'
  ) => {
    const acc = ACCOMMODATIONS.find((a) => a.id === id);
    if (acc) {
      setActiveModalAccommodation(acc);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#22252A] flex flex-col selection:bg-[#B99470] selection:text-white">
      {/* 1. PERSISTENT THREE.JS WEBGL CANVAS (Never reloads on route changes) */}
      <ThreeCanvas
        currentRoute={currentRoute}
        lang={lang}
        onSelectAccommodation={(id) => handleOpenSuiteDetailsById(id)}
        onOpenPoolGallery={() => navigate('piscina')}
      />

      {/* 2. PERSISTENT NAVIGATION BAR */}
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

      {/* 3. MULTI-PAGE ROUTE VIEWS (Rendered over the persistent 3D Canvas) */}
      <main className="relative z-10 flex-grow pt-16">
        {/* === ROUTE: / or /home === */}
        {currentRoute === 'home' && (
          <div className="animate-in fade-in duration-500 space-y-16">
            <Hero
              lang={lang}
              onQuickSearch={({ accommodationId, checkIn, checkOut }) => {
                if (accommodationId) setCalculatorSuite(accommodationId);
                if (checkIn) setCalculatorCheckIn(checkIn);
                if (checkOut) setCalculatorCheckOut(checkOut);
                navigate('preventivo');
              }}
            />

            {/* Quick 3D Exploration Banner */}
            <div className="max-w-5xl mx-auto px-4">
              <div className="bg-[#1E2226]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 text-white border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#B99470] uppercase font-bold tracking-widest">
                    <Sparkles size={14} />
                    <span>{lang === 'it' ? 'Esperienza 3D Interattiva' : 'Interactive 3D Experience'}</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold">
                    {lang === 'it'
                      ? 'Esplora la Tenuta in 3D: Clicca sulle Dimore'
                      : 'Explore the Estate in 3D: Click on the Suites'}
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm font-light">
                    {lang === 'it'
                      ? 'Naviga tra le pagine per vivere le inquadrature cinematografiche della tenuta o clicca sui punti interattivi.'
                      : 'Navigate between pages to experience cinematic camera angles or click on interactive 3D hotspots.'}
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => navigate('suites')}
                    className="bg-[#B99470] hover:bg-[#A37E5A] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t.nav.accommodations}</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => navigate('piscina')}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t.nav.pool}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Overview of the 3 Suites */}
            <section className="py-12 bg-[#FAF8F5]/85 backdrop-blur-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <span className="text-xs uppercase tracking-widest text-[#B99470] font-bold block mb-2">
                    {t.accommodations.sectionTag}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
                    {t.accommodations.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {ACCOMMODATIONS.map((acc) => (
                    <AccommodationCard
                      key={acc.id}
                      accommodation={acc}
                      lang={lang}
                      onOpenDetails={(item) => setActiveModalAccommodation(item)}
                      onSelectForQuote={(id) => handleSelectAccommodationForQuote(id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Guest Reviews Snippet on Home */}
            <div className="bg-[#FAF8F5]/90 backdrop-blur-md">
              <ReviewsSection lang={lang} />
            </div>
          </div>
        )}

        {/* === ROUTE: /suites === */}
        {currentRoute === 'suites' && (
          <div className="animate-in fade-in duration-500 py-12 bg-[#FAF8F5]/85 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B99470]/15 text-[#8A6743] text-xs font-bold uppercase tracking-widest mb-3">
                  <Sparkles size={14} />
                  <span>{t.accommodations.sectionTag}</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
                  {t.accommodations.title}
                </h1>
                <p className="mt-4 text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                  {t.accommodations.subtitle}
                </p>
                <div className="mt-4 text-xs text-[#B99470] font-semibold flex items-center justify-center gap-2">
                  <Compass size={14} />
                  <span>
                    {lang === 'it'
                      ? 'Guarda la scena 3D: la telecamera è posizionata direttamente nella corte delle 3 dimore.'
                      : 'Notice the 3D scene: camera is smoothly positioned right in front of the suites.'}
                  </span>
                </div>
              </div>

              {/* 3 Accommodation Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                {ACCOMMODATIONS.map((acc) => (
                  <AccommodationCard
                    key={acc.id}
                    accommodation={acc}
                    lang={lang}
                    onOpenDetails={(item) => setActiveModalAccommodation(item)}
                    onSelectForQuote={(id) => handleSelectAccommodationForQuote(id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === ROUTE: /piscina === */}
        {currentRoute === 'piscina' && (
          <div className="animate-in fade-in duration-500 py-8 bg-[#FAF8F5]/85 backdrop-blur-md">
            <PoolSection lang={lang} />
          </div>
        )}

        {/* === ROUTE: /esperienza === */}
        {currentRoute === 'esperienza' && (
          <div className="animate-in fade-in duration-500 py-8 bg-[#FAF8F5]/85 backdrop-blur-md">
            <ExperienceSection lang={lang} />
          </div>
        )}

        {/* === ROUTE: /preventivo === */}
        {currentRoute === 'preventivo' && (
          <div className="animate-in fade-in duration-500 py-8 bg-[#FAF8F5]/90 backdrop-blur-md space-y-12">
            <QuoteCalculator
              lang={lang}
              preselectedSuite={calculatorSuite}
              initialCheckIn={calculatorCheckIn}
              initialCheckOut={calculatorCheckOut}
            />
            <RatesTable lang={lang} />
          </div>
        )}

        {/* === ROUTE: /contatti === */}
        {currentRoute === 'contatti' && (
          <div className="animate-in fade-in duration-500 py-8 bg-[#FAF8F5]/90 backdrop-blur-md space-y-12">
            <ContactSection lang={lang} />
            <LocationSection lang={lang} />
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <Footer lang={lang} />

      {/* 5. MODAL FOR SUITE DETAILS & FULL-SCREEN PHOTO GALLERY */}
      <AccommodationModal
        accommodation={activeModalAccommodation}
        lang={lang}
        onClose={() => setActiveModalAccommodation(null)}
        onSelectForQuote={(id) => {
          setActiveModalAccommodation(null);
          handleSelectAccommodationForQuote(id);
        }}
      />

      {/* 6. PERSISTENT FLOATING WHATSAPP BUTTON */}
      <aside aria-label="WhatsApp Quick Contact" className="fixed bottom-6 right-6 z-40">
        <a
          href="https://wa.me/393333339347?text=Salve%20Antonella!%20Vorrei%20informazioni%20su%20Trullo%20dei%20Messapi"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
          title="Contatta Antonella su WhatsApp"
        >
          <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline font-semibold text-sm">
            {lang === 'it' ? 'Scrivici su WhatsApp' : 'Chat on WhatsApp'}
          </span>
        </a>
      </aside>
    </div>
  );
};
