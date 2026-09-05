import React, { useState } from 'react';

interface VictoryOverlayProps {
  onReset: () => void;
  onClose: () => void;
  onNextStep?: () => void;
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({ onReset, onClose, onNextStep }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubmitted(true);
  };

  const handleNextStepClick = () => {
    if (onNextStep) {
      onNextStep();
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 5, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        fontFamily: 'monospace',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{
          color: '#00ffff',
          fontSize: '2.5rem',
          margin: '0 0 8px 0',
          letterSpacing: '3px',
          textShadow: '0 0 24px rgba(0, 255, 255, 0.6)',
          textAlign: 'center',
        }}
      >
        Assembled
      </h1>
      <p style={{ color: '#aaa', fontSize: '0.95rem', margin: '0 0 28px 0', textAlign: 'center' }}>
        Wow! I didn't think anyone would actually solve six of these puzzles. Thanks for Playing!
      </p>

      {/* CTA ACTIONS */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
        <button
          onClick={onReset}
          style={{
            background: 'transparent',
            border: '1px solid #ff810a',
            color: '#ff810a',
            padding: '12px 24px',
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            cursor: 'pointer',
            borderRadius: '4px',
            letterSpacing: '1px',
            transition: 'all 0.2s ease',
          }}
        >
          Rescramble The Cube
        </button>

        <button
          onClick={handleNextStepClick}
          style={{
            background: 'rgba(0, 255, 255, 0.1)',
            border: '1px solid #00ffff',
            color: '#00ffff',
            padding: '12px 24px',
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            cursor: 'pointer',
            borderRadius: '4px',
            letterSpacing: '1px',
            transition: 'all 0.2s ease',
          }}
        >
          Continue My Story →
        </button>
      </div>

      {/* EMAIL CAPTURE BOX */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#111',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '6px',
          textAlign: 'center',
        }}
      >
        <h3 style={{ color: '#fff', fontSize: '1rem', margin: '0 0 8px 0' }}>Claim Your Prize</h3>
        <p style={{ color: '#777', fontSize: '0.8rem', margin: '0 0 16px 0' }}>
          Enter your email address to receive your puzzle completion prize.
        </p>

        {submitted ? (
          <div style={{ color: '#00ffff', fontSize: '0.85rem', padding: '8px 0' }}>
            ✓ Check your inbox! Your pack is on the way.
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@declared.space"
              required
              style={{
                flex: 1,
                background: '#0a0a0a',
                border: '1px solid #333',
                color: '#fff',
                padding: '8px 12px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                borderRadius: '3px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#ff810a',
                border: 'none',
                color: '#000',
                fontWeight: 'bold',
                padding: '8px 16px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                cursor: 'pointer',
                borderRadius: '3px',
              }}
            >
              Claim
            </button>
          </form>
        )}
      </div>
    </div>
  );
};