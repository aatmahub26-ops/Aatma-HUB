
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
  { id: 'mlbb-3', amount: '3 Diamonds', price: 7, description: '3+0 Bonus', section: 'small' },
  { id: 'mlbb-5', amount: '5 Diamonds', price: 9, description: '5+0 Bonus', section: 'small' },
  { id: 'mlbb-11', amount: '11 Diamonds', price: 17, description: '10+1 Bonus', section: 'small' },
  { id: 'mlbb-14', amount: '14 Diamonds', price: 23, description: '13+1 Bonus', section: 'small' },
  { id: 'mlbb-22', amount: '22 Diamonds', price: 34, description: '20+2 Bonus', section: 'small' },
  { id: 'mlbb-28', amount: '28 Diamonds', price: 42, description: '25+2 Bonus', section: 'small' },
  { id: 'mlbb-44', amount: '44 Diamonds', price: 67, description: '40+4 Bonus', section: 'small' },
  { id: 'mlbb-56', amount: '56 Diamonds', price: 83, description: '51+5 Bonus', section: 'small' }
  ,{ id: 'mlbb-86', amount: '86 Diamonds', price: 125, description: '78+8 Bonus', section: 'large' }
  ,{ id: 'mlbb-172', amount: '172 Diamonds', price: 249, description: '156+16 Bonus', section: 'large' }
  ,{ id: 'mlbb-257', amount: '257 Diamonds', price: 365, description: '234+23 Bonus', section: 'large' }
  ,{ id: 'mlbb-343', amount: '343 Diamonds', price: 489, description: '312+31 Bonus', section: 'large' }
  ,{ id: 'mlbb-429', amount: '429 Diamonds', price: 609, description: '390+39 Bonus', section: 'large' }
  ,{ id: 'mlbb-514', amount: '514 Diamonds', price: 729, description: '468+46 Bonus', section: 'large' }
  ,{ id: 'mlbb-706', amount: '706 Diamonds', price: 969, description: '625+81 Bonus', section: 'large' }
  ,{ id: 'mlbb-878', amount: '878 Diamonds', price: 1209, description: '781+97 Bonus', section: 'large' }
  ,{ id: 'mlbb-110', amount: '110 Diamonds', price: 160, description: '100+10 Bonus', section: 'large' }
  ,{ id: 'mlbb-165', amount: '165 Diamonds', price: 240, description: '150+15 Bonus', section: 'large' }
  ,{ id: 'mlbb-275', amount: '275 Diamonds', price: 385, description: '250+25 Bonus', section: 'large' }
  ,{ id: 'mlbb-565', amount: '565 Diamonds', price: 790, description: '500+65 Bonus', section: 'large' }
  ,{ id: 'mlbb-600', amount: '600 Diamonds', price: 854, description: '546+54 Bonus', section: 'large' }
  ,{ id: 'mlbb-792', amount: '792 Diamonds', price: 1111, description: '703+89 Bonus', section: 'large' }
  ,{ id: 'mlbb-840', amount: '840 Diamonds', price: 1174, description: '750+90 Bonus', section: 'large' }
  ,{ id: 'mlbb-1049', amount: '1049 Diamonds', price: 1474, description: '937+112 Bonus', section: 'large' }
  ,{ id: 'mlbb-1130', amount: '1130 Diamonds', price: 1579, description: '1000+130 Bonus', section: 'large' }
  ,{ id: 'mlbb-1412', amount: '1412 Diamonds', price: 1968, description: '1250+162 Bonus', section: 'large' }
  ,{ id: 'mlbb-2195', amount: '2195 Diamonds', price: 2979, description: '1860+335 Bonus', section: 'large' }
  ,{ id: 'mlbb-3688', amount: '3688 Diamonds', price: 4970, description: '3099+589 Bonus', section: 'large' }
  ,{ id: 'mlbb-5532', amount: '5532 Diamonds', price: 7503, description: '4649+883 Bonus', section: 'large' }
  ,{ id: 'mlbb-9288', amount: '9288 Diamonds', price: 12462, description: '7740+1548 Bonus', section: 'large' }
  ,{ id: 'mlbb-weekly', amount: 'Weekly Pass', price: 160, description: 'Weekly Diamond Pass', section: 'pass' }
  ,{ id: 'mlbb-twilight', amount: 'Twilight Pass', price: 750, description: 'Seasonal Rewards', section: 'pass' }
,{ id: 'mlbb-weekly-elite', amount: 'Weekly Elite Bundle', price: 80, description: 'Purchasable once a week', section: 'pass' }  ,{ id: 'mlbb-monthly-epic', amount: 'Monthly Epic Bundle', price: 403, description: 'Purchasable once a month', section: 'pass' }
  ,{ id: 'mlbb-double-50', amount: '50 Diamonds', price: 79, description: 'Double Diamond Event', section: 'double' }
  ,{ id: 'mlbb-double-250', amount: '250 Diamonds', price: 399, description: 'Double Diamond Event', section: 'double' }
];
const MLBB_PH_PACKAGES = [
  { id: 'ph-3', amount: '3 Diamonds', price: 7, section: 'small' },
  { id: 'ph-5', amount: '5 Diamonds', price: 9, section: 'small' },
  { id: 'ph-11', amount: '11 Diamonds', price: 17, section: 'small' },
  { id: 'ph-22', amount: '22 Diamonds', price: 34, section: 'small' },
  { id: 'ph-56', amount: '56 Diamonds', price: 83, section: 'small' },
  { id: 'ph-112', amount: '112 Diamonds', price: 165, section: 'large' },
  { id: 'ph-weekly', amount: 'Weekly Pass', price: 163, section: 'pass' },
];

const MLBB_ID_PACKAGES = [
  { id: 'id-3', amount: '3 Diamonds', price: 7, section: 'small' },
  { id: 'id-5', amount: '5 Diamonds', price: 10, section: 'small' },
  { id: 'id-12', amount: '12 Diamonds', price: 21, section: 'small' },
  { id: 'id-59', amount: '59 Diamonds', price: 93, section: 'small' },
  { id: 'id-85', amount: '85 Diamonds', price: 133, section: 'large' },
  { id: 'id-170', amount: '170 Diamonds', price: 274, section: 'large' },
  { id: 'id-240', amount: '240 Diamonds', price: 378, section: 'large' },
  { id: 'id-568', amount: '568 Diamonds', price: 902, section: 'large' },
  { id: 'id-1136', amount: '1136 Diamonds', price: 1823, section: 'large' },
  { id: 'id-weekly', amount: 'Weekly Pass', price: 175, section: 'pass' },
  { id: 'id-double-55', amount: '55 Diamonds', price: 94, section: 'double' },
  { id: 'id-double-165', amount: '165 Diamonds', price: 276, section: 'double' },
  { id: 'id-double-275', amount: '275 Diamonds', price: 465, section: 'double' },
  { id: 'id-double-565', amount: '565 Diamonds', price: 934, section: 'double' },
];

const MLBB_MY_PACKAGES = [
  { id: 'my-14', amount: '14 Diamonds', price: 26, section: 'small' },
  { id: 'my-28', amount: '28 Diamonds', price: 51, section: 'small' },
  { id: 'my-42', amount: '42 Diamonds', price: 76, section: 'small' },
  { id: 'my-86', amount: '86 Diamonds', price: 152, section: 'large' },
  { id: 'my-172', amount: '172 Diamonds', price: 303, section: 'large' },
  { id: 'my-257', amount: '257 Diamonds', price: 454, section: 'large' },
  { id: 'my-344', amount: '344 Diamonds', price: 605, section: 'large' },
  { id: 'my-429', amount: '429 Diamonds', price: 756, section: 'large' },
  { id: 'my-514', amount: '514 Diamonds', price: 907, section: 'large' },
  { id: 'my-weekly', amount: 'Weekly Pass', price: 168, section: 'pass' },
];

export const GAMES: GameProduct[] = [
  // --- 1. MOBILE LEGENDS ---
  { id: 'mlbb-in', name: 'MLBB India', flag: '🇮🇳', category: 'MOBILE GAMES', image: 'mlbb-in', requiresServer: true, isEnabled: true, description: 'India Server Dispatch', packages: MLBB_PACKAGES },
  { id: 'mlbb-ph', name: 'MLBB Philippines', flag: '🇵🇭', category: 'MOBILE GAMES', image: 'mlbb-ph', requiresServer: true, isEnabled: true, description: 'PH Server Dispatch', packages: MLBB_PH_PACKAGES },
  { id: 'mlbb-id', name: 'MLBB Indonesia', flag: '🇮🇩', category: 'MOBILE GAMES', image: 'mlbb-id', requiresServer: true, isEnabled: true, description: 'ID Server Dispatch', packages: MLBB_ID_PACKAGES },
  { id: 'mlbb-my', name: 'MLBB Malaysia + Singapore', flag: '🇲🇾', category: 'MOBILE GAMES', image: 'mlbb-my', requiresServer: true, isEnabled: true, description: 'MY Server Dispatch', packages: MLBB_MY_PACKAGES },
  { id: 'mlbb-wp-item', name: 'Weekly Pass', category: 'MOBILE LEGENDS', image: 'mlbb-wp', requiresServer: true, isEnabled: false, description: 'Weekly Diamond Pass', packages: [{ id: 'wp-1', amount: 'Weekly Pass', price: 160, description: 'Best Value' }] },
  { id: 'mlbb-tp-item', name: 'Twilight Pass', category: 'MOBILE LEGENDS', image: 'mlbb-tp', requiresServer: true, isEnabled: false, description: 'Seasonal Rewards', packages: [{ id: 'tp-1', amount: 'Twilight Pass', price: 750, description: 'Level Up' }] },

  // --- 2. BATTLEGROUNDS ---
  { id: 'bgmi', name: 'BGMI India', category: 'MOBILE GAMES', image: 'bgmi', requiresServer: false, isEnabled: true, description: 'Battlegrounds Mobile India', packages: [{ id: 'bgmi-60', amount: '60 UC', price: 75, description: 'Basic' }, { id: 'bgmi-300', amount: '300+25 UC', price: 380, description: 'Popular' }, { id: 'bgmi-600', amount: '600+60 UC', price: 750, description: 'Best Seller' }, { id: 'bgmi-1500', amount: '1500+300 UC', price: 1900, description: 'Premium' }, { id: 'bgmi-3000', amount: '3000+850 UC', price: 3800, description: 'Mega Pack' }, { id: 'bgmi-6000', amount: '6000+2100 UC', price: 7600, description: 'Ultimate Pack' }] },
  { id: 'pubg-mobile', name: 'PUBG Global', category: 'MOBILE GAMES', image: 'pubgmobile', requiresServer: true, isEnabled: true, description: 'PUBG Mobile Global', packages: [{ id: 'pubg-60', amount: '60 UC', price: 75, description: 'Basic' }, { id: 'pubg-300', amount: '300+25 UC', price: 380, description: 'Popular' }, { id: 'pubg-600', amount: '600+60 UC', price: 750, description: 'Best Seller' }, { id: 'pubg-1500', amount: '1500+300 UC', price: 1900, description: 'Premium' }, { id: 'pubg-3000', amount: '3000+850 UC', price: 3800, description: 'Mega Pack' }, { id: 'pubg-6000', amount: '6000+2100 UC', price: 7600, description: 'Ultimate Pack' }] },

  // --- 3. MOBA GAMES ---
  { id: 'honor-of-kings', name: 'Honor of Kings', category: 'MOBILE GAMES', image: 'hok', requiresServer: true, isEnabled: true, description: 'HOK Global Tokens', packages: [{ id: 'hok-16', amount: '16 Tokens', price: 19, description: '16+0 Bonus', section: 'small' }, { id: 'hok-80', amount: '80 Tokens', price: 90, description: '80+0 Bonus', section: 'small' }, { id: 'hok-240', amount: '240 Tokens', price: 268, description: '240+0 Bonus', section: 'small' }, { id: 'hok-560', amount: '560 Tokens', price: 625, description: '560+0 Bonus', section: 'small' }, { id: 'hok-1245', amount: '1245 Tokens', price: 1338, description: '1200+45 Bonus', section: 'small' }, { id: 'hok-2508', amount: '2508 Tokens', price: 2622, description: '2400+108 Bonus', section: 'small' }, { id: 'hok-4180', amount: '4180 Tokens', price: 4462, description: '4000+180 Bonus', section: 'small' }, { id: 'hok-weekly', amount: 'Weekly Card', price: 104, description: 'Pass', section: 'pass' }, { id: 'hok-weekly-plus', amount: 'Weekly Card Plus', price: 320, description: 'Pass', section: 'pass' }] },
  { id: 'magic-chess', name: 'Magic Chess Go Go', category: 'MOBILE GAMES', image: 'mcg', requiresServer: true, isEnabled: true, description: 'Magic Chess Diamonds', packages: [{ id: 'mc-55', amount: '55 Diamonds', price: 82, description: '50+5 Bonus', section: 'small' }, { id: 'mc-86', amount: '86 Diamonds', price: 129, description: '78+8 Bonus', section: 'small' }, { id: 'mc-110', amount: '110 Diamonds', price: 164, description: '100+10 Bonus', section: 'small' }, { id: 'mc-165', amount: '165 Diamonds', price: 246, description: '150+15 Bonus', section: 'small' }, { id: 'mc-172', amount: '172 Diamonds', price: 257, description: '156+16 Bonus', section: 'small' }, { id: 'mc-257', amount: '257 Diamonds', price: 384, description: '234+23 Bonus', section: 'small' }, { id: 'mc-275', amount: '275 Diamonds', price: 410, description: '250+25 Bonus', section: 'small' }, { id: 'mc-344', amount: '344 Diamonds', price: 513, description: '310+34 Bonus', section: 'small' }, { id: 'mc-516', amount: '516 Diamonds', price: 769, description: '465+51 Bonus', section: 'small' }, { id: 'mc-565', amount: '565 Diamonds', price: 820, description: '500+65 Bonus', section: 'small' }, { id: 'mc-706', amount: '706 Diamonds', price: 1025, description: '625+81 Bonus', section: 'small' }, { id: 'mc-1346', amount: '1346 Diamonds', price: 1922, description: '1160+186 Bonus', section: 'small' }, { id: 'mc-1825', amount: '1825 Diamonds', price: 2563, description: '1547+278 Bonus', section: 'small' }, { id: 'mc-2195', amount: '2195 Diamonds', price: 3075, description: '1860+335 Bonus', section: 'small' }, { id: 'mc-3688', amount: '3688 Diamonds', price: 5125, description: '3099+589 Bonus', section: 'small' }, { id: 'mc-5532', amount: '5532 Diamonds', price: 7688, description: '4649+883 Bonus', section: 'small' }, { id: 'mc-9288', amount: '9288 Diamonds', price: 12813, description: '7740+1548 Bonus', section: 'small' }, { id: 'mc-weekly', amount: 'Weekly Diamond Pass', price: 205, description: '7 Day Pass', section: 'pass' }, { id: 'mc-ft55', amount: '55 Diamonds', price: 82, description: 'First Top-Up Bonus', section: 'double' }, { id: 'mc-ft165', amount: '165 Diamonds', price: 246, description: 'First Top-Up Bonus', section: 'double' }, { id: 'mc-ft275', amount: '275 Diamonds', price: 410, description: 'First Top-Up Bonus', section: 'double' }, { id: 'mc-ft565', amount: '565 Diamonds', price: 820, description: 'First Top-Up Bonus', section: 'double' }] },
  { id: 'genshin-impact', name: 'Genshin Impact', category: 'MOBILE GAMES', image: 'genshin', requiresServer: true, isEnabled: true, description: 'Genesis Crystals', packages: [{ id: 'gs-60', amount: '60 Genesis Crystals', price: 91, description: 'Genesis Crystals', section: 'small' }, { id: 'gs-300', amount: '300+30 Genesis Crystals', price: 455, description: 'Genesis Crystals', section: 'small' }, { id: 'gs-980', amount: '980+110 Genesis Crystals', price: 1360, description: 'Genesis Crystals', section: 'small' }, { id: 'gs-1980', amount: '1980+260 Genesis Crystals', price: 2760, description: 'Genesis Crystals', section: 'small' }, { id: 'gs-3280', amount: '3280+600 Genesis Crystals', price: 4530, description: 'Genesis Crystals', section: 'small' }, { id: 'gs-6480', amount: '6480+1600 Genesis Crystals', price: 9060, description: 'Genesis Crystals', section: 'small' }, { id: 'gs-welkin', amount: 'Blessing of the Welkin Moon', price: 450, description: 'Welkin Moon', section: 'pass' }] },

  // --- 4. OTT SERVICES ---
  { id: 'netflix', name: 'Netflix Premium', category: 'SOCIAL SERVICES', image: 'netflix', requiresServer: false, isOtt: true, isEnabled: true, description: '4K UHD Screens', packages: [{ id: 'nf-1m', amount: '1 Month Private', price: 199, description: 'UHD' }] },
  { id: 'prime-video', name: 'Amazon Prime', category: 'SOCIAL SERVICES', image: 'primevideo', requiresServer: false, isOtt: true, isEnabled: true, description: 'Full Access', packages: [{ id: 'ap-1m', amount: '1 Month', price: 179, description: 'Private' }] },
  { id: 'yt-premium', name: 'YouTube Premium', category: 'SOCIAL SERVICES', image: 'ytp', requiresServer: false, isOtt: true, isEnabled: true, description: 'No Ads + Music', packages: [{ id: 'yp-1m', amount: '1 Month Family', price: 189, description: 'Premium' }] },

  // --- 5. SOCIAL SERVICES ---

  // --- 6. GIFT CARDS ---

];
