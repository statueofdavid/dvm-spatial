import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';

import { BRAIN_REGIONS } from './data/regions';
import NeuralCore from './engine/NeuralCore';
import NeuralExperience from './engine/NeuralExperience';
import CTAPrompting from './engine/CTAPrompting';
import FitCheck from './components/AboutMe/FitCheck';
import ThemeToggle from './components/ThemeToggle';
import { useSpatialRouter } from './hooks/useSpatialRouter'; 
import './App.css';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [mastery, setMastery] = useState({ zoomed: false, rotated: false, selected: false });
  const [isMounted, setIsMounted] = useState(false);

  const brainTracker = useRef();
  const labelPortal = useRef();

  const { currentRoute, navigate } = useSpatialRouter();

  const handleMastery = useCallback((action) => {
    setMastery(prev => ({ ...prev, [action]: true }));
  }, []);

  const selectedRegion = useMemo(() => 
    BRAIN_REGIONS.find(r => r.id === currentRoute), [currentRoute]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const lightMode = theme === 'light';

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: lightMode ? '#f0f0f0' : '#030303', transition: 'background 0.6s ease-in-out', touchAction: 'none' }}>
      
      <div ref={brainTracker} className="brain-tracking-container" style={{ zIndex: 0 }} />
      <div ref={labelPortal} className="brain-tracking-container" style={{ zIndex: 9, pointerEvents: 'none' }} />

      {isMounted && (
        <Canvas 
          shadows 
          dpr={[1, 2]} 
          gl={{ antialias: true, logarithmicDepthBuffer: true }}
          eventSource={document.getElementById('root')}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <View track={brainTracker}>
            <NeuralCore
              lightMode={lightMode}
              selectedId={currentRoute}
              setSelectedId={navigate}
              mastery={mastery}
              onMastered={handleMastery}
              portal={labelPortal}
            />
          </View>
        </Canvas>
      )}

      <CTAPrompting lightMode={lightMode} mastery={mastery} />

      <ThemeToggle 
        theme={theme} 
        onToggle={handleThemeToggle} 
      />

      {/* Top Level Overlays */}
      {currentRoute === 'fit_check' && (
        <FitCheck 
          onNavigate={navigate} 
          lightMode={lightMode} 
        />
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