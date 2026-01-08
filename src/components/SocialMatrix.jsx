import React, { useState, useEffect } from 'react'
import { SiGithub, SiLinkedin, SiSubstack, SiX, SiMedium, SiGitlab, SiDuolingo, SiVenmo } from 'react-icons/si'
import { HiOutlineMail } from 'react-icons/hi'

const SOCIAL_LINKS = [
  { name: 'GITHUB', url: 'https://github.com/statueofdavid', icon: <SiGithub /> },
  { name: 'LINKEDIN', url: 'https://linkedin.com/in/dmill', icon: <SiLinkedin /> },
  { name: 'SUBSTACK', url: 'https://statueofdavid.substack.com', icon: <SiSubstack /> },
  { name: 'X / TWITTER', url: 'https://twitter.com/StatueOfDavid', icon: <SiX /> },
  { name: 'MEDIUM', url: 'https://medium.com/@declaredspace', icon: <SiMedium /> },
  { name: 'GITLAB', url: 'https://gitlab.com/statueofdavid', icon: <SiGitlab /> },
  { name: 'DUOLINGO', url: 'https://duolingo.com/profile/statueofdavid', icon: <SiDuolingo /> },
  { name: 'VENMO', url: 'https://venmo.com/dlibd', icon: <SiVenmo /> },
  { name: 'EMAIL', url: 'mailto:david@declared.space', icon: <HiOutlineMail /> }
]

export default function SocialMatrix({ lightMode }) {
  const [telemetry, setTelemetry] = useState({
    source: 'SYSTEM',
    status: 'INITIALIZING_UPLINK',
    action: 'SCANNING_NETWORKS',
    repo: '---',
    timestamp: 'STABLE',
    velocity: 0
  });

  // Dynamic Theme Variables
  const theme = {
    text: lightMode ? '#1a1a1a' : '#ffffff',
    subText: lightMode ? '#555555' : '#aaaaaa',
    accent: '#00ffff', // Neon Cyan remains for brand consistency
    cardBg: lightMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.03)',
    border: lightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(128, 128, 128, 0.2)'
  }

  useEffect(() => {
    const fetchNeuralData = async () => {
      try {
        const response = await fetch('https://api.github.com/users/statueofdavid/events/public');
        if (!response.ok) throw new Error('UPLINK_DENIED');
        const events = await response.json();
        
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentCount = events.filter(e => new Date(e.created_at) > dayAgo).length;
        const primaryEvent = events[0];

        if (primaryEvent) {
          const repoName = primaryEvent.repo.name.split('/')[1].toUpperCase();
          const eventDate = new Date(primaryEvent.created_at);
          const diffHrs = Math.floor((Date.now() - eventDate.getTime()) / (1000 * 60 * 60));
          const timeLabel = diffHrs < 1 ? 'JUST_NOW' : `${diffHrs}H_AGO`;

          let semanticAction = 'OBSERVING';
          switch(primaryEvent.type) {
            case 'PushEvent': semanticAction = 'PUSHING_CODE'; break;
            case 'WatchEvent': semanticAction = 'STARRING_REPO'; break;
            case 'CreateEvent': semanticAction = `CREATING_${primaryEvent.payload.ref_type.toUpperCase()}`; break;
            default: semanticAction = primaryEvent.type.replace('Event', '').toUpperCase();
          }

          setTelemetry({
            source: 'GITHUB',
            status: 'ACTIVE_UPLINK',
            action: semanticAction,
            repo: repoName,
            timestamp: timeLabel,
            velocity: recentCount
          });
        }
      } catch (err) {
        setTelemetry(prev => ({ ...prev, status: 'OFFLINE', action: 'CONNECTION_ENCRYPTED' }));
      }
    };
    fetchNeuralData();
  }, []);

  return (
    <div className={`social-matrix-container ${lightMode ? 'light' : 'dark'}`}>
      {/* HUD Telemetry Bar */}
      <div className="matrix-stat-bar" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1.2fr 1fr', 
        gap: '10px',
        color: theme.text,
        backgroundColor: lightMode ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 255, 255, 0.05)',
        borderColor: lightMode ? 'rgba(0, 200, 200, 0.3)' : 'rgba(0, 255, 255, 0.2)'
      }}>
        <div>
          <span className="blink-dot" /> 
          <span style={{ color: theme.subText }}>{telemetry.source} //</span> {telemetry.action}
          <div style={{ opacity: 0.6, marginTop: '4px', fontSize: '8px' }}>STATUS: {telemetry.status}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>{telemetry.repo} // {telemetry.timestamp}</div>
          <div style={{ opacity: 0.6, marginTop: '4px', fontSize: '8px' }}>VELOCITY: {telemetry.velocity} EVENTS/24H</div>
        </div>
      </div>

      {/* Grid of Links */}
      <div className="links-grid">
        {SOCIAL_LINKS.map(link => (
          <a 
            key={link.name} 
            href={link.url} 
            target="_blank" 
            rel="noreferrer" 
            className="matrix-card"
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.border,
              color: theme.text 
            }}
          >
            <div className="card-content">
              <span className="card-icon" style={{ color: theme.accent }}>{link.icon}</span>
              <span className="card-label">{link.name}</span>
            </div>
            <span style={{ opacity: 0.5 }}>↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}