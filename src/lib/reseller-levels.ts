
export type ResellerLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface LevelBenefit {
  level: ResellerLevel;
  threshold: number;
  discount: number; // Percentage discount
  commission: number; // Referral commission percentage
  color: string;
}

export const RESELLER_LEVELS: LevelBenefit[] = [
  { level: 'Bronze', threshold: 0, discount: 1, commission: 1, color: 'text-orange-400' },
  { level: 'Silver', threshold: 10000, discount: 2, commission: 2, color: 'text-gray-300' },
  { level: 'Gold', threshold: 50000, discount: 3, commission: 3, color: 'text-yellow-400' },
  { level: 'Platinum', threshold: 250000, discount: 5, commission: 5, color: 'text-cyan-400' },
  { level: 'Diamond', threshold: 1000000, discount: 7, commission: 7, color: 'text-indigo-400' },
];

export function getResellerLevel(volume: number): LevelBenefit {
  let current = RESELLER_LEVELS[0];
  for (const level of RESELLER_LEVELS) {
    if (volume >= level.threshold) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}
