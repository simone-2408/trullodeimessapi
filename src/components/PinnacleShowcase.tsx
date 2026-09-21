import React, { useEffect, useRef } from 'react';
import { AppRoute } from '../three/types';
import { PinnacleScene } from '../three/PinnacleScene';
import { Language } from '../types';
import { Sparkles } from 'lucide-react';

interface PinnacleShowcaseProps {
  currentRoute: AppRoute;
  lang: Language;
  onNavigate?: (route: AppRoute) => void;
}

export const PinnacleShowcase: React.FC<PinnacleShowcaseProps> = ({
  currentRoute,
  lang,
  onNavigate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PinnacleScene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new PinnacleScene({
      container: containerRef.current,
      initialRoute: currentRoute,
    });
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Update route choreography when route changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setRoute(currentRoute);
    }
  }, [currentRoute]);

  // Route-specific editorial narratives for the 60% Left column
  const narrative = {
    home: {
      tag: lang === 'it' ? 'Scultura e tradizione' : 'Sculpture & Heritage',
      title:
        lang === 'it'
          ? 'Il pinnacolo del trullo: custode di pietra e simbolo apotropaico'
          : 'The Trullo Pinnacle: Stone Guardian & Sacred Apotropaic Symbol',
      desc1:
        lang === 'it'
          ? 'Sulla sommità del cono in chiancarelle a secco svetta il pinnacolo, scolpito a mano nella calcarenite pugliese. Non è un semplice ornamento, ma il sigillo che un tempo identificava la maestranza del trullaro e proteggeva la dimora e la famiglia.'
          : 'At the very peak of the dry-stone chiancarelle cone stands the pinnacle, hand-chiseled from local Apulian limestone. Far more than a decorative finial, it was the historic seal of the master trullaro, safeguarding the dwelling and family.',
      desc2:
        lang === 'it'
          ? 'Al Trullo dei Messapi ogni pietra racconta una storia di lavoro artigiano, luce mediterranea e rispetto profondo per l’architettura rurale della Valle d’Itria.'
          : 'At Trullo dei Messapi, every single stone tells a story of artisan craftsmanship, Mediterranean light, and deep reverence for the rural heritage of Valle d’Itria.',
      specs: [
        { label: lang === 'it' ? 'Materiale' : 'Material', val: lang === 'it' ? 'Pietra calcarea a scalpello' : 'Hand-chiseled limestone' },
        { label: lang === 'it' ? 'Tecnica' : 'Technique', val: lang === 'it' ? 'Posa a secco (chiancarelle)' : 'Dry-stone stacking' },
        { label: lang === 'it' ? 'Significato' : 'Meaning', val: lang === 'it' ? 'Simbolo solare e cosmico' : 'Solar & cosmic symbol' },
      ],
    },
    suites: {
      tag: lang === 'it' ? 'Architettura delle dimore' : 'Suite Architecture',
      title:
        lang === 'it'
          ? 'Il cono maestro della suite Trullo Quercia'
          : 'The Master Cone of Suite Trullo Quercia',
      desc1:
        lang === 'it'
          ? 'La nostra Suite Quercia conserva il cono centrale originario del XVII secolo con il suo maestoso pinnacolo a sfera lapidea, perfettamente restaurato secondo i canoni della bioedilizia pugliese.'
          : 'Our Quercia Suite preserves the original 17th-century central cone with its majestic limestone sphere pinnacle, meticulously restored following traditional Apulian conservation principles.',
      desc2:
        lang === 'it'
          ? 'All’interno, gli archi a tutto sesto e le spesse mura in pietra naturale mantengono un microclima fresco e silenzioso per un riposo rigenerante.'
          : 'Inside, rounded stone arches and thick natural stone walls create a naturally cool, quiet microclimate for serene, restoring sleep.',
      specs: [
        { label: lang === 'it' ? 'Epoca' : 'Era', val: lang === 'it' ? 'Seicento rurale' : '17th Century rural' },
        { label: lang === 'it' ? 'Mura' : 'Walls', val: lang === 'it' ? 'Spessore fino a 1,80 m' : 'Up to 1.80m thickness' },
        { label: lang === 'it' ? 'Ambiente' : 'Climate', val: lang === 'it' ? 'Termoisolamento naturale' : 'Natural thermal insulation' },
      ],
    },
    piscina: {
      tag: lang === 'it' ? 'La pietra e l’acqua' : 'Stone & Water',
      title:
        lang === 'it'
          ? 'L’armonia tra chianche bianche e acque cristalline'
          : 'The Harmony Between White Stone & Turquoise Waters',
      desc1:
        lang === 'it'
          ? 'La nostra piscina e la vasca idromassaggio sono state incastonate nel paesaggio tra muretti a secco, gazebi in legno sbiancato e pavimentazioni in pietra naturale levigata dal sole.'
          : 'Our swimming pool and hydromassage Jacuzzi are seamlessly nestled among dry-stone walls, whitewashed pergolas, and sun-warmed natural stone paving.',
      desc2:
        lang === 'it'
          ? 'Uno spazio di benessere intimo riservato esclusivamente agli ospiti delle 3 dimore della tenuta, per garantire silenzio e totale privacy.'
          : 'An intimate sanctuary exclusively reserved for guests of our 3 private suites, ensuring absolute silence and peaceful privacy.',
      specs: [
        { label: lang === 'it' ? 'Piscina' : 'Pool', val: lang === 'it' ? 'Acqua dolce panoramica' : 'Panoramic freshwater' },
        { label: lang === 'it' ? 'Benessere' : 'Wellness', val: lang === 'it' ? 'Jacuzzi idromassaggio' : 'Hydromassage Jacuzzi' },
        { label: lang === 'it' ? 'Privacy' : 'Privacy', val: lang === 'it' ? 'Solo per i residenti' : 'Resident guests only' },
      ],
    },
    esperienza: {
      tag: lang === 'it' ? 'Vivere la Puglia' : 'The Apulian Lifestyle',
      title:
        lang === 'it'
          ? 'L’autentica accoglienza pugliese di Antonella'
          : 'Antonella’s Authentic Warm Apulian Welcome',
      desc1:
        lang === 'it'
          ? 'Al Trullo dei Messapi l’ospitalità è un’arte antica. Antonella vi accoglie personalmente, guidandovi alla scoperta dei segreti più autentici di Ceglie Messapica e della Valle d’Itria.'
          : 'At Trullo dei Messapi, hospitality is a timeless art. Antonella welcomes you personally, sharing insider recommendations for authentic trattorias and hidden gems across Valle d’Itria.',
      desc2:
        lang === 'it'
          ? 'Assaporate l’olio extravergine d’oliva biologico prodotto direttamente dai nostri ulivi secolari e godetevi la totale libertà della vostra cucina privata.'
          : 'Taste the organic extra virgin olive oil pressed directly from our ancient estate olive trees and enjoy total culinary freedom in your fully equipped private kitchen.',
      specs: [
        { label: lang === 'it' ? 'Olio EVO' : 'EVO Oil', val: lang === 'it' ? 'Dagli ulivi della tenuta' : 'From estate olive grove' },
        { label: lang === 'it' ? 'Cucina' : 'Kitchen', val: lang === 'it' ? 'Attrezzata in ogni suite' : 'Equipped in every suite' },
        { label: lang === 'it' ? 'Host' : 'Host', val: lang === 'it' ? 'Antonella sempre presente' : 'Antonella directly on site' },
      ],
    },
    preventivo: {
      tag: lang === 'it' ? 'Prenotazione diretta' : 'Direct Booking',
      title:
        lang === 'it'
          ? 'Prenota il tuo soggiorno direttamente con Antonella'
          : 'Book Your Stay Directly with Antonella',
      desc1:
        lang === 'it'
          ? 'Nessun costo di agenzia o commissione di portali terzi. Inserisci le date nel modulo sottostante, verifica il calcolo esatto del soggiorno e invia la richiesta con un click su WhatsApp o via Email.'
          : 'Zero intermediary booking fees or third-party commissions. Enter your dates in the form below, check the exact total, and send your request directly via WhatsApp or Email.',
      desc2:
        lang === 'it'
          ? 'Concorda direttamente la caparra e ogni dettaglio personalizzato con Antonella.'
          : 'Agree directly on deposit arrangements and personalized stay requests with Antonella.',
      specs: [
        { label: lang === 'it' ? 'Commissioni' : 'Fees', val: lang === 'it' ? '0% diretta con l’host' : '0% Direct with owner' },
        { label: lang === 'it' ? 'Contatto' : 'Contact', val: 'WhatsApp / email' },
        { label: lang === 'it' ? 'Flessibilità' : 'Flexibility', val: lang === 'it' ? 'Accordi personalizzati' : 'Tailored arrangements' },
      ],
    },
    contatti: {
      tag: lang === 'it' ? 'Informazioni e posizione' : 'Inquiries & Location',
      title:
        lang === 'it'
          ? 'Siamo a Ceglie Messapica, nel cuore della Puglia'
          : 'Located in Ceglie Messapica, the Heart of Puglia',
      desc1:
        lang === 'it'
          ? 'La tenuta si trova in Contrada Pisciacalze a Ceglie Messapica (BR), a pochi minuti dalla capitale gastronomica della Valle d’Itria e a breve distanza dalle spiagge dell’Adriatico.'
          : 'The estate is situated in Contrada Pisciacalze in Ceglie Messapica (BR), minutes away from the culinary capital of Valle d’Itria and close to crystal Adriatic beaches.',
      desc2:
        lang === 'it'
          ? 'Contattaci telefonicamente o su WhatsApp per qualunque domanda su disponibilità, itinerari o transfer aeroportuali.'
          : 'Reach out to us via telephone or WhatsApp for any questions regarding availability, local itineraries, or airport transfers.',
      specs: [
        { label: lang === 'it' ? 'Comune' : 'Town', val: 'Ceglie Messapica (BR)' },
        { label: 'Valle d’Itria', val: 'Ostuni 15km • Mare 25km' },
        { label: lang === 'it' ? 'Aeroporti' : 'Airports', val: 'BDS 35 min • BRI 70 min' },
      ],
    },
  }[currentRoute];

  return (
    <section className="relative py-14 sm:py-20 bg-gradient-to-b from-white via-[#FAF8F5] to-white border-y border-[#E8DEC8]/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN (60%): Editorial, Crystal-Clear Legible Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B99470]/10 border border-[#B99470]/20 text-[#8A6743] text-xs font-semibold tracking-wider uppercase">
              <Sparkles size={13} className="text-[#B99470]" />
              <span>{narrative.tag}</span>
            </div>

            {/* Editorial Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-[1.2] text-balance">
              {narrative.title}
            </h2>

            {/* Paragraphs */}
            <p className="text-base sm:text-lg text-gray-700 font-light leading-relaxed">
              {narrative.desc1}
            </p>
            <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
              {narrative.desc2}
            </p>

            {/* Architectural / Stay Specifications Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              {narrative.specs.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/90 border border-[#E8DEC8]/70 rounded-2xl p-3.5 shadow-xs"
                >
                  <span className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1">
                    {item.label}
                  </span>
                  <span className="font-serif font-semibold text-sm sm:text-base text-gray-900">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>

            {/* Direct Action Link */}
            {currentRoute !== 'preventivo' && onNavigate && (
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('preventivo')}
                  className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#B99470] hover:text-[#8A6743] transition-colors cursor-pointer group"
                >
                  <span>{lang === 'it' ? 'Verifica disponibilità per il tuo soggiorno' : 'Check availability for your dates'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (40%): Dedicated Three.js 3D Sculptural Canvas */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            {/* Interactive 3D Canvas Box with Transparent Background */}
            <div className="relative w-full h-[380px] sm:h-[450px] lg:h-[500px] flex items-center justify-center">
              {/* Soft Radial Ambient Aura Behind the Sculpture */}
              <div className="absolute inset-0 bg-radial from-[#F5EFE6]/60 via-transparent to-transparent rounded-full filter blur-2xl pointer-events-none" />

              {/* THREE.JS CONTAINER ELEMENT */}
              <div
                ref={containerRef}
                className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
                style={{ touchAction: 'none' }}
              />

              {/* Floating Architectural Badge */}
              <div className="absolute bottom-3 right-3 z-20 pointer-events-none bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E8DEC8]/70 shadow-xs flex items-center gap-2 text-[11px] text-gray-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{lang === 'it' ? 'Scultura 3D • Trascina per ruotare a 360°' : '3D Sculpture • Drag to rotate 360°'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
