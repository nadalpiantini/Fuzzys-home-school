// Temporary local type definitions for deployment
// These types should match the @fuzzy/game-engine types

export interface DragDropGame {
  id: string;
  title: string;
  description?: string;
  items: Array<{ id: string; content: string; targetZone?: string }>;
  zones: Array<{ id: string; label: string; accepts?: string[] }>;
  correctAnswers?: Record<string, string[]>;
}

export interface GapFillGame {
  id: string;
  title: string;
  description?: string;
  text: string;
  gaps: Array<{ id: string; correctAnswer: string; alternatives?: string[] }>;
  correctAnswers?: Record<string, string>;
  caseSensitive?: boolean;
}

export interface MCQGame {
  id: string;
  title: string;
  description?: string;
  question: string;
  stem?: string;
  options: Array<{ id: string; text: string; correct?: boolean }>;
  choices?: Array<{ id: string; text: string; correct?: boolean }>;
  correctAnswer?: string;
  multipleAnswers?: boolean;
}

export interface TrueFalseGame {
  id: string;
  title: string;
  description?: string;
  statement: string;
  correctAnswer: boolean;
}

export interface MatchGame {
  id: string;
  title: string;
  description?: string;
  leftItems: Array<{ id: string; content: string }>;
  rightItems: Array<{ id: string; content: string }>;
  correctMatches?: Record<string, string>;
  pairs?: Array<{ left: string; right: string }>;
  shuffle?: boolean;
}

export interface MemoryCardsGame {
  id: string;
  title: string;
  description?: string;
  cards: Array<{ id: string; content: string; pairId: string }>;
  pairs?: Array<{
    id: string;
    content: string;
    pairId: string;
    front?: string;
    back?: string;
    image?: string;
  }>;
  gridSize?: { cols: number; rows: number };
}

export interface HotspotGame {
  id: string;
  title: string;
  description?: string;
  image: string;
  hotspots: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    correct?: boolean;
  }>;
  targets?: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;
    correct?: boolean;
  }>;
}

export interface TimelineGame {
  id: string;
  title: string;
  description?: string;
  events: Array<{
    id: string;
    content: string;
    date: string;
    title?: string;
    image?: string;
    description?: string;
    correctOrder?: number;
  }>;
  displayDates?: boolean;
}

export interface ImageSequenceGame {
  id: string;
  title: string;
  description?: string;
  images: Array<{ id: string; src: string; correctOrder?: number }>;
  items?: Array<{
    id: string;
    src: string;
    image?: string;
    caption?: string;
    correctOrder?: number;
  }>;
  correctOrder?: number[];
}
