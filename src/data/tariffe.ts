import { SeasonRate, PriceCalculationResult } from '../types';

export const SEASONS_2026: SeasonRate[] = [
  {
    id: 'capodanno',
    label: 'Capodanno & Festività (01/01 - 10/01)',
    startMonth: 1,
    startDay: 1,
    endMonth: 1,
    endDay: 10,
    minNights: 3,
    rate2Pax: 200,
    rate4Pax: 400,
  },
  {
    id: 'inverno-primavera',
    label: 'Bassa Stagione (11/01 - 27/03)',
    startMonth: 1,
    startDay: 11,
    endMonth: 3,
    endDay: 27,
    minNights: 3,
    rate2Pax: 130,
    rate4Pax: 260,
  },
  {
    id: 'pasqua-aprile',
    label: 'Pasqua & Primavera (28/03 - 11/04)',
    startMonth: 3,
    startDay: 28,
    endMonth: 4,
    endDay: 11,
    minNights: 3,
    rate2Pax: 200,
    rate4Pax: 400,
  },
  {
    id: 'media-primavera',
    label: 'Media Stagione Primavera (12/04 - 30/04)',
    startMonth: 4,
    startDay: 12,
    endMonth: 4,
    endDay: 30,
    minNights: 3,
    rate2Pax: 160,
    rate4Pax: 320,
  },
  {
    id: 'maggio-giugno',
    label: 'Tarda Primavera (01/05 - 13/06)',
    startMonth: 5,
    startDay: 1,
    endMonth: 6,
    endDay: 13,
    minNights: 3,
    rate2Pax: 180,
    rate4Pax: 360,
  },
  {
    id: 'inizio-estate',
    label: 'Inizio Estate (14/06 - 18/07)',
    startMonth: 6,
    startDay: 14,
    endMonth: 7,
    endDay: 18,
    minNights: 5,
    rate2Pax: 200,
    rate4Pax: 400,
  },
  {
    id: 'altissima-estate',
    label: 'Altissima Stagione Estiva (19/07 - 29/08)',
    startMonth: 7,
    startDay: 19,
    endMonth: 8,
    endDay: 29,
    minNights: 7,
    rate2Pax: 220,
    rate4Pax: 440,
  },
  {
    id: 'settembre',
    label: 'Fine Estate (30/08 - 26/09)',
    startMonth: 8,
    startDay: 30,
    endMonth: 9,
    endDay: 26,
    minNights: 5,
    rate2Pax: 200,
    rate4Pax: 400,
  },
  {
    id: 'ottobre',
    label: 'Autunno Dolce (27/09 - 02/11)',
    startMonth: 9,
    startDay: 27,
    endMonth: 11,
    endDay: 2,
    minNights: 3,
    rate2Pax: 180,
    rate4Pax: 360,
  },
  {
    id: 'novembre-dicembre',
    label: 'Bassa Stagione Autunno/Inverno (03/11 - 19/12)',
    startMonth: 11,
    startDay: 3,
    endMonth: 12,
    endDay: 19,
    minNights: 3,
    rate2Pax: 160,
    rate4Pax: 320,
  },
  {
    id: 'natale-capodanno',
    label: 'Natale & Fine Anno (20/12 - 31/12)',
    startMonth: 12,
    startDay: 20,
    endMonth: 12,
    endDay: 31,
    minNights: 3,
    rate2Pax: 200,
    rate4Pax: 400,
  },
];

export const EXTRA_BED_PRICE_PER_NIGHT = 35;
export const CRIB_PRICE_PER_NIGHT = 15;

/**
 * Finds the matching SeasonRate for a given Date object based on Month and Day.
 */
export function getSeasonForDate(date: Date): SeasonRate {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const s of SEASONS_2026) {
    if (s.startMonth === s.endMonth) {
      if (month === s.startMonth && day >= s.startDay && day <= s.endDay) {
        return s;
      }
    } else {
      // span across months (e.g. 11/01 - 27/03)
      if (
        (month === s.startMonth && day >= s.startDay) ||
        (month > s.startMonth && month < s.endMonth) ||
        (month === s.endMonth && day <= s.endDay)
      ) {
        return s;
      }
    }
  }

  // fallback default
  return SEASONS_2026[1];
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns tomorrow's date formatted as YYYY-MM-DD in local time,
 * or the day after the given baseDateStr
 */
export function getTomorrowDateString(baseDateStr?: string): string {
  const base = baseDateStr ? new Date(baseDateStr + 'T00:00:00') : new Date();
  base.setDate(base.getDate() + 1);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the exact quote for a stay
 */
export function calculateStayQuote(
  checkInStr: string,
  checkOutStr: string,
  accommodationId: 'quercia' | 'corbezzolo' | 'melograno',
  extraBeds: number = 0,
  cribs: number = 0
): PriceCalculationResult {
  if (!checkInStr || !checkOutStr) {
    return {
      isValid: false,
      totalNights: 0,
      minNightsRequired: 3,
      meetsMinNights: false,
      nightlyRatesBreakdown: [],
      baseAccommodationTotal: 0,
      extraBedsCost: 0,
      cribsCost: 0,
      totalEstimated: 0,
      averagePerNight: 0,
    };
  }

  // Prevent past dates
  const todayStr = getTodayDateString();
  if (checkInStr < todayStr) {
    return {
      isValid: false,
      errorMessage: {
        it: 'La data di check-in non può essere nel passato. Seleziona una data a partire da oggi.',
        en: 'Check-in date cannot be in the past. Please select today or a future date.',
      },
      totalNights: 0,
      minNightsRequired: 3,
      meetsMinNights: false,
      nightlyRatesBreakdown: [],
      baseAccommodationTotal: 0,
      extraBedsCost: 0,
      cribsCost: 0,
      totalEstimated: 0,
      averagePerNight: 0,
    };
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
    return {
      isValid: false,
      errorMessage: {
        it: 'La data di check-out deve essere successiva al check-in.',
        en: 'Check-out date must be after check-in date.',
      },
      totalNights: 0,
      minNightsRequired: 3,
      meetsMinNights: false,
      nightlyRatesBreakdown: [],
      baseAccommodationTotal: 0,
      extraBedsCost: 0,
      cribsCost: 0,
      totalEstimated: 0,
      averagePerNight: 0,
    };
  }

  const isQuercia = accommodationId === 'quercia';
  const nightlyRatesBreakdown: { date: string; rate: number; season: string }[] = [];
  let baseAccommodationTotal = 0;
  let maxMinNights = 3;

  const current = new Date(checkIn);
  while (current < checkOut) {
    const season = getSeasonForDate(current);
    const rate = isQuercia ? season.rate4Pax : season.rate2Pax;

    if (season.minNights > maxMinNights) {
      maxMinNights = season.minNights;
    }

    const dateFormatted = current.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
    });

    nightlyRatesBreakdown.push({
      date: dateFormatted,
      rate,
      season: season.label,
    });

    baseAccommodationTotal += rate;
    current.setDate(current.getDate() + 1);
  }

  const totalNights = nightlyRatesBreakdown.length;
  const meetsMinNights = totalNights >= maxMinNights;

  const extraBedsCost = extraBeds * EXTRA_BED_PRICE_PER_NIGHT * totalNights;
  const cribsCost = cribs * CRIB_PRICE_PER_NIGHT * totalNights;
  const totalEstimated = baseAccommodationTotal + extraBedsCost + cribsCost;
  const averagePerNight = totalNights > 0 ? Math.round(totalEstimated / totalNights) : 0;

  return {
    isValid: true,
    totalNights,
    minNightsRequired: maxMinNights,
    meetsMinNights,
    errorMessage: !meetsMinNights
      ? {
          it: `Il soggiorno minimo richiesto per il periodo selezionato è di ${maxMinNights} notti.`,
          en: `The minimum stay required for the selected dates is ${maxMinNights} nights.`,
        }
      : undefined,
    nightlyRatesBreakdown,
    baseAccommodationTotal,
    extraBedsCost,
    cribsCost,
    totalEstimated,
    averagePerNight,
  };
}
