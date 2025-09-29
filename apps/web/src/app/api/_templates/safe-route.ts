export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { z } from 'zod';

const BodySchema = z
  .object({
    // define si necesitas body
  })
  .optional();

export async function GET() {
  try {
    const supabase = getSupabaseServer(false); // sin service role por defecto
    return NextResponse.json({ ok: true, ts: Date.now() });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'error' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const body = BodySchema.parse(json);
    const supabase = getSupabaseServer(false);
    return NextResponse.json({ ok: true, body });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'error' },
      { status: 400 },
    );
  }
}
