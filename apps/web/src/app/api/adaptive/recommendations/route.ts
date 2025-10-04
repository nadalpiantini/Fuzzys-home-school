import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

interface RecommendationsRequest {
  studentId: string;
  curriculumId: string;
  limit?: number;
}

interface PerformanceRequest {
  studentId: string;
  subjectCode: string;
  curriculumId?: string;
  lookbackDays?: number;
}

interface DifficultyAdjustmentRequest {
  studentId: string;
  currentDifficulty: 'easy' | 'medium' | 'hard';
  recentScore: number;
  timeSpent: number;
}

// GET - Obtener análisis de rendimiento
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const subjectCode = searchParams.get('subjectCode');
    const curriculumId = searchParams.get('curriculumId');
    const lookbackDays = parseInt(searchParams.get('lookbackDays') || '7');

    if (!studentId || !subjectCode) {
      return NextResponse.json(
        { ok: false, error: 'Missing required parameters: studentId, subjectCode' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer(true);

    // Obtener subject ID
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

    // Llamar a función de análisis de rendimiento
    const { data: performance, error: perfError } = await supabase.rpc(
      'analyze_student_performance',
      {
        p_student: studentId,
        p_subject: subject.id,
        p_curriculum_id: curriculumId,
        p_lookback_days: lookbackDays,
      }
    );

    if (perfError) {
      console.error('Error analyzing performance:', perfError);
      return NextResponse.json(
        { ok: false, error: perfError.message },
        { status: 500 }
      );
    }

    const result = performance?.[0] || {
      avg_score: 0,
      completion_rate: 0,
      avg_time_per_chapter: 0,
      struggle_indicators: 0,
      mastery_indicators: 0,
      recommended_difficulty: 'medium',
    };

    return NextResponse.json({
      ok: true,
      data: {
        avgScore: result.avg_score,
        completionRate: result.completion_rate,
        avgTimePerChapter: result.avg_time_per_chapter,
        struggleIndicators: result.struggle_indicators,
        masteryIndicators: result.mastery_indicators,
        recommendedDifficulty: result.recommended_difficulty,
        proficiencyLevel:
          result.avg_score >= 90
            ? 'mastery'
            : result.avg_score >= 75
            ? 'proficient'
            : result.avg_score >= 60
            ? 'developing'
            : 'needs_support',
      },
    });
  } catch (error) {
    console.error('Performance Analysis API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Obtener recomendaciones adaptativas o ajuste de dificultad
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action; // 'recommendations' | 'adjust_difficulty'

    if (action === 'recommendations') {
      return handleRecommendations(body);
    } else if (action === 'adjust_difficulty') {
      return handleDifficultyAdjustment(body);
    } else {
      return NextResponse.json(
        { ok: false, error: 'Invalid action. Use "recommendations" or "adjust_difficulty"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Adaptive API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleRecommendations(body: RecommendationsRequest) {
  const { studentId, curriculumId, limit = 3 } = body;

  if (!studentId || !curriculumId) {
    return NextResponse.json(
      { ok: false, error: 'Missing required parameters: studentId, curriculumId' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServer(true);

  const { data, error } = await supabase.rpc('get_adaptive_recommendations', {
    p_student: studentId,
    p_curriculum_id: curriculumId,
    p_limit: limit,
  });

  if (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    data: data || [],
  });
}

async function handleDifficultyAdjustment(body: DifficultyAdjustmentRequest) {
  const { studentId, currentDifficulty, recentScore, timeSpent } = body;

  if (!studentId || !currentDifficulty || recentScore === undefined || timeSpent === undefined) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Missing required parameters: studentId, currentDifficulty, recentScore, timeSpent',
      },
      { status: 400 }
    );
  }

  if (!['easy', 'medium', 'hard'].includes(currentDifficulty)) {
    return NextResponse.json(
      { ok: false, error: 'currentDifficulty must be easy, medium, or hard' },
      { status: 400 }
    );
  }

  if (recentScore < 0 || recentScore > 100) {
    return NextResponse.json(
      { ok: false, error: 'recentScore must be between 0 and 100' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServer(true);

  const { data, error } = await supabase.rpc('suggest_difficulty_adjustment', {
    p_student: studentId,
    p_current_difficulty: currentDifficulty,
    p_recent_score: recentScore,
    p_time_spent: timeSpent,
  });

  if (error) {
    console.error('Error suggesting difficulty adjustment:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  const result = data?.[0] || {
    should_adjust: false,
    new_difficulty: currentDifficulty,
    adjustment_reason: 'No adjustment needed',
  };

  return NextResponse.json({
    ok: true,
    data: {
      shouldAdjust: result.should_adjust,
      newDifficulty: result.new_difficulty,
      adjustmentReason: result.adjustment_reason,
    },
  });
}
