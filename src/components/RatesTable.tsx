import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { SEASONS_2026 } from '../data/tariffe';
import { Table, CheckCircle2, Info } from 'lucide-react';

interface RatesTableProps {
  lang: Language;
}

export const RatesTable: React.FC<RatesTableProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section id="listino-2026" className="py-20 sm:py-24 bg-[#F3EDE3]/40 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B99470]/15 text-[#8A6743] text-xs font-bold uppercase tracking-widest mb-3">
            <Table size={14} />
            <span>{t.ratesTable.sectionTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {t.ratesTable.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            {lang === 'it'
              ? 'Tariffe ufficiali trasparenti per notte, comprensive di tutti i servizi essenziali della tenuta.'
              : 'Transparent official rates per night, including all core amenities of the estate.'}
          </p>
        </div>

        {/* Rate Table Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#E7D7C1]/60 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1E2226] text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">{t.ratesTable.periodCol}</th>
                  <th className="py-4 px-4 font-semibold text-center">{t.ratesTable.minStayCol}</th>
                  <th className="py-4 px-4 font-semibold text-center">
                    Corbezzolo / Melograno
                    <span className="block text-[10px] text-[#DFD0B8] font-normal lowercase">
                      ({lang === 'it' ? 'appartamento 2 pax' : '2-guest suite'})
                    </span>
                  </th>
                  <th className="py-4 px-6 font-semibold text-center">
                    Suite Trullo Quercia
                    <span className="block text-[10px] text-[#DFD0B8] font-normal lowercase">
                      ({lang === 'it' ? 'trullo 4 pax' : '4-guest trullo'})
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {SEASONS_2026.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={`transition-colors hover:bg-[#FAF8F5] ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F5]/40'
                    }`}
                  >
                    <td className="py-3.5 px-6 font-medium text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#B99470]" />
                      <span>{s.label}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                        {s.minNights} {lang === 'it' ? 'notti' : 'nights'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-serif text-base font-bold text-gray-900">
                      {s.rate2Pax}€
                      <span className="text-xs font-sans text-gray-400 font-normal"> /nt</span>
                    </td>
                    <td className="py-3.5 px-6 text-center font-serif text-base font-bold text-[#B99470]">
                      {s.rate4Pax}€
                      <span className="text-xs font-sans text-gray-400 font-normal"> /nt</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rate Table Notes Grid */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E7D7C1]/50 shadow-md">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Info size={15} className="text-[#B99470]" />
            {lang === 'it' ? 'Condizioni e Servizi Inclusi' : 'Terms & Included Amenities'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {t.ratesTable.notes.map((note, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
