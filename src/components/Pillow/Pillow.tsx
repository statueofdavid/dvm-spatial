import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import PillowAuth from './PillowAuth';
import { logger } from '../../utils/logger';
import WordCloud from './WordCloud';
import { addJournalEntry } from '../../engine/db';

interface PillowProps {
  lightMode: boolean;
}

export default function Pillow({ lightMode }: PillowProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [thoughtText, setThoughtText] = useState('');

  useEffect(() => {
    logger.debug(`PILLOW_UPLINK_INITIALIZED`, { mode: lightMode ? 'LIGHT' : 'DARK' });
  }, [lightMode]);

  const handleAppendThought = async () => {
    if (!thoughtText.trim()) return;

    try {
      logger.info('Writing thought to embedded WASM database...', { length: thoughtText.length });

      // Direct write into browser PGlite (IndexedDB)
      await addJournalEntry(thoughtText);

      logger.info('TRANSMISSION_SUCCESS // THOUGHT_RECORDED_LOCALLY');
      setShowPrompt(false);
      setThoughtText('');

      // Dispatch event to trigger an instant re-query in WordCloud.tsx
      window.dispatchEvent(new Event('journal:entry_added'));
    } catch (error) {
      console.error('PG_WRITE_FAILED // WASM_ERROR', error);
    }
  };

  return (
    <group>
      <WordCloud lightMode={lightMode} />

      {!showPrompt && !showAuth && (
        <Html position={[0, -2.5, 0]} center zIndexRange={[100, 0]}>
          <button
            onClick={() => (isAuthorized ? setShowPrompt(true) : setShowAuth(true))}
            style={{
              background: lightMode ? 'rgba(0,0,0,0.05)' : 'rgba(0, 255, 204, 0.05)',
              border: `1px solid ${lightMode ? '#1a1a1a' : '#00ffcc'}`,
              color: lightMode ? '#1a1a1a' : '#00ffcc',
              padding: '10px 20px',
              fontFamily: 'monospace',
              letterSpacing: '4px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              textTransform: 'uppercase',
              opacity: 0.5,
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = lightMode ? 'rgba(0,0,0,0.1)' : 'rgba(0, 255, 204, 0.2)';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = lightMode ? 'rgba(0,0,0,0.05)' : 'rgba(0, 255, 204, 0.05)';
              e.currentTarget.style.opacity = '0.5';
            }}
          >
            {isAuthorized ? '[ Root Access ]' : '[ Scroll to Explore ]'}
          </button>
        </Html>
      )}

      {showAuth && !isAuthorized && (
        <Html position={[0, 0, 0]} center zIndexRange={[100, 0]}>
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Root Access Authentication Terminal"
            style={{
              background: 'rgba(0,0,0,0.85)',
              padding: '2rem',
              borderRadius: '8px',
              border: `1px solid ${lightMode ? '#333' : '#00ffcc33'}`,
              pointerEvents: 'auto'
            }}
          >
            <PillowAuth
              onAuthenticated={() => {
                setIsAuthorized(true);
                setShowAuth(false);
                logger.info('AUTH_SUCCESS // PILLOW_ACCESS_GRANTED');
              }}
              onCancel={() => setShowAuth(false)}
            />
          </div>
        </Html>
      )}

      {showPrompt && (
        <Html position={[0, 0, 0]} center zIndexRange={[100, 0]}>
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Journal Entry Terminal"
            style={{
              background: 'rgba(0,0,0,0.85)',
              padding: '2rem',
              borderRadius: '8px',
              border: `1px solid ${lightMode ? '#333' : '#00ffcc33'}`,
              pointerEvents: 'auto'
            }}
          >
            <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ color: '#0f0', fontFamily: 'monospace' }}>Readiness: Awaiting Input...</div>
              <textarea
                autoFocus
                value={thoughtText}
                onChange={(e) => setThoughtText(e.target.value)}
                placeholder="Type your thought here..."
                aria-label="Type your thought to record in the journal entry"
                rows={4}
                style={{
                  background: 'transparent',
                  border: '1px solid #333',
                  color: '#fff',
                  padding: '10px',
                  fontFamily: 'monospace',
                  width: '100%',
                  outline: 'none',
                  resize: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleAppendThought} className="pillow-gate-btn" style={{ flex: 1, borderColor: '#0f0', color: '#0f0' }}>
                  Commit Thought
                </button>
                <button onClick={() => setShowPrompt(false)} className="logout-btn">
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}