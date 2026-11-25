// src/components/Social/SocialMatrix.tsx
import React, { useState } from 'react';
import { VscRepo, VscStarFull, VscHistory, VscCircleFilled, VscLock, VscCheck } from "react-icons/vsc";
import { useSocialDataUplink, TelemetryNode } from './useSocialDataUplink'; 
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
import { TbBrandZwift } from "react-icons/tb";

const IconMap: Record<string, React.ReactNode> = {
  github: <SiGithub />,
  gitlab: <SiGitlab />, 
  digitalocean: <SiDigitalocean />,
  leetcode: <SiLeetcode />,
  namecheap: <SiNamecheap />,
  devto: <SiDevdotto />,
  stackoverflow: <SiStackoverflow />,
  linkedin: <SiLinkedin />,
  twitter: <SiX />,
  substack: <SiSubstack />,
  reddit: <SiReddit />,
  medium: <SiMedium />,
  meetup: <SiMeetup />,
  steam: <SiSteam />,
  epic: <SiEpicgames />,
  zwift: <TbBrandZwift />,
  duolingo: <SiDuolingo />,
  monkeytype: <SiMonkeytype />,
  venmo: <SiVenmo />,
};

interface SocialMatrixProps {
  lightMode: boolean;
}

const DEFAULT_NODE: TelemetryNode = { 
  status: 'OFFLINE', 
  code: 0, 
  auth: 'NONE', 
  main: 'UPLINK_CONNECTING...', 
  sub: '' 
};

export default function SocialMatrix({ lightMode }: SocialMatrixProps): React.JSX.Element {
  const telemetry = useSocialDataUplink();
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const processedTiles = useFilteredTiles(activeFilter, telemetry);

  const theme = { 
    cardBg: lightMode ? colors.light.surface : colors.dark.surface, 
    border: lightMode ? colors.light.border : colors.dark.border, 
    accent: lightMode ? colors.light.text : colors.cyberCyan 
  };

  return (
    <div className="bento-wrapper">
      <nav className="matrix-filters">
        {['ALL', 'SOCIAL', 'TECH', 'GAMES', 'LEARNING', 'DONATE'].map((cat) => (
          <button 
            key={cat} 
            type="button"
            onClick={() => setActiveFilter(cat)} 
            className={activeFilter === cat ? 'active' : ''}
          >
            {cat}
          </button>
        ))}
      </nav>

      <div className="bento-grid">
        {processedTiles.map((tile: { id: string; url: string; iconName: string; name: string }) => {
          const rawNode = telemetry[tile.id];
          const liveData: TelemetryNode = (typeof rawNode === 'object' && rawNode !== null) 
            ? (rawNode as TelemetryNode) 
            : DEFAULT_NODE;

          const isLocked = liveData.status === 'LOCKED';

          return (
            <a 
              key={tile.id} 
              href={tile.url} 
              target="_blank" 
              rel="noreferrer" 
              className={`bento-tile ${isLocked ? 'tile-locked' : ''}`} 
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            >
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
                    <div className="gh-identity-row">
                      <div className="gh-repo-main">
                        <VscRepo className="gh-repo-icon" />
                        <span className="gh-repo-name">{liveData.sub}</span>
                      </div>
                      <span className="gh-privacy-tag">PUBLIC</span>
                    </div>

                    <div className="gh-commit-row">
                      <VscHistory className="gh-history-icon" />
                      <span className="gh-commit-msg">{liveData.main}</span>
                    </div>

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