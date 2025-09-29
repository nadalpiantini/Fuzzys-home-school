-- Script seguro para corregir juegos educativos
-- Usa transacciones y manejo de errores

BEGIN;

-- 1. Verificar que la tabla existe y tiene la estructura correcta
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'games_pool') THEN
        RAISE EXCEPTION 'La tabla games_pool no existe';
    END IF;
    
    -- Verificar que la columna source tiene la restricción correcta
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'games_pool_source_check' 
        AND conrelid = 'public.games_pool'::regclass
    ) THEN
        RAISE EXCEPTION 'La restricción games_pool_source_check no existe';
    END IF;
    
    RAISE NOTICE 'Estructura de tabla verificada correctamente';
END $$;

-- 2. Limpiar juegos existentes con inconsistencias (solo si existen)
DELETE FROM public.games_pool WHERE source = 'ai' AND (
  title ILIKE '%genética%' AND content::text ILIKE '%digestivo%'
  OR title ILIKE '%digestivo%' AND content::text ILIKE '%genética%'
  OR title ILIKE '%genética%' AND content::text NOT ILIKE '%genética%'
  OR title ILIKE '%digestivo%' AND content::text NOT ILIKE '%digestivo%'
);

-- 3. Insertar juegos corregidos uno por uno con manejo de errores
DO $$
DECLARE
    game_count INTEGER := 0;
BEGIN
    -- Juego 1: Genética Básica
    BEGIN
        INSERT INTO public.games_pool (title, subject, grade, content, status, source, ready_at) VALUES
        ('Identifica: genética básica', 'science', '5',
        '{
          "type": "hotspot",
          "title": "Identifica: genética básica",
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
            },
            {
              "id": "gene",
              "x": 50,
              "y": 40,
              "width": 15,
              "height": 10,
              "label": "Gen",
              "explanation": "Un gen es una unidad de herencia que determina una característica",
              "correct": true
            },
            {
              "id": "chromosome",
              "x": 70,
              "y": 30,
              "width": 18,
              "height": 12,
              "label": "Cromosoma",
              "explanation": "Los cromosomas son estructuras que contienen los genes",
              "correct": true
            }
          ],
          "metadata": {
            "subject": "ciencias",
            "grade": 5,
            "estimatedTime": "3-5 minutos",
            "learningObjectives": [
              "Identificar conceptos básicos de genética",
              "Comprender la estructura del ADN",
              "Reconocer genes y cromosomas"
            ]
          },
          "theme": "genetica_basica",
          "difficulty": "medium"
        }', 'ready', 'ai', NOW());
        
        game_count := game_count + 1;
        RAISE NOTICE 'Juego 1 insertado: Genética Básica';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error insertando juego 1: %', SQLERRM;
    END;

    -- Juego 2: Sistema Digestivo
    BEGIN
        INSERT INTO public.games_pool (title, subject, grade, content, status, source, ready_at) VALUES
        ('Identifica: sistema digestivo', 'science', '5',
        '{
          "type": "hotspot",
          "title": "Identifica: sistema digestivo",
          "description": "Haz clic en las áreas correctas de la imagen para aprender sobre las partes del sistema digestivo",
          "imageUrl": "/images/digestive-system.png",
          "hotspots": [
            {
              "id": "mouth",
              "x": 25,
              "y": 30,
              "width": 15,
              "height": 12,
              "label": "Boca",
              "explanation": "La boca es donde comienza la digestión con la masticación",
              "correct": true
            },
            {
              "id": "esophagus",
              "x": 40,
              "y": 35,
              "width": 8,
              "height": 20,
              "label": "Esófago",
              "explanation": "El esófago transporta la comida desde la boca hasta el estómago",
              "correct": true
            },
            {
              "id": "stomach",
              "x": 55,
              "y": 40,
              "width": 20,
              "height": 15,
              "label": "Estómago",
              "explanation": "El estómago mezcla la comida con ácidos para digerirla",
              "correct": true
            },
            {
              "id": "intestines",
              "x": 70,
              "y": 45,
              "width": 25,
              "height": 8,
              "label": "Intestinos",
              "explanation": "Los intestinos absorben los nutrientes de la comida digerida",
              "correct": true
            }
          ],
          "metadata": {
            "subject": "ciencias",
            "grade": 5,
            "estimatedTime": "3-5 minutos",
            "learningObjectives": [
              "Identificar las partes del sistema digestivo",
              "Comprender la función de cada órgano",
              "Entender el proceso de digestión"
            ]
          },
          "theme": "sistema_digestivo",
          "difficulty": "medium"
        }', 'ready', 'ai', NOW());
        
        game_count := game_count + 1;
        RAISE NOTICE 'Juego 2 insertado: Sistema Digestivo';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error insertando juego 2: %', SQLERRM;
    END;

    -- Juego 3: Multiplicación Básica
    BEGIN
        INSERT INTO public.games_pool (title, subject, grade, content, status, source, ready_at) VALUES
        ('Multiplicación Básica', 'math', '3',
        '{
          "type": "quiz",
          "title": "Multiplicación Básica",
          "description": "Practica las tablas de multiplicar",
          "questions": [
            {
              "id": "q1",
              "question": "¿Cuánto es 3 × 4?",
              "options": ["10", "12", "14", "16"],
              "correct": 1,
              "explanation": "3 × 4 = 12. Multiplicar 3 por 4 significa sumar 3 cuatro veces: 3 + 3 + 3 + 3 = 12",
              "difficulty": "easy"
            },
            {
              "id": "q2",
              "question": "¿Cuánto es 5 × 6?",
              "options": ["25", "30", "35", "40"],
              "correct": 1,
              "explanation": "5 × 6 = 30. Multiplicar 5 por 6 significa sumar 5 seis veces: 5 + 5 + 5 + 5 + 5 + 5 = 30",
              "difficulty": "easy"
            },
            {
              "id": "q3",
              "question": "¿Cuánto es 7 × 8?",
              "options": ["54", "56", "58", "60"],
              "correct": 1,
              "explanation": "7 × 8 = 56. Multiplicar 7 por 8 significa sumar 7 ocho veces",
              "difficulty": "medium"
            }
          ],
          "metadata": {
            "subject": "matemáticas",
            "grade": 3,
            "estimatedTime": "5-10 minutos",
            "learningObjectives": [
              "Practicar las tablas de multiplicar básicas",
              "Desarrollar fluidez en multiplicación",
              "Comprender el concepto de multiplicación"
            ]
          },
          "theme": "multiplicacion_basica",
          "difficulty": "easy"
        }', 'ready', 'ai', NOW());
        
        game_count := game_count + 1;
        RAISE NOTICE 'Juego 3 insertado: Multiplicación Básica';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error insertando juego 3: %', SQLERRM;
    END;

    RAISE NOTICE 'Total de juegos insertados: %', game_count;
END $$;

-- 4. Verificar que se insertaron correctamente
SELECT 
  'games_pool' as table_name,
  COUNT(*) as total_games,
  COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_games,
  COUNT(CASE WHEN source = 'ai' THEN 1 END) as ai_games
FROM public.games_pool;

-- 5. Mostrar los juegos organizados por materia
SELECT 
  subject,
  grade,
  title,
  content->>'type' as game_type,
  content->>'difficulty' as difficulty
FROM public.games_pool 
WHERE source = 'ai'
ORDER BY subject, grade, title;

COMMIT;

