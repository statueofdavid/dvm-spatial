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
  const slowStepHeight = 4800;
  const leapStepHeight = 8200; // Extra long for the "Shoosh" fall experience

  const getActiveData = (scroll: number) => {
    let index = 0;
    // Step Mapping based on StorySteps.ts order
    if (scroll < stepHeight) index = 0; // IDENTITY
    else if (scroll < (stepHeight + slowStepHeight)) index = 1; // GALLERY
    else if (scroll < (stepHeight + slowStepHeight * 2)) index = 2; // FORGE
    else if (scroll < (stepHeight + slowStepHeight * 2 + leapStepHeight)) index = 3; // LEAP
    else if (scroll < (stepHeight + slowStepHeight * 3 + leapStepHeight)) index = 4; // VALUE
    else index = Math.min(5 + Math.floor((scroll - (stepHeight + slowStepHeight * 3 + leapStepHeight)) / stepHeight), storySteps.length - 1);

    const start = index === 0 ? 0 : 
                  index === 1 ? stepHeight : 
                  index === 2 ? stepHeight + slowStepHeight : 
                  index === 3 ? stepHeight + (slowStepHeight * 2) :
                  index === 4 ? stepHeight + (slowStepHeight * 2) + leapStepHeight :
                  (stepHeight + (slowStepHeight * 3) + leapStepHeight + ((index - 5) * stepHeight));

    const currentStepHeight = index === 3 ? leapStepHeight : (index >= 1 && index <= 4) ? slowStepHeight : stepHeight;
    const progress = Math.max(0, Math.min(1, (scroll - start) / currentStepHeight));

    const OVERLAP_THRESHOLD = 0.95; 
    const isInOverlap = progress > OVERLAP_THRESHOLD;
    const nextStep = (isInOverlap && index < storySteps.length - 1) ? storySteps[index + 1] : null;
    const transitionProgress = nextStep ? (progress - OVERLAP_THRESHOLD) / (1 - OVERLAP_THRESHOLD) : 0;

    return { currentStep: storySteps[index], nextStep, progress, transitionProgress };
  };

  const { currentStep, progress, nextStep, transitionProgress } = getActiveData(scrollProgress);

  return (
    <div className="timeline-parallax-container">
      <SceneDirector currentStep={currentStep} progress={progress} nextStep={nextStep} transitionProgress={transitionProgress} />
      <ScrollGuide scrollProgress={scrollProgress} />
      <div style={{ height: `${stepHeight + (slowStepHeight * 3) + leapStepHeight + ((storySteps.length - 5) * stepHeight)}px` }}></div>
    </div>
  );
};

export default TimelineManager;