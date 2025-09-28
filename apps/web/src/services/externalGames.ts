import { createClient } from '@/lib/supabase/client';
import type {
  ExternalGameConfig,
  ExternalGameEvent,
  ExternalGameProgress,
  ExternalGameSource,
} from '@fuzzy/external-games';

// Database types for external games
export interface ExternalGameSession {
  id: string;
  game_id: string;
  student_id: string;
  started_at: string;
  ended_at?: string;
  last_activity_at: string;
  total_time_spent: number;
  score?: number;
  objectives_completed: string[];
  is_completed: boolean;
  session_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StudentExternalGameProgress {
  id: string;
  student_id: string;
  game_id: string;
  first_played_at: string;
  last_played_at: string;
  total_sessions: number;
  total_time_spent: number;
  best_score?: number;
  total_score: number;
  completion_rate: number;
  objectives_completed: string[];
  achievements: string[];
  progress_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ExternalGameAnalytics {
  id: string;
  game_id: string;
  source: ExternalGameSource;
  date: string;
  total_sessions: number;
  unique_players: number;
  total_time_spent: number;
  average_session_time: number;
  completion_rate: number;
  average_score?: number;
  popular_actions: Record<string, any>;
  metrics: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class ExternalGamesService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Game Configurations
  async getGameConfigs(filters?: {
    source?: ExternalGameSource;
    ageRange?: [number, number];
    subjects?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<ExternalGameConfig[]> {
    let query = this.supabase
      .from('external_game_configs')
      .select('*')
      .eq('is_active', true);

    if (filters?.source) {
      query = query.eq('source', filters.source);
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters?.ageRange) {
      const [minAge, maxAge] = filters.ageRange;
      query = query
        .gte('age_range_min', minAge)
        .lte('age_range_max', maxAge);
    }

    if (filters?.subjects && filters.subjects.length > 0) {
      query = query.overlaps('subjects', filters.subjects);
    }

    const { data, error } = await query.order('title');

    if (error) {
      console.error('Error fetching game configs:', error);
      throw error;
    }

    return data.map(this.mapConfigFromDB);
  }

  async getGameConfig(gameId: string): Promise<ExternalGameConfig | null> {
    const { data, error } = await this.supabase
      .from('external_game_configs')
      .select('*')
      .eq('game_id', gameId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching game config:', error);
      throw error;
    }

    return this.mapConfigFromDB(data);
  }

  // Session Management
  async startGameSession(
    gameId: string,
    studentId: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from('external_game_sessions')
      .insert({
        game_id: gameId,
        student_id: studentId,
        session_metadata: metadata,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error starting game session:', error);
      throw error;
    }

    return data.id;
  }

  async updateGameSession(
    sessionId: string,
    updates: {
      lastActivityAt?: Date;
      totalTimeSpent?: number;
      score?: number;
      objectivesCompleted?: string[];
      isCompleted?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const updateData: any = {};

    if (updates.lastActivityAt) {
      updateData.last_activity_at = updates.lastActivityAt.toISOString();
    }

    if (updates.totalTimeSpent !== undefined) {
      updateData.total_time_spent = updates.totalTimeSpent;
    }

    if (updates.score !== undefined) {
      updateData.score = updates.score;
    }

    if (updates.objectivesCompleted) {
      updateData.objectives_completed = updates.objectivesCompleted;
    }

    if (updates.isCompleted !== undefined) {
      updateData.is_completed = updates.isCompleted;
    }

    if (updates.metadata) {
      updateData.session_metadata = updates.metadata;
    }

    const { error } = await this.supabase
      .from('external_game_sessions')
      .update(updateData)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating game session:', error);
      throw error;
    }
  }

  async endGameSession(
    sessionId: string,
    finalData: {
      totalTimeSpent: number;
      score?: number;
      objectivesCompleted: string[];
      isCompleted: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const { error } = await this.supabase
      .from('external_game_sessions')
      .update({
        ended_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        total_time_spent: finalData.totalTimeSpent,
        score: finalData.score,
        objectives_completed: finalData.objectivesCompleted,
        is_completed: finalData.isCompleted,
        session_metadata: finalData.metadata || {},
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error ending game session:', error);
      throw error;
    }
  }

  // Event Tracking
  async trackGameEvent(
    sessionId: string,
    event: Omit<ExternalGameEvent, 'timestamp'>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('external_game_events')
      .insert({
        session_id: sessionId,
        game_id: event.gameId,
        student_id: event.studentId,
        source: event.source,
        action: event.action,
        score: event.score,
        duration: event.duration,
        event_metadata: event.metadata,
      });

    if (error) {
      console.error('Error tracking game event:', error);
      throw error;
    }
  }

  // Student Progress
  async getStudentProgress(
    studentId: string,
    gameId?: string
  ): Promise<StudentExternalGameProgress[]> {
    let query = this.supabase
      .from('student_external_game_progress')
      .select('*')
      .eq('student_id', studentId);

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data, error } = await query.order('last_played_at', { ascending: false });

    if (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }

    return data;
  }

  async getStudentSessions(
    studentId: string,
    gameId?: string,
    limit?: number
  ): Promise<ExternalGameSession[]> {
    let query = this.supabase
      .from('external_game_sessions')
      .select('*')
      .eq('student_id', studentId);

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query.order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching student sessions:', error);
      throw error;
    }

    return data;
  }

  // Analytics
  async getGameAnalytics(
    gameId?: string,
    dateRange?: [Date, Date]
  ): Promise<ExternalGameAnalytics[]> {
    let query = this.supabase
      .from('external_game_analytics')
      .select('*');

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange;
      query = query
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error fetching game analytics:', error);
      throw error;
    }

    return data;
  }

  async getPopularGames(limit: number = 10): Promise<{
    game_id: string;
    title: string;
    source: ExternalGameSource;
    total_sessions: number;
    unique_players: number;
    average_score?: number;
  }[]> {
    const { data, error } = await this.supabase
      .rpc('get_popular_games', { limit_count: limit });

    if (error) {
      console.error('Error fetching popular games:', error);
      throw error;
    }

    return data;
  }

  // Helper method to map database config to ExternalGameConfig
  private mapConfigFromDB(dbConfig: any): ExternalGameConfig {
    return {
      source: dbConfig.source,
      gameId: dbConfig.game_id,
      title: dbConfig.title,
      description: dbConfig.description,
      url: dbConfig.url,
      allowedOrigins: dbConfig.allowed_origins,
      sandbox: dbConfig.sandbox_enabled,
      offline: dbConfig.offline_available,
      trackingEnabled: dbConfig.tracking_enabled,
      objectives: dbConfig.objectives || [],
      ageRange: dbConfig.age_range_min && dbConfig.age_range_max
        ? [dbConfig.age_range_min, dbConfig.age_range_max]
        : undefined,
      subjects: dbConfig.subjects || [],
      difficulty: dbConfig.difficulty,
    };
  }
}

// Singleton instance
export const externalGamesService = new ExternalGamesService();

// Hook for React components to use the service with automatic error handling
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useExternalGameConfigs(filters?: Parameters<typeof externalGamesService.getGameConfigs>[0]) {
  return useQuery({
    queryKey: ['external-game-configs', filters],
    queryFn: () => externalGamesService.getGameConfigs(filters),
  });
}

export function useExternalGameConfig(gameId: string) {
  return useQuery({
    queryKey: ['external-game-config', gameId],
    queryFn: () => externalGamesService.getGameConfig(gameId),
    enabled: !!gameId,
  });
}

export function useStudentProgress(studentId: string, gameId?: string) {
  return useQuery({
    queryKey: ['student-external-progress', studentId, gameId],
    queryFn: () => externalGamesService.getStudentProgress(studentId, gameId),
    enabled: !!studentId,
  });
}

export function useGameAnalytics(gameId?: string, dateRange?: [Date, Date]) {
  return useQuery({
    queryKey: ['external-game-analytics', gameId, dateRange],
    queryFn: () => externalGamesService.getGameAnalytics(gameId, dateRange),
  });
}

export function useStartGameSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { gameId: string; studentId: string; metadata?: Record<string, any> }) =>
      externalGamesService.startGameSession(params.gameId, params.studentId, params.metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-external-progress'] });
    },
  });
}

export function useTrackGameEvent() {
  return useMutation({
    mutationFn: (params: { sessionId: string; event: Omit<ExternalGameEvent, 'timestamp'> }) =>
      externalGamesService.trackGameEvent(params.sessionId, params.event),
  });
}