import React, { useEffect, useRef, useState } from 'react';
import { AppRoute } from '../three/types';
import { PinnacleScene } from '../three/PinnacleScene';
import { Language } from '../types';
import { Sparkles, ZoomIn, ZoomOut, RotateCcw, Play, Pause } from 'lucide-react';

interface PinnacleShowcaseProps {
  currentRoute: AppRoute;
  lang: Language;
  onNavigate?: (route: AppRoute) => void;
}

type DetailType = 'overview' | 'sphere' | 'chalice' | 'stones';

export const PinnacleShowcase: React.FC<PinnacleShowcaseProps> = ({
  currentRoute,
  lang,
  onNavigate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PinnacleScene | null>(null);
  const [activeDetail, setActiveDetail] = useState<DetailType>('overview');
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const tourTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new PinnacleScene({
      container: containerRef.current,
      initialRoute: currentRoute,
    });
    sceneRef.current = scene;

    return () => {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
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

  const detailSequence: DetailType[] = ['overview', 'sphere', 'chalice', 'stones'];

  const handleSelectDetail = (detail: DetailType) => {
    if (isTourPlaying) {
      setIsTourPlaying(false);
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    }
    setActiveDetail(detail);
    sceneRef.current?.focusDetail(detail);
  };

  const toggleTour = () => {
    if (isTourPlaying) {
      setIsTourPlaying(false);
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    } else {
      setIsTourPlaying(true);
      const currentIndex = detailSequence.indexOf(activeDetail);
      const nextIndex = (currentIndex + 1) % detailSequence.length;
      const nextDetail = detailSequence[nextIndex];
      setActiveDetail(nextDetail);
      sceneRef.current?.focusDetail(nextDetail);

      tourTimerRef.current = window.setInterval(() => {
        setActiveDetail((prev) => {
          const idx = detailSequence.indexOf(prev);
          const next = detailSequence[(idx + 1) % detailSequence.length];
          sceneRef.current?.focusDetail(next);
          return next;
        });
      }, 3800);
    }
  };

  // Route-specific editorial narratives
  const narrative = {
    home: {
      tag: lang === 'it' ? 'Scultura & Memoria' : 'Sculpture & Memory',
      title:
        lang === 'it'
          ? 'Il pinnacolo: il dialogo tra pietra e cielo'
          : 'The pinnacle: dialogue between stone and sky',
      desc1:
        lang === 'it'
          ? 'Sulla sommità di ogni cono in pietra a secco svetta il pinnacolo in pietra calcarea, scolpito a mano da generazioni: antico simbolo di equilibrio tra la terra e il cielo.'
          : 'At the top of each dry-stone cone stands the hand-chiseled limestone pinnacle: a timeless symbol of harmony between earth and sky.',
      desc2:
        lang === 'it'
          ? 'Un’architettura essenziale e silenziosa, plasmata dall’antica sapienza rurale pugliese per fondersi con il paesaggio della Valle d’Itria.'
          : 'An essential, quiet architecture shaped by ancient rural wisdom to blend seamlessly with the landscape of the Itria Valley.',
    },
    suites: {
      tag: lang === 'it' ? 'Dimore di Pietra' : 'Stone Dwellings',
      title:
        lang === 'it'
          ? 'Il cono maestro del Trullo Quercia'
          : 'The Master Cone of Trullo Quercia',
      desc1:
        lang === 'it'
          ? 'Il cono centrale originario del XVII secolo conserva il fascino intatto delle antiche corti rurali, restaurato nel rispetto rigoroso della materia d’origine.'
          : 'The original 17th-century stone cone preserves the untouched charm of rural courtyards, restored in harmony with traditional materials.',
      desc2:
        lang === 'it'
          ? 'Le spesse mura in pietra naturale donano un silenzio profondo e una naturale freschezza, ideale per ritrovare il riposo più autentico.'
          : 'Thick natural stone walls offer deep silence and natural coolness, ideal for profound and restful sleep.',
    },
    piscina: {
      tag: lang === 'it' ? 'Acqua & Natura' : 'Water & Nature',
      title:
        lang === 'it'
          ? 'La trasparenza dell’acqua tra gli ulivi'
          : 'Clear waters amidst the olive trees',
      desc1:
        lang === 'it'
          ? 'Uno specchio d’acqua e idromassaggio adagiati tra muretti a secco, prato e ulivi secolari, per vivere il contatto con la natura sotto il cielo aperto.'
          : 'A serene pool and hydromassage nestled among dry-stone walls, lawns, and olive trees, embracing open-air nature under clear skies.',
      desc2:
        lang === 'it'
          ? 'Uno spazio intimo riservato solo agli ospiti delle tre dimore, dove la quiete della campagna accompagna il riposo.'
          : 'An intimate space reserved only for guests of our three dwellings, where countryside quiet accompanies true rest.',
    },
    esperienza: {
      tag: lang === 'it' ? 'I Ritmi della Terra' : 'Rhythms of the Earth',
      title:
        lang === 'it'
          ? 'L’accoglienza semplice di Antonella'
          : 'Antonella’s gentle welcome',
      desc1:
        lang === 'it'
          ? 'Al Trullo dei Messapi l’ospitalità è discreta e autentica. Antonella vi accoglie personalmente, condividendo con cura i luoghi più genuini della Valle d’Itria.'
          : 'At Trullo dei Messapi, hospitality is discreet and authentic. Antonella welcomes you personally, sharing the most genuine treasures of the Itria Valley.',
      desc2:
        lang === 'it'
          ? 'Dall’olio extravergine dei nostri ulivi alla tranquillità della corte in pietra, un invito a riscoprire la bellezza dei ritmi lenti.'
          : 'From the extra virgin olive oil of our trees to the calm of stone courtyards, an invitation to rediscover the beauty of slow living.',
    },
    preventivo: {
      tag: lang === 'it' ? 'Contatto Diretto' : 'Direct Contact',
      title:
        lang === 'it'
          ? 'Prenota il tuo soggiorno al Trullo dei Messapi'
          : 'Book your stay at Trullo dei Messapi',
      desc1:
        lang === 'it'
          ? 'Nessun intermediario o commissione. Seleziona le date desiderate per verificare la stima e inviare la richiesta direttamente ad Antonella su WhatsApp o via Email.'
          : 'No intermediaries or booking fees. Select your dates to estimate your stay and send your request directly to Antonella via WhatsApp or Email.',
      desc2:
        lang === 'it'
          ? 'Accordi personalizzati e disponibilità concordati direttamente con la proprietaria.'
          : 'Personalized arrangements and availability agreed directly with the owner.',
    },
    contatti: {
      tag: lang === 'it' ? 'La Posizione' : 'The Location',
      title:
        lang === 'it'
          ? 'Nel cuore quieto della Valle d’Itria'
          : 'In the quiet heart of Itria Valley',
      desc1:
        lang === 'it'
          ? 'Siamo a Ceglie Messapica, circondati dalla campagna e a pochi chilometri dai borghi bianchi e dalle coste pugliesi.'
          : 'Located in Ceglie Messapica, surrounded by peaceful countryside and minutes from whitewashed villages and coastal shores.',
      desc2:
        lang === 'it'
          ? 'Contatta direttamente Antonella per qualsiasi informazione o per concordare al meglio il tuo arrivo.'
          : 'Contact Antonella directly for any inquiries or to prepare your arrival.',
    },
  }[currentRoute];

  const detailItems: { id: DetailType; labelIt: string; labelEn: string; descIt: string; descEn: string }[] = [
    {
      id: 'overview',
      labelIt: 'Vista d’insieme',
      labelEn: 'Overview',
      descIt: 'Il cono e il pinnacolo maestri',
      descEn: 'Master cone & pinnacle',
    },
    {
      id: 'sphere',
      labelIt: 'La Sfera',
      labelEn: 'The Sphere',
      descIt: 'Simbolo del cosmo e del cielo',
      descEn: 'Symbol of cosmos and sky',
    },
    {
      id: 'chalice',
      labelIt: 'Il Calice',
      labelEn: 'The Chalice',
      descIt: 'Pietra scolpita a scalpello',
      descEn: 'Hand-chiseled limestone',
    },
    {
      id: 'stones',
      labelIt: 'Le Chiancarelle',
      labelEn: 'The Chiancarelle',
      descIt: 'Pietra a secco a gradoni',
      descEn: 'Layered dry-stone conical roof',
    },
  ];

  return (
    <section id="trullo-3d" className="w-full bg-[#161514] text-white border-b border-[#2A2826] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full min-h-[640px] lg:min-h-[760px]">
        {/* LEFT COLUMN: Haute Editorial & Architectural Narrative */}
        <div className="lg:col-span-6 p-8 sm:p-14 lg:p-16 xl:p-24 flex flex-col justify-center">
          <div className="max-w-xl">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B99470]/15 border border-[#B99470]/30 text-[#EAD8C0] text-xs font-semibold tracking-[0.2em] uppercase mb-4 shadow-sm">
              <Sparkles size={13} className="text-[#B99470]" />
              <span>{narrative.tag}</span>
            </div>

            {/* Editorial Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal tracking-wide text-white leading-tight">
              {narrative.title}
            </h2>

            {/* Warm Gold Accent Divider */}
            <div className="w-16 h-[2px] bg-[#B99470] my-6" />

            {/* Paragraphs */}
            <div className="space-y-4 text-white/80 font-light text-sm sm:text-base leading-relaxed mb-8">
              <p>{narrative.desc1}</p>
              <p>{narrative.desc2}</p>
            </div>

            {/* Interactive Detail Inspection Bar with Cinematic Tour Option */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#B99470] font-semibold">
                  {lang === 'it' ? 'Dettagli architettonici' : 'Architectural details'}
                </span>
                <button
                  onClick={toggleTour}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
                    isTourPlaying
                      ? 'bg-[#B99470] border-[#B99470] text-white shadow-[0_0_20px_rgba(185,148,112,0.45)]'
                      : 'bg-white/10 hover:bg-white/15 border-white/20 text-[#EAD8C0]'
                  }`}
                >
                  {isTourPlaying ? (
                    <Pause size={12} className="text-white" />
                  ) : (
                    <Play size={12} className="fill-current text-[#EAD8C0]" />
                  )}
                  <span className="font-serif text-xs tracking-wider font-medium">
                    {isTourPlaying
                      ? (lang === 'it' ? 'Pausa Tour' : 'Pause Tour')
                      : (lang === 'it' ? 'Tour 3D Cinematico' : 'Cinematic 3D Tour')}
                  </span>
                </button>
              </div>

              {/* 4 Detail Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                {detailItems.map((item) => {
                  const isActive = activeDetail === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectDetail(item.id)}
                      className={`group/btn text-left p-3.5 rounded-xl border transition-all duration-500 cursor-pointer relative overflow-hidden ${
                        isActive
                          ? 'bg-[#B99470]/25 border-[#B99470] text-white shadow-[0_0_25px_rgba(185,148,112,0.25)] scale-[1.02]'
                          : 'bg-white/5 border-white/10 hover:border-white/25 text-white/75 hover:text-white hover:bg-white/8'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B99470] shadow-[0_0_10px_#B99470]" />
                      )}
                      <div className="flex items-center gap-2.5 mb-1.5 pl-1">
                        <div className="relative flex items-center justify-center">
                          <span
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              isActive ? 'bg-[#B99470] shadow-[0_0_8px_#B99470]' : 'bg-white/30'
                            }`}
                          />
                          {isActive && (
                            <span className="absolute w-4 h-4 rounded-full bg-[#B99470]/40 animate-ping" />
                          )}
                        </div>
                        <span className="font-serif text-sm font-medium tracking-wide">
                          {lang === 'it' ? item.labelIt : item.labelEn}
                        </span>
                      </div>
                      <span className="block text-xs text-white/60 font-light pl-6">
                        {lang === 'it' ? item.descIt : item.descEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Action Link */}
            {currentRoute !== 'preventivo' && onNavigate && (
              <div>
                <button
                  onClick={() => onNavigate('preventivo')}
                  className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.2em] text-[#B99470] hover:text-[#EAD8C0] transition-colors cursor-pointer group"
                >
                  <span>
                    {lang === 'it'
                      ? 'Verifica disponibilità per il tuo soggiorno'
                      : 'Check availability for your dates'}
                  </span>
                  <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Cinematic Three.js 3D Sculptural Canvas */}
        <div className="lg:col-span-6 relative w-full h-[520px] sm:h-[620px] lg:h-full min-h-[580px] flex items-center justify-center bg-gradient-to-b from-[#181715] via-[#151413] to-[#121110]">
          {/* Warm Radial Ambient Glow behind the Sculpture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(185,148,112,0.18)_0%,_rgba(22,21,20,0)_70%)] pointer-events-none filter blur-3xl" />

          {/* THREE.JS CONTAINER ELEMENT */}
          <div
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
            style={{ touchAction: 'none' }}
          />

          {/* Interactive Camera Quick Tools (Top Right) */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button
              onClick={() => sceneRef.current?.zoomIn()}
              title={lang === 'it' ? 'Ingrandisci' : 'Zoom in'}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-[#B99470] backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={() => sceneRef.current?.zoomOut()}
              title={lang === 'it' ? 'Rimpicciolisci' : 'Zoom out'}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-[#B99470] backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
            >
              <ZoomOut size={15} />
            </button>
            <button
              onClick={() => {
                if (isTourPlaying) {
                  setIsTourPlaying(false);
                  if (tourTimerRef.current) clearInterval(tourTimerRef.current);
                }
                setActiveDetail('overview');
                sceneRef.current?.resetView();
              }}
              title={lang === 'it' ? 'Reimposta visuale' : 'Reset view'}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-[#B99470] backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Floating Luxury 3D Interaction Pill (Bottom Right) */}
          <div className="absolute bottom-6 right-6 z-20 pointer-events-none bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-xl flex items-center gap-2.5 text-xs text-[#EAD8C0]">
            <span className="w-2 h-2 rounded-full bg-[#B99470] animate-pulse" />
            <span className="font-light">
              {lang === 'it'
                ? 'Scultura 3D • Trascina per ruotare a 360°'
                : '3D Sculpture • Drag to rotate 360°'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
