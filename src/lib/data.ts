
export type GameCategory = 
  | 'MOBILE LEGENDS' 
  | 'BATTLEGROUNDS' 
  | 'MOBA GAMES' 
  | 'BATTLE ROYALE' 
  | 'ANIME & RPG' 
  | 'SHOOTER GAMES'
  | 'SUPERCELL' 
  | 'OTT SERVICES' 
  | 'SOCIAL SERVICES' 
  | 'GIFT CARDS' 
  | 'COMING SOON';

export interface GameProduct {
  id: string;
  name: string;
  category: GameCategory;
  image: string;
  flag?: string;
  requiresServer: boolean;
  isOtt?: boolean;
  isSocial?: boolean;
  isEnabled?: boolean;
  isComingSoon?: boolean;
  description: string;
  packages: {
    id: string;
    amount: string;
    price: number;
    description: string;
    section?: 'small' | 'large' | 'pass' | 'double';
  }[];
}

const MLBB_PACKAGES = [
  { id: 'mlbb-3', amount: '3 Diamonds', price: 10, description: 'Small', section: 'small' },
  { id: 'mlbb-86', amount: '86 Diamonds', price: 165, description: 'Popular', section: 'large' },
  { id: 'mlbb-172', amount: '172 Diamonds', price: 325, description: 'Popular', section: 'large' },
  { id: 'mlbb-wdp', amount: 'Weekly Diamond Pass', price: 160, description: 'Best Value', section: 'pass' },
];

export const GAMES: GameProduct[] = [
  // --- 1. MOBILE LEGENDS ---
  { id: 'mlbb-in', name: 'MLBB India', flag: '🇮🇳', category: 'MOBILE LEGENDS', image: 'mlbb-in', requiresServer: true, isEnabled: true, description: 'India Server Dispatch', packages: MLBB_PACKAGES },
  { id: 'mlbb-ph', name: 'MLBB Philippines', flag: '🇵🇭', category: 'MOBILE LEGENDS', image: 'mlbb-ph', requiresServer: true, isEnabled: true, description: 'PH Server Dispatch', packages: MLBB_PACKAGES },
  { id: 'mlbb-id', name: 'MLBB Indonesia', flag: '🇮🇩', category: 'MOBILE LEGENDS', image: 'mlbb-id', requiresServer: true, isEnabled: true, description: 'ID Server Dispatch', packages: MLBB_PACKAGES },
  { id: 'mlbb-my', name: 'MLBB Malaysia', flag: '🇲🇾', category: 'MOBILE LEGENDS', image: 'mlbb-my', requiresServer: true, isEnabled: true, description: 'MY Server Dispatch', packages: MLBB_PACKAGES },
  { id: 'mlbb-mm', name: 'MLBB Myanmar', flag: '🇲🇲', category: 'MOBILE LEGENDS', image: 'mlbb-mm', requiresServer: true, isEnabled: true, description: 'MM Server Dispatch', packages: MLBB_PACKAGES },
  { id: 'mlbb-sg', name: 'MLBB Singapore', flag: '🇸🇬', category: 'MOBILE LEGENDS', image: 'mlbb-sg', requiresServer: true, isEnabled: true, description: 'SG Server Dispatch', packages: MLBB_PACKAGES },
  { id: 'mlbb-br', name: 'MLBB Brazil', flag: '🇧🇷', category: 'MOBILE LEGENDS', image: 'mlbb-br', requiresServer: true, isEnabled: true, description: 'BR Server Dispatch', packages: MLBB_PACKAGES },
  { id: 'mlbb-tr', name: 'MLBB Turkey', flag: '🇹🇷', category: 'MOBILE LEGENDS', image: 'mlbb-tr', requiresServer: true, isEnabled: true, description: 'TR Server Dispatch', packages: MLBB_PACKAGES },
  { id: 'mlbb-mena', name: 'MLBB MENA', flag: '🌍', category: 'MOBILE LEGENDS', image: 'mlbb-mena', requiresServer: true, isEnabled: true, description: 'MENA Server Dispatch', packages: MLBB_PACKAGES },
  { id: 'mlbb-gl', name: 'MLBB Global', flag: '🌍', category: 'MOBILE LEGENDS', image: 'mlbb-gl', requiresServer: true, isEnabled: true, description: 'Global Server Dispatch', packages: MLBB_PACKAGES },
  { id: 'mlbb-wp-item', name: 'Weekly Pass', category: 'MOBILE LEGENDS', image: 'mlbb-wp', requiresServer: true, isEnabled: true, description: 'Weekly Diamond Pass', packages: [{ id: 'wp-1', amount: 'Weekly Pass', price: 160, description: 'Best Value' }] },
  { id: 'mlbb-tp-item', name: 'Twilight Pass', category: 'MOBILE LEGENDS', image: 'mlbb-tp', requiresServer: true, isEnabled: true, description: 'Seasonal Rewards', packages: [{ id: 'tp-1', amount: 'Twilight Pass', price: 750, description: 'Level Up' }] },

  // --- 2. BATTLEGROUNDS ---
  { id: 'bgmi', name: 'BGMI India', category: 'BATTLEGROUNDS', image: 'bgmi', requiresServer: false, isEnabled: true, description: 'Battlegrounds Mobile India', packages: [{ id: 'bgmi-60', amount: '60 UC', price: 75, description: 'Basic' }, { id: 'bgmi-300', amount: '300+25 UC', price: 380, description: 'Popular' }] },
  { id: 'pubg-mobile', name: 'PUBG Global', category: 'BATTLEGROUNDS', image: 'pubgmobile', requiresServer: true, isEnabled: true, description: 'PUBG Mobile Global', packages: [{ id: 'pubg-60', amount: '60 UC', price: 85, description: 'Global' }] },
  { id: 'codm', name: 'COD Mobile', category: 'BATTLEGROUNDS', image: 'codmobile', requiresServer: false, isEnabled: true, description: 'CP Top-up', packages: [{ id: 'cp-80', amount: '80 CP', price: 80, description: 'Basic' }] },
  { id: 'arena-breakout', name: 'Arena Breakout', category: 'BATTLEGROUNDS', image: 'googleplay', requiresServer: false, isEnabled: true, description: 'Tactical Extraction Shooter', packages: [{ id: 'ab-bond', amount: '60 Bonds', price: 80, description: 'Basic' }] },
  { id: 'free-fire', name: 'Free Fire', category: 'BATTLEGROUNDS', image: 'ff', requiresServer: false, isEnabled: true, description: 'Garena Free Fire', packages: [{ id: 'ff-100', amount: '100 Diamonds', price: 85, description: 'Basic' }] },
  { id: 'free-fire-max', name: 'Free Fire MAX', category: 'BATTLEGROUNDS', image: 'freefiremax', requiresServer: false, isEnabled: true, description: 'Garena FF MAX', packages: [{ id: 'ffm-100', amount: '100 Diamonds', price: 85, description: 'Basic' }] },
  { id: 'delta-force-m', name: 'Delta Force Mobile', category: 'BATTLEGROUNDS', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Launching Soon', packages: [] },
  { id: 'valorant-mobile', name: 'Valorant Mobile', category: 'BATTLEGROUNDS', image: 'valorant', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Pre-register Now', packages: [] },

  // --- 3. MOBA GAMES ---
  { id: 'honor-of-kings', name: 'Honor of Kings', category: 'MOBA GAMES', image: 'hok', requiresServer: true, isEnabled: true, description: 'HOK Global Tokens', packages: [{ id: 'hok-80', amount: '80 Tokens', price: 95, description: 'Basic' }] },
  { id: 'magic-chess', name: 'Magic Chess Go Go', category: 'MOBA GAMES', image: 'mcg', requiresServer: true, isEnabled: true, description: 'Magic Chess Diamonds', packages: [{ id: 'mc-50', amount: '50 Diamonds', price: 65, description: 'Basic' }] },
  { id: 'genshin-impact', name: 'Genshin Impact', category: 'MOBA GAMES', image: 'genshin', requiresServer: true, isEnabled: true, description: 'Genesis Crystals', packages: [{ id: 'gs-60', amount: '60 Crystals', price: 90, description: 'Basic' }] },
  { id: 'wuwa', name: 'Wuthering Waves', category: 'MOBA GAMES', image: 'wuwa', requiresServer: true, isEnabled: true, description: 'Lunites Recharge', packages: [{ id: 'ww-60', amount: '60 Lunites', price: 90, description: 'Basic' }] },
  { id: 'hsr', name: 'Honkai Star Rail', category: 'MOBA GAMES', image: 'hsr', requiresServer: true, isEnabled: true, description: 'Oneiric Shards', packages: [{ id: 'hsr-60', amount: '60 Shards', price: 90, description: 'Basic' }] },
  { id: 'clash-of-clans', name: 'Clash of Clans', category: 'MOBA GAMES', image: 'clashofclans', requiresServer: false, isEnabled: true, description: 'Gems & Gold Pass', packages: [{ id: 'coc-gp', amount: 'Gold Pass', price: 599, description: 'Seasonal' }] },
  { id: 'clash-royale', name: 'Clash Royale', category: 'MOBA GAMES', image: 'cr', requiresServer: false, isEnabled: true, description: 'Diamond Pass', packages: [{ id: 'cr-dp', amount: 'Diamond Pass', price: 999, description: 'Seasonal' }] },
  { id: 'brawl-stars', name: 'Brawl Stars', category: 'MOBA GAMES', image: 'bs', requiresServer: false, isEnabled: true, description: 'Gems Recharge', packages: [{ id: 'bs-30', amount: '30 Gems', price: 179, description: 'Basic' }] },

  // --- 4. OTT SERVICES ---
  { id: 'netflix', name: 'Netflix Premium', category: 'OTT SERVICES', image: 'netflix', requiresServer: false, isOtt: true, isEnabled: true, description: '4K UHD Screens', packages: [{ id: 'nf-1m', amount: '1 Month Private', price: 199, description: 'UHD' }] },
  { id: 'prime-video', name: 'Amazon Prime', category: 'OTT SERVICES', image: 'primevideo', requiresServer: false, isOtt: true, isEnabled: true, description: 'Full Access', packages: [{ id: 'ap-1m', amount: '1 Month', price: 179, description: 'Private' }] },
  { id: 'hotstar', name: 'Disney+ Hotstar', category: 'OTT SERVICES', image: 'hotstar', requiresServer: false, isOtt: true, isEnabled: true, description: 'Premium Access', packages: [{ id: 'dh-1m', amount: '1 Month', price: 149, description: 'Mobile' }] },
  { id: 'jiohotstar', name: 'JioHotstar', category: 'OTT SERVICES', image: 'jio', requiresServer: false, isOtt: true, isEnabled: true, description: 'Jio Combo', packages: [{ id: 'jh-1m', amount: '1 Month', price: 129, description: 'Basic' }] },
  { id: 'sonyliv', name: 'Sony LIV', category: 'OTT SERVICES', image: 'sonyliv', requiresServer: false, isOtt: true, isEnabled: true, description: 'LIV Premium', packages: [{ id: 'sl-1m', amount: '1 Month', price: 99, description: 'Basic' }] },
  { id: 'zee5', name: 'ZEE5 Premium', category: 'OTT SERVICES', image: 'zee5', requiresServer: false, isOtt: true, isEnabled: true, description: 'All Access', packages: [{ id: 'z5-1m', amount: '1 Month', price: 89, description: 'Basic' }] },
  { id: 'spotify', name: 'Spotify Premium', category: 'OTT SERVICES', image: 'spotify', requiresServer: false, isOtt: true, isEnabled: true, description: 'Ad-free Music', packages: [{ id: 'sp-1m', amount: '1 Month Individual', price: 119, description: 'Premium' }] },
  { id: 'yt-premium', name: 'YouTube Premium', category: 'OTT SERVICES', image: 'ytp', requiresServer: false, isOtt: true, isEnabled: true, description: 'No Ads + Music', packages: [{ id: 'yp-1m', amount: '1 Month Family', price: 189, description: 'Premium' }] },

  // --- 5. SOCIAL SERVICES ---
  { id: 'ig-followers', name: 'Instagram Followers', category: 'SOCIAL SERVICES', image: 'instagram', requiresServer: false, isSocial: true, isEnabled: true, description: 'High Quality', packages: [{ id: 'ig-1k', amount: '1k Followers', price: 199, description: 'HQ' }] },
  { id: 'ig-likes', name: 'Instagram Likes', category: 'SOCIAL SERVICES', image: 'instagram', requiresServer: false, isSocial: true, isEnabled: true, description: 'Fast Delivery', packages: [{ id: 'ig-l-1k', amount: '1k Likes', price: 49, description: 'Fast' }] },
  { id: 'ig-views', name: 'Instagram Views', category: 'SOCIAL SERVICES', image: 'instagram', requiresServer: false, isSocial: true, isEnabled: true, description: 'Instant', packages: [{ id: 'ig-v-10k', amount: '10k Views', price: 29, description: 'Instant' }] },
  { id: 'yt-subs', name: 'YouTube Subscribers', category: 'SOCIAL SERVICES', image: 'youtube', requiresServer: false, isSocial: true, isEnabled: true, description: 'Monetization', packages: [{ id: 'yt-1k', amount: '1k Subs', price: 1200, description: 'Real' }] },
  { id: 'tg-members', name: 'Telegram Members', category: 'SOCIAL SERVICES', image: 'telegram', requiresServer: false, isSocial: true, isEnabled: true, description: 'Group Growth', packages: [{ id: 'tg-1k', amount: '1k Members', price: 250, description: 'Global' }] },
  { id: 'yt-watch-hours', name: 'YouTube Watch Hours', category: 'SOCIAL SERVICES', image: 'youtube', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Monetization Node', packages: [] },
  { id: 'tg-chan-subs', name: 'Telegram Channel Subs', category: 'SOCIAL SERVICES', image: 'telegram', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Channel Growth', packages: [] },
  { id: 'dc-members', name: 'Discord Members', category: 'SOCIAL SERVICES', image: 'discord', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Server Population', packages: [] },
  { id: 'fb-page-fol', name: 'Facebook Page Followers', category: 'SOCIAL SERVICES', image: 'facebook', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Page Authority', packages: [] },
  { id: 'fb-page-lik', name: 'Facebook Page Likes', category: 'SOCIAL SERVICES', image: 'facebook', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Social Proof', packages: [] },
  { id: 'tk-followers', name: 'TikTok Followers', category: 'SOCIAL SERVICES', image: 'tiktok', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Global Reach', packages: [] },
  { id: 'tk-likes', name: 'TikTok Likes', category: 'SOCIAL SERVICES', image: 'tiktok', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Engagement Node', packages: [] },
  { id: 'wa-chan-fol', name: 'WhatsApp Channel Followers', category: 'SOCIAL SERVICES', image: 'whatsapp', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Channel Reach', packages: [] },

  // --- 6. GIFT CARDS ---
  { id: 'google-play-gc', name: 'Google Play', category: 'GIFT CARDS', image: 'googleplay', requiresServer: false, isEnabled: true, description: 'Redeem Codes', packages: [{ id: 'gp-100', amount: '₹100 Code', price: 100, description: 'Instant' }] },
  { id: 'itunes-gc', name: 'Apple iTunes', category: 'GIFT CARDS', image: 'applestore', requiresServer: false, isEnabled: true, description: 'Apple ID', packages: [{ id: 'ap-100', amount: '₹100 Code', price: 100, description: 'Instant' }] },
  { id: 'steam-gc', name: 'Steam Wallet', category: 'GIFT CARDS', image: 'steamwallet', requiresServer: false, isEnabled: true, description: 'Steam Credits', packages: [{ id: 'st-10', amount: '$10 Card', price: 950, description: 'Global' }] },
  { id: 'riot-gc', name: 'Riot Points', category: 'GIFT CARDS', image: 'googleplay', requiresServer: false, isEnabled: true, description: 'LoL/Valorant', packages: [{ id: 'rp-100', amount: '100 Points', price: 100, description: 'Instant' }] },
  { id: 'ps-gc', name: 'PlayStation', category: 'GIFT CARDS', image: 'playstation', requiresServer: false, isEnabled: true, description: 'PSN Store', packages: [{ id: 'ps-10', amount: '$10 Card', price: 850, description: 'Global' }] },
  { id: 'xb-gc', name: 'Xbox Wallet', category: 'GIFT CARDS', image: 'xbox', requiresServer: false, isEnabled: true, description: 'Microsoft Store', packages: [{ id: 'xb-10', amount: '$10 Card', price: 850, description: 'Global' }] },
  { id: 'ni-gc', name: 'Nintendo eShop', category: 'GIFT CARDS', image: 'googleplay', requiresServer: false, isEnabled: true, description: 'eShop Credits', packages: [{ id: 'ni-10', amount: '$10 Card', price: 850, description: 'Global' }] },
  { id: 'am-gc', name: 'Amazon Gift Card', category: 'GIFT CARDS', image: 'amazonpay', requiresServer: false, isEnabled: true, description: 'Amazon Credits', packages: [{ id: 'am-100', amount: '₹100 Code', price: 100, description: 'Instant' }] },

  // --- 7. COMING SOON EXPANSION ---
  { id: 'nfs-mobile', name: 'Need For Speed Mobile', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'High Octane Racing', packages: [] },
  { id: 'div-resurgence', name: 'The Division Resurgence', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Ubisoft Open World', packages: [] },
  { id: 'r6-mobile', name: 'Rainbow Six Mobile', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Tactical Shooter', packages: [] },
  { id: 'ash-echoes', name: 'Ash Echoes', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Anime Strategy RPG', packages: [] },
  { id: 'proj-mugen', name: 'Project Mugen', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Urban Open World', packages: [] },
  { id: 'destiny-rising', name: 'Destiny Rising', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Bungie Mobile Vision', packages: [] },
  
  // PC Services (Future Nodes)
  { id: 'val-points', name: 'Valorant Points', category: 'COMING SOON', image: 'valorant', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'PC Tactical Shooter', packages: [] },
  { id: 'steam-wallet-pc', name: 'Steam Wallet Topup', category: 'COMING SOON', image: 'steamwallet', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Global PC Store', packages: [] },
  { id: 'lol-rp', name: 'LoL RP', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'League of Legends', packages: [] },
  { id: 'cs2-items', name: 'CS2 Items', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Counter-Strike 2', packages: [] },
  { id: 'dota2-items', name: 'Dota 2 Items', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'MOBA PC', packages: [] },
  { id: 'pubg-pc', name: 'PUBG PC G-Coins', category: 'COMING SOON', image: 'pubgmobile', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Steam Version', packages: [] },
  { id: 'apex-pc', name: 'Apex Legends PC', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Apex Coins', packages: [] },
  { id: 'fortnite-pc', name: 'Fortnite V-Bucks', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Epic Games PC', packages: [] },
  { id: 'eafc-points', name: 'EA FC Points', category: 'COMING SOON', image: 'fcmobile', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'FIFA PC/Console', packages: [] },
  { id: 'minecraft-java', name: 'Minecraft Java', category: 'COMING SOON', image: 'googleplay', requiresServer: false, isComingSoon: true, isEnabled: true, description: 'Java & Bedrock PC', packages: [] },
];
