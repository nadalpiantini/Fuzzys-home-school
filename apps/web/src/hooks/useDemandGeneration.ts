'use client';

import { useState, useEffect, useCallback } from 'react';

interface DemandGame {
  id: string;
  title: string;
  subject: string;
  grade: string;
  content: any;
  source: string;
}

interface UserPreferences {
  id: string;
  user_id: string;
  preferred_subjects: string[];
  preferred_grades: string[];
  user_category: string;
  total_games_played: number;
  last_played_at: string;
}

interface DemandGenerationStats {
  total_jobs: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  total_games_generated: number;
}

export function useDemandGeneration(userId?: string) {
  const [games, setGames] = useState<DemandGame[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [stats, setStats] = useState<DemandGenerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener juegos por categoría de usuario
  const fetchGamesByCategory = useCallback(
    async (category: string, limit: number = 2) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/pool/category?category=${category}&limit=${limit}&user_id=${userId || ''}`,
        );
        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error || 'Error fetching games');
        }

        setGames(data.games);
        return data.games;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching games by category:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  // Obtener juegos personalizados por preferencias
  const fetchPersonalizedGames = useCallback(
    async (limit: number = 2) => {
      if (!userId) {
        setError('User ID is required for personalized games');
        return [];
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/pool/category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            limit,
          }),
        });

        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error || 'Error fetching personalized games');
        }

        setGames(data.games);
        setPreferences(data.preferences);
        return data.games;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching personalized games:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  // Registrar uso de juego
  const trackGameUsage = useCallback(
    async (
      gameId: string,
      score?: number,
      timeSpent?: number,
      completed: boolean = false,
    ) => {
      if (!userId) {
        console.warn('User ID is required for tracking game usage');
        return;
      }

      try {
        const response = await fetch('/api/pool/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_id: gameId,
            user_id: userId,
            score,
            time_spent: timeSpent,
            completed,
          }),
        });

        const data = await response.json();

        if (!data.ok) {
          console.error('Error tracking game usage:', data.error);
        } else {
          console.log('Game usage tracked successfully');

          // Si el juego se completó, esto activará automáticamente la generación de 3 juegos más
          if (completed) {
            console.log(
              'Game completed - demand generation will be triggered automatically',
            );
          }
        }
      } catch (err) {
        console.error('Error tracking game usage:', err);
      }
    },
    [userId],
  );

  // Actualizar progreso de juego
  const updateGameProgress = useCallback(
    async (
      gameId: string,
      score?: number,
      timeSpent?: number,
      completed?: boolean,
    ) => {
      if (!userId) {
        console.warn('User ID is required for updating game progress');
        return;
      }

      try {
        const response = await fetch('/api/pool/usage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_id: gameId,
            user_id: userId,
            score,
            time_spent: timeSpent,
            completed,
          }),
        });

        const data = await response.json();

        if (!data.ok) {
          console.error('Error updating game progress:', data.error);
        }
      } catch (err) {
        console.error('Error updating game progress:', err);
      }
    },
    [userId],
  );

  // Obtener estadísticas de generación por demanda
  const fetchDemandStats = useCallback(async (category?: string) => {
    try {
      const url = category
        ? `/api/jobs/demand?category=${category}`
        : '/api/jobs/demand';

      const response = await fetch(url);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Error fetching demand stats');
      }

      setStats(data.stats);
      return data.stats;
    } catch (err) {
      console.error('Error fetching demand stats:', err);
      return null;
    }
  }, []);

  // Obtener preferencias del usuario
  const fetchUserPreferences = useCallback(async () => {
    if (!userId) return null;

    try {
      const response = await fetch(`/api/pool/category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          limit: 0, // Solo obtener preferencias
        }),
      });

      const data = await response.json();

      if (data.ok && data.preferences) {
        setPreferences(data.preferences);
        return data.preferences;
      }

      return null;
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      return null;
    }
  }, [userId]);

  // Actualizar preferencias del usuario
  const updateUserPreferences = useCallback(
    async (preferredSubjects: string[], preferredGrades: string[]) => {
      if (!userId) {
        setError('User ID is required for updating preferences');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/pool/category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            preferred_subjects: preferredSubjects,
            preferred_grades: preferredGrades,
            limit: 0, // Solo actualizar preferencias
          }),
        });

        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error || 'Error updating preferences');
        }

        setPreferences(data.preferences);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error updating preferences:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  // Cargar preferencias al montar el hook
  useEffect(() => {
    if (userId) {
      fetchUserPreferences();
    }
  }, [userId, fetchUserPreferences]);

  return {
    // Estado
    games,
    preferences,
    stats,
    isLoading,
    error,

    // Acciones
    fetchGamesByCategory,
    fetchPersonalizedGames,
    trackGameUsage,
    updateGameProgress,
    fetchDemandStats,
    fetchUserPreferences,
    updateUserPreferences,

    // Utilidades
    clearError: () => setError(null),
    refreshGames: () => {
      if (preferences?.user_category) {
        fetchGamesByCategory(preferences.user_category);
      }
    },
  };
}
