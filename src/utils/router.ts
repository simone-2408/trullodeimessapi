import { useCallback, useEffect, useState } from 'react';
import { AppRoute, parsePath, routePath, ROUTES } from './routes';
import { BookingSelection, Language } from '../types';
export function useAppRouter(initialRoute: AppRoute, initialLang: Language) {
  const [location, setLocation] = useState({ route: initialRoute, lang: initialLang });
  useEffect(() => {
    const update = () => setLocation(parsePath(window.location.pathname));
    // Preserve old shared hash links, replacing them with a canonical path.
    const legacy = window.location.hash.slice(1);
    if (ROUTES.includes(legacy as AppRoute)) {
      window.history.replaceState(null, '', routePath(legacy as AppRoute, initialLang)); update();
    }
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, [initialLang]);
  const navigate = useCallback((route: AppRoute, selection?: BookingSelection) => {
    window.history.pushState(null, '', routePath(route, location.lang) + (selection ? `?alloggio=${selection}` : ''));
    setLocation(previous => ({ ...previous, route }));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.lang]);
  const setLang = useCallback((lang: Language) => {
    window.history.pushState(null, '', routePath(location.route, lang) + window.location.search);
    setLocation(previous => ({ ...previous, lang }));
  }, [location.route]);
  return { currentRoute: location.route, lang: location.lang, navigate, setLang };
}
