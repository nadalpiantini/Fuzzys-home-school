import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { ok: false, error: 'missing_studentId' },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServer(true);

    // Obtener patrones de aprendizaje del estudiante
    const { data: patterns, error } = await supabase
      .from('v_learning_patterns')
      .select('*')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching learning patterns:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    // Si no hay datos, devolver recomendaciones por defecto
    if (!patterns || patterns.length === 0) {
      return NextResponse.json({
        ok: true,
        data: [
          {
            curriculumId: 'math-level1',
            suggestedDifficulty: 'medium',
            nextChapter: 'sumas-01',
            motivation:
              '¡Bienvenido! Fuzzy te ayudará a aprender paso a paso 🎯',
            confidence: 0.5,
          },
        ],
      });
    }

    // Motor de recomendación heurístico
    const recommendations: any[] = [];

    for (const pattern of patterns) {
      let difficulty = 'medium';
      let nextChapter = 'next';
      let motivation = '';
      let confidence = 0.7;

      // Análisis de rendimiento
      if (pattern.avg_score >= 90) {
        difficulty = 'hard';
        motivation = '¡Excelente trabajo! 🚀 Es hora de desafíos más grandes.';
        confidence = 0.9;
      } else if (pattern.avg_score < 60) {
        difficulty = 'easy';
        motivation =
          'Fuzzy recomienda repasar antes de avanzar. ¡Tú puedes! 💪';
        confidence = 0.8;
      } else {
        difficulty = 'medium';
        motivation = '¡Vas genial! Mantén el ritmo y sigue aprendiendo 🌟';
        confidence = 0.7;
      }

      // Análisis de tiempo (si toma mucho tiempo, sugerir fácil)
      if (pattern.avg_time > 300) {
        // más de 5 minutos
        difficulty = 'easy';
        motivation =
          'Fuzzy ve que necesitas más tiempo. ¡No te preocupes, vamos paso a paso! 🐌';
        confidence = 0.8;
      }

      // Análisis de streak (motivación basada en consistencia)
      if (pattern.streak_days >= 7) {
        motivation = `¡Increíble! ${pattern.streak_days} días seguidos. ¡Eres un campeón! 🏆`;
        confidence = 0.9;
      } else if (pattern.streak_days < 3) {
        motivation = '¡Vamos a crear una racha! Fuzzy cree en ti 💫';
        confidence = 0.6;
      }

      // Sugerir siguiente capítulo basado en curriculum
      if (pattern.curriculum_id.includes('math')) {
        if (difficulty === 'easy') {
          nextChapter = 'numeros-01';
        } else if (difficulty === 'hard') {
          nextChapter = 'sumas-avanzadas-01';
        } else {
          nextChapter = 'sumas-01';
        }
      } else if (pattern.curriculum_id.includes('literacy')) {
        if (difficulty === 'easy') {
          nextChapter = 'letras-basicas-01';
        } else if (difficulty === 'hard') {
          nextChapter = 'palabras-complejas-01';
        } else {
          nextChapter = 'fluidez-01';
        }
      } else if (pattern.curriculum_id.includes('science')) {
        if (difficulty === 'easy') {
          nextChapter = 'observacion-01';
        } else if (difficulty === 'hard') {
          nextChapter = 'experimentos-01';
        } else {
          nextChapter = 'descubrimiento-01';
        }
      }

      recommendations.push({
        curriculumId: pattern.curriculum_id,
        suggestedDifficulty: difficulty,
        nextChapter,
        motivation,
        confidence,
        studentName: pattern.student_name,
        chaptersDone: pattern.chapters_done,
        avgScore: Math.round(pattern.avg_score),
        avgTime: Math.round(pattern.avg_time),
        streakDays: pattern.streak_days,
        totalPoints: pattern.total_points,
      });
    }

    // Si no hay recomendaciones, crear una por defecto
    if (recommendations.length === 0) {
      recommendations.push({
        curriculumId: 'math-level1',
        suggestedDifficulty: 'medium',
        nextChapter: 'sumas-01',
        motivation:
          '¡Bienvenido a tu aventura de aprendizaje! Fuzzy te guiará paso a paso 🎯',
        confidence: 0.5,
      });
    }

    return NextResponse.json({
      ok: true,
      data: recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in adaptive recommend API:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
