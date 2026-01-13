// src/components/AboutMe/SceneDirector.tsx
import React from 'react';
import { SceneType, StoryStep } from '../../data/StorySteps';
import Mirror from './scenes/Mirror';
import Resume from './scenes/Resume';
import Gallery from './scenes/Gallery';


interface SceneDirectorProps {
  currentStep: StoryStep;
  progress: number;
}

const SceneMap: Partial<Record<SceneType, React.FC<any>>> = {
  RESUME: Resume,
  MIRROR: Mirror,
  GALLERY: Gallery,
};

const SceneDirector: React.FC<SceneDirectorProps> = ({ currentStep, progress }) => {
  const ActiveScene = SceneMap[currentStep.scene];

return (
  <div className="scene-viewport" style={{ 
    position: 'fixed', 
    inset: 0, 
    zIndex: 3000, 
    pointerEvents: 'none', // Critical: Let clicks pass through the fixed layer
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center'
  }}>
    {/* No 'auto' pointer events on this wrapper */}
    {ActiveScene ? (
      <ActiveScene progress={progress} step={currentStep} />
    ) : (
      <div style={{ color: '#ff810a', textAlign: 'center', paddingTop: '35vh' }}>
        <h1>{currentStep?.tag}</h1>
        <p>Scene: {currentStep?.scene}</p>
      </div>
    )}
  </div>
);
};

export default SceneDirector;