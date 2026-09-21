import { useState, useEffect } from 'react';
import { AppRoute } from '../three/types';

export function useAppRouter(): [AppRoute, (route: AppRoute) => void] {
  const parseRouteFromLocation = (): AppRoute => {
    // 1. Check hash first (ideal for GitHub Pages and static hosting)
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (hash === 'suites' || hash === 'dimore') return 'suites';
    if (hash === 'piscina' || hash === 'pool') return 'piscina';
    if (hash === 'esperienza' || hash === 'experience' || hash === 'tenuta') return 'home';
    if (hash === 'preventivo' || hash === 'prenota' || hash === 'tariffe' || hash === 'rates') return 'preventivo';
    if (hash === 'contatti' || hash === 'contact' || hash === 'posizione' || hash === 'dove-siamo') return 'contatti';
    if (hash === 'home') return 'home';

    // 2. Check path segment (e.g. /suites or /trullodeimessapi/suites)
    const segments = window.location.pathname.toLowerCase().split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || '';
    if (lastSegment === 'suites' || lastSegment === 'dimore') return 'suites';
    if (lastSegment === 'piscina' || lastSegment === 'pool') return 'piscina';
    if (lastSegment === 'esperienza' || lastSegment === 'experience' || lastSegment === 'tenuta') return 'home';
    if (lastSegment === 'preventivo' || lastSegment === 'prenota' || lastSegment === 'tariffe' || lastSegment === 'rates') return 'preventivo';
    if (lastSegment === 'contatti' || lastSegment === 'contact' || lastSegment === 'posizione' || lastSegment === 'dove-siamo') return 'contatti';

    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(parseRouteFromLocation);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(parseRouteFromLocation());
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (route: AppRoute) => {
    if (route === currentRoute) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    if (route === 'home') {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    } else {
      window.location.hash = `#${route}`;
    }
    setCurrentRoute(route);

    // Scroll to top of the page immediately when changing routes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return [currentRoute, navigate];
}
