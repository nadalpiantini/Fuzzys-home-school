-- Migration: Curriculum Map System
-- Description: Adds curriculum_nodes and curriculum_links tables for adaptive learning paths
-- Date: 2025-01-04

-- ============================================================================
-- TABLE: curriculum_nodes
-- Represents individual chapters/topics as nodes in the curriculum graph
-- ============================================================================
CREATE TABLE IF NOT EXISTS curriculum_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id text NOT NULL,
  chapter_id text NOT NULL UNIQUE,
  title text NOT NULL,
  order_index integer,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for faster queries by curriculum
CREATE INDEX IF NOT EXISTS idx_curriculum_nodes_curriculum_id
  ON curriculum_nodes(curriculum_id);

-- Index for chapter lookups
CREATE INDEX IF NOT EXISTS idx_curriculum_nodes_chapter_id
  ON curriculum_nodes(chapter_id);

-- ============================================================================
-- TABLE: curriculum_links
-- Represents connections/prerequisites between curriculum nodes
-- ============================================================================
CREATE TABLE IF NOT EXISTS curriculum_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node uuid NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  to_node uuid NOT NULL REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  condition text DEFAULT 'always',
  type text CHECK (type IN ('linear', 'alternative', 'reinforcement')) DEFAULT 'linear',
  created_at timestamptz DEFAULT now(),

  -- Prevent duplicate links
  UNIQUE(from_node, to_node)
);

-- Indexes for link traversal
CREATE INDEX IF NOT EXISTS idx_curriculum_links_from_node
  ON curriculum_links(from_node);

CREATE INDEX IF NOT EXISTS idx_curriculum_links_to_node
  ON curriculum_links(to_node);

CREATE INDEX IF NOT EXISTS idx_curriculum_links_type
  ON curriculum_links(type);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE curriculum_nodes IS 'Individual chapters/topics in the curriculum graph';
COMMENT ON TABLE curriculum_links IS 'Connections and prerequisites between curriculum nodes';

COMMENT ON COLUMN curriculum_nodes.curriculum_id IS 'Reference to curriculum (e.g., math-level1, literacy-level1)';
COMMENT ON COLUMN curriculum_nodes.chapter_id IS 'Unique chapter identifier';
COMMENT ON COLUMN curriculum_nodes.order_index IS 'Suggested order for linear progression';
COMMENT ON COLUMN curriculum_nodes.difficulty IS 'Chapter difficulty level';

COMMENT ON COLUMN curriculum_links.from_node IS 'Source node (prerequisite)';
COMMENT ON COLUMN curriculum_links.to_node IS 'Target node (dependent)';
COMMENT ON COLUMN curriculum_links.condition IS 'Unlock condition (e.g., "always", "score>=70", "completed")';
COMMENT ON COLUMN curriculum_links.type IS 'Link type: linear (main path), alternative (exploration), reinforcement (remedial)';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE curriculum_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view curriculum nodes" ON curriculum_nodes;
DROP POLICY IF EXISTS "Anyone can view curriculum links" ON curriculum_links;
DROP POLICY IF EXISTS "Admins can insert curriculum nodes" ON curriculum_nodes;
DROP POLICY IF EXISTS "Admins can update curriculum nodes" ON curriculum_nodes;
DROP POLICY IF EXISTS "Admins can delete curriculum nodes" ON curriculum_nodes;
DROP POLICY IF EXISTS "Admins can insert curriculum links" ON curriculum_links;
DROP POLICY IF EXISTS "Admins can update curriculum links" ON curriculum_links;
DROP POLICY IF EXISTS "Admins can delete curriculum links" ON curriculum_links;

-- Allow all authenticated users to read curriculum structure
CREATE POLICY "Anyone can view curriculum nodes"
  ON curriculum_nodes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view curriculum links"
  ON curriculum_links FOR SELECT
  USING (true);

-- Only admins/teachers can modify curriculum structure
CREATE POLICY "Admins can insert curriculum nodes"
  ON curriculum_nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can update curriculum nodes"
  ON curriculum_nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can delete curriculum nodes"
  ON curriculum_nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can insert curriculum links"
  ON curriculum_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can update curriculum links"
  ON curriculum_links FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can delete curriculum links"
  ON curriculum_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );
