import React, { useState, useEffect, useRef } from 'react';
import { storySteps } from '../../data/StorySteps';
import SceneDirector from './SceneDirector';
import ScrollGuide from './ScrollGuide';

interface TimelineManagerProps {
  lightMode: boolean;
  onNavigate: (id: string) => void;
}

const TimelineManager: React.FC<TimelineManagerProps> = ({ lightMode, onNavigate }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const ticking = useRef(false);

  const IS_FULL_SAGA = false; 

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

  const getShortPathData = (scroll: number) => {
    const activeIndices = [0, 1, 8]; 
    const activeSteps = activeIndices.map(i => storySteps[i]);

    const HEIGHTS = [
      1600, // Resume
      3800, // Gallery (Deep scroll)
      1600 // Future
    ];
    
    const boundaries = HEIGHTS.reduce((acc, h, i) => {
      acc.push((acc[i - 1] || 0) + h);
      return acc;
    }, [] as number[]);

    let localIndex = boundaries.findIndex(b => scroll < b);
    if (localIndex === -1) localIndex = activeSteps.length - 1;

    const start = localIndex === 0 ? 0 : boundaries[localIndex - 1];
    const currentHeight = HEIGHTS[localIndex];
    const progress = Math.max(0, Math.min(1, (scroll - start) / currentHeight));

    const OVERLAP = 0.95;
    const isInOverlap = progress > OVERLAP;
    const nextStep = (isInOverlap && localIndex < activeSteps.length - 1) 
      ? activeSteps[localIndex + 1] 
      : null;
    const transitionProgress = nextStep ? (progress - OVERLAP) / (1 - OVERLAP) : 0;

    return {
      currentStep: activeSteps[localIndex],
      nextStep,
      progress,
      transitionProgress,
      isFinal: activeSteps[localIndex].scene === 'FUTURE',
      totalHeight: boundaries[boundaries.length - 1]
    };
  };

  const getFullSagaData = (scroll: number) => {
    const stepHeight = 1600; 
    const slowStepHeight = 4800; 
    const futureStepHeight  = 6000;
    const leapStepHeight = 8200;

    const h0 = stepHeight; 
    const h1 = h0 + slowStepHeight; 
    const h2 = h1 + slowStepHeight; 
    const h3 = h2 + leapStepHeight; 
    const h4 = h3 + slowStepHeight; 
    const h5 = h4 + slowStepHeight; 
    const h6 = h5 + slowStepHeight; 
    const h7 = h6 + slowStepHeight; 
    const h8 = h7 + futureStepHeight;
    
    let index = 0;
    if (scroll < h0) index = 0;
    else if (scroll < h1) index = 1;
    else if (scroll < h2) index = 2;
    else if (scroll < h3) index = 3;
    else if (scroll < h4) index = 4;
    else if (scroll < h5) index = 5;
    else if (scroll < h6) index = 6;
    else if (scroll < h7) index = 7;
    else if (scroll < h8) index = 8;
    else index = storySteps.length - 1;

    let start = 0;
    if (index === 0) start = 0;
    else if (index === 1) start = h0;
    else if (index === 2) start = h1;
    else if (index === 3) start = h2;
    else if (index === 4) start = h3;
    else if (index === 5) start = h4;
    else if (index === 6) start = h5;
    else if (index === 7) start = h6;
    else if (index === 8) start = h7;

    const currentStepHeight = 
      index === 3 ? leapStepHeight : 
      index === 8 ? futureStepHeight :
      (index >= 1 && index <= 7) ? slowStepHeight : 
      stepHeight;

    const progress = Math.max(0, Math.min(1, (scroll - start) / currentStepHeight));

    const OVERLAP_THRESHOLD = 0.97; 
    const isInOverlap = progress > OVERLAP_THRESHOLD;
    const nextStep = (isInOverlap && index < storySteps.length - 1) ? storySteps[index + 1] : null;
    const transitionProgress = nextStep ? (progress - OVERLAP_THRESHOLD) / (1 - OVERLAP_THRESHOLD) : 0;

    return { 
      currentStep: storySteps[index], 
      nextStep, 
      progress, 
      transitionProgress,
      isFinal: !!storySteps[index].isFinal,
      totalHeight: stepHeight + (slowStepHeight * 6) + leapStepHeight + futureStepHeight + (stepHeight * (storySteps.length - 9))
    };
  };

  const { currentStep, progress, nextStep, transitionProgress, isFinal, totalHeight } = 
    IS_FULL_SAGA ? getFullSagaData(scrollProgress) : getShortPathData(scrollProgress);

  return (
    <div className="timeline-parallax-container">
      <SceneDirector 
        currentStep={currentStep} 
        progress={progress} 
        nextStep={nextStep} 
        transitionProgress={transitionProgress}
        onNavigate={onNavigate} 
      />
      <ScrollGuide 
        scrollProgress={scrollProgress} 
        isFinal={isFinal}  
      />
      
      <div style={{ height: `${totalHeight}px` }}></div>
    </div>
  );
};

export default TimelineManager;