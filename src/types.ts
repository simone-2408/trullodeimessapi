export type Language = 'it' | 'en';

export interface Accommodation {
  id: 'quercia' | 'corbezzolo' | 'melograno';
  name: string;
  badge: { it: string; en: string };
  tagline: { it: string; en: string };
  description: { it: string; en: string };
  type: 'trullo' | 'apartment';
  sqm: number;
  capacityStandard: number;
  capacityMax: number;
  maxExtraBeds: number;
  bedroomsCount: number;
  bathroomsCount: number;
  bedsDescription: { it: string; en: string };
  coverImage: string;
  gallery: string[];
  features: {
    it: string[];
    en: string[];
  };
  amenities: string[];
  startingPrice: number;
}

export interface SeasonRate {
  id: string;
  label: string;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
  minNights: number;
  rate2Pax: number; // for Corbezzolo & Melograno
  rate4Pax: number; // for Quercia (Trullo)
}

export interface BookingFormState {
  accommodationId: 'quercia' | 'corbezzolo' | 'melograno';
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children: number;
  extraBeds: number;
  cribs: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes: string;
}

export interface PriceCalculationResult {
  isValid: boolean;
  errorMessage?: { it: string; en: string };
  totalNights: number;
  minNightsRequired: number;
  meetsMinNights: boolean;
  nightlyRatesBreakdown: {
    date: string;
    rate: number;
    season: string;
  }[];
  baseAccommodationTotal: number;
  extraBedsCost: number;
  cribsCost: number;
  totalEstimated: number;
  averagePerNight: number;
}

export interface Testimonial {
  id: number;
  guest: string;
  country: string;
  stayDate: string;
  room: string;
  rating: number;
  title: { it: string; en: string };
  content: { it: string; en: string };
}
