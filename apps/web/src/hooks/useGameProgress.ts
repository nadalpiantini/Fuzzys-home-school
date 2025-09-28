'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface GameSession {
  gameId: string;
  gameType: string;
  subject: string;
  grade: number;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: Date;
  difficulty: string;
}

interface StudentProgress {
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  totalTimeSpent: number;
  streak: number;
  lastActivity: Date | null;
  subjectProgress: Record<
    string,
    {
      gamesPlayed: number;
      averageScore: number;
      totalTimeSpent: number;
      lastPlayed: Date | null;
    }
  >;
  achievements: string[];
}

interface UseGameProgressReturn {
  progress: StudentProgress;
  sessions: GameSession[];
  addGameSession: (session: Omit<GameSession, 'completedAt'>) => void;
  getSubjectProgress: (
    subject: string,
  ) => StudentProgress['subjectProgress'][string] | null;
  getRecentSessions: (limit?: number) => GameSession[];
  getStreak: () => number;
  getAchievements: () => string[];
  resetProgress: () => void;
}

export function useGameProgress(): UseGameProgressReturn {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [progress, setProgress] = useState<StudentProgress>({
    totalGamesPlayed: 0,
    totalScore: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    streak: 0,
    lastActivity: null,
    subjectProgress: {},
    achievements: [],
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('gameSessions');
    const savedProgress = localStorage.getItem('studentProgress');

    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
      } catch (error) {
        console.error('Error loading game sessions:', error);
      }
    }

    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        setProgress(parsedProgress);
      } catch (error) {
        console.error('Error loading student progress:', error);
      }
    }
  }, []);

  // Save to localStorage whenever sessions or progress change
  useEffect(() => {
    localStorage.setItem('gameSessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('studentProgress', JSON.stringify(progress));
  }, [progress]);

  const addGameSession = (sessionData: Omit<GameSession, 'completedAt'>) => {
    const newSession: GameSession = {
      ...sessionData,
      completedAt: new Date(),
    };

    setSessions((prev) => {
      const updatedSessions = [...prev, newSession];

      // Update progress
      const totalGames = updatedSessions.length;
      const totalScore = updatedSessions.reduce(
        (sum, session) => sum + session.score,
        0,
      );
      const totalTime = updatedSessions.reduce(
        (sum, session) => sum + session.timeSpent,
        0,
      );
      const averageScore =
        totalGames > 0 ? Math.round((totalScore / totalGames) * 100) / 100 : 0;

      // Calculate subject progress
      const subjectProgress: Record<string, any> = {};
      const subjects = [...new Set(updatedSessions.map((s) => s.subject))];

      subjects.forEach((subject) => {
        const subjectSessions = updatedSessions.filter(
          (s) => s.subject === subject,
        );
        const subjectGames = subjectSessions.length;
        const subjectScore = subjectSessions.reduce(
          (sum, session) => sum + session.score,
          0,
        );
        const subjectTime = subjectSessions.reduce(
          (sum, session) => sum + session.timeSpent,
          0,
        );
        const subjectAverage =
          subjectGames > 0
            ? Math.round((subjectScore / subjectGames) * 100) / 100
            : 0;
        const lastPlayed =
          subjectSessions.length > 0
            ? new Date(
                Math.max(
                  ...subjectSessions.map((s) => s.completedAt.getTime()),
                ),
              )
            : null;

        subjectProgress[subject] = {
          gamesPlayed: subjectGames,
          averageScore: subjectAverage,
          totalTimeSpent: subjectTime,
          lastPlayed,
        };
      });

      // Calculate streak
      const streak = calculateStreak(updatedSessions);

      // Check for achievements
      const newAchievements = checkAchievements(
        updatedSessions,
        totalGames,
        averageScore,
        streak,
      );

      setProgress({
        totalGamesPlayed: totalGames,
        totalScore,
        averageScore,
        totalTimeSpent: totalTime,
        streak,
        lastActivity: new Date(),
        subjectProgress,
        achievements: newAchievements,
      });

      return updatedSessions;
    });

    // Show achievement notifications
    const percentage = Math.round(
      (sessionData.score / sessionData.totalQuestions) * 100,
    );
    if (percentage >= 90) {
      toast.success('¡Excelente! Puntuación perfecta 🏆');
    } else if (percentage >= 80) {
      toast.success('¡Muy bien! Gran puntuación 🎉');
    } else if (percentage >= 60) {
      toast.success('¡Bien hecho! Sigue así 👍');
    }
  };

  const calculateStreak = (sessions: GameSession[]): number => {
    if (sessions.length === 0) return 0;

    const sortedSessions = sessions.sort(
      (a, b) => b.completedAt.getTime() - a.completedAt.getTime(),
    );
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].completedAt);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (i === 0) {
        if (daysDiff <= 1) {
          streak = 1;
        } else {
          break;
        }
      } else {
        if (daysDiff === streak) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  };

  const checkAchievements = (
    sessions: GameSession[],
    totalGames: number,
    averageScore: number,
    streak: number,
  ): string[] => {
    const achievements: string[] = [];

    // First game
    if (totalGames === 1) {
      achievements.push('🎮 Primera partida');
    }

    // 10 games
    if (totalGames === 10) {
      achievements.push('🏃‍♂️ Jugador activo');
    }

    // 50 games
    if (totalGames === 50) {
      achievements.push('🎯 Experto en juegos');
    }

    // 100 games
    if (totalGames === 100) {
      achievements.push('👑 Maestro de los juegos');
    }

    // Perfect score
    if (averageScore >= 100) {
      achievements.push('⭐ Puntuación perfecta');
    }

    // High average
    if (averageScore >= 90) {
      achievements.push('🧠 Genio académico');
    }

    // Streak achievements
    if (streak >= 3) {
      achievements.push('🔥 Racha de 3 días');
    }

    if (streak >= 7) {
      achievements.push('⚡ Racha de una semana');
    }

    if (streak >= 30) {
      achievements.push('🏆 Racha de un mes');
    }

    // Subject-specific achievements
    const subjects = Object.keys(progress.subjectProgress);
    subjects.forEach((subject) => {
      const subjectData = progress.subjectProgress[subject];
      if (subjectData && subjectData.gamesPlayed >= 10) {
        achievements.push(`📚 Experto en ${subject}`);
      }
    });

    return [...new Set(achievements)];
  };

  const getSubjectProgress = (subject: string) => {
    return progress.subjectProgress[subject] || null;
  };

  const getRecentSessions = (limit: number = 10) => {
    return sessions
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, limit);
  };

  const getStreak = () => {
    return progress.streak;
  };

  const getAchievements = () => {
    return progress.achievements;
  };

  const resetProgress = () => {
    setSessions([]);
    setProgress({
      totalGamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      streak: 0,
      lastActivity: null,
      subjectProgress: {},
      achievements: [],
    });
    localStorage.removeItem('gameSessions');
    localStorage.removeItem('studentProgress');
    toast.success('Progreso reiniciado');
  };

  return {
    progress,
    sessions,
    addGameSession,
    getSubjectProgress,
    getRecentSessions,
    getStreak,
    getAchievements,
    resetProgress,
  };
}
