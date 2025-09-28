import { QuizGenerator, QuestionGenerationParams, GeneratedQuestion, ContentSource } from '@fuzzy/quiz-generator';
import { adaptiveService } from '@/services/adaptive/AdaptiveService';
import { createClient } from '@/lib/supabase/client';

export class QuizService {
  private generator: QuizGenerator;
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  constructor() {
    this.generator = new QuizGenerator();
  }

  async generateAdaptiveQuiz(
    userId: string,
    subject: string,
    grade: number,
    questionCount: number = 10
  ): Promise<GeneratedQuestion[]> {
    // Get user's optimal difficulty
    const difficulty = await adaptiveService.calculateOptimalDifficulty(userId, subject);

    // Get user's learning profile for personalization
    const profile = await adaptiveService.getLearningProfile(userId);

    const params: QuestionGenerationParams = {
      subject,
      topic: subject,
      difficulty: this.convertDifficultyToString(difficulty),
      count: questionCount,
      language: 'es',
      adaptToGrade: grade,
      questionType: 'multiple_choice',
      bloomLevel: 'understand',
      includeExplanations: true,
      includeVisuals: false,
      avoidBias: true
    };

    // Use Dominican curriculum as content source
    const contentSource: ContentSource = {
      type: 'curriculum',
      content: `Dominican Republic curriculum for ${subject} grade ${grade}`,
      metadata: {
        curriculum: 'dominican_republic',
        grade,
        subject,
        language: 'es'
      }
    };

    const questions = await this.generator.generateQuestions(params, contentSource);

    // Store generated quiz for tracking
    await this.storeGeneratedQuiz(userId, questions, params);

    return questions;
  }

  async generateCurriculumQuiz(
    grade: number,
    subject: string,
    unit: string,
    questionCount: number = 10,
    difficulty: number = 0.5
  ): Promise<GeneratedQuestion[]> {
    return this.generator.generateDominicanCurriculumQuestions(grade, subject, unit);
  }

  async generateTopicQuiz(
    topic: string,
    difficulty: number,
    questionCount: number = 5,
    questionTypes: string[] = ['multiple_choice']
  ): Promise<GeneratedQuestion[]> {
    const params: QuestionGenerationParams = {
      subject: 'general',
      topic: topic,
      difficulty: this.convertDifficultyToString(difficulty),
      count: questionCount,
      language: 'es',
      questionType: 'multiple_choice',
      bloomLevel: 'understand',
      includeExplanations: true,
      includeVisuals: false,
      avoidBias: true
    };

    const contentSource: ContentSource = {
      type: 'topic',
      content: `Topic: ${topic}`,
      metadata: {
        topic,
        language: 'es'
      }
    };

    return this.generator.generateQuestions(params, contentSource);
  }

  async generateH5PQuiz(
    contentType: string,
    difficulty: number,
    questionCount: number = 8
  ): Promise<any> {
    // Generate questions
    const questions = await this.generateTopicQuiz(contentType, difficulty, questionCount);

    // Convert to H5P format
    return this.convertToH5PFormat(questions, contentType);
  }

  private async storeGeneratedQuiz(
    userId: string,
    questions: GeneratedQuestion[],
    params: QuestionGenerationParams
  ): Promise<void> {
    const quizData = {
      user_id: userId,
      subject: params.subject,
      grade: params.adaptToGrade || 5,
      difficulty: params.difficulty,
      question_count: questions.length,
      questions: questions,
      generation_params: params,
      created_at: new Date().toISOString()
    };

    const { error } = await this.supabase
      .from('generated_quizzes')
      .insert(quizData);

    if (error) {
      console.error('Failed to store generated quiz:', error);
    }
  }

  private getPreferredQuestionTypes(preferences?: any): string[] {
    const learningStyle = preferences?.learningStyle || 'multimodal';

    switch (learningStyle) {
      case 'visual':
        return ['multiple_choice', 'matching', 'image_choice'];
      case 'auditory':
        return ['short_answer', 'essay', 'multiple_choice'];
      case 'kinesthetic':
        return ['drag_drop', 'interactive', 'multiple_choice'];
      case 'reading_writing':
        return ['short_answer', 'essay', 'fill_blank'];
      default:
        return ['multiple_choice', 'true_false', 'short_answer', 'matching'];
    }
  }

  private convertDifficultyToString(difficulty: number): "beginner" | "intermediate" | "advanced" | "expert" {
    if (difficulty <= 0.25) return 'beginner';
    if (difficulty <= 0.5) return 'intermediate';
    if (difficulty <= 0.75) return 'advanced';
    return 'expert';
  }

  private getBloomsLevelsForDifficulty(difficulty: number): string[] {
    if (difficulty < 0.3) {
      return ['remembering', 'understanding'];
    } else if (difficulty < 0.7) {
      return ['understanding', 'applying', 'analyzing'];
    } else {
      return ['applying', 'analyzing', 'evaluating', 'creating'];
    }
  }

  private convertToH5PFormat(questions: GeneratedQuestion[], contentType: string): any {
    const h5pQuestions = questions.map((q, index) => ({
      params: {
        question: q.question,
        answers: q.type === 'multiple_choice' ? q.options?.map((option, optIndex) => ({
          text: option,
          correct: optIndex === Number(q.correctAnswer),
          tipsAndFeedback: {
            tip: '',
            chosenFeedback: optIndex === Number(q.correctAnswer) ? '¡Correcto!' : 'Incorrecto',
            notChosenFeedback: ''
          }
        })) : [],
        behaviour: {
          enableRetry: true,
          enableSolutionsButton: true,
          enableCheckButton: true,
          type: 'auto',
          singlePoint: false,
          randomAnswers: true,
          showSolutionsRequiresInput: true
        },
        l10n: {
          checkAnswerButton: 'Verificar',
          showSolutionButton: 'Mostrar solución',
          tryAgainButton: 'Intentar de nuevo',
          scoreBarLabel: 'Obtuviste :num de :total puntos',
          a11yCheck: 'Verificar las respuestas',
          a11yShowSolution: 'Mostrar la solución',
          a11yRetry: 'Intentar de nuevo'
        }
      },
      library: 'H5P.MultiChoice 1.16',
      metadata: {
        title: `Pregunta ${index + 1}`,
        license: 'U'
      }
    }));

    return {
      params: {
        intro: `Quiz interactivo sobre ${contentType}`,
        progressType: 'dots',
        passPercentage: 70,
        questions: h5pQuestions,
        disableBackwardsNavigation: false,
        randomQuestions: false,
        endGame: {
          showResultPage: true,
          showSolutionButton: true,
          showRetryButton: true,
          noResultMessage: 'Respuesta enviada',
          successGreeting: '¡Excelente trabajo!',
          successComment: 'Has demostrado un gran conocimiento del tema.',
          failGreeting: '¡Buen intento!',
          failComment: 'Revisa los conceptos y vuelve a intentarlo.',
          scoreString: 'Obtuviste @score de @total puntos',
          finishButtonText: 'Finalizar'
        },
        override: {
          checkButton: true,
          showSolutionButton: 'on',
          retryButton: 'on'
        }
      },
      library: 'H5P.QuestionSet 1.20',
      metadata: {
        title: `Quiz: ${contentType}`,
        license: 'U',
        extraTitle: `Quiz generado automáticamente - ${contentType}`
      }
    };
  }

  async getQuizHistory(userId: string, limit: number = 10) {
    const { data, error } = await this.supabase
      .from('generated_quizzes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get quiz history:', error);
      return [];
    }

    return data || [];
  }

  async getSubjectRecommendations(userId: string) {
    const profile = await adaptiveService.getLearningProfile(userId);
    if (!profile) return [];

    const analytics = await adaptiveService.getProgressAnalytics(userId);

    // Find subjects that need improvement
    const needsImprovement = Object.entries(analytics.conceptProgress)
      .filter(([_, data]: [string, any]) => data.averageScore < 0.6)
      .map(([concept, _]) => concept);

    // Generate recommendations
    const recommendations = [];

    for (const concept of needsImprovement.slice(0, 3)) {
      const difficulty = await adaptiveService.calculateOptimalDifficulty(userId, concept);
      recommendations.push({
        subject: concept,
        reason: 'Necesita refuerzo',
        difficulty,
        suggestedQuestionCount: 5,
        priority: 'high'
      });
    }

    // Add variety recommendations
    const strongSubjects = Object.entries(analytics.conceptProgress)
      .filter(([_, data]: [string, any]) => data.averageScore > 0.8)
      .map(([concept, _]) => concept);

    for (const concept of strongSubjects.slice(0, 2)) {
      const difficulty = await adaptiveService.calculateOptimalDifficulty(userId, concept);
      recommendations.push({
        subject: concept,
        reason: 'Desafío avanzado',
        difficulty: Math.min(difficulty + 0.2, 1.0),
        suggestedQuestionCount: 8,
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

export const quizService = new QuizService();