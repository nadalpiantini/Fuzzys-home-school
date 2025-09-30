-- =====================================================
-- Execute this SQL in Supabase SQL Editor
-- =====================================================
-- 1. Go to https://ggntuptvqxditgxtnsex.supabase.co
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run"
-- =====================================================

-- First, check if migration was already applied
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'classes'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Classes table already exists - migration may have been partially applied';
        -- You may want to review and manually apply missing parts
    ELSE
        RAISE NOTICE 'Proceeding with full migration';
    END IF;
END $$;

-- Now execute the fixed migration
-- Copy the contents from 010_class_management_fixed.sql here

-- [INSERT THE FULL CONTENTS OF 010_class_management_fixed.sql HERE]

-- After running, verify with:
-- SELECT * FROM information_schema.tables WHERE table_schema = 'public';