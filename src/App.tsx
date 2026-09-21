import React, { useState } from 'react';
import { Language, Accommodation } from './types';
import { TRANSLATIONS } from './data/translations';
import { ACCOMMODATIONS } from './data/accommodations';
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
import { MessageCircle, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('it');
  const [activeModalAccommodation, setActiveModalAccommodation] =
    useState<Accommodation | null>(null);

  // States passed to the QuoteCalculator
  const [calculatorSuite, setCalculatorSuite] = useState<
    'quercia' | 'corbezzolo' | 'melograno'
  >('quercia');
  const [calculatorCheckIn, setCalculatorCheckIn] = useState<string>('');
  const [calculatorCheckOut, setCalculatorCheckOut] = useState<string>('');

  const t = TRANSLATIONS[lang];

  const scrollToCalculator = (
    suiteId?: 'quercia' | 'corbezzolo' | 'melograno',
    checkIn?: string,
    checkOut?: string
  ) => {
    if (suiteId) setCalculatorSuite(suiteId);
    if (checkIn) setCalculatorCheckIn(checkIn);
    if (checkOut) setCalculatorCheckOut(checkOut);

    const calcEl = document.getElementById('preventivo');
    if (calcEl) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = calcEl.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#22252A] flex flex-col selection:bg-[#B99470] selection:text-white">
      {/* Header & Navbar */}
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        onOpenCalculator={() => scrollToCalculator()}
      />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero
          lang={lang}
          onQuickSearch={({ accommodationId, checkIn, checkOut }) => {
            scrollToCalculator(accommodationId, checkIn, checkOut);
          }}
        />

        {/* Accommodations Showcase Section */}
        <section id="dimore" className="py-20 sm:py-28 bg-[#FAF8F5] relative scroll-mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B99470]/15 text-[#8A6743] text-xs font-bold uppercase tracking-widest mb-3">
                <Sparkles size={14} />
                <span>{t.accommodations.sectionTag}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {t.accommodations.title}
              </h2>
              <p className="mt-4 text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                {t.accommodations.subtitle}
              </p>
            </div>

            {/* 3 Accommodation Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {ACCOMMODATIONS.map((acc) => (
                <AccommodationCard
                  key={acc.id}
                  accommodation={acc}
                  lang={lang}
                  onOpenDetails={(item) => setActiveModalAccommodation(item)}
                  onSelectForQuote={(id) => scrollToCalculator(id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Pool & Outdoor Jacuzzi Section */}
        <PoolSection lang={lang} />

        {/* Experience & Storytelling Section (Antonella's Hospitality, Self-Made Breakfast, Olive Oil) */}
        <ExperienceSection lang={lang} />

        {/* Interactive Quote Calculator & Booking Inquiry */}
        <QuoteCalculator
          lang={lang}
          preselectedSuite={calculatorSuite}
          initialCheckIn={calculatorCheckIn}
          initialCheckOut={calculatorCheckOut}
        />

        {/* Official 2026 Rates Table */}
        <RatesTable lang={lang} />

        {/* Valle d'Itria Location & Surroundings */}
        <LocationSection lang={lang} />

        {/* Authentic Guest Reviews */}
        <ReviewsSection lang={lang} />

        {/* Direct Contact Section */}
        <ContactSection lang={lang} />
      </main>

      {/* Footer */}
      <Footer lang={lang} />

      {/* Modal for Accommodation Details & Gallery */}
      <AccommodationModal
        accommodation={activeModalAccommodation}
        lang={lang}
        onClose={() => setActiveModalAccommodation(null)}
        onSelectForQuote={(id) => {
          setActiveModalAccommodation(null);
          scrollToCalculator(id);
        }}
      />

      {/* Persistent Floating WhatsApp Quick Action Button */}
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
