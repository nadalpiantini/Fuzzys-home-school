-- Script para corregir inconsistencias en los juegos educativos
-- Este script organiza y corrige los juegos para que el contenido coincida con los títulos

-- 1. Limpiar juegos existentes con inconsistencias
DELETE FROM public.games_pool WHERE source = 'ai' AND (
  title ILIKE '%genética%' AND content::text ILIKE '%digestivo%'
  OR title ILIKE '%digestivo%' AND content::text ILIKE '%genética%'
  OR title ILIKE '%genética%' AND content::text NOT ILIKE '%genética%'
  OR title ILIKE '%digestivo%' AND content::text NOT ILIKE '%digestivo%'
);

-- 2. Insertar juegos corregidos y organizados
INSERT INTO public.games_pool (title, subject, grade, content, status, source, ready_at) VALUES

-- JUEGOS DE CIENCIAS - GENÉTICA BÁSICA (Grado 5)
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
}', 'ready', 'ai', NOW()),

-- JUEGOS DE CIENCIAS - SISTEMA DIGESTIVO (Grado 5)
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
}', 'ready', 'ai', NOW()),

-- JUEGOS DE MATEMÁTICAS - MULTIPLICACIÓN BÁSICA (Grado 3)
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
}', 'ready', 'ai', NOW()),

-- JUEGOS DE CIENCIAS - CLASIFICACIÓN DE ANIMALES (Grado 4)
('Clasificación de Animales', 'science', '4',
'{
  "type": "dragdrop",
  "title": "Clasificación de Animales",
  "description": "Clasifica animales por sus características",
  "categories": ["Mamíferos", "Aves", "Reptiles", "Anfibios"],
  "items": [
    {
      "id": "item1",
      "text": "Perro",
      "correctCategory": 0,
      "explanation": "El perro es un mamífero porque tiene pelo y amamanta a sus crías"
    },
    {
      "id": "item2",
      "text": "Águila",
      "correctCategory": 1,
      "explanation": "El águila es un ave porque tiene plumas y puede volar"
    },
    {
      "id": "item3",
      "text": "Serpiente",
      "correctCategory": 2,
      "explanation": "La serpiente es un reptil porque tiene escamas y sangre fría"
    },
    {
      "id": "item4",
      "text": "Rana",
      "correctCategory": 3,
      "explanation": "La rana es un anfibio porque puede vivir en agua y tierra"
    }
  ],
  "metadata": {
    "subject": "ciencias",
    "grade": 4,
    "estimatedTime": "5-8 minutos",
    "learningObjectives": [
      "Clasificar animales por sus características",
      "Identificar diferencias entre grupos de animales",
      "Comprender la diversidad animal"
    ]
  },
  "theme": "clasificacion_animales",
  "difficulty": "medium"
}', 'ready', 'ai', NOW()),

-- JUEGOS DE HISTORIA - HISTORIA DOMINICANA (Grado 6)
('Historia Dominicana', 'history', '6',
'{
  "type": "truefalse",
  "title": "Historia Dominicana",
  "description": "Verdadero o falso sobre la historia de RD",
  "questions": [
    {
      "id": "q1",
      "statement": "Cristóbal Colón llegó a la isla de La Española en 1492",
      "correct": true,
      "explanation": "Cristóbal Colón llegó a la isla de La Española el 5 de diciembre de 1492",
      "difficulty": "medium"
    },
    {
      "id": "q2",
      "statement": "La República Dominicana se independizó de España en 1844",
      "correct": false,
      "explanation": "La República Dominicana se independizó de Haití en 1844, no de España",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "statement": "Juan Pablo Duarte fue uno de los Padres de la Patria",
      "correct": true,
      "explanation": "Juan Pablo Duarte, junto con Francisco del Rosario Sánchez y Ramón Matías Mella, son los Padres de la Patria",
      "difficulty": "medium"
    }
  ],
  "metadata": {
    "subject": "historia",
    "grade": 6,
    "estimatedTime": "3-5 minutos",
    "learningObjectives": [
      "Conocer eventos importantes de la historia dominicana",
      "Identificar personajes históricos clave",
      "Comprender el proceso de independencia"
    ]
  },
  "theme": "historia_dominicana",
  "difficulty": "medium"
}', 'ready', 'ai', NOW()),

-- JUEGOS DE MATEMÁTICAS - FRACCIONES (Grado 5)
('Fracciones', 'math', '5',
'{
  "type": "quiz",
  "title": "Fracciones",
  "description": "Resuelve problemas con fracciones",
  "questions": [
    {
      "id": "q1",
      "question": "¿Cuál es la fracción equivalente a 1/2?",
      "options": ["2/4", "3/6", "4/8", "Todas las anteriores"],
      "correct": 3,
      "explanation": "Todas las fracciones 2/4, 3/6 y 4/8 son equivalentes a 1/2 porque representan la misma cantidad",
      "difficulty": "hard"
    },
    {
      "id": "q2",
      "question": "Si tengo 3/4 de una pizza y como 1/4, ¿cuánto me queda?",
      "options": ["1/4", "1/2", "2/4", "3/4"],
      "correct": 1,
      "explanation": "3/4 - 1/4 = 2/4 = 1/2. Me queda la mitad de la pizza",
      "difficulty": "hard"
    }
  ],
  "metadata": {
    "subject": "matemáticas",
    "grade": 5,
    "estimatedTime": "5-10 minutos",
    "learningObjectives": [
      "Resolver problemas con fracciones",
      "Identificar fracciones equivalentes",
      "Realizar operaciones con fracciones"
    ]
  },
  "theme": "fracciones",
  "difficulty": "hard"
}', 'ready', 'ai', NOW()),

-- JUEGOS DE LENGUAJE - GRAMÁTICA ESPAÑOLA (Grado 4)
('Gramática Española', 'language', '4',
'{
  "type": "dragdrop",
  "title": "Gramática Española",
  "description": "Clasifica palabras por su función gramatical",
  "categories": ["Sustantivos", "Adjetivos", "Verbos", "Adverbios"],
  "items": [
    {
      "id": "item1",
      "text": "Casa",
      "correctCategory": 0,
      "explanation": "Casa es un sustantivo porque nombra una cosa"
    },
    {
      "id": "item2",
      "text": "Bonita",
      "correctCategory": 1,
      "explanation": "Bonita es un adjetivo porque describe cómo es algo"
    },
    {
      "id": "item3",
      "text": "Correr",
      "correctCategory": 2,
      "explanation": "Correr es un verbo porque expresa una acción"
    },
    {
      "id": "item4",
      "text": "Rápidamente",
      "correctCategory": 3,
      "explanation": "Rápidamente es un adverbio porque modifica un verbo"
    }
  ],
  "metadata": {
    "subject": "español",
    "grade": 4,
    "estimatedTime": "5-8 minutos",
    "learningObjectives": [
      "Identificar diferentes tipos de palabras",
      "Clasificar palabras por su función",
      "Comprender la estructura gramatical"
    ]
  },
  "theme": "gramatica_espanola",
  "difficulty": "medium"
}', 'ready', 'corrected', NOW());

-- 3. Verificar que se insertaron correctamente
SELECT 
  'games_pool' as table_name,
  COUNT(*) as total_games,
  COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_games,
  COUNT(CASE WHEN source = 'ai' THEN 1 END) as ai_games
FROM public.games_pool;

-- 4. Mostrar los juegos organizados por materia
SELECT 
  subject,
  grade,
  title,
  content->>'type' as game_type,
  content->>'difficulty' as difficulty
FROM public.games_pool 
WHERE source = 'ai'
ORDER BY subject, grade, title;
