-- Fuzzy's Home School - Complete Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geolocation in Rally Colonial

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
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

-- Game types enum
CREATE TYPE game_type AS ENUM (
  'quiz', 'memory-cards', 'word-search', 'crossword', 'puzzle',
  'drag-drop', 'fill-blanks', 'matching', 'timeline', 'map-quiz',
  'math-operations', 'spelling', 'reading-comprehension', 'true-false',
  'multiple-choice', 'video-quiz', 'audio-quiz', 'drawing', 'sorting', 'simulation'
);

-- Games table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type game_type NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  grade_level INTEGER,
  data JSONB NOT NULL, -- Stores game-specific data
  thumbnail_url TEXT,
  instructions TEXT,
  time_limit INTEGER, -- in seconds, null for no limit
  points INTEGER DEFAULT 100,
  created_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT true,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game sessions (tracks each play)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  max_score INTEGER,
  time_spent INTEGER, -- in seconds
  completed BOOLEAN DEFAULT false,
  answers JSONB, -- stores player answers
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(game_id, player_id, started_at)
);

-- Student progress
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id),
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- Achievements/Badges
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  category TEXT,
  points INTEGER DEFAULT 10,
  criteria JSONB, -- conditions to unlock
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student achievements
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

-- Colonial Rally Points of Interest
CREATE TABLE IF NOT EXISTS public.colonial_rally_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT, 4326), -- PostGIS point
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  qr_code TEXT UNIQUE NOT NULL,
  historical_period TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  points INTEGER DEFAULT 100,
  challenge JSONB NOT NULL, -- challenge data
  ar_content JSONB, -- AR overlay information
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
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  point_id UUID REFERENCES public.colonial_rally_points(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  time_spent INTEGER, -- seconds
  attempts INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  photos JSONB, -- URLs of photos taken
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, point_id)
);

-- Classes/Groups
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES public.profiles(id),
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
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
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
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.game_sessions(id),
  score INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  COALESCE(SUM(sp.total_points), 0) as total_points,
  COALESCE(SUM(sp.games_played), 0) as games_played,
  COALESCE(MAX(sp.level), 1) as highest_level,
  COUNT(DISTINCT sa.achievement_id) as achievements_count,
  RANK() OVER (ORDER BY COALESCE(SUM(sp.total_points), 0) DESC) as rank
FROM public.profiles p
LEFT JOIN public.student_progress sp ON p.id = sp.student_id
LEFT JOIN public.student_achievements sa ON p.id = sa.student_id
WHERE p.role = 'student'
GROUP BY p.id, p.username, p.full_name, p.avatar_url;

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colonial_rally_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colonial_rally_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Games policies
CREATE POLICY "Games are viewable by everyone" ON public.games
  FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers can create games" ON public.games
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- Game sessions policies
CREATE POLICY "Users can view own game sessions" ON public.game_sessions
  FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Users can create own game sessions" ON public.game_sessions
  FOR INSERT WITH CHECK (player_id = auth.uid());

-- Progress policies
CREATE POLICY "Students can view own progress" ON public.student_progress
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view all progress" ON public.student_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

-- Colonial Rally policies
CREATE POLICY "Rally points are viewable by everyone" ON public.colonial_rally_points
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can track own rally progress" ON public.colonial_rally_progress
  FOR ALL USING (student_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION public.update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update student progress when a game session is completed
  IF NEW.completed = true AND OLD.completed = false THEN
    INSERT INTO public.student_progress (student_id, subject_id, total_points, games_played, games_won)
    SELECT
      NEW.player_id,
      g.subject_id,
      NEW.score,
      1,
      CASE WHEN NEW.score >= NEW.max_score * 0.6 THEN 1 ELSE 0 END
    FROM public.games g
    WHERE g.id = NEW.game_id
    ON CONFLICT (student_id, subject_id) DO UPDATE
    SET
      total_points = student_progress.total_points + EXCLUDED.total_points,
      games_played = student_progress.games_played + 1,
      games_won = student_progress.games_won + EXCLUDED.games_won,
      experience_points = student_progress.experience_points + (EXCLUDED.total_points * 10),
      level = FLOOR((student_progress.experience_points + (EXCLUDED.total_points * 10)) / 1000) + 1,
      last_activity = NOW(),
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for progress updates
CREATE TRIGGER update_progress_on_game_complete
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_progress();

-- Indexes for performance
CREATE INDEX idx_games_subject ON public.games(subject_id);
CREATE INDEX idx_games_type ON public.games(type);
CREATE INDEX idx_game_sessions_player ON public.game_sessions(player_id);
CREATE INDEX idx_game_sessions_game ON public.game_sessions(game_id);
CREATE INDEX idx_student_progress_student ON public.student_progress(student_id);
CREATE INDEX idx_colonial_rally_location ON public.colonial_rally_points USING GIST(location);
CREATE INDEX idx_colonial_rally_qr ON public.colonial_rally_points(qr_code);