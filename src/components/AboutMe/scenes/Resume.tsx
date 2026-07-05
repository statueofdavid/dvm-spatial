import React from 'react';
import { VscFilePdf, VscCircuitBoard } from 'react-icons/vsc';
import { StoryStep } from '../../../data/StorySteps';
import "./style/Resume.css" // Keeps your existing path

interface ResumeProps {
  progress: number;
  step: StoryStep;
  onNavigate: (id: string) => void;
}

const Resume: React.FC<ResumeProps> = ({ progress, step, onNavigate }) => {
  if (!step) return null;

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

      <div className="parallax-text center-contents" style={{ 
        transform: `translateY(${textLift}px)`,
        transition: 'transform 0.1s ease-out'
      }}>
        
        {/* Swapped Hierarchy */}
        <h1 className="hero-title">David Vincent Miller</h1>
        <h2 className="layer-tag bottom-tag">// {step.tag}</h2>
        
        <p className="quip">{step.text}</p>
        
        <div className="resume-actions" style={{ 
          pointerEvents: 'auto',
          marginTop: '1.2rem',
          justifyContent: 'center',
          width: '100%'              
        }}>
          <a href="/dvm-resume.pdf" target="_blank" className="resume-btn raised">
            <VscFilePdf /> View Resume
          </a>
          <button 
            onClick={() => onNavigate('fit_check')} 
            className="resume-btn raised"
            style={{ border: 'none' }} // Keeps your existing border fix
          >
            <VscCircuitBoard /> Determine My Fit
          </button>
        </div>

      </div>
    </div>
  );
}

export default Resume;