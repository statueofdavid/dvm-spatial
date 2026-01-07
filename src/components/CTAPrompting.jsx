import React, { useState, useEffect, useRef } from 'react'

export default function CTAPrompting({ lightMode, mastery }) {
  const [systemMessage, setSystemMessage] = useState("WELCOME // SYSTEM_READY")
  const [isFading, setIsFading] = useState(false)
  const msgIndexRef = useRef(0)

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
      <div className={`terminal-cta ${lightMode ? 'light' : 'dark'} ${isFading ? 'fading' : ''}`} aria-live="polite">
        {systemMessage}
      </div>
    </div>
  )
}
