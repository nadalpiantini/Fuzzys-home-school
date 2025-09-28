import { z } from 'zod';

// H5P Content Types Schema
export const H5PContentTypeSchema = z.enum([
  'drag_drop_advanced',
  'hotspot_image',
  'branching_scenario',
  'interactive_video',
  'image_sequence_advanced',
  'timeline_interactive',
  'accordion',
  'collage',
  'image_hotspots',
  'image_slider',
  'speak_the_words',
  'find_the_words',
  'mark_the_words',
  'sort_paragraphs',
  'dialog_cards',
  'course_presentation',
  'drag_the_words'
]);

export type H5PContentType = z.infer<typeof H5PContentTypeSchema>;

// Base H5P Content Structure
export const H5PContentSchema = z.object({
  id: z.string(),
  type: H5PContentTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  params: z.record(z.any()),
  library: z.string(),
  language: z.enum(['es', 'en']).default('es')
});

export type H5PContent = z.infer<typeof H5PContentSchema>;

// Specific H5P Content Types
export const DragDropAdvancedSchema = z.object({
  type: z.literal('drag_drop_advanced'),
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
      type: z.enum(['image', 'text']),
      content: z.string(),
      multiple: z.boolean().default(false)
    })),
    feedback: z.object({
      correct: z.string(),
      incorrect: z.string()
    })
  })
});

export const HotspotImageSchema = z.object({
  type: z.literal('hotspot_image'),
  params: z.object({
    image: z.object({
      url: z.string(),
      alt: z.string()
    }),
    hotspots: z.array(z.object({
      id: z.string(),
      x: z.number(),
      y: z.number(),
      content: z.object({
        header: z.string(),
        text: z.string(),
        image: z.string().optional()
      })
    }))
  })
});

export const BranchingScenarioSchema = z.object({
  type: z.literal('branching_scenario'),
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

export const InteractiveVideoSchema = z.object({
  type: z.literal('interactive_video'),
  params: z.object({
    video: z.object({
      url: z.string(),
      startScreenOptions: z.object({
        title: z.string(),
        hideStartTitle: z.boolean().default(false)
      })
    }),
    interactions: z.array(z.object({
      id: z.string(),
      time: z.number(),
      duration: z.number().optional(),
      pauseVideo: z.boolean().default(false),
      displayType: z.enum(['button', 'poster', 'inline']),
      content: z.object({
        type: z.enum(['text', 'mcq', 'fill-blanks', 'drag-text']),
        question: z.string(),
        answers: z.array(z.string()).optional(),
        correct: z.array(z.number()).optional()
      })
    }))
  })
});

export const DialogCardsSchema = z.object({
  type: z.literal('dialog_cards'),
  params: z.object({
    title: z.string(),
    description: z.string().optional(),
    cards: z.array(z.object({
      text: z.string(),
      answer: z.string(),
      image: z.object({
        url: z.string(),
        alt: z.string()
      }).optional(),
      audio: z.string().optional(),
      tips: z.array(z.string()).optional()
    })),
    behaviour: z.object({
      enableRetry: z.boolean().default(true),
      randomCards: z.boolean().default(false),
      maxProficiency: z.number().default(5)
    })
  })
});

export const CoursePresentationSchema = z.object({
  type: z.literal('course_presentation'),
  params: z.object({
    title: z.string(),
    slides: z.array(z.object({
      id: z.string(),
      elements: z.array(z.object({
        type: z.enum(['text', 'image', 'video', 'mcq', 'fill-blanks', 'drag-drop']),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        content: z.any()
      })),
      background: z.object({
        color: z.string().optional(),
        image: z.string().optional()
      }).optional()
    })),
    settings: z.object({
      showProgressBar: z.boolean().default(true),
      showSummarySlide: z.boolean().default(true),
      enableKeyboardNavigation: z.boolean().default(true)
    })
  })
});

export const DragTheWordsSchema = z.object({
  type: z.literal('drag_the_words'),
  params: z.object({
    taskDescription: z.string(),
    textField: z.string(), // Text with *draggable words* marked
    checkAnswer: z.string().default('Check'),
    tryAgain: z.string().default('Try again'),
    showSolution: z.string().default('Show solution'),
    behaviour: z.object({
      enableRetry: z.boolean().default(true),
      enableSolutionsButton: z.boolean().default(true),
      instantFeedback: z.boolean().default(false)
    })
  })
});

export const MarkTheWordsSchema = z.object({
  type: z.literal('mark_the_words'),
  params: z.object({
    taskDescription: z.string(),
    textField: z.string(), // Text with *correct answers* marked
    checkAnswer: z.string().default('Check'),
    tryAgain: z.string().default('Try again'),
    showSolution: z.string().default('Show solution'),
    behaviour: z.object({
      enableRetry: z.boolean().default(true),
      enableSolutionsButton: z.boolean().default(true),
      showScorePoints: z.boolean().default(true)
    })
  })
});

// H5P Interaction Events
export interface H5PEvent {
  type: 'completed' | 'progress' | 'score' | 'interaction';
  data: {
    score?: number;
    maxScore?: number;
    completion?: number;
    answered?: boolean;
    response?: string;
    correct?: boolean;
  };
}

// H5P Component Props
export interface H5PComponentProps {
  content: H5PContent;
  onEvent?: (event: H5PEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

export type H5PSpecificContent =
  | z.infer<typeof DragDropAdvancedSchema>
  | z.infer<typeof HotspotImageSchema>
  | z.infer<typeof BranchingScenarioSchema>
  | z.infer<typeof InteractiveVideoSchema>
  | z.infer<typeof DialogCardsSchema>
  | z.infer<typeof CoursePresentationSchema>
  | z.infer<typeof DragTheWordsSchema>
  | z.infer<typeof MarkTheWordsSchema>;