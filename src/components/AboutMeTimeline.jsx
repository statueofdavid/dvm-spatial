import React, { useEffect, useState } from 'react';
import { VscFilePdf, VscCloudDownload, VscMail, VscBroadcast, VscInfo, VscCompass } from 'react-icons/vsc';
import './AboutMeTimeline.css';

export default function AboutMeTimeline({ lightMode, onNavigate }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const portalArea = document.querySelector('.portal-scroll-area');
    if (!portalArea) return;
    const handleScroll = () => setScrollProgress(portalArea.scrollTop);
    portalArea.addEventListener('scroll', handleScroll);
    return () => portalArea.removeEventListener('scroll', handleScroll);
  }, []);

  const stepHeight = 1500;
  const journeyIndex = 2; 
  const journeyStart = journeyIndex * stepHeight;
  const journeyEnd = (journeyIndex + 1) * stepHeight;

  let panoOpacity = 0;
  if (scrollProgress > journeyStart - 500 && scrollProgress < journeyEnd + 500) {
    if (scrollProgress < journeyStart) panoOpacity = (scrollProgress - (journeyStart - 500)) / 500;
    else if (scrollProgress > journeyEnd) panoOpacity = 1 - (scrollProgress - journeyEnd) / 500;
    else panoOpacity = 1;
  }

  const panProgress = Math.max(0, Math.min(100, ((scrollProgress - journeyStart) / stepHeight) * 100));

  const getHeading = (progress) => {
    if (progress < 25) return "INFRASTRUCTURE";
    if (progress < 50) return "STRATEGY";
    if (progress < 75) return "SYSTEMS";
    return "INTUITION";
  };

  useEffect(() => {
    const activeStepIndex = Math.floor(scrollProgress / stepHeight);
    const activeStep = storySteps[activeStepIndex];
    if (!activeStep?.images || isHovering) return;
    const scrollSensitivity = 100; 
    const newIndex = Math.floor(scrollProgress / scrollSensitivity) % activeStep.images.length;
    setTopIndex(newIndex);
  }, [scrollProgress, isHovering]);

  const getLayerStyle = (index) => {
    const start = index * stepHeight;
    const zPos = (scrollProgress - start) * 1.5;
    let opacity = 0;
    if (zPos >= -1000 && zPos <= 0) opacity = (zPos + 1000) / 1000;
    else if (zPos > 0 && zPos <= 400) opacity = 1;
    else if (zPos > 400 && zPos <= 900) opacity = 1 - (zPos - 400) / 500;

    return {
      transform: `translateZ(${zPos}px)`,
      opacity: Math.max(0, opacity),
      pointerEvents: zPos > -200 && zPos < 600 ? 'auto' : 'none',
      display: opacity <= 0 ? 'none' : 'flex',
      transition: 'opacity 0.2s ease-out'
    };
  };

  const storySteps = [
    { 
      tag: "IDENTITY", 
      title: "DAVID VINCENT MILLER",
      text: "Bridging the Business gaps between the analog and the digital worlds.",
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
      images: [
        { src: "/images/family/amy-estelle-baby-snow.jpg", date: "2023-12-25", type: "JPEG", size: "2.8MB" },
        { src: "/images/family/only-pic-of-jurrand.jpg", date: "2019-05-14", type: "PNG", size: "1.1MB" },
        { src: "/images/family/first-year-as-mother-g.jpeg", date: "2021-05-09", type: "HEIC", size: "3.5MB" },
        { src: "/images/family/estelle-rick-gram-gramps.JPG", date: "2022-08-20", type: "IMG_DATA", size: "5.1MB" },
        { src: "/images/family/steal-a-kiss-wedding.jpg", date: "2023-02-14", type: "DATA_NODE", size: "1.5MB" },
        { src: "/images/family/dad-sean-hike-channels.jpg", date: "2024-06-16", type: "JPEG_HD", size: "2.7MB" }
      ],
      isGrayscale: true 
    },
    { tag: "THE_JOURNEY", text: "A lifetime of variety before the first line of code.", isQuip: true },
    { tag: "BOYS_OF_SUMMER", text: "I knew I wanted to do business out of highschool." },
    { tag: "RETAIL_ERA", text: "Inventory, logistics, and the intuition of service." },
    { tag: "TELCO_DAYS", text: "Pulling cables. Understanding the physical pulse of the net." },
    { tag: "THE_PIVOT", text: "To build the future, I had to master the machine.", isQuip: true },
    { tag: "DISCIPLINE", text: "Architecture, testing, and engineering foundations." },
    { tag: "OPPORTUNITIES", text: "Swisslog // UZURV. Complexity delivered without complication." },
    { 
      tag: "FUTURE", 
      text: "System ready. What are we building next?",
      isQuip: true,
      actions: (
        <div className="cta-group">
          <a href="mailto:david@declared.space" className="cta-btn"><VscMail /> CONTACT_DIRECT</a>
          <button className="cta-btn secondary" onClick={() => { onNavigate?.('passion') }}><VscBroadcast /> VIEW_MY_DIGITAL_FOOTPRINT</button>   
        </div>
      )
    }
  ];

  const activeTopIndex = isHovering ? hoverIndex : topIndex;

  return (
    <div className="timeline-parallax-container">
      <div 
        className="panorama-backdrop"
        style={{
          backgroundImage: `url('/images/mountains/panorama-grayson.jpg')`,
          opacity: panoOpacity,
          backgroundPosition: `${panProgress}% center`,
          pointerEvents: 'none'
        }}
      />

      {panoOpacity > 0.5 && (
        <div className="journey-compass">
          <VscCompass className="compass-icon" style={{ transform: `rotate(${panProgress * 3.6}deg)` }} />
          <div className="compass-data">
            <span className="compass-label">CURRENT_HEADING</span>
            <span className="compass-value">{getHeading(panProgress)}</span>
          </div>
        </div>
      )}

      <div className="parallax-stage">
        {storySteps.map((step, i) => {
          const hasVisuals = step.img || (step.images && step.images.length > 0);
          const stepStart = i * stepHeight;
          const localScroll = Math.max(0, scrollProgress - stepStart);

          return (
            <section key={i} className="timeline-layer" style={getLayerStyle(i)}>
              <div className={`layer-grid ${!hasVisuals ? 'center-content' : ''}`}>
                {hasVisuals && (
                  <div className="visual-slot">
                    {step.img && (
                      <div className="main-photo-wrapper">
                        <img src={step.img} className="main-photo" alt={step.tag} />
                      </div>
                    )}
                    {step.images && (
                      <div className="image-cloud-container">
                        {step.images.map((imgData, idx) => {
                          // VIEWPORT AWARE DRIFT: Drift is relative to local step scroll
                          const driftX = (localScroll * 0.03) * ((idx % 3) - 1);
                          const driftY = (localScroll * 0.02) * ((idx % 2) - 0.5);

                          return (
                            <div 
                              key={idx} 
                              className={`cloud-wrapper ${idx === activeTopIndex ? 'active-layer' : ''}`}
                              onMouseEnter={() => { setHoverIndex(idx); setIsHovering(true); }}
                              onMouseLeave={() => setIsHovering(false)}
                              style={{
                                // Tightened spread math to keep photos within container
                                top: `${((idx * 13) % 40 + 10 + driftY)}%`, 
                                left: `${((idx * 11) % 35 + 5 + driftX)}%`,
                                transform: `rotate(${(idx * 19) % 40 - 20}deg) scale(${idx === activeTopIndex ? 1.15 : 1})`,
                                zIndex: idx === activeTopIndex ? 500 : idx,
                                transition: isHovering ? 'all 0.3s ease-out' : 'all 0.15s linear'
                              }}
                            >
                              <img src={imgData.src} className={`parallax-img cloud-item ${step.isGrayscale ? 'grayscale' : ''}`} alt="Memory" />
                              {isHovering && idx === hoverIndex && (
                                <div className="photo-metadata">
                                  <span className="meta-tag"><VscInfo /> INFO_UPLINK</span>
                                  <div className="meta-grid">
                                    <span>DATE: {imgData.date}</span>
                                    <span>TYPE: {imgData.type}</span>
                                    <span>SIZE: {imgData.size}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
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
      <div style={{ height: `${storySteps.length * 1500}px` }}></div>
    </div>
  );
}