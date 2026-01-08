import React, { useState, useEffect, useMemo } from 'react'
import { SiGithub, SiLinkedin, SiSubstack, SiX, SiMedium, SiGitlab, SiDuolingo, SiVenmo, SiDevdotto } from 'react-icons/si'
import { HiOutlineMail } from 'react-icons/hi'

export default function SocialMatrix({ lightMode }) {
  const [telemetry, setTelemetry] = useState({
    GITHUB: { action: 'SCANNING', repo: '---', time: 'SYNCING', count: 0, status: '...' },
    SUBSTACK: { action: 'READING', title: 'FETCHING...', time: '---', status: '...' },
    DEVTO: { action: 'INDEXING', title: 'SCRAPING...', time: '---', status: '...' },
    MEDIUM: { action: 'SYNCING', title: 'FETCHING...', time: '---', status: '...' }
  });

  const theme = {
    text: lightMode ? '#1a1a1a' : '#ffffff',
    accent: lightMode ? '#000000' : '#00ffff',
    cardBg: lightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.03)',
    border: lightMode ? 'rgba(0, 0, 0, 0.12)' : 'rgba(128, 128, 128, 0.2)',
    scrollTrack: lightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
  }

  useEffect(() => {
    // 1. GITHUB FETCH
    fetch('https://api.github.com/users/statueofdavid/events/public')
      .then(res => {
        const status = res.status;
        res.json().then(events => {
          const repo = events[0]?.repo.name.split('/')[1].toUpperCase() || 'CORE';
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const count = events.filter(e => new Date(e.created_at) > dayAgo).length;
          setTelemetry(prev => ({ ...prev, GITHUB: { action: 'PUSHING_CODE', repo, time: 'ACTIVE', count, status }}));
        });
      }).catch(() => setTelemetry(prev => ({ ...prev, GITHUB: { ...prev.GITHUB, status: 500 }})));

    // 2. SUBSTACK FETCH (Captures 422 flare)
    const substackUrl = encodeURIComponent('https://statueofdavid.substack.com/feed');
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${substackUrl}`)
      .then(res => {
        const status = res.status;
        res.json().then(feed => {
          const title = feed.items?.[0]?.title.toUpperCase() || 'UPLINK_RESTRICTED';
          setTelemetry(prev => ({ ...prev, SUBSTACK: { action: 'DISPATCHING', title, time: 'STABLE', status }}));
        });
      }).catch(() => setTelemetry(prev => ({ ...prev, SUBSTACK: { ...prev.SUBSTACK, status: 422 }})));

    // 3. DEV.TO FETCH
    fetch('https://dev.to/api/articles?username=statueofdavid')
      .then(res => {
        const status = res.status;
        res.json().then(posts => {
          const title = posts[0]?.title.toUpperCase() || 'NO_POSTS_FOUND';
          setTelemetry(prev => ({ ...prev, DEVTO: { action: 'PUBLISHING', title, time: 'SYNCED', status }}));
        });
      }).catch(() => setTelemetry(prev => ({ ...prev, DEVTO: { ...prev.DEVTO, status: 500 }})));
  }, []);

  // SORTING ENGINE: Prioritizes active/data-heavy cards
  const sortedPlatforms = useMemo(() => {
    const PLATFORMS = [
      { name: 'GITHUB', url: 'https://github.com/statueofdavid', icon: <SiGithub />, data: telemetry.GITHUB, priority: 1 },
      { name: 'SUBSTACK', url: 'https://statueofdavid.substack.com', icon: <SiSubstack />, data: telemetry.SUBSTACK, priority: 1 },
      { name: 'DEV.TO', url: 'https://dev.to/statueofdavid', icon: <SiDevdotto />, data: telemetry.DEVTO, priority: 1 },
      { name: 'LINKEDIN', url: 'https://linkedin.com/in/dmill', icon: <SiLinkedin />, data: { action: 'NETWORKING', note: 'CONNECTIONS_ENCRYPTED', time: 'SECURE', status: 304 }, priority: 0 },
      { name: 'MEDIUM', url: 'https://medium.com/@declaredspace', icon: <SiMedium />, data: telemetry.MEDIUM || { action: 'SYNCING', note: 'INDEX_PENDING', time: '---', status: 102 }, priority: 1 },
      { name: 'X / TWITTER', url: 'https://twitter.com/StatueOfDavid', icon: <SiX />, data: { action: 'BROADCASTING', note: 'UPLINK_DEPRECATED', time: 'ARCHIVED', status: 304 }, priority: 0 },
      { name: 'DUOLINGO', url: 'https://duolingo.com/profile/statueofdavid', icon: <SiDuolingo />, data: { action: 'LEARNING', note: 'LANGUAGE_SYNTHESIS', time: 'STREAKING', status: 200 }, priority: 0 },
      { name: 'VENMO', url: 'https://venmo.com/dlibd', icon: <SiVenmo />, data: { action: 'SUPPORT', note: 'BUY_ME_COFFEE', time: 'SECURE', status: 200 }, priority: 0 },
      { name: 'EMAIL', url: 'mailto:david@declared.space', icon: <HiOutlineMail />, data: { action: 'DIRECT_UPLINK', note: 'ENCRYPTED_CHANNEL', time: 'OPEN', status: 200 }, priority: 0 }
    ];

    return [...PLATFORMS].sort((a, b) => {
      // First sort by Priority
      if (b.priority !== a.priority) return b.priority - a.priority;
      // Then sort by Content Length
      const aLen = (a.data.repo || a.data.title || a.data.note || "").length;
      const bLen = (b.data.repo || b.data.title || b.data.note || "").length;
      return bLen - aLen;
    });
  }, [telemetry]);

  return (
    <div className="telemetry-grid-wrapper">
      <div className="telemetry-scroll-container">
        <div className="telemetry-grid">
          {sortedPlatforms.map(platform => {
            const mainText = platform.data.repo || platform.data.title || platform.data.note || "";
            // HEAVY check: more than 25 chars triggers a wide span
            const isHeavy = mainText.length > 25;

            return (
              <a 
                key={platform.name} 
                href={platform.url} 
                target="_blank" 
                rel="noreferrer" 
                className={`telemetry-card ${isHeavy ? 'heavy' : ''}`}
                style={{ borderColor: theme.border, backgroundColor: theme.cardBg, color: theme.text }}
              >
                <div className="telemetry-header">
                  <div className="telemetry-icon-pulse" style={{ color: theme.accent }}>{platform.icon}</div>
                  <div className="telemetry-source">
                    <span className="source-label">{platform.name} //</span> {platform.data.action}
                    <div className="status-subtext" style={{ color: theme.accent }}>STATUS: {platform.data.status}</div>
                  </div>
                </div>
                <div className="telemetry-body">
                  <div className="body-main" style={{ color: theme.accent }}>{mainText}</div>
                  <div className="body-footer" style={{ borderTop: `1px solid ${theme.border}` }}>
                    <span>{platform.data.time}</span>
                    {platform.data.count !== undefined && <span className="velocity">VELOCITY: {platform.data.count}</span>}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <style>{`
        .telemetry-grid-wrapper { height: 100%; position: relative; margin-top: 20px; width: 100%; overflow: hidden; }
        
        .telemetry-scroll-container { 
          max-height: 60vh; overflow-y: auto; overflow-x: hidden; 
          padding-right: 12px; scrollbar-gutter: stable; 
        }

        .telemetry-scroll-container::-webkit-scrollbar { width: 4px; }
        .telemetry-scroll-container::-webkit-scrollbar-track { background: ${theme.scrollTrack}; }
        .telemetry-scroll-container::-webkit-scrollbar-thumb { background: ${theme.accent}; border-radius: 2px; }

        .telemetry-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); 
          gap: 12px; width: 100%; grid-auto-flow: dense;
        }

        .telemetry-card { 
          text-decoration: none; padding: 16px; border: 1px solid; border-radius: 4px; 
          display: flex; flex-direction: column; gap: 12px; transition: 0.2s all ease-out; 
          background: ${theme.cardBg}; min-height: 110px;
        }
        
        .telemetry-card:hover { 
          border-color: ${theme.accent}; transform: translateY(-2px); 
          background: ${lightMode ? 'rgba(0,0,0,0.06)' : 'rgba(0,255,255,0.08)'};
        }

        /* HEAVY TILE: Desktop Spanning */
        @media (min-width: 1024px) {
          .telemetry-card.heavy { grid-column: span 2; }
        }

        .telemetry-header { display: flex; align-items: center; gap: 12px; }
        .telemetry-icon-pulse { font-size: 20px; animation: breathe 3s infinite ease-in-out; display: flex; }
        .telemetry-source { font-family: 'monospace'; font-size: 9px; line-height: 1.2; }
        .source-label { opacity: 0.5; }
        .status-subtext { font-size: 7px; margin-top: 2px; font-weight: bold; opacity: 0.7; }

        .telemetry-body { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .body-main { 
          font-family: 'monospace'; font-size: 11px; font-weight: bold; 
          white-space: normal; overflow-wrap: break-word; line-height: 1.4;
        }
        
        .body-footer { display: flex; justify-content: space-between; font-size: 7px; font-family: 'monospace'; opacity: 0.4; padding-top: 8px; margin-top: auto; }
        @keyframes breathe { 0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 1px currentColor); } 50% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); } }
      `}</style>
    </div>
  )
}