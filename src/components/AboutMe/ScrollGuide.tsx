import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { VscChevronDown } from 'react-icons/vsc';
import { useIsMobile } from '../../hooks/useIsMobile'; 

interface ScrollGuideProps {
  scrollProgress: number;
  isFinal?: boolean;
}

const ScrollGuide: React.FC<ScrollGuideProps> = ({ scrollProgress, isFinal }) => {
  const [show, setShow] = useState(true);
  const [hasDismissed, setHasDismissed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const storedPref = localStorage.getItem('dvm_has_scrolled');
    if (storedPref === 'true') {
      setHasDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (scrollProgress > 5 && !hasDismissed) {
      localStorage.setItem('dvm_has_scrolled', 'true');
      setHasDismissed(true);
    }
  }, [scrollProgress, hasDismissed]);

  useEffect(() => {
    if (hasDismissed) return; 
    
    setShow(false); 
    const timer = setTimeout(() => setShow(true), 2500);
    
    return () => clearTimeout(timer);
  }, [scrollProgress, hasDismissed]);

  if (isFinal || hasDismissed) return null;

  const promptText = isMobile 
    ? (scrollProgress < 100 ? '// SWIPE_UP_FOR_MORE' : '// KEEP_SWIPING')
    : (scrollProgress < 100 ? '// SCROLL_FOR_MORE' : '// KEEP_SCROLLING');

  return ReactDOM.createPortal(
    <div className="scroll-nudge-fixed" style={{ 
      opacity: show ? 1 : 0,
      visibility: show ? 'visible' : 'hidden'
    }}>
      <div className="nudge-content">
        <span className="nudge-text">
          {promptText}
        </span>
        <VscChevronDown className="pulse-icon" />
      </div>
    </div>,
    document.body
  );
};

export default ScrollGuide;