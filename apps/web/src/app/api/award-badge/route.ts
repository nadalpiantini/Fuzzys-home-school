import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, badgeName, curriculumId, chapterId } = body;

    if (!studentId || !badgeName) {
      return NextResponse.json(
        { ok: false, error: 'Missing required parameters: studentId, badgeName' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar el achievement por nombre
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .select('id, name, description, icon, points')
      .eq('name', badgeName)
      .single();

    if (achievementError || !achievement) {
      return NextResponse.json(
        { ok: false, error: `Achievement not found: ${badgeName}` },
        { status: 404 }
      );
    }

    // Verificar si el estudiante ya tiene este badge
    const { data: existingAward } = await supabase
      .from('student_achievements')
      .select('id')
      .eq('student_id', studentId)
      .eq('achievement_id', achievement.id)
      .single();

    if (existingAward) {
      return NextResponse.json({
        ok: true,
        message: 'Badge already awarded',
        achievement,
        alreadyAwarded: true
      });
    }

    // Otorgar el badge
    const { data: awardData, error: awardError } = await supabase
      .from('student_achievements')
      .insert({
        student_id: studentId,
        achievement_id: achievement.id,
        earned_at: new Date().toISOString(),
        context: {
          curriculum_id: curriculumId,
          chapter_id: chapterId,
          auto_awarded: true
        }
      })
      .select()
      .single();

    if (awardError) {
      console.error('Error awarding badge:', awardError);
      return NextResponse.json(
        { ok: false, error: awardError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Badge awarded successfully!',
      achievement,
      award: awardData,
      alreadyAwarded: false
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { ok: false, error: 'Missing studentId parameter' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Obtener todos los badges del estudiante
    const { data, error } = await supabase
      .from('student_achievements')
      .select(`
        id,
        earned_at,
        context,
        achievement:achievements(
          id,
          name,
          description,
          icon,
          category,
          points
        )
      `)
      .eq('student_id', studentId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching student badges:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      badges: data || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}