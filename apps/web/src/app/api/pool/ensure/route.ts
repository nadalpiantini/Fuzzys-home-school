import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer(false);

    // Contar juegos listos
    const { count: readyCount, error: countError } = await supabase
      .from('games_pool')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ready');

    if (countError) {
      console.error('Error counting ready games:', countError);
      // Fallback: assume we have some games available
      return NextResponse.json({
        ok: true,
        ready: 2, // Mock count
        min_required: 8,
        needs_generation: true,
      });
    }

    const ready = readyCount || 0;
    const minRequired = 8; // Mínimo de juegos listos
    const needsGeneration = ready < minRequired;

    // Si necesita generación, activar el proceso (fire-and-forget)
    if (needsGeneration) {
      console.log(
        `Pool health: ${ready} ready games, needs generation: ${needsGeneration}`,
      );
      // Aquí podrías activar un proceso de generación de juegos
      // Por ahora solo logueamos la necesidad
    }

    return NextResponse.json({
      ok: true,
      ready,
      min_required: minRequired,
      needs_generation: needsGeneration,
    });
  } catch (error) {
    console.error('Unexpected error in pool ensure:', error);
    // Fallback: return mock data
    return NextResponse.json({
      ok: true,
      ready: 2,
      min_required: 8,
      needs_generation: true,
    });
  }
}
