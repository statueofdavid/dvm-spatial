// src/components/AboutMe/scenes/Resume.tsx
import React from 'react';
import { VscFilePdf, VscCloudDownload } from 'react-icons/vsc';
import { StoryStep } from '../../../data/StorySteps';
import './../AboutMeTimeline.css';

const Resume: React.FC<{ progress: number; step: StoryStep }> = ({ progress, step }) => {
  if (!step) return null;

  const opacityValue = progress < 0.8 ? 1 : 1 - (progress - 0.8) * 5;

return (
    <div 
      className="layer-grid layer-identity" 
      style={{ 
        opacity: opacityValue, // Use the variable we just defined
        transition: 'opacity 0.2s ease',
        pointerEvents: 'none' // Allows clicks to pass through to the Exit button
      }}
    >
      <div className="visual-slot">
        <img 
          src="/images/dvm-profile-pic.jpg" 
          className="main-photo" 
          alt="Identity" 
        />
      </div>
      <div className="parallax-text" style={{ pointerEvents: 'auto' }}>
        <h2 className="layer-tag">// {step.tag}</h2>
        <h1>DAVID VINCENT MILLER</h1>
        <p className="large-quip" style={{ fontSize: '1.2rem' }}>{step.text}</p>
        <div className="resume-actions">
          <a href="/dvm-resume.pdf" target="_blank" className="resume-btn"><VscFilePdf /> VIEW_RESUME</a>
          <a href="/dvm-resume.pdf" download className="resume-btn secondary"><VscCloudDownload /> DOWNLOAD</a>
        </div>
      </div>
    </div>
  );
};

export default Resume;