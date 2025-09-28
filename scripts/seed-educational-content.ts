#!/usr/bin/env node

/**
 * Seed script for educational content and games
 * This script populates the database with sample H5P content, quiz data, and educational games
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../apps/web/.env.local') });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface EducationalContent {
  id: string;
  platform_id: string;
  content_type: string;
  title: string;
  description: string;
  subject: string;
  grade_level: number;
  difficulty_level: number;
  content_data: any;
  metadata: any;
  language: string;
  estimated_duration: number;
  learning_objectives: string[];
  tags: string[];
  is_published: boolean;
}

interface QuizQuestion {
  quiz_id: string;
  question_text: string;
  question_type: string;
  correct_answer: any;
  options?: any;
  ai_explanation: string;
  difficulty_score: number;
}

class EducationalContentSeeder {
  private async ensurePlatformsExist() {
    console.log('🚀 Setting up educational platforms...');

    const platforms = [
      {
        name: 'h5p',
        version: '1.24.0',
        config: {
          baseUrl: '/h5p',
          enableEditor: true,
          enableReporting: true,
          enableDownload: false
        },
        is_active: true
      },
      {
        name: 'quiz_ai',
        version: '1.0.0',
        config: {
          aiModel: 'deepseek-chat',
          defaultLanguage: 'es',
          maxQuestions: 50,
          difficultyLevels: 5
        },
        is_active: true
      },
      {
        name: 'jclic',
        version: '0.3.2',
        config: {
          enableJavaApplets: false,
          enableHTML5: true,
          supportedActivities: ['puzzle', 'association', 'wordSearch']
        },
        is_active: true
      },
      {
        name: 'srs',
        version: '1.0.0',
        config: {
          algorithm: 'SM-2',
          defaultInterval: 1,
          easeFactor: 2.5,
          maxInterval: 365
        },
        is_active: true
      }
    ];

    for (const platform of platforms) {
      const { error } = await supabase
        .from('educational_platforms')
        .upsert(platform, { onConflict: 'name' });

      if (error) {
        console.error(`❌ Error inserting platform ${platform.name}:`, error);
      } else {
        console.log(`✅ Platform ${platform.name} ready`);
      }
    }
  }

  private async seedH5PContent() {
    console.log('📚 Seeding H5P interactive content...');

    const h5pContent: EducationalContent[] = [
      {
        id: 'h5p-math-drag-drop-1',
        platform_id: 'h5p',
        content_type: 'drag_drop_advanced',
        title: 'Operaciones Matemáticas Básicas',
        description: 'Arrastra los números para completar las operaciones matemáticas',
        subject: 'mathematics',
        grade_level: 3,
        difficulty_level: 2,
        content_data: {
          type: 'drag_drop_advanced',
          params: {
            taskDescription: 'Arrastra los números correctos para completar las operaciones',
            dropzones: [
              {
                id: 'sum1',
                label: '5 + ? = 8',
                x: 10,
                y: 10,
                width: 100,
                height: 50,
                correctElements: ['3']
              },
              {
                id: 'sum2',
                label: '10 - ? = 7',
                x: 10,
                y: 80,
                width: 100,
                height: 50,
                correctElements: ['3']
              }
            ],
            draggables: [
              { id: '1', type: 'text', content: '1', multiple: false },
              { id: '2', type: 'text', content: '2', multiple: false },
              { id: '3', type: 'text', content: '3', multiple: true },
              { id: '4', type: 'text', content: '4', multiple: false }
            ],
            feedback: {
              correct: '¡Excelente! Has completado todas las operaciones correctamente.',
              incorrect: 'Revisa tus respuestas e inténtalo de nuevo.'
            }
          }
        },
        metadata: {
          author: 'Sistema Educativo Fuzzy',
          license: 'CC BY-SA',
          keywords: ['matemáticas', 'suma', 'resta', 'operaciones básicas']
        },
        language: 'es',
        estimated_duration: 5,
        learning_objectives: [
          'Realizar operaciones de suma y resta básicas',
          'Identificar números que completan operaciones',
          'Desarrollar habilidades de cálculo mental'
        ],
        tags: ['matemáticas', 'operaciones', 'primaria', 'interactivo'],
        is_published: true
      },
      {
        id: 'h5p-science-hotspots-1',
        platform_id: 'h5p',
        content_type: 'hotspot_image',
        title: 'Partes de la Planta',
        description: 'Explora las diferentes partes de una planta y sus funciones',
        subject: 'science',
        grade_level: 4,
        difficulty_level: 2,
        content_data: {
          type: 'hotspot_image',
          params: {
            image: {
              url: '/images/educational/plant-diagram.jpg',
              alt: 'Diagrama de una planta con sus partes'
            },
            hotspots: [
              {
                id: 'root',
                x: 50,
                y: 85,
                content: {
                  header: 'Raíz',
                  text: 'Las raíces absorben agua y nutrientes del suelo. También ayudan a sostener la planta.',
                  image: '/images/educational/root-detail.jpg'
                }
              },
              {
                id: 'stem',
                x: 50,
                y: 50,
                content: {
                  header: 'Tallo',
                  text: 'El tallo transporta agua y nutrientes desde las raíces hasta las hojas. También sostiene las hojas y flores.',
                  image: '/images/educational/stem-detail.jpg'
                }
              },
              {
                id: 'leaves',
                x: 30,
                y: 30,
                content: {
                  header: 'Hojas',
                  text: 'Las hojas realizan la fotosíntesis, convirtiendo la luz solar en energía para la planta.',
                  image: '/images/educational/leaves-detail.jpg'
                }
              },
              {
                id: 'flower',
                x: 70,
                y: 20,
                content: {
                  header: 'Flor',
                  text: 'Las flores contienen los órganos reproductivos de la planta y atraen a los polinizadores.',
                  image: '/images/educational/flower-detail.jpg'
                }
              }
            ]
          }
        },
        metadata: {
          author: 'Sistema Educativo Fuzzy',
          license: 'CC BY-SA',
          keywords: ['ciencias', 'botánica', 'plantas', 'biología']
        },
        language: 'es',
        estimated_duration: 8,
        learning_objectives: [
          'Identificar las partes principales de una planta',
          'Comprender las funciones de cada parte',
          'Desarrollar vocabulario científico básico'
        ],
        tags: ['ciencias', 'plantas', 'biología', 'primaria'],
        is_published: true
      },
      {
        id: 'h5p-history-timeline-1',
        platform_id: 'h5p',
        content_type: 'timeline_interactive',
        title: 'Descubrimiento de América',
        description: 'Línea de tiempo interactiva sobre el descubrimiento de América',
        subject: 'history',
        grade_level: 6,
        difficulty_level: 3,
        content_data: {
          type: 'timeline_interactive',
          params: {
            title: 'Descubrimiento de América',
            description: 'Explora los eventos principales del descubrimiento y conquista de América',
            events: [
              {
                id: 'event1',
                date: '1492-10-12',
                title: 'Llegada de Colón',
                description: 'Cristóbal Colón llega a las Américas el 12 de octubre de 1492',
                content: 'El navegante genovés Cristóbal Colón, financiado por los Reyes Católicos de España, llega a una isla del Caribe que él llamó San Salvador.',
                image: '/images/educational/colon-arrival.jpg'
              },
              {
                id: 'event2',
                date: '1493-01-15',
                title: 'Regreso a España',
                description: 'Colón regresa a España con noticias del Nuevo Mundo',
                content: 'Colón regresa a España trayendo consigo oro, especias y algunos indígenas como prueba de su descubrimiento.',
                image: '/images/educational/colon-return.jpg'
              },
              {
                id: 'event3',
                date: '1519-02-18',
                title: 'Expedición de Cortés',
                description: 'Hernán Cortés inicia la conquista del Imperio Azteca',
                content: 'Hernán Cortés desembarca en las costas de México con aproximadamente 600 hombres para conquistar el Imperio Azteca.',
                image: '/images/educational/cortes-expedition.jpg'
              }
            ],
            settings: {
              enableZoom: true,
              startYear: 1490,
              endYear: 1550
            }
          }
        },
        metadata: {
          author: 'Sistema Educativo Fuzzy',
          license: 'CC BY-SA',
          keywords: ['historia', 'américa', 'colón', 'conquista', 'descubrimiento']
        },
        language: 'es',
        estimated_duration: 15,
        learning_objectives: [
          'Comprender la secuencia cronológica del descubrimiento de América',
          'Identificar personajes históricos importantes',
          'Analizar las causas y consecuencias de eventos históricos'
        ],
        tags: ['historia', 'américa', 'colón', 'cronología'],
        is_published: true
      },
      {
        id: 'h5p-language-drag-words-1',
        platform_id: 'h5p',
        content_type: 'drag_the_words',
        title: 'Completar Oraciones - Sustantivos',
        description: 'Arrastra las palabras correctas para completar las oraciones',
        subject: 'language',
        grade_level: 5,
        difficulty_level: 2,
        content_data: {
          type: 'drag_the_words',
          params: {
            taskDescription: 'Arrastra los sustantivos correctos para completar cada oración',
            textField: 'El *gato* subió al *árbol* para escapar del *perro*. La *niña* jugaba en el *parque* con su *pelota*.',
            checkAnswer: 'Verificar',
            tryAgain: 'Intentar de nuevo',
            showSolution: 'Mostrar solución',
            behaviour: {
              enableRetry: true,
              enableSolutionsButton: true,
              instantFeedback: false
            }
          }
        },
        metadata: {
          author: 'Sistema Educativo Fuzzy',
          license: 'CC BY-SA',
          keywords: ['lengua', 'gramática', 'sustantivos', 'oraciones']
        },
        language: 'es',
        estimated_duration: 6,
        learning_objectives: [
          'Identificar sustantivos en contexto',
          'Completar oraciones con coherencia',
          'Desarrollar comprensión lectora'
        ],
        tags: ['lengua', 'gramática', 'sustantivos', 'primaria'],
        is_published: true
      },
      {
        id: 'h5p-geography-hotspots-1',
        platform_id: 'h5p',
        content_type: 'hotspot_image',
        title: 'Mapa de República Dominicana',
        description: 'Explora las regiones y ciudades principales de República Dominicana',
        subject: 'geography',
        grade_level: 7,
        difficulty_level: 3,
        content_data: {
          type: 'hotspot_image',
          params: {
            image: {
              url: '/images/educational/dominican-republic-map.jpg',
              alt: 'Mapa de República Dominicana'
            },
            hotspots: [
              {
                id: 'santo-domingo',
                x: 70,
                y: 75,
                content: {
                  header: 'Santo Domingo',
                  text: 'Capital de la República Dominicana y primera ciudad europea fundada en América (1496). Conocida por su Zona Colonial.',
                  image: '/images/educational/santo-domingo.jpg'
                }
              },
              {
                id: 'santiago',
                x: 40,
                y: 35,
                content: {
                  header: 'Santiago de los Caballeros',
                  text: 'Segunda ciudad más importante del país, conocida como la Capital del Cibao. Centro económico e industrial.',
                  image: '/images/educational/santiago.jpg'
                }
              },
              {
                id: 'punta-cana',
                x: 90,
                y: 65,
                content: {
                  header: 'Punta Cana',
                  text: 'Principal destino turístico del país, famoso por sus playas de arena blanca y hoteles todo incluido.',
                  image: '/images/educational/punta-cana.jpg'
                }
              },
              {
                id: 'cordillera-central',
                x: 50,
                y: 40,
                content: {
                  header: 'Cordillera Central',
                  text: 'Principal sistema montañoso del país, donde se encuentra el Pico Duarte, la montaña más alta del Caribe.',
                  image: '/images/educational/cordillera-central.jpg'
                }
              }
            ]
          }
        },
        metadata: {
          author: 'Sistema Educativo Fuzzy',
          license: 'CC BY-SA',
          keywords: ['geografía', 'república dominicana', 'ciudades', 'regiones']
        },
        language: 'es',
        estimated_duration: 12,
        learning_objectives: [
          'Localizar las principales ciudades dominicanas',
          'Identificar características geográficas importantes',
          'Comprender la organización territorial del país'
        ],
        tags: ['geografía', 'dominicana', 'ciudades', 'mapa'],
        is_published: true
      }
    ];

    for (const content of h5pContent) {
      const { error } = await supabase
        .from('educational_content')
        .upsert(content, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Error inserting H5P content ${content.id}:`, error);
      } else {
        console.log(`✅ H5P content created: ${content.title}`);
      }
    }
  }

  private async seedAIQuizzes() {
    console.log('🤖 Seeding AI-generated quizzes...');

    // First create quiz records
    const quizzes = [
      {
        id: 'quiz-math-fractions-1',
        title: 'Fracciones Básicas',
        subject: 'mathematics',
        grade_level: 4,
        difficulty_level: 2,
        language: 'es',
        generated_by_ai: true,
        deepseek_prompt: 'Genera preguntas sobre fracciones básicas para estudiantes de 4to grado'
      },
      {
        id: 'quiz-science-solar-system-1',
        title: 'Sistema Solar',
        subject: 'science',
        grade_level: 5,
        difficulty_level: 3,
        language: 'es',
        generated_by_ai: true,
        deepseek_prompt: 'Crea preguntas sobre el sistema solar para estudiantes de 5to grado'
      },
      {
        id: 'quiz-history-independence-1',
        title: 'Independencia Dominicana',
        subject: 'history',
        grade_level: 8,
        difficulty_level: 3,
        language: 'es',
        generated_by_ai: true,
        deepseek_prompt: 'Elabora preguntas sobre la independencia de República Dominicana'
      }
    ];

    for (const quiz of quizzes) {
      const { error } = await supabase
        .from('ai_quizzes')
        .upsert(quiz, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Error inserting quiz ${quiz.id}:`, error);
      } else {
        console.log(`✅ Quiz created: ${quiz.title}`);
      }
    }

    // Now create questions for each quiz
    const questions: Omit<QuizQuestion, 'id'>[] = [
      // Fracciones Básicas
      {
        quiz_id: 'quiz-math-fractions-1',
        question_text: '¿Cuál de estas fracciones es mayor?',
        question_type: 'mcq',
        correct_answer: { answer: 'B', explanation: '3/4 = 0.75 y 2/3 ≈ 0.67, por lo tanto 3/4 es mayor' },
        options: [
          { key: 'A', text: '2/3' },
          { key: 'B', text: '3/4' },
          { key: 'C', text: 'Son iguales' },
          { key: 'D', text: 'No se puede determinar' }
        ],
        ai_explanation: 'Para comparar fracciones, podemos convertirlas a decimales o encontrar un denominador común. 3/4 = 0.75 y 2/3 ≈ 0.67',
        difficulty_score: 0.6
      },
      {
        quiz_id: 'quiz-math-fractions-1',
        question_text: 'Si comes 2/8 de una pizza, ¿qué fracción simplificada represents lo que comiste?',
        question_type: 'short_answer',
        correct_answer: { answer: '1/4', alternatives: ['0.25', 'un cuarto'] },
        ai_explanation: '2/8 se puede simplificar dividiendo numerador y denominador por 2: 2÷2 = 1 y 8÷2 = 4, entonces 2/8 = 1/4',
        difficulty_score: 0.5
      },

      // Sistema Solar
      {
        quiz_id: 'quiz-science-solar-system-1',
        question_text: '¿Cuál es el planeta más grande del sistema solar?',
        question_type: 'mcq',
        correct_answer: { answer: 'C', explanation: 'Júpiter es el planeta más grande del sistema solar' },
        options: [
          { key: 'A', text: 'Saturno' },
          { key: 'B', text: 'Tierra' },
          { key: 'C', text: 'Júpiter' },
          { key: 'D', text: 'Neptuno' }
        ],
        ai_explanation: 'Júpiter es un gigante gaseoso que podría contener más de 1,300 Tierras en su interior.',
        difficulty_score: 0.4
      },
      {
        quiz_id: 'quiz-science-solar-system-1',
        question_text: '¿Verdadero o Falso? El Sol es una estrella.',
        question_type: 'true_false',
        correct_answer: { answer: true, explanation: 'El Sol es efectivamente una estrella, la más cercana a la Tierra' },
        ai_explanation: 'El Sol es una estrella de tamaño mediano que proporciona luz y calor a nuestro sistema solar.',
        difficulty_score: 0.3
      },

      // Independencia Dominicana
      {
        quiz_id: 'quiz-history-independence-1',
        question_text: '¿En qué año se independizó la República Dominicana de Haití?',
        question_type: 'mcq',
        correct_answer: { answer: 'B', explanation: 'La independencia dominicana se proclamó el 27 de febrero de 1844' },
        options: [
          { key: 'A', text: '1843' },
          { key: 'B', text: '1844' },
          { key: 'C', text: '1845' },
          { key: 'D', text: '1846' }
        ],
        ai_explanation: 'Juan Pablo Duarte y los trinitarios proclamaron la independencia el 27 de febrero de 1844.',
        difficulty_score: 0.5
      },
      {
        quiz_id: 'quiz-history-independence-1',
        question_text: '¿Quién fue el principal líder del movimiento independentista dominicano?',
        question_type: 'short_answer',
        correct_answer: { answer: 'Juan Pablo Duarte', alternatives: ['Duarte', 'J.P. Duarte'] },
        ai_explanation: 'Juan Pablo Duarte fundó la sociedad secreta La Trinitaria y lideró el movimiento que logró la independencia.',
        difficulty_score: 0.4
      }
    ];

    for (const question of questions) {
      const { error } = await supabase
        .from('quiz_questions')
        .insert(question);

      if (error) {
        console.error(`❌ Error inserting question:`, error);
      } else {
        console.log(`✅ Question created for quiz: ${question.quiz_id}`);
      }
    }
  }

  private async seedGameContent() {
    console.log('🎮 Seeding educational games...');

    const gameContent: EducationalContent[] = [
      {
        id: 'game-memory-animals-1',
        platform_id: 'game_engine',
        content_type: 'memory_game',
        title: 'Memoria de Animales',
        description: 'Juego de memoria para aprender nombres de animales en español e inglés',
        subject: 'language',
        grade_level: 2,
        difficulty_level: 1,
        content_data: {
          type: 'memory_game',
          cards: [
            { id: 1, front: 'Gato', back: 'Cat', image: '/images/animals/cat.jpg' },
            { id: 2, front: 'Perro', back: 'Dog', image: '/images/animals/dog.jpg' },
            { id: 3, front: 'Pájaro', back: 'Bird', image: '/images/animals/bird.jpg' },
            { id: 4, front: 'Pez', back: 'Fish', image: '/images/animals/fish.jpg' },
            { id: 5, front: 'Caballo', back: 'Horse', image: '/images/animals/horse.jpg' },
            { id: 6, front: 'Vaca', back: 'Cow', image: '/images/animals/cow.jpg' }
          ],
          settings: {
            maxAttempts: 20,
            showTimer: true,
            playSound: true
          }
        },
        metadata: {
          gameType: 'memory',
          difficulty: 'easy',
          bilingual: true
        },
        language: 'es',
        estimated_duration: 8,
        learning_objectives: [
          'Aprender vocabulario de animales en español e inglés',
          'Desarrollar memoria visual',
          'Mejorar concentración'
        ],
        tags: ['animales', 'memoria', 'inglés', 'vocabulario'],
        is_published: true
      },
      {
        id: 'game-math-battle-1',
        platform_id: 'game_engine',
        content_type: 'math_battle',
        title: 'Batalla Matemática',
        description: 'Resuelve operaciones matemáticas lo más rápido posible',
        subject: 'mathematics',
        grade_level: 4,
        difficulty_level: 2,
        content_data: {
          type: 'math_battle',
          operations: ['addition', 'subtraction', 'multiplication'],
          numberRange: { min: 1, max: 100 },
          timeLimit: 30,
          settings: {
            questionsPerRound: 10,
            bonusTime: 5,
            powerUps: true,
            multiPlayer: true
          }
        },
        metadata: {
          gameType: 'speed',
          competitive: true,
          realTime: true
        },
        language: 'es',
        estimated_duration: 10,
        learning_objectives: [
          'Practicar operaciones matemáticas básicas',
          'Desarrollar velocidad de cálculo',
          'Mejorar concentración bajo presión'
        ],
        tags: ['matemáticas', 'velocidad', 'competitivo', 'operaciones'],
        is_published: true
      },
      {
        id: 'game-word-builder-1',
        platform_id: 'game_engine',
        content_type: 'word_builder',
        title: 'Constructor de Palabras',
        description: 'Forma palabras correctas usando las letras disponibles',
        subject: 'language',
        grade_level: 3,
        difficulty_level: 2,
        content_data: {
          type: 'word_builder',
          categories: [
            {
              name: 'Animales',
              words: ['GATO', 'PERRO', 'PÁJARO', 'RATÓN', 'TIGRE', 'LEÓN']
            },
            {
              name: 'Colores',
              words: ['ROJO', 'AZUL', 'VERDE', 'AMARILLO', 'NEGRO', 'BLANCO']
            },
            {
              name: 'Frutas',
              words: ['MANZANA', 'PLÁTANO', 'NARANJA', 'UVA', 'FRESA', 'PIÑA']
            }
          ],
          settings: {
            showHints: true,
            timeLimit: 60,
            minWordLength: 4,
            allowScramble: true
          }
        },
        metadata: {
          gameType: 'puzzle',
          educational: true,
          vocabulary: true
        },
        language: 'es',
        estimated_duration: 12,
        learning_objectives: [
          'Ampliar vocabulario en español',
          'Mejorar ortografía',
          'Desarrollar habilidades de resolución de problemas'
        ],
        tags: ['palabras', 'vocabulario', 'ortografía', 'puzzle'],
        is_published: true
      }
    ];

    for (const content of gameContent) {
      const { error } = await supabase
        .from('educational_content')
        .upsert(content, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Error inserting game content ${content.id}:`, error);
      } else {
        console.log(`✅ Game content created: ${content.title}`);
      }
    }
  }

  private async seedColonialRallyContent() {
    console.log('🏛️ Seeding Colonial Rally content...');

    const rallyContent: EducationalContent[] = [
      {
        id: 'colonial-rally-catedral-1',
        platform_id: 'colonial_rally',
        content_type: 'ar_location',
        title: 'Catedral Primada de América',
        description: 'Descubre la historia de la primera catedral construida en América',
        subject: 'history',
        grade_level: 6,
        difficulty_level: 2,
        content_data: {
          type: 'ar_location',
          location: {
            name: 'Catedral Primada de América',
            coordinates: { lat: 18.4732, lng: -69.8816 },
            address: 'Calle Arzobispo Meriño, Zona Colonial, Santo Domingo'
          },
          qrCode: 'QR_CATEDRAL_PRIMADA_001',
          arContent: {
            historicalPeriod: '1514-1540',
            keyFacts: [
              'Primera catedral construida en América',
              'Arquitectura gótica y renacentista',
              'Contiene los restos de Cristóbal Colón (disputado)'
            ],
            interactiveElements: [
              {
                type: 'hotspot',
                position: { x: 0.3, y: 0.4 },
                content: 'Fachada principal con elementos góticos'
              },
              {
                type: 'hotspot',
                position: { x: 0.7, y: 0.6 },
                content: 'Torres campanario añadidas posteriormente'
              }
            ]
          },
          quest: {
            title: 'Misterio de la Catedral',
            description: 'Resuelve el misterio histórico de esta catedral',
            tasks: [
              {
                type: 'question',
                question: '¿En qué año se completó la construcción?',
                answer: '1540',
                hint: 'Fue durante el siglo XVI'
              },
              {
                type: 'photo',
                description: 'Toma una foto de la entrada principal',
                validation: 'manual'
              }
            ],
            reward: {
              points: 50,
              badge: 'Explorador de Catedrales',
              unlocks: ['colonial-rally-alcazar-1']
            }
          }
        },
        metadata: {
          difficulty: 'medium',
          historicalPeriod: 'colonial',
          estimatedVisitTime: 30
        },
        language: 'es',
        estimated_duration: 25,
        learning_objectives: [
          'Comprender la importancia histórica de la Catedral Primada',
          'Identificar elementos arquitectónicos coloniales',
          'Analizar el legado colonial en América'
        ],
        tags: ['colonial', 'catedral', 'arquitectura', 'historia'],
        is_published: true
      },
      {
        id: 'colonial-rally-alcazar-1',
        platform_id: 'colonial_rally',
        content_type: 'ar_location',
        title: 'Alcázar de Colón',
        description: 'Explora la residencia del hijo de Cristóbal Colón',
        subject: 'history',
        grade_level: 6,
        difficulty_level: 2,
        content_data: {
          type: 'ar_location',
          location: {
            name: 'Alcázar de Colón',
            coordinates: { lat: 18.4733, lng: -69.8829 },
            address: 'Plaza de la Cultura, Zona Colonial, Santo Domingo'
          },
          qrCode: 'QR_ALCAZAR_COLON_001',
          arContent: {
            historicalPeriod: '1510-1514',
            keyFacts: [
              'Residencia de Diego Colón, hijo de Cristóbal',
              'Primer palacio virreinal de América',
              'Arquitectura mudéjar y gótica'
            ],
            interactiveElements: [
              {
                type: 'timeline',
                events: [
                  { year: 1510, event: 'Inicio de construcción' },
                  { year: 1514, event: 'Finalización' },
                  { year: 1955, event: 'Restauración moderna' }
                ]
              }
            ]
          },
          quest: {
            title: 'Secretos del Alcázar',
            description: 'Descubre los secretos de la familia Colón',
            tasks: [
              {
                type: 'question',
                question: '¿Quién vivió en este palacio?',
                answer: 'Diego Colón',
                hint: 'Era hijo del famoso navegante'
              },
              {
                type: 'exploration',
                description: 'Encuentra las 3 salas principales del palacio',
                checkpoints: ['sala_principal', 'comedor', 'biblioteca']
              }
            ],
            reward: {
              points: 60,
              badge: 'Historiador Colonial',
              unlocks: ['colonial-rally-fortaleza-1']
            }
          }
        },
        metadata: {
          difficulty: 'medium',
          historicalPeriod: 'colonial',
          estimatedVisitTime: 40
        },
        language: 'es',
        estimated_duration: 35,
        learning_objectives: [
          'Conocer la vida de la familia Colón en América',
          'Entender la organización colonial temprana',
          'Apreciar la arquitectura colonial'
        ],
        tags: ['colonial', 'colón', 'palacio', 'virreinato'],
        is_published: true
      }
    ];

    for (const content of rallyContent) {
      const { error } = await supabase
        .from('educational_content')
        .upsert(content, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Error inserting Colonial Rally content ${content.id}:`, error);
      } else {
        console.log(`✅ Colonial Rally content created: ${content.title}`);
      }
    }
  }

  private async createSampleUsers() {
    console.log('👥 Creating sample users...');

    // Create sample teacher
    const teacherData = {
      email: 'profesor@fuzzyschool.edu',
      password: 'fuzzy123456',
      user_metadata: {
        full_name: 'María González',
        role: 'teacher',
        school: 'Escuela Primaria Central',
        subjects: ['mathematics', 'science'],
        grade_levels: [3, 4, 5]
      }
    };

    const { data: teacher, error: teacherError } = await supabase.auth.admin.createUser({
      email: teacherData.email,
      password: teacherData.password,
      user_metadata: teacherData.user_metadata,
      email_confirm: true
    });

    if (teacherError) {
      console.error('❌ Error creating teacher:', teacherError);
    } else {
      console.log('✅ Sample teacher created:', teacher.user?.email);
    }

    // Create sample students
    const studentsData = [
      {
        email: 'ana.student@fuzzyschool.edu',
        password: 'student123',
        user_metadata: {
          full_name: 'Ana Rodríguez',
          role: 'student',
          grade_level: 4,
          birthdate: '2015-03-15'
        }
      },
      {
        email: 'carlos.student@fuzzyschool.edu',
        password: 'student123',
        user_metadata: {
          full_name: 'Carlos Martínez',
          role: 'student',
          grade_level: 5,
          birthdate: '2014-07-22'
        }
      }
    ];

    for (const studentData of studentsData) {
      const { data: student, error: studentError } = await supabase.auth.admin.createUser({
        email: studentData.email,
        password: studentData.password,
        user_metadata: studentData.user_metadata,
        email_confirm: true
      });

      if (studentError) {
        console.error(`❌ Error creating student ${studentData.email}:`, studentError);
      } else {
        console.log(`✅ Sample student created: ${student.user?.email}`);
      }
    }
  }

  public async seedAll() {
    console.log('🌱 Starting educational content seeding...\n');

    try {
      await this.ensurePlatformsExist();
      await this.seedH5PContent();
      await this.seedAIQuizzes();
      await this.seedGameContent();
      await this.seedColonialRallyContent();
      await this.createSampleUsers();

      console.log('\n🎉 Educational content seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log('   • Educational platforms configured');
      console.log('   • H5P interactive content created');
      console.log('   • AI-generated quizzes seeded');
      console.log('   • Educational games added');
      console.log('   • Colonial Rally locations set up');
      console.log('   • Sample users created');
      console.log('\n🚀 Ready for educational platform testing!');

    } catch (error) {
      console.error('❌ Error during seeding:', error);
      process.exit(1);
    }
  }
}

// Run the seeder
const seeder = new EducationalContentSeeder();
seeder.seedAll().then(() => {
  console.log('✅ Seeding process completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});