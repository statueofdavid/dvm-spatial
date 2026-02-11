import React from 'react';
import { VscFilePdf, VscCircuitBoard } from 'react-icons/vsc';
import { StoryStep } from '../../../data/StorySteps';
import "./style/Resume.css"

interface ResumeProps {
  progress: number;
  step: StoryStep;
  onNavigate: (id: string) => void;
}

const Resume: React.FC<ResumeProps> = ({ progress, step, onNavigate }) => {
  if (!step) return null;

  // Dynamic layering based on scroll progress
  const dynamicPadding = 35 - (progress * 15); 
  const imageLift = progress * -30; 
  const textLift = progress * -80; 
  const imageScale = 1 + (progress * 0.1); 
  const opacity = progress < 0.8 ? 1 : 1 - (progress - 0.8) * 5;

  return (
    <div className="layer-grid layer-identity" style={{ 
      paddingTop: `${dynamicPadding}vh`,
      opacity,
      pointerEvents: 'none' 
    }}>
      <div className="visual-slot" style={{ 
        transform: `translateY(${imageLift}px) scale(${imageScale})`,
        transition: 'transform 0.1s ease-out'
      }}>
        <img src="/images/dvm-profile-pic.jpg" className="main-photo shadow-raised" alt="Identity" />
      </div>

      <div className="parallax-text" style={{ 
        transform: `translateY(${textLift}px)`,
        transition: 'transform 0.1s ease-out'
      }}>
        <h2 className="layer-tag">// {step.tag}</h2>
        <h1 className="hero-title">DAVID VINCENT MILLER</h1>
        <p className="quip">{step.text}</p>
        
        <div className="resume-actions" style={{ pointerEvents: 'auto' }}>
          <a href="/dvm-resume.pdf" target="_blank" className="resume-btn raised">
            <VscFilePdf /> VIEW_RESUME
          </a>
          <button 
            onClick={() => onNavigate('fit_check')} 
            className="resume-btn raised"
            style={{ 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            <VscCircuitBoard /> FIT_CHECK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resume;