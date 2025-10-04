// Sistema de puntos avanzado para Fuzzy's Home School
export interface PointsConfig {
  basePoints: number;
  difficultyMultiplier: {
    easy: number;
    medium: number;
    hard: number;
  };
  streakMultiplier: {
    maxStreak: number;
    multiplier: number;
  };
  timeBonus: {
    fastThreshold: number; // segundos
    bonusMultiplier: number;
  };
  creativityBonus: {
    enabled: boolean;
    multiplier: number;
  };
  subjectBonus: {
    [subject: string]: number;
  };
}

export interface GameResult {
  score: number;
  timeSpent: number;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  isCreative: boolean;
  streak: number;
  isFirstAttempt: boolean;
  perfectScore: boolean;
}

export class AdvancedPointsSystem {
  private config: PointsConfig;

  constructor(config?: Partial<PointsConfig>) {
    this.config = {
      basePoints: 100,
      difficultyMultiplier: {
        easy: 1.0,
        medium: 1.5,
        hard: 2.0,
      },
      streakMultiplier: {
        maxStreak: 7,
        multiplier: 2.0,
      },
      timeBonus: {
        fastThreshold: 30, // 30 segundos
        bonusMultiplier: 1.3,
      },
      creativityBonus: {
        enabled: true,
        multiplier: 1.5,
      },
      subjectBonus: {
        math: 1.2,
        literacy: 1.1,
        science: 1.3,
        art: 1.4,
      },
      ...config,
    };
  }

  calculatePoints(result: GameResult): number {
    let points = this.config.basePoints;

    // Multiplicador por dificultad
    const difficultyMultiplier =
      this.config.difficultyMultiplier[result.difficulty];
    points *= difficultyMultiplier;

    // Multiplicador por streak
    const streakMultiplier = this.calculateStreakMultiplier(result.streak);
    points *= streakMultiplier;

    // Bonus por tiempo rápido
    if (result.timeSpent <= this.config.timeBonus.fastThreshold) {
      points *= this.config.timeBonus.bonusMultiplier;
    }

    // Bonus por creatividad
    if (result.isCreative && this.config.creativityBonus.enabled) {
      points *= this.config.creativityBonus.multiplier;
    }

    // Bonus por materia
    const subjectMultiplier = this.config.subjectBonus[result.subject] || 1.0;
    points *= subjectMultiplier;

    // Bonus por primer intento
    if (result.isFirstAttempt) {
      points *= 1.2;
    }

    // Bonus por puntuación perfecta
    if (result.perfectScore) {
      points *= 1.5;
    }

    // Aplicar el score del juego
    points *= result.score / 100; // Normalizar score a 0-1

    return Math.round(points);
  }

  private calculateStreakMultiplier(streak: number): number {
    if (streak <= 1) return 1.0;

    const maxStreak = this.config.streakMultiplier.maxStreak;
    const maxMultiplier = this.config.streakMultiplier.multiplier;

    // Progresión lineal hasta el máximo
    const progress = Math.min(streak / maxStreak, 1);
    return 1 + (maxMultiplier - 1) * progress;
  }

  calculateLevel(experiencePoints: number): number {
    // Fórmula exponencial para niveles
    return Math.floor(Math.sqrt(experiencePoints / 100)) + 1;
  }

  calculateExperienceToNextLevel(currentLevel: number): number {
    const nextLevel = currentLevel + 1;
    const currentExp = Math.pow(currentLevel - 1, 2) * 100;
    const nextExp = Math.pow(nextLevel - 1, 2) * 100;
    return nextExp - currentExp;
  }

  getLevelTitle(level: number): string {
    const titles = [
      'Novato',
      'Aprendiz',
      'Estudiante',
      'Explorador',
      'Aventurero',
      'Experto',
      'Maestro',
      'Genio',
      'Leyenda',
      'Ídolo',
    ];

    if (level <= titles.length) {
      return titles[level - 1];
    }

    return `Nivel ${level}`;
  }

  calculateSubjectMastery(
    subject: string,
    totalPoints: number,
    gamesPlayed: number,
  ): {
    mastery: number;
    title: string;
    nextMilestone: number;
  } {
    const mastery = Math.min((totalPoints / (gamesPlayed * 100)) * 100, 100);

    let title = 'Principiante';
    let nextMilestone = 200;

    if (mastery >= 90) {
      title = 'Maestro';
      nextMilestone = 0;
    } else if (mastery >= 80) {
      title = 'Experto';
      nextMilestone = 90;
    } else if (mastery >= 70) {
      title = 'Avanzado';
      nextMilestone = 80;
    } else if (mastery >= 60) {
      title = 'Intermedio';
      nextMilestone = 70;
    } else if (mastery >= 40) {
      title = 'Principiante+';
      nextMilestone = 60;
    }

    return {
      mastery: Math.round(mastery),
      title,
      nextMilestone,
    };
  }

  generateAchievement(
    points: number,
    streak: number,
    subject: string,
  ): string | null {
    if (points >= 1000 && streak >= 7) {
      return '🔥 Streak Master';
    }

    if (points >= 500 && subject === 'math') {
      return '🧮 Math Wizard';
    }

    if (points >= 500 && subject === 'literacy') {
      return '📚 Word Master';
    }

    if (points >= 500 && subject === 'science') {
      return '🔬 Science Explorer';
    }

    if (streak >= 5) {
      return '⚡ Streak Champion';
    }

    return null;
  }
}

// Instancia global del sistema de puntos
export const pointsSystem = new AdvancedPointsSystem();

// Utilidades para el frontend
export function formatPoints(points: number): string {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }
  return points.toString();
}

export function getPointsColor(points: number): string {
  if (points >= 1000) return '#FFD700'; // Oro
  if (points >= 500) return '#FF6B6B'; // Rojo
  if (points >= 200) return '#4ECDC4'; // Verde
  return '#95A5A6'; // Gris
}

export function calculateDailyGoal(currentLevel: number): number {
  return currentLevel * 50; // 50 puntos por nivel
}

export function calculateWeeklyGoal(currentLevel: number): number {
  return currentLevel * 300; // 300 puntos por nivel por semana
}
