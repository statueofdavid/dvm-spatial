import { useState, useEffect } from 'react';

export function useSocialDataUplink() {
  const [telemetry, setTelemetry] = useState({
    isLoading: true
  });

  // SECURE NODE FACTORY: Standardizes the "Encrypted" narrative for locked signals
  const createLockedNode = (authType, subText, code = 401) => ({
    status: 'LOCKED',
    code: code,
    auth: authType,
    main: 'DATA_STREAM_ENCRYPTED',
    sub: subText
  });

  useEffect(() => {
    async function syncUplink() {
      const results = { isLoading: false };

      // 1. GITHUB UPLINK (LIVE SIGNAL)
      try {
        const ghRes = await fetch('https://api.github.com/users/statueofdavid/events/public');
        results.github = { status: ghRes.ok ? 'ONLINE' : 'ERROR', code: ghRes.status, auth: 'PUBLIC_BEARER' };
        if (ghRes.ok) {
          const events = await ghRes.json();
          const latest = events.find(e => e.repo) || events[0];
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
            };
          }
        }
      } catch (e) { results.github = { status: 'ERROR', code: 500, auth: 'FAIL' }; }

      // 2. DEVTO UPLINK (LIVE SIGNAL)
      try {
        const dtRes = await fetch('https://dev.to/api/articles?username=statueofdavid');
        results.devto = { status: dtRes.ok ? 'ONLINE' : 'ERROR', code: dtRes.status, auth: 'PUBLIC_GET' };
        if (dtRes.ok) {
          const posts = await dtRes.json();
          if (posts.length > 0) {
            results.devto = { 
              ...results.devto, 
              main: posts[0].title.toUpperCase(), 
              sub: posts[0].tag_list?.join(' :: ').toUpperCase() || 'TECHNICAL_ENTRY', 
              meta: posts[0].public_reactions_count 
            };
          }
        }
      } catch (e) { results.devto = { status: 'ERROR', code: 500, auth: 'FAIL' }; }

      // 3. SUBSTACK UPLINK (LIVE FALLBACK)
      const substackUrl = 'https://statueofdavid.substack.com/feed';
      try {
        let ssRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(substackUrl)}`);
        if (!ssRes.ok || ssRes.status === 422) {
          const fallbackRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(substackUrl)}`);
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            const titleMatch = data.contents.match(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/) || 
                               data.contents.match(/<item>[\s\S]*?<title>(.*?)<\/title>/);
            results.substack = { 
              status: 'ONLINE', code: 200, auth: 'FALLBACK_PROXY',
              main: titleMatch ? titleMatch[1].toUpperCase().replace('<![CDATA[', '').replace(']]>', '') : 'LATEST_DISPATCH_ENCRYPTED'
            };
          }
        } else {
          const feed = await ssRes.json();
          results.substack = { status: 'ONLINE', code: 200, auth: 'CORS_PROXY', main: feed.items?.[0]?.title?.toUpperCase() || 'LATEST_DISPATCH_ENCRYPTED' };
        }
      } catch (e) { results.substack = { status: 'OFFLINE', code: 408, auth: 'FAIL' }; }

      // --- TECH ---
      results.gitlab = createLockedNode('SSH_KEY_REQUIRED', 'RSA_4096 // SOURCE_MIRROR_LOCKED');
      results.digitalocean = createLockedNode('API_SECRET_REQUIRED', 'DROPLET_STATUS // ZONE_TRANS_LOCKED');
      results.stackoverflow = createLockedNode('OAUTH_2.0_READ', 'REPUTATION_DATA // SIGNAL_ENCRYPTED');
      results.namecheap = createLockedNode('API_WHITELIST_PENDING', 'DOMAIN_REGISTRY // VAULT_LOCKED');
      results.w3schools = createLockedNode('SESSION_TOKEN', 'LEARNING_PATH // MODULE_ENCRYPTED');

      // --- SOCIAL ---
      results.linkedin = createLockedNode('OAUTH_2.0_REQUIRED', 'MEMBER_PROFILE // HANDSHAKE_PENDING');
      results.twitter = createLockedNode('OAUTH_2.0_PKCE', 'BROADCAST_FEED // RATE_LIMIT_PROTECTION');
      results.instagram = createLockedNode('MFA_CHALLENGE', 'GRAPH_API // 2FA_VAULT_SECURED', 403);
      results.reddit = createLockedNode('OAUTH_2.0_BEARER', 'USER_KARMA // API_V1_ENCRYPTED');
      results.quora = createLockedNode('AUTH_TOKEN_MISSING', 'KNOWLEDGE_CONTRIB // FEED_LOCKED');
      results.meetup = createLockedNode('API_V3_KEY', 'PHYSICAL_SYNC // LOCAL_NETWORK_VAULT');
      results.google = createLockedNode('OAUTH_2.0_READONLY', 'SEARCH_HISTORY // PATTERN_ANALYSIS');
      results.youtube = createLockedNode('API_V3_RESTRICTED', 'CONTENT_CONSUMPTION // ENCRYPTED_VOD');

      // --- GAMES ---
      results.steam = createLockedNode('OPENID_HANDSHAKE', 'LIBRARY_SYNC // DRM_PROTECTION');
      results.epic = createLockedNode('OAUTH_2.0_READ', 'GAME_VAULT // ENTITLEMENT_LOCKED');
      results.twokay = createLockedNode('ACCOUNT_HANDSHAKE', 'PROFILE_SYNC // REGISTRY_LOCKED');
      results.oculus = createLockedNode('MFA_CHALLENGE', 'SPATIAL_IDENTITY // PHONE_SYNC_REQUIRED', 403);
      results.zwift = createLockedNode('FITNESS_AUTH', 'BIOMETRIC_DATA // SIGNAL_ENCRYPTED');

      // --- LEARNING ---
      results.leetcode = createLockedNode('SESSION_TOKEN', 'CODING_METRICS // XP_VAULT_LOCKED');
      results.duolingo = createLockedNode('JWT_AUTHORIZATION', 'XP_STREAM // COGNITIVE_SYNC_PENDING');
      results.monkeytype = createLockedNode('TOKEN_REQUIRED', 'TYPING_VELOCITY // WPM_ENCRYPTED');
      results.codingbat = createLockedNode('LOGIN_REQUIRED', 'LOGIC_PROGRESS // ARCHIVE_LOCKED');

      // --- DONATE ---
      results.venmo = createLockedNode('SECURE_GATEWAY', 'TRANSACTION_VAULT // SSL_LOCKED', 402);

      setTelemetry(prev => ({ ...prev, ...results }));
    }

    syncUplink();
    const heartbeat = setInterval(syncUplink, 300000); // 5 min heartbeat
    return () => clearInterval(heartbeat);
  }, []);

  return telemetry;
}