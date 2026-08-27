import React, { useState } from 'react';
import { StoryStep } from '../../../data/StorySteps';
import { useIsMobile } from '../../../hooks/useIsMobile';
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
  const isMobile = useIsMobile();
  
  if (!step?.images) return null;

  // --- MOBILE PUZZLE MOSAIC EXPERIENCE ---
  if (isMobile) {
    return (
      <div 
        className="layer-priorities mobile-mosaic-viewport" 
        style={{ 
          opacity: isExiting ? 1 - exitFactor : 1,
          pointerEvents: 'auto' // 💥 CRITICAL FIX: Overrides SceneDirector's pointer-events: none[cite: 13]
        }}
      >
        <div className="mobile-mosaic-content">
          {/* 1. Quip is now securely at the top of the scrollable flow */}
          <div className="parallax-text center-contents mobile-quip-container">
            <h2 className="layer-tag">// {step.tag}</h2>
            <p className="large-quip">{step.text}</p>
          </div>

          {/* 2. Connected 2-per-row puzzle mosaic grid */}
          <div className="mobile-mosaic-grid">
            {step.images.map((img, idx) => (
              <div 
                key={idx} 
                className="mobile-mosaic-tile"
                onClick={() => setSelectedImage(img.src)}
              >
                <img 
                  src={img.src} 
                  className="mobile-mosaic-img" 
                  alt="Memory tile" 
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Full-Screen Color Lightbox View for Tapped Photos */}
        {selectedImage && (
          <div className="mosaic-lightbox" onClick={() => setSelectedImage(null)}>
            <button className="mosaic-close-btn" onClick={() => setSelectedImage(null)}>
              [ CLOSE ]
            </button>
            <img src={selectedImage} alt="Expanded view" className="mosaic-lightbox-img" />
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
        <div className="parallax-text" style={{ opacity: isExiting ? 1 - exitFactor : 1 }}>
          <h2 className="layer-tag">// {step.tag}</h2>
          <p className="large-quip">{step.text}</p>
        </div>
      </div>
    </div>
  );
};

export default Gallery;