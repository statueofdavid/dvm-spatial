import React, { useState, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { BRAIN_REGIONS } from './data/regions.js'
import NeuralCore from './components/NeuralCore'
import NeuralExperience from './components/NeuralExperience'
import CTAPrompting from './components/CTAPrompting'

export default function App() {
  const [lightMode, setLightMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  
  // SHARED MASTERY STATE
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
        <NeuralCore 
          lightMode={lightMode} 
          selectedId={selectedId} 
          setSelectedId={setSelectedId}
          mastery={mastery}
          onMastered={handleMastery}
        />
      </Canvas>

      {!selectedId && <CTAPrompting lightMode={lightMode} mastery={mastery} />}

      {selectedId && (
        <NeuralExperience 
          region={selectedRegion} 
          onExit={() => setSelectedId(null)} 
          lightMode={lightMode} 
        />
      )}

      <button className={`theme-toggle ${lightMode ? 'light' : 'dark'}`} onClick={() => setLightMode(!lightMode)}>
        {lightMode ? 'LIGHT MODE OFF' : 'LIGHT MODE ON'}
      </button>

      <style>{`
        .theme-toggle { position: absolute; top: 30px; right: 30px; padding: 12px 24px; z-index: 1000; cursor: pointer; font-family: 'monospace'; font-size: 11px; font-weight: bold; letter-spacing: 2px; border: 1px solid; border-radius: 30px; transition: 0.4s all; }
        .theme-toggle.dark { color: #00ffff; border-color: rgba(0,255,255,0.4); background: rgba(0,0,0,0.7); }
        .theme-toggle.light { color: #333; border-color: rgba(0,0,0,0.2); background: rgba(255,255,255,0.8); }

        /* RESTORED LAB HUD STYLING */
        .lab-hud { padding: 1.2rem 2.2rem; font-family: 'monospace'; width: 380px; transform: scale(0.95); transform-origin: bottom center; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center; border-radius: 6px; user-select: none; }
        .lab-hud.dark { background: rgba(0, 0, 0, 0.95); color: white; border: 1px solid rgba(255,255,255,0.1); }
        .lab-hud.light { background: rgba(255, 255, 255, 0.98); color: #1a1a1a; border: 1px solid rgba(0,0,0,0.05); }
        .top-hud { transform: translateY(-100%); margin-bottom: 20px; }
        .hud-header { font-size: 11px; letter-spacing: 5px; opacity: 0.7; margin-bottom: 10px; }
        .hud-title { font-weight: 800; font-size: 22px; text-transform: uppercase; line-height: 1.1; margin: 0; }
        .hud-cta { font-size: 11px; margin-top: 15px; border-top: 1px solid rgba(128,128,128,0.2); padding-top: 10px; }

        .fixed-footer { position: absolute; bottom: 5vh; left: 0; right: 0; display: flex; justify-content: center; pointer-events: none; }
        .terminal-cta { font-family: 'monospace'; letter-spacing: 0.6vw; font-size: clamp(10px, 2vw, 18px); padding: 1.4vh 2.8vw; border-radius: 4px; transition: opacity 0.6s ease; opacity: 1; }
        .terminal-cta.fading { opacity: 0; }
        .terminal-cta.dark { color: #00ffff; text-shadow: 0 0 12px rgba(0,255,255,0.7); background: rgba(0,0,0,0.65); }
        .terminal-cta.light { color: #222; background: rgba(255,255,255,0.75); border: 1px solid rgba(0,0,0,0.15); }
        
        .experience-portal { position: absolute; top: 0; right: 0; width: 45%; height: 100%; z-index: 500; padding: 80px; font-family: 'monospace'; display: flex; flex-direction: column; background: rgba(3, 3, 3, 0.88); backdrop-filter: blur(24px); box-shadow: -20px 0 60px rgba(0,0,0,0.6); animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .experience-portal.light { background: rgba(255, 255, 255, 0.9); color: #1a1a1a; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  )
}
