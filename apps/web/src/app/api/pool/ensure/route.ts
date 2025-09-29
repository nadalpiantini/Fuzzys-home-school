import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const MIN_READY = parseInt(process.env.NEXT_PUBLIC_POOL_MIN_READY || '8', 10);

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer(false); // useServiceRole = false

    // Contar juegos 'ready' disponibles
    const { count, error: countError } = await supabase
      .from('games_pool')
      .select('id', { head: true, count: 'exact' })
      .eq('status', 'ready');

    if (countError) {
      console.error('Error counting ready games:', countError);
      return NextResponse.json(
        { ok: false, error: countError.message },
        { status: 500 },
      );
    }

    const readyCount = count || 0;

    // Si hay menos juegos de los necesarios, crear job de generación
    if (readyCount < MIN_READY) {
      const { error: jobError } = await supabase
        .from('generation_jobs')
        .insert({
          subject: null, // Generar para todas las materias
          grade: null, // Generar para todas las edades
          target_count: parseInt(process.env.POOL_BACKGROUND_BATCH || '2', 10),
        });

      if (jobError) {
        console.error('Error creating generation job:', jobError);
        return NextResponse.json(
          { ok: false, error: jobError.message },
          { status: 500 },
        );
      }

      console.log(
        `Created generation job. Ready games: ${readyCount}, Min required: ${MIN_READY}`,
      );
    }

    return NextResponse.json({
      ok: true,
      ready: readyCount,
      min_required: MIN_READY,
      needs_generation: readyCount < MIN_READY,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
