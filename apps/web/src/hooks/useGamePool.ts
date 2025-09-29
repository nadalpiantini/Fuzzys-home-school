'use client';

import { useState, useEffect, useCallback } from 'react';

interface Game {
  id: string;
  title: string;
  subject: string;
  grade: string;
  content: any;
  status: 'ready' | 'queued' | 'archived' | 'failed';
  source: 'seed' | 'ai';
  last_served_at?: string;
  ready_at: string;
  created_at: string;
}

interface GamePoolState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  readyCount: number;
}

export function useGamePool() {
  const [state, setState] = useState<GamePoolState>({
    games: [],
    isLoading: true,
    error: null,
    readyCount: 0,
  });

  // Obtener 2 juegos listos para jugar
  const ensurePoolHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/pool/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.ok) {
        console.log(
          `Pool health: ${data.ready} ready games, needs generation: ${data.needs_generation}`,
        );
      }
    } catch (error) {
      console.error('Error ensuring pool health:', error);
    }
  }, []);

  const fetchNextGames = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/games/next');
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Error fetching games');
      }

      setState((prev) => ({
        ...prev,
        games: data.games,
        isLoading: false,
        readyCount: data.count,
      }));

      // Asegurar que el pool tenga suficientes juegos (fire-and-forget)
      ensurePoolHealth();
    } catch (error) {
      console.error('Error fetching games:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [ensurePoolHealth]);


  // Cargar juegos al montar el componente
  useEffect(() => {
    fetchNextGames();
  }, [fetchNextGames]);

  // Refrescar juegos después de completar uno
  const refreshGames = useCallback(() => {
    fetchNextGames();
  }, [fetchNextGames]);

  // Obtener estadísticas del pool
  const getPoolStats = useCallback(async () => {
    try {
      const response = await fetch('/api/pool/ensure', {
        method: 'POST',
      });
      const data = await response.json();

      return {
        ready: data.ready || 0,
        minRequired: data.min_required || 8,
        needsGeneration: data.needs_generation || false,
      };
    } catch (error) {
      console.error('Error getting pool stats:', error);
      return null;
    }
  }, []);

  return {
    games: state.games,
    isLoading: state.isLoading,
    error: state.error,
    readyCount: state.readyCount,
    fetchNextGames,
    refreshGames,
    ensurePoolHealth,
    getPoolStats,
  };
}
