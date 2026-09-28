import { ACCOMMODATIONS } from '../data/accommodations';
import { BookingFormState, BookingSelection, Language } from '../types';

export const ESTATE = {
  id: 'tenuta' as const,
  name: 'Intera tenuta',
  capacityStandard: ACCOMMODATIONS.reduce((sum, a) => sum + a.capacityStandard, 0),
  capacityMax: ACCOMMODATIONS.reduce((sum, a) => sum + a.capacityMax, 0),
  maxExtraBeds: ACCOMMODATIONS.reduce((sum, a) => sum + a.maxExtraBeds, 0),
  bedroomsCount: ACCOMMODATIONS.reduce((sum, a) => sum + a.bedroomsCount, 0),
  sqm: ACCOMMODATIONS.reduce((sum, a) => sum + a.sqm, 0),
  startingPrice: ACCOMMODATIONS.reduce((sum, a) => sum + a.startingPrice, 0),
  coverImage: './images/piscina/106724803.jpg',
};
export const BOOKING_OPTIONS = [...ACCOMMODATIONS, ESTATE];
export function bookingOption(id: BookingSelection) {
  return BOOKING_OPTIONS.find(a => a.id === id)!;
}
export function bookingName(id: BookingSelection, lang: Language) {
  return id === 'tenuta' ? (lang === 'it' ? 'Intera tenuta · 3 dimore' : 'Entire estate · 3 residences') : bookingOption(id).name;
}
export function extraBedsFor(id: BookingSelection, guests: number) {
  const option = bookingOption(id);
  return Math.max(0, Math.min(option.maxExtraBeds, guests - option.capacityStandard));
}
export function changeAccommodation(state: BookingFormState, id: BookingSelection): BookingFormState {
  return { ...state, accommodationId: id, extraBeds: extraBedsFor(id, state.adults + state.children) };
}
export function inquiryText(state: BookingFormState, total: number, nights: number, lang: Language) {
  const date = (value: string) => value.split('-').reverse().join('/');
  const it = lang === 'it';
  return [
    it ? 'Trullo dei Messapi — Richiesta di disponibilità' : 'Trullo dei Messapi — Availability request',
    `${it ? 'Alloggio' : 'Accommodation'}: ${bookingName(state.accommodationId, lang)}`,
    `Check-in: ${date(state.checkIn)}`,
    `Check-out: ${date(state.checkOut)} (${nights} ${it ? 'notti' : 'nights'})`,
    `${it ? 'Ospiti' : 'Guests'}: ${state.adults} ${it ? 'adulti' : 'adults'}, ${state.children} ${it ? 'bambini' : 'children'}`,
    `${it ? 'Letti aggiunti' : 'Extra beds'}: ${state.extraBeds}`,
    `${it ? 'Culla richiesta' : 'Crib requested'}: ${state.cribs}`,
    `${it ? 'Totale stimato' : 'Estimated total'}: €${total}`,
    state.accommodationId === 'tenuta' ? (it ? 'Quercia + Corbezzolo + Melograno. Distribuzione degli ospiti da concordare con Antonella.' : 'Quercia + Corbezzolo + Melograno. Guest allocation to be agreed with Antonella.') : '',
    state.guestName ? `${it ? 'Nome' : 'Name'}: ${state.guestName}` : '',
    state.guestEmail ? `Email: ${state.guestEmail}` : '',
    state.guestPhone ? `${it ? 'Telefono' : 'Phone'}: ${state.guestPhone}` : '',
    state.notes ? `${it ? 'Note' : 'Notes'}: ${state.notes}` : '',
    it ? 'Salve Antonella, vorrei sapere se le date indicate sono disponibili. Attendo conferma della disponibilità e del preventivo. Grazie!' : 'Hello Antonella, are these dates available? Please confirm availability and the quote. Thank you!',
  ].filter(Boolean).join('\n');
}
