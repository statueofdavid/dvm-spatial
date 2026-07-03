import React, { useState, useEffect, useRef } from 'react'

export default function CTAPrompting({ lightMode, mastery }) {
  const [systemMessage, setSystemMessage] = useState("WELCOME // SYSTEM_READY")
  const [isFading, setIsFading] = useState(false)
  const msgIndexRef = useRef(0)

  // DYNAMIC THEME ENGINE
  const theme = {
    text: lightMode ? '#111111' : '#00ffff', 
    bg: lightMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.7)',
    border: lightMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 255, 255, 0.3)'
  }

  useEffect(() => {
    let timeoutId;
    let fadeId;

    const runCycle = (delay = 4000) => {
      timeoutId = setTimeout(() => {
        const currentPool = [];
        if (!mastery.selected) currentPool.push("SELECT_BRAIN_NODE_TO_EXPLORE");
        if (!mastery.zoomed) currentPool.push("SCROLL_TO_ZOOM");
        if (!mastery.rotated) currentPool.push("DRAG_TO_ROTATE");

        if (currentPool.length === 0) {
          setIsFading(true);
          return;
        }

        setIsFading(true);
        fadeId = setTimeout(() => {
          msgIndexRef.current = (msgIndexRef.current + 1) % currentPool.length;
          setSystemMessage(currentPool[msgIndexRef.current]);
          setIsFading(false);
          runCycle(); 
        }, 600);
      }, delay);
    };

    const initialDelay = setTimeout(() => runCycle(0), 2500);
    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeoutId);
      clearTimeout(fadeId);
    };
  }, [mastery]);

  return (
    <div className="fixed-footer">
      <div 
        className={`terminal-cta ${isFading ? 'fading' : ''}`} 
        style={{ 
          color: theme.text, 
          backgroundColor: theme.bg,
          border: `1px solid ${theme.border}`,
          textShadow: lightMode ? 'none' : `0 0 10px rgba(0, 255, 255, 0.5)`
        }}
        aria-live="polite"
      >
        {systemMessage}
      </div>

      <style>{`
        .fixed-footer { 
          position: absolute; 
          bottom: 5vh; 
          left: 0; 
          right: 0; 
          display: flex; 
          justify-content: center; 
          pointer-events: none; 
          z-index: 100;
        }

        .terminal-cta { 
          font-family: 'monospace'; 
          letter-spacing: 0.5vw; 
          font-size: clamp(10px, 1.8vw, 16px); 
          padding: 1.4vh 3vw; 
          border-radius: 4px; 
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); 
          opacity: 1; 
          backdrop-filter: blur(8px);
          white-space: nowrap;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .terminal-cta.fading { opacity: 0; transform: translateY(10px); }

        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.02); opacity: 1; }
        }
        
        .terminal-cta:not(.fading) {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}