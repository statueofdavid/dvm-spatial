// src/components/AboutMe/SceneDirector.tsx
import React from 'react';
import { SceneType, StoryStep } from '../../data/StorySteps';
import Resume from './scenes/Resume';
import Gallery from './scenes/Gallery';
import Forge from './scenes/Forge';
import "./AboutMeTimeline.css"

interface SceneDirectorProps {
  currentStep: StoryStep;
  progress: number;
  nextStep?: StoryStep | null;
  transitionProgress?: number;
}

const SceneMap: Partial<Record<SceneType, React.FC<any>>> = {
  RESUME: Resume,
  GALLERY: Gallery,
  FORGE: Forge,
};

const SceneDirector: React.FC<SceneDirectorProps> = ({ currentStep, progress, nextStep, transitionProgress = 0 }) => {
  const ActiveScene = SceneMap[currentStep.scene];
  const NextScene = (nextStep && nextStep.scene) ? SceneMap[nextStep.scene] : null;

  // Stage 4: Reveal the Cliff/Leap during the Forge white-out
  const isForgeEnd = currentStep.scene === 'FORGE' && progress > 0.85;
  const revealProgress = isForgeEnd ? (progress - 0.85) / 0.15 : 0;

  return (
    <div className="scene-viewport" style={{ position: 'fixed', inset: 0, zIndex: 3000, pointerEvents: 'none' }}>
      {ActiveScene && (
        <ActiveScene progress={progress} step={currentStep} isExiting={!!nextStep} exitFactor={transitionProgress} />
      )}
      {NextScene && (
        <div style={{ position: 'absolute', inset: 0, opacity: Math.max(transitionProgress, revealProgress), pointerEvents: 'none' }}>
          <NextScene progress={0} isEntering={true} />
        </div>
      )}
    </div>
  );
};

export default SceneDirector;