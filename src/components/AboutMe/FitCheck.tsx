import React, { useState } from 'react';
import { logger } from '../../utils/logger';
import './AboutMeTimeline.css';

// Define the User Buckets
type UserBucket = 'MOBILE' | 'WEB' | 'TEST' | 'INFRA' | 'CREATE' | null;

interface Question {
  id: string; // Changed to string for better tracking (e.g., 'mobile_q1')
  text: string;
  options: string[];
}

// The Router Question
const ROUTER_QUESTION: Question = {
  id: 'router',
  text: "What gaps need to be bridged?",
  options: [
    "Mobile Tactical Awareness", 
    "Creative Cross Platform Experiences",  
    "Testing and Delivery",
    "Digital Infrastructure",
    "Something New and Experimental"     
  ]
};

// The Question Matrix
const QUESTION_BANK: Record<string, Question[]> = {
  MOBILE: [
    { id: 'r_stack', text: "What   ", options: ["A Mobile Experience", "A"] },
    { id: 'r_timeline', text: "What is the expected time-to-hire?", options: ["Immediate (<2 weeks)", "Standard (1 month)", "Pipeline Building"] },
  ],
  WEB: [
    { id: 'm_conflict', text: "A senior dev pushes code that works but breaks style guidelines. You:", options: ["Merge & Refactor Later", "Block & Request Changes"] },
    { id: 'm_velocity', text: "How do you measure team velocity?", options: ["Story Points", "Impact/Outcome", "Lines of Code"] },
  ],
  TEST: [
    { id: 'c_vision', text: "How defined is your project scope?", options: ["I have a full spec", "I have a rough dream", "I need you to define it"] },
    { id: 'c_budget', text: "Does the budget allow for experimental R&D?", options: ["Yes, innovation first", "No, efficiency first"] },
  ],
  INFRA: [
    { id: 'c_vision', text: "How defined is your project scope?", options: ["I have a full spec", "I have a rough dream", "I need you to define it"] },
    { id: 'c_budget', text: "Does the budget allow for experimental R&D?", options: ["Yes, innovation first", "No, efficiency first"] },
  ],
  CREATE: [
    { id: 'c_vision', text: "How defined is your project scope?", options: ["I have a full spec", "I have a rough dream", "I need you to define it"] },
    { id: 'c_budget', text: "Does the budget allow for experimental R&D?", options: ["Yes, innovation first", "No, efficiency first"] },
  ]
};

export default function FitCheck({ onExit, lightMode }: { onExit: () => void, lightMode: boolean }) {
  const [viewState, setViewState] = useState<'intro' | 'active' | 'calculating' | 'result'>('intro');
  
  // New State: Track the Bucket
  const [bucket, setBucket] = useState<UserBucket>(null);
  
  // We now track the specific list of active questions
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([ROUTER_QUESTION]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const themeClass = lightMode ? 'light-theme' : 'dark-theme'; 
  const textColor = lightMode ? '#1a1a1a' : '#f0f0f0';

  const handleStart = () => {
    logger.info("FIT_CHECK // SESSION_STARTED");
    setViewState('active');
  };

  const handleAnswer = (answer: string) => {
    // LOGIC BRANCH: Handling the Router Question
    if (currentStep === 0 && bucket === null) {
      let selectedBucket: UserBucket = 'MANAGER'; // Default fallback
      
      if (answer.includes("Talent")) selectedBucket = 'RECRUITER';
      if (answer.includes("Engineering")) selectedBucket = 'MANAGER';
      if (answer.includes("Project")) selectedBucket = 'CLIENT';

      logger.info(`FIT_CHECK // BUCKET_SELECTED: ${selectedBucket}`);
      
      setBucket(selectedBucket);
      
      // Load the specific questions for this user type
      // We keep the router question in history (index 0) and append the new ones
      setActiveQuestions([ROUTER_QUESTION, ...QUESTION_BANK[selectedBucket!]]);
      
      // Advance to next step
      setCurrentStep(1);
      return;
    }

    // STANDARD LOGIC: Normal flow
    logger.debug(`FIT_CHECK // Q_ANSWERED: ${answer}`);
    
    if (currentStep < activeQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setViewState('calculating');
      setTimeout(() => setViewState('result'), 2000);
    }
  };

  // ... (Keep your Intro, Calculating, and Result renders exactly as they are) ...
  // Only the Result view might need a tweak to show dynamic text based on the bucket!
  
  // --- RENDER: ACTIVE QUESTIONS ---
  const question = activeQuestions[currentStep];
  // Calculate progress based on the full generated list
  const progressPercent = ((currentStep) / activeQuestions.length) * 100;

  return (
    <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
       {/* ... (Keep existing JSX, just swap TEMP_QUESTIONS for activeQuestions) ... */}
       
      <div className="fit-progress-track">
        <div className="fit-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="fit-content-wrapper" key={currentStep}>
        <span className="fit-label">// {bucket ? `${bucket}_QUERY_0${currentStep}` : 'INITIALIZING_PROTOCOL'}</span>
        <h2 className="fit-question">{question.text}</h2>
        
        <div className="fit-options-grid">
          {question.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} className="fit-option-btn">
              {opt}
            </button>
          ))}
        </div>
      </div>
      
       {/* ... (Keep Exit Button) ... */}
    </div>
  );
}