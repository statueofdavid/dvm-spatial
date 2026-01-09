import React from 'react';
import { SiGithub, SiSubstack, SiDevdotto, SiLinkedin, SiMedium } from 'react-icons/si';
import { VscRepo, VscStarFull, VscHistory, VscCircleFilled, VscSymbolEvent } from "react-icons/vsc";
import { useSocialDataUplink } from '../hooks/useSocialDataUplink'; 

export default function SocialMatrix({ lightMode }) {
  const telemetry = useSocialDataUplink();

  const theme = {
    cardBg: lightMode ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
    border: lightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    accent: lightMode ? '#000' : '#00ffff',
    ghYellow: '#f1e05a', 
    dtPulse: '#32ffce'
  };

  // EQUALIZED TILE SIZES: Normalize GH and Dev.to to 'large' to eliminate stretch
  const tiles = [
    { id: 'github', name: 'GITHUB', icon: <SiGithub />, size: 'large', url: 'https://github.com/statueofdavid' },
    { id: 'devto', name: 'DEV.TO', icon: <SiDevdotto />, size: 'large', url: 'https://dev.to/statueofdavid' },
    { id: 'substack', name: 'SUBSTACK', icon: <SiSubstack />, size: 'tall', url: 'https://statueofdavid.substack.com' },
    { id: 'linkedin', name: 'LINKEDIN', icon: <SiLinkedin />, size: 'small', url: 'https://linkedin.com/in/dmill' },
    { id: 'medium', name: 'MEDIUM', icon: <SiMedium />, size: 'small', url: 'https://medium.com/@declaredspace' },
  ];

  return (
    <div className="bento-wrapper">
      <div className="bento-grid">
        {tiles.map(tile => {
          const liveData = telemetry[tile.id] || { status: 'OFFLINE', code: 0, auth: 'NONE' };
          
          return (
            <a key={tile.id} href={tile.url} target="_blank" rel="noreferrer" 
               className={`bento-tile tile-${tile.id} tile-${tile.size}`} 
               style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
              
              <div className="tile-header">
                <span className="tile-icon" style={{ color: theme.accent }}>{tile.icon}</span>
                <div className="tile-label">
                  <span className="label-name">{tile.name}</span>
                  <span className="label-status">// HTTP_STATUS_{liveData.code}</span>
                </div>
              </div>

              <div className="tile-body">
                {/* GITHUB NATIVE VIBE */}
                {tile.id === 'github' && liveData.status === 'ONLINE' ? (
                  <div className="github-native-content">
                    <div className="gh-repo-header">
                      <VscRepo className="gh-repo-icon" />
                      <span className="gh-repo-name">{liveData.sub}</span>
                      <span className="gh-visibility-pill">{liveData.visibility || 'PUBLIC'}</span>
                    </div>
                    
                    <div className="gh-main-commit">
                      <VscHistory className="gh-commit-icon" />
                      {liveData.main}
                    </div>

                    <div className="gh-stats-bar">
                      <span className="gh-stat-item"><VscCircleFilled style={{ color: theme.ghYellow }} /> {liveData.language}</span>
                      <span className="gh-stat-item"><VscStarFull /> {liveData.stars}</span>
                      <span className="gh-stat-item">VEL: {liveData.velocity}</span>
                      <span className="gh-stat-item">REPOS: {liveData.repos}</span>
                    </div>
                  </div>
                ) : tile.id === 'devto' && liveData.status === 'ONLINE' ? (
                  /* DEV.TO PULSE */
                  <div className="devto-native-content">
                    <div className="dt-title">{liveData.main}</div>
                    <div className="dt-tags">{liveData.sub}</div>
                    <div className="dt-stats">
                      <span className="dt-stat-item" style={{ color: theme.dtPulse }}>REACTIONS: {liveData.meta}</span>
                    </div>
                  </div>
                ) : (
                  <div className="main-text">{liveData.main || 'UPLINK_CONNECTING...'}</div>
                )}
                
                {tile.id !== 'github' && tile.id !== 'devto' && <div className="sub-text">{liveData.sub}</div>}
              </div>

              <div className="tile-footer">
                <span>AUTH_MODE: {liveData.auth}</span>
                <span>AVAILABILITY_STATE: {liveData.status}</span>
              </div>
            </a>
          );
        })}
      </div>

      <style>{`
        /* WRAPPER: Centers content and prevents right clipping */
        .bento-wrapper { width: 95%; max-width: 1400px; margin: 0 auto; padding: 40px 0; box-sizing: border-box; }

        /* GRID: Standardized columns for density */
        .bento-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); 
          grid-auto-rows: minmax(300px, auto); 
          gap: 24px; 
          width: 100%;
        }

        .bento-tile { 
          text-decoration: none; padding: 32px; border: 1px solid; color: inherit; 
          display: flex; flex-direction: column; justify-content: space-between; 
          transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative; overflow: hidden; 
        }

        .bento-tile:hover { transform: translateY(-8px); border-color: ${theme.accent}; }

        /* Sizing Logic */
        .tile-large { grid-column: span 1; } 
        .tile-tall { grid-row: span 2; }

        .tile-header { display: flex; align-items: center; gap: 15px; }
        .tile-icon { font-size: 32px; }
        .tile-label { font-family: 'monospace'; font-size: 10px; display: flex; flex-direction: column; }
        .label-name { font-weight: 900; letter-spacing: 1px; }

        /* GITHUB VIBE */
        .github-native-content { display: flex; flex-direction: column; gap: 15px; margin: 20px 0; }
        .gh-repo-header { display: flex; align-items: center; gap: 8px; font-family: 'monospace'; }
        .gh-repo-icon { font-size: 18px; opacity: 0.6; }
        .gh-repo-name { font-size: 18px; font-weight: 700; color: ${theme.accent}; }
        .gh-visibility-pill { font-size: 9px; padding: 2px 8px; border: 1px solid ${theme.border}; border-radius: 20px; opacity: 0.5; }
        .gh-main-commit { font-family: 'monospace'; font-size: 14px; opacity: 0.8; display: flex; align-items: center; gap: 10px; line-height: 1.4; }
        .gh-commit-icon { min-width: 16px; opacity: 0.3; }
        .gh-stats-bar { display: flex; gap: 15px; flex-wrap: wrap; font-family: 'monospace'; font-size: 10px; opacity: 0.6; }
        .gh-stat-item { display: flex; align-items: center; gap: 5px; }

        /* DEV.TO VIBE */
        .devto-native-content { display: flex; flex-direction: column; gap: 12px; margin: 20px 0; }
        .dt-title { font-family: 'monospace'; font-size: 17px; font-weight: 800; line-height: 1.2; text-transform: uppercase; }
        .dt-tags { font-family: 'monospace'; font-size: 9px; opacity: 0.4; letter-spacing: 1px; }
        .dt-stats { font-family: 'monospace'; font-size: 10px; font-weight: bold; }

        .main-text { font-family: 'monospace'; font-size: 18px; font-weight: 800; line-height: 1.2; text-transform: uppercase; margin: 20px 0; }
        .sub-text { font-family: 'monospace'; font-size: 10px; opacity: 0.5; margin-top: 10px; }
        .tile-footer { display: flex; justify-content: space-between; font-family: 'monospace'; font-size: 8px; opacity: 0.3; border-top: 1px solid ${theme.border}; padding-top: 15px; }

        @media (max-width: 900px) { 
          .bento-grid { grid-template-columns: 1fr; } 
          .tile-tall { grid-row: span 1; }
          .bento-tile { padding: 24px; min-height: 260px; }
        }
      `}</style>
    </div>
  );
}