import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer(true); // usa true SOLO si realmente necesitas SERVICE_ROLE
    const body = await req.json();

    // ... tu lógica con supabase aquí
    // ej: await supabase.from('jobs').insert({...})

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // crea instancia también en el catch si la necesitas
    // const supabase = getSupabaseServer(true);
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
