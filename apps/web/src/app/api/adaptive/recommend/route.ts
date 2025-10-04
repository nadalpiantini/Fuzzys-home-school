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

    // Obtener historial reciente de capítulos para análisis de tendencias
    const { data: recentChapters } = await supabase
      .from('chapter_progress')
      .select('curriculum_id, chapter_id, score, time_spent, completed, updated_at')
      .eq('student_id', studentId)
      .eq('completed', true)
      .order('updated_at', { ascending: false })
      .limit(10);

    // Si no hay datos, devolver recomendaciones por defecto
    if (!patterns || patterns.length === 0) {
      return NextResponse.json({
        ok: true,
        data: [
          {
            curriculumId: 'math-level1',
            suggestedDifficulty: 'medium',
            nextChapter: 'numeros-01',
            motivation:
              '¡Bienvenido! Fuzzy te ayudará a aprender paso a paso 🎯',
            confidence: 0.5,
            reasoning: 'Primera sesión - comenzando con dificultad media',
            factors: {
              performance: 'sin_datos',
              time: 'sin_datos',
              consistency: 'sin_datos',
              trend: 'nuevo_estudiante'
            }
          },
        ],
      });
    }

    // Motor de recomendación mejorado con análisis multi-factor
    const recommendations: any[] = [];

    for (const pattern of patterns) {
      // === ANÁLISIS MULTI-FACTOR ===
      
      // 1. Factor de Rendimiento (score)
      const avgScore = pattern.avg_score || 0;
      let performanceFactor = 0.5;
      if (avgScore >= 90) performanceFactor = 0.9;
      else if (avgScore >= 75) performanceFactor = 0.7;
      else if (avgScore >= 60) performanceFactor = 0.5;
      else performanceFactor = 0.3;

      // 2. Factor de Tiempo (eficiencia)
      const avgTime = pattern.avg_time || 0;
      let timeFactor = 0.5;
      if (avgTime < 180) timeFactor = 0.8; // Rápido y eficiente
      else if (avgTime < 300) timeFactor = 0.6; // Tiempo normal
      else if (avgTime < 420) timeFactor = 0.4; // Necesita más tiempo
      else timeFactor = 0.2; // Lento, posible dificultad

      // 3. Factor de Consistencia (streak)
      const streakDays = pattern.streak_days || 0;
      let consistencyFactor = 0.5;
      if (streakDays >= 14) consistencyFactor = 0.95;
      else if (streakDays >= 7) consistencyFactor = 0.8;
      else if (streakDays >= 3) consistencyFactor = 0.6;
      else if (streakDays >= 1) consistencyFactor = 0.4;
      else consistencyFactor = 0.2;

      // 4. Análisis de Tendencia (últimos 3 capítulos)
      const curriculumRecent = (recentChapters || [])
        .filter((ch: any) => ch.curriculum_id === pattern.curriculum_id)
        .slice(0, 3);

      let trendFactor = 0.5;
      let trendDirection: 'improving' | 'stable' | 'struggling' | 'insufficient_data' = 'insufficient_data';

      if (curriculumRecent.length >= 2) {
        const scores = curriculumRecent.map((ch: any) => ch.score || 0);
        const avgRecent = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        const isImproving = scores.length >= 2 && scores[0] > scores[1];
        const isStable = scores.every((s: number) => Math.abs(s - avgRecent) < 10);
        
        if (isImproving) {
          trendDirection = 'improving';
          trendFactor = 0.8;
        } else if (isStable && avgRecent >= 70) {
          trendDirection = 'stable';
          trendFactor = 0.7;
        } else if (avgRecent < 60) {
          trendDirection = 'struggling';
          trendFactor = 0.3;
        } else {
          trendDirection = 'stable';
          trendFactor = 0.5;
        }
      }

      // 5. Calcular confianza ponderada
      const confidence = (
        performanceFactor * 0.35 +  // 35% peso en rendimiento
        timeFactor * 0.25 +          // 25% peso en eficiencia
        consistencyFactor * 0.20 +   // 20% peso en consistencia
        trendFactor * 0.20           // 20% peso en tendencia
      );

      // 6. Determinar dificultad sugerida basada en análisis combinado
      let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
      let motivation = '';
      let reasoning = '';

      if (confidence >= 0.75 && avgScore >= 85 && trendDirection === 'improving') {
        difficulty = 'hard';
        motivation = '¡Excelente progreso! 🚀 Es hora de desafíos mayores.';
        reasoning = 'Alto rendimiento sostenido con tendencia de mejora';
      } else if (confidence >= 0.6 && avgScore >= 70) {
        difficulty = 'medium';
        motivation = '¡Vas genial! Mantén el ritmo y sigue aprendiendo 🌟';
        reasoning = 'Rendimiento sólido y consistente';
      } else if (avgScore < 60 || trendDirection === 'struggling') {
        difficulty = 'easy';
        motivation = 'Fuzzy recomienda repasar antes de avanzar. ¡Tú puedes! 💪';
        reasoning = 'Refuerzo necesario para consolidar conceptos';
      } else if (avgTime > 300 && avgScore < 70) {
        difficulty = 'easy';
        motivation = 'Vamos paso a paso. ¡Fuzzy cree en ti! 🐌✨';
        reasoning = 'Tiempo elevado sugiere necesidad de refuerzo';
      } else {
        difficulty = 'medium';
        motivation = 'Avanza con confianza. ¡Estás aprendiendo bien! 💫';
        reasoning = 'Progreso estable y equilibrado';
      }

      // Mensaje especial para rachas largas
      if (streakDays >= 7) {
        motivation = `¡Increíble racha de ${streakDays} días! 🏆 ${motivation}`;
      }

      // 7. Sugerir siguiente capítulo basado en curriculum y dificultad
      let nextChapter = 'next';
      
      if (pattern.curriculum_id.includes('math')) {
        if (difficulty === 'easy') {
          nextChapter = 'numeros-repaso-01';
        } else if (difficulty === 'hard') {
          nextChapter = 'sumas-avanzadas-01';
        } else {
          nextChapter = 'sumas-basicas-01';
        }
      } else if (pattern.curriculum_id.includes('literacy')) {
        if (difficulty === 'easy') {
          nextChapter = 'letras-repaso-01';
        } else if (difficulty === 'hard') {
          nextChapter = 'palabras-complejas-01';
        } else {
          nextChapter = 'fluidez-basica-01';
        }
      } else if (pattern.curriculum_id.includes('science')) {
        if (difficulty === 'easy') {
          nextChapter = 'observacion-guiada-01';
        } else if (difficulty === 'hard') {
          nextChapter = 'experimentos-avanzados-01';
        } else {
          nextChapter = 'descubrimiento-01';
        }
      }

      recommendations.push({
        curriculumId: pattern.curriculum_id,
        suggestedDifficulty: difficulty,
        nextChapter,
        motivation,
        confidence: Math.round(confidence * 100) / 100,
        reasoning,
        factors: {
          performance: performanceFactor,
          time: timeFactor,
          consistency: consistencyFactor,
          trend: trendDirection
        },
        metrics: {
          studentName: pattern.student_name,
          chaptersDone: pattern.chapters_done,
          avgScore: Math.round(avgScore),
          avgTime: Math.round(avgTime),
          streakDays: streakDays,
          totalPoints: pattern.total_points,
        },
      });
    }

    // Si no hay recomendaciones, crear una por defecto
    if (recommendations.length === 0) {
      recommendations.push({
        curriculumId: 'math-level1',
        suggestedDifficulty: 'medium',
        nextChapter: 'numeros-01',
        motivation:
          '¡Bienvenido a tu aventura de aprendizaje! Fuzzy te guiará paso a paso 🎯',
        confidence: 0.5,
        reasoning: 'Recomendación inicial basada en edad y nivel',
        factors: {
          performance: 0.5,
          time: 0.5,
          consistency: 0.5,
          trend: 'nuevo_estudiante'
        }
      });
    }

    // Ordenar recomendaciones por confianza (mayor a menor)
    recommendations.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

    return NextResponse.json({
      ok: true,
      data: recommendations,
      timestamp: new Date().toISOString(),
      analytics: {
        totalRecommendations: recommendations.length,
        highConfidence: recommendations.filter(r => r.confidence >= 0.75).length,
        mediumConfidence: recommendations.filter(r => r.confidence >= 0.5 && r.confidence < 0.75).length,
        lowConfidence: recommendations.filter(r => r.confidence < 0.5).length,
      }
    });
  } catch (error) {
    console.error('Error in adaptive recommend API:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
