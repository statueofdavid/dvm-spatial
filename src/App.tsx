import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';

import { BRAIN_REGIONS } from './data/regions';
import NeuralCore from './engine/NeuralCore';
import NeuralExperience from './engine/NeuralExperience';
import CTAPrompting from './engine/CTAPrompting';
import FitCheck from './components/AboutMe/FitCheck';
import ThemeToggle from './components/ThemeToggle';
import MobileRadialMenu from './components/MobileRadialMenu';
import A11yOverlay from './components/A11yOverlay';
import { useSpatialRouter } from './hooks/useSpatialRouter'; 
import { useIsMobile } from './hooks/useIsMobile';
import './App.css';

export interface MasteryState {
  zoomed: boolean;
  rotated: boolean;
  selected: boolean;
}

export type ThemeMode = 'dark' | 'light';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [mastery, setMastery] = useState<MasteryState>({ zoomed: false, rotated: false, selected: false });
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isRadialMenuOpen, setIsRadialMenuOpen] = useState<boolean>(false);
  const [focusedId, setFocusedId] = useState<string | null>(null); 

  const isMobile = useIsMobile();
  const brainTracker = useRef<HTMLDivElement>(null);
  const labelPortal = useRef<HTMLDivElement>(null);

  const { currentRoute, navigate } = useSpatialRouter();

  const handleMastery = useCallback((action: keyof MasteryState) => {
    setMastery(prev => ({ ...prev, [action]: true }));
  }, []);

  const selectedRegion = useMemo(() => 
    BRAIN_REGIONS.find(r => r.id === currentRoute), 
    [currentRoute]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsRadialMenuOpen(false);
  }, [isMobile, currentRoute]);

  const lightMode = theme === 'light';
  const handleThemeToggle = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isPortalActive = Boolean(currentRoute);

  return (
    <div style={{ position: 'fixed', inset: 0, background: lightMode ? '#f0f0f0' : '#030303', transition: 'background 0.6s ease-in-out', touchAction: 'none' }}>
      
      {/* 3D DOM Tracking Boundaries */}
      <div ref={brainTracker} className="brain-tracking-container" />
      <div ref={labelPortal} className="brain-tracking-container" style={{ zIndex: 9, pointerEvents: 'none' }} />

      {/* 3D Canvas: Stays centered at full screen */}
      {isMounted && (
        <Canvas 
          shadows 
          dpr={[1, 2]} 
          gl={{ antialias: true }}
          eventSource={(document.getElementById('root') as HTMLElement) || undefined}
          style={{ 
            position: 'absolute', 
            inset: 0, 
            width: '100%', 
            height: '100%', 
            pointerEvents: 'none'
          }}
        >
          <View track={brainTracker as React.RefObject<HTMLElement>}>
            <NeuralCore
              lightMode={lightMode}
              selectedId={currentRoute}
              setSelectedId={navigate}
              mastery={mastery}
              onMastered={handleMastery}
              portal={labelPortal}
              onOpenRadialMenu={() => setIsRadialMenuOpen(true)}
              focusedId={focusedId}
            />
          </View>
        </Canvas>
      )}

      {/* Accessibility Overlays (Active only when in the 3D hub) */}
      {!isMobile && !isPortalActive && (
        <A11yOverlay 
          onFocusRegion={setFocusedId} 
          onSelectRegion={navigate} 
        />
      )}

      {isMobile && !isRadialMenuOpen && !isPortalActive && (
        <button 
          type="button"
          onClick={() => setIsRadialMenuOpen(true)}
          style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
          aria-label="Open Brain Navigation Menu"
        >
          Open Menu
        </button>
      )}

      {/* Mobile Radial Menu */}
      {isMobile && isRadialMenuOpen && !isPortalActive && (
        <MobileRadialMenu 
          theme={theme}
          onNavigate={navigate}
          onClose={() => setIsRadialMenuOpen(false)}
        />
      )}

      {/* Global Controls (Hidden when an experience portal takes over) */}
      {!isPortalActive && (
        <>
          <CTAPrompting lightMode={lightMode} mastery={mastery} />
          <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
        </>
      )}

      {/* Unified Fullscreen Portals */}
      {currentRoute === 'fit_check' && (
        <FitCheck onNavigate={navigate} lightMode={lightMode} />
      )}

      {selectedRegion && currentRoute !== 'fit_check' && (
        <NeuralExperience 
          region={selectedRegion} 
          onNavigate={navigate}
          onExit={() => navigate(null)}
          lightMode={lightMode}
        />
      )}
    </div>
  );
}