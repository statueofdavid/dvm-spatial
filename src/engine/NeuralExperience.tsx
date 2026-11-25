// src/engine/NeuralExperience.tsx
import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import SocialMatrix from '../components/Social/SocialMatrix.tsx';
import TimelineManager from '../components/AboutMe/TimelineManager'; 
import Pillow from '../components/Pillow/Pillow';
import FitCheck from '../components/AboutMe/FitCheck';
import SoundsSampler from '../components/Sounds/SoundSampler';
import type { Region } from '../data/regions';

export interface NeuralExperienceProps {
  region: Region | null | undefined;
  onExit: () => void;
  onNavigate: (route: string | null) => void;
  lightMode: boolean;
}

export default function NeuralExperience({ 
  region, 
  onExit, 
  onNavigate, 
  lightMode 
}: NeuralExperienceProps): React.JSX.Element | null {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSounds = region?.id === 'listen' || region?.id === 'sounds';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [region?.id]);

  if (!region) return null;

  return (
    <div className={`experience-portal ${lightMode ? 'light' : 'dark'} ${isSounds ? 'portal-fullscreen' : ''}`}>
      {/* Hide the default floating exit header when in the sounds experience */}
      {!isSounds && (
        <header className="portal-header">
          <div className="container-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="portal-exit exit-view-button" onClick={onExit} type="button">
              Exit
            </button>
          </div>
        </header>
      )}

      <div
        className={`portal-scroll-area ${isSounds ? 'scroll-locked' : 'scroll-natural'}`}
        ref={scrollRef}
        tabIndex={0}
        aria-label={`${region.label} Experience Timeline. Use arrow keys or spacebar to scroll.`}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }
        }}
      >
        {region.id !== 'fit_check' && region.id !== 'action' && !isSounds && (
          <div className="container-inner">
            <h1 className="portal-title">{region.label}</h1>
          </div>
        )}

        {region.id === 'passion' ? (
          <div className="container-inner">
            <SocialMatrix lightMode={lightMode} />
          </div>
        ) : region.id === 'action' ? (
          <TimelineManager 
            lightMode={lightMode} 
            onNavigate={onNavigate} 
            onExit={onExit} 
          />
        ) : region.id === 'feel' ? (
          <div className="container-inner" style={{ height: '60vh', width: '100%' }}>
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={lightMode ? 1 : 0.2} />
              <Pillow lightMode={lightMode} />
            </Canvas>
          </div>
        ) : region.id === 'fit_check' ? (
          <FitCheck onExit={onExit} lightMode={lightMode} onNavigate={onNavigate} />
        ) : isSounds ? (
          <SoundsSampler lightMode={lightMode} onExit={onExit} />
        ) : (
          <div className="container-inner">
            <div className="placeholder-text">{`Initializing ${region.id} module...`}</div>
          </div>
        )}
      </div>

      <style>{`
        /* =========================================================================
           BASE PORTAL SHELL
           ========================================================================= */
        .experience-portal {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
          overflow: hidden;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }

        .container-inner {
          width: 90%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .portal-header {
          width: 100%;
          padding: 24px 0 0 0;
          flex-shrink: 0;
        }

        .portal-exit {
          background: transparent;
          border: 1px solid ${lightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'};
          color: inherit;
          padding: 8px 20px;
          cursor: pointer;
          font-family: 'monospace';
          font-size: 12px;
          border-radius: 30px;
          transition: 0.2s all ease;
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 5000;
        }

        .portal-exit:hover {
          background: ${lightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)'};
          transform: translateY(1px);
        }

        .portal-title {
          font-size: clamp(32px, 8vw, 80px);
          text-transform: uppercase;
          font-weight: 900;
          letter-spacing: -2px;
        }

        /* =========================================================================
           DEFAULT SCROLLING EXPERIENCES (About Me / Timeline / Social / FitCheck)
           ========================================================================= */
        .portal-scroll-area.scroll-natural {
          width: 100%;
          height: 100%;
          flex: 1;
          display: block;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          padding: 0;
          margin: 0;
          touch-action: pan-y;
          -webkit-overflow-scrolling: touch;
        }

        /* =========================================================================
           SOUNDS EXPERIENCE: FULL-BLEED LOCKED RACK (Desktop & Mobile)
           ========================================================================= */
        .experience-portal.portal-fullscreen {
          overflow: hidden;
          padding: 0;
          margin: 0;
        }

        .portal-scroll-area.scroll-locked {
          width: 100%;
          height: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }

        @media (max-width: 1024px) {
          .experience-portal.portal-fullscreen,
          .portal-scroll-area.scroll-locked {
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .portal-scroll-area.scroll-natural {
            overflow-y: auto !important;
            height: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}