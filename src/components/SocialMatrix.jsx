import React, { useState, useEffect } from 'react'

const SOCIAL_LINKS = [
  { name: 'GITHUB', url: 'https://github.com/statueofdavid' },
  { name: 'LINKEDIN', url: 'https://linkedin.com/in/dmill' },
  { name: 'SUBSTACK', url: 'https://statueofdavid.substack.com' }, // NEW
  { name: 'X / TWITTER', url: 'https://twitter.com/StatueOfDavid' },
  { name: 'MEDIUM', url: 'https://medium.com/@declaredspace' },
  { name: 'DEV.TO', url: 'https://dev.to/statueofdavid' },
  { name: 'GITLAB', url: 'https://gitlab.com/statueofdavid' },
  { name: 'DUOLINGO', url: 'https://duolingo.com/profile/statueofdavid' },
  { name: 'VENMO', url: 'https://venmo.com/dlibd' },
  { name: 'EMAIL', url: 'mailto:david@declared.space' }
]

export default function SocialMatrix({ lightMode }) {
  const [githubData, setGithubData] = useState({ activity: 'FETCHING_UPLINK...', following: [] });

  useEffect(() => {
    // Free GitHub API Integration
    fetch('https://api.github.com/users/statueofdavid/events/public')
      .then(res => res.json())
      .then(data => {
        if (data[0]) {
          const repoName = data[0].repo.name.split('/')[1].toUpperCase();
          setGithubData(prev => ({ ...prev, activity: `LAST_COMMIT: ${repoName}` }));
        }
      }).catch(() => setGithubData(prev => ({ ...prev, activity: 'UPLINK_OFFLINE' })));
  }, []);

  return (
    <div className="social-matrix-grid">
      <div className="matrix-stat-bar">
        <div className="status-indicator">LIVE_FEED</div>
        <div className="activity-text">{githubData.activity}</div>
      </div>
      
      <div className="links-container">
        {SOCIAL_LINKS.map(link => (
          <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="matrix-link-card">
            <span className="link-name">{link.name}</span>
            <span className="link-arrow">↗</span>
          </a>
        ))}
      </div>

      <style>{`
        .social-matrix-grid { display: flex; flex-direction: column; gap: 20px; margin-top: 20px; }
        .matrix-stat-bar { display: flex; gap: 15px; align-items: center; padding: 12px; border: 1px solid rgba(128,128,128,0.2); border-radius: 4px; font-size: 11px; }
        .status-indicator { color: #00ff00; text-shadow: 0 0 8px #00ff00; animation: blink 2s infinite; }
        
        .links-container { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .matrix-link-card { 
          padding: 18px; border: 1px solid rgba(128,128,128,0.2); border-radius: 4px;
          text-decoration: none; color: inherit; display: flex; justify-content: space-between;
          transition: 0.3s all cubic-bezier(0.16, 1, 0.3, 1); background: rgba(255,255,255,0.02);
        }
        .matrix-link-card:hover { border-color: #ff00ff; background: rgba(255,0,255,0.05); transform: translateY(-3px); }
        .link-name { font-weight: bold; letter-spacing: 1px; font-size: 13px; }
        
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}
