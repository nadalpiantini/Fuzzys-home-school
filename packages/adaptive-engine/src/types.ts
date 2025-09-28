import { z } from 'zod';

// Learning Styles
export const LearningStyleSchema = z.enum([
  'visual',
  'auditory',
  'kinesthetic',
  'reading_writing',
  'multimodal'
]);

export type LearningStyle = z.infer<typeof LearningStyleSchema>;

// Knowledge State
export const KnowledgeStateSchema = z.object({
  concept: z.string(),
  mastery: z.number().min(0).max(1), // 0-1 scale
  confidence: z.number().min(0).max(1),
  lastReviewed: z.date(),
  reviewCount: z.number().int().min(0),
  errorPatterns: z.array(z.string())
});

export type KnowledgeState = z.infer<typeof KnowledgeStateSchema>;

// Learning Profile
export const LearningProfileSchema = z.object({
  userId: z.string(),
  learningStyle: LearningStyleSchema,
  knowledgeMap: z.record(z.string(), KnowledgeStateSchema), // concept -> knowledge state
  preferences: z.object({
    difficulty: z.number().min(0).max(1), // preferred difficulty 0-1
    sessionLength: z.number().int().min(5).max(120), // minutes
    gameTypes: z.array(z.string()),
    feedbackStyle: z.enum(['immediate', 'delayed', 'summary'])
  }),
  performance: z.object({
    averageScore: z.number().min(0).max(1),
    streakDays: z.number().int().min(0),
    totalStudyTime: z.number().int().min(0), // minutes
    completedActivities: z.number().int().min(0)
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type LearningProfile = z.infer<typeof LearningProfileSchema>;

// Activity Attempt
export const ActivityAttemptSchema = z.object({
  id: z.string(),
  userId: z.string(),
  activityId: z.string(),
  gameType: z.string(),
  concept: z.string(),
  difficulty: z.number().min(0).max(1),
  startTime: z.date(),
  endTime: z.date().optional(),
  score: z.number().min(0).max(1),
  timeSpent: z.number().int().min(0), // seconds
  hintsUsed: z.number().int().min(0),
  mistakes: z.array(z.object({
    question: z.string(),
    userAnswer: z.string(),
    correctAnswer: z.string(),
    errorType: z.string()
  })),
  completed: z.boolean()
});

export type ActivityAttempt = z.infer<typeof ActivityAttemptSchema>;

// Adaptive Recommendation
export const AdaptiveRecommendationSchema = z.object({
  type: z.enum(['next_activity', 'difficulty_adjustment', 'concept_review', 'break_suggestion']),
  activityId: z.string().optional(),
  gameType: z.string().optional(),
  concept: z.string().optional(),
  difficulty: z.number().min(0).max(1).optional(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1), // how confident the engine is
  priority: z.enum(['low', 'medium', 'high']),
  estimatedTime: z.number().int().min(1).max(60), // minutes
  metadata: z.record(z.any()).optional()
});

export type AdaptiveRecommendation = z.infer<typeof AdaptiveRecommendationSchema>;

// Zone of Proximal Development
export const ZPDAssessmentSchema = z.object({
  concept: z.string(),
  currentLevel: z.number().min(0).max(1),
  targetLevel: z.number().min(0).max(1),
  scaffoldingNeeded: z.array(z.string()),
  readinessIndicators: z.array(z.string()),
  nextConcepts: z.array(z.string())
});

export type ZPDAssessment = z.infer<typeof ZPDAssessmentSchema>;

// Error Analysis
export const ErrorPatternSchema = z.object({
  pattern: z.string(),
  frequency: z.number().int().min(1),
  concept: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  remediation: z.array(z.string()),
  lastSeen: z.date()
});

export type ErrorPattern = z.infer<typeof ErrorPatternSchema>;

// Adaptive Engine Configuration
export const AdaptiveConfigSchema = z.object({
  difficultyAdjustmentFactor: z.number().min(0.1).max(0.5).default(0.2),
  masteryThreshold: z.number().min(0.6).max(0.95).default(0.8),
  reviewSpacingBase: z.number().min(1).max(7).default(2), // days
  maxDifficultyJump: z.number().min(0.1).max(0.3).default(0.2),
  minSessionGap: z.number().int().min(1).max(60).default(5), // minutes
  errorWeightFactor: z.number().min(0.1).max(0.5).default(0.3)
});

export type AdaptiveConfig = z.infer<typeof AdaptiveConfigSchema>;