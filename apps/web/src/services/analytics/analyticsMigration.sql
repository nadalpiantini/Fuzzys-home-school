-- Analytics Enhancement Migration
-- This migration adds comprehensive analytics tracking to the existing schema

-- Create analytics events table for detailed tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'game_start', 'game_complete', 'chapter_start', 'chapter_complete', 'tutor_interaction'
  event_data JSONB DEFAULT '{}',
  subject_id UUID REFERENCES public.subjects(id),
  game_id UUID REFERENCES public.games(id),
  chapter_id TEXT,
  curriculum_id TEXT,
  score INTEGER,
  time_spent INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily analytics summary table
CREATE TABLE IF NOT EXISTS public.daily_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_students INTEGER DEFAULT 0,
  active_students INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  average_score DECIMAL(5,2) DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- Create subject analytics table
CREATE TABLE IF NOT EXISTS public.subject_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_students INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, date)
);

-- Create student engagement tracking
CREATE TABLE IF NOT EXISTS public.student_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sessions_count INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  average_score DECIMAL(5,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  engagement_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Create activity popularity tracking
CREATE TABLE IF NOT EXISTS public.activity_popularity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID, -- can reference games, chapters, or other content
  activity_type TEXT NOT NULL, -- 'game', 'chapter', 'quiz', 'tutor'
  activity_name TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  date DATE NOT NULL,
  play_count INTEGER DEFAULT 0,
  unique_players INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, activity_type, date)
);

-- Create heatmap data table
CREATE TABLE IF NOT EXISTS public.activity_heatmap (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  activity_count INTEGER DEFAULT 0,
  unique_students INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, hour, day_of_week)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_student_id ON public.analytics_events(student_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_subject_id ON public.analytics_events(subject_id);

CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON public.daily_analytics(date);
CREATE INDEX IF NOT EXISTS idx_subject_analytics_subject_date ON public.subject_analytics(subject_id, date);
CREATE INDEX IF NOT EXISTS idx_student_engagement_student_date ON public.student_engagement(student_id, date);
CREATE INDEX IF NOT EXISTS idx_activity_popularity_activity_date ON public.activity_popularity(activity_id, date);
CREATE INDEX IF NOT EXISTS idx_activity_heatmap_date_hour ON public.activity_heatmap(date, hour);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_popularity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_heatmap ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Teachers can view analytics data"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Students can view their own analytics"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view daily analytics"
  ON public.daily_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can view subject analytics"
  ON public.subject_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Students can view their own engagement"
  ON public.student_engagement FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all engagement data"
  ON public.student_engagement FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can view activity popularity"
  ON public.activity_popularity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can view heatmap data"
  ON public.activity_heatmap FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Create functions for analytics calculations
CREATE OR REPLACE FUNCTION calculate_engagement_score(student_uuid UUID, target_date DATE)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  score DECIMAL(5,2) := 0;
  sessions_count INTEGER;
  avg_score DECIMAL(5,2);
  completion_rate DECIMAL(5,2);
  time_spent INTEGER;
BEGIN
  -- Get student data for the date
  SELECT 
    COALESCE(se.sessions_count, 0),
    COALESCE(se.average_score, 0),
    COALESCE(se.total_time_spent, 0)
  INTO sessions_count, avg_score, time_spent
  FROM student_engagement se
  WHERE se.student_id = student_uuid AND se.date = target_date;
  
  -- Calculate engagement score (0-100)
  -- Factors: session count (30%), average score (40%), time spent (30%)
  score := (
    LEAST(sessions_count * 10, 30) + -- Max 30 points for sessions
    (avg_score * 0.4) + -- 40% weight for average score
    LEAST(time_spent / 10, 30) -- Max 30 points for time spent
  );
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Create function to update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics(target_date DATE)
RETURNS VOID AS $$
DECLARE
  total_students_count INTEGER;
  active_students_count INTEGER;
  total_sessions_count INTEGER;
  total_time_count INTEGER;
  avg_score DECIMAL(5,2);
  completion_rate DECIMAL(5,2);
  engagement_avg DECIMAL(5,2);
BEGIN
  -- Get counts for the date
  SELECT 
    COUNT(DISTINCT student_id),
    COUNT(DISTINCT CASE WHEN total_time_spent > 0 THEN student_id END),
    COALESCE(SUM(sessions_count), 0),
    COALESCE(SUM(total_time_spent), 0),
    COALESCE(AVG(average_score), 0),
    COALESCE(AVG(CASE WHEN sessions_count > 0 THEN 100 ELSE 0 END), 0),
    COALESCE(AVG(engagement_score), 0)
  INTO total_students_count, active_students_count, total_sessions_count, 
       total_time_count, avg_score, completion_rate, engagement_avg
  FROM student_engagement
  WHERE date = target_date;
  
  -- Insert or update daily analytics
  INSERT INTO daily_analytics (
    date, total_students, active_students, total_sessions, 
    total_time_spent, average_score, completion_rate, engagement_score
  ) VALUES (
    target_date, total_students_count, active_students_count, total_sessions_count,
    total_time_count, avg_score, completion_rate, engagement_avg
  )
  ON CONFLICT (date) DO UPDATE SET
    total_students = EXCLUDED.total_students,
    active_students = EXCLUDED.active_students,
    total_sessions = EXCLUDED.total_sessions,
    total_time_spent = EXCLUDED.total_time_spent,
    average_score = EXCLUDED.average_score,
    completion_rate = EXCLUDED.completion_rate,
    engagement_score = EXCLUDED.engagement_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update analytics
CREATE OR REPLACE FUNCTION trigger_update_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily analytics when student engagement changes
  PERFORM update_daily_analytics(NEW.date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_trigger
  AFTER INSERT OR UPDATE ON student_engagement
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_analytics();
