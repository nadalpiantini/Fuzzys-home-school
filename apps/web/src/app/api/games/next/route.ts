import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer(false); // useServiceRole = false

    // Obtener 2 juegos 'ready' para mostrar instantáneamente
    const { data: games, error } = await supabase
      .from('games_pool')
      .select('*')
      .eq('status', 'ready')
      .order('last_served_at', { nullsFirst: true, ascending: true })
      .limit(2);

    if (error) {
      console.error('Error fetching games:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    if (!games || games.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No games available' },
        { status: 404 },
      );
    }

    // Marcar como servidos para rotación
    const gameIds = games.map((g) => g.id);
    await supabase
      .from('games_pool')
      .update({ last_served_at: new Date().toISOString() })
      .in('id', gameIds);

    return NextResponse.json({
      ok: true,
      games: games,
      count: games.length,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
