import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

interface AwardPointsRequest {
  studentId: string;
  subjectCode: string; // 'math', 'language', 'science'
  basePoints?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  score?: number; // 0-100
  time_spent?: number; // seconds
  creativity?: number; // 0-20
}

interface AwardPointsResponse {
  total_awarded: number;
  new_total_points: number;
  new_streak: number;
}

export async function POST(req: Request) {
  try {
    const body: AwardPointsRequest = await req.json();
    const {
      studentId,
      subjectCode,
      basePoints = 100,
      difficulty = 'medium',
      score = null,
      time_spent = 0,
      creativity = 0
    } = body;

    // Validar parámetros requeridos
    if (!studentId || !subjectCode) {
      return NextResponse.json(
        { ok: false, error: 'Missing required parameters: studentId, subjectCode' },
        { status: 400 }
      );
    }

    // Validar valores
    if (basePoints < 0 || basePoints > 1000) {
      return NextResponse.json(
        { ok: false, error: 'basePoints must be between 0 and 1000' },
        { status: 400 }
      );
    }

    if (score !== null && (score < 0 || score > 100)) {
      return NextResponse.json(
        { ok: false, error: 'score must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { ok: false, error: 'difficulty must be easy, medium, or hard' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer(true);

    // Buscar subject por código
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, code, name')
      .eq('code', subjectCode)
      .single();

    if (subjectError || !subject) {
      return NextResponse.json(
        { ok: false, error: `Subject not found: ${subjectCode}` },
        { status: 404 }
      );
    }

    // Llamar a la función SQL para otorgar puntos
    const { data, error } = await supabase.rpc('award_points_advanced', {
      p_student: studentId,
      p_subject: subject.id,
      p_base_points: basePoints,
      p_difficulty: difficulty,
      p_score: score,
      p_time_spent: time_spent,
      p_creativity_bonus: creativity
    });

    if (error) {
      console.error('Error awarding points:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    const result: AwardPointsResponse = data?.[0] || {
      total_awarded: 0,
      new_total_points: 0,
      new_streak: 0
    };

    return NextResponse.json({
      ok: true,
      result,
      subject: subject.name,
      breakdown: {
        basePoints,
        difficulty,
        score,
        time_spent,
        creativity,
        awarded: result.total_awarded
      }
    });

  } catch (error) {
    console.error('Points API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET para obtener puntos actuales del estudiante
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const subjectCode = searchParams.get('subjectCode');

    if (!studentId) {
      return NextResponse.json(
        { ok: false, error: 'Missing studentId parameter' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer(true);

    let query = supabase
      .from('student_progress')
      .select(`
        total_points,
        streak_days,
        games_played,
        last_activity,
        subjects:subject_id (
          name,
          code,
          icon,
          color
        )
      `)
      .eq('student_id', studentId);

    if (subjectCode) {
      const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .eq('code', subjectCode)
        .single();

      if (!subject) {
        return NextResponse.json(
          { ok: false, error: `Subject not found: ${subjectCode}` },
          { status: 404 }
        );
      }

      query = query.eq('subject_id', subject.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching points:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // Calcular totales
    const totalPoints = data?.reduce((sum, item) => sum + (item.total_points || 0), 0) || 0;
    const maxStreak = data?.reduce((max, item) => Math.max(max, item.streak_days || 0), 0) || 0;

    return NextResponse.json({
      ok: true,
      data: {
        totalPoints,
        maxStreak,
        bySubject: data || [],
        summary: {
          totalGamesPlayed: data?.reduce((sum, item) => sum + (item.games_played || 0), 0) || 0,
          lastActivity: data?.reduce((latest, item) => {
            const itemDate = new Date(item.last_activity || 0);
            const latestDate = new Date(latest || 0);
            return itemDate > latestDate ? item.last_activity : latest;
          }, null)
        }
      }
    });

  } catch (error) {
    console.error('Points GET API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}