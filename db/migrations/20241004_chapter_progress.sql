-- Migración: Sistema de progreso por capítulo
-- Ejecutar en Supabase SQL Editor

-- Crear tabla de progreso por capítulo
CREATE TABLE IF NOT EXISTS public.chapter_progress (
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
CREATE INDEX IF NOT EXISTS idx_chapter_progress_student
  ON public.chapter_progress(student_id);

CREATE INDEX IF NOT EXISTS idx_chapter_progress_curriculum
  ON public.chapter_progress(curriculum_id);

CREATE INDEX IF NOT EXISTS idx_chapter_progress_completed
  ON public.chapter_progress(completed) WHERE completed = true;

-- Habilitar RLS
ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS siguiendo el patrón existente (solo crear si no existen)
DO $$
BEGIN
  -- Política para estudiantes: ver su propio progreso
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chapter_progress' 
    AND policyname = 'Students can view their own chapter progress'
  ) THEN
    CREATE POLICY "Students can view their own chapter progress"
      ON public.chapter_progress FOR SELECT
      USING (auth.uid() = student_id);
  END IF;

  -- Política para estudiantes: insertar su propio progreso
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chapter_progress' 
    AND policyname = 'Students can insert their own chapter progress'
  ) THEN
    CREATE POLICY "Students can insert their own chapter progress"
      ON public.chapter_progress FOR INSERT
      WITH CHECK (auth.uid() = student_id);
  END IF;

  -- Política para estudiantes: actualizar su propio progreso
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chapter_progress' 
    AND policyname = 'Students can update their own chapter progress'
  ) THEN
    CREATE POLICY "Students can update their own chapter progress"
      ON public.chapter_progress FOR UPDATE
      USING (auth.uid() = student_id);
  END IF;

  -- Política para profesores (pueden ver progreso de sus estudiantes)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chapter_progress' 
    AND policyname = 'Teachers can view student progress in their classes'
  ) THEN
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
  END IF;
END $$;

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_chapter_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at (solo crear si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_chapter_progress_updated_at'
  ) THEN
    CREATE TRIGGER update_chapter_progress_updated_at
      BEFORE UPDATE ON public.chapter_progress
      FOR EACH ROW EXECUTE FUNCTION update_chapter_progress_updated_at();
  END IF;
END $$;

-- Seeds de achievements básicos
-- Insertar solo si no existen (usando WHERE NOT EXISTS)
INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Detective de la Ñ', 'Has dominado el sonido mágico de la ñ', '🕵️', 'literacy', 50, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Detective de la Ñ');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Lectura con Ritmo', 'Tu fluidez lectora está mejorando cada día', '🎼', 'literacy', 50, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Lectura con Ritmo');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Contador Novato', '¡Puedes contar hasta 10 como un verdadero matemático!', '🔢', 'math', 50, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Contador Novato');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Sumador Inicial', '¡Ya sabes juntar números como un verdadero matemático!', '➕', 'math', 50, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Sumador Inicial');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Maestro de Sonidos Nivel 1', 'Has completado todos los retos de Sonidos Mágicos', '🎯', 'literacy', 100, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Maestro de Sonidos Nivel 1');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Explorador Matemático Nivel 1', 'Has explorado todo el Mundo Matemágico Nivel 1', '🧮', 'math', 100, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Explorador Matemático Nivel 1');

-- Comentarios para documentación
COMMENT ON TABLE public.chapter_progress IS 'Progreso detallado por capítulo de cada curriculum';
COMMENT ON COLUMN public.chapter_progress.curriculum_id IS 'ID del curriculum (ej: math-level1)';
COMMENT ON COLUMN public.chapter_progress.chapter_id IS 'ID del capítulo dentro del curriculum';
COMMENT ON COLUMN public.chapter_progress.score IS 'Puntuación total acumulada en el capítulo';
COMMENT ON COLUMN public.chapter_progress.time_spent IS 'Tiempo total gastado en el capítulo (segundos)';