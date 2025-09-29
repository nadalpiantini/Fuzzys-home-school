import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseServer(false);
    const { error } = await supabase.from('_health').select('ok').limit(1);
    return NextResponse.json({
      ok: !error,
      ts: new Date().toISOString(),
      err: error?.message ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, ts: new Date().toISOString(), err: String(err) }, { status: 500 });
  }
}
