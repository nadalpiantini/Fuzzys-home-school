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

// Tipos específicos para los filtros
export type Subject =
  | 'math'
  | 'science'
  | 'spanish'
  | 'english'
  | 'history'
  | 'geography'
  | 'art'
  | 'music'
  | 'technology'
  | 'coding';

export type GradeLevel =
  | 'prek'
  | 'k'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8';

// Tipos de dificultad unificados
export type DifficultyStd = 'easy' | 'medium' | 'hard';
export type DifficultyAlt = 'beginner' | 'intermediate' | 'advanced';
export type Difficulty = DifficultyStd | DifficultyAlt;

export type Category = 'quiz' | 'interactive' | 'creative' | 'stem';

// Útil para selects ('all' | T)
export type AllOr<T extends string> = 'all' | T;

// (Opcional) Si conviertes strings a GameType dinámicamente:
export function isGameType(x: string): x is GameType {
  return !!x; // deja simple: sólo afina si validas contra una whitelist
}
