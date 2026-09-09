import React from 'react';
import { SceneType, StoryStep } from '../../data/StorySteps';
import Resume from './scenes/Resume';
import Gallery from './scenes/Gallery';
import Future from './scenes/Future';
import './AboutMeTimeline.css';

interface SceneDirectorProps {
  currentStep: StoryStep;
  progress: number;
  nextStep?: StoryStep | null;
  transitionProgress?: number;
  onNavigate: (id: string) => void;
}

const SceneMap: Partial<Record<SceneType, React.FC<any>>> = {
  RESUME: Resume,
  GALLERY: Gallery,
  FUTURE: Future,
};

const SceneDirector: React.FC<SceneDirectorProps> = ({ 
  currentStep, 
  progress, 
  nextStep, 
  transitionProgress = 0, 
  onNavigate 
}) => {
  const ActiveScene = SceneMap[currentStep.scene];
  const NextScene = nextStep?.scene ? SceneMap[nextStep.scene] : null;

  // Clean, symmetric cross-fade calculation
  const activeOpacity = Math.max(0, 1 - transitionProgress);
  const nextOpacity = Math.max(0, (transitionProgress - 0.2) / 0.8);

  return (
    <div className="scene-viewport">
      {/* Currently Active Scene */}
      {ActiveScene && (
        <div style={{ opacity: activeOpacity, width: '100%', height: '100%' }}>
          <ActiveScene 
            progress={progress} 
            step={currentStep} 
            isExiting={Boolean(nextStep)}
            exitFactor={transitionProgress} 
            onNavigate={onNavigate}
          />
        </div>
      )}

      {/* Next Incoming Scene (Pre-rendered during overlap transition) */}
      {NextScene && transitionProgress > 0 && (
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            opacity: nextOpacity, 
            pointerEvents: 'none',
            visibility: transitionProgress > 0.05 ? 'visible' : 'hidden'
          }}
        >
          <NextScene 
            progress={0} 
            isEntering={true} 
            step={nextStep} 
            onNavigate={onNavigate}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(SceneDirector);