import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to generate game content using DeepSeek API
async function generateGameContent(type: string, subject: string, difficulty: string, gradeLevel: number) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Eres un educador experto creando contenido educativo en español para estudiantes argentinos de ${gradeLevel}° grado.`
          },
          {
            role: 'user',
            content: `Crea un juego educativo de tipo "${type}" sobre "${subject}" con dificultad "${difficulty}".
            El contenido debe ser apropiado para ${gradeLevel}° grado y culturalmente relevante para Argentina.
            Devuelve SOLO un objeto JSON válido con la estructura apropiada para el tipo de juego.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating content with DeepSeek:', error);
    return null;
  }
}

// Game data generators for each type
const gameGenerators = {
  quiz: (subject: string, gradeLevel: number) => ({
    questions: [
      {
        id: '1',
        question: subject === 'math' ? '¿Cuánto es 15 × 6?' : '¿Cuál es la capital de la provincia de Buenos Aires?',
        options: subject === 'math' ? ['80', '90', '85', '95'] : ['Buenos Aires', 'La Plata', 'Mar del Plata', 'Bahía Blanca'],
        correct: 1,
        explanation: subject === 'math' ? '15 × 6 = 90' : 'La Plata es la capital de la provincia de Buenos Aires'
      },
      {
        id: '2',
        question: subject === 'math' ? 'Si tengo $250 y gasto $175, ¿cuánto me queda?' : '¿En qué año San Martín cruzó los Andes?',
        options: subject === 'math' ? ['$65', '$75', '$85', '$95'] : ['1814', '1815', '1816', '1817'],
        correct: 1,
        explanation: subject === 'math' ? '$250 - $175 = $75' : 'El Cruce de los Andes fue en 1817'
      },
      {
        id: '3',
        question: subject === 'math' ? '¿Cuál es el perímetro de un rectángulo de 8m × 5m?' : '¿Cuál es el río más largo de Argentina?',
        options: subject === 'math' ? ['26m', '13m', '40m', '32m'] : ['Paraná', 'Uruguay', 'Colorado', 'Negro'],
        correct: 0,
        explanation: subject === 'math' ? 'Perímetro = 2(8+5) = 26m' : 'El río Paraná es el más largo de Argentina'
      }
    ]
  }),

  'memory-cards': (subject: string) => ({
    pairs: subject === 'math' ? [
      { id: '1', content: '5 × 5', match: '25' },
      { id: '2', content: '7 × 8', match: '56' },
      { id: '3', content: '9 × 9', match: '81' },
      { id: '4', content: '6 × 7', match: '42' },
      { id: '5', content: '8 × 8', match: '64' },
      { id: '6', content: '4 × 9', match: '36' }
    ] : [
      { id: '1', content: 'Buenos Aires', match: 'Capital Federal' },
      { id: '2', content: 'Córdoba', match: 'La Docta' },
      { id: '3', content: 'Rosario', match: 'Cuna de la Bandera' },
      { id: '4', content: 'Mendoza', match: 'Tierra del Sol y del Vino' },
      { id: '5', content: 'Tucumán', match: 'Jardín de la República' },
      { id: '6', content: 'Salta', match: 'La Linda' }
    ]
  }),

  'word-search': (subject: string) => ({
    words: subject === 'science' ?
      ['CELULA', 'ATOMO', 'MOLECULA', 'ENERGIA', 'FOTOSINTESIS', 'ECOSISTEMA', 'GENETICA', 'EVOLUCION'] :
      ['SARMIENTO', 'BELGRANO', 'MORENO', 'RIVADAVIA', 'ALBERDI', 'MITRE', 'ROCA', 'YRIGOYEN'],
    gridSize: 12,
    theme: subject === 'science' ? 'Conceptos de Ciencias' : 'Próceres Argentinos'
  }),

  crossword: () => ({
    grid: 10,
    clues: {
      horizontal: [
        { number: 1, clue: 'Capital de Córdoba', answer: 'CORDOBA', row: 0, col: 0 },
        { number: 3, clue: 'Moneda argentina', answer: 'PESO', row: 2, col: 2 },
        { number: 5, clue: 'Baile típico argentino', answer: 'TANGO', row: 4, col: 1 }
      ],
      vertical: [
        { number: 2, clue: 'Bebida típica argentina', answer: 'MATE', row: 0, col: 3 },
        { number: 4, clue: 'Equipo de fútbol de La Boca', answer: 'BOCA', row: 1, col: 5 }
      ]
    }
  }),

  puzzle: () => ({
    pieces: 16,
    image: '/images/puzzles/argentina-map.jpg',
    timeLimit: 300,
    hints: ['Empezá por los bordes', 'Buscá las provincias grandes primero', 'El norte es marrón por las montañas']
  }),

  'drag-drop': (subject: string) => ({
    items: subject === 'math' ? [
      { id: '1', content: '1/2', category: 'fracciones' },
      { id: '2', content: '0.5', category: 'decimales' },
      { id: '3', content: '50%', category: 'porcentajes' },
      { id: '4', content: '3/4', category: 'fracciones' },
      { id: '5', content: '0.75', category: 'decimales' },
      { id: '6', content: '75%', category: 'porcentajes' }
    ] : [
      { id: '1', content: 'Fotosíntesis', category: 'plantas' },
      { id: '2', content: 'Respiración', category: 'animales' },
      { id: '3', content: 'Clorofila', category: 'plantas' },
      { id: '4', content: 'Pulmones', category: 'animales' },
      { id: '5', content: 'Raíces', category: 'plantas' },
      { id: '6', content: 'Corazón', category: 'animales' }
    ],
    categories: subject === 'math' ? ['fracciones', 'decimales', 'porcentajes'] : ['plantas', 'animales']
  }),

  'fill-blanks': (subject: string) => ({
    text: subject === 'language' ?
      'El general José de San Martín nació en _____ en el año _____. Fue el libertador de _____, Chile y _____.' :
      'La fotosíntesis es el proceso por el cual las _____ convierten la luz solar en _____. Este proceso ocurre en los _____ y produce _____ como subproducto.',
    blanks: subject === 'language' ?
      ['Yapeyú', '1778', 'Argentina', 'Perú'] :
      ['plantas', 'energía', 'cloroplastos', 'oxígeno']
  }),

  matching: () => ({
    leftColumn: [
      { id: '1', content: 'Revolución de Mayo' },
      { id: '2', content: 'Declaración de Independencia' },
      { id: '3', content: 'Batalla de Caseros' },
      { id: '4', content: 'Ley 1420' }
    ],
    rightColumn: [
      { id: 'a', content: '1810' },
      { id: 'b', content: '1816' },
      { id: 'c', content: '1852' },
      { id: 'd', content: '1884' }
    ],
    matches: { '1': 'a', '2': 'b', '3': 'c', '4': 'd' }
  }),

  timeline: () => ({
    events: [
      { id: '1', year: 1810, title: 'Revolución de Mayo', description: 'Primer gobierno patrio' },
      { id: '2', year: 1816, title: 'Independencia', description: 'Declaración en Tucumán' },
      { id: '3', year: 1852, title: 'Caseros', description: 'Caída de Rosas' },
      { id: '4', year: 1880, title: 'Federalización', description: 'Buenos Aires capital federal' },
      { id: '5', year: 1912, title: 'Ley Sáenz Peña', description: 'Voto universal masculino' }
    ],
    startYear: 1800,
    endYear: 1920
  }),

  'map-quiz': () => ({
    mapType: 'argentina-provinces',
    questions: [
      { id: '1', question: 'Señalá la provincia de Mendoza', answer: 'mendoza' },
      { id: '2', question: 'Señalá la provincia de Misiones', answer: 'misiones' },
      { id: '3', question: '¿Dónde está Tierra del Fuego?', answer: 'tierra-del-fuego' },
      { id: '4', question: 'Ubicá la provincia de Salta', answer: 'salta' }
    ]
  })
};

// Seed data for all game types
async function seedGames() {
  console.log('🎮 Starting game seeding...');

  // Get subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*');

  if (!subjects) {
    console.error('No subjects found. Please run migrations first.');
    return;
  }

  const games = [
    // Math games
    {
      title: 'Quiz de Matemáticas - Multiplicación',
      description: 'Practica las tablas de multiplicar del 1 al 10',
      type: 'quiz',
      subject_id: subjects.find(s => s.code === 'math')?.id,
      difficulty: 'easy',
      grade_level: 3,
      data: gameGenerators.quiz('math', 3),
      instructions: 'Responde todas las preguntas correctamente',
      time_limit: 180,
      points: 100
    },
    {
      title: 'Memoria Matemática',
      description: 'Encuentra los pares de operaciones y resultados',
      type: 'memory-cards',
      subject_id: subjects.find(s => s.code === 'math')?.id,
      difficulty: 'medium',
      grade_level: 4,
      data: gameGenerators['memory-cards']('math'),
      instructions: 'Da vuelta las cartas y encuentra todos los pares',
      points: 150
    },
    {
      title: 'Fracciones y Decimales',
      description: 'Clasifica números en sus categorías correctas',
      type: 'drag-drop',
      subject_id: subjects.find(s => s.code === 'math')?.id,
      difficulty: 'medium',
      grade_level: 5,
      data: gameGenerators['drag-drop']('math'),
      instructions: 'Arrastra cada número a su categoría correcta',
      points: 120
    },

    // Language games
    {
      title: 'Completar la Historia',
      description: 'Completa los espacios en blanco sobre San Martín',
      type: 'fill-blanks',
      subject_id: subjects.find(s => s.code === 'language')?.id,
      difficulty: 'easy',
      grade_level: 4,
      data: gameGenerators['fill-blanks']('language'),
      instructions: 'Escribe las palabras correctas en los espacios vacíos',
      points: 80
    },
    {
      title: 'Sopa de Próceres',
      description: 'Encuentra los nombres de los próceres argentinos',
      type: 'word-search',
      subject_id: subjects.find(s => s.code === 'language')?.id,
      difficulty: 'medium',
      grade_level: 5,
      data: gameGenerators['word-search']('history'),
      instructions: 'Encuentra todas las palabras ocultas en la sopa de letras',
      time_limit: 300,
      points: 100
    },

    // Science games
    {
      title: 'Conceptos Científicos',
      description: 'Busca términos importantes de ciencias naturales',
      type: 'word-search',
      subject_id: subjects.find(s => s.code === 'science')?.id,
      difficulty: 'hard',
      grade_level: 6,
      data: gameGenerators['word-search']('science'),
      instructions: 'Encuentra todos los conceptos científicos',
      time_limit: 420,
      points: 150
    },
    {
      title: 'Plantas vs Animales',
      description: 'Clasifica características de plantas y animales',
      type: 'drag-drop',
      subject_id: subjects.find(s => s.code === 'science')?.id,
      difficulty: 'easy',
      grade_level: 3,
      data: gameGenerators['drag-drop']('science'),
      instructions: 'Arrastra cada característica a la categoría correcta',
      points: 90
    },
    {
      title: 'La Fotosíntesis',
      description: 'Completa el texto sobre el proceso de fotosíntesis',
      type: 'fill-blanks',
      subject_id: subjects.find(s => s.code === 'science')?.id,
      difficulty: 'medium',
      grade_level: 5,
      data: gameGenerators['fill-blanks']('science'),
      instructions: 'Completa los espacios con las palabras correctas',
      points: 100
    },

    // Social studies games
    {
      title: 'Quiz de Historia Argentina',
      description: 'Pon a prueba tus conocimientos de historia',
      type: 'quiz',
      subject_id: subjects.find(s => s.code === 'social')?.id,
      difficulty: 'medium',
      grade_level: 5,
      data: gameGenerators.quiz('history', 5),
      instructions: 'Elige la respuesta correcta para cada pregunta',
      time_limit: 240,
      points: 120
    },
    {
      title: 'Ciudades Argentinas',
      description: 'Empareja las ciudades con sus apodos',
      type: 'memory-cards',
      subject_id: subjects.find(s => s.code === 'social')?.id,
      difficulty: 'medium',
      grade_level: 4,
      data: gameGenerators['memory-cards']('geography'),
      instructions: 'Encuentra los pares de ciudades y apodos',
      points: 110
    },
    {
      title: 'Crucigrama Argentino',
      description: 'Resuelve el crucigrama sobre cultura argentina',
      type: 'crossword',
      subject_id: subjects.find(s => s.code === 'social')?.id,
      difficulty: 'hard',
      grade_level: 6,
      data: gameGenerators.crossword(),
      instructions: 'Completa todas las palabras usando las pistas',
      time_limit: 600,
      points: 200
    },
    {
      title: 'Fechas Históricas',
      description: 'Conecta los eventos con sus fechas',
      type: 'matching',
      subject_id: subjects.find(s => s.code === 'social')?.id,
      difficulty: 'medium',
      grade_level: 5,
      data: gameGenerators.matching(),
      instructions: 'Une cada evento histórico con su fecha correcta',
      points: 100
    },
    {
      title: 'Línea de Tiempo Argentina',
      description: 'Ordena los eventos históricos cronológicamente',
      type: 'timeline',
      subject_id: subjects.find(s => s.code === 'social')?.id,
      difficulty: 'hard',
      grade_level: 6,
      data: gameGenerators.timeline(),
      instructions: 'Arrastra los eventos a su posición correcta en la línea de tiempo',
      time_limit: 360,
      points: 180
    },
    {
      title: 'Mapa de Provincias',
      description: 'Identifica las provincias argentinas en el mapa',
      type: 'map-quiz',
      subject_id: subjects.find(s => s.code === 'social')?.id,
      difficulty: 'medium',
      grade_level: 4,
      data: gameGenerators['map-quiz'](),
      instructions: 'Señala cada provincia que se te pide en el mapa',
      points: 150
    },
    {
      title: 'Rompecabezas de Argentina',
      description: 'Arma el mapa de Argentina',
      type: 'puzzle',
      subject_id: subjects.find(s => s.code === 'social')?.id,
      difficulty: 'easy',
      grade_level: 3,
      data: gameGenerators.puzzle(),
      instructions: 'Arrastra las piezas para completar el mapa',
      points: 100
    }
  ];

  // Insert games
  for (const game of games) {
    const { error } = await supabase
      .from('games')
      .insert(game as any);

    if (error) {
      console.error(`Error inserting game "${game.title}":`, error);
    } else {
      console.log(`✅ Created game: ${game.title}`);
    }
  }

  console.log('🎮 Game seeding completed!');
}

// Seed Colonial Rally points
async function seedColonialRally() {
  console.log('🗺️ Starting Colonial Rally seeding...');

  const rallyPoints = [
    {
      name: 'Casa de Tucumán',
      description: 'La casa histórica donde se declaró la Independencia Argentina',
      latitude: -26.8285,
      longitude: -65.2038,
      qr_code: 'TUCUMAN-CASA-001',
      historical_period: 'Independencia (1816)',
      difficulty: 'easy',
      points: 100,
      challenge: {
        type: 'quiz',
        question: '¿En qué fecha se declaró la Independencia?',
        options: ['25 de mayo de 1810', '9 de julio de 1816', '20 de junio de 1820', '1 de mayo de 1853'],
        correct: 1,
        explanation: 'El 9 de julio de 1816 se declaró la Independencia en San Miguel de Tucumán'
      },
      ar_content: {
        model: 'flag-3d',
        animation: 'wave',
        overlay: 'Aquí se firmó el Acta de la Independencia'
      },
      hints: [
        'Piensa en el mes del invierno',
        'Es una fecha que se celebra todos los años',
        'El mes empieza con J'
      ],
      educational_content: 'En esta casa, los representantes de las Provincias Unidas del Río de la Plata declararon la independencia de España y de toda dominación extranjera.',
      order_index: 1
    },
    {
      name: 'Cabildo de Buenos Aires',
      description: 'Centro neurálgico de la Revolución de Mayo',
      latitude: -34.6087,
      longitude: -58.3731,
      qr_code: 'CABILDO-BA-001',
      historical_period: 'Revolución de Mayo (1810)',
      difficulty: 'medium',
      points: 150,
      challenge: {
        type: 'puzzle',
        question: 'Ordena los días de la Semana de Mayo',
        events: [
          '18 de mayo - Llegada de noticias',
          '22 de mayo - Cabildo abierto',
          '24 de mayo - Renuncia del virrey',
          '25 de mayo - Primera Junta'
        ],
        correctOrder: [0, 1, 2, 3]
      },
      ar_content: {
        model: 'cabildo-3d',
        animation: 'rotate',
        overlay: 'Aquí se gestó el primer gobierno patrio'
      },
      hints: [
        'Todo empezó con las noticias de España',
        'El cabildo abierto fue crucial',
        'El 25 es la fecha más importante'
      ],
      educational_content: 'El Cabildo fue el escenario de los acontecimientos de la Semana de Mayo de 1810, que culminaron con la formación del primer gobierno patrio.',
      order_index: 2
    },
    {
      name: 'Monumento a la Bandera (Rosario)',
      description: 'Homenaje a la creación de la bandera nacional',
      latitude: -32.9476,
      longitude: -60.6304,
      qr_code: 'BANDERA-ROS-001',
      historical_period: 'Creación de la Bandera (1812)',
      difficulty: 'easy',
      points: 100,
      challenge: {
        type: 'trivia',
        question: '¿Quién creó la bandera argentina?',
        options: ['José de San Martín', 'Manuel Belgrano', 'Mariano Moreno', 'Juan José Castelli'],
        correct: 1,
        explanation: 'Manuel Belgrano creó la bandera el 27 de febrero de 1812'
      },
      ar_content: {
        model: 'bandera-3d',
        animation: 'wave',
        overlay: 'Aquí Belgrano izó por primera vez la bandera'
      },
      hints: [
        'Su apellido empieza con B',
        'También fue militar y economista',
        'Tiene un importante premio con su nombre'
      ],
      educational_content: 'A orillas del río Paraná, Manuel Belgrano izó por primera vez la bandera celeste y blanca que se convertiría en símbolo nacional.',
      order_index: 3
    },
    {
      name: 'Vuelta de Obligado',
      description: 'Batalla por la soberanía nacional',
      latitude: -33.5751,
      longitude: -59.7939,
      qr_code: 'OBLIGADO-001',
      historical_period: 'Confederación (1845)',
      difficulty: 'hard',
      points: 200,
      challenge: {
        type: 'matching',
        question: 'Conecta los elementos de la batalla',
        leftColumn: [
          'Fecha de la batalla',
          'Líder argentino',
          'Enemigos',
          'Resultado'
        ],
        rightColumn: [
          '20 de noviembre de 1845',
          'Lucio Mansilla',
          'Anglo-franceses',
          'Victoria moral argentina'
        ],
        matches: { '0': '0', '1': '1', '2': '2', '3': '3' }
      },
      ar_content: {
        model: 'batalla-3d',
        animation: 'battle-scene',
        overlay: 'Defensa heroica de la soberanía'
      },
      hints: [
        'Fue en el mes de noviembre',
        'Los enemigos venían de Europa',
        'Aunque perdimos, ganamos respeto'
      ],
      educational_content: 'En la Vuelta de Obligado, las fuerzas argentinas defendieron heroicamente la soberanía nacional contra la intervención anglo-francesa.',
      order_index: 4
    },
    {
      name: 'Plaza de Mayo',
      description: 'Corazón político e histórico de Argentina',
      latitude: -34.6081,
      longitude: -58.3713,
      qr_code: 'PLAZA-MAYO-001',
      historical_period: 'Múltiples períodos',
      difficulty: 'medium',
      points: 150,
      challenge: {
        type: 'scavenger',
        question: 'Encuentra estos monumentos en la plaza',
        items: [
          'Pirámide de Mayo',
          'Casa Rosada',
          'Catedral Metropolitana',
          'Cabildo'
        ],
        requiredItems: 3
      },
      ar_content: {
        model: 'plaza-3d',
        animation: 'historical-overlay',
        overlay: '200 años de historia argentina'
      },
      hints: [
        'La Pirámide está en el centro',
        'La Casa Rosada es rosa',
        'Busca la iglesia más grande'
      ],
      educational_content: 'La Plaza de Mayo ha sido testigo de los acontecimientos más importantes de la historia argentina, desde 1810 hasta la actualidad.',
      order_index: 5
    },
    {
      name: 'Museo del Bicentenario',
      description: 'Aduana Taylor y la historia económica',
      latitude: -34.6097,
      longitude: -58.3707,
      qr_code: 'MUSEO-BIC-001',
      historical_period: 'Siglos XIX-XXI',
      difficulty: 'medium',
      points: 125,
      challenge: {
        type: 'timeline',
        question: 'Ordena estos presidentes cronológicamente',
        events: [
          'Bartolomé Mitre',
          'Domingo F. Sarmiento',
          'Julio A. Roca',
          'Hipólito Yrigoyen'
        ],
        correctOrder: [0, 1, 2, 3]
      },
      ar_content: {
        model: 'museo-3d',
        animation: 'exhibit-tour',
        overlay: 'Recorre 200 años de historia'
      },
      hints: [
        'Mitre fue el primero',
        'Sarmiento fue el maestro',
        'Yrigoyen fue radical'
      ],
      educational_content: 'El museo preserva la memoria de los 200 años de historia argentina a través de objetos, documentos y testimonios.',
      order_index: 6
    },
    {
      name: 'Quinta de Olivos',
      description: 'Residencia presidencial histórica',
      latitude: -34.5073,
      longitude: -58.4883,
      qr_code: 'QUINTA-OLI-001',
      historical_period: 'República moderna',
      difficulty: 'easy',
      points: 100,
      challenge: {
        type: 'photo',
        task: 'Toma una foto creativa del lugar',
        requirements: ['Incluir elementos históricos', 'Mostrar arquitectura', 'Capturar el ambiente']
      },
      ar_content: {
        model: 'quinta-3d',
        animation: 'tour',
        overlay: 'Residencia de presidentes desde 1940'
      },
      educational_content: 'La Quinta de Olivos ha sido residencia de los presidentes argentinos y escenario de importantes decisiones políticas.',
      order_index: 7
    },
    {
      name: 'Cementerio de la Recoleta',
      description: 'Descanso de próceres y personalidades',
      latitude: -34.5873,
      longitude: -58.3933,
      qr_code: 'RECOLETA-001',
      historical_period: 'Siglos XIX-XX',
      difficulty: 'hard',
      points: 175,
      challenge: {
        type: 'investigation',
        question: 'Encuentra las tumbas de estos personajes',
        targets: [
          'Eva Perón',
          'Domingo F. Sarmiento',
          'Bartolomé Mitre',
          'Raúl Alfonsín'
        ],
        minRequired: 2
      },
      ar_content: {
        model: 'cemetery-3d',
        animation: 'ghost-tour',
        overlay: 'Historia viva entre mausoleos'
      },
      hints: [
        'Evita está en la bóveda Duarte',
        'Busca los presidentes',
        'Los mausoleos más grandes son de familias importantes'
      ],
      educational_content: 'El cementerio alberga los restos de presidentes, escritores, científicos y otras figuras fundamentales de la historia argentina.',
      order_index: 8
    },
    {
      name: 'Puerto Madero',
      description: 'De puerto colonial a distrito moderno',
      latitude: -34.6111,
      longitude: -58.3625,
      qr_code: 'PUERTO-MAD-001',
      historical_period: 'Evolución urbana',
      difficulty: 'easy',
      points: 100,
      challenge: {
        type: 'comparison',
        task: 'Compara el puerto antiguo con el moderno',
        aspects: ['Arquitectura', 'Función', 'Importancia económica']
      },
      ar_content: {
        model: 'puerto-3d',
        animation: 'time-lapse',
        overlay: 'Del puerto colonial al siglo XXI'
      },
      educational_content: 'Puerto Madero representa la transformación de Buenos Aires, desde su función portuaria colonial hasta convertirse en un moderno distrito.',
      order_index: 9
    },
    {
      name: 'Congreso de la Nación',
      description: 'Sede del poder legislativo',
      latitude: -34.6099,
      longitude: -58.3925,
      qr_code: 'CONGRESO-001',
      historical_period: 'Democracia',
      difficulty: 'medium',
      points: 140,
      challenge: {
        type: 'civics',
        question: '¿Cuántos diputados y senadores hay?',
        options: [
          '257 diputados y 72 senadores',
          '250 diputados y 70 senadores',
          '260 diputados y 74 senadores',
          '255 diputados y 71 senadores'
        ],
        correct: 0,
        explanation: 'Argentina tiene 257 diputados y 72 senadores (3 por provincia)'
      },
      ar_content: {
        model: 'congreso-3d',
        animation: 'democracy-flow',
        overlay: 'Aquí se hacen las leyes'
      },
      hints: [
        'Hay 3 senadores por provincia',
        'Tenemos 24 provincias',
        'Los diputados representan la población'
      ],
      educational_content: 'El Congreso Nacional es donde se debaten y sancionan las leyes que rigen la vida de todos los argentinos.',
      order_index: 10
    }
  ];

  // Insert rally points
  for (const point of rallyPoints) {
    const { error } = await supabase
      .from('colonial_rally_points')
      .insert({
        ...point,
        location: `POINT(${point.longitude} ${point.latitude})`
      } as any);

    if (error) {
      console.error(`Error inserting rally point "${point.name}":`, error);
    } else {
      console.log(`✅ Created rally point: ${point.name}`);
    }
  }

  console.log('🗺️ Colonial Rally seeding completed!');
}

// Seed achievements
async function seedAchievements() {
  console.log('🏆 Starting achievements seeding...');

  const achievements = [
    {
      name: 'Primera Victoria',
      description: 'Completa tu primer juego',
      icon: '🌟',
      category: 'inicio',
      points: 10,
      criteria: { games_completed: 1 }
    },
    {
      name: 'Estudioso',
      description: 'Completa 10 juegos',
      icon: '📚',
      category: 'progreso',
      points: 50,
      criteria: { games_completed: 10 }
    },
    {
      name: 'Genio Matemático',
      description: 'Obtén puntuación perfecta en 5 juegos de matemáticas',
      icon: '🧮',
      category: 'matemáticas',
      points: 100,
      criteria: { perfect_math_games: 5 }
    },
    {
      name: 'Historiador',
      description: 'Completa todos los juegos de historia',
      icon: '📜',
      category: 'historia',
      points: 150,
      criteria: { all_history_games: true }
    },
    {
      name: 'Explorador Colonial',
      description: 'Visita 5 puntos del Rally Colonial',
      icon: '🗺️',
      category: 'rally',
      points: 75,
      criteria: { rally_points_visited: 5 }
    },
    {
      name: 'Racha de 7 Días',
      description: 'Juega durante 7 días consecutivos',
      icon: '🔥',
      category: 'dedicación',
      points: 60,
      criteria: { streak_days: 7 }
    },
    {
      name: 'Perfeccionista',
      description: 'Obtén 100% en cualquier juego',
      icon: '💯',
      category: 'excelencia',
      points: 30,
      criteria: { perfect_score: true }
    },
    {
      name: 'Velocista',
      description: 'Completa un juego en menos de 1 minuto',
      icon: '⚡',
      category: 'velocidad',
      points: 40,
      criteria: { speed_completion: 60 }
    },
    {
      name: 'Científico',
      description: 'Completa 5 juegos de ciencias',
      icon: '🔬',
      category: 'ciencias',
      points: 70,
      criteria: { science_games: 5 }
    },
    {
      name: 'Políglota',
      description: 'Completa 5 juegos de lengua',
      icon: '💬',
      category: 'lengua',
      points: 70,
      criteria: { language_games: 5 }
    }
  ];

  for (const achievement of achievements) {
    const { error } = await supabase
      .from('achievements')
      .insert(achievement as any);

    if (error) {
      console.error(`Error inserting achievement "${achievement.name}":`, error);
    } else {
      console.log(`✅ Created achievement: ${achievement.name}`);
    }
  }

  console.log('🏆 Achievements seeding completed!');
}

// Main function
async function main() {
  console.log('🚀 Starting database seeding...\n');

  try {
    await seedGames();
    await seedColonialRally();
    await seedAchievements();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('📚 You can now use the educational games and Colonial Rally in your app.');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seeding
main();