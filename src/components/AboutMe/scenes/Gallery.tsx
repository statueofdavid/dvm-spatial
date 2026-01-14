// src/components/AboutMe/scenes/Gallery.tsx
import React, { useState } from 'react';
import { StoryStep } from '../../../data/StorySteps';

const Gallery: React.FC<{ progress: number; step: StoryStep }> = ({ progress, step }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // TypeScript Safety: Ensure images exists before mapping
  if (!step?.images) return null;

  const sceneOpacity = progress < 0.1 ? progress * 10 : progress > 0.9 ? (1 - progress) * 10 : 1;

return (
  <div className="layer-priorities" style={{ opacity: sceneOpacity }}>
    <div className="layer-grid">
      
      {/* SLOT 1: THE IMAGE CLOUD */}
      <div className="visual-slot" style={{ pointerEvents: 'auto' }}>
        <div className="image-cloud-container">
          {step.images.map((img, idx) => {
            const bloomProgress = Math.min(1.5, progress * 3);
            const angle = (idx / (step.images?.length || 1)) * Math.PI * 2;
            const radius = 260 * bloomProgress; 
            const scatterX = Math.cos(angle) * radius;
            const scatterY = Math.sin(angle) * (radius * 0.4); // Flattened oval
            const rotation = (idx * 45) % 60 - 30;

            return (
              <div key={idx} 
                className={`cloud-wrapper ${idx === hoverIndex ? 'active-layer' : ''}`}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `
                    translate(-50%, -50%) 
                    translate(${scatterX}px, ${scatterY}px) 
                    rotate(${rotation}deg) 
                    scale(${idx === hoverIndex ? 1.25 : 1})
                  `,
                  zIndex: idx === hoverIndex ? 500 : idx,
                  transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
                }}
              >
                <img src={img.src} className="cloud-item" alt="Priority Photo" />
              </div>
            );
          })}
        </div>
      </div>

      {/* SLOT 2: NARRATIVE */}
      <div className="parallax-text">
        <h2 className="layer-tag" style={{ marginBottom: '0.5rem' }}>// {step.tag}</h2>
        <p className="large-quip" style={{ fontWeight: 800, margin: 0 }}>{step.text}</p>
      </div>
    </div>
  </div>
);
};

export default Gallery;