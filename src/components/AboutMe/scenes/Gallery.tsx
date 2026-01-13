// src/components/AboutMe/scenes/Gallery.tsx
import React, { useState } from 'react';
import { StoryStep } from '../../../data/StorySteps';

const Gallery: React.FC<{ progress: number; step: StoryStep }> = ({ progress, step }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  if (!step?.images) return null;

  return (
    <div className="layer-priorities" style={{ opacity: progress > 0.1 ? 1 : progress * 10 }}>
      <div className="layer-grid">
        <div className="visual-slot">
          <div className="image-cloud-container">
            {step.images.map((img, idx) => {
              const localScroll = progress * 1000;
              const driftX = Math.min(20, Math.max(-20, (localScroll * 0.12) * ((idx % 5) - 2)));
              const driftY = Math.min(15, Math.max(-15, (localScroll * 0.08) * ((idx % 3) - 1)));
              const rotation = (idx * 13) % 40 - 20 + (localScroll * 0.02);

              return (
                <div key={idx} className={`cloud-wrapper ${idx === hoverIndex ? 'active-layer' : ''}`}
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                  style={{
                    top: `${(50 + ((idx * 41) % 60 - 30) + driftY)}%`, 
                    left: `${(50 + ((idx * 67) % 75 - 35) + driftX)}%`,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${idx === hoverIndex ? 1.3 : 1})`,
                    zIndex: idx === hoverIndex ? 500 : idx,
                  }}
                >
                  <img src={img.src} className="cloud-item grayscale" alt="Family" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="parallax-text">
          <h2 className="layer-tag">// {step.tag}</h2>
          <p className="large-quip">{step.text}</p>
        </div>
      </div>
    </div>
  );
};

export default Gallery;