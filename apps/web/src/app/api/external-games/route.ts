import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { op = 'status', payload = {} } = await req.json().catch(() => ({}));
    if (op === 'status') {
      return NextResponse.json({
        ok: true,
        flags: {
          ext: process.env.NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED === 'true',
          phet: process.env.NEXT_PUBLIC_PHET_ENABLED === 'true',
          blockly: process.env.NEXT_PUBLIC_BLOCKLY_ENABLED === 'true',
          music: process.env.NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED === 'true',
          ar: process.env.NEXT_PUBLIC_AR_ENABLED === 'true',
        },
      });
    }
    if (op === 'track') {
      const sb = getServiceRoleClient();
      const { data, error } = await sb
        .from('external_games_logs')
        .insert({
          kind: payload?.kind ?? 'unknown',
          meta: payload?.meta ?? {},
        })
        .select('*')
        .single();
      if (error)
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 400 },
        );
      return NextResponse.json({ ok: true, data });
    }
    return NextResponse.json(
      { ok: false, error: 'Unsupported op' },
      { status: 400 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Unexpected' },
      { status: 500 },
    );
  }
}
