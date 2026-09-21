import React, { useEffect, useRef, useState } from 'react';
import { TrulloScene } from '../three/TrulloScene';
import { AppRoute } from '../three/types';
import { Language } from '../types';
import { ACCOMMODATIONS, POOL_DATA } from '../data/accommodations';
import { Sparkles, Eye } from 'lucide-react';

interface ThreeCanvasProps {
  currentRoute: AppRoute;
  lang: Language;
  onSelectAccommodation: (id: 'quercia' | 'corbezzolo' | 'melograno') => void;
  onOpenPoolGallery: () => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  currentRoute,
  lang,
  onSelectAccommodation,
  onOpenPoolGallery,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TrulloScene | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new TrulloScene(containerRef.current, currentRoute, {
      onHotspotClick: (id) => {
        if (id === 'piscina') {
          onOpenPoolGallery();
        } else {
          onSelectAccommodation(id);
        }
      },
      onHotspotHover: (id) => {
        setHoveredHotspot(id);
      },
    });

    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Update camera pose on route changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setRoute(currentRoute);
    }
  }, [currentRoute]);

  // Get metadata for hovered hotspot
  const getHoveredInfo = () => {
    if (!hoveredHotspot) return null;
    if (hoveredHotspot === 'piscina') {
      return {
        title: POOL_DATA.title[lang],
        subtitle: POOL_DATA.subtitle[lang],
        action: lang === 'it' ? 'Clicca per aprire la galleria piscina' : 'Click to open pool gallery',
      };
    }
    const acc = ACCOMMODATIONS.find((a) => a.id === hoveredHotspot);
    if (!acc) return null;
    return {
      title: acc.name,
      subtitle: `${acc.capacityMax} pax • ${acc.sqm} mq`,
      action: lang === 'it' ? 'Clicca per dettagli e foto' : 'Click for details & photos',
    };
  };

  const hoveredInfo = getHoveredInfo();

  return (
    <>
      {/* Fixed WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Interactive 3D HUD Tooltip when hovering a 3D hotspot */}
      {hoveredInfo && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 bg-[#1E2226]/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200 pointer-events-none flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#B99470] text-white flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-white leading-tight">
              {hoveredInfo.title}
            </h4>
            <span className="text-[11px] text-[#DFD0B8] block">
              {hoveredInfo.subtitle} •{' '}
              <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                <Eye size={11} /> {hoveredInfo.action}
              </span>
            </span>
          </div>
        </div>
      )}
    </>
  );
};
