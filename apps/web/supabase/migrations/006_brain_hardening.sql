-- Brain Engine Hardening - Anti-duplicates, Logs, Config, Metrics
-- Migration: 006_brain_hardening.sql

-- Unicidad: evita duplicados por título+materia+grado
CREATE UNIQUE INDEX IF NOT EXISTS uq_games_tsg
  ON games (lower(title), lower(subject), grade_level);

-- Logs si aún no existen
CREATE TABLE IF NOT EXISTS brain_logs(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL,           -- 'request' | 'response' | 'parse_issues' | 'job'
  payload TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_brain_logs_kind ON brain_logs(kind);
CREATE INDEX IF NOT EXISTS idx_brain_logs_created_at ON brain_logs(created_at);

-- Presets/config si no existe
CREATE TABLE IF NOT EXISTS brain_config(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para config
CREATE INDEX IF NOT EXISTS idx_brain_config_name ON brain_config(name);

-- Métricas por juego si quieres contadores rápidos
CREATE TABLE IF NOT EXISTS game_metrics(
  id BIGSERIAL PRIMARY KEY,
  game_id UUID NOT NULL,
  plays INT DEFAULT 0,
  likes INT DEFAULT 0,
  avg_time_seconds INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_game_metrics_game ON game_metrics(game_id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_game_metrics_unique_game ON game_metrics(game_id);

-- Brain Jobs Table - tracks generation commands and their status
CREATE TABLE IF NOT EXISTS brain_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('GENERATE', 'CONFIGURE', 'ANALYZE', 'OPTIMIZE')),
  params JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error TEXT,
  result JSONB DEFAULT '{}'
);

-- Indexes for brain jobs
CREATE INDEX IF NOT EXISTS idx_brain_jobs_type ON brain_jobs(type);
CREATE INDEX IF NOT EXISTS idx_brain_jobs_status ON brain_jobs(status);
CREATE INDEX IF NOT EXISTS idx_brain_jobs_created_at ON brain_jobs(created_at);

-- Brain Runs Table - tracks execution results and generated content
CREATE TABLE IF NOT EXISTS brain_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES brain_jobs(id) ON DELETE CASCADE,
  games_created INT DEFAULT 0,
  games_succeeded INT DEFAULT 0,
  games_failed INT DEFAULT 0,
  processing_time_ms INT DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for brain runs
CREATE INDEX IF NOT EXISTS idx_brain_runs_job_id ON brain_runs(job_id);
CREATE INDEX IF NOT EXISTS idx_brain_runs_created_at ON brain_runs(created_at);

-- Insert default configuration
INSERT INTO brain_config (name, value) VALUES
  ('default', '{"subjects":["matemáticas"],"gradeLevel":[3,4,5],"language":"es","culturalContext":"dominican","difficulty":"adaptive","quantity":5}'),
  ('rd_primary', '{"subjects":["matemáticas","ciencias"],"gradeLevel":[3,4,5],"language":"es","culturalContext":"dominican","difficulty":"adaptive","quantity":3}'),
  ('rd_secondary', '{"subjects":["matemáticas","lengua","ciencias"],"gradeLevel":[6,7,8],"language":"es","culturalContext":"dominican","difficulty":"adaptive","quantity":4}')
ON CONFLICT (name) DO NOTHING;

-- Function to update brain_config updated_at
CREATE OR REPLACE FUNCTION update_brain_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for brain_config
DROP TRIGGER IF EXISTS update_brain_config_updated_at ON brain_config;
CREATE TRIGGER update_brain_config_updated_at
    BEFORE UPDATE ON brain_config
    FOR EACH ROW
    EXECUTE FUNCTION update_brain_config_updated_at();

-- Function to update game_metrics updated_at
CREATE OR REPLACE FUNCTION update_game_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for game_metrics
DROP TRIGGER IF EXISTS update_game_metrics_updated_at ON game_metrics;
CREATE TRIGGER update_game_metrics_updated_at
    BEFORE UPDATE ON game_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_game_metrics_updated_at();
