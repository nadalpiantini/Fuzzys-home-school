-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    language VARCHAR(10) DEFAULT 'es' CHECK (language IN ('es', 'en')),
    preferences JSONB DEFAULT '{}',
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    level VARCHAR(50) DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    time_spent INTEGER NOT NULL, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    level VARCHAR(50),
    difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    content JSONB NOT NULL,
    points INTEGER DEFAULT 10,
    time_limit INTEGER, -- in seconds
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'mcq', 'true_false', 'short_answer', etc.
    options JSONB, -- for multiple choice questions
    correct_answer JSONB NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User game sessions
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    max_score INTEGER NOT NULL,
    time_spent INTEGER NOT NULL, -- in seconds
    answers JSONB, -- user's answers
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- AI Tutor conversations
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'es',
    context JSONB, -- additional context for the conversation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colonial Rally locations
CREATE TABLE colonial_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    qr_code VARCHAR(255) UNIQUE,
    ar_content JSONB, -- AR overlay content
    historical_info JSONB,
    points INTEGER DEFAULT 10,
    difficulty VARCHAR(50) DEFAULT 'easy',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User rally progress
CREATE TABLE rally_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES colonial_locations(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_earned INTEGER DEFAULT 0,
    qr_scanned BOOLEAN DEFAULT FALSE,
    ar_explored BOOLEAN DEFAULT FALSE
);

-- Classes (for teachers)
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    level VARCHAR(50),
    class_code VARCHAR(20) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class enrollments
CREATE TABLE class_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- Assignments
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    game_id UUID REFERENCES games(id),
    due_date TIMESTAMP WITH TIME ZONE,
    points INTEGER DEFAULT 10,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment submissions
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_session_id UUID REFERENCES game_sessions(id),
    score INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    feedback TEXT,
    UNIQUE(assignment_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_subject ON user_progress(subject);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_rally_progress_user_id ON rally_progress(user_id);
CREATE INDEX idx_rally_progress_location_id ON rally_progress(location_id);
CREATE INDEX idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions(student_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();