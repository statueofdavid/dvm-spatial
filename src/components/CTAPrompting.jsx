import React, { useState, useEffect, useRef } from 'react'

export default function CTAPrompting({ lightMode, mastery }) {
  const [systemMessage, setSystemMessage] = useState("WELCOME // SYSTEM_READY")
  const [isFading, setIsFading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const msgIndexRef = useRef(0)

  useEffect(() => {
    let timeoutId;
    let fadeId;

    const runCycle = () => {
      // Build current pool of remaining instructions
      const currentPool = [];
      if (!mastery.selected) currentPool.push("SELECT_BRAIN_NODE_TO_EXPLORE");
      if (!mastery.zoomed) currentPool.push("SCROLL_TO_ZOOM");
      if (!mastery.rotated) currentPool.push("DRAG_TO_ROTATE");

      // TERMINATION: If all actions are mastered, exit the loop
      if (currentPool.length === 0 && hasStarted) {
        setIsFading(true);
        return;
      }

      timeoutId = setTimeout(() => {
        setIsFading(true); // Trigger CSS fade-out
        
        fadeId = setTimeout(() => {
          setHasStarted(true);
          // Safety: Use modulo to stay within the shrinking pool
          msgIndexRef.current = (msgIndexRef.current + 1) % currentPool.length;
          setSystemMessage(currentPool[msgIndexRef.current]);
          setIsFading(false); // Trigger CSS fade-in
          runCycle(); 
        }, 800); 
      }, 4000);
    };

    // Initial 3-second delay for the Welcome message
    const initialDelay = setTimeout(() => runCycle(), 3000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeoutId);
      clearTimeout(fadeId);
    };
  }, [mastery, hasStarted]);

  // Completely unmount once finished to clean the DOM
  const isComplete = mastery.selected && mastery.zoomed && mastery.rotated;
  if (isComplete && isFading) return null;

  return (
    <div className="fixed-footer">
      <div className={`terminal-cta ${lightMode ? 'light' : 'dark'} ${isFading ? 'fading' : ''}`}>
        {systemMessage}
      </div>
    </div>
  )
}