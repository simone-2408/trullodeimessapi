import React, { useState, useEffect } from 'react';
import { Language, BookingFormState } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ACCOMMODATIONS } from '../data/accommodations';
import { calculateStayQuote, getTodayDateString, getTomorrowDateString, parseLocalDate } from '../data/tariffe';
import { CONTACT_INFO, getWhatsAppUrl } from '../constants/contact';
import {
  Calendar,
  MessageCircle,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Info,
  Users,
  AlertCircle,
  ArrowRight,
  Phone,
  Waves,
  Check,
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

  const todayStr = getTodayDateString();

  const [formState, setFormState] = useState<BookingFormState>(() => {
    const validCheckIn = initialCheckIn && initialCheckIn >= todayStr ? initialCheckIn : '';
    const validCheckOut = initialCheckOut && initialCheckOut > (validCheckIn || todayStr) ? initialCheckOut : '';
    return {
      accommodationId: preselectedSuite || 'quercia',
      checkIn: validCheckIn,
      checkOut: validCheckOut,
      adults: preselectedSuite === 'quercia' ? 4 : 2,
      children: 0,
      extraBeds: 0,
      cribs: 0,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      notes: '',
    };
  });

  const selectedAccommodation =
    ACCOMMODATIONS.find((a) => a.id === formState.accommodationId) || ACCOMMODATIONS[0];

  const totalGuests = formState.adults + formState.children;
  const isOverCapacity = totalGuests > selectedAccommodation.capacityMax;

  // Strict past date protection
  const isCheckInPast = Boolean(formState.checkIn && formState.checkIn < todayStr);
  const minCheckOutDate = getTomorrowDateString(formState.checkIn || todayStr);

  const handleCheckInChange = (newDate: string) => {
    if (!newDate) {
      setFormState((prev) => ({ ...prev, checkIn: '' }));
      return;
    }
    const sanitized = newDate < todayStr ? todayStr : newDate;
    setFormState((prev) => {
      let nextCheckOut = prev.checkOut;
      if (nextCheckOut && nextCheckOut <= sanitized) {
        nextCheckOut = getTomorrowDateString(sanitized);
      }
      return {
        ...prev,
        checkIn: sanitized,
        checkOut: nextCheckOut,
      };
    });
  };

  const handleCheckOutChange = (newDate: string) => {
    if (!newDate) {
      setFormState((prev) => ({ ...prev, checkOut: '' }));
      return;
    }
    const minCheckOut = getTomorrowDateString(formState.checkIn || todayStr);
    const sanitized = newDate < minCheckOut ? minCheckOut : newDate;
    setFormState((prev) => ({
      ...prev,
      checkOut: sanitized,
    }));
  };

  // Handle switching accommodations with strict capacity clamping
  const handleSelectAccommodation = (newAccId: 'quercia' | 'corbezzolo' | 'melograno') => {
    const targetAcc = ACCOMMODATIONS.find((a) => a.id === newAccId) || ACCOMMODATIONS[0];

    setFormState((prev) => {
      let newAdults = prev.adults;
      let newChildren = prev.children;

      // If current total guests exceeds the new accommodation's max capacity, clamp down!
      if (newAdults + newChildren > targetAcc.capacityMax) {
        newAdults = Math.min(newAdults, targetAcc.capacityMax);
        newChildren = Math.min(newChildren, targetAcc.capacityMax - newAdults);
        if (newAdults === 0) newAdults = 1;
      }

      const newTotal = newAdults + newChildren;
      // Auto-compute extra beds needed beyond standard capacity
      const neededExtraBeds = Math.max(0, Math.min(targetAcc.maxExtraBeds, newTotal - targetAcc.capacityStandard));

      return {
        ...prev,
        accommodationId: newAccId,
        adults: newAdults,
        children: newChildren,
        extraBeds: neededExtraBeds,
      };
    });
  };

  // Keep state updated if preselected props change
  useEffect(() => {
    if (preselectedSuite) {
      handleSelectAccommodation(preselectedSuite);
    }
  }, [preselectedSuite]);

  useEffect(() => {
    if (initialCheckIn) {
      const validCheckIn = initialCheckIn >= todayStr ? initialCheckIn : todayStr;
      setFormState((prev) => ({ ...prev, checkIn: validCheckIn }));
    }
    if (initialCheckOut) {
      setFormState((prev) => ({ ...prev, checkOut: initialCheckOut }));
    }
  }, [initialCheckIn, initialCheckOut, todayStr]);

  // Synchronize extra beds whenever adults or children change
  useEffect(() => {
    const currentTotal = formState.adults + formState.children;
    const needed = Math.max(0, Math.min(selectedAccommodation.maxExtraBeds, currentTotal - selectedAccommodation.capacityStandard));
    if (formState.extraBeds !== needed) {
      setFormState((prev) => ({ ...prev, extraBeds: needed }));
    }
  }, [formState.adults, formState.children, selectedAccommodation]);

  const quote = calculateStayQuote(
    formState.checkIn,
    formState.checkOut,
    formState.accommodationId,
    formState.extraBeds,
    formState.cribs
  );

  // Formatting dates for display & messages (timezone safe across the world)
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Generate WhatsApp Message
  const handleWhatsAppInquiry = () => {
    if (isOverCapacity || !quote.isValid || !quote.meetsMinNights || isCheckInPast) return;

    const textLines = [
      `*Trullo dei Messapi - Richiesta Prenotazione*`,
      `----------------------------------------`,
      `• *Alloggio*: ${selectedAccommodation.name}`,
      `• *Check-in*: ${formatDateDisplay(formState.checkIn)}`,
      `• *Check-out*: ${formatDateDisplay(formState.checkOut)} (${quote.totalNights} notti)`,
      `• *Ospiti*: ${formState.adults} Adulti${formState.children > 0 ? `, ${formState.children} Bambini` : ''}`,
      formState.extraBeds > 0 ? `• *Letti Aggiunti*: ${formState.extraBeds} (+35€/notte)` : '',
      formState.cribs > 0 ? `• *Culla*: ${formState.cribs} (+15€/giorno)` : '',
      `• *Totale Stimato*: ${quote.totalEstimated}€`,
      `----------------------------------------`,
      formState.guestName ? `• *Ospite*: ${formState.guestName}` : '',
      formState.guestEmail ? `• *Email*: ${formState.guestEmail}` : '',
      formState.guestPhone ? `• *Telefono*: ${formState.guestPhone}` : '',
      formState.notes ? `• *Note*: ${formState.notes}` : '',
      `----------------------------------------`,
      `Salve Antonella! Vorrei richiedere disponibilità per queste date e bloccare il mio soggiorno. Grazie!`,
    ].filter(Boolean);

    const url = getWhatsAppUrl(textLines.join('\n'));
    window.open(url, '_blank');
  };

  // Generate Email Inquiry
  const handleEmailInquiry = () => {
    if (isOverCapacity || !quote.isValid || !quote.meetsMinNights || isCheckInPast) return;

    const subject = `Richiesta Prenotazione Trullo dei Messapi - ${selectedAccommodation.name} (${formatDateDisplay(formState.checkIn)} - ${formatDateDisplay(formState.checkOut)})`;
    const bodyLines = [
      `Gentile Antonella,`,
      ``,
      `Desidero verificare la disponibilità per un soggiorno presso il Trullo dei Messapi:`,
      ``,
      `Alloggio: ${selectedAccommodation.name}`,
      `Check-in: ${formatDateDisplay(formState.checkIn)}`,
      `Check-out: ${formatDateDisplay(formState.checkOut)} (${quote.totalNights} notti)`,
      `Numero Ospiti: ${formState.adults} Adulti${formState.children > 0 ? `, ${formState.children} Bambini` : ''}`,
      formState.extraBeds > 0 ? `Letti aggiunti: ${formState.extraBeds} (${quote.extraBedsCost}€)` : '',
      formState.cribs > 0 ? `Culla per neonati: ${formState.cribs} (${quote.cribsCost}€)` : '',
      `Totale Stimato: ${quote.totalEstimated}€`,
      ``,
      `Dati di Contatto:`,
      `Nome: ${formState.guestName || 'Non specificato'}`,
      `Email: ${formState.guestEmail || 'Non specificata'}`,
      `Telefono: ${formState.guestPhone || 'Non specificato'}`,
      formState.notes ? `Note/Richieste: ${formState.notes}` : '',
      ``,
      `Resto in attesa di una vostra gentile conferma per accordarci su caparra e dettagli.`,
      `Cordiali saluti,`,
      formState.guestName || '',
    ].filter(Boolean);

    const mailtoUrl = `mailto:${CONTACT_INFO.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    window.location.href = mailtoUrl;
  };

  return (
    <section id="preventivo" className="w-full bg-white scroll-mt-12">
      {/* Editorial Header */}
      <div className="pt-10 sm:pt-16 pb-10 sm:pb-14 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B99470] font-bold block mb-2.5">
          {lang === 'it' ? 'PRENOTA IL TUO SOGGIORNO' : 'BOOK YOUR STAY'}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-stone-900 leading-[1.1] tracking-tight">
          {lang === 'it'
            ? 'Verifica disponibilità & Calcola il preventivo'
            : 'Check availability & Calculate your stay'}
        </h1>
        <p className="mt-3.5 text-base sm:text-lg text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
          {t.calculator.subtitle}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Form Controls */}
          <div className="lg:col-span-7 bg-[#FAF7F2] rounded-3xl p-6 sm:p-9 shadow-sm border border-[#E8E1D5] space-y-8">
            {/* Step 1: Accommodation Visual Switcher with Generous Photography */}
            <div>
              <div className="flex justify-between items-baseline mb-3.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  1. {t.calculator.accommodationLabel}
                </label>
                <span className="text-xs text-stone-500">
                  {lang === 'it' ? 'Capienza:' : 'Capacity:'}{' '}
                  <strong className="text-stone-800 font-semibold">
                    max {selectedAccommodation.capacityMax} {lang === 'it' ? 'ospiti' : 'guests'}
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ACCOMMODATIONS.map((acc) => {
                  const isSelected = formState.accommodationId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectAccommodation(acc.id)}
                      className={`cursor-pointer rounded-2xl overflow-hidden border transition-all flex flex-col justify-between group ${
                        isSelected
                          ? 'border-[#B99470] bg-white ring-2 ring-[#B99470] shadow-md -translate-y-0.5'
                          : 'border-[#E8E1D5] bg-white/70 hover:bg-white hover:border-[#B99470]/60 shadow-xs hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Suite Cover Photo with Badges */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200">
                        <img
                          src={acc.coverImage}
                          alt={acc.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        
                        {isSelected && (
                          <span className="absolute top-2.5 right-2.5 bg-[#B99470] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Check size={11} strokeWidth={3} />
                            <span>{lang === 'it' ? 'Scelta' : 'Chosen'}</span>
                          </span>
                        )}
                        
                        <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                          max {acc.capacityMax} pax • {acc.sqm} mq
                        </span>
                      </div>

                      {/* Suite Info Card Body */}
                      <div className="p-3.5 flex flex-col justify-between flex-1">
                        <div>
                          <h4 className="font-serif font-bold text-base text-stone-900 leading-snug">
                            {acc.name}
                          </h4>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold text-[#B99470] pt-2.5 mt-2.5 border-t border-stone-100">
                          <span>da {acc.startingPrice}€ / nt</span>
                          <span className="text-[11px] text-stone-400 font-normal">
                            {acc.bedroomsCount} {lang === 'it' ? (acc.bedroomsCount === 1 ? 'camera' : 'camere') : 'bedrooms'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date Pickers */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  2. {lang === 'it' ? 'Date del Soggiorno' : 'Stay Dates'}
                </label>
                {quote.isValid && !isCheckInPast && (
                  <span className="text-xs font-semibold text-[#B99470] bg-[#B99470]/10 px-2.5 py-0.5 rounded-full">
                    {quote.totalNights} {quote.totalNights === 1 ? (lang === 'it' ? 'notte' : 'night') : (lang === 'it' ? 'notti' : 'nights')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
                {/* Check-In Card with strict iOS overflow protection */}
                <div className="bg-white rounded-2xl p-3.5 border border-[#E8E1D5] shadow-2xs hover:border-[#B99470]/60 transition-colors overflow-hidden min-w-0">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-stone-500 mb-1.5 flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#B99470]" />
                    {t.calculator.checkInLabel}
                  </label>
                  <input
                    type="date"
                    value={formState.checkIn}
                    min={todayStr}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    className="block w-full max-w-full min-w-0 box-border bg-[#FAF7F2] border border-[#DDD7CC] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-800 focus:ring-2 focus:ring-[#B99470] focus:bg-white focus:outline-none transition-all cursor-pointer [appearance:none] [-webkit-appearance:none]"
                  />
                </div>

                {/* Check-Out Card with strict iOS overflow protection */}
                <div className="bg-white rounded-2xl p-3.5 border border-[#E8E1D5] shadow-2xs hover:border-[#B99470]/60 transition-colors overflow-hidden min-w-0">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-stone-500 mb-1.5 flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#B99470]" />
                    {t.calculator.checkOutLabel}
                  </label>
                  <input
                    type="date"
                    value={formState.checkOut}
                    min={minCheckOutDate}
                    onChange={(e) => handleCheckOutChange(e.target.value)}
                    className="block w-full max-w-full min-w-0 box-border bg-[#FAF7F2] border border-[#DDD7CC] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-800 focus:ring-2 focus:ring-[#B99470] focus:bg-white focus:outline-none transition-all cursor-pointer [appearance:none] [-webkit-appearance:none]"
                  />
                </div>
              </div>

              {/* Past Date Alert safeguard */}
              {isCheckInPast && (
                <div className="mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  <span>
                    {lang === 'it'
                      ? 'La data di check-in non può essere nel passato. Seleziona una data a partire da oggi.'
                      : 'Check-in date cannot be in the past. Please select a date from today onwards.'}
                  </span>
                </div>
              )}
            </div>

            {/* Step 3: Guests Selection with STRICT CAPACITY LOCK */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Users size={14} className="text-[#B99470]" />
                  3. {lang === 'it' ? 'Ospiti & Posti Letto' : 'Guests & Beds'}
                </label>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  totalGuests === selectedAccommodation.capacityMax
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-stone-200/60 text-stone-600'
                }`}>
                  {totalGuests} / {selectedAccommodation.capacityMax} {lang === 'it' ? 'ospiti max' : 'max guests'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Adults counter */}
                <div className="bg-white p-4 rounded-2xl border border-[#E8E1D5] shadow-2xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-stone-800 font-bold block">
                      {t.calculator.adultsLabel}
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      {lang === 'it' ? 'Da 13 anni in su' : 'Age 13+'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                    <button
                      type="button"
                      disabled={formState.adults <= 1}
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          adults: Math.max(1, prev.adults - 1),
                        }))
                      }
                      className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#DDD7CC] flex items-center justify-center font-bold text-stone-700 hover:bg-[#EAE3D7] hover:border-[#B99470] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-base"
                    >
                      -
                    </button>
                    <span className="font-serif font-bold text-stone-900 text-xl">{formState.adults}</span>
                    <button
                      type="button"
                      disabled={totalGuests >= selectedAccommodation.capacityMax}
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          adults: prev.adults + 1,
                        }))
                      }
                      className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#DDD7CC] flex items-center justify-center font-bold text-stone-700 hover:bg-[#EAE3D7] hover:border-[#B99470] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children counter */}
                <div className="bg-white p-4 rounded-2xl border border-[#E8E1D5] shadow-2xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-stone-800 font-bold block truncate">
                      {t.calculator.childrenLabel}
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      {lang === 'it' ? 'Età 3 - 12 anni' : 'Age 3 - 12'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                    <button
                      type="button"
                      disabled={formState.children <= 0}
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          children: Math.max(0, prev.children - 1),
                        }))
                      }
                      className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#DDD7CC] flex items-center justify-center font-bold text-stone-700 hover:bg-[#EAE3D7] hover:border-[#B99470] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-base"
                    >
                      -
                    </button>
                    <span className="font-serif font-bold text-stone-900 text-xl">{formState.children}</span>
                    <button
                      type="button"
                      disabled={totalGuests >= selectedAccommodation.capacityMax}
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          children: prev.children + 1,
                        }))
                      }
                      className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#DDD7CC] flex items-center justify-center font-bold text-stone-700 hover:bg-[#EAE3D7] hover:border-[#B99470] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Baby Crib counter */}
                <div className="bg-white p-4 rounded-2xl border border-[#E8E1D5] shadow-2xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-stone-800 font-bold block truncate">
                      {lang === 'it' ? 'Culla neonati' : 'Baby Crib'}
                    </span>
                    <span className="text-[11px] text-[#B99470] font-medium block mt-0.5">
                      {lang === 'it' ? '+15€ al giorno' : '+15€ / day'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                    <button
                      type="button"
                      disabled={formState.cribs <= 0}
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          cribs: Math.max(0, prev.cribs - 1),
                        }))
                      }
                      className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#DDD7CC] flex items-center justify-center font-bold text-stone-700 hover:bg-[#EAE3D7] hover:border-[#B99470] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-base"
                    >
                      -
                    </button>
                    <span className="font-serif font-bold text-stone-900 text-xl">{formState.cribs}</span>
                    <button
                      type="button"
                      disabled={formState.cribs >= 1}
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          cribs: 1,
                        }))
                      }
                      className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#DDD7CC] flex items-center justify-center font-bold text-stone-700 hover:bg-[#EAE3D7] hover:border-[#B99470] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-base"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Helpful notices on guests and capacity */}
              {totalGuests > selectedAccommodation.capacityStandard && (
                <div className="mt-3.5 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
                  <Info size={16} className="text-amber-700 shrink-0" />
                  <span>
                    {selectedAccommodation.id === 'quercia'
                      ? lang === 'it'
                        ? `Tariffa standard per 4 persone. Inclusi ${totalGuests - 4} ${
                            totalGuests - 4 === 1 ? 'letto aggiunto' : 'letti aggiunti'
                          } (+${(totalGuests - 4) * 35}€ a notte).`
                        : `Standard rate covers 4 guests. Includes ${totalGuests - 4} ${
                            totalGuests - 4 === 1 ? 'extra bed' : 'extra beds'
                          } (+${(totalGuests - 4) * 35}€/night).`
                      : lang === 'it'
                      ? `Incluso 1 letto aggiunto (+35€ a notte) per il 3° ospite.`
                      : `Includes 1 extra bed (+35€/night) for the 3rd guest.`}
                  </span>
                </div>
              )}

              {/* Recommendation if on Corbezzolo / Melograno and wants more guests */}
              {selectedAccommodation.capacityMax === 3 && totalGuests === 3 && (
                <div className="mt-2.5 text-xs text-stone-500 flex items-center justify-between bg-stone-100/80 p-2.5 rounded-xl border border-stone-200/50">
                  <span>
                    {lang === 'it' ? 'Viaggiate in 4 o più persone?' : 'Traveling with 4 or more guests?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectAccommodation('quercia')}
                    className="text-[#B99470] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{lang === 'it' ? 'Passa a Suite Quercia (fino a 7 pax)' : 'Switch to Quercia (up to 7 pax)'}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Step 4: Contact Details (for personalizing message/email) */}
            <div className="pt-4 border-t border-[#EAE3D7]">
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  4. {lang === 'it' ? 'I Tuoi Dati (opzionale)' : 'Your Details (optional)'}
                </label>
                <span className="text-[11px] text-stone-400">
                  {lang === 'it' ? 'Pre-compila la richiesta per Antonella' : 'Pre-fills inquiry for Antonella'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder={t.calculator.guestNameLabel}
                  value={formState.guestName}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, guestName: e.target.value }))
                  }
                  className="bg-white border border-[#DDD7CC] rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-800 focus:ring-2 focus:ring-[#B99470] focus:border-[#B99470] focus:outline-none transition-all shadow-2xs"
                />
                <input
                  type="email"
                  placeholder={t.calculator.guestEmailLabel}
                  value={formState.guestEmail}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, guestEmail: e.target.value }))
                  }
                  className="bg-white border border-[#DDD7CC] rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-800 focus:ring-2 focus:ring-[#B99470] focus:border-[#B99470] focus:outline-none transition-all shadow-2xs"
                />
                <input
                  type="tel"
                  placeholder={t.calculator.guestPhoneLabel}
                  value={formState.guestPhone}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, guestPhone: e.target.value }))
                  }
                  className="bg-white border border-[#DDD7CC] rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-800 focus:ring-2 focus:ring-[#B99470] focus:border-[#B99470] focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <textarea
                placeholder={t.calculator.notesPlaceholder}
                rows={2}
                value={formState.notes}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="w-full bg-white border border-[#DDD7CC] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-800 focus:ring-2 focus:ring-[#B99470] focus:border-[#B99470] focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Right: Booking Summary & Live Suite Preview */}
          <div className="lg:col-span-5 bg-[#1C1A17] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 sticky top-28">
            {/* Live Preview of Selected Suite */}
            <div className="relative rounded-2xl overflow-hidden mb-5 aspect-[16/9] w-full border border-white/10 shadow-sm bg-stone-900">
              <img
                src={selectedAccommodation.coverImage}
                alt={selectedAccommodation.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17] via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white border border-white/20 text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Waves size={12} className="text-[#DFD0B8]" />
                <span>{lang === 'it' ? 'Piscina & idromassaggio inclusi' : 'Pool & jacuzzi included'}</span>
              </span>
            </div>

            {/* Suite Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#B99470] font-bold block mb-1">
                  {lang === 'it' ? 'Dimora Selezionata' : 'Selected Suite'}
                </span>
                <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                  {selectedAccommodation.name}
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  max {selectedAccommodation.capacityMax} ospiti • {selectedAccommodation.sqm} mq • {selectedAccommodation.bedroomsCount} {selectedAccommodation.bedroomsCount === 1 ? (lang === 'it' ? 'camera' : 'bedroom') : (lang === 'it' ? 'camere' : 'bedrooms')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-white/40 block">{lang === 'it' ? 'A partire da' : 'Starting from'}</span>
                <span className="font-serif text-xl font-bold text-[#DFD0B8]">{selectedAccommodation.startingPrice}€</span>
                <span className="text-[10px] text-white/50 block">/ nt</span>
              </div>
            </div>

            {/* Check if dates are selected */}
            {!quote.isValid ? (
              <div className="py-6 space-y-4">
                {/* Suite Perks Checklist */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-[#DFD0B8] font-semibold text-xs">
                    <Sparkles size={14} />
                    <span>{lang === 'it' ? 'Incluso in questa dimora:' : 'Included with this suite:'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-white/70">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B99470] shrink-0" />
                      <span>{lang === 'it' ? 'Accesso esclusivo alla piscina e idromassaggio' : 'Exclusive access to swimming pool and jacuzzi'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B99470] shrink-0" />
                      <span>{lang === 'it' ? 'Cucina indipendente attrezzata e corte privata' : 'Equipped independent kitchen & private stone court'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B99470] shrink-0" />
                      <span>{lang === 'it' ? 'Wi-Fi veloce, parcheggio privato e biancheria' : 'Fast Wi-Fi, private parking, and fresh linens'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B99470] shrink-0" />
                      <span>{lang === 'it' ? 'Nessuna commissione: contatto diretto con Antonella' : 'No agency commission: direct host contact'}</span>
                    </li>
                  </ul>
                </div>

                {/* Callout Prompt or Error Message */}
                {quote.errorMessage ? (
                  <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-center text-xs text-amber-200">
                    <AlertCircle size={20} className="mx-auto mb-1.5 text-amber-400" />
                    <p className="font-semibold text-white">
                      {quote.errorMessage[lang]}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#B99470]/15 border border-[#B99470]/30 text-center text-xs text-[#DFD0B8]">
                    <Calendar size={20} className="mx-auto mb-1.5 text-[#B99470]" />
                    <p className="font-semibold text-white">
                      {lang === 'it'
                        ? 'Inserisci le date a sinistra'
                        : 'Select your stay dates on the left'}
                    </p>
                    <p className="text-[11px] text-white/60 mt-1 font-light leading-relaxed">
                      {lang === 'it'
                        ? 'Calcoleremo il preventivo esatto con tariffe stagionali per bloccare il soggiorno.'
                        : 'We will calculate the quote with seasonal rates to book your stay.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-5 space-y-4">
                {/* Minimum Stay Alert if not satisfied */}
                {!quote.meetsMinNights && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-start gap-2.5">
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

                {/* Over capacity alert safeguard */}
                {isOverCapacity && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-start gap-2.5">
                    <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">
                        {lang === 'it' ? 'Capienza Massima Superata' : 'Maximum Capacity Exceeded'}
                      </strong>
                      <span>
                        {t.calculator.capacityExceededNotice} {selectedAccommodation.capacityMax} {t.calculator.guestsLimit}.
                      </span>
                    </div>
                  </div>
                )}

                {/* Dates & Guests preview chip */}
                <div className="flex justify-between items-center text-xs text-white/80 bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="font-mono text-[11px]">{formatDateDisplay(formState.checkIn)} → {formatDateDisplay(formState.checkOut)}</span>
                  <span className="font-semibold text-[#DFD0B8]">
                    {quote.totalNights} {t.calculator.nights} • {totalGuests} {lang === 'it' ? 'ospiti' : 'guests'}
                  </span>
                </div>

                {/* Line items */}
                <div className="space-y-2 text-sm pt-1">
                  <div className="flex justify-between items-center text-white/80 text-xs sm:text-sm">
                    <span>{t.calculator.baseAccommodation} ({quote.totalNights} nt)</span>
                    <span className="font-medium text-white">{quote.baseAccommodationTotal}€</span>
                  </div>

                  {quote.extraBedsCost > 0 && (
                    <div className="flex justify-between items-center text-white/80 text-xs sm:text-sm">
                      <span>{t.calculator.extraBedsTotal} ({formState.extraBeds} x 35€ x {quote.totalNights} nt)</span>
                      <span className="font-medium text-white">+{quote.extraBedsCost}€</span>
                    </div>
                  )}

                  {quote.cribsCost > 0 && (
                    <div className="flex justify-between items-center text-white/80 text-xs sm:text-sm">
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
                <div className="pt-3.5 border-t border-white/10 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-white/60 uppercase tracking-wider block">
                      {t.calculator.grandTotal}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {lang === 'it' ? 'Tariffa diretta senza intermediari' : 'Direct host rate without fees'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-[#DFD0B8]">
                      {quote.totalEstimated}€
                    </span>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-4 space-y-2.5">
                  <button
                    type="button"
                    disabled={isOverCapacity || !quote.meetsMinNights || !quote.isValid || isCheckInPast}
                    onClick={handleWhatsAppInquiry}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-3.5 px-5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MessageCircle size={19} />
                    <span>{t.calculator.btnWhatsapp}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isOverCapacity || !quote.meetsMinNights || !quote.isValid || isCheckInPast}
                    onClick={handleEmailInquiry}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-5 rounded-2xl transition-colors border border-white/20 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Mail size={17} className="text-[#B99470]" />
                    <span>{t.calculator.btnEmail}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Reassurance Notice */}
            <div className="mt-5 pt-4 border-t border-white/10 text-xs text-white/50 space-y-2">
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

        {/* Banner Tenuta in Esclusiva (Ultra-Luxury Editorial Redesign) */}
        <div className="mt-14 sm:mt-20 bg-gradient-to-br from-[#FAF7F2] via-[#F4EFE6] to-[#EAE3D7] rounded-3xl sm:rounded-[36px] p-8 sm:p-14 border border-[#D5CCC0] text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#B99470]/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#B99470]/10 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-xs border border-[#D5CCC0] text-[#8A6743] text-xs font-bold uppercase tracking-widest mb-3.5 shadow-2xs">
              <Sparkles size={13} className="text-[#B99470]" />
              <span>{t.accommodations.estateExclusiveTag}</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 mb-4 leading-tight">
              {t.accommodations.estateExclusiveTitle}
            </h3>

            {/* 3 Key Highlights Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-6">
              <span className="px-3.5 py-1.5 rounded-full bg-white/90 border border-[#D5CCC0] text-stone-700 text-xs font-medium shadow-2xs">
                ✨ {lang === 'it' ? '3 Dimore indipendenti' : '3 Private Suites'}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/90 border border-[#D5CCC0] text-stone-700 text-xs font-medium shadow-2xs">
                👥 {lang === 'it' ? 'Fino a 12 ospiti' : 'Up to 12 guests'}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/90 border border-[#D5CCC0] text-stone-700 text-xs font-medium shadow-2xs">
                🏊‍♂️ {lang === 'it' ? 'Piscina & idromassaggio ad uso 100% privato' : '100% private pool & jacuzzi use'}
              </span>
            </div>

            <p className="text-stone-600 font-light text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8">
              {t.accommodations.estateExclusiveDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href={getWhatsAppUrl(
                  lang === 'it'
                    ? "Salve Antonella, desidero informazioni e disponibilità per riservare l'intera tenuta Trullo dei Messapi in esclusiva"
                    : "Hello Antonella, I would like information and availability to reserve the entire Trullo dei Messapi estate exclusively"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#B99470] hover:bg-[#A37E5A] text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
              >
                <MessageCircle size={17} />
                <span>{t.accommodations.estateExclusiveBtn}</span>
              </a>
              <a
                href={`tel:${CONTACT_INFO.phoneTel}`}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-[#C5BBAE] bg-white hover:bg-[#FAF7F2] text-stone-800 font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <Phone size={16} />
                <span>{lang === 'it' ? 'Chiama Antonella' : 'Call Antonella'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
