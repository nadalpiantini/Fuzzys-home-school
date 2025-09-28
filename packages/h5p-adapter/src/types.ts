import { z } from 'zod';

// H5P Event Types
export interface H5PEvent {
  type: 'interaction' | 'progress' | 'completed' | 'started' | 'stopped' | 'score';
  data: {
    score?: number;
    maxScore?: number;
    completion?: number;
    response?: string;
    answered?: boolean;
    correct?: boolean;
    [key: string]: any;
  };
}

// H5P Content Types
export interface H5PContent {
  id: string;
  title: string;
  library: string;
  type: string;
  description?: string;
  params: any;
  metadata?: Record<string, any>;
  language?: string;
}

// Alias for backward compatibility
export type H5PContentType = H5PContent;

// H5P Component Props
export interface H5PComponentProps {
  content: H5PContent;
  onEvent?: (event: H5PEvent) => void;
  onProgress?: (progress: any) => void;
  onCompleted?: (score: any, maxScore: any) => void;
  enableFullscreen?: boolean;
  showCopyright?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// H5P Content Type Schemas
export const DragDropAdvancedSchema = z.object({
  params: z.object({
    taskDescription: z.string(),
    dropzones: z.array(z.object({
      id: z.string(),
      label: z.string(),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      correctElements: z.array(z.string())
    })),
    draggables: z.array(z.object({
      id: z.string(),
      type: z.enum(['text', 'image']),
      content: z.string(),
      multiple: z.boolean().optional()
    })),
    feedback: z.object({
      correct: z.string(),
      incorrect: z.string()
    })
  })
});

export const HotspotImageSchema = z.object({
  params: z.object({
    image: z.string(),
    hotspots: z.array(z.object({
      id: z.string(),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      content: z.string(),
      feedback: z.string()
    }))
  })
});

export const BranchingScenarioSchema = z.object({
  params: z.object({
    title: z.string(),
    startingScreen: z.string(),
    screens: z.array(z.object({
      id: z.string(),
      content: z.string(),
      choices: z.array(z.object({
        text: z.string(),
        nextScreen: z.string(),
        feedback: z.string().optional()
      }))
    }))
  })
});

export const CoursePresentationSchema = z.object({
  params: z.object({
    title: z.string(),
    slides: z.array(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      elements: z.array(z.any())
    }))
  })
});

export const DialogCardsSchema = z.object({
  params: z.object({
    title: z.string(),
    cards: z.array(z.object({
      id: z.string(),
      text: z.string(),
      answer: z.string(),
      tip: z.string().optional()
    }))
  })
});

export const DragTheWordsSchema = z.object({
  params: z.object({
    taskDescription: z.string(),
    textField: z.string(),
    correctWords: z.array(z.string())
  })
});

export const InteractiveVideoSchema = z.object({
  params: z.object({
    title: z.string(),
    video: z.object({
      sources: z.array(z.object({
        src: z.string(),
        type: z.string()
      }))
    }),
    interactions: z.array(z.any())
  })
});

// H5P Library Types
export interface H5PLibrary {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subject: string;
  estimatedTime: number;
  rating: number;
  completions: number;
  tags: string[];
}

// H5P Progress Types
export interface H5PProgress {
  contentId: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  interactions: number;
  completion: number;
  passed: boolean;
}