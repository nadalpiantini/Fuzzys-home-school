-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin', 'parent');
CREATE TYPE question_type AS ENUM (
  'mcq', 'true_false', 'drag_drop', 'hotspot', 'sequence',
  'gap_fill', 'short_answer', 'branching', 'memory', 'crossword'
);
CREATE TYPE content_type AS ENUM ('h5p', 'jclic', 'oppia', 'video', 'pdf', 'url', 'ar_location');
CREATE TYPE session_mode AS ENUM ('chat', 'practice', 'live_game', 'colonial_rally');

-- Institutions table (multi-tenant support)
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  locale TEXT DEFAULT 'es',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'student',
  preferred_language TEXT DEFAULT 'es',
  avatar_url TEXT,
  metadata JSONB DEFAULT '{}',
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes/Groups
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  grade_level TEXT,
  teacher_id UUID REFERENCES users(id),
  schedule JSONB,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class enrollments
CREATE TABLE class_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, user_id)
);

-- Question bank
CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  type question_type NOT NULL,
  subject TEXT,
  topic TEXT,
  subtopic TEXT,
  content JSONB NOT NULL, -- Stores question data based on type
  difficulty DECIMAL(3,2) CHECK (difficulty >= 0 AND difficulty <= 1),
  tags TEXT[],
  locale TEXT DEFAULT 'es',
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  sources TEXT[], -- References for citations
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content library
CREATE TABLE content_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  type content_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User attempts/responses
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id) ON DELETE CASCADE,
  response JSONB NOT NULL,
  is_correct BOOLEAN,
  score DECIMAL(5,2),
  time_spent_ms INTEGER,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning sessions
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mode session_mode NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  summary JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- Mastery tracking
CREATE TABLE mastery (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  subtopic TEXT,
  mastery_level DECIMAL(3,2) DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  evidence JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic, subtopic)
);

-- Recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  subtopic TEXT,
  action TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live game sessions (ClassQuiz style)
CREATE TABLE live_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pin TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'waiting',
  quiz_content JSONB NOT NULL,
  settings JSONB DEFAULT '{}',
  participants JSONB DEFAULT '[]',
  leaderboard JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colonial Zone Rally locations
CREATE TABLE rally_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  qr_code TEXT UNIQUE,
  ar_marker_url TEXT,
  ar_content JSONB, -- 3D models, audio, etc.
  historical_info JSONB,
  challenges JSONB DEFAULT '[]',
  points INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rally progress
CREATE TABLE rally_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES rally_locations(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  challenge_completed BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  photos TEXT[],
  notes TEXT,
  UNIQUE(user_id, location_id)
);

-- Teams for rally/competitions
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  captain_id UUID REFERENCES users(id),
  members UUID[],
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements/Badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB NOT NULL,
  points INTEGER DEFAULT 10,
  category TEXT
);

CREATE TABLE user_achievements (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs for analytics
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_questions_institution ON question_bank(institution_id);
CREATE INDEX idx_questions_type_subject ON question_bank(type, subject);
CREATE INDEX idx_attempts_user ON attempts(user_id);
CREATE INDEX idx_attempts_question ON attempts(question_id);
CREATE INDEX idx_mastery_user ON mastery(user_id);
CREATE INDEX idx_rally_locations_coords ON rally_locations(latitude, longitude);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (to be expanded)
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can view their students" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      WHERE c.teacher_id = auth.uid() AND ce.user_id = users.id
    )
  );

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_bank_updated_at BEFORE UPDATE ON question_bank
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();