# Supabase Migration Execution Guide

## Migration Status
- **File**: `supabase/migrations/010_class_management_fixed.sql`
- **Status**: Ready for execution
- **Created**: September 29, 2025

## Steps to Execute Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. **Access Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/ggntuptvqxditgxtnsex
   - Sign in with your Supabase account

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Execute Migration**
   - Copy the entire contents of `supabase/migrations/010_class_management_fixed.sql`
   - Paste into the SQL editor
   - Click "Run" button (or press Cmd/Ctrl + Enter)

4. **Verify Migration**
   ```sql
   -- Run this to verify tables were created:
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('classes', 'enrollments', 'assignments', 'submissions', 'class_announcements', 'class_resources', 'attendance', 'class_schedule')
   ORDER BY table_name;

   -- Check if RLS is enabled:
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('classes', 'enrollments', 'assignments');
   ```

### Option 2: Via Supabase CLI

1. **Login to Supabase**
   ```bash
   supabase login
   ```

2. **Link to Project**
   ```bash
   supabase link --project-ref ggntuptvqxditgxtnsex
   ```

3. **Run Migration**
   ```bash
   supabase db push
   ```

### Option 3: Direct Database Connection

1. **Get Connection String**
   - Go to Dashboard > Settings > Database
   - Copy the connection string

2. **Use psql or any PostgreSQL client**
   ```bash
   psql "postgresql://postgres:[password]@db.ggntuptvqxditgxtnsex.supabase.co:5432/postgres" -f supabase/migrations/010_class_management_fixed.sql
   ```

## What the Migration Does

### Tables Created
- `classes` - Class management with teacher assignments
- `enrollments` - Student enrollments with status tracking
- `assignments` - Homework, quizzes, projects
- `submissions` - Student work submissions and grading
- `class_announcements` - Teacher announcements
- `class_resources` - Educational materials and resources
- `attendance` - Attendance tracking
- `class_schedule` - Class scheduling

### Functions Created
- `update_updated_at_column()` - Auto-update timestamps
- `generate_class_code()` - Generate unique class codes
- `set_class_code()` - Auto-set class codes on insert
- `check_enrollment_limit()` - Enforce enrollment limits

### Security Features
- Row Level Security (RLS) enabled on all tables
- Teachers can only manage their own classes
- Students can only view/interact with enrolled classes
- Proper access controls for all operations

## Post-Migration Checklist

- [ ] Verify all tables created successfully
- [ ] Check RLS policies are active
- [ ] Test a sample class creation
- [ ] Verify enrollment functionality
- [ ] Confirm teacher/student access controls work

## Rollback (if needed)

```sql
-- To rollback the migration:
DROP TABLE IF EXISTS class_schedule CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS class_resources CASCADE;
DROP TABLE IF EXISTS class_announcements CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_class_code() CASCADE;
DROP FUNCTION IF EXISTS set_class_code() CASCADE;
DROP FUNCTION IF EXISTS check_enrollment_limit() CASCADE;
```

## Current Environment Variables
All required environment variables have been added to Vercel:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ SUPABASE_JWT_SECRET
- ✅ DeepSeek API credentials
- ✅ Feature flags

## Production Deployment Status
- **Vercel Deployment**: ✅ Successfully deployed
- **URL**: https://web-g4viz5omv-nadalpiantini-fcbc2d66.vercel.app
- **Status**: Ready
- **SQL Migration**: ⏳ Pending execution