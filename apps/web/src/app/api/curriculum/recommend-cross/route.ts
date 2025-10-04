import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/curriculum/recommend-cross?studentId=xxx
 * Returns cross-subject recommendations based on performance patterns
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { ok: false, error: 'missing_studentId', message: 'studentId query parameter is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get cross-subject recommendations from view
    const { data: recommendations, error: recommendationsError } = await supabase
      .from('v_cross_recommendations')
      .select('*')
      .eq('student_id', studentId)
      .not('suggested_subjects', 'is', null);

    if (recommendationsError) {
      console.error('Error fetching recommendations:', recommendationsError);
      return NextResponse.json(
        { ok: false, error: 'database_error', message: 'Failed to fetch recommendations' },
        { status: 500 }
      );
    }

    // Transform recommendations into actionable format
    const actionableRecommendations = (recommendations || []).map((rec) => {
      const suggestedSubjects = rec.suggested_subjects
        ? rec.suggested_subjects.split(',').map((s: string) => s.trim())
        : [];

      // Generate specific recommendations based on weak areas
      const actions = suggestedSubjects.map((subject: string) => {
        let message = '';
        let priority: 'high' | 'medium' | 'low' = 'medium';

        switch (subject) {
          case 'literacy':
            message = `Reforzar lectura y comprensión ayudará con ${rec.weak_subject}`;
            priority = rec.avg_score < 50 ? 'high' : 'medium';
            break;
          case 'math':
            message = `Practicar números y lógica mejorará habilidades en ${rec.weak_subject}`;
            priority = rec.avg_score < 50 ? 'high' : 'medium';
            break;
          case 'science':
            message = `Explorar ciencias complementará tu aprendizaje en ${rec.weak_subject}`;
            priority = 'medium';
            break;
          default:
            message = `Practicar ${subject} te ayudará con ${rec.weak_subject}`;
            priority = 'low';
        }

        return {
          subject,
          message,
          priority,
        };
      });

      return {
        weakSubject: rec.weak_subject,
        sourceCurriculum: rec.source_curriculum,
        avgScore: rec.avg_score,
        attempts: rec.attempts,
        lastAttempt: rec.last_attempt,
        suggestions: actions,
      };
    });

    // Get personalized learning path recommendations
    const { data: pathRecommendations, error: pathError } = await supabase
      .from('v_recommended_chapters')
      .select('*')
      .eq('student_id', studentId)
      .eq('already_unlocked', false)
      .order('curriculum_id')
      .limit(10);

    if (pathError) {
      console.error('Error fetching path recommendations:', pathError);
    }

    // Group path recommendations by curriculum
    const groupedPaths: Record<string, any[]> = {};
    (pathRecommendations || []).forEach((rec) => {
      if (!groupedPaths[rec.curriculum_id]) {
        groupedPaths[rec.curriculum_id] = [];
      }
      groupedPaths[rec.curriculum_id].push({
        chapterId: rec.chapter_id,
        title: rec.title,
        difficulty: rec.difficulty,
        type: rec.recommendation_type,
      });
    });

    return NextResponse.json({
      ok: true,
      crossSubjectRecommendations: actionableRecommendations,
      pathRecommendations: groupedPaths,
      totalRecommendations: actionableRecommendations.length,
      studentId,
    });
  } catch (error) {
    console.error('Recommend-cross API error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'internal_error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/curriculum/recommend-cross
 * Get personalized learning path for specific curriculum
 */
export async function POST(req: Request) {
  try {
    const { studentId, curriculumId, limit } = await req.json();

    if (!studentId || !curriculumId) {
      return NextResponse.json(
        { ok: false, error: 'missing_params', message: 'studentId and curriculumId are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Call the SQL function to get personalized learning path
    const { data: learningPath, error } = await supabase.rpc('get_learning_path', {
      p_student_id: studentId,
      p_curriculum_id: curriculumId,
      p_limit: limit || 5,
    });

    if (error) {
      console.error('Error fetching learning path:', error);
      return NextResponse.json(
        { ok: false, error: 'database_error', message: 'Failed to fetch learning path' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      learningPath: learningPath || [],
      curriculumId,
      studentId,
    });
  } catch (error) {
    console.error('Learning path API error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'internal_error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
