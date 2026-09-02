import React, { useState } from 'react';
import { StoryStep } from '../../../data/StorySteps';
import { useIsMobile } from '../../../hooks/useIsMobile';
import CubeGame from './CubeGame';
import "./style/Gallery.css";

interface GalleryProps {
  progress: number;
  step: StoryStep;
  isExiting?: boolean;    
  exitFactor?: number;
}

const Gallery: React.FC<GalleryProps> = ({ progress, step, isExiting = false, exitFactor = 0 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCubeGame, setShowCube] = useState<boolean>(false); 
  const isMobile = useIsMobile();
  
  if (!step?.images) return null;

  const safeImages = step.images || [];

const getPuzzlePath = (idx: number, total: number) => {
    const isTopRow = idx < 2;
    const isBottomRow = idx >= total - (total % 2 === 0 ? 2 : 1);
    const isLeftCol = idx % 2 === 0;
    const isEvenRow = Math.floor(idx / 2) % 2 === 0;

    // Top Edge (Flat or Pinched Horseshoe)
    let top = `M 0,0 L 100,0`; 
    if (!isTopRow) {
      top = isEvenRow 
        ? `M 0,0 L 35,0 C 35,-10 25,-10 25,-20 C 25,-40 75,-40 75,-20 C 75,-10 65,-10 65,0 L 100,0` 
        : `M 0,0 L 35,0 C 35,10 25,10 25,20 C 25,40 75,40 75,20 C 75,10 65,10 65,0 L 100,0`; 
    }

    // Right Edge
    let right = `L 100,100`; 
    if (isLeftCol) {
      right = `L 100,35 C 110,35 110,25 120,25 C 140,25 140,75 120,75 C 110,75 110,65 100,65 L 100,100`; 
    }

    // Bottom Edge
    let bottom = `L 0,100`; 
    if (!isBottomRow) {
      bottom = isEvenRow
        ? `L 65,100 C 65,110 75,110 75,120 C 75,140 25,140 25,120 C 25,110 35,110 35,100 L 0,100` 
        : `L 65,100 C 65,90 75,90 75,80 C 75,60 25,60 25,80 C 25,90 35,90 35,100 L 0,100`; 
    }

    // Left Edge
    let left = `L 0,0`; 
    if (!isLeftCol) {
       left = `L 0,65 C 10,65 10,75 20,75 C 40,75 40,25 20,25 C 10,25 10,35 0,35 L 0,0`; 
    }

    return `${top} ${right} ${bottom} ${left} Z`;
  };

// --- MOBILE PUZZLE MOSAIC EXPERIENCE ---

if (isMobile) {
    return (
      <div 
        className="layer-priorities mobile-mosaic-viewport" 
        style={{ 
          opacity: isExiting ? 1 - exitFactor : 1,
          pointerEvents: 'auto' 
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className="mobile-mosaic-content">
          <div className="parallax-text center-contents mobile-quip-container">
            <h2 className="layer-tag">// {step.tag}</h2>
            <p className="large-quip">{step.text}</p>
          </div>

          <div className="mobile-mosaic-grid">
            {safeImages.map((img, idx) => (
              <div 
                key={idx} 
                className="mobile-mosaic-tile"
                onClick={() => setSelectedImage(img.src)}
              >
                <svg 
                  viewBox="0 0 100 100" 
                  className="mobile-mosaic-svg"
                  overflow="visible" 
                >
                  <defs>
                    <clipPath id={`puzzle-clip-${idx}`}>
                      <path d={getPuzzlePath(idx, safeImages.length)} />
                    </clipPath>
                  </defs>
                  
                  <image 
                    href={img.src} 
                    x="-50" y="-50" 
                    width="200" height="200" 
                    preserveAspectRatio="xMidYMid slice" 
                    clipPath={`url(#puzzle-clip-${idx})`}
                    className="mobile-mosaic-img"
                  />
                  
                  <path 
                    d={getPuzzlePath(idx, safeImages.length)} 
                    fill="none" 
                    stroke="#ff810a" 
                    strokeWidth="1.5" 
                    className="mobile-mosaic-border"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {selectedImage && (
          <div className="mosaic-lightbox" onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} alt="Expanded view" className="mosaic-lightbox-img" />
            
            <button className="mosaic-close-btn" onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}>
              [ CLOSE ]
            </button>
          </div>
        )}
      </div>
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
      {showCubeGame && (
        (() => {
          console.log("🛠️ GALLERY LOG: Launching CubeGame. safeImages length:", safeImages.length);
          console.log("🛠️ GALLERY LOG: Image data:", safeImages);
          return <CubeGame onClose={() => setShowCube(false)} images={safeImages} />;
        })()
      )}
    </div>
  );
};;

export default Gallery;