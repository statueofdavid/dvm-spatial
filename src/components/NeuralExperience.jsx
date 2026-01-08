import React from 'react'
import SocialMatrix from './SocialMatrix'

export default function NeuralExperience({ region, onExit, lightMode }) {
  if (!region) return null;

  return (
    <div className={`experience-portal ${lightMode ? 'light' : 'dark'}`} style={{ borderLeft: `6px solid ${region.color}` }}>
      <div className="portal-header">
        <span className="portal-path">{`SECTION // ${region.id.toUpperCase()}`}</span>
        <button className="portal-exit" onClick={onExit}>[ EXIT ]</button>
      </div>
      
      <div className="portal-content">
        <h1 className="portal-title">{region.label}</h1>
        
        {/* MODULAR LOADING: Add new components here as they are built */}
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
  )
}
