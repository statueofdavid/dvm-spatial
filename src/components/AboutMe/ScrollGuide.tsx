import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { VscChevronDown } from 'react-icons/vsc';

const ScrollGuide: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(false); // Hide on scroll
    const timer = setTimeout(() => setShow(true), 2500); // Fade in after pause
    return () => clearTimeout(timer);
  }, [scrollProgress]);

  // Teleport the component to the very top of the DOM tree
  return ReactDOM.createPortal(
    <div className="scroll-nudge-fixed" style={{ 
      opacity: show ? 1 : 0,
      visibility: show ? 'visible' : 'hidden'
    }}>
      <div className="nudge-content">
        <span className="nudge-text">
          {scrollProgress < 100 ? '// SCROLL_FOR_MORE' : '// KEEP_SCROLLING'}
        </span>
        <VscChevronDown className="pulse-icon" />
      </div>
    </div>,
    document.body // This is the "Root Level" fix
  );
};

export default ScrollGuide;