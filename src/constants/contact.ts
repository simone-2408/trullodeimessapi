/**
 * Centralized Contact Information for Trullo dei Messapi
 * Single Source of Truth for Phone, WhatsApp, Email, and Location
 */

export const CONTACT_INFO = {
  phoneDisplay: '+39 333 333 9347',
  phoneTel: '+393333339347',
  whatsappNumber: '393333339347',
  hostName: 'Antonella',
  email: 'trullodeimessapi@gmail.com',
  address: 'Contrada Pisciacalze, 72013 Ceglie Messapica (BR), Puglia, Italia',
  mapsEmbedUrl: 'https://maps.google.com/maps?q=40.648358,17.472002&t=&z=15&ie=UTF8&iwloc=&output=embed',
  mapsDirectionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=40.648358,17.472002',
} as const;

/**
 * Generates an official WhatsApp deep link with encoded message
 */
export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
