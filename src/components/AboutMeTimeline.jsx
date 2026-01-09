import React, { useEffect, useState } from 'react';
import { VscFilePdf, VscCloudDownload, VscMail, VscBroadcast } from 'react-icons/vsc';
import './AboutMeTimeline.css';

export default function AboutMeTimeline({ lightMode }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const portalArea = document.querySelector('.portal-scroll-area');
    if (!portalArea) return;
    const handleScroll = () => setScrollProgress(portalArea.scrollTop);
    portalArea.addEventListener('scroll', handleScroll);
    return () => portalArea.removeEventListener('scroll', handleScroll);
  }, []);

  const getLayerStyle = (index) => {
    const spacing = 1500; // Space between story beats
    const start = index * spacing;
    
    // Math: Start at -3000px (far away) and move to 1000px (past camera)
    // As scrollProgress increases, the layer moves forward.
    const zPos = (scrollProgress - start) * 1.5;
    
    // Opacity: Fade in as it gets closer, fade out as it passes camera
    let opacity = 1;
    if (zPos > 800) {
      opacity = 1 - (zPos - 800) / 600; // Fade out as it flies past
    } else if (zPos < -1000) {
      opacity = 1 - (Math.abs(zPos) - 1000) / 1000; // Fade in from distance
    }

    return {
      transform: `translateZ(${zPos}px)`,
      opacity: Math.max(0, opacity),
      // Only allow clicks/interactions when the layer is near the "reading plane"
      pointerEvents: zPos > -200 && zPos < 800 ? 'auto' : 'none',
      display: opacity <= 0 ? 'none' : 'flex',
      transition: 'opacity 0.3s ease-out'
    };
  };

  return (
    <div className="timeline-parallax-container">
      <div className="parallax-stage">
        
        {/* 1. PRESENT & RESUME */}
        <section className="timeline-layer" style={getLayerStyle(0)}>
          <div className="layer-grid">
            <img src="/images/dvm-profile-pic.jpg" alt="DVM" className="parallax-img" />
            <div className="parallax-text">
              <h2 className="layer-tag">// IDENTITY_CORE</h2>
              <h1>DAVID VINCENT MILLER</h1>
              <p>Software Engineer bridging analog, digital, and business needs.</p>
              <div className="resume-actions">
                <a href="/dvm-resume.pdf" target="_blank" className="resume-btn"><VscFilePdf /> VIEW_RESUME</a>
                <a href="/dvm-resume.pdf" download className="resume-btn secondary"><VscCloudDownload /> DOWNLOAD</a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. VALUES & CLOSEUP */}
        <section className="timeline-layer" style={getLayerStyle(1)}>
          <div className="layer-grid">
            <img src="/images/dvm-profile-closeup-pic.jpg" alt="DVM Close" className="parallax-img grayscale" />
            <div className="parallax-text">
              <h2 className="layer-tag">// CORE_VALUES</h2>
              <p>My family and friends are what matter to me, in that order.</p>
            </div>
          </div>
        </section>

        {/* 3. BREADTH TEASER */}
        <section className="timeline-layer" style={getLayerStyle(2)}>
          <div className="parallax-text center">
            <h2 className="layer-tag">// THE_UNEXPECTED_JOURNEY</h2>
            <p className="teaser-text">Building digital experiences was the destination, but the road was long and varied.</p>
          </div>
        </section>

        {/* 4. RETAIL BEGINNINGS */}
        <section className="timeline-layer" style={getLayerStyle(3)}>
          <div className="parallax-text">
            <h2 className="layer-tag">// ORIGIN_STORY</h2>
            <p>Post-high school: Stepping into the fast-paced world of retail. Learning how business moves on the ground level.</p>
          </div>
        </section>

        {/* 5. RETAIL CAREER */}
        <section className="timeline-layer" style={getLayerStyle(4)}>
          <div className="parallax-text">
            <h2 className="layer-tag">// MANAGEMENT_LOG</h2>
            <p>Years spent across multiple companies, mastering inventory, logistics, and the human element of retail operations.</p>
          </div>
        </section>

        {/* 6. CONNEXION TECHNOLOGIES */}
        <section className="timeline-layer" style={getLayerStyle(5)}>
          <div className="parallax-text">
            <h2 className="layer-tag">// INFRASTRUCTURE_PIVOT</h2>
            <p>Entering Connexion Technologies. Moving into telecommunications and learning the physical foundations of connectivity.</p>
          </div>
        </section>

        {/* 7. THE REALIZATION */}
        <section className="timeline-layer" style={getLayerStyle(6)}>
          <div className="parallax-text center">
            <h2 className="layer-tag">// COMPUTING_REALIZED</h2>
            <p>I realized that to build the future, I had to master the machine. That meant going back to school.</p>
          </div>
        </section>

        {/* 8. COLLEGE */}
        <section className="timeline-layer" style={getLayerStyle(7)}>
          <div className="parallax-text">
            <h2 className="layer-tag">// ACADEMIC_UPLINK</h2>
            <p>Deep dive into software architecture and engineering foundations. Converting years of business experience into code.</p>
          </div>
        </section>

        {/* 9. ENTERPRISE (SWISSLOG / UZURV) */}
        <section className="timeline-layer" style={getLayerStyle(8)}>
          <div className="parallax-text">
            <h2 className="layer-tag">// PROFESSIONAL_LOG</h2>
            <h3>Swisslog // UZURV</h3>
            <p>Delivering complex projects without complication. Automating workflows and streamlining enterprise delivery.</p>
          </div>
        </section>

        {/* 10. FINALE */}
        <section className="timeline-layer" style={getLayerStyle(9)}>
          <div className="parallax-text center">
            <h2 className="layer-tag">// SYSTEM_SYNC</h2>
            <p>The loop is complete. Ready for the next challenge.</p>
            <div className="cta-group">
               <a href="mailto:david@declared.space" className="cta-btn"><VscMail /> CONTACT_DIRECT</a>
            </div>
          </div>
        </section>

      </div>
      <div style={{ height: '15000px' }}></div> 
    </div>
  );
}