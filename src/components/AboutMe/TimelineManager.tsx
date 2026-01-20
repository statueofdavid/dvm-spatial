// src/components/AboutMe/TimelineManager.tsx
import React, { useState, useEffect, useRef } from 'react';
import { storySteps } from '../../data/StorySteps';
import SceneDirector from './SceneDirector';
import ScrollGuide from './ScrollGuide';

const TimelineManager: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const portalArea = document.querySelector('.portal-scroll-area');
    if (!portalArea) return;
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrollProgress(portalArea.scrollTop);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    portalArea.addEventListener('scroll', handleScroll, { passive: true });
    return () => portalArea.removeEventListener('scroll', handleScroll);
  }, []);

  const stepHeight = 1600; 
  const slowStepHeight = 4800; // Forge, Value, Control, Mirror
  const leapStepHeight = 8200; // The Abyss Fall

  const getActiveData = (scroll: number) => {
    let index = 0;
    
    // 1. CUMULATIVE HEIGHTS
    const h0 = stepHeight; // IDENTITY
    const h1 = h0 + slowStepHeight; // GALLERY
    const h2 = h1 + slowStepHeight; // FORGE
    const h3 = h2 + leapStepHeight; // LEAP
    const h4 = h3 + slowStepHeight; // VALUE
    const h5 = h4 + slowStepHeight; // CONTROL
    const h6 = h5 + slowStepHeight; // MIRROR 1
    const h7 = h6 + slowStepHeight; // MIRROR 2
    
    // 2. DETERMINE CURRENT INDEX
    if (scroll < h0) index = 0;
    else if (scroll < h1) index = 1;
    else if (scroll < h2) index = 2;
    else if (scroll < h3) index = 3;
    else if (scroll < h4) index = 4;
    else if (scroll < h5) index = 5;
    else if (scroll < h6) index = 6;
    else if (scroll < h7) index = 7;
    else index = storySteps.length - 1;

    // 3. START POINT SELECTION
    let start = 0;
    switch(index) {
      case 0: start = 0; break;
      case 1: start = h0; break;
      case 2: start = h1; break;
      case 3: start = h2; break;
      case 4: start = h3; break;
      case 5: start = h4; break;
      case 6: start = h5; break;
      case 7: start = h6; break;
      default: start = h7 + (index - 8) * stepHeight;
    }

    // 4. PROGRESS & TRANSITION
    const currentStepHeight = index === 3 ? leapStepHeight : (index >= 1 && index <= 7) ? slowStepHeight : stepHeight;
    const progress = Math.max(0, Math.min(1, (scroll - start) / currentStepHeight));

    // THE FIX: Higher threshold (0.97) reduces the time two heavy scenes are active simultaneously
    const OVERLAP_THRESHOLD = 0.97; 
    const isInOverlap = progress > OVERLAP_THRESHOLD;
    const nextStep = (isInOverlap && index < storySteps.length - 1) ? storySteps[index + 1] : null;
    const transitionProgress = nextStep ? (progress - OVERLAP_THRESHOLD) / (1 - OVERLAP_THRESHOLD) : 0;

    return { currentStep: storySteps[index], nextStep, progress, transitionProgress };
  };

  const { currentStep, progress, nextStep, transitionProgress } = getActiveData(scrollProgress);

  return (
    <div className="timeline-parallax-container">
      <SceneDirector 
        currentStep={currentStep} 
        progress={progress} 
        nextStep={nextStep} 
        transitionProgress={transitionProgress} 
      />
      <ScrollGuide scrollProgress={scrollProgress} />
      
      {/* TOTAL HEIGHT: IDENTITY(1) + GALLERY(1) + FORGE(1) + LEAP(1) + VALUE(1) + CONTROL(1) + MIRROR(2) + FUTURE(1) */}
      <div style={{ height: `${stepHeight + (slowStepHeight * 6) + leapStepHeight + (stepHeight * (storySteps.length - 8))}px` }}></div>
    </div>
  );
};

export default TimelineManager;