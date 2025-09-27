import { supabase } from './client';
import { Database } from './database.types';

type Game = Database['public']['Tables']['games']['Row'];
type GameInsert = Database['public']['Tables']['games']['Insert'];
type GameSession = Database['public']['Tables']['game_sessions']['Row'];

// Game CRUD operations
export async function getGames(filters?: {
  subject?: string;
  type?: string;
  difficulty?: string;
  gradeLevel?: number;
}) {
  let query = supabase
    .from('games')
    .select(`
      *,
      subjects (
        id,
        name,
        code,
        icon,
        color
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (filters?.subject) {
    query = query.eq('subjects.code', filters.subject);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }
  if (filters?.gradeLevel) {
    query = query.eq('grade_level', filters.gradeLevel);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getGameById(id: string) {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      subjects (
        id,
        name,
        code,
        icon,
        color
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createGame(game: Omit<GameInsert, 'id' | 'created_at' | 'updated_at'>) {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('games')
    .insert({
      ...game,
      created_by: user?.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGame(id: string, updates: Partial<Game>) {
  const { data, error } = await supabase
    .from('games')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Game Sessions
export async function startGameSession(gameId: string) {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      game_id: gameId,
      player_id: user?.user?.id,
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Increment play count
  await supabase.rpc('increment_play_count', { game_id: gameId });

  return data;
}

export async function updateGameSession(
  sessionId: string,
  updates: {
    score?: number;
    max_score?: number;
    answers?: any;
    completed?: boolean;
    time_spent?: number;
  }
) {
  const updateData: any = { ...updates };

  if (updates.completed) {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('game_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPlayerSessions(playerId?: string) {
  const { data: user } = await supabase.auth.getUser();
  const targetPlayerId = playerId || user?.user?.id;

  const { data, error } = await supabase
    .from('game_sessions')
    .select(`
      *,
      games (
        id,
        title,
        type,
        difficulty,
        subjects (
          name,
          icon
        )
      )
    `)
    .eq('player_id', targetPlayerId)
    .order('started_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

// Progress tracking
export async function getStudentProgress(studentId?: string) {
  const { data: user } = await supabase.auth.getUser();
  const targetStudentId = studentId || user?.user?.id;

  const { data, error } = await supabase
    .from('student_progress')
    .select(`
      *,
      subjects (
        id,
        name,
        code,
        icon,
        color
      )
    `)
    .eq('student_id', targetStudentId);

  if (error) throw error;
  return data;
}

// Achievements
export async function getStudentAchievements(studentId?: string) {
  const { data: user } = await supabase.auth.getUser();
  const targetStudentId = studentId || user?.user?.id;

  const { data, error } = await supabase
    .from('student_achievements')
    .select(`
      *,
      achievements (
        id,
        name,
        description,
        icon,
        category,
        points
      )
    `)
    .eq('student_id', targetStudentId)
    .order('earned_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Leaderboard
export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(limit);

  if (error) throw error;
  return data;
}

// Colonial Rally
export async function getColonialRallyPoints() {
  const { data, error } = await supabase
    .from('colonial_rally_points')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getColonialRallyProgress(studentId?: string) {
  const { data: user } = await supabase.auth.getUser();
  const targetStudentId = studentId || user?.user?.id;

  const { data, error } = await supabase
    .from('colonial_rally_progress')
    .select(`
      *,
      colonial_rally_points (
        id,
        name,
        description,
        points,
        difficulty
      )
    `)
    .eq('student_id', targetStudentId);

  if (error) throw error;
  return data;
}

export async function submitColonialRallyChallenge(
  pointId: string,
  score: number,
  timeSpent: number,
  hintsUsed = 0,
  photos?: string[]
) {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('colonial_rally_progress')
    .upsert({
      student_id: user?.user?.id,
      point_id: pointId,
      completed: score > 0,
      score,
      time_spent: timeSpent,
      hints_used: hintsUsed,
      photos: photos || [],
      completed_at: score > 0 ? new Date().toISOString() : null,
      attempts: 1
    }, {
      onConflict: 'student_id,point_id',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}