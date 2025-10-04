-- 08_sample_curriculum_data.sql
-- Sample data to demonstrate dynamic curriculum system
-- This creates a simple learning path with linear, alternative, and reinforcement routes

-- ============================================
-- SAMPLE MATH CURRICULUM: Números (Level 1)
-- ============================================

-- Insert curriculum nodes for math-level1
INSERT INTO public.curriculum_nodes (curriculum_id, chapter_id, title, difficulty, subject, order_index) VALUES
-- Linear path
('math-level1', 'numeros-0-10', 'Números 0-10', 'easy', 'math', 1),
('math-level1', 'numeros-11-20', 'Números 11-20', 'medium', 'math', 2),
('math-level1', 'sumas-simples', 'Sumas Simples', 'medium', 'math', 3),
('math-level1', 'restas-simples', 'Restas Simples', 'medium', 'math', 4),

-- Alternative paths (for high performers)
('math-level1', 'numeros-avanzados', 'Números Grandes (50-100)', 'hard', 'math', 5),
('math-level1', 'sumas-avanzadas', 'Sumas de 2 Dígitos', 'hard', 'math', 6),

-- Reinforcement paths (for struggling students)
('math-level1', 'repaso-conteo', 'Repaso: Contar y Reconocer', 'easy', 'math', 7),
('math-level1', 'repaso-cantidades', 'Repaso: Comparar Cantidades', 'easy', 'math', 8)
ON CONFLICT (curriculum_id, chapter_id) DO NOTHING;

-- ============================================
-- CURRICULUM LINKS (MATH)
-- ============================================

-- Linear progression (standard path)
INSERT INTO public.curriculum_links (from_node, to_node, condition, type) VALUES
-- Números 0-10 → Números 11-20 (if score >= 70)
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'numeros-0-10' AND curriculum_id = 'math-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'numeros-11-20' AND curriculum_id = 'math-level1'),
  'score>=70',
  'linear'
),
-- Números 11-20 → Sumas Simples (if score >= 70)
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'numeros-11-20' AND curriculum_id = 'math-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'sumas-simples' AND curriculum_id = 'math-level1'),
  'score>=70',
  'linear'
),
-- Sumas Simples → Restas Simples (if score >= 70)
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'sumas-simples' AND curriculum_id = 'math-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'restas-simples' AND curriculum_id = 'math-level1'),
  'score>=70',
  'linear'
)
ON CONFLICT DO NOTHING;

-- Alternative paths (for high performers)
INSERT INTO public.curriculum_links (from_node, to_node, condition, type) VALUES
-- Números 0-10 → Números Avanzados (if score >= 90)
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'numeros-0-10' AND curriculum_id = 'math-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'numeros-avanzados' AND curriculum_id = 'math-level1'),
  'score>=90',
  'alternative'
),
-- Números 11-20 → Sumas Avanzadas (if score >= 90)
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'numeros-11-20' AND curriculum_id = 'math-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'sumas-avanzadas' AND curriculum_id = 'math-level1'),
  'score>=90',
  'alternative'
),
-- Números Avanzados can also lead to Sumas Avanzadas
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'numeros-avanzados' AND curriculum_id = 'math-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'sumas-avanzadas' AND curriculum_id = 'math-level1'),
  'always',
  'linear'
)
ON CONFLICT DO NOTHING;

-- Reinforcement paths (for struggling students)
INSERT INTO public.curriculum_links (from_node, to_node, condition, type) VALUES
-- Números 0-10 → Repaso Conteo (if avg < 60)
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'numeros-0-10' AND curriculum_id = 'math-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'repaso-conteo' AND curriculum_id = 'math-level1'),
  'avg<60',
  'reinforcement'
),
-- Sumas Simples → Repaso Cantidades (if avg < 60)
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'sumas-simples' AND curriculum_id = 'math-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'repaso-cantidades' AND curriculum_id = 'math-level1'),
  'avg<60',
  'reinforcement'
),
-- Repaso paths can lead back to main path
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'repaso-conteo' AND curriculum_id = 'math-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'numeros-11-20' AND curriculum_id = 'math-level1'),
  'always',
  'linear'
),
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'repaso-cantidades' AND curriculum_id = 'math-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'sumas-simples' AND curriculum_id = 'math-level1'),
  'always',
  'linear'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE LITERACY CURRICULUM
-- ============================================

INSERT INTO public.curriculum_nodes (curriculum_id, chapter_id, title, difficulty, subject, order_index) VALUES
-- Linear path
('literacy-level1', 'vocales', 'Las Vocales', 'easy', 'literacy', 1),
('literacy-level1', 'consonantes-1', 'Consonantes M, P, S', 'medium', 'literacy', 2),
('literacy-level1', 'silabas-simples', 'Sílabas Simples', 'medium', 'literacy', 3),
('literacy-level1', 'palabras-cortas', 'Palabras Cortas', 'medium', 'literacy', 4),

-- Alternative path
('literacy-level1', 'lectura-avanzada', 'Lectura de Oraciones', 'hard', 'literacy', 5),

-- Reinforcement
('literacy-level1', 'repaso-letras', 'Repaso: Reconocer Letras', 'easy', 'literacy', 6)
ON CONFLICT (curriculum_id, chapter_id) DO NOTHING;

-- Literacy links
INSERT INTO public.curriculum_links (from_node, to_node, condition, type) VALUES
-- Linear progression
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'vocales' AND curriculum_id = 'literacy-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'consonantes-1' AND curriculum_id = 'literacy-level1'),
  'score>=70',
  'linear'
),
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'consonantes-1' AND curriculum_id = 'literacy-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'silabas-simples' AND curriculum_id = 'literacy-level1'),
  'score>=70',
  'linear'
),
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'silabas-simples' AND curriculum_id = 'literacy-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'palabras-cortas' AND curriculum_id = 'literacy-level1'),
  'score>=70',
  'linear'
),

-- Alternative path for high performers
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'silabas-simples' AND curriculum_id = 'literacy-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'lectura-avanzada' AND curriculum_id = 'literacy-level1'),
  'score>=90',
  'alternative'
),

-- Reinforcement path
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'vocales' AND curriculum_id = 'literacy-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'repaso-letras' AND curriculum_id = 'literacy-level1'),
  'avg<60',
  'reinforcement'
),
(
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'repaso-letras' AND curriculum_id = 'literacy-level1'),
  (SELECT id FROM public.curriculum_nodes WHERE chapter_id = 'consonantes-1' AND curriculum_id = 'literacy-level1'),
  'always',
  'linear'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show all curriculum nodes
SELECT curriculum_id, chapter_id, title, difficulty, order_index
FROM public.curriculum_nodes
ORDER BY curriculum_id, order_index;

-- Show all curriculum links with conditions
SELECT
  cn1.curriculum_id,
  cn1.chapter_id as from_chapter,
  cn2.chapter_id as to_chapter,
  cl.condition,
  cl.type
FROM public.curriculum_links cl
JOIN public.curriculum_nodes cn1 ON cl.from_node = cn1.id
JOIN public.curriculum_nodes cn2 ON cl.to_node = cn2.id
ORDER BY cn1.curriculum_id, cn1.order_index;

-- Count links by type
SELECT type, COUNT(*) as count
FROM public.curriculum_links
GROUP BY type;

-- ============================================
-- HELPFUL COMMENTS
-- ============================================

COMMENT ON TABLE public.curriculum_nodes IS 'Sample data created: 14 nodes across math-level1 and literacy-level1';
COMMENT ON TABLE public.curriculum_links IS 'Sample data created: Multiple link types (linear, alternative, reinforcement)';

-- Test unlock scenarios:
-- 1. Score >= 70 on 'numeros-0-10' → unlocks 'numeros-11-20'
-- 2. Score >= 90 on 'numeros-0-10' → unlocks both 'numeros-11-20' AND 'numeros-avanzados'
-- 3. Average < 60 on 'numeros-0-10' → unlocks 'repaso-conteo' for reinforcement
