// src/components/AboutMe/TimelineManager.tsx
import React, { useState, useEffect, useRef } from 'react';
import { storySteps } from '../../data/StorySteps';
import SceneDirector from './SceneDirector';

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

    return { currentStep: storySteps[index], progress };
  };

  const { currentStep, progress } = getActiveData(scrollProgress);

  return (
    <div className="timeline-parallax-container">
      <SceneDirector currentStep={currentStep} progress={progress} />
      {/* Scrollable runway */}
      <div style={{ height: `${stepHeight + slowStepHeight + ((storySteps.length - 2) * stepHeight)}px` }}></div>
    </div>
  );
};

export default TimelineManager;