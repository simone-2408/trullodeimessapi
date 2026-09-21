import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { MapPin, Navigation, Compass, ExternalLink, Plane } from 'lucide-react';

interface LocationSectionProps {
  lang: Language;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  const destinations = [
    {
      title: t.location.ceglie,
      desc: t.location.ceglieDesc,
      km: '5 km',
      time: '6 min',
    },
    {
      title: t.location.ostuni,
      desc: t.location.ostuniDesc,
      km: '15 km',
      time: '18 min',
    },
    {
      title: t.location.cisternino,
      desc: t.location.cisterninoDesc,
      km: '18 km',
      time: '20 min',
    },
    {
      title: t.location.alberobello,
      desc: t.location.alberobelloDesc,
      km: '35 km',
      time: '35 min',
    },
    {
      title: t.location.beaches,
      desc: t.location.beachesDesc,
      km: '25-45 km',
      time: '25 min',
    },
    {
      title: t.location.airports,
      desc: t.location.airportsDesc,
      km: 'BDS / BRI',
      time: '35-70 min',
    },
  ];

  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Trullo+dei+Messapi+Contrada+Pisciacalze+Ceglie+Messapica';

  return (
    <section id="posizione" className="py-20 sm:py-28 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B99470]/15 text-[#8A6743] text-xs font-bold uppercase tracking-widest mb-3">
            <Compass size={14} />
            <span>{t.location.sectionTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {t.location.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 font-light leading-relaxed">
            {t.location.subtitle}
          </p>
        </div>

        {/* Location & Surroundings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          {/* Destination Highlights */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {destinations.map((d, idx) => (
              <div
                key={idx}
                className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-[#E7D7C1]/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif font-bold text-lg text-gray-900 leading-snug">
                      {d.title}
                    </h3>
                    <span className="text-[11px] font-semibold bg-[#FAF8F5] px-2.5 py-1 rounded-full text-[#B99470] border border-[#B99470]/20 shrink-0">
                      {d.time}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {d.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Map Card & Address Box */}
          <div className="lg:col-span-5 bg-[#1E2226] text-white rounded-3xl p-7 sm:p-8 shadow-xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#B99470]/20 text-[#DFD0B8] flex items-center justify-center mb-6">
                <MapPin size={24} />
              </div>
              <span className="text-xs uppercase tracking-widest text-[#B99470] font-semibold block mb-1">
                {t.location.addressCardTitle}
              </span>
              <h3 className="font-serif text-2xl font-bold mb-3 text-white">
                Trullo dei Messapi
              </h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6 font-light">
                Contrada Pisciacalze, snc<br />
                72013 Ceglie Messapica (BR)<br />
                Puglia, Italia
              </p>

              <div className="space-y-2 text-xs text-white/60 mb-8 border-t border-white/10 pt-4">
                <p className="flex items-center gap-2">
                  <Navigation size={14} className="text-[#B99470]" />
                  <span>Coordinate GPS: 40.6452° N, 17.5160° E</span>
                </p>
                <p className="flex items-center gap-2">
                  <Plane size={14} className="text-[#B99470]" />
                  <span>Aeroporti: Brindisi Papola Casale (BDS) • Bari Karol Wojtyla (BRI)</span>
                </p>
              </div>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#B99470] hover:bg-[#A37E5A] text-white font-semibold py-3.5 px-6 rounded-2xl text-center text-sm transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>{t.location.openGoogleMaps}</span>
              <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
