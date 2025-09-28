-- RLS Policies para PRO Pack
-- Implementa seguridad a nivel de fila para todas las tablas críticas

-- 1) Tabla quizzes - Lectura pública, creación solo admin
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para quizzes
CREATE POLICY quizzes_read ON public.quizzes
FOR SELECT USING (true);

-- Política de inserción solo para admins
CREATE POLICY quizzes_insert_admin ON public.quizzes
FOR INSERT WITH CHECK (
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Política de actualización solo para admins
CREATE POLICY quizzes_update_admin ON public.quizzes
FOR UPDATE USING (
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Política de eliminación solo para admins
CREATE POLICY quizzes_delete_admin ON public.quizzes
FOR DELETE USING (
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 2) Tabla quiz_results - Solo el dueño puede ver/crear sus resultados
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Política de selección: solo el dueño puede ver sus resultados
CREATE POLICY quiz_results_select_owner ON public.quiz_results
FOR SELECT USING (user_id = auth.uid());

-- Política de inserción: solo el dueño puede crear sus resultados
CREATE POLICY quiz_results_insert_owner ON public.quiz_results
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Política de actualización: solo el dueño puede actualizar sus resultados
CREATE POLICY quiz_results_update_owner ON public.quiz_results
FOR UPDATE USING (user_id = auth.uid());

-- Política de eliminación: solo el dueño puede eliminar sus resultados
CREATE POLICY quiz_results_delete_owner ON public.quiz_results
FOR DELETE USING (user_id = auth.uid());

-- 3) Tabla external_games_logs - Solo service_role puede escribir
ALTER TABLE public.external_games_logs ENABLE ROW LEVEL SECURITY;

-- No crear políticas de INSERT aquí: solo service_role podrá escribir
-- Esto se maneja desde el código de la aplicación

-- 4) Tabla adaptive_logs - Solo service_role puede escribir
ALTER TABLE public.adaptive_logs ENABLE ROW LEVEL SECURITY;

-- No crear políticas de INSERT aquí: solo service_role podrá escribir
-- Esto se maneja desde el código de la aplicación

-- 5) Tabla games - Lectura pública, creación solo admin
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para games
CREATE POLICY games_read ON public.games
FOR SELECT USING (true);

-- Política de inserción solo para admins
CREATE POLICY games_insert_admin ON public.games
FOR INSERT WITH CHECK (
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Política de actualización solo para admins
CREATE POLICY games_update_admin ON public.games
FOR UPDATE USING (
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Política de eliminación solo para admins
CREATE POLICY games_delete_admin ON public.games
FOR DELETE USING (
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 6) Tabla educational_content - Lectura pública, creación solo admin
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para educational_content
CREATE POLICY educational_content_read ON public.educational_content
FOR SELECT USING (true);

-- Política de inserción solo para admins
CREATE POLICY educational_content_insert_admin ON public.educational_content
FOR INSERT WITH CHECK (
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Política de actualización solo para admins
CREATE POLICY educational_content_update_admin ON public.educational_content
FOR UPDATE USING (
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Política de eliminación solo para admins
CREATE POLICY educational_content_delete_admin ON public.educational_content
FOR DELETE USING (
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Comentarios para documentación
COMMENT ON POLICY quizzes_read ON public.quizzes IS 'Permite lectura pública de quizzes';
COMMENT ON POLICY quizzes_insert_admin ON public.quizzes IS 'Solo admins pueden crear quizzes';
COMMENT ON POLICY quiz_results_select_owner ON public.quiz_results IS 'Solo el dueño puede ver sus resultados';
COMMENT ON POLICY quiz_results_insert_owner ON public.quiz_results IS 'Solo el dueño puede crear sus resultados';
COMMENT ON POLICY games_read ON public.games IS 'Permite lectura pública de games';
COMMENT ON POLICY games_insert_admin ON public.games IS 'Solo admins pueden crear games';
COMMENT ON POLICY educational_content_read ON public.educational_content IS 'Permite lectura pública de contenido educativo';
COMMENT ON POLICY educational_content_insert_admin ON public.educational_content IS 'Solo admins pueden crear contenido educativo';
