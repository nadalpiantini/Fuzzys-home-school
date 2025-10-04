-- AI Insights System Migration
-- This migration creates tables for advanced AI insights and recommendations

-- Create AI insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id TEXT PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('performance', 'engagement', 'learning_style', 'intervention', 'prediction')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  actionable BOOLEAN DEFAULT false,
  actions TEXT[] DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create AI recommendations table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id TEXT PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('content', 'activity', 'intervention', 'schedule', 'goal')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  expected_impact INTEGER NOT NULL CHECK (expected_impact >= 0 AND expected_impact <= 100),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_required INTEGER NOT NULL, -- in minutes
  prerequisites TEXT[] DEFAULT '{}',
  resources TEXT[] DEFAULT '{}',
  priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create learning profiles table
CREATE TABLE IF NOT EXISTS public.learning_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learning_style JSONB NOT NULL DEFAULT '{
    "visual": 0.5,
    "auditory": 0.5,
    "kinesthetic": 0.5,
    "reading": 0.5
  }',
  cognitive_profile JSONB NOT NULL DEFAULT '{
    "workingMemory": 0.5,
    "processingSpeed": 0.5,
    "attentionSpan": 0.5,
    "motivation": 0.5
  }',
  preferences JSONB NOT NULL DEFAULT '{
    "difficulty": "medium",
    "sessionLength": 30,
    "bestTimeOfDay": "morning",
    "preferredSubjects": [],
    "gamification": true
  }',
  strengths TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

-- Create learning patterns table
CREATE TABLE IF NOT EXISTS public.learning_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('strength', 'weakness', 'preference', 'behavior')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  evidence TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_student ON public.ai_insights(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON public.ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_priority ON public.ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created ON public.ai_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_insights_expires ON public.ai_insights(expires_at);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_student ON public.ai_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON public.ai_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_priority ON public.ai_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created ON public.ai_recommendations(created_at);

CREATE INDEX IF NOT EXISTS idx_learning_profiles_student ON public.learning_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_profiles_updated ON public.learning_profiles(last_updated);

CREATE INDEX IF NOT EXISTS idx_learning_patterns_student ON public.learning_patterns(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_type ON public.learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_subject ON public.learning_patterns(subject);

-- Create RLS policies
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_patterns ENABLE ROW LEVEL SECURITY;

-- AI insights are accessible by the student and their teachers/parents
CREATE POLICY "Users can view insights for their students" ON public.ai_insights
  FOR SELECT USING (
    auth.uid() = student_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role = 'teacher' OR p.role = 'parent')
    )
  );

CREATE POLICY "System can insert insights" ON public.ai_insights
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update insights" ON public.ai_insights
  FOR UPDATE USING (true);

-- AI recommendations are accessible by the student and their teachers/parents
CREATE POLICY "Users can view recommendations for their students" ON public.ai_recommendations
  FOR SELECT USING (
    auth.uid() = student_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role = 'teacher' OR p.role = 'parent')
    )
  );

CREATE POLICY "System can insert recommendations" ON public.ai_recommendations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update recommendations" ON public.ai_recommendations
  FOR UPDATE USING (true);

-- Learning profiles are accessible by the student and their teachers/parents
CREATE POLICY "Users can view learning profiles for their students" ON public.learning_profiles
  FOR SELECT USING (
    auth.uid() = student_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role = 'teacher' OR p.role = 'parent')
    )
  );

CREATE POLICY "Users can update learning profiles for their students" ON public.learning_profiles
  FOR UPDATE USING (
    auth.uid() = student_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role = 'teacher' OR p.role = 'parent')
    )
  );

CREATE POLICY "System can insert learning profiles" ON public.learning_profiles
  FOR INSERT WITH CHECK (true);

-- Learning patterns are accessible by the student and their teachers/parents
CREATE POLICY "Users can view learning patterns for their students" ON public.learning_patterns
  FOR SELECT USING (
    auth.uid() = student_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role = 'teacher' OR p.role = 'parent')
    )
  );

CREATE POLICY "System can insert learning patterns" ON public.learning_patterns
  FOR INSERT WITH CHECK (true);

-- Create function to get AI insights summary
CREATE OR REPLACE FUNCTION public.get_ai_insights_summary(student_id UUID)
RETURNS TABLE(
  total_insights BIGINT,
  high_priority_insights BIGINT,
  actionable_insights BIGINT,
  recent_insights BIGINT,
  avg_confidence DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_insights,
    COUNT(*) FILTER (WHERE priority IN ('high', 'critical')) as high_priority_insights,
    COUNT(*) FILTER (WHERE actionable = true) as actionable_insights,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_insights,
    AVG(confidence) as avg_confidence
  FROM public.ai_insights
  WHERE ai_insights.student_id = get_ai_insights_summary.student_id;
END;
$$;

-- Create function to get AI recommendations summary
CREATE OR REPLACE FUNCTION public.get_ai_recommendations_summary(student_id UUID)
RETURNS TABLE(
  total_recommendations BIGINT,
  high_priority_recommendations BIGINT,
  easy_recommendations BIGINT,
  recent_recommendations BIGINT,
  avg_expected_impact DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_recommendations,
    COUNT(*) FILTER (WHERE priority >= 8) as high_priority_recommendations,
    COUNT(*) FILTER (WHERE difficulty = 'easy') as easy_recommendations,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_recommendations,
    AVG(expected_impact) as avg_expected_impact
  FROM public.ai_recommendations
  WHERE ai_recommendations.student_id = get_ai_recommendations_summary.student_id;
END;
$$;

-- Create function to clean up expired insights
CREATE OR REPLACE FUNCTION public.cleanup_expired_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.ai_insights
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$;

-- Create function to update learning profile based on new data
CREATE OR REPLACE FUNCTION public.update_learning_profile_from_data(student_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_scores DECIMAL[];
  avg_score DECIMAL;
  engagement_score DECIMAL;
  learning_style JSONB;
  cognitive_profile JSONB;
BEGIN
  -- Get recent performance data
  SELECT ARRAY_AGG(score ORDER BY created_at DESC)
  INTO recent_scores
  FROM public.analytics_events
  WHERE student_id = update_learning_profile_from_data.student_id
    AND score IS NOT NULL
    AND created_at >= NOW() - INTERVAL '30 days'
  LIMIT 50;
  
  -- Calculate average score
  IF array_length(recent_scores, 1) > 0 THEN
    SELECT AVG(score) INTO avg_score FROM UNNEST(recent_scores) AS score;
  ELSE
    avg_score := 0;
  END IF;
  
  -- Calculate engagement score based on session frequency and duration
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        LEAST(1.0, (COUNT(*)::DECIMAL / 21.0) * 0.5 + 
               (AVG(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at)))) / 3600.0) * 0.5)
      ELSE 0
    END
  INTO engagement_score
  FROM public.analytics_events
  WHERE student_id = update_learning_profile_from_data.student_id
    AND event_type = 'session_start'
    AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Update learning style based on content preferences
  learning_style := jsonb_build_object(
    'visual', CASE WHEN avg_score > 80 THEN 0.8 ELSE 0.5 END,
    'auditory', CASE WHEN engagement_score > 0.7 THEN 0.7 ELSE 0.4 END,
    'kinesthetic', CASE WHEN avg_score > 75 THEN 0.6 ELSE 0.3 END,
    'reading', CASE WHEN avg_score > 70 THEN 0.7 ELSE 0.4 END
  );
  
  -- Update cognitive profile
  cognitive_profile := jsonb_build_object(
    'workingMemory', LEAST(1.0, avg_score / 100.0),
    'processingSpeed', LEAST(1.0, engagement_score),
    'attentionSpan', LEAST(1.0, (avg_score / 100.0) * 0.8 + engagement_score * 0.2),
    'motivation', LEAST(1.0, engagement_score * 0.9 + (avg_score / 100.0) * 0.1)
  );
  
  -- Update or insert learning profile
  INSERT INTO public.learning_profiles (
    student_id,
    learning_style,
    cognitive_profile,
    last_updated
  ) VALUES (
    update_learning_profile_from_data.student_id,
    learning_style,
    cognitive_profile,
    NOW()
  )
  ON CONFLICT (student_id) 
  DO UPDATE SET
    learning_style = EXCLUDED.learning_style,
    cognitive_profile = EXCLUDED.cognitive_profile,
    last_updated = NOW();
END;
$$;
