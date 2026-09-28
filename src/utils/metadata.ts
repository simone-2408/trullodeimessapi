import { useEffect } from 'react';
import { AppRoute, routePath, BASE } from './routes';
import { Language } from '../types';
import { CONTACT_INFO } from '../constants/contact';
const siteURL = import.meta.env?.VITE_SITE_URL || `https://simone-2408.github.io${BASE}`;
const siteOrigin = new URL(siteURL).origin;
const names: Record<AppRoute, [string, string]> = {
  home: ['Trulli con piscina a Ceglie Messapica', 'Trulli with a pool in Ceglie Messapica'],
  suites: ['Le tre dimore in pietra', 'Three stone residences'],
  quercia: ['Trullo Quercia · fino a 7 ospiti', 'Quercia Trullo · up to 7 guests'],
  corbezzolo: ['Corbezzolo · lamia per 2–3 ospiti', 'Corbezzolo · a lamia for 2–3 guests'],
  melograno: ['Melograno · dimora per 2–3 ospiti', 'Melograno · a residence for 2–3 guests'],
  piscina: ['Piscina e idromassaggio tra gli ulivi', 'Pool and hydromassage among olive trees'],
  preventivo: ['Stima del soggiorno e richiesta disponibilità', 'Stay estimate and availability inquiry'],
  contatti: ['Contatti e come raggiungerci', 'Contact and directions'],
  privacy: ['Privacy e utilizzo del sito', 'Privacy and website information'],
};
const descriptions: Record<AppRoute, [string, string]> = {
  home: ['Tre dimore indipendenti, piscina e idromassaggio nella campagna di Ceglie Messapica. Fino a 13 ospiti, con richieste dirette ad Antonella.', 'Three independent residences, a pool and hydromassage in the Ceglie Messapica countryside. Up to 13 guests, with direct inquiries to Antonella.'],
  suites: ['Confronta Quercia, Corbezzolo e Melograno: spazi, camere e servizi. Le tre dimore possono essere richieste insieme per un gruppo fino a 13 ospiti.', 'Compare Quercia, Corbezzolo and Melograno: spaces, bedrooms and amenities. Enquire about the whole estate for a group of up to 13 guests.'],
  quercia: ['Scopri Trullo Quercia: due camere, cucina autonoma e fino a 7 ospiti. Fotografie, servizi e preventivo con conferma diretta della disponibilità.', 'Discover Quercia Trullo: two bedrooms, your own kitchen and up to 7 guests. Photos, amenities and stay estimates, with availability confirmed directly.'],
  corbezzolo: ['Corbezzolo è una lamia per 2–3 ospiti con cucina autonoma, patio e accesso alla piscina della tenuta. Guarda le fotografie e richiedi le tue date.', 'Corbezzolo is a lamia for 2–3 guests with a kitchen, patio and access to the estate pool. Browse the photographs and enquire about your dates.'],
  melograno: ['Scopri Melograno, dimora per 2–3 ospiti con cucina e spazio esterno. Piscina condivisa con le altre due dimore, nella campagna della Valle d’Itria.', 'Explore Melograno, a residence for 2–3 guests with a kitchen and outdoor space. A pool shared with two other residences in the Itria Valley countryside.'],
  piscina: ['Fotografie della piscina e dell’idromassaggio di Trullo dei Messapi, riservati agli ospiti delle tre dimore a Ceglie Messapica.', 'Photographs of the pool and hydromassage at Trullo dei Messapi, reserved for guests of the three residences in Ceglie Messapica.'],
  preventivo: ['Calcola una stima per una dimora o l’intera tenuta. Tariffe stagionali, letti aggiunti e culla; disponibilità e condizioni confermate da Antonella.', 'Estimate a stay in one residence or the whole estate. Seasonal rates, extra beds and a cot; availability and final terms confirmed by Antonella.'],
  contatti: ['Telefono, WhatsApp, email e posizione di Trullo dei Messapi a Ceglie Messapica. Contatta Antonella per informazioni e richieste di soggiorno.', 'Phone, WhatsApp, email and location of Trullo dei Messapi in Ceglie Messapica. Contact Antonella for information and stay inquiries.'],
  privacy: ['Come funzionano i moduli, le richieste via email e WhatsApp e i servizi esterni del sito Trullo dei Messapi.', 'How the forms, email and WhatsApp inquiries and external services work on the Trullo dei Messapi website.'],
};
export function metadata(route: AppRoute, lang: Language) {
  const index = lang === 'it' ? 0 : 1;
  return { title: `${names[route][index]} | Trullo dei Messapi`, description: descriptions[route][index],
    canonical: siteOrigin + routePath(route, lang), it: siteOrigin + routePath(route, 'it'), en: siteOrigin + routePath(route, 'en'),
    image: siteOrigin + BASE + 'media/piscina/106724803-1024.webp' };
}
export function structuredData(route: AppRoute, lang: Language) {
  const meta = metadata(route, lang);
  return { '@context': 'https://schema.org', '@type': 'LodgingBusiness', name: 'Trullo dei Messapi', url: siteURL,
    description: meta.description, image: meta.image, telephone: CONTACT_INFO.phoneTel, email: CONTACT_INFO.email,
    address: { '@type': 'PostalAddress', streetAddress: CONTACT_INFO.address, addressLocality: 'Ceglie Messapica', addressCountry: 'IT' } };
}
export function useMetadata(route: AppRoute, lang: Language) {
  useEffect(() => {
    const meta = metadata(route, lang);
    document.title = meta.title; document.documentElement.lang = lang;
    const set = (selector: string, attribute: string, value: string) => document.querySelector(selector)?.setAttribute(attribute, value);
    set('meta[name="description"]', 'content', meta.description);
    set('link[rel="canonical"]', 'href', meta.canonical);
    for (const [key, value] of Object.entries({ title: meta.title, description: meta.description, url: meta.canonical, image: meta.image, locale: lang === 'it' ? 'it_IT' : 'en_GB' })) set(`meta[property="og:${key}"]`, 'content', value);
    for (const language of ['it','en','x-default'] as const) set(`link[hreflang="${language}"]`, 'href', language === 'en' ? meta.en : meta.it);
    const schema = document.getElementById('lodging-data');
    if (schema) schema.textContent = JSON.stringify(structuredData(route, lang));
  }, [route, lang]);
}
