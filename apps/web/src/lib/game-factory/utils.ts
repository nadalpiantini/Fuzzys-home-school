import type { Difficulty, DifficultyStd } from './types';

const mapAltToStd: Record<'beginner'|'intermediate'|'advanced', DifficultyStd> = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
};

export function normalizeDifficulty(d: Difficulty): DifficultyStd {
  if (d === 'easy' || d === 'medium' || d === 'hard') return d;
  return mapAltToStd[d]; // 'beginner'|'intermediate'|'advanced'
}
