import { z } from 'zod';

// Tutor Session Management
export const TutorSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subject: z.string(),
  topic: z.string().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  language: z.enum(['es', 'en']).default('es'),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
      timestamp: z.date(),
      metadata: z.record(z.any()).optional(),
    }),
  ),
  studentProfile: z
    .object({
      grade: z.number().int().min(1).max(12),
      learningStyle: z.enum([
        'visual',
        'auditory',
        'kinesthetic',
        'reading_writing',
      ]),
      currentLevel: z.enum(['beginner', 'intermediate', 'advanced']),
      strongAreas: z.array(z.string()),
      challengeAreas: z.array(z.string()),
    })
    .optional(),
  context: z.record(z.any()).optional(),
});

export type TutorSession = z.infer<typeof TutorSessionSchema>;

// Student Query Types
export const QueryTypeSchema = z.enum([
  'explanation_request', // "No entiendo fotosíntesis"
  'problem_solving', // "¿Cómo resuelvo esta ecuación?"
  'concept_clarification', // "¿Cuál es la diferencia entre X y Y?"
  'example_request', // "Dame un ejemplo de..."
  'homework_help', // "Ayúdame con mi tarea"
  'study_guidance', // "¿Cómo estudio para el examen?"
  'general_question', // Pregunta general
]);

export type QueryType = z.infer<typeof QueryTypeSchema>;

// Understanding Level Detection
export const UnderstandingLevelSchema = z.enum([
  'no_understanding', // 0-20%
  'minimal_understanding', // 21-40%
  'partial_understanding', // 41-60%
  'good_understanding', // 61-80%
  'excellent_understanding', // 81-100%
]);

export type UnderstandingLevel = z.infer<typeof UnderstandingLevelSchema>;

// Confusion Indicators
export const ConfusionIndicatorSchema = z.object({
  type: z.enum([
    'vocabulary', // No entiende términos clave
    'concept', // Confusión conceptual
    'procedure', // No sabe los pasos
    'application', // No sabe cuándo usar el concepto
    'connection', // No ve relaciones entre ideas
  ]),
  severity: z.enum(['low', 'medium', 'high']),
  description: z.string(),
  suggestedIntervention: z.string(),
});

export type ConfusionIndicator = z.infer<typeof ConfusionIndicatorSchema>;

// Tutor Response Types
export const TutorResponseSchema = z.object({
  content: z.string(),
  type: z.enum([
    'explanation', // Explicación directa
    'socratic_question', // Pregunta para guiar el pensamiento
    'example', // Ejemplo o analogía
    'step_by_step', // Instrucciones paso a paso
    'encouragement', // Refuerzo positivo
    'clarification', // Aclaración de términos
    'visual_aid', // Sugerencia de elemento visual
    'practice_suggestion', // Sugerencia de práctica
  ]),
  confidence: z.number().min(0).max(1), // Qué tan seguro está el tutor
  adaptations: z
    .array(
      z.object({
        reason: z.string(),
        modification: z.string(),
      }),
    )
    .optional(),
  followUpSuggestions: z.array(z.string()).optional(),
  visualElements: z
    .array(
      z.object({
        type: z.enum(['diagram', 'image', 'animation', 'interactive']),
        description: z.string(),
        url: z.string().optional(),
      }),
    )
    .optional(),
});

export type TutorResponse = z.infer<typeof TutorResponseSchema>;

// Learning Analytics
export const LearningAnalyticsSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  metrics: z.object({
    questionsAsked: z.number().int(),
    conceptsCovered: z.array(z.string()),
    understandingProgression: z.array(
      z.object({
        concept: z.string(),
        initialLevel: UnderstandingLevelSchema,
        finalLevel: UnderstandingLevelSchema,
        improvement: z.number(),
      }),
    ),
    timeSpent: z.number().int(), // segundos
    interventionsUsed: z.array(z.string()),
    successfulExplanations: z.number().int(),
    confusionPoints: z.array(ConfusionIndicatorSchema),
  }),
  insights: z.object({
    primaryLearningStyle: z.string(),
    effectiveExplanationTypes: z.array(z.string()),
    challengingConcepts: z.array(z.string()),
    recommendedNextSteps: z.array(z.string()),
  }),
});

export type LearningAnalytics = z.infer<typeof LearningAnalyticsSchema>;

// DeepSeek API Configuration
export const DeepSeekConfigSchema = z.object({
  apiKey: z.string(),
  baseURL: z.string().default('https://api.deepseek.com'),
  model: z.string().default('deepseek-chat'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().min(100).max(4000).default(1000),
  systemPrompt: z.string(),
});

export type DeepSeekConfig = z.infer<typeof DeepSeekConfigSchema>;

// Explanation Strategies
export const ExplanationStrategySchema = z.object({
  name: z.string(),
  description: z.string(),
  whenToUse: z.array(z.string()),
  template: z.string(),
  examples: z.array(z.string()),
  adaptations: z.record(z.string()), // learning style -> adaptation
});

export type ExplanationStrategy = z.infer<typeof ExplanationStrategySchema>;

// Progress Tracking
export const ProgressTrackingSchema = z.object({
  concept: z.string(),
  startTime: z.date(),
  checkpoints: z.array(
    z.object({
      timestamp: z.date(),
      understanding: UnderstandingLevelSchema,
      feedback: z.string(),
      nextStep: z.string(),
    }),
  ),
  finalAssessment: z
    .object({
      understanding: UnderstandingLevelSchema,
      confidence: z.number().min(0).max(1),
      readyForNext: z.boolean(),
      recommendations: z.array(z.string()),
    })
    .optional(),
});

export type ProgressTracking = z.infer<typeof ProgressTrackingSchema>;
