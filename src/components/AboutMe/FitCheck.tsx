// src/components/AboutMe/FitCheck.tsx
import React, { useState } from 'react';
import { 
  VscFilePdf, 
  VscDebugRestart, 
  VscHistory, 
  VscTerminal, 
  VscTelescope, 
  VscRocket, 
  VscVerified, 
  VscRadioTower,
  VscDebugDisconnect
} from 'react-icons/vsc';
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

type UserBucket = 'MOBILE' | 'CREATIVE' | 'TESTING' | 'INFRA' | 'EXPERIMENTAL';

// --- DATA CONSTANTS ---

const ROUTER_QUESTION: Question = {
  id: 'router',
  text: "What gaps need to be bridged?",
  options: [
    { 
      text: "Mobile Tactical Awareness", 
      weight: { tech: 10, vision: 8, velocity: 5, experience: 9, affinity: 7 } 
    }, 
    { 
      text: "Creative Web Experiences", 
      weight: { tech: 9, vision: 10, velocity: 6, experience: 7, affinity: 10 } 
    },
    { 
      text: "Testing and Delivery", 
      weight: { tech: 8, vision: 4, velocity: 10, experience: 10, affinity: 5 } 
    },
    { 
      text: "Digital Infrastructure", 
      weight: { tech: 9, vision: 5, velocity: 7, experience: 10, affinity: 6 } 
    },
    { 
      text: "Something New and Experimental", 
      weight: { tech: 8, vision: 10, velocity: 8, experience: 8, affinity: 9 } 
    }
  ]
};

const QUESTION_BANK: Record<UserBucket, Question[]> = {
  MOBILE: [
    { 
      id: 'mob_platform', text: "The target environment is:", 
      options: [
        { text: "Native Android / Field Hardware", weight: { tech: 10, vision: 7, velocity: 6, experience: 10, affinity: 9 } },
        { text: "Cross-Platform (React Native)", weight: { tech: 8, vision: 6, velocity: 9, experience: 8, affinity: 7 } }, 
        { text: "Consumer Mobile Web", weight: { tech: 4, vision: 4, velocity: 7, experience: 5, affinity: 3 } }
      ]
    },
    { 
      id: 'mob_connectivity', text: "Operational connectivity:", 
      options: [
        { text: "Offline / Mesh / Tactical", weight: { tech: 10, vision: 10, velocity: 4, experience: 9, affinity: 10 } },
        { text: "Real-time Cloud Sync", weight: { tech: 7, vision: 6, velocity: 8, experience: 7, affinity: 6 } },
        { text: "Standard API Polling", weight: { tech: 3, vision: 2, velocity: 10, experience: 10, affinity: 2 } }
      ]
    }
  ],
  CREATIVE: [
    { 
      id: 'cr_fidelity', text: "Visual output priority:", 
      options: [
        { text: "High-end WebGL / Narrative", weight: { tech: 10, vision: 10, velocity: 5, experience: 8, affinity: 10 } },
        { text: "Clean Micro-interactions", weight: { tech: 6, vision: 5, velocity: 8, experience: 7, affinity: 7 } },
        { text: "Static / Informational", weight: { tech: 2, vision: 1, velocity: 10, experience: 4, affinity: 1 } }
      ]
    },
    { 
      id: 'cr_assets', text: "Creative asset pipeline:", 
      options: [
        { text: "Assets provided, ready to code", weight: { tech: 5, vision: 4, velocity: 10, experience: 9, affinity: 6 } },
        { text: "Need procedural / Generative", weight: { tech: 9, vision: 10, velocity: 6, experience: 7, affinity: 10 } },
        { text: "Stock assets / Standard UI", weight: { tech: 1, vision: 1, velocity: 10, experience: 5, affinity: 1 } }
      ]
    }
  ],
  TESTING: [
    { 
      id: 'qa_culture', text: "Current testing suite status:", 
      options: [
        { text: "Non-existent / Needs Architect", weight: { tech: 10, vision: 8, velocity: 6, experience: 10, affinity: 8 } },
        { text: "Exists, needs optimization", weight: { tech: 7, vision: 5, velocity: 10, experience: 9, affinity: 6 } },
        { text: "Manual QA only", weight: { tech: 2, vision: 2, velocity: 2, experience: 5, affinity: 2 } }
      ]
    },
    { 
      id: 'qa_scale', text: "Deployment frequency target:", 
      options: [
        { text: "Continuous / Multiple per day", weight: { tech: 10, vision: 8, velocity: 10, experience: 9, affinity: 8 } },
        { text: "Bi-weekly sprints", weight: { tech: 6, vision: 5, velocity: 7, experience: 10, affinity: 6 } },
        { text: "Quarterly releases", weight: { tech: 3, vision: 2, velocity: 3, experience: 4, affinity: 3 } }
      ]
    }
  ],
  INFRA: [
    { 
      id: 'inf_scale', text: "System load expectations:", 
      options: [
        { text: "Massive scale / High Uptime", weight: { tech: 10, vision: 6, velocity: 4, experience: 10, affinity: 7 } },
        { text: "Complex Physical/Digital Link", weight: { tech: 9, vision: 9, velocity: 5, experience: 9, affinity: 9 } },
        { text: "Internal Tool / Low Traffic", weight: { tech: 4, vision: 2, velocity: 9, experience: 8, affinity: 4 } }
      ]
    },
    { 
      id: 'inf_stack', text: "Backend philosophy:", 
      options: [
        { text: "Cloud Native / Serverless", weight: { tech: 9, vision: 7, velocity: 9, experience: 8, affinity: 8 } },
        { text: "Edge / On-Prem / Hybrid", weight: { tech: 10, vision: 5, velocity: 4, experience: 10, affinity: 6 } },
        { text: "Monolithic Legacy", weight: { tech: 3, vision: 1, velocity: 3, experience: 9, affinity: 2 } }
      ]
    }
  ],
  EXPERIMENTAL: [
    { 
      id: 'exp_ambiguity', text: "How defined is the end goal?", 
      options: [
        { text: "Problem known, solution unknown", weight: { tech: 9, vision: 10, velocity: 6, experience: 8, affinity: 10 } },
        { text: "Rough prototype to refine", weight: { tech: 8, vision: 8, velocity: 9, experience: 9, affinity: 9 } },
        { text: "Just chasing a buzzword", weight: { tech: 1, vision: 0, velocity: 4, experience: 2, affinity: 0 } }
      ]
    },
    { 
      id: 'exp_risk', text: "Failure consequence:", 
      options: [
        { text: "Mission Critical / Must adapt", weight: { tech: 10, vision: 8, velocity: 5, experience: 10, affinity: 9 } },
        { text: "Pivot and learn (R&D Budget)", weight: { tech: 7, vision: 10, velocity: 8, experience: 6, affinity: 8 } },
        { text: "Project cancelled", weight: { tech: 4, vision: 2, velocity: 4, experience: 4, affinity: 3 } }
      ]
    }
  ]
};

// --- SEMANTIC RESULT MATRIX (The "Quips") ---
const RESULT_MATRIX: Record<string, Record<keyof WeightVector, string>> = {
  MOBILE: {
    tech: "You need native performance. I've ported complex tactical stacks from React Native to Native Android to ensure field agents never lose a frame.",
    vision: "You need tactical awareness. I specialize in bridging the gap between IoT devices and mobile interfaces in mission-critical environments.",
    velocity: "You need to move fast. My background in React Native allows for rapid prototyping without sacrificing the option to drop to native code.",
    experience: "You need a veteran. I've navigated the chaotic shift from legacy mobile frameworks to modern native architectures.",
    affinity: "We both believe the device in the pocket is the ultimate edge node."
  },
  CREATIVE: {
    tech: "Beauty needs a backbone. I apply the same rigorous engineering standards to WebGL that I applied to warehouse logistics systems.",
    vision: "You have a big idea. I specialize in quantizing complex narratives into procedural 3D clarity.",
    velocity: "Prototyping is the only way to find the fun. I move from 'Rough Concept' to 'Interactive Experience' at the speed of thought.",
    experience: "I don't just build pretty demos. I build production-ready systems that can handle real-world scale.",
    affinity: "We share the conviction that the web is a spatial canvas, not just a document reader."
  },
  TESTING: {
    tech: "Efficiency is an engineering discipline. I've increased test execution efficiency by 40% using custom AWS CodePipe integrations.",
    vision: "Quality Assurance is about foresight. I build systems that predicted and prevented release failures by 10% in complex agile environments.",
    velocity: "Slow tests kill momentum. I spearheaded pipelines that slashed testing time by 30%, keeping the release train moving.",
    experience: "I've managed 200+ releases across multiple agile teams. I know exactly where the bottlenecks hide.",
    affinity: "We both sleep better knowing the green checkmark actually means 'safe'."
  },
  INFRA: {
    tech: "You're building for reliability. I maintained a 99.9% uptime across 20 production sites. I take stability personally.",
    vision: "Infrastructure is the invisible narrative. I design systems that support massive physical/digital throughput without breaking character.",
    velocity: "You need to scale fast. I've optimized retrieval system integrations to reduce project cycles by 20%.",
    experience: "I've conducted F.A.T. events for major warehousing projects. I know the stakes when software meets the physical world.",
    affinity: "We value the unseen architecture that makes the visible world possible."
  },
  EXPERIMENTAL: {
    tech: "Experiments fail without rigorous code. I apply standard engineering discipline to non-standard problems, ensuring your R&D yields usable IP.",
    vision: "We are walking off the map. This is my natural habitat—bridging the gap between 'Impossible' and 'MVP'.",
    velocity: "Fail fast, learn faster. I iterate on novel concepts at the speed of thought, backed by a decade of engineering rigor.",
    experience: "I've turned vague R&D briefs into deployed tactical solutions. Ambiguity is where I thrive.",
    affinity: "We both prefer the map edges to the safe roads."
  },
  DEFAULT: {
    tech: "You value deep technical grit. My work on complex JNI integrations is the solution you're looking for.",
    vision: "You value narrative clarity. I turn raw data into semantic visual stories.",
    velocity: "You value speed. I reduce friction in the release process so we can ship value sooner.",
    experience: "You need a steady hand. I’ve managed go-live events for major warehousing and network projects.",
    affinity: "We share a philosophy that code is a means to a human end."
  }
};

// --- HELPER: GET RESONANCE ICON ---
const getResonanceIcon = (dominantVector: keyof WeightVector, fitPercentage: number) => {
  if (fitPercentage < 45) return <VscDebugDisconnect size={140} color="#ff810a" />;

  switch (dominantVector) {
    case 'tech': return <VscTerminal size={140} color="#ff810a" />;
    case 'vision': return <VscTelescope size={140} color="#ff810a" />;
    case 'velocity': return <VscRocket size={140} color="#ff810a" />;
    case 'experience': return <VscVerified size={140} color="#ff810a" />;
    case 'affinity': return <VscRadioTower size={140} color="#ff810a" />;
    default: return <VscVerified size={140} color="#ff810a" />;
  }
};

// --- HELPER: GET RESULT QUIP ---
const getResultQuip = (
  bucket: UserBucket | null, 
  dominantVector: keyof WeightVector, 
  percentage: number
): string => {
  if (percentage < 45) return "Our protocols might be out of sync. But friction often sparks the best R&D. Perhaps we bridge the gap?";

  const category = bucket ? RESULT_MATRIX[bucket] : RESULT_MATRIX.DEFAULT;
  return category?.[dominantVector] || RESULT_MATRIX.DEFAULT[dominantVector];
};

// --- COMPONENT LOGIC ---

interface FitCheckProps {
  onExit: () => void;
  onNavigate: (id: string) => void;
  lightMode: boolean;
}

export default function FitCheck({ onExit, onNavigate, lightMode }: FitCheckProps) {
  const [viewState, setViewState] = useState<'intro' | 'active' | 'calculating' | 'result'>('intro');
  const [bucket, setBucket] = useState<UserBucket | null>(null);
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
    setBucket(null);
    setActiveQuestions([ROUTER_QUESTION]);
    setCurrentStep(0);
    setTotalScore({ tech: 0, vision: 0, velocity: 0, experience: 0, affinity: 0 });
    setFitPercentage(0);
    setViewState('intro');
  };

  // --- SAFE GUARDED ANSWER HANDLER ---
  const handleAnswer = (option: WeightedOption) => {
    if (!option || !option.weight) {
      logger.error("FIT_CHECK // CRITICAL: Invalid option passed to handler", option);
      return; 
    }

    const newScore = {
      tech: totalScore.tech + option.weight.tech,
      vision: totalScore.vision + option.weight.vision,
      velocity: totalScore.velocity + option.weight.velocity,
      experience: totalScore.experience + option.weight.experience,
      affinity: totalScore.affinity + option.weight.affinity
    };
    setTotalScore(newScore);

    // Router Logic
    if (currentStep === 0 && bucket === null) {
      let selected: UserBucket = 'EXPERIMENTAL'; // Default fallback
      
      const txt = option.text || "";
      if (txt.includes("Mobile")) selected = 'MOBILE';
      else if (txt.includes("Creative")) selected = 'CREATIVE';
      else if (txt.includes("Testing")) selected = 'TESTING';
      else if (txt.includes("Infrastructure")) selected = 'INFRA';
      else if (txt.includes("Something New")) selected = 'EXPERIMENTAL';
      
      setBucket(selected);
      
      const nextQuestions = QUESTION_BANK[selected];
      if (!nextQuestions) {
        logger.error(`FIT_CHECK // CRITICAL: Bucket ${selected} not found in bank.`);
        setActiveQuestions([ROUTER_QUESTION]);
      } else {
        setActiveQuestions([ROUTER_QUESTION, ...nextQuestions]);
      }

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

    const coreScore = finalScores.tech + finalScores.vision + finalScores.velocity;
    const boostScore = finalScores.experience + finalScores.affinity;

    const numQuestions = 3; 
    const maxCorePerQ = 30;   
    const maxBoostPerQ = 20;  
    
    const maxCoreTotal = maxCorePerQ * numQuestions;
    const maxBoostTotal = maxBoostPerQ * numQuestions;

    const coreRatio = coreScore / maxCoreTotal;    
    const boostRatio = boostScore / maxBoostTotal; 

    let weightedTotal = (coreRatio * 90) + (boostRatio * 10);
    if (weightedTotal > 60) weightedTotal += 2; 

    const percentage = Math.min(100, Math.round(weightedTotal));
    
    setFitPercentage(percentage || 0); 

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
    const dominantVector = (Object.keys(totalScore) as Array<keyof WeightVector>).reduce((a, b) => 
      totalScore[a] > totalScore[b] ? a : b
    );

    const dynamicQuip = getResultQuip(bucket, dominantVector, fitPercentage);

    // Get the semantic icon instead of text
    const ResonanceIcon = getResonanceIcon(dominantVector, fitPercentage);

    return (
      <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
        <div className="fit-content-wrapper">
          <span className="fit-label">// ANALYSIS_COMPLETE</span>
          
          {/* THE HERO IMAGE */}
          <div style={{ margin: '2rem 0', filter: 'drop-shadow(0 0 20px rgba(255, 129, 10, 0.4))' }}>
            {ResonanceIcon}
          </div>
          
          <h2 style={{ fontFamily: 'monospace', color: '#ff810a', letterSpacing: '2px', fontSize: '16px', marginTop: '-10px', marginBottom: '30px' }}>
             {fitPercentage < 45 ? "SIGNAL_LOST" : `${dominantVector.toUpperCase()}_RESONANCE`}
          </h2>

          <p className="fit-score-details">
            {dynamicQuip}
          </p>
          
          <div className="fit-options-grid">
            <button 
              className="fit-option-btn" 
              onClick={handleRetry} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
            >
              <VscDebugRestart /> RETRY_SCAN
            </button>

            <a 
              href="/dvm-resume.pdf" 
              target="_blank" 
              className="fit-option-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', textDecoration: 'none' }}
            >
              <VscFilePdf /> VIEW_RESUME
            </a>

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