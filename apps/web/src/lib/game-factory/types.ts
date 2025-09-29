// Game Factory Types - Based on the educational repos mentioned
export interface BaseGame {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  players: string;
  type: GameType;
  content: any;
  tags: string[];
  rating: number;
  plays: number;
  emoji: string;
}

export type GameType =
  // Traditional Quiz Types
  | 'multiple-choice'
  | 'true-false'
  | 'fill-blank'
  | 'short-answer'
  // Interactive Types
  | 'drag-drop'
  | 'hotspot'
  | 'sequence'
  | 'matching'
  | 'memory-cards'
  // Programming Types
  | 'blockly-puzzle'
  | 'blockly-maze'
  | 'scratch-project'
  | 'turtle-blocks'
  // Creative Types
  | 'music-blocks'
  | 'story-creator'
  | 'art-generator'
  | 'poetry-maker'
  // Simulation Types
  | 'physics-sim'
  | 'chemistry-lab'
  | 'math-visualizer'
  | 'geography-explorer'
  // AR/VR Types
  | 'ar-explorer'
  | 'vr-classroom'
  | 'mixed-reality'
  // Assessment Types
  | 'adaptive-quiz'
  | 'competition'
  | 'collaborative'
  | 'peer-review'
  // Language Learning
  | 'vocabulary-builder'
  | 'pronunciation'
  | 'conversation'
  | 'grammar-practice'
  // STEM Types
  | 'coding-challenge'
  | 'robotics-sim'
  | 'data-analysis'
  | 'experiment-design'
  // Social Learning
  | 'discussion-forum'
  | 'peer-teaching'
  | 'group-project'
  | 'presentation'
  // Gamification
  | 'achievement-system'
  | 'leaderboard'
  | 'quest-chain'
  | 'badge-collection'
  // Additional types for AI generation
  | 'essay'
  | 'timeline'
  | 'flashcards'
  | 'creative-writing'
  | 'language-arts'
  | 'field-trip'
  | 'immersive-learning'
  | 'personalized-learning'
  | 'language-learning'
  | 'language-exchange'
  | 'writing-practice'
  | 'programming'
  | 'engineering'
  | 'statistics'
  | 'scientific-method'
  | 'debate'
  | 'knowledge-sharing'
  | 'teamwork'
  | 'public-speaking'
  | 'ranking'
  | 'adventure'
  | 'progressive-learning'
  | 'gamification'
  | 'recognition';

export interface GameContent {
  type: GameType;
  theme: string;
  difficulty: string;
  // Common fields
  instructions?: string;
  timeLimit?: number;
  attempts?: number;
  // Type-specific fields
  questions?: Question[];
  cards?: Card[];
  items?: Item[];
  blocks?: Block[];
  scenarios?: Scenario[];
  challenges?: Challenge[];
  resources?: Resource[];
}

export interface Question {
  id: string;
  question: string;
  type:
    | 'multiple-choice'
    | 'true-false'
    | 'fill-blank'
    | 'short-answer'
    | 'essay';
  options?: string[];
  correct?: number | string;
  explanation?: string;
  points?: number;
  difficulty?: string;
  tags?: string[];
}

export interface Card {
  id: string;
  front: string;
  back: string;
  image?: string;
  audio?: string;
  category?: string;
  difficulty?: string;
}

export interface Item {
  id: string;
  name: string;
  type: string;
  category?: string;
  properties?: Record<string, any>;
  position?: { x: number; y: number };
  order?: number;
  match?: string;
}

export interface Block {
  id: string;
  type: string;
  color: string;
  function: string;
  parameters?: Record<string, any>;
  connections?: string[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  environment: string;
  characters?: Character[];
  objectives: Objective[];
  resources: Resource[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  personality: string;
  image?: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  type: 'collect' | 'solve' | 'create' | 'explore' | 'collaborate';
  points: number;
  completed: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'math' | 'science' | 'creative' | 'collaborative';
  difficulty: string;
  timeLimit?: number;
  hints?: string[];
  solution?: any;
}

export interface Resource {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link' | 'simulation';
  url: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Game Generation Templates
export interface GameTemplate {
  type: GameType;
  name: string;
  description: string;
  category: string;
  ageRange: string;
  subjects: string[];
  features: string[];
  template: () => GameContent;
}

// Game Factory Interface
export interface GameFactory {
  createGame(type: GameType, config: GameConfig): BaseGame;
  getAvailableTypes(): GameType[];
  getTemplates(): GameTemplate[];
  validateGame(game: BaseGame): boolean;
}

export interface GameConfig {
  subject: string;
  grade: string;
  difficulty: string;
  theme?: string;
  customContent?: any;
  aiGenerated?: boolean;
}

// === Subjects ===============================
export type Subject =
  | 'math'
  | 'science'
  | 'spanish'
  | 'english'
  | 'history'
  | 'geography'
  | 'art'
  | 'music'
  | 'coding'
  | 'robotics'
  | 'reading'
  | 'writing'
  | 'civics'
  | 'economics'
  | 'biology'
  | 'chemistry'
  | 'physics'
  | 'astronomy'
  | 'language'; // <- incluye "language" para compatibilidad

// Lista canónica para selects / filtros
export const SUBJECTS = [
  'math',
  'science',
  'spanish',
  'english',
  'history',
  'geography',
  'art',
  'music',
  'coding',
  'robotics',
  'reading',
  'writing',
  'civics',
  'economics',
  'biology',
  'chemistry',
  'physics',
  'astronomy',
  'language',
] as const satisfies readonly Subject[];

// Etiquetas en ES
export const SUBJECT_LABELS: Record<Subject, string> = {
  math: 'Matemáticas',
  science: 'Ciencias',
  spanish: 'Español',
  english: 'Inglés',
  history: 'Historia',
  geography: 'Geografía',
  art: 'Arte',
  music: 'Música',
  coding: 'Programación',
  robotics: 'Robótica',
  reading: 'Lectura',
  writing: 'Escritura',
  civics: 'Cívica',
  economics: 'Economía',
  biology: 'Biología',
  chemistry: 'Química',
  physics: 'Física',
  astronomy: 'Astronomía',
  language: 'Lenguaje', // genérico
};

// Utilidad por si te llega algo no canónico y quieres mapearlo
export function normalizeSubject(s: string): Subject | null {
  const m = s.toLowerCase();
  const alias: Record<string, Subject> = {
    lang: 'language',
    languages: 'language',
    lengua: 'language',
    'language-arts': 'language',
  };
  if ((SUBJECTS as readonly string[]).includes(m)) return m as Subject;
  if (alias[m]) return alias[m];
  return null;
}

// Grados escolares canónicos
export type GradeLevel =
  | 'pre-k'
  | 'k'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12';

// Lista canónica para selects / filtros
export const GRADE_LEVELS = [
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
] as const satisfies readonly GradeLevel[];

// Labels en ES
export const GRADE_LABELS: Record<GradeLevel, string> = {
  'pre-k': 'Pre-K',
  k: 'Kínder',
  '1': '1.º',
  '2': '2.º',
  '3': '3.º',
  '4': '4.º',
  '5': '5.º',
  '6': '6.º',
  '7': '7.º',
  '8': '8.º',
  '9': '9.º',
  '10': '10.º',
  '11': '11.º',
  '12': '12.º',
};

// Normalizador por si llegan aliases
export function normalizeGrade(g: string): GradeLevel | null {
  const m = g.toLowerCase().replace(/\s+/g, '');
  const alias: Record<string, GradeLevel> = {
    pk: 'pre-k',
    prek: 'pre-k',
    prekindergarten: 'pre-k',
    kinder: 'k',
    kindergarten: 'k',
    primero: '1',
    segundo: '2',
    tercero: '3',
    cuarto: '4',
    quinto: '5',
    sexto: '6',
    septimo: '7',
    séptimo: '7',
    octavo: '8',
    noveno: '9',
    decimo: '10',
    décimo: '10',
    undecimo: '11',
    undécimo: '11',
    duodecimo: '12',
    duodécimo: '12',
  };
  if ((GRADE_LEVELS as readonly string[]).includes(m)) return m as GradeLevel;
  if (alias[m]) return alias[m];
  return null;
}

// Tipos de dificultad unificados
export type DifficultyStd = 'easy' | 'medium' | 'hard';
export type DifficultyAlt = 'beginner' | 'intermediate' | 'advanced';
export type Difficulty = DifficultyStd | DifficultyAlt;

// Categorías canónicas
export type Category =
  | 'assessment'
  | 'interactive'
  | 'programming'
  | 'creative'
  | 'simulation'
  | 'ar-vr'
  | 'language'
  | 'stem'
  | 'social'
  | 'gamification';

// Lista canónica (para selects / filtros)
export const CATEGORIES = [
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
] as const satisfies readonly Category[];

// Labels en ES (o EN si prefieres)
export const CATEGORY_LABELS: Record<Category, string> = {
  assessment:   'Evaluación',
  interactive:  'Interactivo',
  programming:  'Programación',
  creative:     'Creativo',
  simulation:   'Simulación',
  'ar-vr':      'AR/VR',
  language:     'Lenguaje',
  stem:         'STEM',
  social:       'Aprendizaje Social',
  gamification: 'Gamificación',
};

// Normalizador (acepta "Assessment", "ASSESSMENT", "Ar Vr", etc.)
export function normalizeCategory(c: string): Category | null {
  const key = c.toLowerCase().replace(/\s+/g, '-');
  const alias: Record<string, Category> = {
    'arvr': 'ar-vr',
    'ar-vr': 'ar-vr',
    'ar/vr': 'ar-vr',
  };
  if ((CATEGORIES as readonly string[]).includes(key)) return key as Category;
  if (alias[key]) return alias[key];
  return null;
}

// Útil para selects ('all' | T)
export type AllOr<T extends string> = 'all' | T;

// (Opcional) Si conviertes strings a GameType dinámicamente:
export function isGameType(x: string): x is GameType {
  return !!x; // deja simple: sólo afina si validas contra una whitelist
}
