import { useState, useEffect } from 'react';
import { AppRoute } from '../three/types';

export function useAppRouter(): [AppRoute, (route: AppRoute) => void] {
  const parseRouteFromLocation = (): AppRoute => {
    const path = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');
    if (path === 'suites' || path === 'dimore') return 'suites';
    if (path === 'piscina' || path === 'pool') return 'piscina';
    if (path === 'esperienza' || path === 'experience' || path === 'tenuta') return 'esperienza';
    if (path === 'preventivo' || path === 'tariffe' || path === 'rates') return 'preventivo';
    if (path === 'contatti' || path === 'contact' || path === 'posizione') return 'contatti';
    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(parseRouteFromLocation);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseRouteFromLocation());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: AppRoute) => {
    if (route === currentRoute) return;

    const path = route === 'home' ? '/' : `/${route}`;
    window.history.pushState(null, '', path);
    setCurrentRoute(route);

    // Scroll to top of the page smoothly when changing routes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return [currentRoute, navigate];
}
