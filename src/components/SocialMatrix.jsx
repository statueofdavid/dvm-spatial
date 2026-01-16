import React, { useState, useMemo, useEffect } from 'react';
import { 
  SiGithub, SiSubstack, SiDevdotto, SiLinkedin, SiMedium, SiGitlab, 
  SiDuolingo, SiX, SiVenmo, SiReddit, SiSteam, SiEpicgames, 
  SiQuora, SiStackoverflow, SiDigitalocean, SiNamecheap, 
  SiInstagram, SiDribbble, SiLeetcode, SiMeetup, SiGoogle, SiYoutube, 
  SiYoutubemusic, SiMonkeytype 
} from 'react-icons/si';
import { TbBrandZwift } from "react-icons/tb"; // Correct Zwift Export
import { VscRepo, VscStarFull, VscHistory, VscCircleFilled, VscLock, VscCheck } from "react-icons/vsc";
import { useSocialDataUplink } from '../hooks/useSocialDataUplink'; 

const tiles = [
  // --- TECH (Infrastructure & Utility) ---
  { id: 'github', name: 'GITHUB', icon: <SiGithub />, category: 'Tech', size: 'small', url: 'https://github.com/statueofdavid' },
  { id: 'gitlab', name: 'GITLAB', icon: <SiGitlab />, category: 'Tech', size: 'small', url: 'https://gitlab.com/statueofdavid' },
  { id: 'digitalocean', name: 'DIGITAL_OCEAN', icon: <SiDigitalocean />, category: 'Tech', size: 'small', url: 'https://cloud.digitalocean.com' },
  { id: 'leetcode', name: 'LEETCODE', icon: <SiLeetcode />, category: 'Tech', size: 'small', url: 'https://leetcode.com/statueofdavid' },
  { id: 'namecheap', name: 'NAMECHEAP', icon: <SiNamecheap />, category: 'Tech', size: 'small', url: 'https://namecheap.com' },

  // --- SOCIAL (Community & Capital) ---
  { id: 'devto', name: 'DEV.TO', icon: <SiDevdotto />, category: 'Social', size: 'small', url: 'https://dev.to/statueofdavid' },
  { id: 'stackoverflow', name: 'STACK_OVERFLOW', icon: <SiStackoverflow />, category: 'Social', size: 'small', url: 'https://stackoverflow.com/users/6732430/dvm' },
  { id: 'linkedin', name: 'LINKEDIN', icon: <SiLinkedin />, category: 'Social', size: 'small', url: 'https://linkedin.com/in/dmill' },
  { id: 'twitter', name: 'X_TWITTER', icon: <SiX />, category: 'Social', size: 'small', url: 'https://twitter.com/StatueOfDavid' },
  { id: 'substack', name: 'SUBSTACK', icon: <SiSubstack />, category: 'Social', size: 'small', url: 'https://statueofdavid.substack.com' },
  { id: 'reddit', name: 'REDDIT', icon: <SiReddit />, category: 'Social', size: 'small', url: 'https://www.reddit.com/user/declaredspace/' },
  { id: 'medium', name: 'MEDIUM', icon: <SiMedium />, category: 'Social', size: 'small', url: 'https://medium.com/@declaredspace' },
  { id: 'meetup', name: 'MEETUP', icon: <SiMeetup />, category: 'Social', size: 'small', url: 'https://meetup.com' },
  
  // --- GAMES ---
  { id: 'steam', name: 'STEAM', icon: <SiSteam />, category: 'Games', size: 'small', url: 'https://steamcommunity.com/id/statueofdavid' },
  { id: 'epic', name: 'EPIC_GAMES', icon: <SiEpicgames />, category: 'Games', size: 'small', url: 'https://www.epicgames.com/' },
  { id: 'zwift', name: 'ZWIFT', icon: <TbBrandZwift />, category: 'Games', size: 'small', url: 'https://zwift.com' }, //
  
  // --- LEARNING ---
  { id: 'duolingo', name: 'DUOLINGO', icon: <SiDuolingo />, category: 'Learning', size: 'small', url: 'https://duolingo.com/profile/statueofdavid' },
  { id: 'monkeytype', name: 'MONKEYTYPE', icon: <SiMonkeytype />, category: 'Learning', size: 'small', url: 'https://monkeytype.com' }, //
  
  // --- DONATE ---
  { id: 'venmo', name: 'VENMO', icon: <SiVenmo />, category: 'Donate', size: 'small', url: 'https://venmo.com/dlibd' },
];

export default function SocialMatrix({ lightMode }) {
  const telemetry = useSocialDataUplink();

  useEffect(() => {
    // Check for any "OFFLINE" or "LOCKED" tiles that might indicate an API failure
    const offlineNodes = Object.entries(telemetry).filter(([_, data]) => data.status !== 'ONLINE');
    if (offlineNodes.length > 0) {
      logger.warn(`TELEMETRY_PARTIAL_OFFLINE`, { count: offlineNodes.length, nodes: offlineNodes.map(n => n[0]) });
    } else {
      logger.debug(`TELEMETRY_UPLINK_STABLE`);
    }
  }, [telemetry]);

  const [activeFilter, setActiveFilter] = useState('ALL');

  const theme = {
    cardBg: lightMode ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
    border: lightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    accent: lightMode ? '#000' : '#00ffff'
  };

  const processedTiles = useMemo(() => {
    return [...tiles]
      .filter(t => activeFilter === 'ALL' || t.category.toUpperCase() === activeFilter)
      .sort((a, b) => {
        const statusA = telemetry[a.id]?.status === 'ONLINE' ? 0 : 1;
        const statusB = telemetry[b.id]?.status === 'ONLINE' ? 0 : 1;
        return statusA - statusB;
      });
  }, [telemetry, activeFilter]);

  return (
    <div className="bento-wrapper">
      <nav className="matrix-filters">
        {['ALL', 'SOCIAL', 'TECH', 'GAMES', 'LEARNING', 'DONATE'].map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveFilter(cat)} 
            className={activeFilter === cat ? 'active' : ''}
          >
            {cat}
          </button>
        ))}
      </nav>

      <div className="bento-grid">
        {processedTiles.map(tile => {
          const liveData = telemetry[tile.id] || { status: 'OFFLINE', code: 0, auth: 'NONE' };
          const isLocked = liveData.status === 'LOCKED' || liveData.status === 'ENCRYPTED';

          return (
            <a key={tile.id} href={tile.url} target="_blank" rel="noreferrer" 
               className={`bento-tile ${isLocked ? 'tile-locked' : ''}`} 
               style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
              
              <div className="tile-header">
                <span className="tile-icon" style={{ color: theme.accent }}>
                  {tile.icon || <VscCircleFilled />}
                </span>
                <div className="tile-label">
                  <span className="label-name">{tile.name}</span>
                  <span className="label-status">// HTTP_STATUS_{liveData.code}</span>
                </div>
              </div>

              <div className="tile-body">
                {tile.id === 'github' && liveData.status === 'ONLINE' ? (
                  <div className="github-native-content">
                    {/* Row 1: Identity & Privacy Status */}
                    <div className="gh-identity-row">
                      <div className="gh-repo-main">
                        <VscRepo className="gh-repo-icon" />
                        <span className="gh-repo-name">{liveData.sub}</span>
                      </div>
                      <span className="gh-privacy-tag">PUBLIC</span>
                    </div>

                    {/* Row 2: The Activity Signal */}
                    <div className="gh-commit-row">
                      <VscHistory className="gh-history-icon" />
                      <span className="gh-commit-msg">{liveData.main}</span>
                    </div>

                    {/* Row 3: Technical Metrics (The Gold Standard) */}
                    <div className="gh-metrics-row">
                      <span className="metric-item">
                        <VscCircleFilled style={{ color: '#f1e05a' }} /> {liveData.language || 'JAVASCRIPT'}
                      </span>
                      <span className="metric-item">
                        <VscStarFull /> {liveData.stars || 0}
                      </span>
                      <span className="metric-item">VEL: {liveData.velocity || 0}</span>
                      <span className="metric-item">REPOS: {liveData.repos || 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className="main-text">{liveData.main || 'UPLINK_CONNECTING...'}</div>
                )}
                <div className="sub-text">{liveData.sub}</div>
              </div>

              <div className="tile-footer">
                <span>{isLocked ? <VscLock /> : <VscCheck />} AUTH: {liveData.auth}</span>
                <span>AVAILABILITY: {liveData.status}</span>
              </div>
            </a>
          );
        })}
      </div>

      <style>{`
        .bento-wrapper { width: 95%; max-width: 1400px; margin: 0 auto; padding: 20px 0; }

        /* MOBILE FILTER NAV: Hiding scrollbars for a clean "System" feel */
        .matrix-filters { 
          display: flex; gap: 15px; margin-bottom: 40px; 
          border-bottom: 1px solid ${theme.border}; padding-bottom: 20px; 
          overflow-x: auto; justify-content: flex-start;
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .matrix-filters::-webkit-scrollbar { display: none; } /* Chrome/Safari */

        .matrix-filters button { background: transparent; border: 1px solid transparent; color: inherit; font-family: 'monospace'; font-size: 11px; letter-spacing: 2px; cursor: pointer; padding: 8px 16px; opacity: 0.4; transition: 0.3s; flex-shrink: 0; }
        .matrix-filters button.active { opacity: 1; border-color: ${theme.accent}; color: ${theme.accent}; }

        .bento-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); grid-auto-rows: 300px; gap: 20px; width: 100%; }
        .bento-tile { text-decoration: none; padding: 24px; border: 1px solid; color: inherit; display: flex; flex-direction: column; justify-content: space-between; transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .bento-tile:hover { transform: translateY(-5px); border-color: ${theme.accent}; }

        .tile-locked .main-text { font-size: 16px; color: #ff0055 !important; text-shadow: 0 0 15px rgba(255, 0, 85, 0.4); letter-spacing: 2px; }
        .tile-locked .sub-text { opacity: 0.3; font-style: italic; }

        .tile-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .tile-icon { font-size: 28px; display: flex; align-items: center; justify-content: center; }
        .tile-label { font-family: 'monospace'; font-size: 9px; display: flex; flex-direction: column; }
        .label-name { font-weight: 900; }
        
        .main-text { font-size: 18px; line-height: 1.2; margin: 10px 0; text-transform: uppercase; font-weight: 800; }
        .sub-text { font-family: 'monospace'; font-size: 10px; opacity: 0.5; }
        .tile-footer { display: flex; justify-content: space-between; font-family: 'monospace'; font-size: 8px; opacity: 0.4; border-top: 1px solid ${theme.border}; padding-top: 15px; margin-top: auto; align-items: center; }

        .github-native-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 10px 0;
          gap: 15px; /* Restoring the "breathing room" */
        }

        .gh-identity-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'monospace';
          font-weight: 900;
          letter-spacing: 1px;
        }

        .gh-repo-main { display: flex; align-items: center; gap: 8px; font-size: 16px; }

        .gh-privacy-tag {
          font-size: 9px;
          padding: 2px 8px;
          background: rgba(255,255,255,0.08);
          border-radius: 12px;
          opacity: 0.6;
        }

        .gh-commit-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-family: 'monospace';
          font-size: 13px;
          line-height: 1.4;
          opacity: 0.9;
        }

        .gh-history-icon { margin-top: 3px; opacity: 0.5; }

        .gh-metrics-row {
          margin-top: auto; /* Pushes to bottom */
          display: flex;
          gap: 20px;
          font-family: 'monospace';
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.7;
        }

        .metric-item { display: flex; align-items: center; gap: 5px; }

        @media (max-width: 768px) { .bento-grid { grid-template-columns: 1fr; grid-auto-rows: auto; } }
      `}</style>
    </div>
  );
}