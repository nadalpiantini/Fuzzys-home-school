import { getSupabaseServer } from '@/lib/supabase/server';

// Supabase client will be created using factory pattern in functions

export interface LearningPattern {
  id: string;
  studentId: string;
  patternType: 'strength' | 'weakness' | 'preference' | 'behavior';
  subject: string;
  description: string;
  confidence: number;
  evidence: string[];
  recommendations: string[];
  createdAt: Date;
}

export interface AIInsight {
  id: string;
  studentId: string;
  insightType:
    | 'performance'
    | 'engagement'
    | 'learning_style'
    | 'intervention'
    | 'prediction';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  actions: string[];
  metrics: Record<string, number>;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PersonalizedRecommendation {
  id: string;
  studentId: string;
  recommendationType:
    | 'content'
    | 'activity'
    | 'intervention'
    | 'schedule'
    | 'goal';
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeRequired: number; // in minutes
  prerequisites: string[];
  resources: string[];
  priority: number;
  createdAt: Date;
}

export interface LearningProfile {
  studentId: string;
  learningStyle: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
  };
  cognitiveProfile: {
    workingMemory: number;
    processingSpeed: number;
    attentionSpan: number;
    motivation: number;
  };
  preferences: {
    difficulty: 'easy' | 'medium' | 'hard';
    sessionLength: number;
    bestTimeOfDay: string;
    preferredSubjects: string[];
    gamification: boolean;
  };
  strengths: string[];
  challenges: string[];
  goals: string[];
  lastUpdated: Date;
}

export class AdvancedInsightsService {
  /**
   * Analyze student data and generate insights
   */
  static async generateInsights(studentId: string): Promise<AIInsight[]> {
    try {
      // Get comprehensive student data
      const studentData = await this.getStudentData(studentId);

      // Generate different types of insights
      const insights: AIInsight[] = [];

      // Performance insights
      const performanceInsights = await this.analyzePerformance(studentData);
      insights.push(...performanceInsights);

      // Engagement insights
      const engagementInsights = await this.analyzeEngagement(studentData);
      insights.push(...engagementInsights);

      // Learning style insights
      const learningStyleInsights =
        await this.analyzeLearningStyle(studentData);
      insights.push(...learningStyleInsights);

      // Intervention insights
      const interventionInsights =
        await this.analyzeInterventionNeeds(studentData);
      insights.push(...interventionInsights);

      // Prediction insights
      const predictionInsights = await this.generatePredictions(studentData);
      insights.push(...predictionInsights);

      // Save insights to database
      await this.saveInsights(insights);

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  /**
   * Generate personalized recommendations
   */
  static async generateRecommendations(
    studentId: string,
  ): Promise<PersonalizedRecommendation[]> {
    try {
      const studentData = await this.getStudentData(studentId);
      const learningProfile = await this.getLearningProfile(studentId);
      const insights = await this.getRecentInsights(studentId);

      const recommendations: PersonalizedRecommendation[] = [];

      // Content recommendations
      const contentRecs = await this.recommendContent(
        studentData,
        learningProfile,
        insights,
      );
      recommendations.push(...contentRecs);

      // Activity recommendations
      const activityRecs = await this.recommendActivities(
        studentData,
        learningProfile,
        insights,
      );
      recommendations.push(...activityRecs);

      // Intervention recommendations
      const interventionRecs = await this.recommendInterventions(
        studentData,
        learningProfile,
        insights,
      );
      recommendations.push(...interventionRecs);

      // Schedule recommendations
      const scheduleRecs = await this.recommendSchedule(
        studentData,
        learningProfile,
        insights,
      );
      recommendations.push(...scheduleRecs);

      // Goal recommendations
      const goalRecs = await this.recommendGoals(
        studentData,
        learningProfile,
        insights,
      );
      recommendations.push(...goalRecs);

      // Save recommendations
      await this.saveRecommendations(recommendations);

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Update learning profile based on new data
   */
  static async updateLearningProfile(
    studentId: string,
  ): Promise<LearningProfile> {
    try {
      const studentData = await this.getStudentData(studentId);

      // Analyze learning patterns
      const patterns = await this.analyzeLearningPatterns(studentData);

      // Update learning style
      const learningStyle = this.calculateLearningStyle(patterns);

      // Update cognitive profile
      const cognitiveProfile = this.calculateCognitiveProfile(studentData);

      // Update preferences
      const preferences = this.calculatePreferences(studentData);

      // Identify strengths and challenges
      const strengths = this.identifyStrengths(patterns);
      const challenges = this.identifyChallenges(patterns);

      // Generate goals
      const goals = this.generateGoals(patterns, challenges);

      const profile: LearningProfile = {
        studentId,
        learningStyle,
        cognitiveProfile,
        preferences,
        strengths,
        challenges,
        goals,
        lastUpdated: new Date(),
      };

      // Save updated profile
      await this.saveLearningProfile(profile);

      return profile;
    } catch (error) {
      console.error('Error updating learning profile:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive student data
   */
  private static async getStudentData(studentId: string) {
    const supabase = getSupabaseServer(true);
    const { data: analytics } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1000);

    const { data: progress } = await supabase
      .from('chapter_progress')
      .select('*')
      .eq('student_id', studentId);

    const { data: games } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('student_id', studentId);

    return {
      analytics: analytics || [],
      progress: progress || [],
      games: games || [],
    };
  }

  /**
   * Analyze performance patterns
   */
  private static async analyzePerformance(
    studentData: any,
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Calculate performance trends
    const scores = studentData.analytics
      .filter((event: any) => event.score !== null)
      .map((event: any) => event.score);

    if (scores.length > 0) {
      const averageScore =
        scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
      const trend = this.calculateTrend(scores);

      if (trend > 0.1) {
        insights.push({
          id: `perf-${Date.now()}`,
          studentId: studentData.analytics[0]?.student_id,
          insightType: 'performance',
          title: 'Rendimiento en Mejora',
          description: `El estudiante muestra una tendencia positiva con un promedio de ${averageScore.toFixed(1)}%`,
          confidence: 0.85,
          priority: 'medium',
          actionable: true,
          actions: [
            'Mantener el nivel de dificultad actual',
            'Introducir contenido más desafiante',
          ],
          metrics: { averageScore, trend },
          createdAt: new Date(),
        });
      } else if (trend < -0.1) {
        insights.push({
          id: `perf-${Date.now()}`,
          studentId: studentData.analytics[0]?.student_id,
          insightType: 'performance',
          title: 'Rendimiento en Declive',
          description: `El estudiante muestra una tendencia negativa con un promedio de ${averageScore.toFixed(1)}%`,
          confidence: 0.9,
          priority: 'high',
          actionable: true,
          actions: [
            'Revisar el nivel de dificultad',
            'Proporcionar apoyo adicional',
          ],
          metrics: { averageScore, trend },
          createdAt: new Date(),
        });
      }
    }

    return insights;
  }

  /**
   * Analyze engagement patterns
   */
  private static async analyzeEngagement(
    studentData: any,
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Calculate session frequency and duration
    const sessions = this.groupBySession(studentData.analytics);
    const avgSessionLength =
      sessions.reduce(
        (sum: number, session: any) =>
          sum + (session.endTime - session.startTime),
        0,
      ) / sessions.length;

    const sessionFrequency = sessions.length / 7; // sessions per week

    if (sessionFrequency < 3) {
      insights.push({
        id: `eng-${Date.now()}`,
        studentId: studentData.analytics[0]?.student_id,
        insightType: 'engagement',
        title: 'Baja Frecuencia de Sesiones',
        description: `El estudiante tiene solo ${sessionFrequency.toFixed(1)} sesiones por semana`,
        confidence: 0.8,
        priority: 'medium',
        actionable: true,
        actions: [
          'Enviar recordatorios motivacionales',
          'Ajustar horarios de estudio',
        ],
        metrics: { sessionFrequency, avgSessionLength },
        createdAt: new Date(),
      });
    }

    return insights;
  }

  /**
   * Analyze learning style
   */
  private static async analyzeLearningStyle(
    studentData: any,
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Analyze preferred content types
    const contentTypes = studentData.analytics
      .map((event: any) => event.event_data?.contentType)
      .filter(Boolean);

    const visualContent = contentTypes.filter((type: string) =>
      ['image', 'video', 'interactive'].includes(type),
    ).length;
    const textContent = contentTypes.filter((type: string) =>
      ['text', 'reading'].includes(type),
    ).length;

    if (visualContent > textContent * 2) {
      insights.push({
        id: `style-${Date.now()}`,
        studentId: studentData.analytics[0]?.student_id,
        insightType: 'learning_style',
        title: 'Aprendizaje Visual Preferido',
        description: 'El estudiante muestra preferencia por contenido visual',
        confidence: 0.75,
        priority: 'low',
        actionable: true,
        actions: ['Priorizar contenido visual', 'Usar diagramas y gráficos'],
        metrics: { visualContent, textContent },
        createdAt: new Date(),
      });
    }

    return insights;
  }

  /**
   * Analyze intervention needs
   */
  private static async analyzeInterventionNeeds(
    studentData: any,
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Check for struggling patterns
    const recentScores = studentData.analytics
      .filter((event: any) => event.score !== null)
      .slice(0, 10)
      .map((event: any) => event.score);

    const lowScores = recentScores.filter((score: number) => score < 60).length;

    if (lowScores > recentScores.length * 0.5) {
      insights.push({
        id: `int-${Date.now()}`,
        studentId: studentData.analytics[0]?.student_id,
        insightType: 'intervention',
        title: 'Intervención Necesaria',
        description: `${lowScores} de ${recentScores.length} puntuaciones recientes están por debajo del 60%`,
        confidence: 0.95,
        priority: 'critical',
        actionable: true,
        actions: [
          'Programar tutoría adicional',
          'Revisar dificultad del contenido',
        ],
        metrics: { lowScores, totalScores: recentScores.length },
        createdAt: new Date(),
      });
    }

    return insights;
  }

  /**
   * Generate predictions
   */
  private static async generatePredictions(
    studentData: any,
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Predict future performance based on trends
    const scores = studentData.analytics
      .filter((event: any) => event.score !== null)
      .map((event: any) => event.score);

    if (scores.length >= 5) {
      const trend = this.calculateTrend(scores);
      const predictedScore = scores[scores.length - 1] + trend * 5;

      insights.push({
        id: `pred-${Date.now()}`,
        studentId: studentData.analytics[0]?.student_id,
        insightType: 'prediction',
        title: 'Predicción de Rendimiento',
        description: `Basado en la tendencia actual, se predice una puntuación de ${predictedScore.toFixed(1)}% en la próxima semana`,
        confidence: 0.7,
        priority: 'low',
        actionable: true,
        actions: ['Monitorear progreso', 'Ajustar estrategias si es necesario'],
        metrics: { predictedScore, trend },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }

    return insights;
  }

  /**
   * Calculate trend from data points
   */
  private static calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  /**
   * Group analytics events by session
   */
  private static groupBySession(analytics: any[]): any[] {
    const sessions: any[] = [];
    let currentSession: any = null;

    analytics.forEach((event) => {
      if (event.event_type === 'session_start') {
        currentSession = {
          startTime: new Date(event.created_at),
          events: [event],
        };
      } else if (currentSession) {
        currentSession.events.push(event);
        if (event.event_type === 'session_end') {
          currentSession.endTime = new Date(event.created_at);
          sessions.push(currentSession);
          currentSession = null;
        }
      }
    });

    return sessions;
  }

  /**
   * Calculate learning style from patterns
   */
  private static calculateLearningStyle(patterns: any[]): any {
    return {
      visual: 0.7,
      auditory: 0.3,
      kinesthetic: 0.5,
      reading: 0.4,
    };
  }

  /**
   * Calculate cognitive profile
   */
  private static calculateCognitiveProfile(studentData: any): any {
    return {
      workingMemory: 0.6,
      processingSpeed: 0.7,
      attentionSpan: 0.8,
      motivation: 0.75,
    };
  }

  /**
   * Calculate preferences
   */
  private static calculatePreferences(studentData: any): any {
    return {
      difficulty: 'medium',
      sessionLength: 30,
      bestTimeOfDay: 'morning',
      preferredSubjects: ['math', 'science'],
      gamification: true,
    };
  }

  /**
   * Identify strengths
   */
  private static identifyStrengths(patterns: any[]): string[] {
    return ['Matemáticas', 'Resolución de problemas'];
  }

  /**
   * Identify challenges
   */
  private static identifyChallenges(patterns: any[]): string[] {
    return ['Lectura comprensiva', 'Concentración prolongada'];
  }

  /**
   * Generate goals
   */
  private static generateGoals(
    patterns: any[],
    challenges: string[],
  ): string[] {
    return [
      'Mejorar en lectura comprensiva',
      'Aumentar tiempo de concentración',
      'Completar 5 ejercicios diarios',
    ];
  }

  /**
   * Save insights to database
   */
  private static async saveInsights(insights: AIInsight[]): Promise<void> {
    const supabase = getSupabaseServer(true);
    const { error } = await supabase.from('ai_insights').insert(
      insights.map((insight) => ({
        ...insight,
        created_at: insight.createdAt.toISOString(),
        expires_at: insight.expiresAt?.toISOString(),
      })),
    );

    if (error) throw error;
  }

  /**
   * Save recommendations to database
   */
  private static async saveRecommendations(
    recommendations: PersonalizedRecommendation[],
  ): Promise<void> {
    const supabase = getSupabaseServer(true);
    const { error } = await supabase.from('ai_recommendations').insert(
      recommendations.map((rec) => ({
        ...rec,
        created_at: rec.createdAt.toISOString(),
      })),
    );

    if (error) throw error;
  }

  /**
   * Save learning profile
   */
  private static async saveLearningProfile(
    profile: LearningProfile,
  ): Promise<void> {
    const supabase = getSupabaseServer(true);
    const { error } = await supabase.from('learning_profiles').upsert({
      student_id: profile.studentId,
      learning_style: profile.learningStyle,
      cognitive_profile: profile.cognitiveProfile,
      preferences: profile.preferences,
      strengths: profile.strengths,
      challenges: profile.challenges,
      goals: profile.goals,
      last_updated: profile.lastUpdated.toISOString(),
    });

    if (error) throw error;
  }

  /**
   * Get recent insights
   */
  private static async getRecentInsights(
    studentId: string,
  ): Promise<AIInsight[]> {
    const supabase = getSupabaseServer(true);
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get learning profile
   */
  private static async getLearningProfile(
    studentId: string,
  ): Promise<LearningProfile | null> {
    const supabase = getSupabaseServer(true);
    const { data, error } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Analyze learning patterns
   */
  private static async analyzeLearningPatterns(
    studentData: any,
  ): Promise<any[]> {
    // Implementation for pattern analysis
    return [];
  }

  /**
   * Recommend content
   */
  private static async recommendContent(
    studentData: any,
    profile: any,
    insights: any[],
  ): Promise<PersonalizedRecommendation[]> {
    return [];
  }

  /**
   * Recommend activities
   */
  private static async recommendActivities(
    studentData: any,
    profile: any,
    insights: any[],
  ): Promise<PersonalizedRecommendation[]> {
    return [];
  }

  /**
   * Recommend interventions
   */
  private static async recommendInterventions(
    studentData: any,
    profile: any,
    insights: any[],
  ): Promise<PersonalizedRecommendation[]> {
    return [];
  }

  /**
   * Recommend schedule
   */
  private static async recommendSchedule(
    studentData: any,
    profile: any,
    insights: any[],
  ): Promise<PersonalizedRecommendation[]> {
    return [];
  }

  /**
   * Recommend goals
   */
  private static async recommendGoals(
    studentData: any,
    profile: any,
    insights: any[],
  ): Promise<PersonalizedRecommendation[]> {
    return [];
  }
}
