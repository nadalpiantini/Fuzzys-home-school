-- Brain Engine Tracking Tables
-- Migration: 005_brain_tracking.sql
-- Purpose: Tables for tracking Brain Engine jobs, runs, and game metrics

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brain_jobs_type ON brain_jobs(type);
CREATE INDEX IF NOT EXISTS idx_brain_jobs_status ON brain_jobs(status);
CREATE INDEX IF NOT EXISTS idx_brain_jobs_created_at ON brain_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_brain_jobs_subjects ON brain_jobs USING GIN ((params->>'subjects'));

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

-- Game Metrics Table - tracks performance data for learning
CREATE TABLE IF NOT EXISTS game_metrics (
  id BIGSERIAL PRIMARY KEY,
  game_id UUID NOT NULL,
  plays INT DEFAULT 0,
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  avg_time_seconds INT DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  difficulty_rating DECIMAL(3,2) DEFAULT 0.00,
  last_played_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for game metrics
CREATE INDEX IF NOT EXISTS idx_game_metrics_game_id ON game_metrics(game_id);
CREATE INDEX IF NOT EXISTS idx_game_metrics_updated_at ON game_metrics(updated_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_metrics_unique_game ON game_metrics(game_id);

-- Brain Configuration Table - stores Brain Engine settings
CREATE TABLE IF NOT EXISTS brain_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for brain config
CREATE INDEX IF NOT EXISTS idx_brain_config_key ON brain_config(config_key);

-- Insert default configuration
INSERT INTO brain_config (config_key, config_value, description) VALUES
  ('default_generation_params', '{"quantity": 5, "difficulty": "adaptive", "language": "es", "culturalContext": "dominican"}', 'Default parameters for game generation'),
  ('quality_thresholds', '{"min_score": 0.7, "max_retry": 3, "timeout_ms": 30000}', 'Quality validation thresholds'),
  ('api_limits', '{"max_concurrent_jobs": 3, "rate_limit_per_hour": 100}', 'API rate limiting configuration')
ON CONFLICT (config_key) DO NOTHING;

-- Function to update brain_config updated_at
CREATE OR REPLACE FUNCTION update_brain_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for brain_config
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
CREATE TRIGGER update_game_metrics_updated_at
    BEFORE UPDATE ON game_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_game_metrics_updated_at();