export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
export async function GET() {
  try {
    const supabase = getSupabaseServer(false);
    const data = [
      { id: 'mock-1', title: 'Memoria', grade: '3', tags: ['tradicional'] },
    ];
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
