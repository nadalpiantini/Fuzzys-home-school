-- Fix hash conflict - eliminar duplicados y reinsertar
-- Este script maneja el caso donde ya existen juegos con el mismo hash

-- 1. Primero, eliminar juegos existentes que puedan causar conflicto
DELETE FROM public.games_pool WHERE source = 'seed';

-- 2. Insertar los juegos semilla con contenido único
INSERT INTO public.games_pool (title, subject, grade, content, status, source, ready_at) VALUES

-- Juego 1: Sumas del Colmado (Matemáticas K-2)
('Sumas del Colmado', 'math', 'K-2', 
'{
  "type": "quiz",
  "questions": [
    {
      "id": 1,
      "question": "En el colmado, María compró 3 mangos y 2 naranjas. ¿Cuántas frutas compró en total?",
      "options": ["4", "5", "6", "7"],
      "correct": 1,
      "explanation": "3 + 2 = 5 frutas en total"
    },
    {
      "id": 2,
      "question": "José tiene 4 dulces y su mamá le da 3 más. ¿Cuántos dulces tiene ahora?",
      "options": ["6", "7", "8", "9"],
      "correct": 1,
      "explanation": "4 + 3 = 7 dulces"
    }
  ],
  "theme": "colmado",
  "difficulty": "easy",
  "version": "1.0"
}', 'ready', 'seed', NOW()),

-- Juego 2: Rally del Barrio (Ciencias Sociales 3-4)
('Rally del Barrio', 'social', '3-4',
'{
  "type": "scavenger",
  "missions": [
    {
      "id": 1,
      "title": "Encuentra la iglesia",
      "description": "Busca el lugar donde la gente va a rezar los domingos",
      "clue": "Tiene una cruz en el techo",
      "points": 10
    },
    {
      "id": 2,
      "title": "Visita el colmado",
      "description": "Ve al lugar donde compran las cosas del día a día",
      "clue": "Aquí venden pan y leche",
      "points": 10
    }
  ],
  "theme": "barrio",
  "difficulty": "medium",
  "version": "1.0"
}', 'ready', 'seed', NOW()),

-- Juego 3: Sílabas con Sancocho (Lengua 1-2)
('Sílabas con Sancocho', 'language', '1-2',
'{
  "type": "sorting",
  "words": [
    {
      "word": "san-co-cho",
      "syllables": ["san", "co", "cho"],
      "image": "🍲"
    },
    {
      "word": "ma-ma",
      "syllables": ["ma", "ma"],
      "image": "👩"
    },
    {
      "word": "pa-pa",
      "syllables": ["pa", "pa"],
      "image": "👨"
    }
  ],
  "theme": "familia",
  "difficulty": "easy",
  "version": "1.0"
}', 'ready', 'seed', NOW()),

-- Juego 4: Mapa RD Básico (Geografía 3-5)
('Mapa RD Básico', 'geo', '3-5',
'{
  "type": "map",
  "regions": [
    {
      "name": "Santo Domingo",
      "capital": true,
      "position": {"x": 200, "y": 150},
      "fact": "Capital de República Dominicana"
    },
    {
      "name": "Santiago",
      "capital": false,
      "position": {"x": 150, "y": 100},
      "fact": "Ciudad del Cibao"
    }
  ],
  "theme": "republica_dominicana",
  "difficulty": "medium",
  "version": "1.0"
}', 'ready', 'seed', NOW()),

-- Juego 5: Energía y Sol (Ciencias 3-5)
('Energía y Sol', 'science', '3-5',
'{
  "type": "cards",
  "cards": [
    {
      "front": "¿Qué nos da el sol?",
      "back": "Luz y calor",
      "category": "energia"
    },
    {
      "front": "¿Qué hacen las plantas con la luz del sol?",
      "back": "Hacen su comida (fotosíntesis)",
      "category": "plantas"
    }
  ],
  "theme": "energia_solar",
  "difficulty": "medium",
  "version": "1.0"
}', 'ready', 'seed', NOW()),

-- Juego 6: Fracciones con Pizza (Matemáticas 3-5)
('Fracciones con Pizza', 'math', '3-5',
'{
  "type": "visual",
  "problems": [
    {
      "question": "Si cortamos una pizza en 4 pedazos iguales y comemos 2, ¿qué fracción comimos?",
      "visual": "🍕🍕🍕🍕",
      "answer": "2/4 o 1/2",
      "explanation": "Comimos 2 de 4 pedazos, que es la mitad"
    }
  ],
  "theme": "pizza",
  "difficulty": "medium",
  "version": "1.0"
}', 'ready', 'seed', NOW()),

-- Juego 7: Dichos Dominicanos (Lengua 3-6)
('Dichos Dominicanos', 'language', '3-6',
'{
  "type": "match",
  "pairs": [
    {
      "dicho": "Más vale pájaro en mano",
      "significado": "Es mejor tener algo seguro que esperar algo mejor",
      "image": "🐦"
    },
    {
      "dicho": "El que madruga",
      "significado": "El que se levanta temprano tiene ventaja",
      "image": "🌅"
    }
  ],
  "theme": "cultura_dominicana",
  "difficulty": "medium",
  "version": "1.0"
}', 'ready', 'seed', NOW());

-- 3. Verificar que se insertaron correctamente
SELECT 
  'games_pool' as table_name,
  COUNT(*) as total_games,
  COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_games,
  COUNT(CASE WHEN source = 'seed' THEN 1 END) as seed_games
FROM public.games_pool;
