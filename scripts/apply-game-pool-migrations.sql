-- Script para aplicar las migraciones del Game Pool System
-- Ejecutar en Supabase SQL Editor

-- 1. Aplicar migración de esquema
\i supabase/migrations/005_game_pool_system.sql

-- 2. Aplicar migración de datos semilla
\i supabase/migrations/006_seed_initial_games.sql

-- 3. Verificar que todo esté funcionando
SELECT 
  'games_pool' as table_name,
  COUNT(*) as total_games,
  COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_games,
  COUNT(CASE WHEN source = 'seed' THEN 1 END) as seed_games,
  COUNT(CASE WHEN source = 'ai' THEN 1 END) as ai_games
FROM public.games_pool

UNION ALL

SELECT 
  'generation_jobs' as table_name,
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_jobs,
  COUNT(CASE WHEN status = 'running' THEN 1 END) as running_jobs,
  COUNT(CASE WHEN status = 'done' THEN 1 END) as done_jobs
FROM public.generation_jobs;

-- 4. Mostrar algunos juegos de ejemplo
SELECT 
  title,
  subject,
  grade,
  status,
  source,
  created_at
FROM public.games_pool 
ORDER BY created_at DESC 
LIMIT 5;
