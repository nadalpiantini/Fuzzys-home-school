-- Sistema de Puntos Avanzado - Migración SQL
-- Ejecutar en Supabase SQL Editor

-- 1. Función principal para otorgar puntos con todas las reglas
CREATE OR REPLACE FUNCTION public.award_points_advanced(
  p_student UUID,
  p_subject UUID,             -- subjects.id
  p_base_points INT,
  p_difficulty TEXT,          -- 'easy'|'medium'|'hard'
  p_score INT,                -- 0..100, nullable
  p_time_spent INT,           -- seconds
  p_creativity_bonus INT      -- 0..20, nullable
) RETURNS TABLE(total_awarded INT, new_total_points INT, new_streak INT)
LANGUAGE plpgsql AS $$
DECLARE
  v_row public.student_progress%ROWTYPE;
  v_mult NUMERIC := 1.0;
  v_streak_bonus NUMERIC := 0.0;
  v_score_bonus INT := 0;
  v_time_bonus INT := 0;
  v_add INT := 0;
  v_today DATE := (NOW() AT TIME ZONE 'utc')::DATE;
  v_last DATE;
BEGIN
  -- Asegurar que existe la fila de progreso
  INSERT INTO public.student_progress (student_id, subject_id)
  VALUES (p_student, p_subject)
  ON CONFLICT (student_id, subject_id) DO NOTHING;

  -- Obtener progreso actual
  SELECT * INTO v_row
  FROM public.student_progress
  WHERE student_id = p_student AND subject_id = p_subject
  LIMIT 1;

  -- Calcular streak (días consecutivos)
  v_last := COALESCE(v_row.last_activity::DATE, v_today);
  IF v_last = v_today - 1 THEN
    -- Día consecutivo: incrementar streak
    v_row.streak_days := COALESCE(v_row.streak_days, 0) + 1;
  ELSIF v_last = v_today THEN
    -- Mismo día: mantener streak actual
    v_row.streak_days := COALESCE(v_row.streak_days, 1);
  ELSE
    -- Hubo interrupción: reiniciar streak
    v_row.streak_days := 1;
  END IF;

  -- Multiplicador por dificultad
  CASE p_difficulty
    WHEN 'medium' THEN v_mult := 1.25;
    WHEN 'hard' THEN v_mult := 1.5;
    ELSE v_mult := 1.0; -- easy
  END CASE;

  -- Bonus por streak (5% por día, máximo 25%)
  v_streak_bonus := LEAST(COALESCE(v_row.streak_days, 1) * 0.05, 0.25);

  -- Bonus por score
  IF p_score IS NOT NULL THEN
    IF p_score >= 90 THEN
      v_score_bonus := 20;
    ELSIF p_score >= 70 THEN
      v_score_bonus := 10;
    ELSE
      v_score_bonus := 0;
    END IF;
  END IF;

  -- Bonus/penalización por tiempo
  IF p_time_spent IS NOT NULL THEN
    IF p_time_spent < 180 THEN
      v_time_bonus := 10;  -- < 3 min: bonus rapidez
    ELSIF p_time_spent > 1200 THEN
      v_time_bonus := -5;  -- > 20 min: penalización AFK
    ELSE
      v_time_bonus := 0;
    END IF;
  END IF;

  -- Calcular puntos totales a otorgar
  v_add := FLOOR(
    (p_base_points * v_mult * (1.0 + v_streak_bonus))
  )::INT + v_score_bonus + COALESCE(p_creativity_bonus, 0) + v_time_bonus;

  -- Asegurar que no sean puntos negativos
  v_add := GREATEST(v_add, 0);

  -- Actualizar progreso del estudiante
  UPDATE public.student_progress
  SET
    total_points = COALESCE(total_points, 0) + v_add,
    games_played = COALESCE(games_played, 0) + 1,
    last_activity = NOW(),
    streak_days = v_row.streak_days,
    updated_at = NOW()
  WHERE student_id = p_student AND subject_id = p_subject
  RETURNING total_points, streak_days
  INTO v_row.total_points, v_row.streak_days;

  -- Retornar resultados
  total_awarded := v_add;
  new_total_points := v_row.total_points;
  new_streak := v_row.streak_days;
  RETURN NEXT;
END $$;

-- 2. Función para obtener ranking de estudiantes por puntos
CREATE OR REPLACE FUNCTION public.get_points_leaderboard(
  p_subject_code TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10
) RETURNS TABLE(
  student_id UUID,
  student_name TEXT,
  total_points INT,
  streak_days INT,
  rank_position INT
)
LANGUAGE plpgsql AS $$
BEGIN
  IF p_subject_code IS NOT NULL THEN
    -- Ranking por materia específica
    RETURN QUERY
    SELECT
      sp.student_id,
      p.name,
      sp.total_points,
      sp.streak_days,
      ROW_NUMBER() OVER (ORDER BY sp.total_points DESC)::INT
    FROM public.student_progress sp
    JOIN public.profiles p ON p.id = sp.student_id
    JOIN public.subjects s ON s.id = sp.subject_id
    WHERE s.code = p_subject_code
      AND sp.total_points > 0
    ORDER BY sp.total_points DESC
    LIMIT p_limit;
  ELSE
    -- Ranking global (suma de todas las materias)
    RETURN QUERY
    SELECT
      p.id,
      p.name,
      SUM(sp.total_points)::INT,
      MAX(sp.streak_days)::INT,
      ROW_NUMBER() OVER (ORDER BY SUM(sp.total_points) DESC)::INT
    FROM public.profiles p
    JOIN public.student_progress sp ON sp.student_id = p.id
    WHERE sp.total_points > 0
    GROUP BY p.id, p.name
    ORDER BY SUM(sp.total_points) DESC
    LIMIT p_limit;
  END IF;
END $$;

-- 3. Tabla para enlaces familiares (padres ↔ estudiantes)
CREATE TABLE IF NOT EXISTS public.family_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relation TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (parent_id, student_id)
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_family_links_parent ON public.family_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_family_links_student ON public.family_links(student_id);

-- RLS para family_links
ALTER TABLE public.family_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can read their family links"
  ON public.family_links FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their family links"
  ON public.family_links FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their family links"
  ON public.family_links FOR UPDATE
  USING (auth.uid() = parent_id);

-- 4. Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_family_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_family_links_updated_at
  BEFORE UPDATE ON public.family_links
  FOR EACH ROW EXECUTE FUNCTION update_family_links_updated_at();

-- 5. Función para obtener resumen de progreso familiar
CREATE OR REPLACE FUNCTION public.get_family_progress_summary(
  p_parent_id UUID,
  p_days_back INT DEFAULT 7
) RETURNS TABLE(
  student_id UUID,
  student_name TEXT,
  total_points INT,
  current_streak INT,
  chapters_completed_week INT,
  subjects_active TEXT[]
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    COALESCE(SUM(sp.total_points), 0)::INT,
    COALESCE(MAX(sp.streak_days), 0)::INT,
    (
      SELECT COUNT(*)::INT
      FROM public.chapter_progress cp
      WHERE cp.student_id = p.id
        AND cp.completed = true
        AND cp.updated_at >= NOW() - (p_days_back || ' days')::INTERVAL
    ),
    ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL)
  FROM public.family_links fl
  JOIN public.profiles p ON p.id = fl.student_id
  LEFT JOIN public.student_progress sp ON sp.student_id = p.id
  LEFT JOIN public.subjects s ON s.id = sp.subject_id
  WHERE fl.parent_id = p_parent_id
  GROUP BY p.id, p.name
  ORDER BY COALESCE(SUM(sp.total_points), 0) DESC;
END $$;

-- 6. Seeds para subjects si no existen
INSERT INTO public.subjects (name, code, description, icon, color, created_at)
SELECT 'Matemáticas', 'math', 'Números, operaciones y resolución de problemas', '🔢', '#3B82F6', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE code = 'math');

INSERT INTO public.subjects (name, code, description, icon, color, created_at)
SELECT 'Lectoescritura', 'language', 'Lectura, escritura y comprensión', '📖', '#8B5CF6', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE code = 'language');

INSERT INTO public.subjects (name, code, description, icon, color, created_at)
SELECT 'Ciencias', 'science', 'Exploración y experimentos científicos', '🔬', '#10B981', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE code = 'science');

-- Comentarios para documentación
COMMENT ON FUNCTION public.award_points_advanced IS 'Sistema de puntos avanzado con multiplicadores por dificultad, streak, score y tiempo';
COMMENT ON FUNCTION public.get_points_leaderboard IS 'Ranking de estudiantes por puntos, global o por materia';
COMMENT ON FUNCTION public.get_family_progress_summary IS 'Resumen de progreso familiar para reportes de padres';
COMMENT ON TABLE public.family_links IS 'Enlaces entre padres/tutores y estudiantes para reportes familiares';