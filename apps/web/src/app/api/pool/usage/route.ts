import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

// Schema para tracking de uso de juegos
const GameUsageSchema = z.object({
  game_id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_grade: z.number().int().min(1).max(12).optional(),
  score: z.number().int().min(0).optional(),
  time_spent: z.number().int().min(0).optional(), // en segundos
  completed: z.boolean().default(false),
});

// Función para determinar categoría de usuario
function getUserCategory(grade: number): string {
  if (grade <= 2) return 'K-2';
  if (grade <= 4) return '3-4';
  if (grade <= 6) return '5-6';
  if (grade <= 8) return '7-8';
  return '9-12';
}

// POST: Registrar inicio de juego
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { game_id, user_id, user_grade, score, time_spent, completed } =
      GameUsageSchema.parse(body);

    const userCategory = getUserCategory(user_grade || 5);

    // Insertar o actualizar registro de uso
    const { data: usage, error } = await supabase
      .from('pool_game_usage')
      .upsert(
        {
          game_id,
          user_id,
          user_category: userCategory,
          user_grade,
          score: score || 0,
          time_spent: time_spent || 0,
          completed: completed || false,
          completed_at: completed ? new Date().toISOString() : null,
        },
        {
          onConflict: 'game_id,user_id',
          ignoreDuplicates: false,
        },
      )
      .select()
      .single();

    if (error) {
      console.error('Error tracking game usage:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    // Si el juego se completó, esto activará el trigger de generación por demanda
    if (completed) {
      console.log(
        `Game ${game_id} completed by user ${user_id} in category ${userCategory}`,
      );
    }

    return NextResponse.json({
      ok: true,
      usage,
      message: 'Game usage tracked successfully',
    });
  } catch (error) {
    console.error('Error in game usage tracking:', error);
    return NextResponse.json(
      { ok: false, error: 'Invalid request data' },
      { status: 400 },
    );
  }
}

// GET: Obtener estadísticas de uso
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const category = url.searchParams.get('category');
    const gameId = url.searchParams.get('game_id');

    let query = supabase.from('pool_game_usage').select(`
      *,
      games_pool!inner(
        id,
        title,
        subject,
        grade,
        content
      )
    `);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (category) {
      query = query.eq('user_category', category);
    }
    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data: usage, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    // Calcular estadísticas
    const stats = {
      total_sessions: usage?.length || 0,
      completed_sessions: usage?.filter((u) => u.completed).length || 0,
      completion_rate:
        usage?.length > 0
          ? (usage?.filter((u) => u.completed).length / usage?.length) * 100
          : 0,
      average_score:
        usage?.filter((u) => u.completed && u.score > 0).length > 0
          ? usage
              ?.filter((u) => u.completed && u.score > 0)
              .reduce((sum, u) => sum + (u.score || 0), 0) /
            usage?.filter((u) => u.completed && u.score > 0).length
          : 0,
      average_time_spent:
        usage?.filter((u) => u.time_spent > 0).length > 0
          ? usage
              ?.filter((u) => u.time_spent > 0)
              .reduce((sum, u) => sum + (u.time_spent || 0), 0) /
            usage?.filter((u) => u.time_spent > 0).length
          : 0,
    };

    return NextResponse.json({
      ok: true,
      stats,
      usage: usage?.slice(0, 50) || [], // Limitar a 50 registros
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// PUT: Actualizar progreso de juego
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { game_id, user_id, score, time_spent, completed } = body;

    if (!game_id || !user_id) {
      return NextResponse.json(
        { ok: false, error: 'game_id and user_id are required' },
        { status: 400 },
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (score !== undefined) updateData.score = score;
    if (time_spent !== undefined) updateData.time_spent = time_spent;
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) {
        updateData.completed_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('pool_game_usage')
      .update(updateData)
      .eq('game_id', game_id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating game usage:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      usage: data,
      message: 'Game usage updated successfully',
    });
  } catch (error) {
    console.error('Error updating game usage:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
