import { z } from 'zod';

// Question Types
export const QuestionTypeSchema = z.enum([
  'multiple_choice',
  'true_false',
  'fill_blank',
  'short_answer',
  'matching',
  'ordering',
  'drag_drop',
  'hotspot',
  'essay'
]);

export type QuestionType = z.infer<typeof QuestionTypeSchema>;

// Difficulty Levels
export const DifficultyLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert'
]);

export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

// Educational Taxonomies (Bloom's Taxonomy)
export const BloomLevelSchema = z.enum([
  'remember',
  'understand',
  'apply',
  'analyze',
  'evaluate',
  'create'
]);

export type BloomLevel = z.infer<typeof BloomLevelSchema>;

// Content Source
export const ContentSourceSchema = z.object({
  type: z.enum(['text', 'curriculum', 'topic', 'concept_map']),
  content: z.string(),
  metadata: z.record(z.any()).optional()
});

export type ContentSource = z.infer<typeof ContentSourceSchema>;

// Question Generation Parameters
export const QuestionGenerationParamsSchema = z.object({
  subject: z.string(),
  topic: z.string(),
  subtopic: z.string().optional(),
  questionType: QuestionTypeSchema,
  difficulty: DifficultyLevelSchema,
  bloomLevel: BloomLevelSchema,
  language: z.enum(['es', 'en']).default('es'),
  count: z.number().int().min(1).max(50).default(5),
  timeLimit: z.number().int().min(30).max(1800).optional(), // seconds
  includeExplanations: z.boolean().default(true),
  adaptToGrade: z.number().int().min(1).max(12).optional(),
  includeVisuals: z.boolean().default(false),
  avoidBias: z.boolean().default(true)
});

export type QuestionGenerationParams = z.infer<typeof QuestionGenerationParamsSchema>;

// Generated Question
export const GeneratedQuestionSchema = z.object({
  id: z.string(),
  type: QuestionTypeSchema,
  subject: z.string(),
  topic: z.string(),
  question: z.string(),
  options: z.array(z.string()).optional(), // For MCQ, matching, etc.
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  difficulty: DifficultyLevelSchema,
  bloomLevel: BloomLevelSchema,
  timeEstimate: z.number().int().min(10).max(600), // seconds
  tags: z.array(z.string()).optional(),
  visualElements: z.array(z.object({
    type: z.enum(['image', 'diagram', 'chart']),
    url: z.string(),
    description: z.string()
  })).optional(),
  metadata: z.record(z.any()).optional()
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

// Quiz Template
export const QuizTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  subject: z.string(),
  questionTypes: z.array(QuestionTypeSchema),
  difficultyDistribution: z.record(DifficultyLevelSchema, z.number()).optional(), // percentage
  bloomDistribution: z.record(BloomLevelSchema, z.number()).optional(), // percentage
  totalQuestions: z.number().int().min(1).max(100),
  timeLimit: z.number().int().min(300).max(7200), // seconds
  passingScore: z.number().min(0).max(1).default(0.7), // 70%
  shuffleQuestions: z.boolean().default(true),
  shuffleOptions: z.boolean().default(true),
  allowRetakes: z.boolean().default(true),
  showFeedback: z.enum(['immediate', 'end', 'never']).default('immediate')
});

export type QuizTemplate = z.infer<typeof QuizTemplateSchema>;

// Generated Quiz
export const GeneratedQuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  subject: z.string(),
  topics: z.array(z.string()),
  questions: z.array(GeneratedQuestionSchema),
  difficulty: DifficultyLevelSchema,
  estimatedTime: z.number().int().min(300).max(7200), // seconds
  passingScore: z.number().min(0).max(1),
  settings: z.object({
    shuffleQuestions: z.boolean(),
    shuffleOptions: z.boolean(),
    showFeedback: z.boolean(),
    allowRetakes: z.boolean(),
    timeLimit: z.number().int().optional()
  }),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  createdBy: z.string().optional()
});

export type GeneratedQuiz = z.infer<typeof GeneratedQuizSchema>;

// Curriculum Standards (for alignment)
export const CurriculumStandardSchema = z.object({
  id: z.string(),
  country: z.string(),
  level: z.string(), // elementary, middle, high school
  subject: z.string(),
  topic: z.string(),
  standard: z.string(),
  description: z.string(),
  learningObjectives: z.array(z.string()),
  prerequisites: z.array(z.string()),
  keywords: z.array(z.string())
});

export type CurriculumStandard = z.infer<typeof CurriculumStandardSchema>;

// Question Quality Metrics
export const QuestionQualitySchema = z.object({
  clarity: z.number().min(0).max(1), // How clear is the question?
  difficulty: z.number().min(0).max(1), // How difficult is it?
  discrimination: z.number().min(0).max(1), // How well does it separate high/low performers?
  bias: z.number().min(0).max(1), // How biased is the question?
  pedagogicalValue: z.number().min(0).max(1), // Educational worth
  overallScore: z.number().min(0).max(1)
});

export type QuestionQuality = z.infer<typeof QuestionQualitySchema>;

// Generation Context
export interface GenerationContext {
  userProfile?: {
    grade: number;
    learningStyle: string;
    strongSubjects: string[];
    weakSubjects: string[];
  };
  classContext?: {
    averagePerformance: number;
    commonMistakes: string[];
    recentTopics: string[];
  };
  pedagogicalGoals?: {
    focusAreas: string[];
    skillsToReinforce: string[];
    assessmentType: 'formative' | 'summative' | 'diagnostic';
  };
}