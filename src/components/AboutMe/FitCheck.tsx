import React, { useState } from 'react';
import { VscFilePdf, VscDebugRestart, VscHistory } from 'react-icons/vsc';
import { logger } from '../../utils/logger';
import './AboutMeTimeline.css';

// --- INTERFACES & TYPES ---
interface WeightVector {
  tech: number;       
  vision: number;     
  velocity: number;   
  experience: number; 
  affinity: number;   
}

interface WeightedOption {
  text: string;
  weight: WeightVector;
}

interface Question {
  id: string;
  text: string;
  options: WeightedOption[];
}

type UserBucket = 'MOBILE' | 'CREATIVE' | 'TESTING' | 'INFRA' | 'EXPERIMENTAL' | null;

// --- DATA CONSTANTS ---

const ROUTER_QUESTION: Question = {
  id: 'router',
  text: "What gaps need to be bridged?",
  options: [
    { 
      text: "Mobile Tactical Awareness", 
      weight: { tech: 10, vision: 6, velocity: 3, experience: 7, affinity: 6 } 
    }, 
    { 
      text: "Creative Web Experiences", 
      weight: { tech: 10, vision: 10, velocity: 5, experience: 10, affinity: 10 } 
    },
    { 
      text: "Testing and Delivery", 
      weight: { tech: 3, vision: 0, velocity: 10, experience: 8, affinity: 4 } 
    },
    { 
      text: "Digital Infrastructure", 
      weight: { tech: 8, vision: 3, velocity: 10, experience: 9, affinity: 7 } 
    },
    { 
      text: "Something New and Experimental", 
      weight: { tech: 10, vision: 10, velocity: 8, experience: 8, affinity: 10 } 
    }
  ]
};

const QUESTION_BANK: Record<string, Question[]> = {
  MOBILE: [
    { 
      id: 'mob_platform', text: "The target environment is:", 
      options: [
        { text: "Cross Platform", weight: { tech: 6, vision: 3, velocity: 10, experience: 8, affinity: 7 } },
        { text: "Native", weight: { tech: 10, vision: 4, velocity: 2, experience: 5, affinity: 4 } }, 
        { text: "PWA / Mobile Web", weight: { tech: 8, vision: 6, velocity: 6, experience: 10, affinity: 9 } }
      ]
    },
    { 
      id: 'mob_connectivity', text: "Data synchronization strategy:", 
      options: [
        { text: "Real-time / Multiplayer", weight: { tech: 9, vision: 8, velocity: 3, experience: 7, affinity: 10 } },
        { text: "Offline-first sync", weight: { tech: 8, vision: 6, velocity: 6, experience: 8, affinity: 6 } },
        { text: "Standard REST API", weight: { tech: 3, vision: 4, velocity: 10, experience: 10, affinity: 5 } }
      ]
    }
  ],
  CREATIVE: [
    { 
      id: 'cr_fidelity', text: "Visual output priority:", 
      options: [
        { text: "High-end WebGL / Shaders", weight: { tech: 10, vision: 10, velocity: 6, experience: 9, affinity: 10 } },
        { text: "Clean Micro-interactions", weight: { tech: 5, vision: 3, velocity: 8, experience: 10, affinity: 8 } },
        { text: "Static / Informational", weight: { tech: 2, vision: 1, velocity: 10, experience: 10, affinity: 3 } }
      ]
    },
    { 
      id: 'cr_assets', text: "Creative asset pipeline:", 
      options: [
        { text: "Assets provided, ready to code", weight: { tech: 5, vision: 3, velocity: 10, experience: 10, affinity: 9 } },
        { text: "Need design & creation from scratch", weight: { tech: 9, vision: 10, velocity: 5, experience: 8, affinity: 10 } },
        { text: "Stock assets / Standard UI", weight: { tech: 1, vision: 1, velocity: 10, experience: 10, affinity: 2 } }
      ]
    }
  ],
  TESTING: [
    { 
      id: 'qa_culture', text: "Current testing suite status:", 
      options: [
        { text: "Non-existent, need a pioneer", weight: { tech: 7, vision: 10, velocity: 7, experience: 6, affinity: 8 } },
        { text: "Robust CI/CD exists", weight: { tech: 10, vision: 3, velocity: 10, experience: 8, affinity: 7 } },
        { text: "Manual QA only", weight: { tech: 1, vision: 2, velocity: 10, experience: 10, affinity: 1 } }
      ]
    },
    { 
      id: 'qa_scale', text: "Deployment frequency target:", 
      options: [
        { text: "Multiple times per day", weight: { tech: 10, vision: 10, velocity: 10, experience: 7, affinity: 9 } },
        { text: "Bi-weekly sprints", weight: { tech: 7, vision: 7, velocity: 8, experience: 10, affinity: 7 } },
        { text: "Quarterly releases", weight: { tech: 4, vision: 4, velocity: 4, experience: 10, affinity: 4 } }
      ]
    }
  ],
  INFRA: [
    { 
      id: 'inf_scale', text: "System load expectations:", 
      options: [
        { text: "Massive concurrent user spikes", weight: { tech: 10, vision: 10, velocity: 1, experience: 6, affinity: 8 } },
        { text: "Complex Graph / Data Relations", weight: { tech: 9, vision: 8, velocity: 3, experience: 8, affinity: 9 } },
        { text: "Standard CRUD operations", weight: { tech: 3, vision: 3, velocity: 10, experience: 10, affinity: 5 } }
      ]
    },
    { 
      id: 'inf_stack', text: "Backend philosophy:", 
      options: [
        { text: "Serverless / Edge Functions", weight: { tech: 9, vision: 7, velocity: 9, experience: 9, affinity: 10 } },
        { text: "Containerized Microservices", weight: { tech: 7, vision: 6, velocity: 7, experience: 7, affinity: 7 } },
        { text: "Monolithic Legacy", weight: { tech: 3, vision: 2, velocity: 4, experience: 8, affinity: 2 } }
      ]
    }
  ],
  EXPERIMENTAL: [
    { 
      id: 'exp_ambiguity', text: "How defined is the end goal?", 
      options: [
        { text: "Problem known, solution unknown", weight: { tech: 9, vision: 10, velocity: 7, experience: 8, affinity: 10 } },
        { text: "Rough prototype to refine", weight: { tech: 8, vision: 8, velocity: 8, experience: 9, affinity: 9 } },
        { text: "Just chasing a buzzword", weight: { tech: 2, vision: 1, velocity: 5, experience: 5, affinity: 2 } }
      ]
    },
    { 
      id: 'exp_risk', text: "Failure consequence:", 
      options: [
        { text: "Pivot and learn (R&D Budget)", weight: { tech: 9, vision: 9, velocity: 9, experience: 9, affinity: 10 } },
        { text: "Project cancelled", weight: { tech: 5, vision: 5, velocity: 4, experience: 10, affinity: 5 } },
        { text: "Termination", weight: { tech: 1, vision: 1, velocity: 1, experience: 10, affinity: 0 } }
      ]
    }
  ]
};

// --- COMPONENT LOGIC ---

interface FitCheckProps {
  onExit: () => void;
  onNavigate: (id: string) => void;
  lightMode: boolean;
}

export default function FitCheck({ onExit, onNavigate, lightMode }: FitCheckProps) {
  const [viewState, setViewState] = useState<'intro' | 'active' | 'calculating' | 'result'>('intro');
  const [bucket, setBucket] = useState<UserBucket>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([ROUTER_QUESTION]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [totalScore, setTotalScore] = useState<WeightVector>({ 
    tech: 0, vision: 0, velocity: 0, experience: 0, affinity: 0 
  });
  const [fitPercentage, setFitPercentage] = useState(0);

  const themeClass = lightMode ? 'light-theme' : 'dark-theme'; 
  const textColor = lightMode ? '#1a1a1a' : '#f0f0f0';

  const handleStart = () => {
    logger.info("FIT_CHECK // SESSION_STARTED");
    setViewState('active');
  };

  const handleRetry = () => {
    logger.info("FIT_CHECK // SESSION_RESET");
    // Reset all state to defaults
    setBucket(null);
    setActiveQuestions([ROUTER_QUESTION]);
    setCurrentStep(0);
    setTotalScore({ tech: 0, vision: 0, velocity: 0, experience: 0, affinity: 0 });
    setFitPercentage(0);
    setViewState('intro');
  };

  const handleAnswer = (option: WeightedOption) => {
    const newScore = {
      tech: totalScore.tech + option.weight.tech,
      vision: totalScore.vision + option.weight.vision,
      velocity: totalScore.velocity + option.weight.velocity,
      experience: totalScore.experience + option.weight.experience,
      affinity: totalScore.affinity + option.weight.affinity
    };
    setTotalScore(newScore);

    if (currentStep === 0 && bucket === null) {
      let selected: UserBucket = 'EXPERIMENTAL'; 
      
      if (option.text.includes("Mobile")) selected = 'MOBILE';
      else if (option.text.includes("Creative")) selected = 'CREATIVE';
      else if (option.text.includes("Testing")) selected = 'TESTING';
      else if (option.text.includes("Infrastructure")) selected = 'INFRA';
      else if (option.text.includes("Something New")) selected = 'EXPERIMENTAL';
      
      setBucket(selected);
      setActiveQuestions([ROUTER_QUESTION, ...QUESTION_BANK[selected!]]);
      setCurrentStep(1);
      logger.info(`FIT_CHECK // PATH_SELECTED: ${selected}`);
      return;
    }

    if (currentStep < activeQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateFinalFit(newScore);
    }
  };

  const calculateFinalFit = (finalScores: WeightVector) => {
    setViewState('calculating');
    // Max Possible = 3 questions * 5 dims * 10 points = 150
    const maxPossible = 150;
    const aggregate = 
      finalScores.tech + 
      finalScores.vision + 
      finalScores.velocity + 
      finalScores.experience + 
      finalScores.affinity;

    const percentage = Math.min(100, Math.round((aggregate / maxPossible) * 100));
    setFitPercentage(percentage);

    setTimeout(() => {
        setViewState('result');
    }, 2000);
  };

  // --- RENDER STATES ---

  if (viewState === 'intro') {
    return (
      <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
        <div className="fit-content-wrapper">
          <span className="fit-label">// SYSTEM_CHECK</span>
          <h1 className="fit-question">Cultural & Technical<br />Compatibility Assessment</h1>
          <p className="fit-score-details">
            Identify your needs to analyze alignment with my engineering values and architectural style.
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

  if (viewState === 'result') {
    return (
      <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
        <div className="fit-content-wrapper">
          <span className="fit-label">// ANALYSIS_COMPLETE</span>
          <h1 className="fit-score-display">{fitPercentage}%</h1>
          <p className="fit-score-details">
            {fitPercentage > 85 ? 
              "We should probably build something together." :
              fitPercentage > 60 ?
              "We may have different philosophies, but when managed that can create something innovative." :
              "We might solve problems very differently."
            }
          </p>
          
          {/* ACTION GRID */}
          <div className="fit-options-grid">
            
            {/* RETRY */}
            <button 
              className="fit-option-btn" 
              onClick={handleRetry} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
            >
              <VscDebugRestart /> RETRY_SCAN
            </button>

            {/* VIEW RESUME */}
            <a 
              href="/dvm-resume.pdf" 
              target="_blank" 
              className="fit-option-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', textDecoration: 'none' }}
            >
              <VscFilePdf /> VIEW_RESUME
            </a>

            {/* RETURN TO TIMELINE */}
            <button 
              className="resume-btn raised" 
              onClick={() => onNavigate('action')}
              style={{ border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <VscHistory /> RETURN_TO_TIMELINE
            </button>

          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE QUESTIONS ---
  const question = activeQuestions[currentStep];
  if (!question) return null; 

  const progressPercent = ((currentStep) / activeQuestions.length) * 100;

  return (
    <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
      
      <div className="fit-progress-track">
        <div className="fit-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="fit-content-wrapper" key={currentStep}>
        <span className="fit-label">
          {bucket ? `// ${bucket}_SEQ_0${currentStep}` : '// PROTOCOL_SELECTION'}
        </span>
        <h2 className="fit-question">{question.text}</h2>
        
        <div className="fit-options-grid">
          {question.options.map((opt, i) => (
            <button 
                key={i} 
                onClick={() => handleAnswer(opt)} 
                className="fit-option-btn"
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: '40px', opacity: 0.5 }}>
        <button 
            onClick={onExit} 
            style={{ 
                background: 'none', border: 'none', color: 'inherit', 
                cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px' 
            }}
        >
            [ ABORT_CHECK ]
        </button>
      </div>
    </div>
  );
}