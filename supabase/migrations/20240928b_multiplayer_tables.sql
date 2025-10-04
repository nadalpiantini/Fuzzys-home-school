-- Migration: Add multiplayer and tutoring tables
-- Created: 2024-01-15

-- Game Rooms table for multiplayer functionality
CREATE TABLE IF NOT EXISTS game_rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    game_type TEXT NOT NULL CHECK (game_type IN ('quiz_battle', 'collaborative_solve', 'speed_round', 'team_challenge')),
    subject TEXT NOT NULL,
    topic TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    max_players INTEGER NOT NULL DEFAULT 6 CHECK (max_players >= 2 AND max_players <= 20),
    time_per_question INTEGER NOT NULL DEFAULT 30 CHECK (time_per_question >= 10 AND time_per_question <= 300),
    total_questions INTEGER NOT NULL DEFAULT 10 CHECK (total_questions >= 5 AND total_questions <= 50),
    language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),
    settings JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'starting', 'active', 'paused', 'finished', 'cancelled')),
    current_question JSONB,
    game_data JSONB DEFAULT '{}',
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Room Players table
CREATE TABLE IF NOT EXISTS room_players (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    room_id TEXT NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    grade INTEGER CHECK (grade >= 1 AND grade <= 12),
    status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'away', 'answering', 'finished')),
    score INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    answers JSONB NOT NULL DEFAULT '[]',
    power_ups JSONB NOT NULL DEFAULT '[]',
    team TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, user_id)
);

-- Room Chat table
CREATE TABLE IF NOT EXISTS room_chat (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    room_id TEXT NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    player_id TEXT,
    player_name TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'message' CHECK (message_type IN ('message', 'system', 'reaction')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Game Analytics table
CREATE TABLE IF NOT EXISTS game_analytics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    room_id TEXT NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    player_count INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    average_score NUMERIC(5,2),
    completion_rate NUMERIC(3,2),
    engagement_metrics JSONB NOT NULL DEFAULT '{}',
    question_analytics JSONB NOT NULL DEFAULT '[]',
    player_performance JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tutor Sessions table
CREATE TABLE IF NOT EXISTS tutor_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT,
    language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),
    student_profile JSONB,
    context JSONB DEFAULT '{}',
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tutor Messages table
CREATE TABLE IF NOT EXISTS tutor_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id TEXT NOT NULL REFERENCES tutor_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Learning Profiles table for adaptive engine
CREATE TABLE IF NOT EXISTS learning_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL UNIQUE,
    learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading_writing', 'multimodal')),
    knowledge_map JSONB NOT NULL DEFAULT '{}',
    preferences JSONB NOT NULL DEFAULT '{}',
    performance JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activity Attempts table for adaptive engine
CREATE TABLE IF NOT EXISTS activity_attempts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    activity_id TEXT NOT NULL,
    game_type TEXT NOT NULL,
    concept TEXT NOT NULL,
    difficulty NUMERIC(3,2) NOT NULL CHECK (difficulty >= 0 AND difficulty <= 1),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    score NUMERIC(3,2) NOT NULL CHECK (score >= 0 AND score <= 1),
    time_spent INTEGER NOT NULL DEFAULT 0,
    hints_used INTEGER NOT NULL DEFAULT 0,
    mistakes JSONB NOT NULL DEFAULT '[]',
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- H5P Content table
CREATE TABLE IF NOT EXISTS h5p_content (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),
    params JSONB NOT NULL,
    library TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    subject TEXT NOT NULL,
    estimated_time INTEGER NOT NULL DEFAULT 10,
    rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    completions INTEGER NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- H5P Results table
CREATE TABLE IF NOT EXISTS h5p_results (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content_id TEXT NOT NULL REFERENCES h5p_content(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL DEFAULT 100,
    time_spent INTEGER NOT NULL DEFAULT 0,
    interactions INTEGER NOT NULL DEFAULT 0,
    completion INTEGER NOT NULL DEFAULT 0 CHECK (completion >= 0 AND completion <= 100),
    passed BOOLEAN NOT NULL DEFAULT false,
    attempt_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_created_by ON game_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_game_rooms_created_at ON game_rooms(created_at);

CREATE INDEX IF NOT EXISTS idx_room_players_room_id ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_user_id ON room_players(user_id);
CREATE INDEX IF NOT EXISTS idx_room_players_status ON room_players(status);

CREATE INDEX IF NOT EXISTS idx_room_chat_room_id ON room_chat(room_id);
CREATE INDEX IF NOT EXISTS idx_room_chat_created_at ON room_chat(created_at);

CREATE INDEX IF NOT EXISTS idx_tutor_sessions_user_id ON tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_subject ON tutor_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_start_time ON tutor_sessions(start_time);

CREATE INDEX IF NOT EXISTS idx_tutor_messages_session_id ON tutor_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_created_at ON tutor_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_learning_profiles_user_id ON learning_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_attempts_user_id ON activity_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_attempts_concept ON activity_attempts(concept);
CREATE INDEX IF NOT EXISTS idx_activity_attempts_start_time ON activity_attempts(start_time);

CREATE INDEX IF NOT EXISTS idx_h5p_content_type ON h5p_content(type);
CREATE INDEX IF NOT EXISTS idx_h5p_content_subject ON h5p_content(subject);
CREATE INDEX IF NOT EXISTS idx_h5p_content_difficulty ON h5p_content(difficulty);

CREATE INDEX IF NOT EXISTS idx_h5p_results_content_id ON h5p_results(content_id);
CREATE INDEX IF NOT EXISTS idx_h5p_results_user_id ON h5p_results(user_id);
CREATE INDEX IF NOT EXISTS idx_h5p_results_created_at ON h5p_results(created_at);

-- Enable Row Level Security
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE h5p_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE h5p_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Game Rooms: Users can see rooms they've joined or created
CREATE POLICY "Users can view game rooms they participate in" ON game_rooms
    FOR SELECT USING (
        created_by = auth.uid()::text
        OR id IN (
            SELECT room_id FROM room_players
            WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can create game rooms" ON game_rooms
    FOR INSERT WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Room creators can update their rooms" ON game_rooms
    FOR UPDATE USING (created_by = auth.uid()::text);

-- Room Players: Users can see players in rooms they've joined
CREATE POLICY "Users can view players in their rooms" ON room_players
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM room_players
            WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can join rooms" ON room_players
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own player data" ON room_players
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Room Chat: Users can see chat in rooms they've joined
CREATE POLICY "Users can view chat in their rooms" ON room_chat
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM room_players
            WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can send chat messages" ON room_chat
    FOR INSERT WITH CHECK (
        room_id IN (
            SELECT room_id FROM room_players
            WHERE user_id = auth.uid()::text
        )
    );

-- Tutor Sessions: Users can only see their own sessions
CREATE POLICY "Users can view their own tutor sessions" ON tutor_sessions
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own tutor sessions" ON tutor_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own tutor sessions" ON tutor_sessions
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Tutor Messages: Users can only see messages from their sessions
CREATE POLICY "Users can view their own tutor messages" ON tutor_messages
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM tutor_sessions
            WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can create messages in their sessions" ON tutor_messages
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM tutor_sessions
            WHERE user_id = auth.uid()::text
        )
    );

-- Learning Profiles: Users can only see their own profile
CREATE POLICY "Users can view their own learning profile" ON learning_profiles
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own learning profile" ON learning_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own learning profile" ON learning_profiles
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Activity Attempts: Users can only see their own attempts
CREATE POLICY "Users can view their own activity attempts" ON activity_attempts
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own activity attempts" ON activity_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- H5P Content: All authenticated users can view content
CREATE POLICY "All users can view H5P content" ON h5p_content
    FOR SELECT USING (auth.role() = 'authenticated');

-- H5P Results: Users can only see their own results
CREATE POLICY "Users can view their own H5P results" ON h5p_results
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own H5P results" ON h5p_results
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_learning_profiles_updated_at BEFORE UPDATE ON learning_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_h5p_content_updated_at BEFORE UPDATE ON h5p_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update room player last_seen
CREATE OR REPLACE FUNCTION update_player_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_room_players_last_seen BEFORE UPDATE ON room_players
    FOR EACH ROW EXECUTE FUNCTION update_player_last_seen();

COMMENT ON TABLE game_rooms IS 'Multiplayer game rooms and sessions';
COMMENT ON TABLE room_players IS 'Players participating in game rooms';
COMMENT ON TABLE room_chat IS 'Chat messages in game rooms';
COMMENT ON TABLE game_analytics IS 'Analytics data for completed games';
COMMENT ON TABLE tutor_sessions IS 'AI tutoring sessions with students';
COMMENT ON TABLE tutor_messages IS 'Messages in tutoring sessions';
COMMENT ON TABLE learning_profiles IS 'Adaptive learning profiles for personalization';
COMMENT ON TABLE activity_attempts IS 'Student attempts at educational activities';
COMMENT ON TABLE h5p_content IS 'H5P interactive content library';
COMMENT ON TABLE h5p_results IS 'Results from H5P content interactions';