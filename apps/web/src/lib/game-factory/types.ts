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
  | 'recognition'
  // Additional from second definition
  | 'live-quiz'
  | 'mind-map'
  | 'branching-scenario'
  | 'team-challenge'
  | 'code-challenge'
  | 'research-methods'
  | 'critical-thinking'
  | 'leadership';

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
  type?: string;
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
  category: Category;
  ageRange: GradeLevel[];
  subjects: Subject[];
  difficultyTags?: Difficulty[];
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
  | 'language'
  | 'literature'
  | 'grammar'
  | 'history'
  | 'geography'
  | 'art'
  | 'music'
  | 'technology'
  | 'coding'
  | 'reading'
  | 'writing'
  | 'anatomy'
  | 'programming'
  | 'logic'
  | 'spatial'
  | 'geometry'
  | 'creativity'
  | 'physics'
  | 'chemistry'
  | 'vocabulary'
  | 'computer-science'
  | 'philosophy'
  | 'all'
  | 'general';

export const SUBJECTS = [
  'math',
  'science',
  'language',
  'literature',
  'grammar',
  'history',
  'geography',
  'art',
  'music',
  'technology',
  'coding',
  'reading',
  'writing',
  'anatomy',
  'programming',
  'logic',
  'spatial',
  'geometry',
  'creativity',
  'physics',
  'chemistry',
  'vocabulary',
  'computer-science',
  'philosophy',
  'all',
  'general',
] as const satisfies readonly Subject[];

export const SUBJECT_LABELS: Record<Subject, string> = {
  math: 'Matemáticas',
  science: 'Ciencias',
  language: 'Lenguaje',
  literature: 'Literatura',
  grammar: 'Gramática',
  history: 'Historia',
  geography: 'Geografía',
  art: 'Arte',
  music: 'Música',
  technology: 'Tecnología',
  coding: 'Programación',
  reading: 'Lectura',
  writing: 'Escritura',
  anatomy: 'Anatomía',
  programming: 'Programación',
  logic: 'Lógica',
  spatial: 'Espacial',
  geometry: 'Geometría',
  creativity: 'Creatividad',
  physics: 'Física',
  chemistry: 'Química',
  vocabulary: 'Vocabulario',
  'computer-science': 'Informática',
  philosophy: 'Filosofía',
  all: 'Todas',
  general: 'General',
};

// Grados (1–12 + pre-k/kinder si aplica)
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

export const GRADE_LABELS: Record<GradeLevel, string> = {
  'pre-k': 'Pre-K',
  k: 'Kinder',
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

export type Difficulty = 'easy' | 'medium' | 'hard';
export const DIFFICULTIES = [
  'easy',
  'medium',
  'hard',
] as const satisfies readonly Difficulty[];
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Difícil',
};

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

export const CATEGORY_LABELS: Record<Category, string> = {
  assessment: 'Evaluación',
  interactive: 'Interactivo',
  programming: 'Programación',
  creative: 'Creativo',
  simulation: 'Simulación',
  'ar-vr': 'AR/VR',
  language: 'Lenguaje',
  stem: 'STEM',
  social: 'Aprendizaje Social',
  gamification: 'Gamificación',
};


export const GAME_TYPES = [
  'multiple-choice',
  'true-false',
  'fill-blank',
  'short-answer',
  'drag-drop',
  'hotspot',
  'sequence',
  'matching',
  'memory-cards',
  'blockly-puzzle',
  'blockly-maze',
  'scratch-project',
  'turtle-blocks',
  'music-blocks',
  'story-creator',
  'art-generator',
  'poetry-maker',
  'physics-sim',
  'chemistry-lab',
  'math-visualizer',
  'geography-explorer',
  'ar-explorer',
  'vr-classroom',
  'mixed-reality',
  'adaptive-quiz',
  'competition',
  'collaborative',
  'peer-review',
  'vocabulary-builder',
  'pronunciation',
  'conversation',
  'grammar-practice',
  'coding-challenge',
  'robotics-sim',
  'data-analysis',
  'experiment-design',
  'discussion-forum',
  'peer-teaching',
  'group-project',
  'presentation',
  'achievement-system',
  'leaderboard',
  'quest-chain',
  'badge-collection',
  'essay',
  'timeline',
  'flashcards',
  'creative-writing',
  'language-arts',
  'field-trip',
  'immersive-learning',
  'personalized-learning',
  'language-learning',
  'language-exchange',
  'writing-practice',
  'programming',
  'engineering',
  'statistics',
  'scientific-method',
  'debate',
  'knowledge-sharing',
  'teamwork',
  'public-speaking',
  'ranking',
  'adventure',
  'progressive-learning',
  'gamification',
  'recognition',
  // Additional from second definition
  'live-quiz',
  'mind-map',
  'branching-scenario',
  'team-challenge',
  'code-challenge',
  'research-methods',
  'critical-thinking',
  'leadership',
] as const satisfies readonly GameType[];

export type AllOr<T extends string> = 'all' | T;
