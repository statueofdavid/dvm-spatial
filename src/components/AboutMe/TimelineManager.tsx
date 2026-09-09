import React, { useState, useEffect, useRef, useMemo } from 'react';
import { storySteps } from '../../data/StorySteps';
import SceneDirector from './SceneDirector';
import ScrollGuide from './ScrollGuide';

interface TimelineManagerProps {
  lightMode: boolean;
  onNavigate: (id: string) => void;
  onExit?: () => void;
}

const SHORT_PATH_INDICES = [0, 1, 8];
const SHORT_PATH_STEPS = SHORT_PATH_INDICES.map((i) => storySteps[i]);

export const TimelineManager: React.FC<TimelineManagerProps> = ({ onNavigate, onExit }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const ticking = useRef(false);

  // Touch vector references for swipe detection
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Measure screen width once to calibrate scroll track distance
  const scrollTrackHeights = useMemo(() => {
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 900;
    return isSmallScreen
      ? [1000, 2200, 1000]
      : [1600, 3800, 1600];
  }, []);

  const boundaries = useMemo(() => {
    return scrollTrackHeights.reduce((acc, h, i) => {
      acc.push((acc[i - 1] || 0) + h);
      return acc;
    }, [] as number[]);
  }, [scrollTrackHeights]);

  const totalVirtualHeight = boundaries[boundaries.length - 1];

  useEffect(() => {
    const portalArea = document.querySelector('.portal-scroll-area') as HTMLElement | null;
    if (!portalArea) return;

    // 1. Continuous Scroll Tracker
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrollProgress(portalArea.scrollTop);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    // 2. Touch Gesture Tracking
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null || touchStartX.current === null) return;

      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;

      // Reset coordinates
      touchStartY.current = null;
      touchStartX.current = null;

      // Ignore horizontal or minor accidental swipes
      if (Math.abs(deltaY) < 60 || Math.abs(deltaY) < Math.abs(deltaX)) return;

      const currentScroll = portalArea.scrollTop;
      let currentIndex = boundaries.findIndex((b) => currentScroll < b);
      if (currentIndex === -1) currentIndex = SHORT_PATH_STEPS.length - 1;

      if (deltaY < 0) {
        // 💥 SWIPE DOWN (GO BACK)
        if (currentScroll <= 15) {
          // Already at top: pull down to exit
          if (onExit) {
            onExit();
          } else {
            onNavigate('');
          }
        } else {
          // Snap back to the beginning of the previous scene
          const targetIndex = Math.max(0, currentIndex - 1);
          const targetScroll = targetIndex === 0 ? 0 : boundaries[targetIndex - 1];

          portalArea.scrollTo({
            top: targetScroll,
            behavior: 'smooth',
          });
        }
      } else if (deltaY > 0) {
        // 💥 SWIPE UP (GO FORWARD)
        if (currentIndex < SHORT_PATH_STEPS.length - 1) {
          const targetScroll = boundaries[currentIndex];
          portalArea.scrollTo({
            top: targetScroll,
            behavior: 'smooth',
          });
        }
      }
    };

    portalArea.addEventListener('scroll', handleScroll, { passive: true });
    portalArea.addEventListener('touchstart', handleTouchStart, { passive: true });
    portalArea.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      portalArea.removeEventListener('scroll', handleScroll);
      portalArea.removeEventListener('touchstart', handleTouchStart);
      portalArea.removeEventListener('touchend', handleTouchEnd);
    };
  }, [boundaries, onExit, onNavigate]);

  const timelineState = useMemo(() => {
    let localIndex = boundaries.findIndex((b) => scrollProgress < b);
    if (localIndex === -1) localIndex = SHORT_PATH_STEPS.length - 1;

    const start = localIndex === 0 ? 0 : boundaries[localIndex - 1];
    const currentHeight = scrollTrackHeights[localIndex];
    const progress = Math.max(0, Math.min(1, (scrollProgress - start) / currentHeight));

    const OVERLAP = 0.95;
    const isInOverlap = progress > OVERLAP;
    const nextStep =
      isInOverlap && localIndex < SHORT_PATH_STEPS.length - 1
        ? SHORT_PATH_STEPS[localIndex + 1]
        : null;
    const transitionProgress = nextStep ? (progress - OVERLAP) / (1 - OVERLAP) : 0;

    return {
      currentStep: SHORT_PATH_STEPS[localIndex],
      nextStep,
      progress,
      transitionProgress,
      isFinal: SHORT_PATH_STEPS[localIndex].scene === 'FUTURE',
    };
  }, [scrollProgress, boundaries, scrollTrackHeights]);

  return (
    <div className="timeline-parallax-container">
      <div
        aria-live="polite"
        className="sr-only"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {timelineState.currentStep ? `Story step: ${timelineState.currentStep.text}` : ''}
      </div>

      <SceneDirector
        currentStep={timelineState.currentStep}
        progress={timelineState.progress}
        nextStep={timelineState.nextStep}
        transitionProgress={timelineState.transitionProgress}
        onNavigate={onNavigate}
      />

      <ScrollGuide
        scrollProgress={scrollProgress}
        isFinal={timelineState.isFinal}
      />

      {/* Dynamic virtual scroll track[cite: 23] */}
      <div style={{ height: `calc(${totalVirtualHeight}px + 100vh)` }} />
    </div>
  );
};

export default TimelineManager;