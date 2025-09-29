export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const s = getSupabaseServer(false);
    await s.from('games').select('id').limit(1);
    return NextResponse.json({ ok: true, ts: Date.now() });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, err: e?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
