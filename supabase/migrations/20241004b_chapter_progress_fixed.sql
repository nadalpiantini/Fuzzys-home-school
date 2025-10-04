-- Migración: Sistema de progreso por capítulo (VERSIÓN CORREGIDA)
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

-- Eliminar políticas existentes si existen (para evitar conflictos)
DROP POLICY IF EXISTS "Students can view their own chapter progress" ON public.chapter_progress;
DROP POLICY IF EXISTS "Students can insert their own chapter progress" ON public.chapter_progress;
DROP POLICY IF EXISTS "Students can update their own chapter progress" ON public.chapter_progress;
DROP POLICY IF EXISTS "Teachers can view student progress in their classes" ON public.chapter_progress;

-- Políticas RLS siguiendo el patrón existente
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

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS update_chapter_progress_updated_at ON public.chapter_progress;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_chapter_progress_updated_at
  BEFORE UPDATE ON public.chapter_progress
  FOR EACH ROW EXECUTE FUNCTION update_chapter_progress_updated_at();

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

-- Agregar achievements para los nuevos niveles avanzados
INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Maestro de Sílabas Trabadas', 'Has dominado las sílabas trabadas bl, cl, fl, gl, pl', '🔤', 'literacy', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Maestro de Sílabas Trabadas');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Lector de Palabras Complejas', 'Puedes leer palabras de 3-4 sílabas con facilidad', '📚', 'literacy', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Lector de Palabras Complejas');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Comprendedor de Historias', 'Entiendes perfectamente las historias que lees', '📖', 'literacy', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Comprendedor de Historias');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Maestro del Vocabulario', 'Conoces muchos sinónimos y antónimos', '📝', 'literacy', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Maestro del Vocabulario');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Maestro de las Restas', 'Puedes restar números hasta 20 con facilidad', '➖', 'math', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Maestro de las Restas');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Contador hasta 20', 'Puedes contar y comparar números hasta 20', '🔢', 'math', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Contador hasta 20');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Resolvedor de Problemas', 'Resuelves problemas con suma y resta', '➕➖', 'math', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Resolvedor de Problemas');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Geómetra Avanzado', 'Conoces las figuras 3D: cubos, esferas y cilindros', '🔷', 'math', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Geómetra Avanzado');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Explorador de Estados', 'Entiendes los estados de la materia', '🧊', 'science', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Explorador de Estados');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Maestro de Fuerzas', 'Conoces las fuerzas de empujar y jalar', '⚡', 'science', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Maestro de Fuerzas');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Explorador de la Luz', 'Entiendes cómo funciona la luz y las sombras', '💡', 'science', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Explorador de la Luz');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Botánico Junior', 'Conoces las partes de las plantas', '🌱', 'science', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Botánico Junior');

INSERT INTO public.achievements (name, description, icon, category, points, created_at)
SELECT 'Explorador de Hábitats', 'Conoces dónde viven diferentes animales', '🐾', 'science', 75, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Explorador de Hábitats');

-- Comentarios para documentación
COMMENT ON TABLE public.chapter_progress IS 'Progreso detallado por capítulo de cada curriculum';
COMMENT ON COLUMN public.chapter_progress.curriculum_id IS 'ID del curriculum (ej: math-level1)';
COMMENT ON COLUMN public.chapter_progress.chapter_id IS 'ID del capítulo dentro del curriculum';
COMMENT ON COLUMN public.chapter_progress.score IS 'Puntuación total acumulada en el capítulo';
COMMENT ON COLUMN public.chapter_progress.time_spent IS 'Tiempo total gastado en el capítulo (segundos)';
