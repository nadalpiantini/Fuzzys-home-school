-- Migración: Asegurar que la tabla chapter_progress existe
-- Ejecutar en Supabase SQL Editor

-- Verificar si la tabla existe, si no, crearla
DO $$
BEGIN
    -- Crear tabla de progreso por capítulo solo si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chapter_progress' AND table_schema = 'public') THEN
        CREATE TABLE public.chapter_progress (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          curriculum_id TEXT NOT NULL,   -- ej: 'math-level1', 'literacy-level1'
          chapter_id TEXT NOT NULL,      -- ej: 'nums-01', 'enye-01'
          completed BOOLEAN DEFAULT false,
          score INTEGER DEFAULT 0,       -- puntuación total del capítulo
          activities_completed INTEGER DEFAULT 0, -- contador de actividades completadas
          total_activities INTEGER DEFAULT 1,     -- total de actividades en el capítulo
          time_spent INTEGER DEFAULT 0,           -- tiempo en segundos
          last_activity TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),

          -- Constraint único por estudiante/curriculum/capítulo
          UNIQUE (student_id, curriculum_id, chapter_id)
        );

        -- Índices para optimizar queries
        CREATE INDEX idx_chapter_progress_student
          ON public.chapter_progress(student_id);

        CREATE INDEX idx_chapter_progress_curriculum
          ON public.chapter_progress(curriculum_id);

        CREATE INDEX idx_chapter_progress_completed
          ON public.chapter_progress(completed) WHERE completed = true;

        -- Habilitar RLS
        ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;

        -- Políticas RLS
        CREATE POLICY "Students can view their own chapter progress"
          ON public.chapter_progress FOR SELECT
          USING (auth.uid() = student_id);

        CREATE POLICY "Students can insert their own chapter progress"
          ON public.chapter_progress FOR INSERT
          WITH CHECK (auth.uid() = student_id);

        CREATE POLICY "Students can update their own chapter progress"
          ON public.chapter_progress FOR UPDATE
          USING (auth.uid() = student_id);

        -- Política para profesores (pueden ver progreso de sus estudiantes)
        CREATE POLICY "Teachers can view student progress in their classes"
          ON public.chapter_progress FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.class_enrollments ce
              JOIN public.classes c ON c.id = ce.class_id
              WHERE ce.student_id = chapter_progress.student_id
              AND c.teacher_id = auth.uid()
            )
          );

        -- Función para actualizar timestamp automáticamente
        CREATE OR REPLACE FUNCTION update_chapter_progress_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Trigger para actualizar updated_at
        CREATE TRIGGER update_chapter_progress_updated_at
          BEFORE UPDATE ON public.chapter_progress
          FOR EACH ROW EXECUTE FUNCTION update_chapter_progress_updated_at();

        -- Comentarios para documentación
        COMMENT ON TABLE public.chapter_progress IS 'Progreso detallado por capítulo de cada curriculum';
        COMMENT ON COLUMN public.chapter_progress.curriculum_id IS 'ID del curriculum (ej: math-level1)';
        COMMENT ON COLUMN public.chapter_progress.chapter_id IS 'ID del capítulo dentro del curriculum';
        COMMENT ON COLUMN public.chapter_progress.score IS 'Puntuación total acumulada en el capítulo';
        COMMENT ON COLUMN public.chapter_progress.time_spent IS 'Tiempo total gastado en el capítulo (segundos)';

        RAISE NOTICE 'Tabla chapter_progress creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla chapter_progress ya existe, no se realizaron cambios';
    END IF;
END $$;
