import { Category, Difficulty, GradeLevel, Subject } from './types';

export const normalizeDifficulty = (d: string): Difficulty | null => {
  const m = d.toLowerCase();
  if (['easy', 'medium', 'hard'].includes(m)) return m as Difficulty;
  const map: Record<string, Difficulty> = {
    beginner: 'easy',
    basic: 'easy',
    intermediate: 'medium',
    medium: 'medium',
    advanced: 'hard',
    hard: 'hard',
  };
  return map[m] ?? null;
};

export const normalizeSubject = (s: string): Subject | null => {
  const key = s.toLowerCase().replace(/\s+/g, '-');
  const map: Record<string, Subject> = {
    lang: 'language',
    español: 'language',
    spanish: 'language',
    coding: 'coding',
    code: 'coding',
    computacion: 'technology',
    tecnologia: 'technology',
  };
  const allowed = new Set([
    'math',
    'science',
    'language',
    'history',
    'geography',
    'art',
    'music',
    'technology',
    'coding',
    'reading',
    'writing',
  ]);
  if (allowed.has(key)) return key as Subject;
  return map[key] ?? null;
};

export const normalizeGrade = (g: string): GradeLevel | null => {
  const key = g.toLowerCase().replace(/\s+/g, '');
  const map: Record<string, GradeLevel> = {
    'pre-k': 'pre-k',
    prek: 'pre-k',
    prekindergarten: 'pre-k',
    kinder: 'k',
    kindergarten: 'k',
    '1st': '1',
    '2nd': '2',
    '3rd': '3',
    '4th': '4',
    '5th': '5',
    '6th': '6',
    '7th': '7',
    '8th': '8',
    '9th': '9',
    '10th': '10',
    '11th': '11',
    '12th': '12',
    '1ro': '1',
    '2do': '2',
    '3ro': '3',
    '4to': '4',
    '5to': '5',
    '6to': '6',
    '7mo': '7',
    '8vo': '8',
    '9no': '9',
    '10mo': '10',
    '11mo': '11',
    '12mo': '12',
  };
  const allowed = new Set([
    'pre-k',
    'k',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ]);
  if (allowed.has(key)) return key as GradeLevel;
  return map[key] ?? null;
};

export const normalizeCategory = (c: string): Category | null => {
  const key = c.toLowerCase().replace(/\s+/g, '-');
  const map: Record<string, Category> = { arvr: 'ar-vr', 'ar/vr': 'ar-vr' };
  const allowed = new Set([
    'assessment',
    'interactive',
    'programming',
    'creative',
    'simulation',
    'ar-vr',
    'language',
    'stem',
    'social',
    'gamification',
  ]);
  if (allowed.has(key)) return key as Category;
  return map[key] ?? null;
};
