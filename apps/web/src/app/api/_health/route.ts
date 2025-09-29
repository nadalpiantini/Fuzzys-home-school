import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const ts = new Date().toISOString();
  try {
    // Health no usa service-role; solo probamos reachability de auth
    const supabase = getSupabaseServer(false);
    const { error } = await supabase.auth.getSession();

    return NextResponse.json(
      { ok: !error, ts, auth: error ? 'error' : 'ok', err: error?.message },
      { status: error ? 500 : 200 }
    );
  } catch (e: any) {
    // El endpoint debe seguir vivo aunque la DB falle
    return NextResponse.json(
      { ok: true, ts, note: 'alive; db probe skipped', err: e?.message },
      { status: 200 }
    );
  }
}
