-- Fuzzy's Home School - Simplified Schema (Run this if 001 fails)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they exist
DROP TYPE IF EXISTS game_type CASCADE;

-- Create game types enum
CREATE TYPE game_type AS ENUM (
  'quiz', 'memory-cards', 'word-search', 'crossword', 'puzzle',
  'drag-drop', 'fill-blanks', 'matching', 'timeline', 'map-quiz',
  'math-operations', 'spelling', 'reading-comprehension', 'true-false',
  'multiple-choice', 'video-quiz', 'audio-quiz', 'drawing', 'sorting', 'simulation'
);

-- Profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('student', 'teacher', 'parent', 'admin')) DEFAULT 'student',
  grade_level INTEGER,
  school TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO public.subjects (name, code, description, icon, color) VALUES
  ('Matemáticas', 'math', 'Números, operaciones, geometría y más', '🔢', '#3B82F6'),
  ('Lengua', 'language', 'Lectura, escritura y gramática', '📚', '#10B981'),
  ('Ciencias Naturales', 'science', 'Biología, física y química', '🧪', '#8B5CF6'),
  ('Ciencias Sociales', 'social', 'Historia y geografía', '🌍', '#F59E0B'),
  ('Arte', 'art', 'Música, plástica y expresión', '🎨', '#EC4899'),
  ('Educación Física', 'pe', 'Deportes y actividad física', '⚽', '#EF4444')
ON CONFLICT (code) DO NOTHING;

-- Games table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type game_type NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  grade_level INTEGER,
  data JSONB NOT NULL,
  thumbnail_url TEXT,
  instructions TEXT,
  time_limit INTEGER,
  points INTEGER DEFAULT 100,
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game sessions
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID,
  score INTEGER DEFAULT 0,
  max_score INTEGER,
  time_spent INTEGER,
  completed BOOLEAN DEFAULT false,
  answers JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Student progress
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID,
  subject_id UUID REFERENCES public.subjects(id),
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  category TEXT,
  points INTEGER DEFAULT 10,
  criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student achievements
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colonial Rally Points
CREATE TABLE IF NOT EXISTS public.colonial_rally_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  qr_code TEXT UNIQUE NOT NULL,
  historical_period TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  points INTEGER DEFAULT 100,
  challenge JSONB NOT NULL,
  ar_content JSONB,
  hints TEXT[],
  educational_content TEXT,
  image_url TEXT,
  audio_url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colonial Rally Progress
CREATE TABLE IF NOT EXISTS public.colonial_rally_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID,
  point_id UUID REFERENCES public.colonial_rally_points(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  time_spent INTEGER,
  attempts INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  photos JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID,
  grade_level INTEGER,
  subject_id UUID REFERENCES public.subjects(id),
  code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 6),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class enrollments
CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID,
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  points INTEGER DEFAULT 100,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID,
  session_id UUID REFERENCES public.game_sessions(id),
  score INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simple leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  sp.student_id as id,
  COALESCE(p.username, 'Anonymous') as username,
  COALESCE(p.full_name, 'Student') as full_name,
  p.avatar_url,
  COALESCE(SUM(sp.total_points), 0) as total_points,
  COALESCE(SUM(sp.games_played), 0) as games_played,
  COALESCE(MAX(sp.level), 1) as highest_level,
  COUNT(DISTINCT sa.achievement_id) as achievements_count,
  RANK() OVER (ORDER BY COALESCE(SUM(sp.total_points), 0) DESC) as rank
FROM public.student_progress sp
LEFT JOIN public.profiles p ON p.id = sp.student_id
LEFT JOIN public.student_achievements sa ON sa.student_id = sp.student_id
GROUP BY sp.student_id, p.username, p.full_name, p.avatar_url;

-- Enable RLS (but with simpler policies)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colonial_rally_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colonial_rally_progress ENABLE ROW LEVEL SECURITY;

-- Simple policies (everyone can read for now)
CREATE POLICY "Read all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Read all games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Read all game sessions" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Read all progress" ON public.student_progress FOR SELECT USING (true);
CREATE POLICY "Read all rally points" ON public.colonial_rally_points FOR SELECT USING (true);
CREATE POLICY "Read all rally progress" ON public.colonial_rally_progress FOR SELECT USING (true);

-- Allow inserts for testing
CREATE POLICY "Insert games" ON public.games FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert sessions" ON public.game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert progress" ON public.student_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert rally progress" ON public.colonial_rally_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- Allow updates for testing
CREATE POLICY "Update games" ON public.games FOR UPDATE USING (true);
CREATE POLICY "Update sessions" ON public.game_sessions FOR UPDATE USING (true);
CREATE POLICY "Update progress" ON public.student_progress FOR UPDATE USING (true);
CREATE POLICY "Update rally progress" ON public.colonial_rally_progress FOR UPDATE USING (true);
CREATE POLICY "Update profiles" ON public.profiles FOR UPDATE USING (true);