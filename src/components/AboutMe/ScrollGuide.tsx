import React, { useState, useEffect } from 'react';
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
    if (localStorage.getItem('dvm_has_scrolled') === 'true') {
      setHasDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (scrollProgress > 10 && !hasDismissed) {
      localStorage.setItem('dvm_has_scrolled', 'true');
      setHasDismissed(true);
    }
  }, [scrollProgress, hasDismissed]);

  // Nudge reappearance timer when paused
  useEffect(() => {
    if (hasDismissed) return;
    setShow(false);
    const timer = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(timer);
  }, [scrollProgress, hasDismissed]);

  if (isFinal || hasDismissed) return null;

  const promptText = isMobile ? '// SWIPE_UP_FOR_MORE' : '// SCROLL_FOR_MORE';

  // Render directly in the DOM tree; CSS position: fixed handles viewport placement
  return (
    <div 
      className="scroll-nudge-fixed" 
      style={{ 
        opacity: show ? 1 : 0,
        visibility: show ? 'visible' : 'hidden'
      }}
    >
      <div className="nudge-content">
        <span className="nudge-text">{promptText}</span>
        <VscChevronDown className="pulse-icon" />
      </div>
    </div>
  );
};

export default React.memo(ScrollGuide);