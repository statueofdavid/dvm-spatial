import { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';

export interface TelemetryNode {
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'LOCKED';
  code: number;
  auth: string;
  main?: string;
  sub?: string;
  language?: string;
  stars?: number;
  velocity?: number;
  repos?: number;
  meta?: number;
}

export type TelemetryState = {
  isLoading: boolean;
} & Record<string, TelemetryNode | boolean | undefined>;

export function useSocialDataUplink(): TelemetryState {
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    isLoading: true
  });

  const createLockedNode = (authType: string, subText: string, code = 401): TelemetryNode => ({
    status: 'LOCKED',
    code,
    auth: authType,
    main: 'DATA_STREAM_ENCRYPTED',
    sub: subText
  });

  useEffect(() => {
    async function syncUplink(): Promise<void> {
      const results: Record<string, TelemetryNode> = {};

      // 1. GITHUB UPLINK
      try {
        const ghRes = await fetch('https://api.github.com/users/statueofdavid/events/public');
        results.github = { status: ghRes.ok ? 'ONLINE' : 'ERROR', code: ghRes.status, auth: 'PUBLIC_BEARER' };
        if (ghRes.ok) {
          const events = await ghRes.json();
          const latest = events.find((e: { repo?: unknown }) => e.repo) || events[0];
          const rolling24h = new Date(Date.now() - 86400000);
          const vel = events.filter((e: { created_at: string }) => new Date(e.created_at) > rolling24h).length;
          if (latest) {
            const repoRes = await fetch(`https://api.github.com/repos/${latest.repo.name}`);
            const userRes = await fetch(`https://api.github.com/users/statueofdavid`);
            const [repo, user] = await Promise.all([repoRes.json(), userRes.json()]);
            results.github = {
              ...results.github,
              main: latest.payload?.commits?.[0]?.message?.toUpperCase() || latest.type.replace('Event', '').toUpperCase(),
              sub: latest.repo.name.split('/')[1]?.toUpperCase(),
              language: repo.language?.toUpperCase() || 'UNKNOWN',
              stars: repo.stargazers_count || 0,
              velocity: vel,
              repos: user.public_repos || 0,
            };
          }
        }
      } catch {
        results.github = { status: 'ERROR', code: 500, auth: 'FAIL' };
      }

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
              sub: posts[0].tag_list?.join(' :: ').toUpperCase() || 'TECHNICAL_ENTRY', 
              meta: posts[0].public_reactions_count 
            };
          }
        }
      } catch {
        results.devto = { status: 'ERROR', code: 500, auth: 'FAIL' };
      }

      // 3. SUBSTACK UPLINK
      const substackUrl = 'https://statueofdavid.substack.com/feed';
      try {
        const ssRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(substackUrl)}`);
        if (!ssRes.ok || ssRes.status === 422) {
          const fallbackRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(substackUrl)}`);
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            const titleMatch = (data.contents as string).match(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/) || 
                               (data.contents as string).match(/<item>[\s\S]*?<title>(.*?)<\/title>/);
            results.substack = { 
              status: 'ONLINE', 
              code: 200, 
              auth: 'FALLBACK_PROXY',
              main: titleMatch ? titleMatch[1].toUpperCase().replace('<![CDATA[', '').replace(']]>', '') : 'LATEST_DISPATCH_ENCRYPTED'
            };
          }
        } else {
          const feed = await ssRes.json();
          results.substack = { 
            status: 'ONLINE', 
            code: 200, 
            auth: 'CORS_PROXY', 
            main: feed.items?.[0]?.title?.toUpperCase() || 'LATEST_DISPATCH_ENCRYPTED' 
          };
        }
      } catch {
        results.substack = { status: 'OFFLINE', code: 408, auth: 'FAIL' };
      }

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

      setTelemetry(prev => ({ ...prev, ...results, isLoading: false }));
    }

    void syncUplink();
    const heartbeat = setInterval(syncUplink, 300000);
    return () => clearInterval(heartbeat);
  }, []);

  useEffect(() => {
    if (telemetry.isLoading) return; 

    const offlineNodes = Object.entries(telemetry).filter(([key, data]) => 
      key !== 'isLoading' && typeof data === 'object' && data?.status !== 'ONLINE'
    );
    
    if (offlineNodes.length > 0) {
      logger.warn(`TELEMETRY_PARTIAL_OFFLINE`, { count: offlineNodes.length, nodes: offlineNodes.map(n => n[0]) });
    } else {
      logger.debug(`TELEMETRY_UPLINK_STABLE`);
    }
  }, [telemetry]);

  return telemetry; 
}