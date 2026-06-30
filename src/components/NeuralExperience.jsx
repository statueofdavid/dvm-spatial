import React, { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import SocialMatrix from './SocialMatrix'
import TimelineManager from './AboutMe/TimelineManager';
import Pillow from './Pillow/Pillow';
import FitCheck from './AboutMe/FitCheck';

export default function NeuralExperience({ region, onExit, onNavigate, lightMode }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [region?.id]);

  if (!region) return null;

  return (
    <div className={`experience-portal ${lightMode ? 'light' : 'dark'}`} style={{ borderTop: `6px solid ${region.color}` }}>
      <header className="portal-header" style={{ position: 'relative', zIndex: 10000 }}>
        <div className="container-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* This flex container ensures buttons stay on the same horizontal plane */}
          <button className="portal-exit exit-view-button" onClick={onExit}>[ EXIT_VIEW ]</button>
          {/* Light mode toggle should live here or be caught by the same flex alignment */}
        </div>
      </header>
      
      <div className="portal-scroll-area" ref={scrollRef}>
        {region.id !== 'fit_check' && (
          <div className="container-inner">
            <h1 className="portal-title" style={{ textAlign: 'center', marginBottom: '2vh' }}>{region.label}</h1>
          </div>
        )}
          
        {region.id === 'passion' ? (
          <div className="container-inner">
            <SocialMatrix lightMode={lightMode} />
          </div>
        ) : region.id === 'action' ? (
            <TimelineManager lightMode={lightMode} onNavigate={onNavigate} />
        ) : region.id === 'feel' ? (
          // We must give this div a height, or the Canvas will be invisible!
          <div className="container-inner" style={{ height: '60vh', width: '100%' }}>
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={lightMode ? 1 : 0.2} />
              <Pillow lightMode={lightMode} onNavigate={onNavigate}/>
            </Canvas>
          </div>
        ) : region.id === 'fit_check' ? (
            <FitCheck onExit={onExit} lightMode={lightMode} onNavigate={onNavigate} />
        ) : (
          <div className="container-inner">
            <div className="placeholder-text">{`Initializing ${region.id} module...`}</div>
          </div>
        )}
      </div>

      <style>{`
        .experience-portal { 
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2000; 
          display: flex; flex-direction: column; background: ${lightMode ? '#f8f8f8' : '#050505'};
          overflow: hidden; animation: portalExpand 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .container-inner { width: 90%; max-width: 1400px; margin: 0 auto; padding: 0 20px; }
        .portal-header { width: 100%; padding: 40px 0; flex-shrink: 0; }
        .portal-exit {
          background: transparent; border: 1px solid ${lightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'};
          color: inherit; padding: 10px 24px; cursor: pointer; font-family: 'monospace'; 
          font-size: 12px; border-radius: 30px; transition: 0.3s all;
        }
        .portal-scroll-area { flex: 1; overflow-y: auto; padding-bottom: 5vh; }
        .portal-title { font-size: clamp(32px, 8vw, 80px); text-transform: uppercase; font-weight: 900; letter-spacing: -2px; }
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
        position: fixed;
        top: 20px;           
        left: 20px;          
        z-index: 5000;       
      }

      .portal-exit:hover {
        background: ${lightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'};
        transform: translateY(1px);
      }

      /* MOBILE RESPONSIVE TWEAK */
      @media (max-width: 800px) {
        .portal-exit {
          top: 20px;
          left: 20px;
        }
      }

      `}</style>
    </div>
  )
}