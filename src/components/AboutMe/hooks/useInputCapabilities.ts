import { useState, useEffect } from 'react';

export interface InputCapabilities {
  hasTouch: boolean;       // Device supports touch points
  isCoarsePointer: boolean;// Primary pointer is inaccurate (finger/stylus)
  canHover: boolean;       // Device can trigger hover states (mouse/trackpad)
}

export const useInputCapabilities = (): InputCapabilities => {
  const [capabilities, setCapabilities] = useState<InputCapabilities>(() => {
    if (typeof window === 'undefined') {
      return { hasTouch: false, isCoarsePointer: false, canHover: true };
    }

    return {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      isCoarsePointer: window.matchMedia('(pointer: coarse)').matches,
      canHover: window.matchMedia('(hover: hover)').matches,
    };
  });

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    const hoverQuery = window.matchMedia('(hover: hover)');

    const updateCapabilities = () => {
      setCapabilities({
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        isCoarsePointer: pointerQuery.matches,
        canHover: hoverQuery.matches,
      });
    };

    pointerQuery.addEventListener('change', updateCapabilities);
    hoverQuery.addEventListener('change', updateCapabilities);

    return () => {
      pointerQuery.removeEventListener('change', updateCapabilities);
      hoverQuery.removeEventListener('change', updateCapabilities);
    };
  }, []);

  return capabilities;
};