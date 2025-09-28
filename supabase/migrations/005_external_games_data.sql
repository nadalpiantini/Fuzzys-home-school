-- Migration: External Games Data Seeding
-- Description: Insert sample data for external games integration

-- Insert PhET Simulations
INSERT INTO external_game_configs (
  game_id, source, title, description, url, subjects, difficulty, age_range_min, age_range_max, objectives
) VALUES
(
  'phet-forces-motion',
  'phet',
  'Fuerzas y Movimiento Básico',
  'Explora las fuerzas, el movimiento y la fricción con simulaciones interactivas',
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
  'phet-fractions',
  'phet',
  'Fracciones Visuales',
  'Aprende fracciones con representaciones visuales interactivas',
  'https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro_es.html',
  ARRAY['Matemáticas', 'Fracciones'],
  'beginner',
  6,
  12,
  '[
    {
      "id": "identify-fractions",
      "title": "Identificar fracciones",
      "description": "Reconocer y crear fracciones visualmente",
      "required": true,
      "points": 15,
      "completionCriteria": {"action": "fraction-created", "minCount": 3}
    }
  ]'::jsonb
),
(
  'phet-circuit-construction',
  'phet',
  'Construcción de Circuitos',
  'Construye y experimenta con circuitos eléctricos',
  'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_es.html',
  ARRAY['Física', 'Electricidad'],
  'intermediate',
  12,
  18,
  '[
    {
      "id": "build-circuit",
      "title": "Construir circuito funcional",
      "description": "Crear un circuito que encienda una bombilla",
      "required": true,
      "points": 20,
      "completionCriteria": {"action": "circuit-completed", "minCount": 1}
    }
  ]'::jsonb
);

-- Insert Blockly Games
INSERT INTO external_game_configs (
  game_id, source, title, description, url, subjects, difficulty, age_range_min, age_range_max, objectives
) VALUES
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
),
(
  'blockly-bird',
  'blockly',
  'Pájaro Blockly',
  'Programa un pájaro para volar y evitar obstáculos',
  'https://blockly.games/bird?lang=es',
  ARRAY['Programación', 'Lógica'],
  'intermediate',
  10,
  18,
  '[
    {
      "id": "complete-game",
      "title": "Completar el juego",
      "description": "Hacer que el pájaro vuele exitosamente",
      "required": true,
      "points": 10,
      "completionCriteria": {"action": "game-completed", "minCount": 1}
    }
  ]'::jsonb
),
(
  'blockly-pond',
  'blockly',
  'Estanque Blockly',
  'Programa un pato para nadar en el estanque',
  'https://blockly.games/pond?lang=es',
  ARRAY['Programación', 'Lógica'],
  'advanced',
  12,
  18,
  '[
    {
      "id": "complete-challenge",
      "title": "Completar desafío",
      "description": "Resolver el desafío de programación",
      "required": true,
      "points": 15,
      "completionCriteria": {"action": "challenge-completed", "minCount": 1}
    }
  ]'::jsonb
);

-- Insert Music Blocks
INSERT INTO external_game_configs (
  game_id, source, title, description, url, subjects, difficulty, age_range_min, age_range_max, objectives
) VALUES
(
  'music-rhythm-patterns',
  'music',
  'Patrones Rítmicos',
  'Crea y experimenta con patrones rítmicos musicales',
  'https://musicblocks.sugarlabs.org/activities/rhythm-patterns.html',
  ARRAY['Música', 'Matemáticas'],
  'beginner',
  6,
  14,
  '[
    {
      "id": "create-rhythm",
      "title": "Crear patrón rítmico",
      "description": "Diseñar un patrón rítmico de 4 compases",
      "required": true,
      "points": 10,
      "completionCriteria": {"action": "rhythm-created", "minCount": 1}
    }
  ]'::jsonb
),
(
  'music-melody-composition',
  'music',
  'Composición de Melodías',
  'Componer melodías usando bloques musicales',
  'https://musicblocks.sugarlabs.org/activities/melody-composition.html',
  ARRAY['Música', 'Creatividad'],
  'intermediate',
  8,
  16,
  '[
    {
      "id": "compose-melody",
      "title": "Componer melodía",
      "description": "Crear una melodía de 8 compases",
      "required": true,
      "points": 15,
      "completionCriteria": {"action": "melody-composed", "minCount": 1}
    }
  ]'::jsonb
);

-- Insert AR Colonial Zone
INSERT INTO external_game_configs (
  game_id, source, title, description, url, subjects, difficulty, age_range_min, age_range_max, objectives
) VALUES
(
  'ar-catedral-primada',
  'ar',
  'Catedral Primada de América',
  'Explora la primera catedral de América en realidad aumentada',
  'https://ar-js-org.github.io/AR.js/',
  ARRAY['Historia', 'Cultura Dominicana'],
  'beginner',
  8,
  18,
  '[
    {
      "id": "explore-catedral",
      "title": "Explorar la catedral",
      "description": "Visitar todos los puntos de interés",
      "required": true,
      "points": 20,
      "completionCriteria": {"action": "location-visited", "minCount": 5}
    }
  ]'::jsonb
),
(
  'ar-alcazar-colon',
  'ar',
  'Alcázar de Colón',
  'Descubre la residencia de Diego Colón en AR',
  'https://ar-js-org.github.io/AR.js/',
  ARRAY['Historia', 'Cultura Dominicana'],
  'intermediate',
  10,
  18,
  '[
    {
      "id": "discover-alcazar",
      "title": "Descubrir el Alcázar",
      "description": "Explorar todas las salas del palacio",
      "required": true,
      "points": 25,
      "completionCriteria": {"action": "room-explored", "minCount": 8}
    }
  ]'::jsonb
),
(
  'ar-fortaleza-ozama',
  'ar',
  'Fortaleza Ozama',
  'Explora la fortaleza más antigua de América',
  'https://ar-js-org.github.io/AR.js/',
  ARRAY['Historia', 'Arquitectura'],
  'advanced',
  12,
  18,
  '[
    {
      "id": "explore-fortress",
      "title": "Explorar la fortaleza",
      "description": "Recorrer toda la estructura defensiva",
      "required": true,
      "points": 30,
      "completionCriteria": {"action": "area-explored", "minCount": 10}
    }
  ]'::jsonb
);

-- Insert custom external games
INSERT INTO external_game_configs (
  game_id, source, title, description, url, subjects, difficulty, age_range_min, age_range_max, objectives
) VALUES
(
  'scratch-programming',
  'scratch',
  'Programación con Scratch',
  'Crea proyectos interactivos con programación visual',
  'https://scratch.mit.edu/projects/editor/',
  ARRAY['Programación', 'Creatividad'],
  'beginner',
  6,
  16,
  '[
    {
      "id": "create-project",
      "title": "Crear proyecto",
      "description": "Desarrollar un proyecto interactivo",
      "required": true,
      "points": 20,
      "completionCriteria": {"action": "project-saved", "minCount": 1}
    }
  ]'::jsonb
),
(
  'khan-academy-math',
  'khan',
  'Matemáticas Khan Academy',
  'Practica matemáticas con ejercicios adaptativos',
  'https://es.khanacademy.org/math',
  ARRAY['Matemáticas'],
  'beginner',
  6,
  18,
  '[
    {
      "id": "complete-exercise",
      "title": "Completar ejercicio",
      "description": "Resolver al menos 5 ejercicios",
      "required": true,
      "points": 10,
      "completionCriteria": {"action": "exercise-completed", "minCount": 5}
    }
  ]'::jsonb
);

-- Update timestamps
UPDATE external_game_configs SET updated_at = NOW();
