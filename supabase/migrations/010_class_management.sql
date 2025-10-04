-- =====================================================
-- Fuzzy's Home School - Class Management System
-- Migration: 010_class_management.sql
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- CLASSES TABLE
-- =====================================================
-- First, add missing columns to existing classes table
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS subject_id UUID,
ADD COLUMN IF NOT EXISTS grade_level INTEGER CHECK (grade_level >= 1 AND grade_level <= 12),
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add foreign key constraint for subject_id if subjects table exists and constraint doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects' AND table_schema = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_classes_subject_id' 
            AND table_name = 'classes' 
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.classes 
            ADD CONSTRAINT fk_classes_subject_id 
            FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Update the updated_at column when row is modified
CREATE TRIGGER trigger_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_code ON public.classes(code);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON public.classes(is_active);

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

-- Indexes for enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON public.enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);

-- =====================================================
-- ASSIGNMENTS TABLE
-- =====================================================
-- First, add missing columns to existing assignments table
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('homework', 'quiz', 'project', 'exam', 'activity')) DEFAULT 'homework',
ADD COLUMN IF NOT EXISTS instructions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rubric JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_late_submission BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update the updated_at column when row is modified

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
-- HELPER FUNCTIONS
-- =====================================================

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

-- Trigger to auto-generate class code
CREATE OR REPLACE FUNCTION set_class_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_class_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_class_code
  BEFORE INSERT ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION set_class_code();

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

CREATE TRIGGER trigger_check_enrollment_limit
  BEFORE INSERT ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION check_enrollment_limit();

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

-- Classes policies
CREATE POLICY "Teachers can CRUD their own classes" ON public.classes
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can view enrolled classes" ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.class_id = classes.id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Anyone can view active classes by code" ON public.classes
  FOR SELECT USING (is_active = true);

-- Enrollments policies
CREATE POLICY "Teachers can manage enrollments in their classes" ON public.enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own enrollments" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can enroll themselves" ON public.enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Assignments policies
CREATE POLICY "Teachers can CRUD assignments in their classes" ON public.assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = assignments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

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
CREATE POLICY "Students can manage their own submissions" ON public.submissions
  FOR ALL USING (student_id = auth.uid());

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
CREATE POLICY "Teachers can CRUD announcements in their classes" ON public.class_announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_announcements.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

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
CREATE POLICY "Teachers can CRUD resources in their classes" ON public.class_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_resources.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

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
CREATE POLICY "Teachers can manage attendance in their classes" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = attendance.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own attendance" ON public.attendance
  FOR SELECT USING (student_id = auth.uid());

-- Schedule policies
CREATE POLICY "Teachers can manage schedule for their classes" ON public.class_schedule
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_schedule.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

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
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_classes_updated_at ON public.classes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON public.assignments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.submissions(submitted_at DESC);

-- =====================================================
-- SAMPLE DATA (Optional - Comment out in production)
-- =====================================================
-- Uncomment below to insert sample data for testing

/*
-- Insert sample class
INSERT INTO public.classes (name, description, teacher_id, subject_id, grade_level)
SELECT
  'Matemáticas Avanzadas 5to Grado',
  'Clase de matemáticas con enfoque en resolución de problemas y pensamiento lógico',
  (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1),
  (SELECT id FROM public.subjects WHERE code = 'math' LIMIT 1),
  5
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE role = 'teacher');
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================