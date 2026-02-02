// src/components/FitCheck/FitCheck.tsx
import React, { useState } from 'react';
import { VscArrowLeft } from 'react-icons/vsc';
import { logger } from '../../utils/logger';
import './AboutMeTimeline.css';

// Types defining our semantic structure
interface Question {
  id: number;
  text: string;
  options: string[];
}

// TODO: These will be workshopped in the next step
const TEMP_QUESTIONS: Question[] = [
  { id: 1, text: "When a deadline looms, do you prioritize shipping the feature or refactoring the architecture?", options: ["Ship It", "Refactor"] },
  { id: 2, text: "What is your stance on AI-generated code in production?", options: ["Banned", "Force Multiplier"] },
  { id: 3, text: "Design hands you a UI that defies standard DOM physics. You:", options: ["Push Back", "WebGL Custom Layer"] },
];

export default function FitCheck({ onExit, lightMode }: { onExit: () => void, lightMode: boolean }) {
  // States: 'intro' | 'active' | 'calculating' | 'result'
  const [viewState, setViewState] = useState<'intro' | 'active' | 'calculating' | 'result'>('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Theme class handling
  const themeClass = lightMode ? 'light-theme' : 'dark-theme'; 
  const textColor = lightMode ? '#1a1a1a' : '#f0f0f0';

  const handleStart = () => {
    logger.info("FIT_CHECK // SESSION_STARTED");
    setViewState('active');
  };

  const handleAnswer = (answer: string) => {
    logger.debug(`FIT_CHECK // Q${TEMP_QUESTIONS[currentStep].id}: ${answer}`);
    
    // Store answer
    setAnswers(prev => ({ ...prev, [TEMP_QUESTIONS[currentStep].id]: answer }));

    // Navigate
    if (currentStep < TEMP_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setViewState('calculating');
      // Artificial delay to simulate "Semantic Reconstruction"
      setTimeout(() => setViewState('result'), 2000);
    }
  };

  // --- RENDER: INTRO SPLASH ---
  if (viewState === 'intro') {
    return (
      <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
        <div className="fit-content-wrapper">
          <span className="fit-label">// SYSTEM_CHECK</span>
          <h1 className="fit-question">Cultural & Technical<br />Compatibility Assessment</h1>
          <p className="fit-score-details">
            Answer {TEMP_QUESTIONS.length} questions to analyze alignment with my engineering values and narrative architectural style.
          </p>
          <div className="fit-options-grid">
            <button className="resume-btn raised" onClick={handleStart} style={{ border: 'none' }}>
              INITIALIZE_SCAN
            </button>
            <button className="fit-option-btn" onClick={onExit}>
              CANCEL
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: CALCULATING ---
  if (viewState === 'calculating') {
    return (
      <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
        <div className="fit-content-wrapper">
          <div className="fit-loader" />
          <span className="fit-label">RECONSTRUCTING SEMANTIC FIT...</span>
        </div>
      </div>
    );
  }

  // --- RENDER: RESULT ---
  if (viewState === 'result') {
    return (
      <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
        <div className="fit-content-wrapper">
          <span className="fit-label">// ANALYSIS_COMPLETE</span>
          <h1 className="fit-score-display">92%</h1>
          <p className="fit-score-details">
            High compatibility detected in <strong>Vision</strong> and <strong>R&D</strong> protocols. 
            We should probably build something together.
          </p>
          <div className="fit-options-grid">
             {/* Uses the same raised button style for consistency */}
            <button className="resume-btn raised" onClick={() => window.location.href = 'mailto:hello@dvm.io'} style={{ border: 'none' }}>
              CONTACT_DVM
            </button>
            <button className="fit-option-btn" onClick={onExit}>
              RETURN_TO_TIMELINE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: ACTIVE QUESTIONS ---
  const question = TEMP_QUESTIONS[currentStep];
  const progressPercent = ((currentStep) / TEMP_QUESTIONS.length) * 100;

  return (
    <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
      
      {/* Progress Bar */}
      <div className="fit-progress-track">
        <div className="fit-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="fit-content-wrapper" key={currentStep}>
        <span className="fit-label">// QUERY_0{currentStep + 1}</span>
        <h2 className="fit-question">{question.text}</h2>
        
        <div className="fit-options-grid">
          {question.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} className="fit-option-btn">
              {opt}
            </button>
          ))}
        </div>
      </div>
      
      {/* Absolute Exit for Safety */}
      <div style={{ position: 'absolute', bottom: '40px', opacity: 0.5 }}>
        <button 
            onClick={onExit} 
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'monospace' }}
        >
            [ ABORT_CHECK ]
        </button>
      </div>
    </div>
  );
}