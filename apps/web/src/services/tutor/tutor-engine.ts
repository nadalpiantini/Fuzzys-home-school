import { DeepSeekClient } from './deepseek-client';
import {
  TutorSession,
  TutorResponse,
  QueryType,
  UnderstandingLevel,
  ConfusionIndicator,
  ProgressTracking,
  LearningAnalytics,
  ExplanationStrategy
} from './types';

export class TutorEngine {
  private deepseekClient: DeepSeekClient;
  private explanationStrategies: Map<string, ExplanationStrategy> = new Map();
  private activeSessions: Map<string, TutorSession> = new Map();

  constructor(deepseekClient: DeepSeekClient) {
    this.deepseekClient = deepseekClient;
    this.initializeExplanationStrategies();
  }

  /**
   * Start a new tutoring session
   */
  async startSession(
    userId: string,
    subject: string,
    studentProfile?: TutorSession['studentProfile']
  ): Promise<TutorSession> {
    const session: TutorSession = {
      id: this.generateSessionId(),
      userId,
      subject,
      startTime: new Date(),
      language: 'es',
      messages: [],
      studentProfile,
      context: {
        currentConcept: null,
        understandingLevel: 'partial_understanding',
        confusionPoints: [],
        strategiesUsed: [],
        progressTracking: null
      }
    };

    this.activeSessions.set(session.id, session);

    // Send welcome message
    const welcomeMessage = await this.generateWelcomeMessage(session);
    this.addMessage(session.id, 'assistant', welcomeMessage.content);

    return session;
  }

  /**
   * Process a student question and generate tutor response
   */
  async processQuery(
    sessionId: string,
    query: string,
    metadata?: { concept?: string; context?: string }
  ): Promise<TutorResponse> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add user message to session
    this.addMessage(sessionId, 'user', query);

    // Analyze query type and understanding level
    const queryType = this.detectQueryType(query);
    const understandingLevel = await this.assessUnderstanding(session, query, metadata?.concept);

    // Detect confusion indicators
    const confusionIndicators = this.detectConfusion(query, session.context);

    // Select appropriate explanation strategy
    const strategy = this.selectExplanationStrategy(
      queryType,
      understandingLevel,
      confusionIndicators,
      session.studentProfile
    );

    // Generate response using DeepSeek
    const response = await this.deepseekClient.generateResponse(
      this.buildMessageHistory(session),
      {
        subject: session.subject,
        grade: session.studentProfile?.grade || 8,
        queryType,
        understandingLevel,
        language: session.language,
        learningStyle: session.studentProfile?.learningStyle
      }
    );

    // Adapt response based on strategy and context
    const adaptedResponse = this.adaptResponse(response, strategy, session);

    // Add assistant response to session
    this.addMessage(sessionId, 'assistant', adaptedResponse.content);

    // Update session context
    this.updateSessionContext(session, {
      queryType,
      understandingLevel,
      confusionIndicators,
      strategy: strategy.name,
      concept: metadata?.concept
    });

    return adaptedResponse;
  }

  /**
   * Generate follow-up questions to check understanding
   */
  async generateCheckUnderstanding(
    sessionId: string,
    concept: string
  ): Promise<string[]> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const currentLevel = session.context?.understandingLevel || 'partial_understanding';

    return this.deepseekClient.generateFollowUpQuestions(
      concept,
      currentLevel,
      {
        subject: session.subject,
        grade: session.studentProfile?.grade || 8,
        language: session.language
      }
    );
  }

  /**
   * Provide step-by-step explanation
   */
  async provideStepByStep(
    sessionId: string,
    concept: string,
    context?: string
  ): Promise<TutorResponse> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const stepByStepPrompt = session.language === 'es'
      ? `Por favor, explícame paso a paso cómo ${concept}. ${context ? `Contexto: ${context}` : ''}`
      : `Please explain step by step how ${concept}. ${context ? `Context: ${context}` : ''}`;

    return this.processQuery(sessionId, stepByStepPrompt, { concept });
  }

  /**
   * Request examples and analogies
   */
  async requestExamples(
    sessionId: string,
    concept: string,
    type: 'local' | 'visual' | 'analogies' = 'local'
  ): Promise<TutorResponse> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    let prompt = '';
    if (session.language === 'es') {
      switch (type) {
        case 'local':
          prompt = `Dame ejemplos de ${concept} que pueda ver en República Dominicana o mi vida diaria`;
          break;
        case 'visual':
          prompt = `Ayúdame a visualizar ${concept} con descripciones claras o diagramas mentales`;
          break;
        case 'analogies':
          prompt = `Explícame ${concept} usando analogías o comparaciones simples`;
          break;
      }
    } else {
      switch (type) {
        case 'local':
          prompt = `Give me examples of ${concept} that I can see in Dominican Republic or daily life`;
          break;
        case 'visual':
          prompt = `Help me visualize ${concept} with clear descriptions or mental diagrams`;
          break;
        case 'analogies':
          prompt = `Explain ${concept} using simple analogies or comparisons`;
          break;
      }
    }

    return this.processQuery(sessionId, prompt, { concept });
  }

  /**
   * End session and generate analytics
   */
  async endSession(sessionId: string): Promise<LearningAnalytics> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.endTime = new Date();

    // Generate learning analytics
    const analytics = this.generateLearningAnalytics(session);

    // Clean up session
    this.activeSessions.delete(sessionId);

    return analytics;
  }

  private detectQueryType(query: string): QueryType {
    const lowerQuery = query.toLowerCase();

    // Spanish patterns
    if (lowerQuery.includes('no entiendo') || lowerQuery.includes('no comprendo') || lowerQuery.includes('confuso')) {
      return 'explanation_request';
    }
    if (lowerQuery.includes('cómo resuelvo') || lowerQuery.includes('cómo hago') || lowerQuery.includes('ayúdame con')) {
      return 'problem_solving';
    }
    if (lowerQuery.includes('diferencia entre') || lowerQuery.includes('qué es') || lowerQuery.includes('cuál es')) {
      return 'concept_clarification';
    }
    if (lowerQuery.includes('ejemplo') || lowerQuery.includes('dame un ejemplo')) {
      return 'example_request';
    }
    if (lowerQuery.includes('tarea') || lowerQuery.includes('homework') || lowerQuery.includes('deber')) {
      return 'homework_help';
    }
    if (lowerQuery.includes('cómo estudio') || lowerQuery.includes('examen') || lowerQuery.includes('preparar')) {
      return 'study_guidance';
    }

    // English patterns
    if (lowerQuery.includes("don't understand") || lowerQuery.includes("confused")) {
      return 'explanation_request';
    }
    if (lowerQuery.includes('how do I solve') || lowerQuery.includes('help me with')) {
      return 'problem_solving';
    }
    if (lowerQuery.includes('difference between') || lowerQuery.includes('what is')) {
      return 'concept_clarification';
    }
    if (lowerQuery.includes('example') || lowerQuery.includes('give me an example')) {
      return 'example_request';
    }

    return 'general_question';
  }

  private async assessUnderstanding(
    session: TutorSession,
    query: string,
    concept?: string
  ): Promise<UnderstandingLevel> {
    if (!concept) {
      return session.context?.understandingLevel || 'partial_understanding';
    }

    const analysis = await this.deepseekClient.detectUnderstanding(
      query,
      concept,
      {
        subject: session.subject,
        grade: session.studentProfile?.grade || 8,
        language: session.language
      }
    );

    return analysis.level;
  }

  private detectConfusion(query: string, context: any): ConfusionIndicator[] {
    const indicators: ConfusionIndicator[] = [];
    const lowerQuery = query.toLowerCase();

    // Vocabulary confusion
    if (lowerQuery.includes('qué significa') || lowerQuery.includes('no sé qué es') || lowerQuery.includes('what does') || lowerQuery.includes("don't know what")) {
      indicators.push({
        type: 'vocabulary',
        severity: 'medium',
        description: 'Student doesn\'t understand key terms',
        suggestedIntervention: 'Define terms clearly with examples'
      });
    }

    // Procedural confusion
    if (lowerQuery.includes('cómo se hace') || lowerQuery.includes('pasos') || lowerQuery.includes('how to') || lowerQuery.includes('steps')) {
      indicators.push({
        type: 'procedure',
        severity: 'medium',
        description: 'Student needs step-by-step guidance',
        suggestedIntervention: 'Provide clear procedural steps'
      });
    }

    // Application confusion
    if (lowerQuery.includes('cuándo uso') || lowerQuery.includes('para qué sirve') || lowerQuery.includes('when do I use')) {
      indicators.push({
        type: 'application',
        severity: 'medium',
        description: 'Student doesn\'t know when to apply concept',
        suggestedIntervention: 'Provide real-world applications and contexts'
      });
    }

    return indicators;
  }

  private selectExplanationStrategy(
    queryType: QueryType,
    understandingLevel: UnderstandingLevel,
    confusionIndicators: ConfusionIndicator[],
    studentProfile?: TutorSession['studentProfile']
  ): ExplanationStrategy {
    // Default strategy
    let strategyName = 'basic_explanation';

    // Adjust based on understanding level
    if (understandingLevel === 'no_understanding' || understandingLevel === 'minimal_understanding') {
      strategyName = 'foundational_building';
    } else if (understandingLevel === 'excellent_understanding') {
      strategyName = 'advanced_exploration';
    }

    // Adjust based on confusion indicators
    if (confusionIndicators.some(c => c.type === 'vocabulary')) {
      strategyName = 'vocabulary_focus';
    } else if (confusionIndicators.some(c => c.type === 'procedure')) {
      strategyName = 'step_by_step';
    }

    // Adjust based on learning style
    if (studentProfile?.learningStyle === 'visual') {
      strategyName = 'visual_explanation';
    } else if (studentProfile?.learningStyle === 'kinesthetic') {
      strategyName = 'hands_on_explanation';
    }

    return this.explanationStrategies.get(strategyName) || this.explanationStrategies.get('basic_explanation')!;
  }

  private adaptResponse(
    response: TutorResponse,
    strategy: ExplanationStrategy,
    session: TutorSession
  ): TutorResponse {
    let adaptedContent = response.content;

    // Apply strategy-specific adaptations
    if (strategy.name === 'visual_explanation') {
      adaptedContent += '\n\n💡 *Imagina esto como una imagen mental mientras lees.*';
    } else if (strategy.name === 'hands_on_explanation') {
      adaptedContent += '\n\n🤲 *Trata de hacer esto con tus manos o objetos reales.*';
    }

    // Add learning style adaptations
    if (session.studentProfile?.learningStyle === 'visual') {
      response.visualElements = [
        {
          type: 'diagram',
          description: 'Diagrama conceptual del tema explicado',
          url: '/api/generate-visual?concept=' + encodeURIComponent(adaptedContent.substring(0, 50))
        }
      ];
    }

    return {
      ...response,
      content: adaptedContent,
      adaptations: [
        {
          reason: `Applied ${strategy.name} strategy`,
          modification: 'Content adapted based on understanding level and learning style'
        }
      ]
    };
  }

  private buildMessageHistory(session: TutorSession) {
    return session.messages.slice(-10).map(msg => ({ // Last 10 messages for context
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));
  }

  private addMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.messages.push({
        id: this.generateMessageId(),
        role,
        content,
        timestamp: new Date()
      });
    }
  }

  private updateSessionContext(session: TutorSession, update: any) {
    session.context = {
      ...session.context,
      ...update,
      lastUpdated: new Date()
    };
  }

  private async generateWelcomeMessage(session: TutorSession): Promise<TutorResponse> {
    const welcome = session.language === 'es'
      ? `¡Hola! Soy Fuzzy, tu tutor personal de ${session.subject}. Estoy aquí para ayudarte a entender cualquier tema paso a paso. ¿En qué puedo ayudarte hoy?`
      : `Hi! I'm Fuzzy, your personal ${session.subject} tutor. I'm here to help you understand any topic step by step. How can I help you today?`;

    return {
      content: welcome,
      type: 'encouragement',
      confidence: 1.0
    };
  }

  private generateLearningAnalytics(session: TutorSession): LearningAnalytics {
    const timeSpent = session.endTime ?
      Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000) : 0;

    const conceptsCovered = [...new Set(
      session.messages
        .filter(m => m.metadata?.concept)
        .map(m => m.metadata!.concept)
    )];

    return {
      sessionId: session.id,
      userId: session.userId,
      metrics: {
        questionsAsked: session.messages.filter(m => m.role === 'user').length,
        conceptsCovered,
        understandingProgression: [], // Would be tracked throughout session
        timeSpent,
        interventionsUsed: session.context?.strategiesUsed || [],
        successfulExplanations: session.messages.filter(m =>
          m.role === 'assistant' && m.metadata?.successful
        ).length,
        confusionPoints: session.context?.confusionPoints || []
      },
      insights: {
        primaryLearningStyle: session.studentProfile?.learningStyle || 'unknown',
        effectiveExplanationTypes: ['step_by_step', 'examples'], // Would be analyzed
        challengingConcepts: conceptsCovered.slice(0, 3), // Most discussed concepts
        recommendedNextSteps: [
          'Practice exercises on covered topics',
          'Review foundational concepts',
          'Explore related advanced topics'
        ]
      }
    };
  }

  private initializeExplanationStrategies() {
    this.explanationStrategies.set('basic_explanation', {
      name: 'basic_explanation',
      description: 'Clear, straightforward explanation with examples',
      whenToUse: ['general_question', 'partial_understanding'],
      template: 'Explain concept clearly with 1-2 examples',
      examples: ['Direct explanation', 'Simple examples'],
      adaptations: {
        visual: 'Include visual descriptions',
        auditory: 'Use rhythm and repetition',
        kinesthetic: 'Include physical analogies'
      }
    });

    this.explanationStrategies.set('foundational_building', {
      name: 'foundational_building',
      description: 'Start with basics and build up gradually',
      whenToUse: ['no_understanding', 'minimal_understanding'],
      template: 'Start with simplest concepts and build complexity',
      examples: ['Building blocks approach', 'Scaffolded learning'],
      adaptations: {
        visual: 'Use diagrams and visual progression',
        auditory: 'Verbal step-by-step building',
        kinesthetic: 'Hands-on building activities'
      }
    });

    this.explanationStrategies.set('visual_explanation', {
      name: 'visual_explanation',
      description: 'Heavy use of visual metaphors and descriptions',
      whenToUse: ['visual_learner', 'concept_clarification'],
      template: 'Describe using visual imagery and spatial relationships',
      examples: ['Picture this...', 'Imagine you see...'],
      adaptations: {
        visual: 'Rich visual descriptions',
        auditory: 'Describe visual elements verbally',
        kinesthetic: 'Visualize through movement'
      }
    });

    this.explanationStrategies.set('step_by_step', {
      name: 'step_by_step',
      description: 'Clear procedural breakdown',
      whenToUse: ['problem_solving', 'procedure_confusion'],
      template: 'Break down into numbered steps with checks',
      examples: ['Step 1, Step 2, Step 3', 'Checklist approach'],
      adaptations: {
        visual: 'Visual flowcharts',
        auditory: 'Rhythmic counting',
        kinesthetic: 'Physical movements for each step'
      }
    });
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }

  private generateMessageId(): string {
    return 'msg_' + Math.random().toString(36).substr(2, 9);
  }
}