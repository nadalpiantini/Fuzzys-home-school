-- Fix for is_active column error
-- This is a simplified version to get the tables created first

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Games are viewable by everyone" ON public.games;

-- Ensure the games table has is_active column
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure colonial_rally_points has is_active column
ALTER TABLE public.colonial_rally_points
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Recreate the policy correctly
CREATE POLICY "Games are viewable by everyone" ON public.games
  FOR SELECT USING (true);

-- Create policy for colonial rally points
CREATE POLICY "Rally points are viewable by everyone" ON public.colonial_rally_points
  FOR SELECT USING (true);