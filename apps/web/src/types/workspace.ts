// Temporary type definitions for workspace packages during deployment
// These will be replaced with proper imports once workspace resolution is fixed

// @fuzzy/game-engine types
export interface GameItem {
  id: string;
  text: string;
  image?: string;
}

export interface GameChoice {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface MultipleChoiceGame {
  id: string;
  title: string;
  question: string;
  choices: GameChoice[];
  explanation?: string;
}

export interface TrueFalseGame {
  id: string;
  title: string;
  question: string;
  correctAnswer: boolean;
  explanation?: string;
}

export interface DragDropGame {
  id: string;
  title: string;
  items: GameItem[];
  dropZones: GameItem[];
  explanation?: string;
}

export interface MemoryCardsGame {
  id: string;
  title: string;
  pairs: { id: string; text: string; match: string }[];
}

export interface CrosswordGame {
  id: string;
  title: string;
  words: { word: string; clue: string; x: number; y: number; direction: 'across' | 'down' }[];
  grid: (string | null)[][];
  clues: {
    across: { number: number; clue: string; answer: string; startRow: number; startCol: number }[];
    down: { number: number; clue: string; answer: string; startRow: number; startCol: number }[];
  };
}

export interface BranchingScenarioGame {
  id: string;
  title: string;
  scenario: string;
  startNode: string;
  nodes: Array<{
    id: string;
    text: string;
    content: string;
    media?: string;
    options: Array<{
      text: string;
      next: string;
      points?: number;
    }>;
  }>;
  choices: { text: string; outcome: string; nextScenario?: string }[];
}

export interface HotspotGame {
  id: string;
  title: string;
  image: string;
  hotspots: { x: number; y: number; width: number; height: number; feedback: string }[];
}

export interface MatchGame {
  id: string;
  title: string;
  items: { id: string; text: string; category: string }[];
  categories: string[];
}

export interface TimelineGame {
  id: string;
  title: string;
  events: { id: string; date: string; title: string; description: string }[];
}

export interface ImageSequenceGame {
  id: string;
  title: string;
  images: { id: string; url: string; order: number; description: string }[];
}

export interface GapFillGame {
  id: string;
  title: string;
  text: string;
  gaps: { position: number; answer: string; options?: string[] }[];
}

// @fuzzy/quiz-generator types
export interface GeneratedQuestion {
  id: string;
  type: string;
  subject: string;
  topic: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: string;
  bloomLevel: string;
  timeEstimate: number;
}

// @fuzzy/h5p-adapter types
export interface H5PContent {
  id: string;
  title: string;
  library: string;
  params: any;
}

export interface H5PLibrary {
  machineName: string;
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  title: string;
}

// @fuzzy/adaptive-engine types
export interface AdaptiveProfile {
  userId: string;
  learningStyle: string;
  strengths: string[];
  weaknesses: string[];
  preferredDifficulty: string;
}

// @fuzzy/external-games types
export interface ExternalGame {
  id: string;
  name: string;
  type: 'h5p' | 'jclic' | 'classquiz';
  url: string;
  metadata: any;
}