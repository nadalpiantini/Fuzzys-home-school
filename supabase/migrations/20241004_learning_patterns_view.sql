-- Vista de patrones de aprendizaje para el sistema adaptativo
-- Ejecutar en Supabase SQL Editor

CREATE OR REPLACE VIEW public.v_learning_patterns AS
SELECT
  cp.student_id,
  p.full_name as student_name,
  cp.curriculum_id,
  COUNT(cp.id) as chapters_done,
  AVG(cp.score) as avg_score,
  AVG(cp.time_spent) as avg_time,
  MAX(cp.updated_at) as last_activity,
  COALESCE(sp.total_points, 0) as total_points,
  COALESCE(sp.streak_days, 0) as streak_days
FROM public.chapter_progress cp
JOIN public.profiles p ON p.id = cp.student_id
LEFT JOIN public.student_progress sp ON sp.student_id = cp.student_id
WHERE cp.completed = true
GROUP BY cp.student_id, p.full_name, cp.curriculum_id, sp.total_points, sp.streak_days;

-- Índices para optimizar la vista
CREATE INDEX IF NOT EXISTS idx_chapter_progress_completed_score 
  ON public.chapter_progress(completed, score) 
  WHERE completed = true;

CREATE INDEX IF NOT EXISTS idx_chapter_progress_student_curriculum 
  ON public.chapter_progress(student_id, curriculum_id, completed);

-- Comentarios para documentación
COMMENT ON VIEW public.v_learning_patterns IS 'Vista que analiza patrones de aprendizaje de estudiantes para el sistema adaptativo';
COMMENT ON COLUMN public.v_learning_patterns.chapters_done IS 'Número de capítulos completados por el estudiante';
COMMENT ON COLUMN public.v_learning_patterns.avg_score IS 'Puntuación promedio del estudiante';
COMMENT ON COLUMN public.v_learning_patterns.avg_time IS 'Tiempo promedio en segundos por capítulo';
COMMENT ON COLUMN public.v_learning_patterns.last_activity IS 'Última actividad del estudiante';
COMMENT ON COLUMN public.v_learning_patterns.total_points IS 'Puntos totales acumulados';
COMMENT ON COLUMN public.v_learning_patterns.streak_days IS 'Días consecutivos de actividad';
