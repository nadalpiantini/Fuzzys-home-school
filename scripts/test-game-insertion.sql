-- Script de prueba para verificar la inserción de juegos corregidos
-- Este script prueba la inserción de un solo juego para verificar que no hay errores

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'games_pool' 
ORDER BY ordinal_position;

-- Verificar las restricciones de la tabla
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.games_pool'::regclass;

-- Probar inserción de un solo juego
INSERT INTO public.games_pool (title, subject, grade, content, status, source, ready_at) VALUES
('Test: genética básica', 'science', '5',
'{
  "type": "hotspot",
  "title": "Test: genética básica",
  "description": "Haz clic en las áreas correctas de la imagen para aprender sobre conceptos clave de genética",
  "imageUrl": "/images/genetics-diagram.png",
  "hotspots": [
    {
      "id": "dna",
      "x": 30,
      "y": 25,
      "width": 20,
      "height": 15,
      "label": "ADN",
      "explanation": "El ADN contiene toda la información genética de un organismo",
      "correct": true
    }
  ],
  "metadata": {
    "subject": "ciencias",
    "grade": 5,
    "estimatedTime": "3-5 minutos",
    "learningObjectives": [
      "Identificar conceptos básicos de genética",
      "Comprender la estructura del ADN"
    ]
  },
  "theme": "genetica_basica",
  "difficulty": "medium"
}', 'ready', 'ai', NOW());

-- Verificar que se insertó correctamente
SELECT 
  id,
  title,
  subject,
  grade,
  status,
  source,
  content->>'type' as game_type,
  content->>'difficulty' as difficulty
FROM public.games_pool 
WHERE title = 'Test: genética básica';

-- Limpiar el juego de prueba
DELETE FROM public.games_pool WHERE title = 'Test: genética básica';

