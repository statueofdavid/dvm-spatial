import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';

// Adjust these import paths if your folder structure is slightly different
import { BRAIN_REGIONS } from './data/regions';
import NeuralCore from './engine/NeuralCore';
import NeuralExperience from './engine/NeuralExperience';
import CTAPrompting from './engine/CTAPrompting';
import FitCheck from './components/AboutMe/FitCheck';
import { useSpatialRouter } from './hooks/useSpatialRouter'; 
import './App.css';

export default function App() {
  const [lightMode, setLightMode] = useState(false);
  const [mastery, setMastery] = useState({ zoomed: false, rotated: false, selected: false });

  const brainTracker = useRef();
  const labelPortal = useRef();

  const { currentRoute, navigate } = useSpatialRouter();

  const handleMastery = useCallback((action) => {
    setMastery(prev => ({ ...prev, [action]: true }));
  }, []);

  const selectedRegion = useMemo(() => 
    BRAIN_REGIONS.find(r => r.id === currentRoute), [currentRoute]
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: lightMode ? '#f0f0f0' : '#030303', transition: 'background 0.6s ease-in-out', touchAction: 'none' }}>
      
      <div ref={brainTracker} className="brain-tracking-container" style={{ zIndex: 0 }} />

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

      <div ref={labelPortal} className="brain-tracking-container" style={{ zIndex: 5, pointerEvents: 'none' }} />

      <CTAPrompting lightMode={lightMode} mastery={mastery} />

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