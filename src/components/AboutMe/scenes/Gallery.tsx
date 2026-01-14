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
        <div className="visual-slot" style={{ pointerEvents: 'auto' }}>
          <div className="image-cloud-container">
            {step.images.map((img, idx) => {
              const bloomProgress = Math.min(1.5, progress * 3);
              const singularityForce = isExiting ? Math.pow(1 - exitFactor, 3) : 1;
              const exitScale = isExiting ? (1 - exitFactor) : 1;
              
              // Corrective shift to hit the true viewport center
              const centeringShiftX = isExiting ? (exitFactor * 25.5) : 0; 

              const angle = (idx / (step.images?.length || 1)) * Math.PI * 2;
              const radius = 260 * bloomProgress * singularityForce; 
              const scatterX = Math.cos(angle) * radius;
              const scatterY = Math.sin(angle) * (radius * 0.4); 

              return (
                <div key={idx} className="cloud-wrapper" style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translate(${scatterX}px, ${scatterY}px) translateX(${centeringShiftX}vw) rotate(${(idx * 45) % 60 - 30}deg) scale(${exitScale})`,
                  opacity: exitScale,
                  zIndex: idx === hoverIndex ? 500 : idx,
                  transition: isExiting ? 'none' : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
                }}>
                  <img src={img.src} className="cloud-item" alt="Gallery" />
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