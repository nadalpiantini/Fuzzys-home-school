import { z } from 'zod';

// Schemas for quiz generation
export const QuizQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['mcq', 'true_false', 'short_answer', 'fill_blank', 'essay']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  category: z.string(),
  topic: z.string(),
  stem: z.string(),
  choices: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        correct: z.boolean(),
      }),
    )
    .optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string(),
  points: z.number().default(100),
  timeLimit: z.number().default(30),
  bloomsTaxonomy: z.enum([
    'remember',
    'understand',
    'apply',
    'analyze',
    'evaluate',
    'create',
  ]),
  keywords: z.array(z.string()),
});

export const GeneratedQuizSchema = z.object({
  title: z.string(),
  description: z.string(),
  subject: z.string(),
  gradeLevel: z.string(),
  estimatedDuration: z.number(),
  questions: z.array(QuizQuestionSchema),
  metadata: z.object({
    sourceDocument: z.string().optional(),
    generationDate: z.date(),
    difficultyDistribution: z.object({
      easy: z.number(),
      medium: z.number(),
      hard: z.number(),
    }),
    taxonomyDistribution: z.object({
      remember: z.number(),
      understand: z.number(),
      apply: z.number(),
      analyze: z.number(),
      evaluate: z.number(),
      create: z.number(),
    }),
  }),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type GeneratedQuiz = z.infer<typeof GeneratedQuizSchema>;

export interface QuizGenerationOptions {
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  questionTypes?: Array<
    'mcq' | 'true_false' | 'short_answer' | 'fill_blank' | 'essay'
  >;
  bloomsLevels?: Array<
    'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
  >;
  language?: 'es' | 'en';
  gradeLevel?: string;
  subject?: string;
  focusTopics?: string[];
  avoidTopics?: string[];
}

export class AIQuizGenerator {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || '';
    this.baseUrl =
      baseUrl || process.env.OPENAI_BASE_URL || 'https://api.deepseek.com';
  }

  /**
   * Generate quiz from text content
   */
  async generateFromText(
    content: string,
    options: QuizGenerationOptions = {},
  ): Promise<GeneratedQuiz> {
    const prompt = this.buildQuizPrompt(content, options);

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are an expert educational content creator specializing in generating high-quality quiz questions.
              Create questions that are pedagogically sound, age-appropriate, and aligned with learning objectives.
              Always respond with valid JSON that matches the expected schema.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const rawQuiz = JSON.parse(data.choices[0].message.content);

      // Validate and transform the response
      return this.validateAndTransformQuiz(rawQuiz, content, options);
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error(
        `Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate quiz from PDF/document file
   */
  async generateFromDocument(
    file: File,
    options: QuizGenerationOptions = {},
  ): Promise<GeneratedQuiz> {
    const content = await this.extractTextFromFile(file);
    return this.generateFromText(content, {
      ...options,
      subject: options.subject || this.inferSubjectFromFilename(file.name),
    });
  }

  /**
   * Generate quiz from URL
   */
  async generateFromUrl(
    url: string,
    options: QuizGenerationOptions = {},
  ): Promise<GeneratedQuiz> {
    const content = await this.extractTextFromUrl(url);
    return this.generateFromText(content, options);
  }

  /**
   * Generate adaptive questions based on student performance
   */
  async generateAdaptiveQuestions(
    previousAnswers: Array<{
      questionId: string;
      correct: boolean;
      topic: string;
      difficulty: string;
    }>,
    options: QuizGenerationOptions = {},
  ): Promise<QuizQuestion[]> {
    // Analyze performance patterns
    const performanceAnalysis = this.analyzePerformance(previousAnswers);

    // Adjust difficulty and topics based on performance
    const adaptiveOptions = {
      ...options,
      difficulty: performanceAnalysis.suggestedDifficulty,
      focusTopics: performanceAnalysis.weakTopics,
      bloomsLevels: performanceAnalysis.targetTaxonomyLevels as (
        | 'remember'
        | 'understand'
        | 'apply'
        | 'analyze'
        | 'evaluate'
        | 'create'
      )[],
    };

    const prompt = this.buildAdaptivePrompt(
      performanceAnalysis,
      adaptiveOptions,
    );

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are an adaptive learning AI that creates personalized quiz questions based on student performance data.
              Generate questions that address knowledge gaps and gradually increase difficulty.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 3000,
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      const questions = JSON.parse(data.choices[0].message.content).questions;

      return questions.map((q: any) => QuizQuestionSchema.parse(q));
    } catch (error) {
      console.error('Error generating adaptive questions:', error);
      throw new Error(
        `Failed to generate adaptive questions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private buildQuizPrompt(
    content: string,
    options: QuizGenerationOptions,
  ): string {
    const {
      questionCount = 10,
      difficulty = 'mixed',
      questionTypes = ['mcq', 'true_false', 'short_answer'],
      bloomsLevels = ['remember', 'understand', 'apply'],
      language = 'es',
      gradeLevel = 'middle school',
      subject = 'general',
    } = options;

    return `Generate a quiz with ${questionCount} questions based on the following content:

CONTENT:
${content}

REQUIREMENTS:
- Language: ${language === 'es' ? 'Spanish' : 'English'}
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Difficulty: ${difficulty}
- Question Types: ${questionTypes.join(', ')}
- Bloom's Taxonomy Levels: ${bloomsLevels.join(', ')}

INSTRUCTIONS:
1. Create diverse questions covering key concepts from the content
2. Include clear explanations for all answers
3. Ensure questions are age-appropriate and pedagogically sound
4. For multiple choice questions, provide 4 options with exactly one correct answer
5. Include distractors that represent common misconceptions
6. Vary question difficulty and cognitive levels
7. Add relevant keywords for each question

Return your response as a JSON object with this structure:
{
  "title": "Quiz title",
  "description": "Brief description",
  "subject": "${subject}",
  "gradeLevel": "${gradeLevel}",
  "estimatedDuration": 600,
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "difficulty": "easy",
      "category": "Topic category",
      "topic": "Specific topic",
      "stem": "Question text",
      "choices": [
        {"id": "a", "text": "Option A", "correct": false},
        {"id": "b", "text": "Option B", "correct": true},
        {"id": "c", "text": "Option C", "correct": false},
        {"id": "d", "text": "Option D", "correct": false}
      ],
      "explanation": "Detailed explanation of the answer",
      "points": 100,
      "timeLimit": 30,
      "bloomsTaxonomy": "understand",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}`;
  }

  private buildAdaptivePrompt(
    performanceAnalysis: any,
    options: QuizGenerationOptions,
  ): string {
    return `Generate ${options.questionCount || 5} adaptive quiz questions based on this performance analysis:

PERFORMANCE DATA:
- Accuracy: ${performanceAnalysis.accuracy}%
- Weak Topics: ${performanceAnalysis.weakTopics.join(', ')}
- Strong Topics: ${performanceAnalysis.strongTopics.join(', ')}
- Suggested Difficulty: ${performanceAnalysis.suggestedDifficulty}
- Learning Gaps: ${performanceAnalysis.learningGaps.join(', ')}

ADAPTIVE STRATEGY:
- Focus on weak topics while reinforcing strengths
- Gradually increase difficulty
- Address identified learning gaps
- Provide scaffolding through question progression

Return questions in JSON format following the same schema as before.`;
  }

  private analyzePerformance(
    answers: Array<{
      questionId: string;
      correct: boolean;
      topic: string;
      difficulty: string;
    }>,
  ) {
    const totalAnswers = answers.length;
    const correctAnswers = answers.filter((a) => a.correct).length;
    const accuracy = (correctAnswers / totalAnswers) * 100;

    // Group by topic
    const topicPerformance = answers.reduce(
      (acc, answer) => {
        if (!acc[answer.topic]) {
          acc[answer.topic] = { correct: 0, total: 0 };
        }
        acc[answer.topic].total++;
        if (answer.correct) acc[answer.topic].correct++;
        return acc;
      },
      {} as Record<string, { correct: number; total: number }>,
    );

    // Identify weak and strong topics
    const weakTopics = Object.entries(topicPerformance)
      .filter(([_, perf]) => perf.correct / perf.total < 0.6)
      .map(([topic]) => topic);

    const strongTopics = Object.entries(topicPerformance)
      .filter(([_, perf]) => perf.correct / perf.total >= 0.8)
      .map(([topic]) => topic);

    // Determine suggested difficulty
    let suggestedDifficulty: 'easy' | 'medium' | 'hard';
    if (accuracy >= 80) suggestedDifficulty = 'hard';
    else if (accuracy >= 60) suggestedDifficulty = 'medium';
    else suggestedDifficulty = 'easy';

    // Determine target taxonomy levels
    const targetTaxonomyLevels =
      accuracy >= 70
        ? ['apply', 'analyze', 'evaluate']
        : ['remember', 'understand', 'apply'];

    return {
      accuracy,
      weakTopics,
      strongTopics,
      suggestedDifficulty,
      targetTaxonomyLevels,
      learningGaps: weakTopics, // Simplified for this example
    };
  }

  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        // In a real implementation, you would parse different file types (PDF, DOCX, etc.)
        resolve(content);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async extractTextFromUrl(url: string): Promise<string> {
    // In a real implementation, you would use a web scraping service
    // This is a simplified placeholder
    try {
      const response = await fetch(url);
      const html = await response.text();
      // Extract text from HTML (simplified)
      const textContent = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return textContent.substring(0, 10000); // Limit length
    } catch (error) {
      throw new Error(`Failed to extract content from URL: ${error}`);
    }
  }

  private inferSubjectFromFilename(filename: string): string {
    const name = filename.toLowerCase();
    if (name.includes('math') || name.includes('matemática'))
      return 'Mathematics';
    if (name.includes('science') || name.includes('ciencia')) return 'Science';
    if (name.includes('history') || name.includes('historia')) return 'History';
    if (name.includes('language') || name.includes('lengua'))
      return 'Language Arts';
    if (name.includes('geography') || name.includes('geografía'))
      return 'Geography';
    return 'General';
  }

  private validateAndTransformQuiz(
    rawQuiz: any,
    sourceContent: string,
    options: QuizGenerationOptions,
  ): GeneratedQuiz {
    // Add generation metadata
    const quiz = {
      ...rawQuiz,
      metadata: {
        sourceDocument: sourceContent.substring(0, 100) + '...',
        generationDate: new Date(),
        difficultyDistribution: this.calculateDifficultyDistribution(
          rawQuiz.questions,
        ),
        taxonomyDistribution: this.calculateTaxonomyDistribution(
          rawQuiz.questions,
        ),
      },
    };

    // Validate against schema
    return GeneratedQuizSchema.parse(quiz);
  }

  private calculateDifficultyDistribution(questions: any[]) {
    const distribution = { easy: 0, medium: 0, hard: 0 };
    questions.forEach((q) => {
      distribution[q.difficulty as keyof typeof distribution]++;
    });
    return distribution;
  }

  private calculateTaxonomyDistribution(questions: any[]) {
    const distribution = {
      remember: 0,
      understand: 0,
      apply: 0,
      analyze: 0,
      evaluate: 0,
      create: 0,
    };
    questions.forEach((q) => {
      distribution[q.bloomsTaxonomy as keyof typeof distribution]++;
    });
    return distribution;
  }
}

// Utility functions for quiz management
export class QuizUtils {
  static shuffleChoices(question: QuizQuestion): QuizQuestion {
    if (question.type === 'mcq' && question.choices) {
      const shuffledChoices = [...question.choices].sort(
        () => Math.random() - 0.5,
      );
      return { ...question, choices: shuffledChoices };
    }
    return question;
  }

  static validateQuizQuality(quiz: GeneratedQuiz): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check question distribution
    const difficulties = quiz.metadata.difficultyDistribution;
    const total = difficulties.easy + difficulties.medium + difficulties.hard;

    if (difficulties.easy / total > 0.7) {
      issues.push(
        'Too many easy questions - consider adding more challenging content',
      );
    }

    if (difficulties.hard / total > 0.5) {
      issues.push(
        'Too many hard questions - consider adding easier introductory questions',
      );
    }

    // Check taxonomy distribution
    const taxonomy = quiz.metadata.taxonomyDistribution;
    const lowerOrder = taxonomy.remember + taxonomy.understand;
    const higherOrder =
      taxonomy.apply + taxonomy.analyze + taxonomy.evaluate + taxonomy.create;

    if (lowerOrder / total > 0.8) {
      issues.push(
        'Focus too heavily on lower-order thinking - add more application and analysis questions',
      );
    }

    // Check for duplicate content
    const stems = quiz.questions.map((q) => q.stem.toLowerCase());
    const duplicates = stems.filter(
      (stem, index) => stems.indexOf(stem) !== index,
    );
    if (duplicates.length > 0) {
      issues.push('Duplicate questions detected');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  static generateQuizReport(quiz: GeneratedQuiz): string {
    const report = `
# Quiz Generation Report

## Overview
- **Title**: ${quiz.title}
- **Subject**: ${quiz.subject}
- **Grade Level**: ${quiz.gradeLevel}
- **Questions**: ${quiz.questions.length}
- **Estimated Duration**: ${Math.round(quiz.estimatedDuration / 60)} minutes

## Question Distribution
### By Difficulty
- Easy: ${quiz.metadata.difficultyDistribution.easy}
- Medium: ${quiz.metadata.difficultyDistribution.medium}
- Hard: ${quiz.metadata.difficultyDistribution.hard}

### By Bloom's Taxonomy
- Remember: ${quiz.metadata.taxonomyDistribution.remember}
- Understand: ${quiz.metadata.taxonomyDistribution.understand}
- Apply: ${quiz.metadata.taxonomyDistribution.apply}
- Analyze: ${quiz.metadata.taxonomyDistribution.analyze}
- Evaluate: ${quiz.metadata.taxonomyDistribution.evaluate}
- Create: ${quiz.metadata.taxonomyDistribution.create}

## Quality Assessment
${JSON.stringify(this.validateQuizQuality(quiz), null, 2)}
    `.trim();

    return report;
  }
}
