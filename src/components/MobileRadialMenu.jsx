import React from 'react';
import { BRAIN_REGIONS } from '../data/regions'; 

useEffect(() => {
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

export default function MobileRadialMenu({ onNavigate, onClose, theme }) {
  const POSITION_MAP = {
    'action':  { angle: -45,  radius: 115 }, // Top (Me)
    'plan':    { angle: 0,  radius: 170 }, // Top-Right (Projects)
    'listen':  { angle: 55,   radius: 105 }, // Right (Sounds)
    'passion': { angle: 145,   radius: 135 }, // Bottom-Right (Status)
    'vision':  { angle: 180,  radius: 175 }, // Bottom-Left (Panopticon)
    'create':  { angle: -150,  radius: 145 }, // Left (Synthesize)
    'feel':    { angle: -95, radius: 130 }  // Top-Left (Pillow)
  };

  return (
    <div className="radial-overlay" onClick={onClose}>
      <div className="radial-center" onClick={(e) => e.stopPropagation()}>
        {BRAIN_REGIONS.map((region) => {
          // Fallback
          const pos = POSITION_MAP[region.id] || { angle: 0, radius: 130 };
          
          const angleRad = (pos.angle * Math.PI) / 180;
          
          const x = Math.cos(angleRad) * pos.radius;
          const y = Math.sin(angleRad) * pos.radius;

          return (
            <button
              key={region.id}
              className={`radial-node ${theme}`}
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                backgroundColor: region.color
              }}
              onClick={() => {
                onNavigate(region.id);
                onClose();
              }}
            >
              {region.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}