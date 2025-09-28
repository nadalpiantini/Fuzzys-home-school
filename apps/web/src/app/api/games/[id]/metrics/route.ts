import { NextResponse } from 'next/server';
import { sb } from '@/lib/brain-engine/core/db';
export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { kind, seconds } = await req.json(); // kind: 'play' | 'like'
    const s = sb();
    
    if (kind === 'play') {
      // Increment play count and update average time
      await s.from('game_metrics')
        .upsert({ 
          game_id: params.id, 
          plays: 1,
          avg_time_seconds: seconds ?? 0
        } as any, { 
          onConflict: 'game_id',
          ignoreDuplicates: false
        });
    } else if (kind === 'like') {
      // Increment like count
      await s.from('game_metrics')
        .upsert({ 
          game_id: params.id, 
          likes: 1
        } as any, { 
          onConflict: 'game_id',
          ignoreDuplicates: false
        });
    }
    
    return NextResponse.json({ ok: true, message: `Metric '${kind}' recorded` });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to record metric' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // TODO: Implement game_metrics table operations
    return NextResponse.json({ 
      ok: true, 
      metrics: { plays: 0, likes: 0, avg_time_seconds: 0 },
      message: 'Game metrics ready - database operations pending'
    });
  } catch (error) {
    console.error('Game metrics GET error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch game metrics' },
      { status: 500 }
    );
  }
}