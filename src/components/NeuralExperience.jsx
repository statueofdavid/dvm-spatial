import React, { useEffect, useRef } from 'react'
import { logger } from '../utils/logger';
import SocialMatrix from './SocialMatrix'
import TimelineManager from './AboutMe/TimelineManager';

export default function NeuralExperience({ region, onExit, onNavigate, lightMode }) {
  // Use a ref to target the scrollable div
  const scrollRef = useRef(null);

  // Reset scroll whenever the user jumps to a new region
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [region?.id]);

  useEffect(() => {
    // when a specific module is "Entered"
    const startTime = performance.now();
    logger.info(`PORTAL_INIT // ${region.id.toUpperCase()}`, { type: region.type });

    // when the user leaves (Dwell Time)
    return () => {
      const duration = (performance.now() - startTime) / 1000;
      logger.debug(`PORTAL_TERMINATED // ${region.id.toUpperCase()}`, { dwellTime: `${duration.toFixed(2)}s` });
    };
  }, [region.id]);

  // when navigation occurs 
  const handleInternalNavigate = (id) => {
    logger.info(`PORTAL_REDIRECT // ${id.toUpperCase()}`);
    onNavigate(id);
  };

  if (!region) return null;

  return (
    <div className={`experience-portal ${lightMode ? 'light' : 'dark'}`} style={{ borderTop: `6px solid ${region.color}` }}>
      <header className="portal-header">
        <div className="container-inner">
          <button className="portal-exit" onClick={onExit}>[ EXIT_VIEW ]</button>
        </div>
      </header>
      
      {/* Attach the ref here to allow programmatic scrolling */}
      <div className="portal-scroll-area" ref={scrollRef}>
        <div className="container-inner">
          <h1 className="portal-title" style={{ textAlign: 'center', marginBottom: '4vh' }}>{region.label}</h1>
        </div>
          
        {region.id === 'passion' ? (
          <div className="container-inner">
            <SocialMatrix lightMode={lightMode} />
          </div>
        ) : region.id === 'action' ? (
            <TimelineManager lightMode={lightMode} onNavigate={onNavigate} />
        ) : (
          <div className="container-inner">
            <div className="placeholder-text">{`Initializing ${region.id} module...`}</div>
          </div>
        )}
      </div>

      <style>{`
        /* Keeping your existing styles exactly as they were */
        .experience-portal { 
          position: fixed; top: 0; left: 0; 
          width: 100vw; height: 100vh; 
          z-index: 2000; 
          display: flex; flex-direction: column; 
          background: ${lightMode ? '#f8f8f8' : '#050505'};
          overflow: hidden;
          animation: portalExpand 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: center center;
        }

        .container-inner {
          width: 90%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .portal-header { width: 100%; padding: 40px 0; flex-shrink: 0; }
        .portal-exit {
          background: transparent;
          border: 1px solid ${lightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'};
          color: inherit;
          padding: 10px 24px;
          cursor: pointer;
          font-family: 'monospace';
          font-size: 12px;
          border-radius: 30px;
          transition: 0.3s all;
        }
        .portal-scroll-area { flex: 1; overflow-y: auto; padding-bottom: 10vh; }
        .portal-title { 
          font-size: clamp(48px, 10vw, 120px); 
          margin-bottom: 6vh; 
          text-transform: uppercase; 
          font-weight: 900; 
          letter-spacing: -4px;
          line-height: 0.9;
        }
        @keyframes portalExpand { 
          from { opacity: 0; transform: scale(0.9) translateZ(-100px); filter: blur(10px); } 
          to { opacity: 1; transform: scale(1) translateZ(0); filter: blur(0px); } 
        }
      `}</style>
    </div>
  )
}