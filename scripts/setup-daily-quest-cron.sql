-- Script para configurar el cron job de retos diarios
-- Ejecutar en Supabase SQL Editor

-- Verificar que la extensión pg_cron esté habilitada
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Si no está habilitada, habilitarla
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Crear el job diario a las 7:00 AM
SELECT cron.schedule(
  'daily-quest-7am',
  '0 7 * * *', -- Todos los días a las 7:00 AM
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create_daily_quest',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.edge_secret', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Verificar que el job se creó correctamente
SELECT * FROM cron.job WHERE jobname = 'daily-quest-7am';

-- Para probar manualmente (opcional)
-- SELECT net.http_post(
--   url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create_daily_quest',
--   headers := jsonb_build_object(
--     'Authorization', 'Bearer ' || current_setting('app.settings.edge_secret', true),
--     'Content-Type', 'application/json'
--   ),
--   body := '{}'::jsonb
-- );

-- Para eliminar el job (si es necesario)
-- SELECT cron.unschedule('daily-quest-7am');
