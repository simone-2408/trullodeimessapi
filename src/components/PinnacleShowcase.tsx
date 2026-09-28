import { SiteLink } from './SiteLink';
import { SmartImage } from './SmartImage';
import React, { useEffect, useRef, useState } from 'react';
import { AppRoute } from '../three/types';
import type { PinnacleScene } from '../three/PinnacleScene';
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

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let inView = false;
    // Build the scene shortly before it scrolls into view; render only while actually visible.
    const loader = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      loader.disconnect();
      try {
        const { PinnacleScene } = await import('../three/PinnacleScene');
        if (cancelled) return;
        const scene = new PinnacleScene({ container, onError: () => { setFailed(true); setReady(false); } });
        sceneRef.current = scene;
        await scene.ready;
        if (cancelled) return;
        scene.setVisible(inView);
        setReady(true);
      } catch { if (!cancelled) setFailed(true); }
    }, { rootMargin: '600px 0px' });
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      setVisible(inView);
      sceneRef.current?.setVisible(inView);
    }, { threshold: .01 });
    loader.observe(container);
    observer.observe(container);
    return () => { cancelled = true; loader.disconnect(); observer.disconnect(); sceneRef.current?.dispose(); sceneRef.current = null; };
  }, []);
  useEffect(() => { sceneRef.current?.focusDetail(activeDetail); }, [activeDetail]);
  useEffect(() => {
    if (!isTourPlaying || !visible || !ready) return;
    const sequence: DetailType[] = ['overview', 'sphere', 'chalice', 'stones'];
    const timer = window.setInterval(() => { if (!document.hidden) setActiveDetail(previous => sequence[(sequence.indexOf(previous) + 1) % sequence.length]); }, 5500);
    return () => clearInterval(timer);
  }, [isTourPlaying, visible, ready]);
  const handleSelectDetail = (detail: DetailType) => { setIsTourPlaying(false); setActiveDetail(detail); };
  const toggleTour = () => setIsTourPlaying(previous => !previous);
  const narrative = {
    tag: lang === 'it' ? 'Architettura di Puglia' : 'Architecture of Puglia',
    title: lang === 'it' ? 'Il pinnacolo: il dialogo tra pietra e cielo' : 'The pinnacle: dialogue between stone and sky',
    desc1: lang === 'it' ? 'Le chiancarelle si sovrappongono lungo il cono, fino al pinnacolo scolpito nella pietra calcarea. Una forma semplice, segnata dalla grana e dalle sfumature della materia.' : 'Layers of limestone slabs rise along the cone to a carved stone pinnacle. A simple form, marked by the grain and natural tones of the material.',
    desc2: lang === 'it' ? 'Esplora questa ricostruzione ispirata al nostro pinnacolo: dal tetto in pietra a secco al calice e alla sfera che lo sormonta.' : 'Explore this reconstruction inspired by our pinnacle, from the dry-stone roof to the cup and the sphere above it.',
  };

  const detailItems: { id: DetailType; labelIt: string; labelEn: string; descIt: string; descEn: string }[] = [
    {
      id: 'overview',
      labelIt: 'Vista d’insieme',
      labelEn: 'Overview',
      descIt: 'Il trullo, il cono e il pinnacolo',
      descEn: 'The trullo, its cone and pinnacle',
    },
    {
      id: 'sphere',
      labelIt: 'La Sfera',
      labelEn: 'The Sphere',
      descIt: 'La sommità in pietra calcarea',
      descEn: 'The limestone crown',
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
              <div className="flex flex-wrap gap-3 items-center justify-between mb-3.5">
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#B99470] font-semibold">
                  {lang === 'it' ? 'Dettagli architettonici' : 'Architectural details'}
                </span>
                <button
                  onClick={toggleTour}
                  disabled={!ready || failed} aria-pressed={isTourPlaying}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
                    isTourPlaying
                      ? 'bg-[#87613F] border-[#B99470] text-white'
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
                      : (lang === 'it' ? 'Esplora i dettagli' : 'Explore details')}
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
                      onClick={() => handleSelectDetail(item.id)} disabled={!ready || failed} aria-pressed={isActive}
                      className={`group/btn text-left p-3.5 rounded-sm border transition-all duration-500 cursor-pointer relative overflow-hidden ${
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
                            <span className="absolute w-4 h-4 rounded-full bg-[#B99470]/40 " />
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
                <SiteLink route="preventivo" lang={lang} onNavigate={onNavigate}
                  className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.2em] text-[#B99470] hover:text-[#EAD8C0] transition-colors cursor-pointer group"
                >
                  <span>
                    {lang === 'it'
                      ? 'Richiedi disponibilità per il tuo soggiorno'
                      : 'Request availability for your dates'}
                  </span>
                  <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                </SiteLink>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Cinematic Three.js 3D Sculptural Canvas */}
        <div className="lg:col-span-6 relative w-full h-[520px] sm:h-[620px] lg:h-full min-h-[450px] flex items-center justify-center bg-[#EAE4D8]">
          {!ready && <SmartImage src="./images/pinnacolo.jpg" alt={lang === 'it' ? 'Il pinnacolo in pietra del Trullo dei Messapi' : 'The limestone pinnacle at Trullo dei Messapi'} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />}
          <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
          {failed && <p role="status" className="absolute bottom-16 inset-x-6 text-center text-sm bg-white/90 text-stone-800 p-3">{lang === 'it' ? 'Il modello 3D non è disponibile su questo dispositivo. Ecco il pinnacolo originale.' : 'The 3D model is unavailable on this device. This photograph shows the original pinnacle.'}</p>}

          {/* Interactive Camera Quick Tools (Top Right) */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button
              disabled={!ready || failed} onClick={() => sceneRef.current?.zoomIn()}
              title={lang === 'it' ? 'Ingrandisci' : 'Zoom in'}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-[#B99470] backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
            >
              <ZoomIn size={15} />
            </button>
            <button
              disabled={!ready || failed} onClick={() => sceneRef.current?.zoomOut()}
              title={lang === 'it' ? 'Rimpicciolisci' : 'Zoom out'}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-[#B99470] backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
            >
              <ZoomOut size={15} />
            </button>
            <button
              onClick={() => {
                setIsTourPlaying(false);
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
            <span className="w-2 h-2 rounded-full bg-[#B99470] " />
            <span className="font-light">
              {lang === 'it'
                ? 'Scultura 3D • Trascina per ruotare'
                : '3D Sculpture • Drag to rotate'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
