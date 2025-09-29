import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('games').select('id').limit(1);
    if (error) throw error;

    return NextResponse.json({
      ok: true,
      db: 'connected',
      sample: data?.length ?? 0,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 },
    );
  }
}
