-- Demand Generation System - Migration
-- Objetivo: Generar 3 juegos por cada juego completado por un usuario
-- Los juegos se comparten entre usuarios de la misma categoría

-- Tabla para rastrear preferencias y categorías de usuario
CREATE TABLE IF NOT EXISTS public.user_game_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preferred_subjects TEXT[] DEFAULT '{}',
  preferred_grades TEXT[] DEFAULT '{}',
  user_category TEXT NOT NULL, -- 'K-2', '3-4', '5-6', '7-8', '9-12'
  last_played_at TIMESTAMPTZ,
  total_games_played INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla para tracking de uso de juegos del pool
CREATE TABLE IF NOT EXISTS public.pool_game_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games_pool(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_category TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score INTEGER DEFAULT 0,
  time_spent INTEGER, -- en segundos
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para jobs de generación por demanda
CREATE TABLE IF NOT EXISTS public.demand_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by_user_id UUID NOT NULL,
  user_category TEXT NOT NULL,
  preferred_subjects TEXT[],
  preferred_grades TEXT[],
  target_count INTEGER DEFAULT 3,
  status TEXT NOT NULL CHECK (status IN ('pending','running','done','failed')) DEFAULT 'pending',
  generated_games UUID[] DEFAULT '{}', -- IDs de juegos generados
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función para determinar categoría de usuario basada en grade
CREATE OR REPLACE FUNCTION get_user_category(grade_level INTEGER)
RETURNS TEXT AS $$
BEGIN
  CASE 
    WHEN grade_level <= 2 THEN RETURN 'K-2';
    WHEN grade_level <= 4 THEN RETURN '3-4';
    WHEN grade_level <= 6 THEN RETURN '5-6';
    WHEN grade_level <= 8 THEN RETURN '7-8';
    ELSE RETURN '9-12';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Función para crear job de generación por demanda
CREATE OR REPLACE FUNCTION create_demand_generation_job(
  p_user_id UUID,
  p_user_category TEXT,
  p_subjects TEXT[] DEFAULT NULL,
  p_grades TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  job_id UUID;
BEGIN
  INSERT INTO demand_generation_jobs (
    triggered_by_user_id,
    user_category,
    preferred_subjects,
    preferred_grades,
    target_count
  ) VALUES (
    p_user_id,
    p_user_category,
    COALESCE(p_subjects, ARRAY['math', 'language', 'science', 'social', 'geo']),
    COALESCE(p_grades, ARRAY[p_user_category]),
    3
  ) RETURNING id INTO job_id;
  
  RETURN job_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar juegos cuando se completa un juego del pool
CREATE OR REPLACE FUNCTION trigger_demand_generation()
RETURNS TRIGGER AS $$
DECLARE
  user_cat TEXT;
  user_prefs RECORD;
  job_id UUID;
BEGIN
  -- Solo procesar si el juego se completó
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    
    -- Obtener categoría del usuario
    SELECT get_user_category(COALESCE(NEW.user_grade, 5)) INTO user_cat;
    
    -- Obtener o crear preferencias del usuario
    SELECT * INTO user_prefs FROM user_game_preferences WHERE user_id = NEW.user_id;
    
    IF NOT FOUND THEN
      -- Crear preferencias por defecto
      INSERT INTO user_game_preferences (user_id, user_category, preferred_subjects, preferred_grades)
      VALUES (NEW.user_id, user_cat, ARRAY['math', 'language', 'science', 'social', 'geo'], ARRAY[user_cat])
      RETURNING * INTO user_prefs;
    END IF;
    
    -- Crear job de generación por demanda
    SELECT create_demand_generation_job(
      NEW.user_id,
      user_cat,
      user_prefs.preferred_subjects,
      user_prefs.preferred_grades
    ) INTO job_id;
    
    -- Actualizar estadísticas del usuario
    UPDATE user_game_preferences 
    SET 
      total_games_played = total_games_played + 1,
      last_played_at = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RAISE NOTICE 'Created demand generation job % for user % in category %', job_id, NEW.user_id, user_cat;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger en pool_game_usage
DROP TRIGGER IF EXISTS trg_demand_generation ON public.pool_game_usage;
CREATE TRIGGER trg_demand_generation
  AFTER UPDATE ON public.pool_game_usage
  FOR EACH ROW
  EXECUTE FUNCTION trigger_demand_generation();

-- Función para procesar jobs de generación por demanda
CREATE OR REPLACE FUNCTION process_demand_generation_job(job_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  job_record RECORD;
  generated_count INTEGER := 0;
  i INTEGER;
  subject TEXT;
  grade TEXT;
  new_game_id UUID;
BEGIN
  -- Obtener el job
  SELECT * INTO job_record FROM demand_generation_jobs WHERE id = job_id;
  
  IF NOT FOUND OR job_record.status != 'pending' THEN
    RETURN false;
  END IF;
  
  -- Marcar como running
  UPDATE demand_generation_jobs SET status = 'running' WHERE id = job_id;
  
  -- Generar juegos para cada combinación de subject/grade
  FOR i IN 1..job_record.target_count LOOP
    BEGIN
      -- Seleccionar subject y grade aleatoriamente de las preferencias
      SELECT 
        job_record.preferred_subjects[1 + (random() * (array_length(job_record.preferred_subjects, 1) - 1))::int],
        job_record.preferred_grades[1 + (random() * (array_length(job_record.preferred_grades, 1) - 1))::int]
      INTO subject, grade;
      
      -- Insertar juego generado (simulado por ahora, se integrará con DeepSeek)
      INSERT INTO games_pool (
        title,
        subject,
        grade,
        content,
        status,
        source
      ) VALUES (
        'Juego Generado por Demanda ' || i,
        subject,
        grade,
        jsonb_build_object(
          'type', 'quiz',
          'questions', jsonb_build_array(
            jsonb_build_object(
              'question', 'Pregunta generada para ' || subject || ' grado ' || grade,
              'options', jsonb_build_array('A', 'B', 'C', 'D'),
              'correct', 0
            )
          ),
          'theme', 'generado_por_demanda',
          'difficulty', 'medium'
        ),
        'ready',
        'ai'
      ) RETURNING id INTO new_game_id;
      
      -- Agregar a la lista de juegos generados
      UPDATE demand_generation_jobs 
      SET generated_games = array_append(generated_games, new_game_id)
      WHERE id = job_id;
      
      generated_count := generated_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error generating game %: %', i, SQLERRM;
      CONTINUE;
    END;
  END LOOP;
  
  -- Marcar como completado
  UPDATE demand_generation_jobs 
  SET 
    status = CASE WHEN generated_count > 0 THEN 'done' ELSE 'failed' END,
    updated_at = NOW()
  WHERE id = job_id;
  
  RETURN generated_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener juegos por categoría de usuario
CREATE OR REPLACE FUNCTION get_games_for_user_category(p_user_category TEXT, p_limit INTEGER DEFAULT 2)
RETURNS TABLE (
  id UUID,
  title TEXT,
  subject TEXT,
  grade TEXT,
  content JSONB,
  source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gp.id,
    gp.title,
    gp.subject,
    gp.grade,
    gp.content,
    gp.source
  FROM games_pool gp
  WHERE gp.status = 'ready' 
    AND gp.grade = p_user_category
  ORDER BY gp.last_served_at NULLS FIRST, gp.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_game_preferences_user_id ON public.user_game_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_preferences_category ON public.user_game_preferences(user_category);
CREATE INDEX IF NOT EXISTS idx_pool_game_usage_user_id ON public.pool_game_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_pool_game_usage_game_id ON public.pool_game_usage(game_id);
CREATE INDEX IF NOT EXISTS idx_pool_game_usage_category ON public.pool_game_usage(user_category);
CREATE INDEX IF NOT EXISTS idx_pool_game_usage_completed ON public.pool_game_usage(completed);
CREATE INDEX IF NOT EXISTS idx_demand_generation_jobs_status ON public.demand_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_demand_generation_jobs_category ON public.demand_generation_jobs(user_category);

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trg_user_game_preferences_u ON public.user_game_preferences;
CREATE TRIGGER trg_user_game_preferences_u 
  BEFORE UPDATE ON public.user_game_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_demand_generation_jobs_u ON public.demand_generation_jobs;
CREATE TRIGGER trg_demand_generation_jobs_u 
  BEFORE UPDATE ON public.demand_generation_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS Policies
ALTER TABLE public.user_game_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_game_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY user_game_preferences_user_access ON public.user_game_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY pool_game_usage_user_access ON public.pool_game_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY demand_generation_jobs_service_access ON public.demand_generation_jobs
  FOR ALL USING (auth.role() = 'service_role');

-- Función para limpiar jobs antiguos (mantenimiento)
CREATE OR REPLACE FUNCTION cleanup_old_demand_jobs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM demand_generation_jobs 
  WHERE status IN ('done', 'failed') 
    AND created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
