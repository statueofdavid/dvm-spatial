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
    const spacing = 1500; // Keep this spacing
    const start = index * spacing;
    const zPos = (scrollProgress - start) * 1.5;
    
    let opacity = 0;

    // FADE IN: Layer emerges from the distance
    if (zPos >= -1000 && zPos <= 0) {
      opacity = (zPos + 1000) / 1000;
    } 
    // ACTIVE ZONE: Fully visible while in front of the camera
    else if (zPos > 0 && zPos <= 400) {
      opacity = 1;
    } 
    // FADE OUT: Tightened exit so it clears before the next step arrives
    else if (zPos > 400 && zPos <= 900) {
      opacity = 1 - (zPos - 400) / 500; // Vanishes over 500px instead of 600px
    }

    return {
      transform: `translateZ(${zPos}px)`,
      opacity: Math.max(0, opacity),
      pointerEvents: zPos > -200 && zPos < 600 ? 'auto' : 'none',
      // 'display: none' ensures the invisible layers don't eat performance
      display: opacity <= 0 ? 'none' : 'flex',
      transition: 'opacity 0.2s ease-out'
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
      images: ["/images/dvm-profile-closeup-pic.jpg", 
        "/images/family/amy-estelle-baby-snow.jpg", "/images/family/only-pic-of-jurrandjpg", 
        "/images/family/first-year-as-mother-g.jpeg", "/images/family/estelle-rick-gram-gramps.JPG", 
        "/images/family/greg-dan-amy-fish.jpg", "/images/family/dfrey-wedding.jpg", "/images/family/fam-selfie-2021.jpg",
        "/images/family/lildavid-mom.jpg", "/images/family/firstfamall.jpg", "/images/family/prom-david-mom.jpg", "/images/family/don-me-wedding.jpg",
        "/images/family/steal-a-kiss.jpg", "/images/family/dad-shirt.jpg"],
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
      {storySteps.map((step, i) => {
        // Standardize: Does this step have any visual media?
        const hasVisuals = step.img || (step.images && step.images.length > 0);
        
        return (
          <section key={i} className="timeline-layer" style={getLayerStyle(i)}>
            {/* The 'center-content' class kicks in only if NO visuals exist */}
            <div className={`layer-grid ${!hasVisuals ? 'center-content' : ''}`}>
              
              {/* VISUAL SLOT: Keeps the image area stable during fly-throughs */}
              {hasVisuals && (
                <div className="visual-slot">
                  {/* Single Image Support (e.g., Slide 0) */}
                  {step.img && (
                    <img 
                      src={step.img} 
                      className={`parallax-img main-photo ${step.isGrayscale ? 'grayscale' : ''}`} 
                      alt={step.tag} 
                    />
                  )}

                  {/* Multi-Image Cloud Support (e.g., Priorities Slide) */}
                  {step.images && (
                    <div className={step.images.length > 5 ? "image-cloud-container" : "image-stack"}>
                      {step.images.map((imgSrc, idx) => (
                        <img 
                          key={idx} 
                          src={imgSrc} 
                          style={{
                            /* Deterministic scatter: staggered but stable on scroll */
                            top: `${(idx * 17) % 70 - 15}%`, 
                            left: `${(idx * 23) % 80 - 40}%`,
                            transform: `rotate(${(idx * 11) % 20 - 10}deg) translateZ(${idx * 12}px)`,
                            zIndex: idx
                          }}
                          className={`parallax-img cloud-item ${step.isGrayscale ? 'grayscale' : ''}`} 
                          alt="Memory Artifact"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="parallax-text">
                <h2 className="layer-tag">// {step.tag}</h2>
                {step.title && <h1>{step.title}</h1>}
                <p className={step.isQuip ? 'large-quip' : ''}>{step.text}</p>
                {step.actions}
              </div>
            </div>
          </section>
        );
      })}
    </div>
    {/* Total scroll length based on 10 steps x 1500px spacing */}
    <div style={{ height: `${storySteps.length * 1500}px` }}></div>
  </div>
);

}