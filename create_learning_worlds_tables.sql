-- Tablas para el sistema de Mundos de Aprendizaje
-- Ejecutar en Supabase SQL Editor

-- Tabla para progreso de capítulos
CREATE TABLE IF NOT EXISTS chapter_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curriculum_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  activity_completed BOOLEAN DEFAULT FALSE,
  time_spent INTEGER DEFAULT 0, -- en segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, curriculum_id, chapter_id)
);

-- Tabla para logros y badges
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- 'badge', 'certificate', 'milestone'
  achievement_name TEXT NOT NULL,
  description TEXT,
  curriculum_id TEXT,
  chapter_id TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, achievement_name)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_chapter_progress_student ON chapter_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_curriculum ON chapter_progress(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_achievements_student ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON student_achievements(achievement_type);

-- RLS (Row Level Security) policies
ALTER TABLE chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

-- Policy para chapter_progress: estudiantes solo pueden ver su propio progreso
CREATE POLICY "Students can view own progress" ON chapter_progress
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can update own progress" ON chapter_progress
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own progress" ON chapter_progress
  FOR UPDATE USING (auth.uid() = student_id);

-- Policy para student_achievements: estudiantes solo pueden ver sus propios logros
CREATE POLICY "Students can view own achievements" ON student_achievements
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own achievements" ON student_achievements
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en chapter_progress
CREATE TRIGGER update_chapter_progress_updated_at
  BEFORE UPDATE ON chapter_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
