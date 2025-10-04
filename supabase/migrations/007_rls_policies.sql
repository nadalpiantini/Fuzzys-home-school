-- RLS Policies para PRO Pack
-- Implementa seguridad a nivel de fila para todas las tablas críticas

-- Función auxiliar para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        (auth.jwt() ->> 'role') = 'admin' OR
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1) Tabla quizzes - Lectura pública, creación solo admin (solo si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes' AND table_schema = 'public') THEN
        ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Políticas para quizzes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes' AND table_schema = 'public') THEN
        -- Política de lectura pública
        DROP POLICY IF EXISTS quizzes_read ON public.quizzes;
        CREATE POLICY quizzes_read ON public.quizzes
        FOR SELECT USING (true);

        -- Política de inserción solo para admins
        DROP POLICY IF EXISTS quizzes_insert_admin ON public.quizzes;
        CREATE POLICY quizzes_insert_admin ON public.quizzes
        FOR INSERT WITH CHECK (is_admin());

        -- Política de actualización solo para admins
        DROP POLICY IF EXISTS quizzes_update_admin ON public.quizzes;
        CREATE POLICY quizzes_update_admin ON public.quizzes
        FOR UPDATE USING (is_admin());

        -- Política de eliminación solo para admins
        DROP POLICY IF EXISTS quizzes_delete_admin ON public.quizzes;
        CREATE POLICY quizzes_delete_admin ON public.quizzes
        FOR DELETE USING (is_admin());
    END IF;
END $$;

-- 2) Tabla quiz_results - Solo el dueño puede ver/crear sus resultados (solo si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_results' AND table_schema = 'public') THEN
        ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Políticas para quiz_results
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_results' AND table_schema = 'public') THEN
        -- Política de selección: solo el dueño puede ver sus resultados
        DROP POLICY IF EXISTS quiz_results_select_owner ON public.quiz_results;
        CREATE POLICY quiz_results_select_owner ON public.quiz_results
        FOR SELECT USING (user_id = auth.uid());

        -- Política de inserción: solo el dueño puede crear sus resultados
        DROP POLICY IF EXISTS quiz_results_insert_owner ON public.quiz_results;
        CREATE POLICY quiz_results_insert_owner ON public.quiz_results
        FOR INSERT WITH CHECK (user_id = auth.uid());

        -- Política de actualización: solo el dueño puede actualizar sus resultados
        DROP POLICY IF EXISTS quiz_results_update_owner ON public.quiz_results;
        CREATE POLICY quiz_results_update_owner ON public.quiz_results
        FOR UPDATE USING (user_id = auth.uid());

        -- Política de eliminación: solo el dueño puede eliminar sus resultados
        DROP POLICY IF EXISTS quiz_results_delete_owner ON public.quiz_results;
        CREATE POLICY quiz_results_delete_owner ON public.quiz_results
        FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- 3) Tabla external_games_logs - Solo service_role puede escribir (solo si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'external_games_logs' AND table_schema = 'public') THEN
        ALTER TABLE public.external_games_logs ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- No crear políticas de INSERT aquí: solo service_role podrá escribir
-- Esto se maneja desde el código de la aplicación

-- 4) Tabla adaptive_logs - Solo service_role puede escribir (solo si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'adaptive_logs' AND table_schema = 'public') THEN
        ALTER TABLE public.adaptive_logs ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- No crear políticas de INSERT aquí: solo service_role podrá escribir
-- Esto se maneja desde el código de la aplicación

-- 5) Tabla games - Lectura pública, creación solo admin (solo si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'games' AND table_schema = 'public') THEN
        ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Política de lectura pública para games
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'games' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS games_read ON public.games;
        CREATE POLICY games_read ON public.games
        FOR SELECT USING (true);

        -- Política de inserción solo para admins
        DROP POLICY IF EXISTS games_insert_admin ON public.games;
        CREATE POLICY games_insert_admin ON public.games
        FOR INSERT WITH CHECK (is_admin());

        -- Política de actualización solo para admins
        DROP POLICY IF EXISTS games_update_admin ON public.games;
        CREATE POLICY games_update_admin ON public.games
        FOR UPDATE USING (is_admin());

        -- Política de eliminación solo para admins
        DROP POLICY IF EXISTS games_delete_admin ON public.games;
        CREATE POLICY games_delete_admin ON public.games
        FOR DELETE USING (is_admin());
    END IF;
END $$;

-- 6) Tabla educational_content - Lectura pública, creación solo admin (solo si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'educational_content' AND table_schema = 'public') THEN
        ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Políticas para educational_content
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'educational_content' AND table_schema = 'public') THEN
        -- Política de lectura pública
        DROP POLICY IF EXISTS educational_content_read ON public.educational_content;
        CREATE POLICY educational_content_read ON public.educational_content
        FOR SELECT USING (true);

        -- Política de inserción solo para admins
        DROP POLICY IF EXISTS educational_content_insert_admin ON public.educational_content;
        CREATE POLICY educational_content_insert_admin ON public.educational_content
        FOR INSERT WITH CHECK (is_admin());

        -- Política de actualización solo para admins
        DROP POLICY IF EXISTS educational_content_update_admin ON public.educational_content;
        CREATE POLICY educational_content_update_admin ON public.educational_content
        FOR UPDATE USING (is_admin());

        -- Política de eliminación solo para admins
        DROP POLICY IF EXISTS educational_content_delete_admin ON public.educational_content;
        CREATE POLICY educational_content_delete_admin ON public.educational_content
        FOR DELETE USING (is_admin());
    END IF;
END $$;

-- Comentarios para documentación (solo si las tablas existen)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes' AND table_schema = 'public') THEN
        COMMENT ON POLICY quizzes_read ON public.quizzes IS 'Permite lectura pública de quizzes';
        COMMENT ON POLICY quizzes_insert_admin ON public.quizzes IS 'Solo admins pueden crear quizzes';
        COMMENT ON POLICY quizzes_update_admin ON public.quizzes IS 'Solo admins pueden actualizar quizzes';
        COMMENT ON POLICY quizzes_delete_admin ON public.quizzes IS 'Solo admins pueden eliminar quizzes';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_results' AND table_schema = 'public') THEN
        COMMENT ON POLICY quiz_results_select_owner ON public.quiz_results IS 'Solo el dueño puede ver sus resultados';
        COMMENT ON POLICY quiz_results_insert_owner ON public.quiz_results IS 'Solo el dueño puede crear sus resultados';
        COMMENT ON POLICY quiz_results_update_owner ON public.quiz_results IS 'Solo el dueño puede actualizar sus resultados';
        COMMENT ON POLICY quiz_results_delete_owner ON public.quiz_results IS 'Solo el dueño puede eliminar sus resultados';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'games' AND table_schema = 'public') THEN
        COMMENT ON POLICY games_read ON public.games IS 'Permite lectura pública de games';
        COMMENT ON POLICY games_insert_admin ON public.games IS 'Solo admins pueden crear games';
        COMMENT ON POLICY games_update_admin ON public.games IS 'Solo admins pueden actualizar games';
        COMMENT ON POLICY games_delete_admin ON public.games IS 'Solo admins pueden eliminar games';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'educational_content' AND table_schema = 'public') THEN
        COMMENT ON POLICY educational_content_read ON public.educational_content IS 'Permite lectura pública de contenido educativo';
        COMMENT ON POLICY educational_content_insert_admin ON public.educational_content IS 'Solo admins pueden crear contenido educativo';
        COMMENT ON POLICY educational_content_update_admin ON public.educational_content IS 'Solo admins pueden actualizar contenido educativo';
        COMMENT ON POLICY educational_content_delete_admin ON public.educational_content IS 'Solo admins pueden eliminar contenido educativo';
    END IF;
END $$;
