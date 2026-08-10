import { useState, useEffect, useCallback } from 'react';
import { BRAIN_REGIONS } from '../data/regions';

export function useSpatialRouter() {
  // 1. Initial State Parsing: Read query params on boot (Deep-Linking)
  const [currentRoute, setCurrentRoute] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('region') || null;
  });

  // 2. Navigation Dispatcher: Pushes history and updates state
  const navigate = useCallback((routeId: string | null) => {
    setCurrentRoute(routeId);
    
    const params = new URLSearchParams(window.location.search);
    const urlRegion = params.get('region');

    if (routeId) {
      if (urlRegion !== routeId) {
        window.history.pushState({ regionId: routeId }, '', `?region=${routeId}`);
      }
    } else {
      if (urlRegion) {
        window.history.pushState({ regionId: null }, '', window.location.pathname);
      }
    }
  }, []);

  // 3. Tab Title Synchronization: Dynamically update browser tab
  useEffect(() => {
    if (currentRoute === 'fit_check') {
      document.title = 'Compatibility Scan | declared.space';
    } else if (currentRoute) {
      const activeRegion = BRAIN_REGIONS.find(r => r.id === currentRoute);
      const label = activeRegion ? activeRegion.label : currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1);
      document.title = `${label} | declared.space`;
    } else {
      document.title = 'declared.space';
    }
  }, [currentRoute]);

  // 4. Popstate Interception: Listen to browser Back / Forward clicks
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const regionId = event.state?.regionId || new URLSearchParams(window.location.search).get('region');
      setCurrentRoute(regionId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return { currentRoute, navigate };
}