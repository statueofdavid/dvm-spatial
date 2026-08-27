import React, { useState, useEffect, useRef } from 'react';
import { storySteps } from '../../data/StorySteps';
import SceneDirector from './SceneDirector';
import ScrollGuide from './ScrollGuide';

interface MobileStoryManagerProps {
  lightMode: boolean;
  onNavigate: (id: string) => void;
}

const MobileStoryManager: React.FC<MobileStoryManagerProps> = ({ lightMode, onNavigate }) => {
  // We only track the active steps for the "Short Path" to match your current setup
  const activeIndices = [0, 1, 8]; 
  const activeSteps = activeIndices.map(i => storySteps[i]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Touch Tracking
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // Animate progress from 0 to 1 automatically when the scene changes
  useEffect(() => {
    setProgress(0);
    setIsTransitioning(true);
    
    let startTime: number;
    const duration = 1200; // 1.2 seconds for the scene to build itself

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const p = Math.min(1, elapsed / duration);
      
      // Add a simple ease-out calculation
      const easeOut = 1 - Math.pow(1 - p, 3);
      setProgress(easeOut);

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsTransitioning(false);
      }
    };

    requestAnimationFrame(animate);
  }, [currentIndex]);

  const handleSwipe = () => {
    const swipeDistance = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50; // pixels required to trigger a change

    if (Math.abs(swipeDistance) > minSwipeDistance && !isTransitioning) {
      if (swipeDistance > 0 && currentIndex < activeSteps.length - 1) {
        // Swipe Up -> Next Scene
        setCurrentIndex(prev => prev + 1);
      } else if (swipeDistance < 0 && currentIndex > 0) {
        // Swipe Down -> Previous Scene
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndY.current = e.changedTouches[0].clientY;
    handleSwipe();
  };

  const currentStep = activeSteps[currentIndex];
  const isFinal = currentStep.scene === 'FUTURE';

  return (
    <div 
      className="mobile-story-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ width: '100vw', height: '100vh', position: 'fixed', inset: 0, zIndex: 10 }}
    >
      <div 
        aria-live="polite" 
        className="sr-only" 
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {currentStep ? `Story step: ${currentStep.text}` : ''}
      </div>
      
      <SceneDirector 
        currentStep={currentStep} 
        progress={progress} 
        // We aren't blending scenes on mobile, so nextStep and transitionProgress are null/0
        nextStep={null} 
        transitionProgress={0}
        onNavigate={onNavigate} 
      />
      
      {/* Reusing your ScrollGuide, but it now acts as a swipe indicator */}
      <ScrollGuide 
        scrollProgress={progress * 100} 
        isFinal={isFinal}  
      />
    </div>
  );
};

export default MobileStoryManager;