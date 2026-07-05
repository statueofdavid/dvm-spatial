export interface SocialTile {
  id: string;
  name: string;
  iconName: string;
  category: 'Tech' | 'Social' | 'Games' | 'Learning' | 'Donate';
  size: 'small' | 'large';
  url: string;
}

export const SocialTiles = [
  // --- TECH (Infrastructure & Utility) ---
  { id: 'github', name: 'GITHUB', iconName: 'github', category: 'Tech', size: 'small', url: 'https://github.com/statueofdavid' },
  { id: 'gitlab', name: 'GITLAB', iconName: 'gitlab', category: 'Tech', size: 'small', url: 'https://gitlab.com/statueofdavid' },
  { id: 'digitalocean', name: 'DIGITAL_OCEAN', iconName: 'digitalocean', category: 'Tech', size: 'small', url: 'https://cloud.digitalocean.com' },
  { id: 'leetcode', name: 'LEETCODE', iconName: 'leetcode', category: 'Tech', size: 'small', url: 'https://leetcode.com/statueofdavid' },
  { id: 'namecheap', name: 'NAMECHEAP', iconName: 'namecheap', category: 'Tech', size: 'small', url: 'https://namecheap.com' },

  // --- SOCIAL (Community & Capital) ---
  { id: 'devto', name: 'DEV.TO', iconName: 'devto', category: 'Social', size: 'small', url: 'https://dev.to/statueofdavid' },
  { id: 'stackoverflow', name: 'STACK_OVERFLOW', iconName: 'stackoverflow', category: 'Social', size: 'small', url: 'https://stackoverflow.com/users/6732430/dvm' },
  { id: 'linkedin', name: 'LINKEDIN', iconName: 'linkedin', category: 'Social', size: 'small', url: 'https://linkedin.com/in/dmill' },
  { id: 'twitter', name: 'X_TWITTER', iconName: 'twitter', category: 'Social', size: 'small', url: 'https://twitter.com/StatueOfDavid' },
  { id: 'substack', name: 'SUBSTACK', iconName: 'substack', category: 'Social', size: 'small', url: 'https://statueofdavid.substack.com' },
  { id: 'reddit', name: 'REDDIT', iconName: 'reddit', category: 'Social', size: 'small', url: 'https://www.reddit.com/user/declaredspace/' },
  { id: 'medium', name: 'MEDIUM', iconName: 'medium', category: 'Social', size: 'small', url: 'https://medium.com/@declaredspace' },
  { id: 'meetup', name: 'MEETUP', iconName: 'meetup', category: 'Social', size: 'small', url: 'https://meetup.com' },
  
  // --- GAMES ---
  { id: 'steam', name: 'STEAM', iconName: 'steam', category: 'Games', size: 'small', url: 'https://steamcommunity.com/id/statueofdavid' },
  { id: 'epic', name: 'EPIC_GAMES', iconName: 'epic', category: 'Games', size: 'small', url: 'https://www.epicgames.com/' },
  { id: 'zwift', name: 'ZWIFT', iconName: 'zwift', category: 'Games', size: 'small', url: 'https://zwift.com' },
  
  // --- LEARNING ---
  { id: 'duolingo', name: 'DUOLINGO', iconName: 'duolingo', category: 'Learning', size: 'small', url: 'https://duolingo.com/profile/statueofdavid' },
  { id: 'monkeytype', name: 'MONKEYTYPE', iconName: 'monkeytype', category: 'Learning', size: 'small', url: 'https://monkeytype.com' },
  
  // --- DONATE ---
  { id: 'venmo', name: 'VENMO', iconName: 'venmo', category: 'Donate', size: 'small', url: 'https://venmo.com/dlibd' },
];
