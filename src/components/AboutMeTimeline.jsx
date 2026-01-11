import React, { useEffect, useState, useRef } from 'react';
import { VscFilePdf, VscCloudDownload, VscMail, VscBroadcast, VscInfo } from 'react-icons/vsc';
import './AboutMeTimeline.css';

export default function AboutMeTimeline({ lightMode, onNavigate }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const portalArea = document.querySelector('.portal-scroll-area');
    if (!portalArea) return;

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrollProgress(portalArea.scrollTop);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    portalArea.addEventListener('scroll', handleScroll, { passive: true });
    return () => portalArea.removeEventListener('scroll', handleScroll);
  }, []);

  const stepHeight = 1600; 
  const focalBuffer = 700; 

  const getLayerStyle = (index, isFinal) => {
    const start = index * stepHeight;
    const relativeScroll = scrollProgress - start;
    let zPos;
    let opacity;

    if (relativeScroll < 0) {
      zPos = relativeScroll * 1.5;
      opacity = Math.max(0, (relativeScroll + 1000) / 1000);
    } else if (relativeScroll >= 0 && relativeScroll <= focalBuffer) {
      zPos = 0; opacity = 1;
    } else {
      const exitScroll = relativeScroll - focalBuffer;
      zPos = isFinal ? 0 : Math.min(exitScroll * 2.5, 900); 
      opacity = isFinal ? 1 : Math.max(0, 1 - (exitScroll / 600));
    }

    return {
      transform: `translate3d(0, 0, ${zPos}px)`,
      opacity: Math.max(0, opacity),
      visibility: opacity <= 0 ? 'hidden' : 'visible',
      pointerEvents: (opacity > 0.8 && zPos === 0) ? 'auto' : 'none',
      zIndex: 100 - index 
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
          <a href="/dvm-resume.pdf" target="_blank" className="resume-btn" rel="noreferrer"><VscFilePdf /> VIEW_RESUME</a>
          <a href="/dvm-resume.pdf" download className="resume-btn secondary"><VscCloudDownload /> DOWNLOAD</a>
        </div>
      )
    },
    { 
      tag: "PRIORITIES", 
      text: "Family and friends first. Technology as a force for good.",
      images: [
        { src: "/images/family/amy-estelle-baby-snow.jpg", date: "2023-12-25" },
        { src: "/images/family/dad-shirt.jpg", date: "2022-06-15" },
        { src: "/images/family/dfrey-wedding.jpg", date: "2021-09-10" },
        { src: "/images/family/don-me-wedding.jpg", date: "2018-05-20" },
        { src: "/images/family/estelle-rick-gramps.JPG", date: "2022-08-20" },
        { src: "/images/family/fam-selfie-2021.jpg", date: "2021-07-04" },
        { src: "/images/family/first-year-as-mother-g.jpeg", date: "2021-05-09" },
        { src: "/images/family/firstfamall.jpg", date: "2017-11-23" },
        { src: "/images/family/greg-dan-amy-fish.jpg", date: "2023-04-12" },
        { src: "/images/family/kids-me-ola.jpg", date: "2020-10-31" },
        { src: "/images/family/svt-friends.jpg", date: "2019-12-31" },
        { src: "/images/family/lildavid-mom.jpg", date: "1995-05-14" },
        { src: "/images/family/only-pic-of-jurrand.jpg", date: "2019-05-14" },
        { src: "/images/family/tia-sean-baby.JPG", date: "2022-03-12" },
        { src: "/images/family/nanny-sean-baby.JPG", date: "2022-03-15" },
        { src: "/images/family/prom-david-mom.jpg", date: "2006-05-10" },
        { src: "/images/family/adam-me-mtn-trip.jpg", date: "2024-01-20" },
        { src: "/images/family/pops-dad-me-computer.jpg", date: "2000-08-15" },
        { src: "/images/family/miller-fam-din-tx.jpg", date: "2023-10-12" },
        { src: "/images/family/dad-motor-bike-txoma.jpg", date: "2022-09-05" },
        { src: "/images/family/dad-me-hike.jpg", date: "2023-05-20" },
        { src: "/images/family/dad-channels.jpg", date: "2024-06-16" },
        { src: "/images/family/dad-sean-hike-channels.jpg", date: "2024-06-16" },
        { src: "/images/family/estelle-me-hike.jpg", date: "2024-04-10" },
        { src: "/images/family/sean-estelle-snowman.jpg", date: "2024-01-15" },
        { src: "/images/family/steal-a-kiss-wedding.jpg", date: "2023-02-14" }
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
      tag: "FUTURE", text: "System ready. What are we building next?", isQuip: true, isFinal: true,
      actions: (
        <div className="cta-group">
          <a href="mailto:david@declared.space" className="cta-btn primary-cta"><VscMail /> CONTACT_DIRECT</a>
          <button className="cta-btn secondary-cta" onClick={() => onNavigate?.('passion')}><VscBroadcast /> SOCIAL_MATRIX</button>   
        </div>
      )
    }
  ];

  useEffect(() => {
    const activeStepIndex = Math.floor(scrollProgress / stepHeight);
    const activeStep = storySteps[activeStepIndex];
    if (!activeStep?.images || isHovering) return;
    setTopIndex(Math.floor(scrollProgress / 60) % activeStep.images.length);
  }, [scrollProgress, isHovering]);

  // PANORAMA ENGINE (Step 3: Left to Right)
  const journeyStart = 2 * stepHeight;
  const journeyEnd = 3 * stepHeight;
  let panoOpacity = 0;
  if (scrollProgress > journeyStart - 800 && scrollProgress < journeyEnd + 800) {
    if (scrollProgress < journeyStart) panoOpacity = (scrollProgress - (journeyStart - 800)) / 800;
    else if (scrollProgress > journeyEnd) panoOpacity = 1 - (scrollProgress - journeyEnd) / 800;
    else panoOpacity = 1;
  }
  const panProgress = Math.max(0, Math.min(100, ((scrollProgress - journeyStart) / stepHeight) * 100));

  return (
    <div className="timeline-parallax-container">
      <div className="panorama-backdrop" style={{ 
        backgroundImage: `url('/images/mountains/panorama-grayson.jpg')`, 
        opacity: panoOpacity, backgroundPosition: `${panProgress}% center` 
      }} />
      <div className="parallax-stage">
        {storySteps.map((step, i) => {
          const activeIndex = isHovering ? hoverIndex : topIndex;
          const localScroll = Math.max(0, scrollProgress - (i * stepHeight));

          return (
            <section key={i} className={`timeline-layer layer-${step.tag.toLowerCase()}`} style={getLayerStyle(i, step.isFinal)}>
              <div className={`layer-grid ${!step.img && (!step.images || step.images.length === 0) ? 'center-content' : ''}`}>
                <div className="visual-slot">
                  {step.img && <img src={step.img} className="main-photo" alt="Identity" />}
                  {step.images && (
                    <div className="image-cloud-container">
                      {step.images.map((imgData, idx) => {
                        // VIEWPORT AWARE DRIFT: Clamped offsets to prevent edge bleed
                        const driftX = Math.min(20, Math.max(-20, (localScroll * 0.12) * ((idx % 5) - 2)));
                        const driftY = Math.min(15, Math.max(-15, (localScroll * 0.08) * ((idx % 3) - 1)));
                        const rotation = (idx * 13) % 40 - 20 + (localScroll * 0.02);

                        return (
                          <div key={idx} className={`cloud-wrapper ${idx === activeIndex ? 'active-layer' : ''}`}
                            onMouseEnter={() => { setHoverIndex(idx); setIsHovering(true); }}
                            onMouseLeave={() => setIsHovering(false)}
                            style={{
                              // POSITION LOCK: Every photo anchored within a 20%-80% horizontal range
                              top: `${(20 + ((idx * 41) % 60) + driftY)}%`, 
                              left: `${(15 + ((idx * 67) % 65) + driftX)}%`,
                              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${idx === activeIndex ? 1.3 : 1})`,
                              zIndex: idx === activeIndex ? 500 : idx,
                            }}
                          >
                            <img src={imgData.src} className={`cloud-item ${step.isGrayscale ? 'grayscale' : ''}`} alt="Memory" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="parallax-text">
                  <h2 className="layer-tag">// {step.tag}</h2>
                  {step.title && <h1>{step.title}</h1>}
                  <p className={step.isQuip ? 'large-quip' : ''}>{step.text}</p>
                  <div className="actions-wrapper">{step.actions}</div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <div style={{ height: `${storySteps.length * stepHeight}px` }}></div>
    </div>
  );
}