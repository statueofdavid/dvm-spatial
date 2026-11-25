import React, { useEffect, useRef, useState } from 'react';
import { BRAIN_REGIONS } from '../data/regions'; 
import type { ThemeMode } from '../App';

interface MobileRadialMenuProps {
  onNavigate: (id: string) => void;
  onClose: () => void;
  theme: ThemeMode;
}

interface PositionMetric {
  angle: number;
  radius: number;
}

export default function MobileRadialMenu({ onNavigate, onClose, theme }: MobileRadialMenuProps): React.JSX.Element {
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const handleDelayedClose = (): void => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 175); 
  };

  useEffect(() => {
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        handleDelayedClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const POSITION_MAP: Record<string, PositionMetric> = {
    action:  { angle: -45,  radius: 115 },
    plan:    { angle: 0,    radius: 160 },
    listen:  { angle: 55,   radius: 105 },
    passion: { angle: 145,  radius: 135 },
    vision:  { angle: 180,  radius: 160 },
    create:  { angle: -150, radius: 145 },
    feel:    { angle: -95,  radius: 130 }
  };

  return (
    <div
      className={`radial-overlay ${isClosing ? 'is-closing' : ''}`} 
      onClick={handleDelayedClose}
      role="dialog"
      aria-modal="true"
      aria-label="Brain Region Navigation Menu" 
    >
      <div className="radial-center" onClick={(e) => e.stopPropagation()}>
        {BRAIN_REGIONS.map((region, index) => {
          const pos = POSITION_MAP[region.id] || { angle: 0, radius: 130 };
          const angleRad = (pos.angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * pos.radius;
          const y = Math.sin(angleRad) * pos.radius;

          return (
            <button
              key={region.id}
              type="button"
              ref={index === 0 ? firstButtonRef : null}
              className={`radial-node ${theme} ${isClosing ? 'node-closing' : ''}`}
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                backgroundColor: region.color
              }}
              onClick={() => {
                onNavigate(region.id);
                handleDelayedClose();
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