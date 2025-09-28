-- Unicidad: evita duplicados por título+materia+grado
create unique index if not exists uq_games_tsg
  on games (lower(title), lower(subject), grade_level);

-- Logs si aún no existen
create table if not exists brain_logs(
  id uuid primary key default gen_random_uuid(),
  kind text not null,           -- 'request' | 'response' | 'parse_issues' | 'job'
  payload text not null,
  created_at timestamptz default now()
);

-- Presets/config si no existe
create table if not exists brain_config(
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Métricas por juego si quieres contadores rápidos
create table if not exists game_metrics(
  id bigserial primary key,
  game_id uuid not null,
  plays int default 0,
  likes int default 0,
  avg_time_seconds int default 0,
  updated_at timestamptz default now()
);
create index if not exists ix_game_metrics_game on game_metrics(game_id);

-- Tabla de jobs para scheduler
create table if not exists brain_jobs(
  id uuid primary key default gen_random_uuid(),
  type text not null,
  params jsonb not null,
  status text default 'queued', -- 'queued' | 'running' | 'finished' | 'failed'
  created_at timestamptz default now(),
  started_at timestamptz,
  finished_at timestamptz,
  error text
);

-- Tabla de runs para tracking
create table if not exists brain_runs(
  id uuid primary key default gen_random_uuid(),
  job_id uuid references brain_jobs(id),
  type text not null,
  parameters jsonb not null,
  result jsonb,
  status text default 'running', -- 'running' | 'completed' | 'failed'
  started_at timestamptz default now(),
  completed_at timestamptz,
  error text
);
