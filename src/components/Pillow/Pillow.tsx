import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import PillowAuth from './PillowAuth';
import { logger } from "../../utils/logger";
import WordCloud from './WordCloud';

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
      logger.info("TRANSMITTING_THOUGHT...", { length: thoughtText.length });
      
      const token = localStorage.getItem('neural_token');
      const response = await fetch('http://localhost:3000/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ raw_text: thoughtText }),
      });

      if (response.ok) {
        logger.info("TRANSMISSION_SUCCESS // THOUGHT_RECORDED");
        setShowPrompt(false);
        setThoughtText("");
      } else {
        console.error("TRANSMISSION_FAILED // SERVER_REJECTION");
      }
    } catch (error) {
      console.error("UPLINK_SEVERED // NETWORK_ERROR", error);
    }
  };

  return (
    <group>
      {/* The Deep Data Sea */}
      <WordCloud lightMode={lightMode} />

      {/* 1. THE ROOT ACCESS BUTTON */}
      {!showPrompt && !showAuth && (
        <Html position={[0, -2.5, 0]} center zIndexRange={[100, 0]}>
          <button 
            onClick={() => isAuthorized ? setShowPrompt(true) : setShowAuth(true)}
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
            {isAuthorized ? '[ ROOT_ACCESS ]' : '[ SCROLL_TO_EXPLORE ]'}
          </button>
        </Html>
      )}

      {/* 2. THE AUTH TERMINAL */}
      {showAuth && !isAuthorized && (
        <Html position={[0, 0, 0]} center zIndexRange={[100, 0]}>
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
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
                  logger.info("AUTH_SUCCESS // PILLOW_ACCESS_GRANTED");
                }} 
                onCancel={() => setShowAuth(false)}
            />
          </div>
        </Html>
      )}

      {/* 3. THE PROMPT ENTRY */}
      {showPrompt && (
        <Html position={[0, 0, 0]} center zIndexRange={[100, 0]}>
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: 'rgba(0,0,0,0.85)',
              padding: '2rem',
              borderRadius: '8px',
              border: `1px solid ${lightMode ? '#333' : '#00ffcc33'}`,
              pointerEvents: 'auto'
            }}
          >
            <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ color: '#0f0', fontFamily: 'monospace' }}>SYS_READY: AWAITING_INPUT...</div>
              <textarea
                autoFocus
                value={thoughtText}
                onChange={(e) => setThoughtText(e.target.value)}
                placeholder="Type your thought here..."
                rows={4}
                style={{
                  background: 'transparent', border: '1px solid #333', color: '#fff',
                  padding: '10px', fontFamily: 'monospace', width: '100%', outline: 'none', resize: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleAppendThought} className="pillow-gate-btn" style={{ flex: 1, borderColor: '#0f0', color: '#0f0' }}>COMMIT_RECORD</button>
                <button onClick={() => setShowPrompt(false)} className="logout-btn">CANCEL</button>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}