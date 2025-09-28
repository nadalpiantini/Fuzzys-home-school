-- Game Pool System - Migration
-- Objetivo: Pool de juegos con rotación + generación en background

-- Tabla principal de juegos con pool
CREATE TABLE IF NOT EXISTS public.games_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  content JSONB NOT NULL,      -- payload jugable
  status TEXT NOT NULL CHECK (status IN ('ready','queued','archived','failed')) DEFAULT 'ready',
  source TEXT NOT NULL DEFAULT 'seed' CHECK (source IN ('seed','ai')), -- seed|ai
  hash TEXT GENERATED ALWAYS AS (md5(content::text)) STORED,
  last_served_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs de generación (cola simple)
CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT,
  grade TEXT,
  target_count INTEGER DEFAULT 2,
  status TEXT NOT NULL CHECK (status IN ('pending','running','done','failed')) DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE UNIQUE INDEX IF NOT EXISTS games_pool_hash_ux ON public.games_pool(hash) 
WHERE status IN ('ready','queued');

CREATE INDEX IF NOT EXISTS games_pool_status_idx ON public.games_pool(status);
CREATE INDEX IF NOT EXISTS games_pool_last_served_idx ON public.games_pool(last_served_at);
CREATE INDEX IF NOT EXISTS generation_jobs_status_idx ON public.generation_jobs(status);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION set_updated_at() 
RETURNS TRIGGER AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trg_games_pool_u ON public.games_pool;
CREATE TRIGGER trg_games_pool_u 
  BEFORE UPDATE ON public.games_pool
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_jobs_u ON public.generation_jobs;
CREATE TRIGGER trg_jobs_u 
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.games_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

-- Política: solo juegos 'ready' son visibles públicamente
CREATE POLICY games_pool_read_ready ON public.games_pool
  FOR SELECT USING (status = 'ready');

-- Política: solo service_role puede insertar/actualizar
CREATE POLICY games_pool_service_access ON public.games_pool
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY generation_jobs_service_access ON public.generation_jobs
  FOR ALL USING (auth.role() = 'service_role');

-- Función RPC para tomar un job (lock liviano)
CREATE OR REPLACE FUNCTION take_one_job()
RETURNS generation_jobs
LANGUAGE plpgsql AS $$
DECLARE 
  j generation_jobs;
BEGIN
  SELECT * INTO j FROM generation_jobs
  WHERE status = 'pending'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN 
    RETURN NULL; 
  END IF;

  UPDATE generation_jobs 
  SET status = 'running' 
  WHERE id = j.id;
  
  RETURN j;
END $$;
