// src/components/AboutMe/ScrollGuide.tsx
import React, { useState, useEffect } from 'react';
import { VscChevronDown } from 'react-icons/vsc';

const ScrollGuide: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide immediately on scroll action
    setShow(false); 
    
    // Fade in only after a pause (3s) to act as a nudge
    const timer = setTimeout(() => {
      setShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [scrollProgress]);

  return (
    <div 
      className="scroll-nudge-fixed" 
      style={{ 
        opacity: show ? 1 : 0,
        pointerEvents: 'none'
      }}
    >
      <span className="nudge-text">
        {scrollProgress < 100 ? '// SCROLL_TO_ENTER' : '// KEEP_SCROLLING'}
      </span>
      <VscChevronDown className="pulse-icon" />
    </div>
  );
};

export default ScrollGuide;