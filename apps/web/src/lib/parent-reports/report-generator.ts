// Sistema de reportes para padres
export interface StudentProgress {
  id: string;
  name: string;
  level: number;
  totalPoints: number;
  streak: number;
  lastActivity: Date;
  subjects: {
    [subject: string]: {
      mastery: number;
      gamesPlayed: number;
      averageScore: number;
      timeSpent: number;
      achievements: string[];
    };
  };
  weeklyProgress: {
    points: number;
    gamesPlayed: number;
    timeSpent: number;
    streak: number;
  };
  monthlyProgress: {
    points: number;
    gamesPlayed: number;
    timeSpent: number;
    improvement: number;
  };
}

export interface ParentReport {
  student: StudentProgress;
  summary: {
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  };
  weeklyBreakdown: {
    day: string;
    points: number;
    gamesPlayed: number;
    timeSpent: number;
  }[];
  subjectAnalysis: {
    subject: string;
    mastery: number;
    trend: 'up' | 'down' | 'stable';
    recommendations: string[];
  }[];
  achievements: {
    recent: string[];
    upcoming: string[];
  };
  goals: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export class ParentReportGenerator {
  generateWeeklyReport(student: StudentProgress): ParentReport {
    const overallGrade = this.calculateOverallGrade(student);
    const strengths = this.identifyStrengths(student);
    const areasForImprovement = this.identifyAreasForImprovement(student);
    const recommendations = this.generateRecommendations(student);

    return {
      student,
      summary: {
        overallGrade,
        strengths,
        areasForImprovement,
        recommendations,
      },
      weeklyBreakdown: this.generateWeeklyBreakdown(student),
      subjectAnalysis: this.analyzeSubjects(student),
      achievements: this.getAchievements(student),
      goals: this.calculateGoals(student),
    };
  }

  generateMonthlyReport(student: StudentProgress): ParentReport {
    // Similar to weekly but with monthly data
    return this.generateWeeklyReport(student);
  }

  private calculateOverallGrade(
    student: StudentProgress,
  ): 'A' | 'B' | 'C' | 'D' | 'F' {
    const averageMastery =
      Object.values(student.subjects).reduce(
        (sum, subject) => sum + subject.mastery,
        0,
      ) / Object.keys(student.subjects).length;

    if (averageMastery >= 90) return 'A';
    if (averageMastery >= 80) return 'B';
    if (averageMastery >= 70) return 'C';
    if (averageMastery >= 60) return 'D';
    return 'F';
  }

  private identifyStrengths(student: StudentProgress): string[] {
    const strengths: string[] = [];

    Object.entries(student.subjects).forEach(([subject, data]) => {
      if (data.mastery >= 80) {
        strengths.push(
          `${this.getSubjectName(subject)}: ${data.mastery}% de dominio`,
        );
      }
    });

    if (student.streak >= 5) {
      strengths.push(`Racha de ${student.streak} días consecutivos`);
    }

    if (student.weeklyProgress.points >= 500) {
      strengths.push(
        `Alto rendimiento: ${student.weeklyProgress.points} puntos esta semana`,
      );
    }

    return strengths;
  }

  private identifyAreasForImprovement(student: StudentProgress): string[] {
    const areas: string[] = [];

    Object.entries(student.subjects).forEach(([subject, data]) => {
      if (data.mastery < 60) {
        areas.push(
          `${this.getSubjectName(subject)}: Necesita más práctica (${data.mastery}%)`,
        );
      }
    });

    if (student.streak < 3) {
      areas.push('Consistencia: Intenta estudiar todos los días');
    }

    if (student.weeklyProgress.timeSpent < 30) {
      areas.push(
        'Tiempo de estudio: Aumenta el tiempo dedicado al aprendizaje',
      );
    }

    return areas;
  }

  private generateRecommendations(student: StudentProgress): string[] {
    const recommendations: string[] = [];

    // Recomendaciones basadas en el rendimiento
    if (student.weeklyProgress.points < 200) {
      recommendations.push(
        'Intenta completar más actividades para ganar más puntos',
      );
    }

    if (student.streak < 3) {
      recommendations.push('Establece una rutina diaria de estudio');
    }

    // Recomendaciones por materia
    Object.entries(student.subjects).forEach(([subject, data]) => {
      if (data.mastery < 70) {
        recommendations.push(
          `Practica más ${this.getSubjectName(subject).toLowerCase()}`,
        );
      }
    });

    // Recomendaciones de tiempo
    if (student.weeklyProgress.timeSpent < 60) {
      recommendations.push('Dedica al menos 1 hora por semana a cada materia');
    }

    return recommendations;
  }

  private generateWeeklyBreakdown(student: StudentProgress): Array<{
    day: string;
    points: number;
    gamesPlayed: number;
    timeSpent: number;
  }> {
    // Simular datos semanales (en una implementación real, esto vendría de la base de datos)
    const days = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    return days.map((day) => ({
      day,
      points: Math.floor(Math.random() * 100) + 50,
      gamesPlayed: Math.floor(Math.random() * 5) + 1,
      timeSpent: Math.floor(Math.random() * 30) + 10,
    }));
  }

  private analyzeSubjects(student: StudentProgress): Array<{
    subject: string;
    mastery: number;
    trend: 'up' | 'down' | 'stable';
    recommendations: string[];
  }> {
    return Object.entries(student.subjects).map(([subject, data]) => ({
      subject: this.getSubjectName(subject),
      mastery: data.mastery,
      trend: this.calculateTrend(data.mastery),
      recommendations: this.getSubjectRecommendations(subject, data.mastery),
    }));
  }

  private getAchievements(student: StudentProgress): {
    recent: string[];
    upcoming: string[];
  } {
    const recent: string[] = [];
    const upcoming: string[] = [];

    // Logros recientes
    if (student.streak >= 7) {
      recent.push('🔥 Racha de 7 días');
    }
    if (student.totalPoints >= 1000) {
      recent.push('🏆 1000 puntos totales');
    }

    // Próximos logros
    if (student.streak < 7) {
      upcoming.push(
        `🔥 Racha de 7 días (${7 - student.streak} días restantes)`,
      );
    }
    if (student.totalPoints < 2000) {
      upcoming.push(
        `🏆 2000 puntos totales (${2000 - student.totalPoints} puntos restantes)`,
      );
    }

    return { recent, upcoming };
  }

  private calculateGoals(student: StudentProgress): {
    daily: number;
    weekly: number;
    monthly: number;
  } {
    return {
      daily: student.level * 20,
      weekly: student.level * 100,
      monthly: student.level * 400,
    };
  }

  private getSubjectName(subject: string): string {
    const names: { [key: string]: string } = {
      math: 'Matemáticas',
      literacy: 'Lectoescritura',
      science: 'Ciencias',
      art: 'Arte',
    };
    return names[subject] || subject;
  }

  private calculateTrend(mastery: number): 'up' | 'down' | 'stable' {
    // En una implementación real, esto compararía con datos históricos
    if (mastery >= 80) return 'up';
    if (mastery <= 50) return 'down';
    return 'stable';
  }

  private getSubjectRecommendations(
    subject: string,
    mastery: number,
  ): string[] {
    const recommendations: string[] = [];

    if (mastery < 60) {
      recommendations.push('Practica diariamente durante 15 minutos');
      recommendations.push('Completa actividades de nivel básico primero');
    } else if (mastery < 80) {
      recommendations.push('Intenta actividades de nivel intermedio');
      recommendations.push('Revisa los conceptos que te resulten difíciles');
    } else {
      recommendations.push(
        '¡Excelente trabajo! Intenta desafíos más avanzados',
      );
    }

    return recommendations;
  }
}

// Instancia global del generador de reportes
export const reportGenerator = new ParentReportGenerator();

// Utilidades para el frontend
export function formatTimeSpent(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutos`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function getGradeColor(grade: string): string {
  const colors: { [key: string]: string } = {
    A: '#4CAF50', // Verde
    B: '#8BC34A', // Verde claro
    C: '#FFC107', // Amarillo
    D: '#FF9800', // Naranja
    F: '#F44336', // Rojo
  };
  return colors[grade] || '#9E9E9E';
}

export function getMasteryColor(mastery: number): string {
  if (mastery >= 90) return '#4CAF50';
  if (mastery >= 80) return '#8BC34A';
  if (mastery >= 70) return '#FFC107';
  if (mastery >= 60) return '#FF9800';
  return '#F44336';
}
