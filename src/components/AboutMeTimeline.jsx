import React, { useEffect, useState } from 'react';
import { VscFilePdf, VscCloudDownload, VscMail, VscBroadcast } from 'react-icons/vsc';
import './AboutMeTimeline.css';

export default function AboutMeTimeline({ lightMode, onNavigate }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const portalArea = document.querySelector('.portal-scroll-area');
    if (!portalArea) return;
    const handleScroll = () => setScrollProgress(portalArea.scrollTop);
    portalArea.addEventListener('scroll', handleScroll);
    return () => portalArea.removeEventListener('scroll', handleScroll);
  }, []);

  const getLayerStyle = (index) => {
    const spacing = 1500; 
    const start = index * spacing;
    
    // Slide 0 starts at Z:0. Others start in the distance.
    const zPos = (scrollProgress - start) * 1.5;
    
    let opacity = 1;
    if (zPos > 800) {
      opacity = 1 - (zPos - 800) / 600; 
    } else if (zPos < -1000) {
      opacity = 1 - (Math.abs(zPos) - 1000) / 1000;
    }

    return {
      transform: `translateZ(${zPos}px)`,
      opacity: Math.max(0, opacity),
      pointerEvents: zPos > -200 && zPos < 800 ? 'auto' : 'none',
      display: opacity <= 0 ? 'none' : 'flex',
      transition: 'opacity 0.3s ease-out'
    };
  };

  const storySteps = [
    { 
      tag: "THE_PRESENT", 
      title: "DAVID VINCENT MILLER",
      text: "Bridging the gap between analog, digital, and business needs.",
      img: "/images/dvm-profile-pic.jpg",
      actions: (
        <div className="resume-actions">
          <a href="/dvm-resume.pdf" target="_blank" className="resume-btn"><VscFilePdf /> VIEW_RESUME</a>
          <a href="/dvm-resume.pdf" download className="resume-btn secondary"><VscCloudDownload /> DOWNLOAD</a>
        </div>
      )
    },
    { 
      tag: "PRIORITIES", 
      text: "Family and friends first. Technology as a force for good.",
      img: "/images/dvm-profile-closeup-pic.jpg",
      isGrayscale: true 
    },
    { 
      tag: "THE_JOURNEY", 
      text: "A lifetime of variety before the first line of code.",
      isQuip: true 
    },
    { 
      tag: "ORIGIN", 
      text: "High school exit. Straight into the mechanics of business." 
    },
    { 
      tag: "RETAIL_ERA", 
      text: "Inventory, logistics, and the intuition of service." 
    },
    { 
      tag: "TELECOM", 
      text: "Pulling cables. Understanding the physical pulse of the net." 
    },
    { 
      tag: "THE_PIVOT", 
      text: "To build the future, I had to master the machine.",
      isQuip: true 
    },
    { 
      tag: "DISCIPLINE", 
      text: "Architecture, testing, and engineering foundations." 
    },
    { 
      tag: "PROFESSIONAL", 
      text: "Swisslog // UZURV. Complexity delivered without complication." 
    },
    { 
      tag: "FUTURE", 
      text: "System ready. What are we building next?",
      isQuip: true,
      actions: (
        <div className="cta-group">
          <a href="mailto:david@declared.space" className="cta-btn"><VscMail /> CONTACT_DIRECT</a>

            <button 
                className="cta-btn secondary" 
                onClick={() => { onNavigate?.('passion') }}
            >
                <VscBroadcast /> VIEW_MY_DIGITAL_FOOTPRINT
            </button>   
        </div>
      )
    }
  ];

  return (
    <div className="timeline-parallax-container">
      <div className="parallax-stage">
        {storySteps.map((step, i) => (
          <section key={i} className="timeline-layer" style={getLayerStyle(i)}>
            <div className={`layer-grid ${!step.img ? 'center-content' : ''}`}>
              {step.img && <img src={step.img} alt={step.tag} className={`parallax-img ${step.isGrayscale ? 'grayscale' : ''}`} />}
              <div className="parallax-text">
                <h2 className="layer-tag">// {step.tag}</h2>
                {step.title && <h1>{step.title}</h1>}
                <p className={step.isQuip ? 'large-quip' : ''}>{step.text}</p>
                {step.actions}
              </div>
            </div>
          </section>
        ))}
      </div>
      <div style={{ height: `${storySteps.length * 1500}px` }}></div>
    </div>
  );
}