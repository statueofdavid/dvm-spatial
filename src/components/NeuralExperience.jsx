import React from 'react'
import SocialMatrix from './SocialMatrix'

export default function NeuralExperience({ region, onExit, lightMode }) {
  if (!region) return null;

  return (
    <div className={`experience-portal ${lightMode ? 'light' : 'dark'}`} style={{ borderLeft: `6px solid ${region.color}` }}>
      <div className="portal-header">
        <span className="portal-path">{`SECTION // ${region.id.toUpperCase()}`}</span>
        <button className="portal-exit" onClick={onExit}>[ EXIT_VIEW ]</button>
      </div>
      
      <div className="portal-scroll-area"> {/* NEW: Dedicated scroll wrapper */}
        <div className="portal-content">
          <h1 className="portal-title">{region.label}</h1>
          
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
          position: absolute; top: 0; right: 0; 
          width: clamp(320px, 45vw, 100%); /* Viewport Aware Width */
          height: 100%; z-index: 500; 
          display: flex; flex-direction: column; 
          background: rgba(3, 3, 3, 0.92); backdrop-filter: blur(20px);
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        
        .portal-scroll-area { 
          flex: 1; overflow-y: auto; overflow-x: hidden; 
          padding: 4vh 5vw; /* Fluid Padding */
        }

        .experience-portal.light { background: rgba(255, 255, 255, 0.95); color: #1a1a1a; }
        .portal-header { display: flex; justify-content: space-between; padding: 20px 5vw; font-size: 11px; opacity: 0.6; }
        .portal-title { font-size: clamp(32px, 5vw, 52px); margin-bottom: 2vh; text-transform: uppercase; }
        
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          .experience-portal { width: 100%; border-left: none; border-top: 6px solid; }
        }
      `}</style>
    </div>
  )
}