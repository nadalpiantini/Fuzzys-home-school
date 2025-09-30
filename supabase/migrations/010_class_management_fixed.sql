-- =====================================================
-- Fuzzy's Home School - Class Management System
-- Migration: 010_class_management_fixed.sql
-- Fixed version with proper order and checks
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PREREQUISITE CHECK
-- =====================================================
DO $$
BEGIN
    -- Check if profiles table exists (required dependency)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'profiles'
        AND table_schema = 'public'
    ) THEN
        -- Create a basic profiles table if it doesn't exist
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email TEXT UNIQUE,
            role TEXT CHECK (role IN ('student', 'teacher', 'admin', 'parent')) DEFAULT 'student',
            name TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- =====================================================
-- HELPER FUNCTIONS (Define before using)
-- =====================================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique class code
CREATE OR REPLACE FUNCTION generate_class_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  done BOOLEAN DEFAULT false;
BEGIN
  WHILE NOT done LOOP
    -- Generate 6 character alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.classes WHERE code = new_code) THEN
      done := true;
    END IF;
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to set class code
CREATE OR REPLACE FUNCTION set_class_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_class_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check enrollment limit
CREATE OR REPLACE FUNCTION check_enrollment_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get current enrollment count
  SELECT COUNT(*) INTO current_count
  FROM public.enrollments
  WHERE class_id = NEW.class_id AND status = 'active';

  -- Get max students allowed
  SELECT max_students INTO max_allowed
  FROM public.classes
  WHERE id = NEW.class_id;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Class enrollment limit reached';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CLASSES TABLE
-- =====================================================

-- Create classes table if not exists
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS subject_id UUID,
ADD COLUMN IF NOT EXISTS grade_level INTEGER CHECK (grade_level >= 1 AND grade_level <= 12),
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS trigger_classes_updated_at ON public.classes;

-- Create trigger for updated_at
CREATE TRIGGER trigger_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS trigger_set_class_code ON public.classes;

-- Trigger to auto-generate class code
CREATE TRIGGER trigger_set_class_code
  BEFORE INSERT ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION set_class_code();

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_code ON public.classes(code);

-- Check if is_active column exists before creating index
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'classes'
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_classes_is_active ON public.classes(is_active);
    END IF;
END $$;

-- =====================================================
-- ENROLLMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'inactive', 'pending', 'blocked')) DEFAULT 'active',
  enrollment_code TEXT,
  notes TEXT,
  UNIQUE(class_id, student_id)
);

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS trigger_check_enrollment_limit ON public.enrollments;

-- Create trigger for enrollment limit
CREATE TRIGGER trigger_check_enrollment_limit
  BEFORE INSERT ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION check_enrollment_limit();

-- Indexes for enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON public.enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);

-- =====================================================
-- ASSIGNMENTS TABLE
-- =====================================================

-- Create assignments table if not exists
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('homework', 'quiz', 'project', 'exam', 'activity')) DEFAULT 'homework',
ADD COLUMN IF NOT EXISTS instructions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rubric JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_late_submission BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS trigger_assignments_updated_at ON public.assignments;

-- Create trigger for updated_at
CREATE TRIGGER trigger_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for assignments
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_is_published ON public.assignments(is_published);

-- =====================================================
-- SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  grade DECIMAL(5,2),
  feedback TEXT,
  status TEXT CHECK (status IN ('draft', 'submitted', 'graded', 'returned')) DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES public.profiles(id),
  is_late BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Indexes for submissions
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- =====================================================
-- CLASS ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.class_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for announcements
CREATE INDEX IF NOT EXISTS idx_announcements_class_id ON public.class_announcements(class_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.class_announcements(created_at DESC);

-- =====================================================
-- CLASS RESOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.class_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('document', 'video', 'link', 'file', 'image')) DEFAULT 'document',
  url TEXT,
  file_path TEXT,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES public.profiles(id),
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for resources
CREATE INDEX IF NOT EXISTS idx_resources_class_id ON public.class_resources(class_id);

-- =====================================================
-- ATTENDANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
  notes TEXT,
  marked_by UUID REFERENCES public.profiles(id),
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id, date)
);

-- Indexes for attendance
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON public.attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- =====================================================
-- CLASS SCHEDULE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.class_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for schedule
CREATE INDEX IF NOT EXISTS idx_schedule_class_id ON public.class_schedule(class_id);

-- =====================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_classes_updated_at ON public.classes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON public.assignments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.submissions(submitted_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedule ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones
-- Classes policies
DROP POLICY IF EXISTS "Teachers can CRUD their own classes" ON public.classes;
CREATE POLICY "Teachers can CRUD their own classes" ON public.classes
  FOR ALL USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Students can view enrolled classes" ON public.classes;
CREATE POLICY "Students can view enrolled classes" ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.class_id = classes.id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Anyone can view active classes by code" ON public.classes;
CREATE POLICY "Anyone can view active classes by code" ON public.classes
  FOR SELECT USING (is_active = true);

-- Enrollments policies
DROP POLICY IF EXISTS "Teachers can manage enrollments in their classes" ON public.enrollments;
CREATE POLICY "Teachers can manage enrollments in their classes" ON public.enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.enrollments;
CREATE POLICY "Students can view their own enrollments" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can enroll themselves" ON public.enrollments;
CREATE POLICY "Students can enroll themselves" ON public.enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Assignments policies
DROP POLICY IF EXISTS "Teachers can CRUD assignments in their classes" ON public.assignments;
CREATE POLICY "Teachers can CRUD assignments in their classes" ON public.assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = assignments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view published assignments in enrolled classes" ON public.assignments;
CREATE POLICY "Students can view published assignments in enrolled classes" ON public.assignments
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.class_id = assignments.class_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Submissions policies
DROP POLICY IF EXISTS "Students can manage their own submissions" ON public.submissions;
CREATE POLICY "Students can manage their own submissions" ON public.submissions
  FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view and grade submissions in their classes" ON public.submissions;
CREATE POLICY "Teachers can view and grade submissions in their classes" ON public.submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assignments
      JOIN public.classes ON classes.id = assignments.class_id
      WHERE assignments.id = submissions.assignment_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Announcements policies
DROP POLICY IF EXISTS "Teachers can CRUD announcements in their classes" ON public.class_announcements;
CREATE POLICY "Teachers can CRUD announcements in their classes" ON public.class_announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_announcements.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view announcements in enrolled classes" ON public.class_announcements;
CREATE POLICY "Students can view announcements in enrolled classes" ON public.class_announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.class_id = class_announcements.class_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Resources policies
DROP POLICY IF EXISTS "Teachers can CRUD resources in their classes" ON public.class_resources;
CREATE POLICY "Teachers can CRUD resources in their classes" ON public.class_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_resources.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view visible resources in enrolled classes" ON public.class_resources;
CREATE POLICY "Students can view visible resources in enrolled classes" ON public.class_resources
  FOR SELECT USING (
    is_visible = true AND
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.class_id = class_resources.class_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Attendance policies
DROP POLICY IF EXISTS "Teachers can manage attendance in their classes" ON public.attendance;
CREATE POLICY "Teachers can manage attendance in their classes" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = attendance.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view their own attendance" ON public.attendance;
CREATE POLICY "Students can view their own attendance" ON public.attendance
  FOR SELECT USING (student_id = auth.uid());

-- Schedule policies
DROP POLICY IF EXISTS "Teachers can manage schedule for their classes" ON public.class_schedule;
CREATE POLICY "Teachers can manage schedule for their classes" ON public.class_schedule
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_schedule.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view schedule for enrolled classes" ON public.class_schedule;
CREATE POLICY "Students can view schedule for enrolled classes" ON public.class_schedule
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.class_id = class_schedule.class_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- =====================================================
-- END OF MIGRATION
-- =====================================================