import React, { useState } from 'react';
import { 
  VscFilePdf, 
  VscDebugRestart, 
  VscMail, 
  VscCheck, 
  VscCopy, 
  VscTarget, 
  VscPulse,
  VscChromeClose 
} from 'react-icons/vsc';
import { useFitCheck } from './hooks/useFitCheck';
import './FitCheck.css';
import { WeightedOption, RESULT_MATRIX } from '../../data/FitCheckConst';

export default function FitCheck({ onNavigate, lightMode }: any) {
  const { 
    viewState, bucket, currentStep, activeQuestions, 
    fitPercentage, dominantVector, topDimensions,
    handleStart, handleRetry, handleAnswer, handleBack
  } = useFitCheck();

  const [copied, setCopied] = useState(false);

  const themeClass = lightMode ? 'light-theme' : 'dark-theme';
  const textColor = lightMode ? '#1a1a1a' : '#f0f0f0';

  if (viewState === 'intro') {
    return (
      <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
        <div className="fit-content-wrapper" style={{ textAlign: 'center' }}>
          <span className="fit-label">Engineering Alignment</span>
          <h1 className="fit-question">Technical Compatibility Assessment</h1>
          <div className="fit-options-grid">
            <button 
              className="resume-btn raised" 
              onClick={handleStart} 
              style={{ border: 'none', margin: '0 auto' }}
            >
              Get Started
            </button>
            <button 
              className="fit-option-btn" 
              onClick={() => onNavigate('action')}
              style={{ margin: '0 auto' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'calculating') {
    return (
      <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
        <div className="fit-content-wrapper" style={{ textAlign: 'center' }}>
          <div className="fit-loader">Calculating Compatibility Matrix...</div>
        </div>
      </div>
    );
  }

  if (viewState === 'result') {
    const capitalizedVector = dominantVector.charAt(0).toUpperCase() + dominantVector.slice(1);
    const resultHeader = fitPercentage < 45 ? "Low Resonance" : `${capitalizedVector} Resonance`;
    
    const activeBucket = bucket || 'DEFAULT';
    const highlightSummary = RESULT_MATRIX[activeBucket]?.[dominantVector] || RESULT_MATRIX.DEFAULT[dominantVector];

    // Format top 3 dimensions into a brief readable string
    const topDimensionsSummary = topDimensions
      .map(d => `${d.label} ${d.percentage}%`)
      .join(' | ');

    // Pre-composed email template
    const emailSubject = encodeURIComponent(`[Engineering Alignment: ${capitalizedVector} (${fitPercentage}%)] - Connecting`);
    const emailBody = encodeURIComponent(
`Hi David,

I ran your interactive compatibility assessment and got a ${fitPercentage}% match in ${capitalizedVector} Resonance.

Highlighted Alignment:
"${highlightSummary}"

Dimensions: ${topDimensionsSummary}

I'd like to talk about how your background in systems engineering and delivery fits our team.

Best,
[Name / Team]`
    );
    const mailtoUrl = `mailto:david@declared.space?subject=${emailSubject}&body=${emailBody}`;

    // Markdown summary generator for clipboard
    const handleCopyBrief = async () => {
      const brief = 
`---
CANDIDATE ALIGNMENT BRIEF
Candidate: David Vincent Miller
Email: david@declared.space
Calculated Match: ${fitPercentage}% (${capitalizedVector} Resonance)
Focus Area: ${bucket || 'Engineering'}
Top Dimensions: ${topDimensionsSummary}
Technical Highlight: ${highlightSummary}
Online Resume: https://david.declared.space/dvm-resume.pdf
---`;

      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    };

    return (
      <div className={`fit-module-container ${themeClass}`} style={{ color: textColor }}>
        <button 
          onClick={() => onNavigate('action')}
          className="fit-close-btn"
          aria-label="Close Assessment"
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'transparent',
            border: 'none',
            color: 'var(--fit-text-muted)',
            fontSize: '1.4rem',
            cursor: 'pointer'
          }}
        >
          <VscChromeClose />
        </button>

        <div className="fit-content-wrapper" style={{ maxWidth: '850px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span className="fit-label">Assessment Complete</span>
            <h2 className="fit-question" style={{ marginBottom: '8px' }}>{resultHeader}</h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '32px',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            {/* Left Column: Visual Metrics */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              padding: '24px',
              background: lightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: `1px solid ${lightMode ? '#e0e0e0' : 'rgba(255,255,255,0.08)'}`
            }}>
              <div style={{ fontSize: '2.5rem', color: 'var(--fit-accent)', marginBottom: '8px' }}>
                {fitPercentage >= 50 ? <VscTarget /> : <VscPulse />}
              </div>
              <div style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--fit-accent)', lineHeight: 1 }}>
                {fitPercentage}%
              </div>
              <div style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: '0.85rem', color: 'var(--fit-text-muted)', marginTop: '8px' }}>
                ALIGNMENT REACHED
              </div>

              {/* Top 3 Mutating Dimension Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
                {topDimensions.map(dim => (
                  <span key={dim.key} className="fit-metric-pill">
                    {dim.label}: {dim.percentage}%
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Narrative Highlight & Core Actions */}
            <div>
              <p style={{ 
                lineHeight: 1.6, 
                fontSize: '1.05rem', 
                color: 'var(--fit-text-main)', 
                marginBottom: '24px',
                borderLeft: '3px solid var(--fit-accent)',
                paddingLeft: '16px'
              }}>
                {highlightSummary}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a 
                  href={mailtoUrl} 
                  className="resume-btn raised" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <VscMail /> Start Conversation
                </a>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={handleCopyBrief} 
                    className="fit-option-btn" 
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {copied ? <VscCheck style={{ color: '#00ffcc' }} /> : <VscCopy />}
                    {copied ? 'Copied' : 'Copy Brief'}
                  </button>

                  <a 
                    href="/dvm-resume.pdf" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="fit-option-btn" 
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                  >
                    <VscFilePdf /> View Resume
                  </a>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <button 
                    onClick={handleRetry} 
                    style={{ background: 'none', border: 'none', color: 'var(--fit-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                  >
                    <VscDebugRestart /> Recalibrate
                  </button>
                  <button 
                    onClick={() => onNavigate('action')} 
                    style={{ background: 'none', border: 'none', color: 'var(--fit-text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Return to Timeline &rarr;
                  </button>
                </div>
              </div>
            </div>
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

        <span className="fit-label">{bucket ? `${bucket}_Query_0${currentStep + 1}` : 'System Routing'}</span>
        <h2 className="fit-question">{question.text}</h2>
        
        <div className="fit-options-grid">
          {question.options.map((opt: WeightedOption, i: number) => (
            <button key={i} onClick={() => handleAnswer(opt)} className="fit-option-btn">
              {opt.text}
            </button>
          ))}
        </div>
      </div>

      <div 
        className="fit-cancel-container" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          alignItems: 'center', 
          width: '100%',
          padding: '0 24px'
        }}
      >
        {currentStep > 0 && (
          <button 
            type="button"
            className="fit-option-btn" 
            onClick={handleBack}
            aria-label="Return to the previous question"
            style={{ width: '100%', maxWidth: '320px', margin: 0 }}
          >
            Go Back
          </button>
        )}

        <button 
          type="button"
          className="resume-btn raised" 
          onClick={() => onNavigate('action')}
          aria-label="Cancel protocol and return to the timeline"
          style={{ width: '100%', maxWidth: '320px', margin: 0 }}
        >
          Cancel Fit Calculator
        </button>
      </div>
    </div>
  );
}