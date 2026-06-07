
export type AchievementId = 
  | 'first_recharge' 
  | 'order_10' 
  | 'order_50' 
  | 'order_100' 
  | 'vip_member' 
  | 'elite_gamer' 
  | 'immortal_rank';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_recharge',
    title: 'Initiate',
    description: 'Completed your first wallet recharge.',
    icon: 'Zap',
    color: 'text-yellow-500'
  },
  {
    id: 'order_10',
    title: 'Veteran',
    description: 'Successfully completed 10 top-up orders.',
    icon: 'Shield',
    color: 'text-blue-400'
  },
  {
    id: 'order_50',
    title: 'Commander',
    description: 'Successfully completed 50 top-up orders.',
    icon: 'Trophy',
    color: 'text-purple-500'
  },
  {
    id: 'order_100',
    title: 'Centurion',
    description: 'Reached 100 successful orders milestone.',
    icon: 'Crown',
    color: 'text-orange-500'
  },
  {
    id: 'vip_member',
    title: 'VIP Elite',
    description: 'Became a verified VIP platform member.',
    icon: 'Star',
    color: 'text-pink-500'
  },
  {
    id: 'elite_gamer',
    title: 'Elite Alpha',
    description: 'Reached the Legend rank in the Elite League.',
    icon: 'Flame',
    color: 'text-red-500'
  },
  {
    id: 'immortal_rank',
    title: 'Immortal God',
    description: 'Achieved the ultimate Immortal platform rank.',
    icon: 'Swords',
    color: 'text-indigo-400'
  }
];
