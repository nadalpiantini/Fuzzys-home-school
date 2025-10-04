// Sistema de IA adaptativa para Fuzzy's Home School
export interface LearningProfile {
  studentId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  difficultyPreference: 'easy' | 'medium' | 'hard';
  subjectStrengths: string[];
  subjectWeaknesses: string[];
  timePreferences: {
    bestTime: string;
    maxSessionLength: number;
  };
  interests: string[];
  pace: 'slow' | 'medium' | 'fast';
}

export interface AdaptiveRecommendation {
  type: 'activity' | 'subject' | 'difficulty' | 'time';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LearningAnalytics {
  studentId: string;
  totalTimeSpent: number;
  averageScore: number;
  completionRate: number;
  preferredSubjects: string[];
  strugglingAreas: string[];
  learningPatterns: {
    bestTimeOfDay: string;
    optimalSessionLength: number;
    preferredDifficulty: string;
  };
  progressTrend: 'improving' | 'stable' | 'declining';
}

export class AdaptiveLearningEngine {
  private learningProfiles: Map<string, LearningProfile> = new Map();
  private analytics: Map<string, LearningAnalytics> = new Map();

  updateLearningProfile(
    studentId: string,
    profile: Partial<LearningProfile>,
  ): void {
    const currentProfile =
      this.learningProfiles.get(studentId) ||
      this.createDefaultProfile(studentId);
    const updatedProfile = { ...currentProfile, ...profile };
    this.learningProfiles.set(studentId, updatedProfile);
  }

  generateRecommendations(studentId: string): AdaptiveRecommendation[] {
    const profile = this.learningProfiles.get(studentId);
    const analytics = this.analytics.get(studentId);

    if (!profile || !analytics) {
      return this.getDefaultRecommendations();
    }

    const recommendations: AdaptiveRecommendation[] = [];

    // Recomendaciones basadas en áreas de dificultad
    analytics.strugglingAreas.forEach((area) => {
      recommendations.push({
        type: 'subject',
        title: `Practica ${area}`,
        description: `Te recomendamos actividades de ${area} para mejorar tu comprensión`,
        reason: `Has tenido dificultades en ${area} según tu historial`,
        priority: 'high',
        estimatedTime: 15,
        subject: area,
        difficulty: 'easy',
      });
    });

    // Recomendaciones basadas en estilo de aprendizaje
    if (profile.learningStyle === 'visual') {
      recommendations.push({
        type: 'activity',
        title: 'Actividades Visuales',
        description: 'Explora juegos con gráficos y diagramas',
        reason:
          'Tu estilo de aprendizaje visual se beneficia de contenido gráfico',
        priority: 'medium',
        estimatedTime: 20,
        subject: 'mixed',
        difficulty: 'medium',
      });
    }

    // Recomendaciones basadas en tiempo
    if (analytics.learningPatterns.optimalSessionLength < 30) {
      recommendations.push({
        type: 'time',
        title: 'Sesiones Cortas',
        description: 'Intenta sesiones de 15-20 minutos',
        reason: 'Tu rendimiento es mejor con sesiones cortas',
        priority: 'medium',
        estimatedTime: 15,
        subject: 'mixed',
        difficulty: 'medium',
      });
    }

    // Recomendaciones basadas en intereses
    if (profile.interests.includes('ciencia')) {
      recommendations.push({
        type: 'subject',
        title: 'Explora Ciencias',
        description: 'Descubre experimentos y simulaciones científicas',
        reason: 'Tu interés en ciencias puede motivarte a aprender más',
        priority: 'low',
        estimatedTime: 25,
        subject: 'science',
        difficulty: 'medium',
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  adjustDifficulty(
    studentId: string,
    subject: string,
    currentScore: number,
  ): 'easy' | 'medium' | 'hard' {
    const analytics = this.analytics.get(studentId);
    if (!analytics) return 'medium';

    const recentScores = this.getRecentScores(studentId, subject);
    const averageScore =
      recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;

    if (averageScore >= 80) {
      return 'hard';
    } else if (averageScore >= 60) {
      return 'medium';
    } else {
      return 'easy';
    }
  }

  suggestNextActivity(studentId: string): AdaptiveRecommendation | null {
    const recommendations = this.generateRecommendations(studentId);
    return recommendations[0] || null;
  }

  analyzeLearningPatterns(
    studentId: string,
    activityData: any[],
  ): LearningAnalytics {
    const analytics: LearningAnalytics = {
      studentId,
      totalTimeSpent: 0,
      averageScore: 0,
      completionRate: 0,
      preferredSubjects: [],
      strugglingAreas: [],
      learningPatterns: {
        bestTimeOfDay: 'morning',
        optimalSessionLength: 30,
        preferredDifficulty: 'medium',
      },
      progressTrend: 'stable',
    };

    // Analizar datos de actividades
    if (activityData.length > 0) {
      analytics.totalTimeSpent = activityData.reduce(
        (sum, activity) => sum + activity.timeSpent,
        0,
      );
      analytics.averageScore =
        activityData.reduce((sum, activity) => sum + activity.score, 0) /
        activityData.length;
      analytics.completionRate =
        activityData.filter((activity) => activity.completed).length /
        activityData.length;

      // Identificar materias preferidas
      const subjectScores: { [key: string]: number[] } = {};
      activityData.forEach((activity) => {
        if (!subjectScores[activity.subject]) {
          subjectScores[activity.subject] = [];
        }
        subjectScores[activity.subject].push(activity.score);
      });

      analytics.preferredSubjects = Object.entries(subjectScores)
        .map(([subject, scores]) => ({
          subject,
          averageScore:
            scores.reduce((sum, score) => sum + score, 0) / scores.length,
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .map((item) => item.subject);

      // Identificar áreas de dificultad
      analytics.strugglingAreas = Object.entries(subjectScores)
        .filter(([subject, scores]) => {
          const averageScore =
            scores.reduce((sum, score) => sum + score, 0) / scores.length;
          return averageScore < 60;
        })
        .map(([subject]) => subject);
    }

    this.analytics.set(studentId, analytics);
    return analytics;
  }

  private createDefaultProfile(studentId: string): LearningProfile {
    return {
      studentId,
      learningStyle: 'mixed',
      difficultyPreference: 'medium',
      subjectStrengths: [],
      subjectWeaknesses: [],
      timePreferences: {
        bestTime: 'afternoon',
        maxSessionLength: 30,
      },
      interests: [],
      pace: 'medium',
    };
  }

  private getDefaultRecommendations(): AdaptiveRecommendation[] {
    return [
      {
        type: 'activity',
        title: 'Explora Nuevas Actividades',
        description: 'Descubre diferentes tipos de juegos y actividades',
        reason: 'Te ayudará a encontrar lo que más te gusta',
        priority: 'medium',
        estimatedTime: 20,
        subject: 'mixed',
        difficulty: 'medium',
      },
    ];
  }

  private getRecentScores(studentId: string, subject: string): number[] {
    // En una implementación real, esto vendría de la base de datos
    return [70, 75, 80, 65, 85];
  }
}

// Instancia global del motor adaptativo
export const adaptiveEngine = new AdaptiveLearningEngine();

// Utilidades para el frontend
export function getLearningStyleIcon(style: string): string {
  const icons: { [key: string]: string } = {
    visual: '👁️',
    auditory: '👂',
    kinesthetic: '✋',
    mixed: '🔄',
  };
  return icons[style] || '🔄';
}

export function getDifficultyColor(difficulty: string): string {
  const colors: { [key: string]: string } = {
    easy: '#4CAF50',
    medium: '#FF9800',
    hard: '#F44336',
  };
  return colors[difficulty] || '#9E9E9E';
}

export function formatRecommendationReason(reason: string): string {
  return reason.charAt(0).toUpperCase() + reason.slice(1);
}
