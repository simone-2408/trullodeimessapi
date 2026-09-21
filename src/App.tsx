import React, { useState } from 'react';
import { Language, Accommodation } from './types';
import { useAppRouter } from './utils/router';
import { TRANSLATIONS } from './data/translations';
import { ACCOMMODATIONS } from './data/accommodations';
import { PinnacleShowcase } from './components/PinnacleShowcase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AccommodationCard } from './components/AccommodationCard';
import { AccommodationModal } from './components/AccommodationModal';
import { PoolSection } from './components/PoolSection';
import { ExperienceSection } from './components/ExperienceSection';
import { QuoteCalculator } from './components/QuoteCalculator';
import { LocationSection } from './components/LocationSection';
import { ReviewsSection } from './components/ReviewsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MessageCircle } from 'lucide-react';

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

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#22252A] flex flex-col selection:bg-[#B99470] selection:text-white">
      {/* 1. REFINED WHITE LUXURY NAVIGATION BAR */}
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

      {/* 2. MULTI-PAGE ROUTE VIEWS */}
      <main className="relative z-10 flex-grow pt-16">
        {/* === ROUTE: / or /home HERO (Pool & Gazebo Background) === */}
        {currentRoute === 'home' && (
          <Hero
            lang={lang}
            onQuickSearch={({ accommodationId, checkIn, checkOut }) => {
              if (accommodationId) setCalculatorSuite(accommodationId);
              if (checkIn) setCalculatorCheckIn(checkIn);
              if (checkOut) setCalculatorCheckOut(checkOut);
              navigate('preventivo');
            }}
          />
        )}

        {/* === DEDICATED 3D PINNACLE SHOWCASE (Confinato a colonna 40% a destra, sfondo trasparente, persistente con transizioni GSAP) === */}
        <PinnacleShowcase
          currentRoute={currentRoute}
          lang={lang}
          onNavigate={navigate}
        />

        {/* === ROUTE CONTENT: / or /home === */}
        {currentRoute === 'home' && (
          <div className="animate-in fade-in duration-500 space-y-12">
            {/* Overview of the 3 Suites */}
            <section className="py-16 bg-[#FAF8F5]/90 backdrop-blur-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-14">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#B99470] font-bold block mb-2">
                    {t.accommodations.sectionTag}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {t.accommodations.title}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                    {t.accommodations.subtitle}
                  </p>
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

            {/* Pool Teaser on Home */}
            <div className="bg-[#FAF8F5]/90 backdrop-blur-md">
              <PoolSection lang={lang} />
            </div>

            {/* Experience on Home */}
            <div className="bg-[#FAF8F5]/90 backdrop-blur-md">
              <ExperienceSection lang={lang} />
            </div>

            {/* Guest Reviews on Home */}
            <div className="bg-[#FAF8F5]/90 backdrop-blur-md">
              <ReviewsSection lang={lang} />
            </div>
          </div>
        )}

        {/* === ROUTE: /suites === */}
        {currentRoute === 'suites' && (
          <div className="animate-in fade-in duration-500 py-12 bg-[#FAF8F5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* 3 Accommodation Cards */}
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
          </div>
        )}

        {/* === ROUTE: /piscina === */}
        {currentRoute === 'piscina' && (
          <div className="animate-in fade-in duration-500 py-8 bg-[#FAF8F5]/90 backdrop-blur-md">
            <PoolSection lang={lang} />
          </div>
        )}

        {/* === ROUTE: /esperienza === */}
        {currentRoute === 'esperienza' && (
          <div className="animate-in fade-in duration-500 py-8 bg-[#FAF8F5]/90 backdrop-blur-md">
            <ExperienceSection lang={lang} />
          </div>
        )}

        {/* === ROUTE: /preventivo (Prenota) === */}
        {currentRoute === 'preventivo' && (
          <div className="animate-in fade-in duration-500 py-8 bg-[#FAF8F5]/90 backdrop-blur-md">
            <QuoteCalculator
              lang={lang}
              preselectedSuite={calculatorSuite}
              initialCheckIn={calculatorCheckIn}
              initialCheckOut={calculatorCheckOut}
            />
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
          <MessageCircle size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline font-semibold text-xs uppercase tracking-wider">
            {lang === 'it' ? 'Scrivici su WhatsApp' : 'Chat on WhatsApp'}
          </span>
        </a>
      </aside>
    </div>
  );
};
