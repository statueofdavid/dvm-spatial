// src/components/AboutMe/SceneDirector.tsx
import React from 'react';
import { SceneType, StoryStep } from '../../data/StorySteps';
import Resume from './scenes/Resume';
import Gallery from './scenes/Gallery';
import Forge from './scenes/Forge';
import Leap from './scenes/Leap';
import Value from './scenes/Value';
import Control from './scenes/Control';
import Mirror from './scenes/Mirror';
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
  LEAP: Leap,
  VALUE: Value,
  CONTROL: Control,
  MIRROR: Mirror,
};

const SceneDirector: React.FC<SceneDirectorProps> = ({ currentStep, progress, nextStep, transitionProgress = 0 }) => {
  const ActiveScene = SceneMap[currentStep.scene];
  const NextScene = (nextStep && nextStep.scene) ? SceneMap[nextStep.scene] : null;

  const isForgeEnd = currentStep.scene === 'FORGE' && progress > 0.94;
  const revealProgress = isForgeEnd ? (progress - 0.94) / 0.06 : 0;

  return (
    <div className="scene-viewport" style={{ position: 'fixed', inset: 0, zIndex: 3000, pointerEvents: 'none' }}>
      {ActiveScene && (
        <div style={{ opacity: 1 - transitionProgress }}>
          <ActiveScene progress={progress} step={currentStep} isExiting={!!nextStep} exitFactor={transitionProgress} />
        </div>
      )}
      {NextScene && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          // THE FIX: Forge amber appears at 50% transition for a cleaner handoff
          opacity: Math.max(transitionProgress > 0.5 ? (transitionProgress - 0.5) * 2 : 0, revealProgress), 
          pointerEvents: 'none',
          visibility: transitionProgress > 0.1 ? 'visible' : 'hidden'
        }}>
          <NextScene progress={0} isEntering={true} step={nextStep} />
        </div>
      )}
    </div>
  );
};

export default SceneDirector;