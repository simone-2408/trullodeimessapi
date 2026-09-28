import type { Language } from '../types';
export const ROUTES = ['home', 'suites', 'quercia', 'corbezzolo', 'melograno', 'piscina', 'preventivo', 'contatti', 'privacy'] as const;
export type AppRoute = typeof ROUTES[number];
export const BASE = import.meta.env?.BASE_URL || '/trullodeimessapi/';
export function routePath(route: AppRoute, lang: Language, base = BASE) {
  return `${base}${lang === 'en' ? 'en/' : ''}${route === 'home' ? '' : `${route}/`}`;
}
export function parsePath(pathname: string, base = BASE): { route: AppRoute; lang: Language } {
  const parts = pathname.replace(base, '/').split('/').filter(Boolean);
  const lang = parts[0] === 'en' ? 'en' : 'it';
  if (lang === 'en') parts.shift();
  const route = ROUTES.find(route => route === parts[0]) || 'home';
  return { route, lang };
}
