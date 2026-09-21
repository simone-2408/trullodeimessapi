import React, { useState, useEffect } from 'react';
import { Language, BookingFormState } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ACCOMMODATIONS } from '../data/accommodations';
import { calculateStayQuote } from '../data/tariffe';
import {
  Calendar,
  MessageCircle,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';

interface QuoteCalculatorProps {
  lang: Language;
  preselectedSuite?: 'quercia' | 'corbezzolo' | 'melograno';
  initialCheckIn?: string;
  initialCheckOut?: string;
}

export const QuoteCalculator: React.FC<QuoteCalculatorProps> = ({
  lang,
  preselectedSuite,
  initialCheckIn,
  initialCheckOut,
}) => {
  const t = TRANSLATIONS[lang];

  const [formState, setFormState] = useState<BookingFormState>({
    accommodationId: preselectedSuite || 'quercia',
    checkIn: initialCheckIn || '',
    checkOut: initialCheckOut || '',
    adults: 2,
    children: 0,
    extraBeds: 0,
    cribs: 0,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    notes: '',
  });

  // Keep state updated if preselected props change
  useEffect(() => {
    if (preselectedSuite) {
      setFormState((prev) => ({
        ...prev,
        accommodationId: preselectedSuite,
        extraBeds: 0, // reset extra beds when switching unit
      }));
    }
  }, [preselectedSuite]);

  useEffect(() => {
    if (initialCheckIn) {
      setFormState((prev) => ({ ...prev, checkIn: initialCheckIn }));
    }
    if (initialCheckOut) {
      setFormState((prev) => ({ ...prev, checkOut: initialCheckOut }));
    }
  }, [initialCheckIn, initialCheckOut]);

  const selectedAccommodation =
    ACCOMMODATIONS.find((a) => a.id === formState.accommodationId) || ACCOMMODATIONS[0];

  const quote = calculateStayQuote(
    formState.checkIn,
    formState.checkOut,
    formState.accommodationId,
    formState.extraBeds,
    formState.cribs
  );

  const maxExtraBedsAllowed = selectedAccommodation.maxExtraBeds;

  // Formatting dates for message
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Generate WhatsApp Message
  const handleWhatsAppInquiry = () => {
    const textLines = [
      `*Trullo dei Messapi - Richiesta Preventivo & Disponibilità*`,
      `----------------------------------------`,
      `• *Alloggio*: ${selectedAccommodation.name}`,
      `• *Check-in*: ${formatDateDisplay(formState.checkIn)}`,
      `• *Check-out*: ${formatDateDisplay(formState.checkOut)} (${quote.totalNights} notti)`,
      `• *Ospiti*: ${formState.adults} Adulti${formState.children > 0 ? `, ${formState.children} Bambini` : ''}`,
      formState.extraBeds > 0 ? `• *Letti Aggiunti*: ${formState.extraBeds} (+35€/notte)` : '',
      formState.cribs > 0 ? `• *Culla*: ${formState.cribs} (+15€/giorno)` : '',
      `• *Totale Preventivato*: ${quote.totalEstimated}€`,
      `----------------------------------------`,
      formState.guestName ? `• *Ospite*: ${formState.guestName}` : '',
      formState.guestEmail ? `• *Email*: ${formState.guestEmail}` : '',
      formState.guestPhone ? `• *Telefono*: ${formState.guestPhone}` : '',
      formState.notes ? `• *Note*: ${formState.notes}` : '',
      `----------------------------------------`,
      `Salve Antonella! Vorrei verificare la disponibilità per queste date e procedere con la prenotazione. Grazie!`,
    ].filter(Boolean);

    const encoded = encodeURIComponent(textLines.join('\n'));
    const url = `https://wa.me/393333339347?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Generate Email Inquiry
  const handleEmailInquiry = () => {
    const subject = `Richiesta Preventivo Trullo dei Messapi - ${selectedAccommodation.name} (${formatDateDisplay(formState.checkIn)} - ${formatDateDisplay(formState.checkOut)})`;
    const bodyLines = [
      `Gentile Antonella,`,
      ``,
      `Desidero richiedere la disponibilità per un soggiorno presso il Trullo dei Messapi con il seguente preventivo calcolato dal sito web:`,
      ``,
      `Alloggio: ${selectedAccommodation.name}`,
      `Check-in: ${formatDateDisplay(formState.checkIn)}`,
      `Check-out: ${formatDateDisplay(formState.checkOut)} (${quote.totalNights} notti)`,
      `Numero Ospiti: ${formState.adults} Adulti${formState.children > 0 ? `, ${formState.children} Bambini` : ''}`,
      formState.extraBeds > 0 ? `Letti aggiunti: ${formState.extraBeds} (${quote.extraBedsCost}€)` : '',
      formState.cribs > 0 ? `Culla: ${formState.cribs} (${quote.cribsCost}€)` : '',
      `Totale Stimato: ${quote.totalEstimated}€`,
      ``,
      `Dati di Contatto:`,
      `Nome: ${formState.guestName || 'Non specificato'}`,
      `Email: ${formState.guestEmail || 'Non specificata'}`,
      `Telefono: ${formState.guestPhone || 'Non specificato'}`,
      formState.notes ? `Note/Richieste: ${formState.notes}` : '',
      ``,
      `Resto in attesa di una vostra gentile conferma per accordarci su caparra e saldo.`,
      `Cordiali saluti,`,
      formState.guestName || '',
    ].filter(Boolean);

    const mailto = `mailto:trullodeimessapi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    window.location.href = mailto;
  };

  return (
    <section id="preventivo" className="py-20 sm:py-28 bg-[#FAF8F5] relative scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B99470]/15 text-[#8A6743] text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles size={14} />
            <span>{t.calculator.sectionTag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {t.calculator.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 font-light leading-relaxed">
            {t.calculator.subtitle}
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Form Controls */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E7D7C1]/60 space-y-6">
            {/* Step 1: Accommodation Visual Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                1. {t.calculator.accommodationLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ACCOMMODATIONS.map((acc) => {
                  const isSelected = formState.accommodationId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          accommodationId: acc.id,
                          extraBeds: Math.min(prev.extraBeds, acc.maxExtraBeds),
                        }))
                      }
                      className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#B99470] bg-[#B99470]/5 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <img
                          src={acc.coverImage}
                          alt={acc.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-serif font-bold text-sm text-gray-900 leading-tight">
                            {acc.name}
                          </h4>
                          <span className="text-[11px] text-gray-500 block">
                            max {acc.capacityMax} pax • {acc.sqm} mq
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-xs font-semibold text-[#B99470]">
                        da {acc.startingPrice}€ / nt
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date Pickers */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                2. {lang === 'it' ? 'Date del Soggiorno' : 'Stay Dates'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#B99470]" />
                    {t.calculator.checkInLabel}
                  </label>
                  <input
                    type="date"
                    value={formState.checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, checkIn: e.target.value }))
                    }
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#B99470]" />
                    {t.calculator.checkOutLabel}
                  </label>
                  <input
                    type="date"
                    value={formState.checkOut}
                    min={formState.checkIn || new Date().toISOString().split('T')[0]}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, checkOut: e.target.value }))
                    }
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Guests & Extras */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                3. {lang === 'it' ? 'Ospiti & Letti Aggiuntivi' : 'Guests & Extras'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Adults */}
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-gray-100">
                  <span className="block text-xs text-gray-500 font-medium mb-1">
                    {t.calculator.adultsLabel}
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          adults: Math.max(1, prev.adults - 1),
                        }))
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-gray-900 text-base">{formState.adults}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          adults: Math.min(selectedAccommodation.capacityMax, prev.adults + 1),
                        }))
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-gray-100">
                  <span className="block text-xs text-gray-500 font-medium mb-1">
                    {t.calculator.childrenLabel}
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          children: Math.max(0, prev.children - 1),
                        }))
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-gray-900 text-base">{formState.children}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          children: prev.children + 1,
                        }))
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Extra Beds */}
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-gray-100">
                  <span className="block text-[11px] text-gray-500 font-medium mb-1 truncate" title="Letti Aggiunti (+35€)">
                    {lang === 'it' ? 'Letti Agg. (+35€)' : 'Extra Bed (+35€)'}
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          extraBeds: Math.max(0, prev.extraBeds - 1),
                        }))
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-gray-900 text-base">{formState.extraBeds}</span>
                    <button
                      type="button"
                      disabled={formState.extraBeds >= maxExtraBedsAllowed}
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          extraBeds: Math.min(maxExtraBedsAllowed, prev.extraBeds + 1),
                        }))
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Crib */}
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-gray-100">
                  <span className="block text-[11px] text-gray-500 font-medium mb-1 truncate" title="Culla neonati (+15€)">
                    {lang === 'it' ? 'Culla (+15€/gg)' : 'Crib (+15€/day)'}
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          cribs: Math.max(0, prev.cribs - 1),
                        }))
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-gray-900 text-base">{formState.cribs}</span>
                    <button
                      type="button"
                      disabled={formState.cribs >= 1}
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          cribs: 1,
                        }))
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {maxExtraBedsAllowed > 0 && (
                <p className="text-[11px] text-gray-400 mt-2">
                  * {selectedAccommodation.name}: {lang === 'it' ? `massimo ${maxExtraBedsAllowed} letto/i aggiunto/i consentito/i.` : `maximum ${maxExtraBedsAllowed} extra bed(s) permitted.`}
                </p>
              )}
            </div>

            {/* Step 4: Contact Details (for personalizing message/email) */}
            <div className="pt-3 border-t border-gray-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                4. {lang === 'it' ? 'I Tuoi Dati di Contatto' : 'Your Contact Information'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder={t.calculator.guestNameLabel}
                  value={formState.guestName}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, guestName: e.target.value }))
                  }
                  className="bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                />
                <input
                  type="email"
                  placeholder={t.calculator.guestEmailLabel}
                  value={formState.guestEmail}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, guestEmail: e.target.value }))
                  }
                  className="bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder={t.calculator.guestPhoneLabel}
                  value={formState.guestPhone}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, guestPhone: e.target.value }))
                  }
                  className="bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
                />
              </div>

              <textarea
                placeholder={t.calculator.notesPlaceholder}
                rows={2}
                value={formState.notes}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#B99470] focus:outline-none"
              />
            </div>
          </div>

          {/* Right: Transparent Quote Breakdown & Action Buttons */}
          <div className="lg:col-span-5 bg-[#1E2226] text-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-white/10 sticky top-28">
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#B99470] font-semibold block">
                  {selectedAccommodation.name}
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {t.calculator.summaryTitle}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#B99470]/20 flex items-center justify-center text-[#DFD0B8]">
                <Sparkles size={22} />
              </div>
            </div>

            {/* Check if dates are selected */}
            {!quote.isValid ? (
              <div className="py-12 text-center text-white/60 space-y-3">
                <Calendar size={40} className="mx-auto text-[#B99470]/60 animate-pulse" />
                <p className="text-sm font-light max-w-xs mx-auto">
                  {t.calculator.selectDatesFirst}
                </p>
              </div>
            ) : (
              <div className="py-6 space-y-4">
                {/* Minimum Stay Alert if not satisfied */}
                {!quote.meetsMinNights && (
                  <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-start gap-2.5">
                    <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">
                        {lang === 'it' ? 'Soggiorno Minimo Richiesto' : 'Minimum Stay Required'}
                      </strong>
                      <span>
                        {t.calculator.minStayNotice} <strong>{quote.minNightsRequired} {t.calculator.nights}</strong>.
                      </span>
                    </div>
                  </div>
                )}

                {/* Dates preview */}
                <div className="flex justify-between items-center text-xs text-white/70 bg-white/5 p-3 rounded-xl">
                  <span>{formatDateDisplay(formState.checkIn)} → {formatDateDisplay(formState.checkOut)}</span>
                  <span className="font-semibold text-[#DFD0B8]">{quote.totalNights} {t.calculator.nights}</span>
                </div>

                {/* Line items */}
                <div className="space-y-2.5 text-sm pt-2">
                  <div className="flex justify-between items-center text-white/80">
                    <span>{t.calculator.baseAccommodation} ({quote.totalNights} nt)</span>
                    <span className="font-medium text-white">{quote.baseAccommodationTotal}€</span>
                  </div>

                  {quote.extraBedsCost > 0 && (
                    <div className="flex justify-between items-center text-white/80">
                      <span>{t.calculator.extraBedsTotal} ({formState.extraBeds} x 35€ x {quote.totalNights} nt)</span>
                      <span className="font-medium text-white">+{quote.extraBedsCost}€</span>
                    </div>
                  )}

                  {quote.cribsCost > 0 && (
                    <div className="flex justify-between items-center text-white/80">
                      <span>{t.calculator.cribsTotal} (15€ x {quote.totalNights} gg)</span>
                      <span className="font-medium text-white">+{quote.cribsCost}€</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-[#B99470] pt-1">
                    <span>{t.calculator.averageNight}</span>
                    <span className="font-mono">{quote.averagePerNight}€ / nt</span>
                  </div>
                </div>

                {/* Grand Total Highlight */}
                <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-white/60 uppercase tracking-wider block">
                      {t.calculator.grandTotal}
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">
                      {lang === 'it' ? 'Tariffa Ufficiale 2026' : 'Official 2026 Rate'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-[#DFD0B8]">
                      {quote.totalEstimated}€
                    </span>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-6 space-y-3">
                  <button
                    type="button"
                    onClick={handleWhatsAppInquiry}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-3.5 px-5 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer"
                  >
                    <MessageCircle size={20} />
                    <span>{t.calculator.btnWhatsapp}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEmailInquiry}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-5 rounded-2xl transition-colors border border-white/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <Mail size={18} className="text-[#B99470]" />
                    <span>{t.calculator.btnEmail}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Reassurance Notice */}
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/50 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {t.calculator.noPaymentNotice}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#DFD0B8]">
                <Info size={14} className="shrink-0" />
                <span>CIN: IT074003C100028899 • CIS: BR07400361000008508</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
