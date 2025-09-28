import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  ExternalGameEvent,
  ExternalGameProgress,
  ExternalGameSource,
} from '../types';

interface ExternalGamesState {
  // Estado actual de sesiones activas
  activeSessions: Map<string, ExternalGameProgress>;

  // Historial de eventos
  eventHistory: ExternalGameEvent[];

  // Progreso acumulado por estudiante
  studentProgress: Map<string, {
    totalTimeSpent: number;
    gamesCompleted: number;
    totalScore: number;
    lastPlayedAt: Date;
    favoriteSource?: ExternalGameSource;
    achievements: string[];
  }>;

  // Estadísticas globales
  globalStats: {
    totalSessions: number;
    totalTimeSpent: number;
    popularGames: { gameId: string; playCount: number }[];
    popularSources: { source: ExternalGameSource; playCount: number }[];
  };
}

interface ExternalGamesActions {
  // Gestión de sesiones
  startSession: (gameId: string, studentId: string, initialProgress: ExternalGameProgress) => void;
  updateSession: (gameId: string, studentId: string, progress: Partial<ExternalGameProgress>) => void;
  endSession: (gameId: string, studentId: string, finalProgress: ExternalGameProgress) => void;

  // Registro de eventos
  addEvent: (event: ExternalGameEvent) => void;
  getEventsForStudent: (studentId: string) => ExternalGameEvent[];
  getEventsForGame: (gameId: string) => ExternalGameEvent[];

  // Progreso del estudiante
  getStudentProgress: (studentId: string) => {
    totalTimeSpent: number;
    gamesCompleted: number;
    totalScore: number;
    lastPlayedAt: Date;
    favoriteSource?: ExternalGameSource;
    achievements: string[];
  } | null;
  updateStudentAchievements: (studentId: string, newAchievements: string[]) => void;

  // Estadísticas
  updateGlobalStats: () => void;
  getGamePopularity: (gameId: string) => number;
  getSourcePopularity: (source: ExternalGameSource) => number;

  // Utilidades
  clearOldSessions: (olderThanHours?: number) => void;
  exportStudentData: (studentId: string) => object;
}

type ExternalGamesStore = ExternalGamesState & ExternalGamesActions;

export const useExternalGamesStore = create<ExternalGamesStore>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    activeSessions: new Map(),
    eventHistory: [],
    studentProgress: new Map(),
    globalStats: {
      totalSessions: 0,
      totalTimeSpent: 0,
      popularGames: [],
      popularSources: [],
    },

    // Acciones
    startSession: (gameId: string, studentId: string, initialProgress: ExternalGameProgress) => {
      set((state) => {
        const sessionKey = `${gameId}-${studentId}`;
        const newSessions = new Map(state.activeSessions);
        newSessions.set(sessionKey, initialProgress);

        return {
          activeSessions: newSessions,
          globalStats: {
            ...state.globalStats,
            totalSessions: state.globalStats.totalSessions + 1,
          },
        };
      });
    },

    updateSession: (gameId: string, studentId: string, progressUpdate: Partial<ExternalGameProgress>) => {
      set((state) => {
        const sessionKey = `${gameId}-${studentId}`;
        const currentSession = state.activeSessions.get(sessionKey);

        if (!currentSession) return state;

        const updatedSession = { ...currentSession, ...progressUpdate };
        const newSessions = new Map(state.activeSessions);
        newSessions.set(sessionKey, updatedSession);

        return { activeSessions: newSessions };
      });
    },

    endSession: (gameId: string, studentId: string, finalProgress: ExternalGameProgress) => {
      set((state) => {
        const sessionKey = `${gameId}-${studentId}`;
        const newSessions = new Map(state.activeSessions);
        newSessions.delete(sessionKey);

        // Actualizar progreso del estudiante
        const currentStudentProgress = state.studentProgress.get(studentId) || {
          totalTimeSpent: 0,
          gamesCompleted: 0,
          totalScore: 0,
          lastPlayedAt: new Date(),
          achievements: [],
        };

        const updatedStudentProgress = {
          ...currentStudentProgress,
          totalTimeSpent: currentStudentProgress.totalTimeSpent + finalProgress.totalTimeSpent,
          gamesCompleted: finalProgress.completedAt ? currentStudentProgress.gamesCompleted + 1 : currentStudentProgress.gamesCompleted,
          totalScore: currentStudentProgress.totalScore + (finalProgress.score || 0),
          lastPlayedAt: finalProgress.lastPlayedAt,
        };

        const newStudentProgress = new Map(state.studentProgress);
        newStudentProgress.set(studentId, updatedStudentProgress);

        return {
          activeSessions: newSessions,
          studentProgress: newStudentProgress,
          globalStats: {
            ...state.globalStats,
            totalTimeSpent: state.globalStats.totalTimeSpent + finalProgress.totalTimeSpent,
          },
        };
      });

      // Actualizar estadísticas globales
      get().updateGlobalStats();
    },

    addEvent: (event: ExternalGameEvent) => {
      set((state) => ({
        eventHistory: [...state.eventHistory, event].slice(-1000), // Mantener solo los últimos 1000 eventos
      }));

      // Actualizar sesión activa si existe
      if (event.studentId) {
        const sessionKey = `${event.gameId}-${event.studentId}`;
        const currentSession = get().activeSessions.get(sessionKey);

        if (currentSession) {
          get().updateSession(event.gameId, event.studentId, {
            events: [...currentSession.events, event],
            lastPlayedAt: event.timestamp,
          });
        }
      }
    },

    getEventsForStudent: (studentId: string) => {
      return get().eventHistory.filter(event => event.studentId === studentId);
    },

    getEventsForGame: (gameId: string) => {
      return get().eventHistory.filter(event => event.gameId === gameId);
    },

    getStudentProgress: (studentId: string) => {
      return get().studentProgress.get(studentId) || null;
    },

    updateStudentAchievements: (studentId: string, newAchievements: string[]) => {
      set((state) => {
        const currentProgress = state.studentProgress.get(studentId);
        if (!currentProgress) return state;

        const updatedProgress = {
          ...currentProgress,
          achievements: [...new Set([...currentProgress.achievements, ...newAchievements])],
        };

        const newStudentProgress = new Map(state.studentProgress);
        newStudentProgress.set(studentId, updatedProgress);

        return { studentProgress: newStudentProgress };
      });
    },

    updateGlobalStats: () => {
      const state = get();

      // Calcular popularidad de juegos
      const gamePlayCounts = new Map<string, number>();
      const sourcePlayCounts = new Map<ExternalGameSource, number>();

      state.eventHistory.forEach(event => {
        if (event.action === 'start' || event.action === 'init') {
          gamePlayCounts.set(event.gameId, (gamePlayCounts.get(event.gameId) || 0) + 1);
          sourcePlayCounts.set(event.source, (sourcePlayCounts.get(event.source) || 0) + 1);
        }
      });

      const popularGames = Array.from(gamePlayCounts.entries())
        .map(([gameId, playCount]) => ({ gameId, playCount }))
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 10);

      const popularSources = Array.from(sourcePlayCounts.entries())
        .map(([source, playCount]) => ({ source, playCount }))
        .sort((a, b) => b.playCount - a.playCount);

      set((state) => ({
        globalStats: {
          ...state.globalStats,
          popularGames,
          popularSources,
        },
      }));
    },

    getGamePopularity: (gameId: string) => {
      const popularGame = get().globalStats.popularGames.find(g => g.gameId === gameId);
      return popularGame ? popularGame.playCount : 0;
    },

    getSourcePopularity: (source: ExternalGameSource) => {
      const popularSource = get().globalStats.popularSources.find(s => s.source === source);
      return popularSource ? popularSource.playCount : 0;
    },

    clearOldSessions: (olderThanHours = 24) => {
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      set((state) => {
        const newSessions = new Map();

        state.activeSessions.forEach((session, key) => {
          if (session.lastPlayedAt.getTime() > cutoffTime) {
            newSessions.set(key, session);
          }
        });

        return { activeSessions: newSessions };
      });
    },

    exportStudentData: (studentId: string) => {
      const state = get();
      const studentProgress = state.studentProgress.get(studentId);
      const studentEvents = state.eventHistory.filter(event => event.studentId === studentId);
      const activeSessions = Array.from(state.activeSessions.entries())
        .filter(([key]) => key.includes(studentId))
        .map(([, session]) => session);

      return {
        studentId,
        progress: studentProgress,
        events: studentEvents,
        activeSessions,
        exportedAt: new Date().toISOString(),
      };
    },
  }))
);

// Hook personalizado para componentes que necesitan tracking automático
export function useExternalGameAutoTracking(gameId: string, studentId?: string) {
  const addEvent = useExternalGamesStore(state => state.addEvent);
  const startSession = useExternalGamesStore(state => state.startSession);
  const endSession = useExternalGamesStore(state => state.endSession);

  return {
    startSession: (initialProgress: ExternalGameProgress) => {
      if (studentId) {
        startSession(gameId, studentId, initialProgress);
      }
    },
    endSession: (finalProgress: ExternalGameProgress) => {
      if (studentId) {
        endSession(gameId, studentId, finalProgress);
      }
    },
    trackEvent: (event: Omit<ExternalGameEvent, 'gameId' | 'studentId'>) => {
      addEvent({
        ...event,
        gameId,
        studentId,
      });
    },
  };
}

// Selector para componentes de dashboard
export const selectStudentStats = (studentId: string) => (state: ExternalGamesStore) => ({
  progress: state.getStudentProgress(studentId),
  recentEvents: state.getEventsForStudent(studentId).slice(-10),
  activeSessions: Array.from(state.activeSessions.entries())
    .filter(([key]) => key.includes(studentId))
    .map(([, session]) => session),
});

// Selector para estadísticas globales
export const selectGlobalStats = (state: ExternalGamesStore) => state.globalStats;