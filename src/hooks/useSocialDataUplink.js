import { useState, useEffect } from 'react';

export function useSocialDataUplink() {
  const [telemetry, setTelemetry] = useState({
    github: { status: 'OFFLINE', code: 0, auth: 'NONE' },
    devto: { status: 'OFFLINE', code: 0, auth: 'NONE' },
    substack: { status: 'OFFLINE', code: 0, auth: 'NONE' },
    isLoading: true
  });

  useEffect(() => {
    async function syncUplink() {
      const results = { isLoading: false };

      // 1. GITHUB UPLINK
      try {
        const ghRes = await fetch('https://api.github.com/users/statueofdavid/events/public');
        // Initialize status based on response
        results.github = { status: ghRes.ok ? 'ONLINE' : 'ERROR', code: ghRes.status, auth: 'PUBLIC_BEARER' };
        
        if (ghRes.ok) {
          const events = await ghRes.json();
          const latest = events.find(e => e.repo) || events[0];
          
          // FIXED: Variable name cannot start with a number
          const rolling24h = new Date(Date.now() - 86400000);
          const vel = events.filter(e => new Date(e.created_at) > rolling24h).length;

          if (latest) {
            const repoRes = await fetch(`https://api.github.com/repos/${latest.repo.name}`);
            const userRes = await fetch(`https://api.github.com/users/statueofdavid`);
            const [repo, user] = await Promise.all([repoRes.json(), userRes.json()]);

            results.github = {
              ...results.github,
              main: latest.payload?.commits?.[0]?.message.toUpperCase() || latest.type.replace('Event', '').toUpperCase(),
              sub: latest.repo.name.split('/')[1].toUpperCase(),
              language: repo.language?.toUpperCase() || 'UNKNOWN',
              stars: repo.stargazers_count || 0,
              velocity: vel,
              repos: user.public_repos || 0,
              age: new Date().getFullYear() - new Date(user.created_at).getFullYear(),
            };
          }
        }
      } catch (e) { results.github = { status: 'ERROR', code: 500, auth: 'FAIL' }; }

      // 2. DEVTO UPLINK
      try {
        const dtRes = await fetch('https://dev.to/api/articles?username=statueofdavid');
        results.devto = { status: dtRes.ok ? 'ONLINE' : 'ERROR', code: dtRes.status, auth: 'PUBLIC_GET' };
        if (dtRes.ok) {
          const posts = await dtRes.json();
          if (posts.length > 0) {
            results.devto = { 
              ...results.devto, 
              main: posts[0].title.toUpperCase(), 
              sub: posts[0].tag_list?.join(' ').toUpperCase() || 'TECHNICAL_ENTRY', 
              meta: posts[0].public_reactions_count 
            };
          }
        }
      } catch (e) { results.devto = { status: 'ERROR', code: 500, auth: 'FAIL' }; }

      // 3. SUBSTACK PROXY UPLINK
      try {
        const ssRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://statueofdavid.substack.com/feed')}`);
        results.substack = { status: ssRes.ok ? 'ONLINE' : 'UNSTABLE', code: ssRes.status, auth: 'CORS_PROXY' };
        if (ssRes.ok) {
          const feed = await ssRes.json();
          results.substack = { 
            ...results.substack, 
            main: feed.items[0]?.title.toUpperCase() || 'LATEST_DISPATCH_ENCRYPTED' 
          };
        }
      } catch (e) { results.substack = { status: 'TIMEOUT', code: 408, auth: 'FAIL' }; }

      setTelemetry(prev => ({ ...prev, ...results }));
    }

    syncUplink();
    const heartbeat = setInterval(syncUplink, 300000);
    return () => clearInterval(heartbeat);
  }, []);

  return telemetry;
}