import type { Difficulty } from './types';

const mapAltToStd: Record<
  'beginner' | 'intermediate' | 'advanced',
  Difficulty
> = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
};

export function normalizeDifficulty(d: Difficulty): Difficulty {
  if (d === 'easy' || d === 'medium' || d === 'hard') return d;
  return mapAltToStd[d]; // 'beginner'|'intermediate'|'advanced'
}
