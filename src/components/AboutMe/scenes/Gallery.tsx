import React, { useState } from 'react';
import { StoryStep } from '../../../data/StorySteps';
import { useIsMobile } from '../../../hooks/useIsMobile';
import CubeGame from '../PuzzleCube/CubeGame';
import "./style/Gallery.css";

interface GalleryProps {
  progress: number;
  step: StoryStep;
  isExiting?: boolean;    
  exitFactor?: number;
}

const Gallery: React.FC<GalleryProps> = ({ progress, step, isExiting = false, exitFactor = 0 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showCubeGame, setShowCube] = useState<boolean>(false); 
  const isMobile = useIsMobile();
  
  if (!step?.images) return null;

  const safeImages = step.images || [];

  // --- MOBILE EXPERIENCE ---
  if (isMobile) {
    return (
      <>
        <div 
          className="layer-priorities mobile-mosaic-viewport" 
          style={{ 
            opacity: isExiting ? 1 - exitFactor : 1,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="mobile-mosaic-content" style={{ textAlign: 'center' }}>
            <div className="parallax-text center-contents mobile-quip-container">
              <h2 className="layer-tag">// {step.tag}</h2>
              <p className="large-quip">{step.text}</p>
            </div>

            <button 
              className="puzzle-mobile-cta" 
              onClick={() => setShowCube(true)}
              style={{
                marginTop: '32px',
                background: 'transparent',
                border: '1px solid #ff810a',
                color: '#ff810a',
                padding: '16px 32px',
                fontFamily: 'monospace',
                fontSize: '16px',
                letterSpacing: '2px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Play Puzzle Piece Paster
            </button>
          </div>
        </div>

        {/* Mounts the game via Portal when triggered on mobile */}
        {showCubeGame && (
          <CubeGame onClose={() => setShowCube(false)} images={safeImages} />
        )}
      </>
    );
  }

  // --- DESKTOP SCATTER CLOUD EXPERIENCE ---
  return (
    <div className="layer-priorities" style={{ opacity: isExiting ? 1 : progress < 0.1 ? progress * 10 : progress > 0.9 ? (1 - progress) * 10 : 1 }}>
      <div className="layer-grid">
        <div className="visual-slot">
          <div className="image-cloud-container">
            {step.images.map((img, idx) => {
              const bloomProgress = Math.min(1.5, progress * 3);
              const singularityForce = isExiting ? Math.pow(1 - exitFactor, 3) : 1;
              const exitScale = isExiting ? (1 - exitFactor) : 1;
              
              const centeringShiftX = isExiting ? (exitFactor * 25.5) : 0; 
              const angle = (idx / (step.images?.length || 1)) * Math.PI * 2;
              const radius = 260 * bloomProgress * singularityForce; 
              const scatterX = Math.cos(angle) * radius;
              const scatterY = Math.sin(angle) * (radius * 0.4); 

              const isHovered = hoverIndex === idx;

              return (
                <div 
                  key={idx} 
                  className={`cloud-wrapper ${isHovered ? 'active-layer' : ''}`}
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) translate(${scatterX}px, ${scatterY}px) 
                                translateX(${centeringShiftX}vw) rotate(${(idx * 45) % 60 - 30}deg) 
                                scale(${exitScale * (isHovered ? 1.1 : 1)})`,
                    opacity: exitScale,
                    zIndex: isHovered ? 5000 : idx,
                    transition: isExiting ? 'none' : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), z-index 0s',
                    pointerEvents: 'auto'
                  }}
                >
                  <img 
                    src={img.src} 
                    className="cloud-item" 
                    alt="Gallery" 
                    style={{
                        filter: isHovered 
                          ? 'grayscale(0%) brightness(1.1) contrast(1.1)' 
                          : 'grayscale(100%) brightness(0.7) contrast(1)'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="parallax-text" 
          style={{ 
            opacity: isExiting ? 1 - exitFactor : 1,
            pointerEvents: 'auto'  
          }}
        >
          <h2 className="layer-tag">// {step.tag}</h2>
          <p className="large-quip">{step.text}</p>
          <button 
            className="puzzle-desktop-cta" 
            onClick={() => 
              setShowCube(true)
            }
            style={{
              marginTop: '32px',
              background: 'transparent',
              border: '1px solid #ff810a',
              color: '#ff810a',
              padding: '12px 24px',
              fontFamily: 'monospace',
              fontSize: '14px',
              letterSpacing: '2px',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 129, 10, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Play Photos Piece Paster
          </button>
        </div>
      </div>
      
      {/* Mounts the game via Portal when triggered on desktop */}
      {showCubeGame && (
        <CubeGame onClose={() => setShowCube(false)} images={safeImages} />
      )}
    </div>
  );
};

export default Gallery;