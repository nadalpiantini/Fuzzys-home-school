import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectCode = searchParams.get('subjectCode'); // optional
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validar limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { ok: false, error: 'limit must be between 1 and 100' },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Llamar a la función SQL para obtener el leaderboard
    const { data, error } = await supabase.rpc('get_points_leaderboard', {
      p_subject_code: subjectCode,
      p_limit: limit,
    });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: data || [],
      meta: {
        subjectCode: subjectCode || 'global',
        limit,
        count: data?.length || 0,
      },
    });
  } catch (error) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
