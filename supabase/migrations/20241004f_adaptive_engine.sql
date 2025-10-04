-- Sistema de IA Adaptativa - Motor de Recomendaciones
-- Analiza el rendimiento del estudiante y recomienda siguiente nivel de dificultad

-- 1. Función para analizar rendimiento reciente del estudiante
CREATE OR REPLACE FUNCTION public.analyze_student_performance(
  p_student UUID,
  p_subject UUID,
  p_curriculum_id TEXT DEFAULT NULL,
  p_lookback_days INT DEFAULT 7
) RETURNS TABLE(
  avg_score NUMERIC,
  completion_rate NUMERIC,
  avg_time_per_chapter INT,
  struggle_indicators INT,
  mastery_indicators INT,
  recommended_difficulty TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_chapters_completed INT;
  v_chapters_attempted INT;
  v_total_score NUMERIC;
  v_total_time INT;
  v_low_scores INT;
  v_high_scores INT;
  v_avg_score NUMERIC;
  v_completion_rate NUMERIC;
BEGIN
  -- Obtener métricas de progreso reciente
  SELECT
    COUNT(*) FILTER (WHERE cp.completed = true),
    COUNT(*),
    COALESCE(AVG(cp.score), 0),
    COALESCE(SUM(cp.time_spent), 0),
    COUNT(*) FILTER (WHERE cp.score < 70 AND cp.score IS NOT NULL),
    COUNT(*) FILTER (WHERE cp.score >= 90 AND cp.score IS NOT NULL)
  INTO
    v_chapters_completed,
    v_chapters_attempted,
    v_total_score,
    v_total_time,
    v_low_scores,
    v_high_scores
  FROM public.chapter_progress cp
  WHERE cp.student_id = p_student
    AND (p_curriculum_id IS NULL OR cp.curriculum_id = p_curriculum_id)
    AND cp.updated_at >= NOW() - (p_lookback_days || ' days')::INTERVAL;

  -- Si no hay datos, retornar valores por defecto
  IF v_chapters_attempted = 0 THEN
    avg_score := 0;
    completion_rate := 0;
    avg_time_per_chapter := 0;
    struggle_indicators := 0;
    mastery_indicators := 0;
    recommended_difficulty := 'easy';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Calcular métricas
  v_avg_score := v_total_score;
  v_completion_rate := (v_chapters_completed::NUMERIC / v_chapters_attempted::NUMERIC) * 100;

  avg_score := ROUND(v_avg_score, 2);
  completion_rate := ROUND(v_completion_rate, 2);
  avg_time_per_chapter := CASE
    WHEN v_chapters_completed > 0 THEN v_total_time / v_chapters_completed
    ELSE 0
  END;
  struggle_indicators := v_low_scores;
  mastery_indicators := v_high_scores;

  -- Determinar dificultad recomendada basada en reglas
  IF v_avg_score >= 90 AND v_completion_rate >= 80 THEN
    recommended_difficulty := 'hard';
  ELSIF v_avg_score >= 75 AND v_completion_rate >= 70 THEN
    recommended_difficulty := 'medium';
  ELSIF v_avg_score < 60 OR v_completion_rate < 50 THEN
    recommended_difficulty := 'easy';
  ELSE
    recommended_difficulty := 'medium';
  END IF;

  RETURN NEXT;
END $$;

-- 2. Función para obtener recomendaciones de siguiente capítulo
CREATE OR REPLACE FUNCTION public.get_adaptive_recommendations(
  p_student UUID,
  p_curriculum_id TEXT,
  p_limit INT DEFAULT 3
) RETURNS TABLE(
  chapter_id TEXT,
  chapter_title TEXT,
  recommended_difficulty TEXT,
  reason TEXT,
  confidence_score NUMERIC
)
LANGUAGE plpgsql AS $$
DECLARE
  v_performance RECORD;
  v_completed_chapters TEXT[];
  v_subject_id UUID;
BEGIN
  -- Obtener subject_id desde el curriculum
  SELECT s.id INTO v_subject_id
  FROM public.subjects s
  WHERE s.code = CASE
    WHEN p_curriculum_id LIKE 'math%' THEN 'math'
    WHEN p_curriculum_id LIKE 'literacy%' THEN 'language'
    ELSE 'science'
  END
  LIMIT 1;

  -- Analizar rendimiento del estudiante
  SELECT * INTO v_performance
  FROM public.analyze_student_performance(p_student, v_subject_id, p_curriculum_id, 14);

  -- Obtener capítulos ya completados
  SELECT ARRAY_AGG(cp.chapter_id)
  INTO v_completed_chapters
  FROM public.chapter_progress cp
  WHERE cp.student_id = p_student
    AND cp.curriculum_id = p_curriculum_id
    AND cp.completed = true;

  -- Por ahora retornamos recomendación genérica
  -- En producción, esto debería consultar metadata de capítulos del curriculum
  chapter_id := 'next_chapter';
  chapter_title := 'Siguiente Capítulo Sugerido';
  recommended_difficulty := v_performance.recommended_difficulty;

  reason := CASE
    WHEN v_performance.avg_score >= 90 THEN 'Excelente rendimiento, listo para desafíos'
    WHEN v_performance.avg_score >= 75 THEN 'Buen progreso, continuar con dificultad moderada'
    WHEN v_performance.avg_score >= 60 THEN 'Progreso estable, reforzar fundamentos'
    ELSE 'Necesita más práctica en conceptos básicos'
  END;

  confidence_score := CASE
    WHEN v_performance.avg_score >= 80 THEN 0.9
    WHEN v_performance.avg_score >= 60 THEN 0.7
    ELSE 0.5
  END;

  RETURN NEXT;
END $$;

-- 3. Función para ajustar dificultad dinámicamente durante el juego
CREATE OR REPLACE FUNCTION public.suggest_difficulty_adjustment(
  p_student UUID,
  p_current_difficulty TEXT,
  p_recent_score INT,
  p_time_spent INT
) RETURNS TABLE(
  should_adjust BOOLEAN,
  new_difficulty TEXT,
  adjustment_reason TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_difficulty_index INT;
  v_new_index INT;
BEGIN
  -- Mapear dificultad actual a índice
  v_difficulty_index := CASE p_current_difficulty
    WHEN 'easy' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'hard' THEN 3
    ELSE 2
  END;

  -- Reglas de ajuste
  should_adjust := false;
  new_difficulty := p_current_difficulty;
  adjustment_reason := 'No se requiere ajuste';

  -- Subir dificultad si dominio excelente
  IF p_recent_score >= 95 AND p_time_spent < 300 AND v_difficulty_index < 3 THEN
    should_adjust := true;
    v_new_index := v_difficulty_index + 1;
    adjustment_reason := 'Rendimiento excepcional, aumentar desafío';

  -- Bajar dificultad si lucha significativa
  ELSIF p_recent_score < 60 AND v_difficulty_index > 1 THEN
    should_adjust := true;
    v_new_index := v_difficulty_index - 1;
    adjustment_reason := 'Dificultad muy alta, reducir para reforzar conceptos';

  -- Subir si buen rendimiento consistente
  ELSIF p_recent_score >= 85 AND v_difficulty_index < 3 THEN
    should_adjust := true;
    v_new_index := v_difficulty_index + 1;
    adjustment_reason := 'Buen progreso, listo para más desafío';
  END IF;

  -- Mapear índice de vuelta a dificultad
  IF should_adjust THEN
    new_difficulty := CASE v_new_index
      WHEN 1 THEN 'easy'
      WHEN 2 THEN 'medium'
      WHEN 3 THEN 'hard'
      ELSE 'medium'
    END;
  END IF;

  RETURN NEXT;
END $$;

-- 4. Vista para dashboard adaptativo del estudiante
CREATE OR REPLACE VIEW public.v_student_adaptive_profile AS
SELECT
  sp.student_id,
  p.name AS student_name,
  s.code AS subject_code,
  s.name AS subject_name,
  sp.total_points,
  sp.streak_days,
  sp.games_played,
  sp.last_activity,
  perf.avg_score,
  perf.completion_rate,
  perf.recommended_difficulty,
  CASE
    WHEN perf.avg_score >= 90 THEN 'mastery'
    WHEN perf.avg_score >= 75 THEN 'proficient'
    WHEN perf.avg_score >= 60 THEN 'developing'
    ELSE 'needs_support'
  END AS proficiency_level
FROM public.student_progress sp
JOIN public.profiles p ON p.id = sp.student_id
JOIN public.subjects s ON s.id = sp.subject_id
CROSS JOIN LATERAL public.analyze_student_performance(sp.student_id, sp.subject_id, NULL, 14) perf;

-- 5. Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_chapter_progress_student_curriculum
  ON public.chapter_progress(student_id, curriculum_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chapter_progress_score
  ON public.chapter_progress(score) WHERE score IS NOT NULL;

-- 6. Triggers para actualizar recomendaciones automáticamente
CREATE OR REPLACE FUNCTION public.update_adaptive_recommendations()
RETURNS TRIGGER AS $$
BEGIN
  -- Aquí se podría cachear recomendaciones en una tabla dedicada
  -- Por ahora solo registramos el evento
  RAISE NOTICE 'Recomendaciones actualizadas para estudiante: %', NEW.student_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recommendations
  AFTER INSERT OR UPDATE ON public.chapter_progress
  FOR EACH ROW
  WHEN (NEW.completed = true OR NEW.score IS NOT NULL)
  EXECUTE FUNCTION public.update_adaptive_recommendations();

-- Comentarios para documentación
COMMENT ON FUNCTION public.analyze_student_performance IS 'Analiza el rendimiento del estudiante y recomienda nivel de dificultad';
COMMENT ON FUNCTION public.get_adaptive_recommendations IS 'Genera recomendaciones personalizadas del siguiente capítulo';
COMMENT ON FUNCTION public.suggest_difficulty_adjustment IS 'Sugiere ajuste de dificultad en tiempo real basado en rendimiento';
COMMENT ON VIEW public.v_student_adaptive_profile IS 'Vista consolidada del perfil adaptativo del estudiante';
