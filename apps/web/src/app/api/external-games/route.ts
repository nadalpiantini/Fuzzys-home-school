import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const CATALOG = [
  { id: 'blockly-music', type: 'blockly', game: 'music', title: 'Blockly Music', tags: ['blockly','music'] },
  { id: 'blockly-movie', type: 'blockly', game: 'movie', title: 'Blockly Movie', tags: ['blockly','movie'] },
  { id: 'live-quiz', type: 'quiz', title: 'Quiz en Vivo', tags: ['live-quiz'] },
  { id: 'match', type: 'classic', title: 'Emparejar', tags: ['match'] },
  { id: 'true-false', type: 'classic', title: 'Verdadero/Falso', tags: ['true-false'] },
  { id: 'mind-map', type: 'creative', title: 'Mapa Mental', tags: ['mind-map'] },
  { id: 'branching-scenario', type: 'creative', title: 'Escenario Ramificado', tags: ['branching-scenario'] },
  { id: 'team-challenge', type: 'coop', title: 'Desafío en Equipo', tags: ['team-challenge'] },
  { id: 'critical-thinking', type: 'skill', title: 'Pensamiento Crítico', tags: ['critical-thinking'] },
  { id: 'leadership', type: 'skill', title: 'Liderazgo', tags: ['leadership'] },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type')?.toLowerCase() || '';
    const game = searchParams.get('game')?.toLowerCase() || '';
    let list = CATALOG;

    if (type) list = list.filter(x => (x.type || '').toLowerCase() === type);
    if (game) list = list.filter(x =>
      (x.game || '').toLowerCase() === game ||
      x.id.toLowerCase() === game ||
      (x.tags || []).some(t => t.toLowerCase() === game)
    );

    return NextResponse.json({ ok: true, data: list });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer(false);
    const body = await req.json();
    // TODO: tracking si quieres
    return NextResponse.json({ ok: true, received: body ?? null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Server error' }, { status: 500 });
  }
}