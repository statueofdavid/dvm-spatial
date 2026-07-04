import React, { useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { BRAIN_REGIONS } from './data/regions.js';
import NeuralCore from './engine/NeuralCore';
import NeuralExperience from './engine/NeuralExperience';
import FitCheck from './components/AboutMe/FitCheck';
import CTAPrompting from './engine/CTAPrompting.jsx';
import './App.css';

export default function App() {
  const [lightMode, setLightMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [mastery, setMastery] = useState({ zoomed: false, rotated: false, selected: false })
  
  const handleMastery = useCallback((action) => {
    setMastery(prev => ({ ...prev, [action]: true }))
  }, [])

  const selectedRegion = useMemo(() => 
    BRAIN_REGIONS.find(r => r.id === selectedId), [selectedId]
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: lightMode ? '#f0f0f0' : '#030303', transition: 'background 0.6s ease-in-out', touchAction: 'none' }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, logarithmicDepthBuffer: true }}>
        {/* NeuralCore is INSIDE Canvas, so useThree() will now work */}
        <NeuralCore 
          lightMode={lightMode} 
          selectedId={selectedId} 
          setSelectedId={setSelectedId}
          mastery={mastery}
          onMastered={handleMastery}
        />
      </Canvas>

      {!selectedId && <CTAPrompting lightMode={lightMode} mastery={mastery} />}

      {selectedRegion && (
        <NeuralExperience 
          region={selectedRegion} 
          onExit={() => setSelectedId(null)}
          onNavigate={(id) => setSelectedId(id)}
          lightMode={lightMode} 
        />
      )}

      {selectedId === 'fit_check' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
          <FitCheck 
            onExit={() => setSelectedId(null)} 
            onNavigate={(id) => setSelectedId(id)} 
            lightMode={lightMode} 
          />
        </div>
      )}

      <button className={`theme-toggle ${lightMode ? 'light' : 'dark'}`} onClick={() => setLightMode(!lightMode)}>
        {lightMode ? 'LIGHT MODE OFF' : 'LIGHT MODE ON'}
      </button>
    </div>
  )
}