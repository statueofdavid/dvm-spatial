import React, { useState } from 'react';
import { VscRepo, VscStarFull, VscHistory, VscCircleFilled, VscLock, VscCheck } from "react-icons/vsc";
import { useSocialDataUplink } from './useSocialDataUplink'; 
import { useFilteredTiles } from './useFilteredTiles';
import { colors } from '../../theme/colors';
import './SocialMatrix.css';
import { 
  SiGithub, SiSubstack, SiDevdotto, SiLinkedin, SiMedium, SiGitlab, 
  SiDuolingo, SiX, SiVenmo, SiReddit, SiSteam, SiEpicgames, 
  SiQuora, SiStackoverflow, SiDigitalocean, SiNamecheap, 
  SiInstagram, SiDribbble, SiLeetcode, SiMeetup, SiGoogle, SiYoutube, 
  SiYoutubemusic, SiMonkeytype 
} from 'react-icons/si';
import { TbBrandZwift } from "react-icons/tb"; // Correct Zwift Export

const IconMap = {
  // --- TECH (Infrastructure & Utility) ---
  'github': <SiGithub />,
  'gitlab': <SiGitlab />, 
  'digitalocean': <SiDigitalocean />,
  'leetcode': <SiLeetcode />,
  'namecheap': <SiNamecheap />,

  // --- SOCIAL (Community & Capital) ---
  'devto': <SiDevdotto />,
  'stackoverflow': <SiStackoverflow />,
  'linkedin': <SiLinkedin />,
  'twitter': <SiX />,
  'substack': <SiSubstack />,
  'reddit': <SiReddit />,
  'medium': <SiMedium />,
  'meetup': <SiMeetup />,
  
  // --- GAMES ---
  'steam': <SiSteam />,
  'epic': <SiEpicgames />,
  'zwift': <TbBrandZwift />,
  
  // --- LEARNING ---
  'duolingo': <SiDuolingo/>,
  'monkeytype': <SiMonkeytype />,
  
  // --- DONATE ---
  'venmo': <SiVenmo />,
};

export default function SocialMatrix({ lightMode }) {
  const telemetry = useSocialDataUplink();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const processedTiles = useFilteredTiles(activeFilter, telemetry);

  const theme = { 
    cardBg: lightMode ? colors.light.surfaceCard : colors.dark.surfaceCard, 
    border: lightMode ? colors.light.borderLight : colors.dark.borderLight, 
    accent: lightMode ? colors.light.text : colors.cyan 
  };

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
                  {IconMap[tile.iconName] || <VscCircleFilled />}
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
                  <>
                    <div className="main-text">{liveData.main || 'UPLINK_CONNECTING...'}</div>
                    <div className="sub-text">{liveData.sub}</div>
                  </>
                )}
              </div>

              <div className="tile-footer">
                <span>{isLocked ? <VscLock /> : <VscCheck />} AUTH: {liveData.auth}</span>
                <span>AVAILABILITY: {liveData.status}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}