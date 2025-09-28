import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { kind, seconds } = await req.json(); // kind: 'play' | 'like'
  const s = sb();
  if (kind === 'play') {
    await s.rpc('increment_play', { game_id_input: params.id, sec: seconds ?? 0 }).catch(async () => {
      // fallback si no hay RPC
      await s.from('game_metrics')
        .upsert({ game_id: params.id, plays: 1 }, { onConflict: 'game_id' });
    });
  } else if (kind === 'like') {
    await s.from('game_metrics')
      .upsert({ game_id: params.id, likes: 1 }, { onConflict: 'game_id' });
  }
  return NextResponse.json({ ok: true });
}
