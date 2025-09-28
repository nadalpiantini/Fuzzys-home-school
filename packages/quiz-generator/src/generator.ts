import {
  QuestionGenerationParams,
  GeneratedQuestion,
  GeneratedQuiz,
  QuizTemplate,
  CurriculumStandard,
  QuestionQuality,
  GenerationContext,
  ContentSource,
  DifficultyLevel,
  BloomLevel,
  QuestionType
} from './types';

export class QuizGenerator {
  private curriculumStandards: CurriculumStandard[] = [];
  private questionTemplates: Map<QuestionType, string[]> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Generate questions based on parameters and content source
   */
  async generateQuestions(
    params: QuestionGenerationParams,
    contentSource: ContentSource,
    context?: GenerationContext
  ): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];

    for (let i = 0; i < params.count; i++) {
      const question = await this.generateSingleQuestion(params, contentSource, context);
      questions.push(question);
    }

    // Ensure diversity in generated questions
    return this.ensureQuestionDiversity(questions, params);
  }

  /**
   * Generate a complete quiz from template
   */
  async generateQuiz(
    template: QuizTemplate,
    contentSources: ContentSource[],
    context?: GenerationContext
  ): Promise<GeneratedQuiz> {
    const allQuestions: GeneratedQuestion[] = [];

    // Generate questions based on template distribution
    const questionCounts = this.calculateQuestionCounts(template);

    for (const [questionType, count] of questionCounts) {
      const difficultyDistribution = template.difficultyDistribution || { beginner: 25, intermediate: 50, advanced: 25 };
      const bloomDistribution = template.bloomDistribution || { remember: 20, understand: 30, apply: 30, analyze: 15, evaluate: 5 };
      
      for (const [difficulty, diffCount] of this.distributeDifficulty(count, difficultyDistribution)) {
        for (const [bloomLevel, bloomCount] of this.distributeBloomLevels(diffCount, bloomDistribution)) {
          const params: QuestionGenerationParams = {
            subject: template.subject,
            topic: template.subject, // This would be more specific in real implementation
            questionType,
            difficulty,
            bloomLevel,
            count: bloomCount,
            language: 'es',
            includeExplanations: template.showFeedback !== 'never',
            includeVisuals: false,
            avoidBias: true
          };

          // Select appropriate content source
          const contentSource = this.selectContentSource(contentSources, params);
          const questions = await this.generateQuestions(params, contentSource, context);
          allQuestions.push(...questions);
        }
      }
    }

    // Shuffle if required
    const finalQuestions = template.shuffleQuestions ? this.shuffleArray(allQuestions) : allQuestions;

    return {
      id: this.generateId(),
      title: template.name as string,
      description: template.description as string,
      subject: template.subject as string,
      topics: [template.subject as string], // Simplified
      questions: finalQuestions.slice(0, template.totalQuestions as number),
      difficulty: this.calculateOverallDifficulty(finalQuestions),
      estimatedTime: template.timeLimit as number,
      passingScore: template.passingScore as number,
      settings: {
        shuffleQuestions: template.shuffleQuestions as boolean,
        shuffleOptions: template.shuffleOptions as boolean,
        showFeedback: template.showFeedback !== 'never',
        allowRetakes: template.allowRetakes as boolean,
        timeLimit: template.timeLimit as number
      },
      createdAt: new Date()
    };
  }

  /**
   * Generate adaptive questions based on student performance
   */
  async generateAdaptiveQuestions(
    baseParams: QuestionGenerationParams,
    studentPerformance: {
      correctAnswers: number;
      totalAnswers: number;
      averageTime: number;
      weakAreas: string[];
    },
    contentSource: ContentSource
  ): Promise<GeneratedQuestion[]> {
    const adaptedParams = { ...baseParams };

    // Adjust difficulty based on performance
    const accuracy = studentPerformance.correctAnswers / studentPerformance.totalAnswers;

    if (accuracy > 0.85) {
      // Increase difficulty
      adaptedParams.difficulty = this.increaseDifficulty(baseParams.difficulty);
      adaptedParams.bloomLevel = this.increaseBloomLevel(baseParams.bloomLevel);
    } else if (accuracy < 0.6) {
      // Decrease difficulty
      adaptedParams.difficulty = this.decreaseDifficulty(baseParams.difficulty);
      adaptedParams.bloomLevel = this.decreaseBloomLevel(baseParams.bloomLevel);
    }

    // Focus on weak areas
    if (studentPerformance.weakAreas.length > 0) {
      adaptedParams.topic = studentPerformance.weakAreas[0]; // Focus on first weak area
    }

    return this.generateQuestions(adaptedParams, contentSource);
  }

  /**
   * Validate and rate question quality
   */
  evaluateQuestionQuality(question: GeneratedQuestion): QuestionQuality {
    let clarity = this.evaluateClarity(question.question);
    let difficulty = this.evaluateDifficulty(question);
    let bias = this.evaluateBias(question);
    let pedagogicalValue = this.evaluatePedagogicalValue(question);

    // Overall score is weighted average
    const overallScore = (clarity * 0.3 + difficulty * 0.2 + (1 - bias) * 0.2 + pedagogicalValue * 0.3);

    return {
      clarity,
      difficulty,
      discrimination: 0.5, // Would need performance data to calculate
      bias,
      pedagogicalValue,
      overallScore
    };
  }

  /**
   * Generate questions for Dominican Republic curriculum
   */
  async generateDominicanCurriculumQuestions(
    grade: number,
    subject: string,
    unit: string,
    questionCount: number = 10
  ): Promise<GeneratedQuestion[]> {
    const standard = this.findCurriculumStandard('DR', grade, subject, unit);

    if (!standard) {
      throw new Error(`No curriculum standard found for grade ${grade}, subject ${subject}, unit ${unit}`);
    }

    const params: QuestionGenerationParams = {
      subject: standard.subject,
      topic: standard.topic,
      questionType: 'multiple_choice',
      difficulty: grade <= 6 ? 'beginner' : grade <= 9 ? 'intermediate' : 'advanced',
      bloomLevel: 'understand',
      language: 'es',
      count: questionCount,
      adaptToGrade: grade,
      includeExplanations: true,
      includeVisuals: false,
      avoidBias: true
    };

    const contentSource: ContentSource = {
      type: 'curriculum',
      content: standard.description,
      metadata: {
        standard: standard.id,
        learningObjectives: standard.learningObjectives,
        keywords: standard.keywords
      }
    };

    return this.generateQuestions(params, contentSource);
  }

  private async generateSingleQuestion(
    params: QuestionGenerationParams,
    contentSource: ContentSource,
    context?: GenerationContext
  ): Promise<GeneratedQuestion> {
    // This would integrate with an AI service like DeepSeek
    // For now, we'll create a template-based generation

    const templates = this.questionTemplates.get(params.questionType) || [];
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Extract key concepts from content
    const concepts = this.extractConcepts(contentSource.content);
    const selectedConcept = concepts[Math.floor(Math.random() * concepts.length)] || 'concepto general';

    // Generate question based on type and template
    const question = this.fillTemplate(template, {
      subject: params.subject,
      topic: params.topic,
      concept: selectedConcept,
      difficulty: params.difficulty,
      bloomLevel: params.bloomLevel
    });

    // Generate options for MCQ
    const options = params.questionType === 'multiple_choice' ?
      this.generateMCQOptions(question, selectedConcept) : undefined;

    // Generate correct answer
    const correctAnswer = this.generateCorrectAnswer(params.questionType, selectedConcept);

    // Generate explanation
    const explanation = params.includeExplanations ?
      this.generateExplanation(question, correctAnswer, params.bloomLevel) : undefined;

    return {
      id: this.generateId(),
      type: params.questionType,
      subject: params.subject,
      topic: params.topic,
      question,
      options,
      correctAnswer,
      explanation,
      hints: this.generateHints(question, correctAnswer),
      difficulty: params.difficulty,
      bloomLevel: params.bloomLevel,
      timeEstimate: this.estimateTime(params.questionType, params.difficulty),
      tags: [params.subject, params.topic, selectedConcept],
      metadata: {
        generatedAt: new Date().toISOString(),
        source: contentSource.type,
        bloomLevel: params.bloomLevel
      }
    };
  }

  private initializeTemplates(): void {
    // Multiple Choice Templates
    this.questionTemplates.set('multiple_choice', [
      '¿Cuál de las siguientes opciones describe mejor {concept} en {topic}?',
      '¿Qué característica es más importante para {concept}?',
      'En el contexto de {topic}, {concept} se refiere a:',
      '¿Cuál es la función principal de {concept} en {subject}?'
    ]);

    // True/False Templates
    this.questionTemplates.set('true_false', [
      '{concept} es fundamental para entender {topic}.',
      'En {subject}, {concept} siempre produce el mismo resultado.',
      '{concept} puede ser aplicado en todos los casos de {topic}.'
    ]);

    // Fill Blank Templates
    this.questionTemplates.set('fill_blank', [
      'El ________ es un elemento clave en {topic} porque {concept}.',
      'Para entender {concept}, primero debemos conocer ________.',
      '{topic} se caracteriza por ________ y {concept}.'
    ]);

    // Short Answer Templates
    this.questionTemplates.set('short_answer', [
      'Explica brevemente qué es {concept} y su importancia en {topic}.',
      'Describe las principales características de {concept}.',
      '¿Cómo se relaciona {concept} con otros elementos de {topic}?'
    ]);

    // Essay Templates
    this.questionTemplates.set('essay', [
      'Analiza la importancia de {concept} en {topic} y proporciona ejemplos específicos.',
      'Compare y contraste diferentes aspectos de {concept} en el contexto de {subject}.',
      'Evalúa el impacto de {concept} en {topic} y justifica tu respuesta.'
    ]);
  }

  private ensureQuestionDiversity(questions: GeneratedQuestion[], params: QuestionGenerationParams): GeneratedQuestion[] {
    // Remove duplicate or very similar questions
    const unique = questions.filter((q, index, self) =>
      index === self.findIndex(other => this.calculateSimilarity(q.question, other.question) < 0.8)
    );

    // Ensure variety in question stems and concepts
    return this.diversifyQuestionStems(unique);
  }

  private calculateQuestionCounts(template: QuizTemplate): Map<QuestionType, number> {
    const counts = new Map<QuestionType, number>();
    const totalQuestions = template.totalQuestions as number;
    const questionTypes = template.questionTypes as QuestionType[];
    const questionsPerType = Math.floor(totalQuestions / questionTypes.length);
    const remainder = totalQuestions % questionTypes.length;

    questionTypes.forEach((type, index) => {
      const count = questionsPerType + (index < remainder ? 1 : 0);
      counts.set(type, count);
    });

    return counts;
  }

  private distributeDifficulty(count: number, distribution: Partial<Record<DifficultyLevel, number>>): Map<DifficultyLevel, number> {
    const result = new Map<DifficultyLevel, number>();

    Object.entries(distribution).forEach(([level, percentage]) => {
      if (percentage !== undefined) {
        const levelCount = Math.round(count * percentage / 100);
        if (levelCount > 0) {
          result.set(level as DifficultyLevel, levelCount);
        }
      }
    });

    return result;
  }

  private distributeBloomLevels(count: number, distribution: Partial<Record<BloomLevel, number>>): Map<BloomLevel, number> {
    const result = new Map<BloomLevel, number>();

    Object.entries(distribution).forEach(([level, percentage]) => {
      if (percentage !== undefined) {
        const levelCount = Math.round(count * percentage / 100);
        if (levelCount > 0) {
          result.set(level as BloomLevel, levelCount);
        }
      }
    });

    return result;
  }

  private selectContentSource(sources: ContentSource[], params: QuestionGenerationParams): ContentSource {
    // Select the most relevant content source based on topic and type
    return sources.find(source =>
      source.content.toLowerCase().includes(params.topic.toLowerCase())
    ) || sources[0];
  }

  private calculateOverallDifficulty(questions: GeneratedQuestion[]): DifficultyLevel {
    const difficultyScores = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4
    };

    const averageScore = questions.reduce((sum, q) => sum + difficultyScores[q.difficulty], 0) / questions.length;

    if (averageScore <= 1.5) return 'beginner';
    if (averageScore <= 2.5) return 'intermediate';
    if (averageScore <= 3.5) return 'advanced';
    return 'expert';
  }

  private extractConcepts(content: string): string[] {
    // Simple concept extraction - in production, this would use NLP
    const words = content.toLowerCase().split(/\s+/);
    const concepts = words.filter(word =>
      word.length > 4 &&
      !['para', 'como', 'desde', 'hasta', 'sobre', 'entre'].includes(word)
    );

    return [...new Set(concepts)].slice(0, 10); // Return unique concepts
  }

  private fillTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return result;
  }

  private generateMCQOptions(question: string, concept: string): string[] {
    // In production, this would use AI to generate plausible distractors
    return [
      `Opción correcta relacionada con ${concept}`,
      `Distractor plausible sobre ${concept}`,
      `Otra alternativa de ${concept}`,
      `Opción incorrecta pero relacionada`
    ];
  }

  private generateCorrectAnswer(type: QuestionType, concept: string): string | string[] {
    switch (type) {
      case 'multiple_choice':
        return 'Opción correcta relacionada con ' + concept;
      case 'true_false':
        return Math.random() > 0.5 ? 'Verdadero' : 'Falso';
      case 'fill_blank':
        return concept;
      case 'short_answer':
        return `Respuesta breve sobre ${concept}`;
      default:
        return `Respuesta sobre ${concept}`;
    }
  }

  private generateExplanation(question: string, answer: string | string[], bloomLevel: BloomLevel): string {
    const explanationTemplates = {
      'remember': `La respuesta correcta es ${answer} porque es un hecho fundamental.`,
      'understand': `${answer} es correcto porque demuestra comprensión del concepto.`,
      'apply': `${answer} es la aplicación correcta del principio en esta situación.`,
      'analyze': `${answer} muestra el análisis correcto de los componentes del problema.`,
      'evaluate': `${answer} representa la evaluación más apropiada basada en los criterios.`,
      'create': `${answer} demuestra la síntesis creativa de los elementos aprendidos.`
    };

    return explanationTemplates[bloomLevel];
  }

  private generateHints(question: string, answer: string | string[]): string[] {
    return [
      'Piensa en los conceptos clave de la pregunta.',
      'Considera el contexto específico del tema.',
      'Recuerda los principios fundamentales.'
    ];
  }

  private estimateTime(type: QuestionType, difficulty: DifficultyLevel): number {
    const baseTime = {
      'multiple_choice': 60,
      'true_false': 30,
      'fill_blank': 45,
      'short_answer': 120,
      'essay': 300,
      'matching': 90,
      'ordering': 75,
      'drag_drop': 90,
      'hotspot': 60
    };

    const difficultyMultiplier = {
      'beginner': 0.8,
      'intermediate': 1.0,
      'advanced': 1.3,
      'expert': 1.6
    };

    return Math.round((baseTime[type] || 60) * difficultyMultiplier[difficulty]);
  }

  private evaluateClarity(question: string): number {
    // Simple heuristics for clarity
    const length = question.length;
    const wordCount = question.split(' ').length;
    const complexWords = question.split(' ').filter(word => word.length > 7).length;

    let clarity = 1.0;

    if (length > 200) clarity -= 0.2; // Too long
    if (wordCount > 30) clarity -= 0.1; // Too many words
    if (complexWords / wordCount > 0.3) clarity -= 0.2; // Too complex

    return Math.max(0, clarity);
  }

  private evaluateDifficulty(question: GeneratedQuestion): number {
    // Map difficulty levels to numerical values
    const difficultyMap = {
      'beginner': 0.25,
      'intermediate': 0.5,
      'advanced': 0.75,
      'expert': 1.0
    };

    return difficultyMap[question.difficulty];
  }

  private evaluateBias(question: GeneratedQuestion): number {
    // Check for potential bias indicators
    const biasWords = ['siempre', 'nunca', 'todos', 'ninguno', 'obviamente'];
    const questionLower = question.question.toLowerCase();

    const biasCount = biasWords.filter(word => questionLower.includes(word)).length;
    return Math.min(1, biasCount * 0.3); // Higher values indicate more bias
  }

  private evaluatePedagogicalValue(question: GeneratedQuestion): number {
    // Evaluate based on Bloom's taxonomy level
    const bloomValue = {
      'remember': 0.4,
      'understand': 0.6,
      'apply': 0.8,
      'analyze': 0.9,
      'evaluate': 0.95,
      'create': 1.0
    };

    return bloomValue[question.bloomLevel];
  }

  private findCurriculumStandard(country: string, grade: number, subject: string, unit: string): CurriculumStandard | undefined {
    return this.curriculumStandards.find(standard =>
      standard.country === country &&
      standard.level.includes(grade.toString()) &&
      standard.subject.toLowerCase() === subject.toLowerCase() &&
      standard.topic.toLowerCase().includes(unit.toLowerCase())
    );
  }

  private increaseDifficulty(current: DifficultyLevel): DifficultyLevel {
    const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(current);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }

  private decreaseDifficulty(current: DifficultyLevel): DifficultyLevel {
    const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(current);
    return levels[Math.max(currentIndex - 1, 0)];
  }

  private increaseBloomLevel(current: BloomLevel): BloomLevel {
    const levels: BloomLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
    const currentIndex = levels.indexOf(current);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }

  private decreaseBloomLevel(current: BloomLevel): BloomLevel {
    const levels: BloomLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
    const currentIndex = levels.indexOf(current);
    return levels[Math.max(currentIndex - 1, 0)];
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation - would use more sophisticated NLP in production
    const words1 = text1.toLowerCase().split(' ');
    const words2 = text2.toLowerCase().split(' ');
    const intersection = words1.filter(word => words2.includes(word));

    return intersection.length / Math.max(words1.length, words2.length);
  }

  private diversifyQuestionStems(questions: GeneratedQuestion[]): GeneratedQuestion[] {
    // Ensure variety in question beginnings
    const stems = new Map<string, number>();

    return questions.filter(question => {
      const stem = question.question.split(' ').slice(0, 3).join(' ');
      const count = stems.get(stem) || 0;

      if (count < 2) { // Allow max 2 questions with same stem
        stems.set(stem, count + 1);
        return true;
      }
      return false;
    });
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateId(): string {
    return 'q_' + Math.random().toString(36).substr(2, 9);
  }
}