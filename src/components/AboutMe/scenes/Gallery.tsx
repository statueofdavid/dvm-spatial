// src/components/AboutMe/scenes/Gallery.tsx
import React, { useState } from 'react';
import { StoryStep } from '../../../data/StorySteps';

interface GalleryProps {
  progress: number;
  step: StoryStep;
  isExiting?: boolean;    
  exitFactor?: number;
}

const Gallery: React.FC<GalleryProps> = ({ progress, step, isExiting = false, exitFactor = 0 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  if (!step?.images) return null;

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
                    /* Add a slight scale pop on hover */
                    transform: `translate(-50%, -50%) translate(${scatterX}px, ${scatterY}px) 
                                translateX(${centeringShiftX}vw) rotate(${(idx * 45) % 60 - 30}deg) 
                                scale(${exitScale * (isHovered ? 1.1 : 1)})`,
                    opacity: exitScale,
                    /* Hovered item gets massive Z-Index boost */
                    zIndex: isHovered ? 5000 : idx,
                    transition: isExiting ? 'none' : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), z-index 0s',
                    pointerEvents: 'auto' // Re-enabling for hover detection
                  }}
                >
                  <img 
                    src={img.src} 
                    className="cloud-item" 
                    alt="Gallery" 
                    style={{
                        /* Inline override for color restoration */
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