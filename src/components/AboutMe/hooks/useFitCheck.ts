import { useState, useEffect } from 'react';
import { logger } from '../../../utils/logger';
import { 
  WeightVector, UserBucket, Question, WeightedOption, 
  ROUTER_QUESTION, QUESTION_BANK 
} from '../../../data/FitCheckConst';

export function useFitCheck() {
  const [viewState, setViewState] = useState<'intro' | 'active' | 'calculating' | 'result'>('intro');
  const [bucket, setBucket] = useState<UserBucket | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([ROUTER_QUESTION]);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalScore, setTotalScore] = useState<WeightVector>({ 
    tech: 0, vision: 0, velocity: 0, experience: 0, affinity: 0 
  });
  const [fitPercentage, setFitPercentage] = useState(0);
  
  const [scoreHistory, setScoreHistory] = useState<WeightVector[]>([]);

  useEffect(() => {
    const handlePopState = () => {
      if (viewState === 'result' || viewState === 'calculating') {
        setViewState('active');
        setScoreHistory(prev => {
          const newHistory = [...prev];
          const previousScore = newHistory.pop();
          if (previousScore) setTotalScore(previousScore);
          return newHistory;
        });
      } else if (viewState === 'active') {
        if (currentStep > 0) {
          if (currentStep === 1) {
            setBucket(null);
            setActiveQuestions([ROUTER_QUESTION]);
          }
          setCurrentStep(prev => prev - 1);
          setScoreHistory(prev => {
            const newHistory = [...prev];
            const previousScore = newHistory.pop();
            if (previousScore) setTotalScore(previousScore);
            return newHistory;
          });
        } else {
          setViewState('intro');
          setScoreHistory([]);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewState, currentStep]);

  const handleStart = () => {
    logger.info("FIT_CHECK // SESSION_STARTED");
    setViewState('active');
    window.history.pushState({ fitCheck: true }, ''); 
  };

  const handleAnswer = (option: WeightedOption) => {
    setScoreHistory(prev => [...prev, totalScore]);
    window.history.pushState({ fitCheck: true }, ''); 

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
      const txt = option.text;
      if (txt.includes("Mobile")) selected = 'MOBILE';
      else if (txt.includes("Creative")) selected = 'CREATIVE';
      else if (txt.includes("Testing")) selected = 'TESTING';
      else if (txt.includes("Infrastructure")) selected = 'INFRA';
      
      setBucket(selected);
      setActiveQuestions([ROUTER_QUESTION, ...QUESTION_BANK[selected]]);
      setCurrentStep(1);
      return;
    }

    if (currentStep < activeQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateFinalFit(newScore);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const calculateFinalFit = (finalScores: WeightVector) => {
    setViewState('calculating');
    const numQuestions = activeQuestions.length;
    const coreScore = finalScores.tech + finalScores.vision + finalScores.velocity;
    const boostScore = finalScores.experience + finalScores.affinity;
    const maxCoreTotal = 30 * numQuestions;
    const maxBoostTotal = 20 * numQuestions;
    const weightedTotal = ((coreScore / maxCoreTotal) * 90) + ((boostScore / maxBoostTotal) * 10);
    setFitPercentage(Math.min(100, Math.round(weightedTotal)));
    setTimeout(() => setViewState('result'), 2000);
  };
  
  const handleRetry = () => {
    setBucket(null);
    setActiveQuestions([ROUTER_QUESTION]);
    setCurrentStep(0);
    setTotalScore({ tech: 0, vision: 0, velocity: 0, experience: 0, affinity: 0 });
    setFitPercentage(0);
    setScoreHistory([]); 
    setViewState('intro');
  };

  return {
    viewState, bucket, currentStep, activeQuestions, totalScore, fitPercentage,
    handleStart, handleAnswer, handleRetry, setViewState, 
    handleBack
  };
}