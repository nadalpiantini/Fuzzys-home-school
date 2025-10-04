import { TutorEngine } from '../tutor/tutor-engine';
import { DeepSeekClient } from '../tutor/deepseek-client';
import { AdaptiveService } from '../adaptive/AdaptiveService';
import {
  TutorSession,
  TutorResponse,
  QueryType,
  UnderstandingLevel,
} from '../tutor/types';

export interface AIAnalysisResult {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextSteps: string[];
  confidence: number;
}

export interface PersonalizedContent {
  type: 'game' | 'lesson' | 'activity' | 'quiz';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  learningObjectives: string[];
  prerequisites: string[];
}

export interface AIInsights {
  studentProgress: {
    overall: number;
    bySubject: Record<string, number>;
    trends: Record<string, 'up' | 'down' | 'stable'>;
  };
  personalizedRecommendations: PersonalizedContent[];
  learningPath: {
    current: string;
    next: string[];
    prerequisites: string[];
  };
  engagement: {
    level: 'high' | 'medium' | 'low';
    factors: string[];
    suggestions: string[];
  };
}

export class AIService {
  private tutorEngine: TutorEngine;
  private adaptiveService: typeof AdaptiveService;

  constructor() {
    const deepseekClient = new DeepSeekClient({
      apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '',
      baseURL:
        process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL ||
        'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt:
        'You are an AI tutor helping students learn. Be encouraging, patient, and adapt to their learning style.',
    });

    this.tutorEngine = new TutorEngine(deepseekClient);
    this.adaptiveService = AdaptiveService;
  }

  /**
   * Analiza el perfil de aprendizaje del estudiante
   */
  async analyzeLearningProfile(
    studentId: string,
    data: {
      responses: string[];
      timeSpent: Record<string, number>;
      scores: Record<string, number>;
      preferences: string[];
    },
  ): Promise<AIAnalysisResult> {
    try {
      // Analizar patrones de respuesta para determinar estilo de aprendizaje
      const learningStyle = this.determineLearningStyle(
        data.responses,
        data.timeSpent,
      );

      // Identificar fortalezas y debilidades
      const strengths = this.identifyStrengths(data.scores, data.preferences);
      const weaknesses = this.identifyWeaknesses(data.scores, data.timeSpent);

      // Generar recomendaciones personalizadas
      const recommendations = this.generateRecommendations(
        learningStyle,
        strengths,
        weaknesses,
      );

      // Determinar próximos pasos
      const nextSteps = this.determineNextSteps(weaknesses, learningStyle);

      // Calcular confianza en el análisis
      const confidence = this.calculateConfidence(data);

      return {
        learningStyle,
        strengths,
        weaknesses,
        recommendations,
        nextSteps,
        confidence,
      };
    } catch (error) {
      console.error('Error analyzing learning profile:', error);
      throw new Error('Failed to analyze learning profile');
    }
  }

  /**
   * Genera contenido personalizado basado en el perfil del estudiante
   */
  async generatePersonalizedContent(
    studentId: string,
    subject: string,
    level: string,
    preferences: string[],
  ): Promise<PersonalizedContent[]> {
    try {
      // Obtener datos del estudiante
      const studentData = await this.adaptiveService.getProgressAnalytics(
        studentId,
        'month',
      );

      // Generar contenido basado en el progreso y preferencias
      const content: PersonalizedContent[] = [];

      // Juegos personalizados
      if (preferences.includes('games')) {
        content.push({
          type: 'game',
          title: `Aventura de ${subject}`,
          description: `Juego interactivo de ${subject} adaptado a tu nivel`,
          difficulty: this.determineDifficulty(studentData.overallProgress),
          estimatedTime: 15,
          learningObjectives: [`Dominar conceptos básicos de ${subject}`],
          prerequisites: [],
        });
      }

      // Lecciones personalizadas
      if (preferences.includes('lessons')) {
        content.push({
          type: 'lesson',
          title: `Lección Avanzada de ${subject}`,
          description: `Contenido educativo personalizado para ${subject}`,
          difficulty: this.determineDifficulty(studentData.overallProgress),
          estimatedTime: 30,
          learningObjectives: [`Comprender conceptos avanzados de ${subject}`],
          prerequisites: [`Conceptos básicos de ${subject}`],
        });
      }

      // Actividades prácticas
      if (preferences.includes('activities')) {
        content.push({
          type: 'activity',
          title: `Práctica de ${subject}`,
          description: `Actividades prácticas para reforzar ${subject}`,
          difficulty: this.determineDifficulty(studentData.overallProgress),
          estimatedTime: 20,
          learningObjectives: [`Aplicar conocimientos de ${subject}`],
          prerequisites: [`Fundamentos de ${subject}`],
        });
      }

      return content;
    } catch (error) {
      console.error('Error generating personalized content:', error);
      throw new Error('Failed to generate personalized content');
    }
  }

  /**
   * Proporciona insights inteligentes sobre el progreso del estudiante
   */
  async generateInsights(studentId: string): Promise<AIInsights> {
    try {
      // Obtener datos de progreso
      const progressData = await this.adaptiveService.getProgressAnalytics(
        studentId,
        'month',
      );

      // Analizar progreso por materia
      const bySubject: Record<string, number> = {};
      const trends: Record<string, 'up' | 'down' | 'stable'> = {};

      progressData.subjectBreakdown.forEach((subject) => {
        bySubject[subject.subject] = subject.progress;
        trends[subject.subject] = subject.trend as 'up' | 'down' | 'stable';
      });

      // Generar recomendaciones personalizadas
      const personalizedRecommendations =
        await this.generatePersonalizedContent(
          studentId,
          'Matemáticas', // Materia principal
          'intermediate',
          ['games', 'lessons', 'activities'],
        );

      // Determinar ruta de aprendizaje
      const learningPath = this.determineLearningPath(progressData);

      // Analizar nivel de engagement
      const engagement = this.analyzeEngagement(progressData);

      return {
        studentProgress: {
          overall: progressData.overallProgress,
          bySubject,
          trends,
        },
        personalizedRecommendations,
        learningPath,
        engagement,
      };
    } catch (error) {
      console.error('Error generating insights:', error);
      throw new Error('Failed to generate insights');
    }
  }

  /**
   * Inicia una sesión de tutoría inteligente
   */
  async startIntelligentTutoring(
    studentId: string,
    subject: string,
    context?: string,
  ): Promise<TutorSession> {
    try {
      // Obtener perfil del estudiante
      const insights = await this.generateInsights(studentId);

      // Crear perfil de estudiante para el tutor
      const studentProfile = {
        grade: 8, // Nivel por defecto
        learningStyle: 'visual' as
          | 'visual'
          | 'auditory'
          | 'kinesthetic'
          | 'reading_writing',
        currentLevel:
          insights.studentProgress.overall > 80
            ? ('advanced' as const)
            : ('intermediate' as const),
        strongAreas: Object.keys(insights.studentProgress.bySubject).filter(
          (subject) => insights.studentProgress.bySubject[subject] >= 70,
        ),
        challengeAreas: Object.keys(insights.studentProgress.bySubject).filter(
          (subject) => insights.studentProgress.bySubject[subject] < 70,
        ),
        age: 8,
      };

      // Iniciar sesión de tutoría
      const session = await this.tutorEngine.startSession(
        studentId,
        subject,
        studentProfile,
      );

      return session;
    } catch (error) {
      console.error('Error starting intelligent tutoring:', error);
      throw new Error('Failed to start intelligent tutoring');
    }
  }

  /**
   * Procesa una consulta del estudiante con contexto inteligente
   */
  async processIntelligentQuery(
    sessionId: string,
    query: string,
    context?: {
      subject?: string;
      difficulty?: string;
      learningStyle?: string;
    },
  ): Promise<TutorResponse> {
    try {
      // Procesar consulta con el motor de tutoría
      const response = await this.tutorEngine.processQuery(
        sessionId,
        query,
        context
          ? { concept: context.subject, context: context.learningStyle }
          : undefined,
      );

      // Mejorar respuesta con contexto adicional
      if (response.type === 'clarification' && context?.learningStyle) {
        response.content = this.adaptResponseToLearningStyle(
          response.content,
          context.learningStyle,
        );
      }

      return response;
    } catch (error) {
      console.error('Error processing intelligent query:', error);
      throw new Error('Failed to process intelligent query');
    }
  }

  // Métodos privados de análisis

  private determineLearningStyle(
    responses: string[],
    timeSpent: Record<string, number>,
  ): 'visual' | 'auditory' | 'kinesthetic' | 'reading' {
    // Análisis simple basado en patrones
    const visualKeywords = ['ver', 'imagen', 'dibujo', 'color'];
    const auditoryKeywords = ['escuchar', 'sonido', 'música', 'hablar'];
    const kinestheticKeywords = ['tocar', 'mover', 'hacer', 'construir'];
    const readingKeywords = ['leer', 'texto', 'palabra', 'escribir'];

    const visualCount = responses.filter((r) =>
      visualKeywords.some((keyword) => r.toLowerCase().includes(keyword)),
    ).length;

    const auditoryCount = responses.filter((r) =>
      auditoryKeywords.some((keyword) => r.toLowerCase().includes(keyword)),
    ).length;

    const kinestheticCount = responses.filter((r) =>
      kinestheticKeywords.some((keyword) => r.toLowerCase().includes(keyword)),
    ).length;

    const readingCount = responses.filter((r) =>
      readingKeywords.some((keyword) => r.toLowerCase().includes(keyword)),
    ).length;

    const maxCount = Math.max(
      visualCount,
      auditoryCount,
      kinestheticCount,
      readingCount,
    );

    if (maxCount === visualCount) return 'visual';
    if (maxCount === auditoryCount) return 'auditory';
    if (maxCount === kinestheticCount) return 'kinesthetic';
    return 'reading';
  }

  private identifyStrengths(
    scores: Record<string, number>,
    preferences: string[],
  ): string[] {
    const strengths: string[] = [];

    Object.entries(scores).forEach(([subject, score]) => {
      if (score >= 80) {
        strengths.push(`${subject}: Alto rendimiento (${score}%)`);
      }
    });

    if (preferences.includes('games')) {
      strengths.push('Aprendizaje gamificado');
    }

    return strengths;
  }

  private identifyWeaknesses(
    scores: Record<string, number>,
    timeSpent: Record<string, number>,
  ): string[] {
    const weaknesses: string[] = [];

    Object.entries(scores).forEach(([subject, score]) => {
      if (score < 60) {
        weaknesses.push(`${subject}: Necesita refuerzo (${score}%)`);
      }
    });

    Object.entries(timeSpent).forEach(([activity, time]) => {
      if (time < 10) {
        weaknesses.push(`${activity}: Poco tiempo dedicado`);
      }
    });

    return weaknesses;
  }

  private generateRecommendations(
    learningStyle: string,
    strengths: string[],
    weaknesses: string[],
  ): string[] {
    const recommendations: string[] = [];

    // Recomendaciones basadas en estilo de aprendizaje
    if (learningStyle === 'visual') {
      recommendations.push('Usa más diagramas y mapas conceptuales');
    } else if (learningStyle === 'auditory') {
      recommendations.push('Incorpora audio y explicaciones verbales');
    } else if (learningStyle === 'kinesthetic') {
      recommendations.push('Añade actividades prácticas y manipulativas');
    } else {
      recommendations.push('Incluye más textos y ejercicios de lectura');
    }

    // Recomendaciones basadas en debilidades
    weaknesses.forEach((weakness) => {
      if (weakness.includes('Necesita refuerzo')) {
        recommendations.push(`Reforzar conceptos en ${weakness.split(':')[0]}`);
      }
    });

    return recommendations;
  }

  private determineNextSteps(
    weaknesses: string[],
    learningStyle: string,
  ): string[] {
    const nextSteps: string[] = [];

    if (weaknesses.length > 0) {
      nextSteps.push('Revisar conceptos básicos');
      nextSteps.push('Practicar ejercicios de refuerzo');
    }

    nextSteps.push('Continuar con el siguiente nivel');
    nextSteps.push('Aplicar conocimientos en proyectos');

    return nextSteps;
  }

  private calculateConfidence(data: any): number {
    // Calcular confianza basada en la cantidad y calidad de datos
    let confidence = 0.5; // Base

    if (data.responses.length > 10) confidence += 0.2;
    if (Object.keys(data.scores).length > 3) confidence += 0.2;
    if (data.preferences.length > 2) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private determineDifficulty(
    progress: number,
  ): 'beginner' | 'intermediate' | 'advanced' {
    if (progress < 40) return 'beginner';
    if (progress < 80) return 'intermediate';
    return 'advanced';
  }

  private determineLearningPath(progressData: any): {
    current: string;
    next: string[];
    prerequisites: string[];
  } {
    return {
      current: 'Nivel Intermedio',
      next: ['Nivel Avanzado', 'Proyectos Prácticos'],
      prerequisites: ['Conceptos Básicos', 'Fundamentos'],
    };
  }

  private analyzeEngagement(progressData: any): {
    level: 'high' | 'medium' | 'low';
    factors: string[];
    suggestions: string[];
  } {
    const level =
      progressData.overallProgress > 80
        ? 'high'
        : progressData.overallProgress > 60
          ? 'medium'
          : 'low';

    const factors: string[] = [];
    const suggestions: string[] = [];

    if (level === 'low') {
      factors.push('Bajo rendimiento general');
      suggestions.push('Aumentar tiempo de estudio');
      suggestions.push('Revisar dificultades específicas');
    } else if (level === 'medium') {
      factors.push('Rendimiento moderado');
      suggestions.push('Mantener ritmo actual');
      suggestions.push('Identificar áreas de mejora');
    } else {
      factors.push('Alto rendimiento');
      suggestions.push('Continuar con desafíos');
      suggestions.push('Explorar temas avanzados');
    }

    return { level, factors, suggestions };
  }

  private adaptResponseToLearningStyle(
    content: string,
    learningStyle: string,
  ): string {
    if (learningStyle === 'visual') {
      return `${content}\n\n💡 Tip: Intenta dibujar un diagrama para visualizar mejor este concepto.`;
    } else if (learningStyle === 'auditory') {
      return `${content}\n\n💡 Tip: Repite en voz alta lo que acabas de aprender.`;
    } else if (learningStyle === 'kinesthetic') {
      return `${content}\n\n💡 Tip: Intenta hacer un experimento o actividad práctica.`;
    }
    return content;
  }
}

// Instancia global del servicio de IA
export const aiService = new AIService();
