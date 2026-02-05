import React from 'react';
import { VscFilePdf, VscDebugRestart, VscHistory } from 'react-icons/vsc';
import { useFitCheck } from '../../hooks/useFitCheck';
import { getResonanceIcon, getResultQuip } from './util/FitHelper';
import { WeightVector } from '../../data/FitCheckConst';

export default function FitCheck({ onExit, onNavigate, lightMode }: any) {
  const { 
    viewState, bucket, currentStep, activeQuestions, 
    totalScore, fitPercentage, handleStart, handleRetry, handleAnswer 
  } = useFitCheck();

  const themeClass = lightMode ? 'light-theme' : 'dark-theme';
  const textColor = lightMode ? '#1a1a1a' : '#f0f0f0';

  if (viewState === 'intro') return (
    <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
      <div className="fit-content-wrapper">
        <span className="fit-label">// SYSTEM_CHECK</span>
        <h1 className="fit-question">Compatibility Assessment</h1>
        <button className="resume-btn raised" onClick={handleStart} style={{ border: 'none' }}>INITIALIZE_SCAN</button>
        <button className="fit-option-btn" onClick={() => onNavigate('action')}>CANCEL</button>
      </div>
    </div>
  );

  if (viewState === 'calculating') return (
    <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
      <div className="fit-content-wrapper"><div className="fit-loader" /><span className="fit-label">ANALYZING SIGNAL...</span></div>
    </div>
  );

  if (viewState === 'result') {
    const dominantVector = (Object.keys(totalScore) as Array<keyof WeightVector>).reduce((a, b) => totalScore[a] > totalScore[b] ? a : b);
    return (
      <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
        <div className="fit-content-wrapper">
          <span className="fit-label">// ANALYSIS_COMPLETE</span>
          <div style={{ margin: '2rem 0', filter: 'drop-shadow(0 0 20px rgba(255, 129, 10, 0.4))' }}>{getResonanceIcon(dominantVector, fitPercentage)}</div>
          <p className="fit-score-details">{getResultQuip(bucket, dominantVector, fitPercentage)}</p>
          <div className="fit-options-grid">
            <button className="fit-option-btn" onClick={handleRetry}><VscDebugRestart /> RETRY</button>
            <button className="resume-btn raised" onClick={() => onNavigate('action')} style={{ border: 'none' }}><VscHistory /> TIMELINE</button>
          </div>
        </div>
      </div>
    );
  }

  const question = activeQuestions[currentStep];
  return (
    <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
      <div className="fit-progress-track"><div className="fit-progress-fill" style={{ width: `${(currentStep / activeQuestions.length) * 100}%` }} /></div>
      <div className="fit-content-wrapper" key={currentStep}>
        <span className="fit-label">{bucket ? `// ${bucket}_SEQ_0${currentStep}` : '// PROTOCOL_SELECTION'}</span>
        <h2 className="fit-question">{question?.text}</h2>
        <div className="fit-options-grid">
          {question?.options.map((opt, i) => <button key={i} onClick={() => handleAnswer(opt)} className="fit-option-btn">{opt.text}</button>)}
        </div>
      </div>
    </div>
  );
}