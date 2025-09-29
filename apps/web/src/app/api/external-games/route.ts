import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer(false);
    const { op, payload } = await req.json();

    switch (op) {
      case 'status':
        // Verificar estado de juegos externos
        const { data: configs, error: configsError } = await supabase
          .from('external_game_configs')
          .select('id, game_id, title, is_active')
          .eq('is_active', true)
          .limit(10);

        if (configsError) {
          console.error('Error fetching external game configs:', configsError);
          return NextResponse.json(
            { ok: false, error: 'Failed to fetch game configs' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          ok: true,
          data: {
            activeGames: configs?.length || 0,
            games: configs || []
          }
        });

      case 'track':
        // Trackear eventos de juegos externos
        const { kind, meta } = payload || {};
        
        if (!kind) {
          return NextResponse.json(
            { ok: false, error: 'Event kind is required' },
            { status: 400 }
          );
        }

        // Insertar evento de tracking
        const { error: trackError } = await supabase
          .from('external_game_events')
          .insert({
            event_type: kind,
            event_data: meta || {},
            timestamp: new Date().toISOString()
          });

        if (trackError) {
          console.error('Error tracking external game event:', trackError);
          return NextResponse.json(
            { ok: false, error: 'Failed to track event' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true });

      default:
        return NextResponse.json(
          { ok: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (e: any) {
    console.error('External games API error:', e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseServer(false);
    
    // Obtener juegos externos activos
    const { data: games, error } = await supabase
      .from('external_game_configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching external games:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch games' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: games || []
    });
  } catch (e: any) {
    console.error('External games GET error:', e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}
