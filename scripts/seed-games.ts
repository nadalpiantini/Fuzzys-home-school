#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Seed data
const subjects = [
  { code: 'math', name: 'Matemáticas', icon: '🧮', color: '#3b82f6' },
  { code: 'spanish', name: 'Lengua Española', icon: '📚', color: '#ef4444' },
  { code: 'science', name: 'Ciencias Naturales', icon: '🔬', color: '#10b981' },
  { code: 'history', name: 'Historia', icon: '🏛️', color: '#f59e0b' },
  { code: 'geography', name: 'Geografía', icon: '🗺️', color: '#8b5cf6' },
  { code: 'art', name: 'Arte', icon: '🎨', color: '#ec4899' },
  { code: 'music', name: 'Música', icon: '🎵', color: '#14b8a6' },
  { code: 'pe', name: 'Educación Física', icon: '⚽', color: '#f97316' }
];

const games = [
  {
    title: 'Quiz de Matemáticas',
    description: 'Resuelve problemas matemáticos básicos',
    type: 'quiz',
    difficulty: 'easy',
    grade_level: 3,
    time_limit: 600,
    points: 100,
    is_active: true,
    data: {
      questions: [
        {
          question: '¿Cuánto es 2 + 3?',
          options: ['4', '5', '6', '7'],
          correct: 1,
          explanation: '2 + 3 = 5'
        },
        {
          question: '¿Cuánto es 8 - 3?',
          options: ['4', '5', '6', '7'],
          correct: 1,
          explanation: '8 - 3 = 5'
        }
      ]
    }
  },
  {
    title: 'Memoria de Palabras',
    description: 'Encuentra las parejas de palabras',
    type: 'memory-cards',
    difficulty: 'easy',
    grade_level: 2,
    time_limit: 300,
    points: 80,
    is_active: true,
    data: {
      pairs: [
        ['gato', 'cat'],
        ['perro', 'dog'],
        ['casa', 'house'],
        ['agua', 'water']
      ]
    }
  },
  {
    title: 'Sopa de Letras - Animales',
    description: 'Encuentra los nombres de animales escondidos',
    type: 'word-search',
    difficulty: 'medium',
    grade_level: 4,
    time_limit: 900,
    points: 120,
    is_active: true,
    data: {
      words: ['LEON', 'TIGRE', 'OSO', 'GATO', 'PERRO'],
      grid_size: 10
    }
  },
  {
    title: 'Rompecabezas - Mapa de Argentina',
    description: 'Arma el mapa de Argentina',
    type: 'puzzle',
    difficulty: 'hard',
    grade_level: 5,
    time_limit: 1200,
    points: 150,
    is_active: true,
    data: {
      pieces: 24,
      image: 'argentina_map.jpg'
    }
  },
  {
    title: 'Historia Colonial - Línea de Tiempo',
    description: 'Ordena los eventos de la época colonial',
    type: 'timeline',
    difficulty: 'medium',
    grade_level: 6,
    time_limit: 800,
    points: 130,
    is_active: true,
    data: {
      events: [
        { year: 1536, event: 'Primera fundación de Buenos Aires' },
        { year: 1580, event: 'Segunda fundación de Buenos Aires' },
        { year: 1776, event: 'Creación del Virreinato del Río de la Plata' },
        { year: 1810, event: 'Revolución de Mayo' }
      ]
    }
  }
];

const achievements = [
  {
    name: 'Primer Paso',
    description: 'Completa tu primer juego',
    icon: '🎯',
    category: 'inicio',
    points: 10,
    criteria: {
      type: 'complete_games',
      value: 1
    }
  },
  {
    name: 'Matemático',
    description: 'Completa 5 juegos de matemáticas',
    icon: '🧮',
    category: 'materia',
    points: 50,
    criteria: {
      type: 'complete_subject_games',
      subject: 'math',
      value: 5
    }
  },
  {
    name: 'Explorador',
    description: 'Visita 3 puntos del Rally Colonial',
    icon: '🗺️',
    category: 'rally',
    points: 75,
    criteria: {
      type: 'colonial_points_visited',
      value: 3
    }
  },
  {
    name: 'Perfeccionista',
    description: 'Obtén puntuación perfecta en 3 juegos',
    icon: '⭐',
    category: 'rendimiento',
    points: 100,
    criteria: {
      type: 'perfect_scores',
      value: 3
    }
  }
];

const colonialRallyPoints = [
  {
    name: 'Casa de Tucumán',
    description: 'Lugar donde se declaró la independencia argentina',
    latitude: -26.8241,
    longitude: -65.2226,
    points: 100,
    difficulty: 'medium',
    order_index: 1,
    qr_code: 'CASA_TUCUMAN_001',
    historical_period: 'Independencia',
    challenge: {
      type: 'quiz',
      question: '¿En qué año se declaró la independencia argentina?',
      options: ['1810', '1816', '1820', '1825'],
      correct: 1
    },
    hints: [
      'Busca la fecha en la placa conmemorativa',
      'El día fue el 9 de julio'
    ],
    educational_content: 'La Casa de Tucumán fue el lugar donde se declaró la independencia argentina el 9 de julio de 1816.',
    is_active: true
  },
  {
    name: 'Cabildo de Buenos Aires',
    description: 'Sede del gobierno colonial en Buenos Aires',
    latitude: -34.6079,
    longitude: -58.3731,
    points: 80,
    difficulty: 'easy',
    order_index: 2,
    qr_code: 'CABILDO_BA_002',
    historical_period: 'Colonial',
    challenge: {
      type: 'photo',
      instruction: 'Toma una foto del frente del Cabildo',
      landmarks: ['torre', 'arcos', 'balcón']
    },
    hints: [
      'El edificio tiene una torre con campanario',
      'Busca los arcos característicos del frente'
    ],
    educational_content: 'El Cabildo fue la sede del gobierno colonial y lugar donde ocurrió la Revolución de Mayo de 1810.',
    is_active: true
  },
  {
    name: 'Plaza de Mayo',
    description: 'Corazón político de Argentina',
    latitude: -34.6083,
    longitude: -58.3712,
    points: 90,
    difficulty: 'medium',
    order_index: 3,
    qr_code: 'PLAZA_MAYO_003',
    historical_period: 'Moderna',
    challenge: {
      type: 'ar_hunt',
      objects: ['pirámide', 'estatua', 'fuente'],
      clues: ['Busca el monumento más alto', 'Encuentra la pirámide de Mayo']
    },
    hints: [
      'La Pirámide de Mayo está en el centro',
      'Fue el primer monumento patrio del país'
    ],
    educational_content: 'La Plaza de Mayo es el corazón político de Argentina, testigo de los principales eventos históricos del país.',
    is_active: true
  }
];

async function seedDatabase() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  try {
    // 1. Seed subjects
    console.log('📚 Insertando materias...');
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .upsert(subjects, { onConflict: 'code' })
      .select();

    if (subjectsError) throw subjectsError;
    console.log(`✅ ${subjectsData.length} materias insertadas`);

    // 2. Seed games with subject relationships
    console.log('\n🎮 Insertando juegos...');

    // Get subjects to map codes to IDs
    const { data: allSubjects, error: subjectsError2 } = await supabase
      .from('subjects')
      .select('id, code');

    if (subjectsError2) throw subjectsError2;

    // Map games to subjects (assign random subjects for now)
    const gamesWithSubjects = games.map((game, index) => ({
      ...game,
      subject_id: allSubjects[index % allSubjects.length]?.id || null
    }));

    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .insert(gamesWithSubjects)
      .select();

    if (gamesError) throw gamesError;
    console.log(`✅ ${gamesData.length} juegos insertados`);

    // 3. Seed achievements
    console.log('\n🏆 Insertando logros...');
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('achievements')
      .insert(achievements)
      .select();

    if (achievementsError) throw achievementsError;
    console.log(`✅ ${achievementsData.length} logros insertados`);

    // 4. Seed colonial rally points
    console.log('\n🗺️ Insertando puntos del Rally Colonial...');
    const { data: rallyData, error: rallyError } = await supabase
      .from('colonial_rally_points')
      .insert(colonialRallyPoints)
      .select();

    if (rallyError) throw rallyError;
    console.log(`✅ ${rallyData.length} puntos del Rally Colonial insertados`);

    console.log('\n🎉 ¡Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   • ${subjectsData.length} materias`);
    console.log(`   • ${gamesData.length} juegos educativos`);
    console.log(`   • ${achievementsData.length} logros`);
    console.log(`   • ${rallyData.length} puntos del Rally Colonial`);
    console.log('\n🚀 La plataforma está lista para usar!');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Execute seed
if (require.main === module) {
  seedDatabase();
}