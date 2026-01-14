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
  const slowStepHeight = 2800; 

  const getActiveData = (scroll: number) => {
    let index = 0;
    if (scroll < stepHeight) index = 0;
    else if (scroll < (stepHeight + slowStepHeight)) index = 1;
    else index = Math.min(2 + Math.floor((scroll - (stepHeight + slowStepHeight)) / stepHeight), storySteps.length - 1);

    const start = index === 0 ? 0 : index === 1 ? stepHeight : (stepHeight + slowStepHeight + ((index - 2) * stepHeight));
    const currentStepHeight = index === 1 ? slowStepHeight : stepHeight;
    const progress = Math.max(0, Math.min(1, (scroll - start) / currentStepHeight));

    const OVERLAP_THRESHOLD = 0.85; 
    const isInOverlap = progress > OVERLAP_THRESHOLD;
    // Safety check to prevent index-out-of-bounds
    const nextStep = (isInOverlap && index < storySteps.length - 1) ? storySteps[index + 1] : null;
    const transitionProgress = nextStep ? (progress - OVERLAP_THRESHOLD) / (1 - OVERLAP_THRESHOLD) : 0;

    return { currentStep: storySteps[index], nextStep, progress, transitionProgress };
  };

  const { currentStep, progress, nextStep, transitionProgress } = getActiveData(scrollProgress);

  return (
    <div className="timeline-parallax-container">
      <SceneDirector currentStep={currentStep} progress={progress} nextStep={nextStep} transitionProgress={transitionProgress} />
      <ScrollGuide scrollProgress={scrollProgress} />
      <div style={{ height: `${stepHeight + slowStepHeight + ((storySteps.length - 2) * stepHeight)}px` }}></div>
    </div>
  );
};

export default TimelineManager;