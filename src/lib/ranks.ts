export type RankTier = 
  | 'Recruit' 
  | 'Warrior' 
  | 'Elite' 
  | 'Master' 
  | 'Grandmaster' 
  | 'Epic' 
  | 'Legend' 
  | 'Mythic' 
  | 'Immortal';

export type VipTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface RankInfo {
  tier: RankTier;
  threshold: number;
  color: string;
  vipTier: VipTier;
  pointMultiplier: number;
  nextTier?: RankTier;
}

export const RANKS: RankInfo[] = [
  { tier: 'Recruit', threshold: 0, color: 'text-gray-400', vipTier: 'Bronze', pointMultiplier: 1, nextTier: 'Warrior' },
  { tier: 'Warrior', threshold: 500, color: 'text-orange-600', vipTier: 'Bronze', pointMultiplier: 1, nextTier: 'Elite' },
  { tier: 'Elite', threshold: 1500, color: 'text-blue-400', vipTier: 'Bronze', pointMultiplier: 1, nextTier: 'Master' },
  { tier: 'Master', threshold: 5000, color: 'text-purple-400', vipTier: 'Bronze', pointMultiplier: 1.1, nextTier: 'Grandmaster' },
  { tier: 'Grandmaster', threshold: 10000, color: 'text-red-400', vipTier: 'Silver', pointMultiplier: 1.2, nextTier: 'Epic' },
  { tier: 'Epic', threshold: 25000, color: 'text-teal-400', vipTier: 'Silver', pointMultiplier: 1.3, nextTier: 'Legend' },
  { tier: 'Legend', threshold: 50000, color: 'text-yellow-400', vipTier: 'Gold', pointMultiplier: 1.5, nextTier: 'Mythic' },
  { tier: 'Mythic', threshold: 100000, color: 'text-orange-400', vipTier: 'Gold', pointMultiplier: 1.7, nextTier: 'Immortal' },
  { tier: 'Immortal', threshold: 250000, color: 'text-indigo-400', vipTier: 'Platinum', pointMultiplier: 2 },
];

export function getUserRank(amount: number): RankInfo {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (amount >= rank.threshold) {
      currentRank = rank;
    } else {
      break;
    }
  }
  
  // Custom Diamond tier for 1M+
  if (amount >= 1000000) {
    return { ...RANKS[RANKS.length - 1], tier: 'Immortal', vipTier: 'Diamond', pointMultiplier: 2.5 };
  }

  return currentRank;
}

export function getRankProgress(amount: number) {
  const current = getUserRank(amount);
  const nextIdx = RANKS.findIndex(r => r.tier === current.tier) + 1;
  const next = RANKS[nextIdx];

  if (!next) return 100;

  const progress = ((amount - current.threshold) / (next.threshold - current.threshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}
