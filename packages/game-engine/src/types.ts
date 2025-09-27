import { z } from 'zod';

export enum GameType {
  MCQ = 'mcq',
  TrueFalse = 'true_false',
  ShortAnswer = 'short_answer',
  DragDrop = 'drag_drop',
  Hotspot = 'hotspot',
  ImageSequence = 'image_sequence',
  GapFill = 'gap_fill',
  Crossword = 'crossword',
  WordSearch = 'word_search',
  MemoryCards = 'memory_cards',
  Flashcards = 'flashcards',
  BranchingScenario = 'branching_scenario',
  Timeline = 'timeline',
  MindMap = 'mind_map',
  LiveQuiz = 'live_quiz',
  TeamChallenge = 'team_challenge',
  ColonialRally = 'colonial_rally',
  MathSolver = 'math_solver',
  CodeChallenge = 'code_challenge',
  Match = 'match'
}

export interface BaseGame {
  id: string;
  type: GameType;
  title: string;
  description?: string;
  difficulty: number; // 0-1
  timeLimit?: number; // seconds
  points?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface GameSession {
  id: string;
  gameId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  score: number;
  maxScore: number;
  attempts: GameAttempt[];
  feedback?: string;
}

export interface GameAttempt {
  questionId: string;
  answer: any;
  correct: boolean;
  score: number;
  timeSpent: number;
  feedback?: string;
}

// MCQ Game Schema
export const MCQGameSchema = z.object({
  type: z.literal(GameType.MCQ),
  stem: z.string(),
  choices: z.array(z.object({
    id: z.string(),
    text: z.string(),
    correct: z.boolean().optional()
  })),
  explanation: z.string().optional(),
  multipleAnswers: z.boolean().optional()
});

// True/False Schema
export const TrueFalseSchema = z.object({
  type: z.literal(GameType.TrueFalse),
  statement: z.string(),
  correct: z.boolean(),
  explanation: z.string().optional()
});

// Drag Drop Schema
export const DragDropSchema = z.object({
  type: z.literal(GameType.DragDrop),
  items: z.array(z.object({
    id: z.string(),
    content: z.string(),
    targetZone: z.string()
  })),
  zones: z.array(z.object({
    id: z.string(),
    label: z.string(),
    maxItems: z.number().optional()
  }))
});

// Hotspot Schema
export const HotspotSchema = z.object({
  type: z.literal(GameType.Hotspot),
  image: z.string(),
  targets: z.array(z.object({
    x: z.number(), // percentage 0-100
    y: z.number(), // percentage 0-100
    radius: z.number(), // percentage
    label: z.string(),
    correct: z.boolean()
  }))
});

// Gap Fill Schema
export const GapFillSchema = z.object({
  type: z.literal(GameType.GapFill),
  text: z.string(), // Text with _____ for gaps
  answers: z.array(z.array(z.string())), // Multiple correct answers per gap
  caseSensitive: z.boolean().optional()
});

// Image Sequence Schema
export const ImageSequenceSchema = z.object({
  type: z.literal(GameType.ImageSequence),
  items: z.array(z.object({
    id: z.string(),
    image: z.string(),
    caption: z.string().optional()
  })),
  correctOrder: z.array(z.number())
});

// Branching Scenario Schema
export const BranchingScenarioSchema = z.object({
  type: z.literal(GameType.BranchingScenario),
  nodes: z.array(z.object({
    id: z.string(),
    content: z.string(),
    media: z.string().optional(),
    options: z.array(z.object({
      text: z.string(),
      next: z.string(),
      points: z.number().optional()
    }))
  })),
  startNode: z.string()
});

// Memory Cards Schema
export const MemoryCardsSchema = z.object({
  type: z.literal(GameType.MemoryCards),
  pairs: z.array(z.object({
    id: z.string(),
    front: z.string(),
    back: z.string(),
    image: z.string().optional()
  })),
  gridSize: z.object({
    rows: z.number(),
    cols: z.number()
  })
});

// Match Schema
export const MatchSchema = z.object({
  type: z.literal(GameType.Match),
  pairs: z.array(z.object({
    left: z.string(),
    right: z.string()
  })),
  shuffle: z.boolean().optional()
});

// Timeline Schema
export const TimelineSchema = z.object({
  type: z.literal(GameType.Timeline),
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    date: z.string(),
    description: z.string().optional(),
    image: z.string().optional()
  })),
  displayDates: z.boolean().optional()
});

// Crossword Schema
export const CrosswordSchema = z.object({
  type: z.literal(GameType.Crossword),
  grid: z.array(z.array(z.string().nullable())),
  clues: z.object({
    across: z.array(z.object({
      number: z.number(),
      clue: z.string(),
      answer: z.string(),
      startRow: z.number(),
      startCol: z.number()
    })),
    down: z.array(z.object({
      number: z.number(),
      clue: z.string(),
      answer: z.string(),
      startRow: z.number(),
      startCol: z.number()
    }))
  })
});

// Union of all game schemas
export const GameContentSchema = z.discriminatedUnion('type', [
  MCQGameSchema,
  TrueFalseSchema,
  DragDropSchema,
  HotspotSchema,
  GapFillSchema,
  ImageSequenceSchema,
  BranchingScenarioSchema,
  MemoryCardsSchema,
  MatchSchema,
  TimelineSchema,
  CrosswordSchema
]);

export type GameContent = z.infer<typeof GameContentSchema>;
export type MCQGame = z.infer<typeof MCQGameSchema>;
export type TrueFalseGame = z.infer<typeof TrueFalseSchema>;
export type DragDropGame = z.infer<typeof DragDropSchema>;
export type HotspotGame = z.infer<typeof HotspotSchema>;
export type GapFillGame = z.infer<typeof GapFillSchema>;
export type ImageSequenceGame = z.infer<typeof ImageSequenceSchema>;
export type BranchingScenarioGame = z.infer<typeof BranchingScenarioSchema>;
export type MemoryCardsGame = z.infer<typeof MemoryCardsSchema>;
export type MatchGame = z.infer<typeof MatchSchema>;
export type TimelineGame = z.infer<typeof TimelineSchema>;
export type CrosswordGame = z.infer<typeof CrosswordSchema>;