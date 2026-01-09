import React from 'react'
import SocialMatrix from './SocialMatrix'

export default function NeuralExperience({ region, onExit, lightMode }) {
  if (!region) return null;

  return (
    <div className={`experience-portal ${lightMode ? 'light' : 'dark'}`} style={{ borderTop: `6px solid ${region.color}` }}>
      <header className="portal-header">
        <div className="container-inner">
          <button className="portal-exit" onClick={onExit}>[ EXIT_VIEW ]</button>
        </div>
      </header>
      
      <div className="portal-scroll-area">
        <div className="container-inner">
          <h1 className="portal-title" style={{ textAlign: 'center', marginBottom: '4vh' }}>{region.label}</h1>
          
          {region.id === 'passion' ? (
            <SocialMatrix lightMode={lightMode} />
          ) : (
            <div className="placeholder-text">
              {`Initializing ${region.id} module...`}
              <div className="loading-bar"><div className="bar-fill" style={{ background: region.color }}></div></div>
            </div>
          )}
        </div>
      </div>

      <style>{`
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
          max-width: 1600px; /* Expansive for large viewports */
          margin: 0 auto;    /* Centers everything to fix the clipping */
          padding: 0 20px;   /* Safety buffer */
        }

        .container-inner {
          width: 90%;
          max-width: 1400px; /* Prevents text from stretching too far on desktop */
          margin: 0 auto;
        }
        
        .portal-header { 
          width: 100%; 
          padding: 40px 0; 
          flex-shrink: 0;
        }

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

        .portal-exit:hover {
          background: ${lightMode ? '#000' : '#fff'};
          color: ${lightMode ? '#fff' : '#000'};
        }

        .portal-scroll-area { 
          flex: 1; 
          overflow-y: auto; 
          padding-bottom: 10vh;
        }

        .portal-title { 
          font-size: clamp(48px, 10vw, 120px); 
          margin-bottom: 6vh; 
          text-transform: uppercase; 
          font-weight: 900; 
          letter-spacing: -4px;
          line-height: 0.9;
        }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @keyframes portalExpand { 
          from { 
            opacity: 0; 
            transform: scale(0.9) translateZ(-100px); 
            filter: blur(10px);
          } 
          to { 
            opacity: 1; 
            transform: scale(1) translateZ(0); 
            filter: blur(0px);
          } 
        }
      `}</style>
    </div>
  )
}