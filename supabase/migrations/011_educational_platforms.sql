-- =====================================================
-- Fuzzy's Home School - Educational Platforms Extension
-- Migration: 011_educational_platforms.sql
-- 
-- NOTE: This migration drops and recreates certain tables
-- (quiz_questions, quiz_attempts, game_sessions) to resolve
-- conflicts with existing table structures from previous migrations.
-- This ensures a clean transition to the new educational platform schema.
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text similarity search

-- =====================================================
-- EDUCATIONAL PLATFORMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.educational_platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  platform_type TEXT NOT NULL CHECK (platform_type IN ('h5p', 'jclic', 'quiz_ai', 'srs', 'live_game', 'simulation')),
  version TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EDUCATIONAL CONTENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.educational_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_id UUID REFERENCES public.educational_platforms(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level INTEGER NOT NULL CHECK (grade_level >= 1 AND grade_level <= 12),
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  content_data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en')),
  estimated_duration INTEGER, -- in minutes
  learning_objectives TEXT[],
  tags TEXT[],
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STUDENT CONTENT PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.student_content_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.educational_content(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  progress_percentage FLOAT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent INTEGER DEFAULT 0, -- in seconds
  attempts INTEGER DEFAULT 0,
  best_score FLOAT,
  last_score FLOAT,
  completion_status TEXT DEFAULT 'not_started' CHECK (completion_status IN ('not_started', 'in_progress', 'completed', 'mastered')),
  performance_data JSONB DEFAULT '{}',
  learning_path_position INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, content_id)
);

-- =====================================================
-- STUDENT SKILL ASSESSMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.student_skill_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  current_level FLOAT NOT NULL CHECK (current_level >= 0 AND current_level <= 1),
  confidence_level FLOAT NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
  mastery_score FLOAT DEFAULT 0,
  last_assessment_date TIMESTAMPTZ DEFAULT NOW(),
  assessment_history JSONB DEFAULT '[]',
  learning_trajectory JSONB DEFAULT '{}',
  strengths TEXT[],
  weaknesses TEXT[],
  recommended_content UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, skill_name, subject)
);

-- =====================================================
-- AI GENERATED QUIZZES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level INTEGER NOT NULL CHECK (grade_level >= 1 AND grade_level <= 12),
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en')),
  question_count INTEGER NOT NULL,
  time_limit INTEGER, -- in minutes
  passing_score FLOAT DEFAULT 70,
  generated_by_ai BOOLEAN DEFAULT true,
  ai_model TEXT DEFAULT 'deepseek-chat',
  generation_prompt TEXT,
  generation_params JSONB DEFAULT '{}',
  quiz_config JSONB DEFAULT '{}',
  is_adaptive BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUIZ QUESTIONS TABLE
-- =====================================================
-- Drop existing quiz_questions table if it exists (from old schema)
DROP TABLE IF EXISTS public.quiz_questions CASCADE;

CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES public.ai_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false', 'fill_blank', 'short_answer', 'essay', 'matching', 'ordering')),
  correct_answer JSONB NOT NULL,
  options JSONB, -- for MCQ
  hints TEXT[],
  ai_explanation TEXT,
  difficulty_score FLOAT DEFAULT 0.5 CHECK (difficulty_score >= 0 AND difficulty_score <= 1),
  bloom_level TEXT CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  points INTEGER DEFAULT 1,
  time_estimate INTEGER, -- in seconds
  media_url TEXT,
  order_position INTEGER,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUIZ ATTEMPTS TABLE
-- =====================================================
-- Drop existing quiz_attempts table if it exists (from old schema)
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES public.ai_quizzes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  score FLOAT,
  percentage FLOAT,
  time_taken INTEGER, -- in seconds
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'reviewed')),
  feedback JSONB DEFAULT '{}',
  ai_evaluation TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- GAME SESSIONS TABLE (Real-time Gaming)
-- =====================================================
-- Drop existing game_sessions table if it exists (from old schema)
DROP TABLE IF EXISTS public.game_sessions CASCADE;

CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('live_quiz', 'collaborative_puzzle', 'team_challenge', 'speed_math', 'vocabulary_race')),
  content_id UUID REFERENCES public.educational_content(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  session_status TEXT DEFAULT 'waiting' CHECK (session_status IN ('waiting', 'active', 'paused', 'completed', 'cancelled')),
  max_participants INTEGER DEFAULT 30,
  current_participants INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  game_state JSONB DEFAULT '{}',
  leaderboard JSONB DEFAULT '[]',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  pin_code TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- GAME PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.game_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  team_id UUID,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  current_score INTEGER DEFAULT 0,
  final_score INTEGER,
  final_rank INTEGER,
  answers JSONB DEFAULT '[]',
  session_data JSONB DEFAULT '{}',
  connection_status TEXT DEFAULT 'connected' CHECK (connection_status IN ('connected', 'disconnected', 'inactive')),
  device_info JSONB DEFAULT '{}',
  UNIQUE(session_id, participant_id)
);

-- =====================================================
-- SPACED REPETITION CARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.srs_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.educational_content(id) ON DELETE SET NULL,
  front_content TEXT NOT NULL,
  back_content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  card_type TEXT DEFAULT 'basic' CHECK (card_type IN ('basic', 'cloze', 'image', 'audio')),
  difficulty_level FLOAT DEFAULT 2.5, -- For SM-2 algorithm
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  ease_factor FLOAT DEFAULT 2.5,
  last_review_date TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ DEFAULT NOW(),
  total_reviews INTEGER DEFAULT 0,
  correct_reviews INTEGER DEFAULT 0,
  tags TEXT[],
  is_suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SRS REVIEW HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.srs_review_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES public.srs_cards(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quality_rating INTEGER CHECK (quality_rating >= 0 AND quality_rating <= 5),
  time_taken INTEGER, -- in seconds
  previous_interval INTEGER,
  new_interval INTEGER,
  previous_ease FLOAT,
  new_ease FLOAT,
  review_type TEXT CHECK (review_type IN ('learning', 'review', 'relearning')),
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEARNING ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.learning_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  content_id UUID REFERENCES public.educational_content(id) ON DELETE SET NULL,
  quiz_id UUID REFERENCES public.ai_quizzes(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  platform_source TEXT NOT NULL,
  event_data JSONB NOT NULL,
  performance_metrics JSONB DEFAULT '{}',
  device_info JSONB DEFAULT '{}',
  session_duration INTEGER, -- in seconds
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTENT RECOMMENDATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.content_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.educational_content(id) ON DELETE CASCADE,
  recommendation_score FLOAT NOT NULL CHECK (recommendation_score >= 0 AND recommendation_score <= 1),
  recommendation_type TEXT CHECK (recommendation_type IN ('skill_gap', 'interest_based', 'performance_based', 'collaborative_filtering', 'content_based')),
  reasoning TEXT,
  context JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_educational_content_subject_grade ON public.educational_content(subject, grade_level);
CREATE INDEX idx_educational_content_published ON public.educational_content(is_published);
CREATE INDEX idx_educational_content_featured ON public.educational_content(is_featured);
CREATE INDEX idx_educational_content_language ON public.educational_content(language);
CREATE INDEX idx_educational_content_tags ON public.educational_content USING gin(tags);

CREATE INDEX idx_student_progress_student_id ON public.student_content_progress(student_id);
CREATE INDEX idx_student_progress_content_id ON public.student_content_progress(content_id);
CREATE INDEX idx_student_progress_status ON public.student_content_progress(completion_status);

CREATE INDEX idx_skill_assessments_student ON public.student_skill_assessments(student_id);
CREATE INDEX idx_skill_assessments_subject ON public.student_skill_assessments(subject);
CREATE INDEX idx_skill_assessments_level ON public.student_skill_assessments(current_level);

CREATE INDEX idx_ai_quizzes_subject_grade ON public.ai_quizzes(subject, grade_level);
CREATE INDEX idx_ai_quizzes_class ON public.ai_quizzes(class_id);

CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_type ON public.quiz_questions(question_type);

CREATE INDEX idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_status ON public.quiz_attempts(status);

CREATE INDEX idx_game_sessions_code ON public.game_sessions(session_code);
CREATE INDEX idx_game_sessions_host ON public.game_sessions(host_id);
CREATE INDEX idx_game_sessions_status ON public.game_sessions(session_status);

CREATE INDEX idx_game_participants_session ON public.game_participants(session_id);
CREATE INDEX idx_game_participants_participant ON public.game_participants(participant_id);

CREATE INDEX idx_srs_cards_student ON public.srs_cards(student_id);
CREATE INDEX idx_srs_cards_next_review ON public.srs_cards(next_review_date);
CREATE INDEX idx_srs_cards_suspended ON public.srs_cards(is_suspended);

CREATE INDEX idx_analytics_student ON public.learning_analytics(student_id);
CREATE INDEX idx_analytics_timestamp ON public.learning_analytics(timestamp DESC);
CREATE INDEX idx_analytics_event_type ON public.learning_analytics(event_type);

CREATE INDEX idx_recommendations_student ON public.content_recommendations(student_id);
CREATE INDEX idx_recommendations_score ON public.content_recommendations(recommendation_score DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER trigger_educational_platforms_updated_at
    BEFORE UPDATE ON public.educational_platforms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_educational_content_updated_at
    BEFORE UPDATE ON public.educational_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_skill_assessments_updated_at
    BEFORE UPDATE ON public.student_skill_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ai_quizzes_updated_at
    BEFORE UPDATE ON public.ai_quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_srs_cards_updated_at
    BEFORE UPDATE ON public.srs_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Educational Platforms (read-only for all, write for admins only)
ALTER TABLE public.educational_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active platforms" ON public.educational_platforms
    FOR SELECT USING (is_active = true);

-- Educational Content
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view published content" ON public.educational_content
    FOR SELECT USING (is_published = true);

CREATE POLICY "Teachers can manage their content" ON public.educational_content
    FOR ALL USING (created_by = auth.uid());

-- Student Progress (students see their own, teachers see their class students)
ALTER TABLE public.student_content_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own progress" ON public.student_content_progress
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update their own progress" ON public.student_content_progress
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers can view class student progress" ON public.student_content_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.classes c ON e.class_id = c.id
            WHERE e.student_id = student_content_progress.student_id
            AND c.teacher_id = auth.uid()
        )
    );

-- Skill Assessments
ALTER TABLE public.student_skill_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage their own assessments" ON public.student_skill_assessments
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers view class student assessments" ON public.student_skill_assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.classes c ON e.class_id = c.id
            WHERE e.student_id = student_skill_assessments.student_id
            AND c.teacher_id = auth.uid()
        )
    );

-- AI Quizzes
ALTER TABLE public.ai_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can create and manage quizzes" ON public.ai_quizzes
    FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Students can view class quizzes" ON public.ai_quizzes
    FOR SELECT USING (
        class_id IN (
            SELECT class_id FROM public.enrollments
            WHERE student_id = auth.uid()
            AND status = 'active'
        )
    );

-- Quiz Questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View questions for accessible quizzes" ON public.quiz_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ai_quizzes q
            WHERE q.id = quiz_questions.quiz_id
            AND (
                q.created_by = auth.uid()
                OR q.class_id IN (
                    SELECT class_id FROM public.enrollments
                    WHERE student_id = auth.uid()
                    AND status = 'active'
                )
            )
        )
    );

-- Quiz Attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage their own attempts" ON public.quiz_attempts
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers view class attempts" ON public.quiz_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ai_quizzes q
            WHERE q.id = quiz_attempts.quiz_id
            AND q.created_by = auth.uid()
        )
    );

-- Game Sessions
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts manage their sessions" ON public.game_sessions
    FOR ALL USING (host_id = auth.uid());

CREATE POLICY "Public sessions are viewable" ON public.game_sessions
    FOR SELECT USING (is_public = true OR host_id = auth.uid());

-- Game Participants
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants manage their own data" ON public.game_participants
    FOR ALL USING (participant_id = auth.uid());

CREATE POLICY "View participants in public sessions" ON public.game_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.game_sessions s
            WHERE s.id = game_participants.session_id
            AND (s.is_public = true OR s.host_id = auth.uid())
        )
    );

-- SRS Cards
ALTER TABLE public.srs_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage their own cards" ON public.srs_cards
    FOR ALL USING (student_id = auth.uid());

-- SRS Review History
ALTER TABLE public.srs_review_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage their review history" ON public.srs_review_history
    FOR ALL USING (student_id = auth.uid());

-- Learning Analytics
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view their own analytics" ON public.learning_analytics
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "System can insert analytics" ON public.learning_analytics
    FOR INSERT WITH CHECK (true);

-- Content Recommendations
ALTER TABLE public.content_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view their recommendations" ON public.content_recommendations
    FOR ALL USING (student_id = auth.uid());

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to generate unique session codes
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  done BOOLEAN DEFAULT false;
BEGIN
  WHILE NOT done LOOP
    -- Generate 6 character numeric code
    new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.game_sessions WHERE session_code = new_code AND session_status IN ('waiting', 'active')) THEN
      done := true;
    END IF;
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate next SRS review date (SM-2 algorithm)
CREATE OR REPLACE FUNCTION calculate_next_srs_review(
  quality INTEGER,
  repetitions INTEGER,
  ease_factor FLOAT,
  interval_days INTEGER
) RETURNS JSONB AS $$
DECLARE
  new_ease_factor FLOAT;
  new_interval INTEGER;
  new_repetitions INTEGER;
BEGIN
  -- Quality: 0-5 (0-2 = incorrect, 3-5 = correct)

  IF quality < 3 THEN
    new_repetitions := 0;
    new_interval := 1;
  ELSE
    new_repetitions := repetitions + 1;

    IF new_repetitions = 1 THEN
      new_interval := 1;
    ELSIF new_repetitions = 2 THEN
      new_interval := 6;
    ELSE
      new_interval := ROUND(interval_days * ease_factor);
    END IF;
  END IF;

  -- Calculate new ease factor
  new_ease_factor := ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  -- Minimum ease factor is 1.3
  IF new_ease_factor < 1.3 THEN
    new_ease_factor := 1.3;
  END IF;

  RETURN jsonb_build_object(
    'interval_days', new_interval,
    'ease_factor', new_ease_factor,
    'repetitions', new_repetitions,
    'next_review_date', NOW() + (new_interval || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update participant count in game sessions
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.game_sessions
    SET current_participants = current_participants + 1
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.game_sessions
    SET current_participants = current_participants - 1
    WHERE id = OLD.session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_participant_count
  AFTER INSERT OR DELETE ON public.game_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_count();

-- =====================================================
-- INITIAL DATA (Platform Registration)
-- =====================================================
INSERT INTO public.educational_platforms (name, platform_type, version, config, features)
VALUES
  ('H5P Interactive Content', 'h5p', '1.24.0',
   '{"enabled": true, "contentTypes": ["interactive-video", "quiz", "presentation"]}',
   '["interactive_content", "scorm_tracking", "responsive_design"]'),

  ('AI Quiz Generator', 'quiz_ai', '1.0.0',
   '{"model": "deepseek-chat", "maxQuestions": 50, "languages": ["es", "en"]}',
   '["adaptive_questions", "auto_grading", "explanations"]'),

  ('Spaced Repetition System', 'srs', '1.0.0',
   '{"algorithm": "SM-2", "defaultEase": 2.5, "maxInterval": 365}',
   '["flashcards", "progress_tracking", "mobile_sync"]'),

  ('Live Gaming Platform', 'live_game', '1.0.0',
   '{"maxParticipants": 100, "gameTypes": ["quiz", "puzzle", "race"]}',
   '["real_time", "leaderboards", "team_mode"]')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- END OF MIGRATION
-- =====================================================