import React from 'react';
import { VscFilePdf, VscDebugRestart, VscHistory } from 'react-icons/vsc';
import { useFitCheck } from './hooks/useFitCheck';
import './FitCheck.css';
import { getResonanceIcon, getResultQuip } from './util/FitHelper';
import { WeightVector, WeightedOption } from '../../data/FitCheckConst';

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
      <div className="fit-content-wrapper">
        <div className="fit-loader">ANALYZING SIGNAL...</div>
      </div>
    </div>
  );

  // 💥 THE RESTORED RESULTS VIEW 💥
  if (viewState === 'result') {
    const dominantVector = (Object.keys(totalScore) as Array<keyof WeightVector>).reduce((a, b) => totalScore[a] > totalScore[b] ? a : b);
    const resultHeader = fitPercentage < 45 ? "PROTOCOL_MISMATCH" : `${dominantVector.toUpperCase()}_RESONANCE`;
    
    return (
      <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
        <div className="fit-content-wrapper" style={{ textAlign: 'center' }}>
          <span className="fit-label">// ASSESSMENT_COMPLETE</span>
          <h2 className="fit-question" style={{ marginBottom: '16px' }}>{resultHeader}</h2>
          
          <div style={{ fontSize: '3rem', margin: '20px 0' }}>
            {getResonanceIcon(dominantVector)}
          </div>
          
          <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--fit-accent)', lineHeight: 1 }}>
            {fitPercentage}%
          </div>
          <div style={{ fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '32px', color: 'var(--fit-text-muted)' }}>
            ALIGNMENT_MATCH
          </div>

          <p style={{ color: 'var(--fit-text-main)', lineHeight: 1.6, marginBottom: '40px', fontSize: '1.1rem' }}>
            {getResultQuip(dominantVector, fitPercentage)}
          </p>

          <div className="fit-options-grid">
            <button className="resume-btn raised" onClick={() => onNavigate('action')}>
              Return to Timeline
            </button>
            <button className="fit-option-btn" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={handleRetry}>
              <VscDebugRestart /> Recalibrate Our Fit
            </button>
            <a href="/dvm-resume.pdf" target="_blank" className="resume-btn raised">
              <VscFilePdf /> View Resume
            </a>
          </div>
        </div>
      </div>
    );
  }

  const question = activeQuestions[currentStep];
  
  if (!question) return null;

  return (
    <div className={`fit-module-container ${themeClass}`}>
      <div className="fit-content-wrapper" key={currentStep}>
        <div className="fit-progress-track">
          <div className="fit-progress-fill" style={{ width: `${(currentStep / activeQuestions.length) * 100}%` }} />
        </div>

        <span className="fit-label">{bucket ? `// ${bucket}_SEQ_0${currentStep}` : '// PROTOCOL_SELECTION'}</span>
        <h2 className="fit-question">{question.text}</h2>
        
        <div className="fit-options-grid">
          {question.options.map((opt: WeightedOption, i: number) => (
            <button key={i} onClick={() => handleAnswer(opt)} className="fit-option-btn">
              {opt.text}
            </button>
          ))}
        </div>
      </div>

      <div className="fit-cancel-container">
        <button className="fit-cancel-btn" onClick={() => onNavigate('action')}>
          [ CANCEL_PROTOCOL ]
        </button>
      </div>
    </div>
  );
}