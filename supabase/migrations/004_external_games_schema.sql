-- Migration: External Games Integration Schema
-- Description: Tables for tracking external game activities and progress

-- External Game Configs table
CREATE TABLE external_game_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  allowed_origins TEXT[],
  sandbox_enabled BOOLEAN DEFAULT true,
  tracking_enabled BOOLEAN DEFAULT true,
  offline_available BOOLEAN DEFAULT false,
  age_range_min INTEGER,
  age_range_max INTEGER,
  subjects TEXT[],
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  objectives JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External Game Sessions table
CREATE TABLE external_game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_time_spent INTEGER DEFAULT 0, -- in milliseconds
  score INTEGER,
  objectives_completed TEXT[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  session_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External Game Events table
CREATE TABLE external_game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES external_game_sessions(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  action TEXT NOT NULL,
  score INTEGER,
  duration INTEGER DEFAULT 0, -- in milliseconds
  event_metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student External Game Progress table (aggregated data)
CREATE TABLE student_external_game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  first_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_sessions INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in milliseconds
  best_score INTEGER,
  total_score INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00, -- percentage
  objectives_completed TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  progress_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, game_id)
);

-- External Game Analytics table
CREATE TABLE external_game_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  source TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sessions INTEGER DEFAULT 0,
  unique_players INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in milliseconds
  average_session_time INTEGER DEFAULT 0, -- in milliseconds
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  average_score DECIMAL(10,2),
  popular_actions JSONB DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, date)
);

-- Indexes for performance
CREATE INDEX idx_external_game_sessions_student_id ON external_game_sessions(student_id);
CREATE INDEX idx_external_game_sessions_game_id ON external_game_sessions(game_id);
CREATE INDEX idx_external_game_sessions_started_at ON external_game_sessions(started_at);

CREATE INDEX idx_external_game_events_session_id ON external_game_events(session_id);
CREATE INDEX idx_external_game_events_student_id ON external_game_events(student_id);
CREATE INDEX idx_external_game_events_game_id ON external_game_events(game_id);
CREATE INDEX idx_external_game_events_timestamp ON external_game_events(timestamp);
CREATE INDEX idx_external_game_events_action ON external_game_events(action);

CREATE INDEX idx_student_external_game_progress_student_id ON student_external_game_progress(student_id);
CREATE INDEX idx_student_external_game_progress_game_id ON student_external_game_progress(game_id);
CREATE INDEX idx_student_external_game_progress_last_played ON student_external_game_progress(last_played_at);

CREATE INDEX idx_external_game_analytics_game_id ON external_game_analytics(game_id);
CREATE INDEX idx_external_game_analytics_date ON external_game_analytics(date);
CREATE INDEX idx_external_game_analytics_source ON external_game_analytics(source);

-- RLS Policies
ALTER TABLE external_game_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_external_game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_game_analytics ENABLE ROW LEVEL SECURITY;

-- External Game Configs policies (public read, admin write)
CREATE POLICY "External game configs are viewable by everyone" ON external_game_configs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage external game configs" ON external_game_configs
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- External Game Sessions policies (students can manage their own)
CREATE POLICY "Students can view their own game sessions" ON external_game_sessions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own game sessions" ON external_game_sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own game sessions" ON external_game_sessions
  FOR UPDATE USING (auth.uid() = student_id);

-- Teachers can view sessions of their students
CREATE POLICY "Teachers can view their students' game sessions" ON external_game_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_memberships cm
      JOIN classes c ON c.id = cm.class_id
      WHERE cm.student_id = external_game_sessions.student_id
      AND c.teacher_id = auth.uid()
    )
  );

-- External Game Events policies
CREATE POLICY "Students can view their own game events" ON external_game_events
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own game events" ON external_game_events
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Teachers can view events of their students
CREATE POLICY "Teachers can view their students' game events" ON external_game_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_memberships cm
      JOIN classes c ON c.id = cm.class_id
      WHERE cm.student_id = external_game_events.student_id
      AND c.teacher_id = auth.uid()
    )
  );

-- Student External Game Progress policies
CREATE POLICY "Students can view their own progress" ON student_external_game_progress
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can upsert their own progress" ON student_external_game_progress
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress" ON student_external_game_progress
  FOR UPDATE USING (auth.uid() = student_id);

-- Teachers can view progress of their students
CREATE POLICY "Teachers can view their students' progress" ON student_external_game_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_memberships cm
      JOIN classes c ON c.id = cm.class_id
      WHERE cm.student_id = student_external_game_progress.student_id
      AND c.teacher_id = auth.uid()
    )
  );

-- External Game Analytics policies (teachers and admins only)
CREATE POLICY "Teachers and admins can view analytics" ON external_game_analytics
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('teacher', 'admin')
  );

CREATE POLICY "System can insert analytics" ON external_game_analytics
  FOR INSERT WITH CHECK (true); -- Will be handled by server-side functions

-- Functions for updating analytics
CREATE OR REPLACE FUNCTION update_external_game_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert daily analytics when a session ends
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    INSERT INTO external_game_analytics (
      game_id,
      source,
      date,
      total_sessions,
      unique_players,
      total_time_spent,
      average_session_time,
      completion_rate,
      average_score
    )
    SELECT
      NEW.game_id,
      egc.source,
      CURRENT_DATE,
      1,
      1,
      NEW.total_time_spent,
      NEW.total_time_spent,
      CASE WHEN NEW.is_completed THEN 100.00 ELSE 0.00 END,
      NEW.score::decimal
    FROM external_game_configs egc
    WHERE egc.game_id = NEW.game_id
    ON CONFLICT (game_id, date) DO UPDATE SET
      total_sessions = external_game_analytics.total_sessions + 1,
      unique_players = (
        SELECT COUNT(DISTINCT student_id)
        FROM external_game_sessions
        WHERE game_id = NEW.game_id
        AND started_at::date = CURRENT_DATE
      ),
      total_time_spent = external_game_analytics.total_time_spent + NEW.total_time_spent,
      average_session_time = (
        SELECT AVG(total_time_spent)::integer
        FROM external_game_sessions
        WHERE game_id = NEW.game_id
        AND started_at::date = CURRENT_DATE
        AND ended_at IS NOT NULL
      ),
      completion_rate = (
        SELECT (COUNT(*) FILTER (WHERE is_completed) * 100.0 / COUNT(*))::decimal(5,2)
        FROM external_game_sessions
        WHERE game_id = NEW.game_id
        AND started_at::date = CURRENT_DATE
        AND ended_at IS NOT NULL
      ),
      average_score = (
        SELECT AVG(score)::decimal(10,2)
        FROM external_game_sessions
        WHERE game_id = NEW.game_id
        AND started_at::date = CURRENT_DATE
        AND score IS NOT NULL
      ),
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for analytics updates
CREATE TRIGGER trigger_update_external_game_analytics
  AFTER UPDATE ON external_game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_external_game_analytics();

-- Function to update student progress
CREATE OR REPLACE FUNCTION update_student_external_game_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update student progress when a session ends
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    INSERT INTO student_external_game_progress (
      student_id,
      game_id,
      first_played_at,
      last_played_at,
      total_sessions,
      total_time_spent,
      best_score,
      total_score,
      completion_rate,
      objectives_completed
    )
    VALUES (
      NEW.student_id,
      NEW.game_id,
      NEW.started_at,
      NEW.last_activity_at,
      1,
      NEW.total_time_spent,
      NEW.score,
      COALESCE(NEW.score, 0),
      CASE WHEN NEW.is_completed THEN 100.00 ELSE 0.00 END,
      NEW.objectives_completed
    )
    ON CONFLICT (student_id, game_id) DO UPDATE SET
      last_played_at = NEW.last_activity_at,
      total_sessions = student_external_game_progress.total_sessions + 1,
      total_time_spent = student_external_game_progress.total_time_spent + NEW.total_time_spent,
      best_score = GREATEST(student_external_game_progress.best_score, COALESCE(NEW.score, 0)),
      total_score = student_external_game_progress.total_score + COALESCE(NEW.score, 0),
      completion_rate = (
        SELECT (COUNT(*) FILTER (WHERE is_completed) * 100.0 / COUNT(*))::decimal(5,2)
        FROM external_game_sessions
        WHERE student_id = NEW.student_id
        AND game_id = NEW.game_id
        AND ended_at IS NOT NULL
      ),
      objectives_completed = (
        SELECT array_agg(DISTINCT obj)
        FROM (
          SELECT unnest(objectives_completed) as obj
          FROM external_game_sessions
          WHERE student_id = NEW.student_id
          AND game_id = NEW.game_id
          AND ended_at IS NOT NULL
        ) t
      ),
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for student progress updates
CREATE TRIGGER trigger_update_student_external_game_progress
  AFTER UPDATE ON external_game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_student_external_game_progress();

-- Insert default external game configs
INSERT INTO external_game_configs (
  game_id, source, title, description, url, subjects, difficulty, age_range_min, age_range_max, objectives
) VALUES
(
  'phet-forces-motion',
  'phet',
  'Fuerzas y Movimiento Básico',
  'Explora las fuerzas, el movimiento y la fricción',
  'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_es.html',
  ARRAY['Física', 'Ciencias'],
  'beginner',
  8,
  14,
  '[
    {
      "id": "understand-force",
      "title": "Entender el concepto de fuerza",
      "description": "Aplicar fuerzas a objetos y observar el movimiento",
      "required": true,
      "points": 10,
      "completionCriteria": {"action": "force-applied", "minCount": 5}
    }
  ]'::jsonb
),
(
  'blockly-maze',
  'blockly',
  'Laberinto Blockly',
  'Programa al personaje para encontrar la salida del laberinto',
  'https://blockly.games/maze?lang=es',
  ARRAY['Programación', 'Lógica'],
  'beginner',
  8,
  16,
  '[
    {
      "id": "complete-level-1",
      "title": "Completar nivel 1",
      "description": "Resolver el primer laberinto",
      "required": true,
      "points": 5,
      "completionCriteria": {"action": "level-completed", "level": 1}
    }
  ]'::jsonb
);