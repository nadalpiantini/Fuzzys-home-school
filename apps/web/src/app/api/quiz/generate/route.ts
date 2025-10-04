import { NextResponse } from 'next/server';

// Demo quiz generator - en el futuro se conectará al servicio real de quiz-generator
export async function POST(req: Request) {
  try {
    const params = await req.json();
    const {
      subject,
      grade,
      topic,
      levels = ['remember', 'understand'],
      questionCount = 3,
      difficulty, // Nuevo: acepta difficulty desde recomendaciones adaptativas
      studentId, // Opcional: para logging y analytics
    } = params;

    // Validar parámetros requeridos
    if (!subject || !topic) {
      return NextResponse.json(
        { ok: false, error: 'Missing required parameters: subject, topic' },
        { status: 400 },
      );
    }

    // Ajustar cantidad de preguntas basado en dificultad
    let adjustedQuestionCount = questionCount;
    let complexityLevel: 'simple' | 'standard' | 'advanced' = 'standard';
    
    if (difficulty === 'easy') {
      adjustedQuestionCount = Math.max(2, questionCount - 1); // Menos preguntas
      complexityLevel = 'simple';
    } else if (difficulty === 'hard') {
      adjustedQuestionCount = questionCount + 2; // Más preguntas
      complexityLevel = 'advanced';
    }

    // Generar preguntas demo coherentes basadas en el tema y dificultad
    const questions = generateDemoQuestions(
      subject, 
      topic, 
      adjustedQuestionCount,
      complexityLevel
    );

    return NextResponse.json({
      ok: true,
      questions,
      meta: {
        subject,
        grade: grade || 'K-2',
        topic,
        levels,
        difficulty: difficulty || 'medium',
        questionCount: questions.length,
        complexityLevel,
        adaptive: !!difficulty,
        studentId: studentId || null,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Quiz Generator API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Función para generar preguntas demo basadas en el tema
function generateDemoQuestions(
  subject: string,
  topic: string,
  count: number = 3,
  complexity: 'simple' | 'standard' | 'advanced' = 'standard',
) {
  const templates = getTemplatesBySubject(subject, topic, complexity);
  const questions = [];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const randomizedTemplate = randomizeOptions(template);
    questions.push({
      q: randomizedTemplate.question,
      options: randomizedTemplate.options,
      correct: randomizedTemplate.correct,
      complexity: template.complexity || complexity,
    });
  }

  return questions;
}

// Función para aleatorizar las opciones manteniendo la respuesta correcta
function randomizeOptions(template: any) {
  const { question, options, correct } = template;
  
  // Crear un array de índices para las opciones
  const indices = options.map((_: any, index: number) => index);
  
  // Aleatorizar los índices
  const shuffledIndices = indices.sort(() => Math.random() - 0.5);
  
  // Crear nuevas opciones en el orden aleatorio
  const newOptions = shuffledIndices.map((index: number) => options[index]);
  
  // Mapear las respuestas correctas al nuevo orden
  const newCorrect = correct.map((correctIndex: number) => 
    shuffledIndices.indexOf(correctIndex)
  );
  
  return {
    question,
    options: newOptions,
    correct: newCorrect
  };
}

// Templates de preguntas organizados por materia y tema
function getTemplatesBySubject(
  subject: string, 
  topic: string,
  complexity: 'simple' | 'standard' | 'advanced' = 'standard'
) {
  const mathTemplates = {
    'numeros-0-10': {
      simple: [
        {
          question: '¿Cuántas tortugas ves?',
          visual: '/turtle_4.png',
          options: ['2', '3', '4'],
          correct: [1],
          complexity: 'simple',
        },
        {
          question: 'Selecciona el número 5',
          options: ['0', '5', '10'],
          correct: [1],
          complexity: 'simple',
        },
      ],
      standard: [
        {
          question: '¿Cuántas tortugas ves?',
          visual: '/turtle_4.png',
          options: ['2', '3', '4'],
          correct: [1],
          complexity: 'standard',
        },
        {
          question: 'Selecciona el número cero',
          options: ['0', '5', '10'],
          correct: [0],
          complexity: 'standard',
        },
        {
          question: '¿Qué número viene después del 7?',
          options: ['6', '8', '9'],
          correct: [1],
          complexity: 'standard',
        },
      ],
      advanced: [
        {
          question: '¿Qué número está entre 6 y 8?',
          options: ['5', '7', '9'],
          correct: [1],
          complexity: 'advanced',
        },
        {
          question: 'Si tienes 10 manzanas y comes 3, ¿cuántas quedan?',
          options: ['6', '7', '8'],
          correct: [1],
          complexity: 'advanced',
        },
        {
          question: '¿Cuál es el número más grande?',
          options: ['7', '10', '5'],
          correct: [1],
          complexity: 'advanced',
        },
      ],
    },
    'sumas-basicas': {
      simple: [
        {
          question: '1 + 1 = ?',
          options: ['1', '2', '3'],
          correct: [1],
          complexity: 'simple',
        },
        {
          question: '2 + 1 = ?',
          options: ['2', '3', '4'],
          correct: [1],
          complexity: 'simple',
        },
      ],
      standard: [
        {
          question: '2 + 3 = ?',
          options: ['4', '5', '6'],
          correct: [1],
          complexity: 'standard',
        },
        {
          question: '1 + 1 = ?',
          options: ['1', '2', '3'],
          correct: [1],
          complexity: 'standard',
        },
        {
          question: '4 + 2 = ?',
          options: ['5', '6', '7'],
          correct: [1],
          complexity: 'standard',
        },
      ],
      advanced: [
        {
          question: '5 + 5 = ?',
          options: ['9', '10', '11'],
          correct: [1],
          complexity: 'advanced',
        },
        {
          question: '7 + 3 = ?',
          options: ['9', '10', '11'],
          correct: [1],
          complexity: 'advanced',
        },
        {
          question: '6 + 4 = ?',
          options: ['9', '10', '11'],
          correct: [1],
          complexity: 'advanced',
        },
      ],
    },
  };

  const literacyTemplates = {
    'sonidos-consonantes': {
      simple: [
        {
          question: '¿Con qué letra empieza "mamá"?',
          options: ['m', 'p', 's'],
          correct: [0],
          complexity: 'simple',
        },
        {
          question: 'Encuentra la letra "A"',
          options: ['A', 'B', 'C'],
          correct: [0],
          complexity: 'simple',
        },
      ],
      standard: [
        {
          question: '¿Con qué letra empieza "perro"?',
          options: ['p', 'r', 'o'],
          correct: [0],
          complexity: 'standard',
        },
        {
          question: 'Selecciona la palabra que empieza con "m"',
          options: ['casa', 'mesa', 'pelo'],
          correct: [1],
          complexity: 'standard',
        },
        {
          question: '¿Cuál de estas tiene el sonido \'Ñ\'?',
          options: ['niño', 'nido', 'mono'],
          correct: [0],
          complexity: 'standard',
        },
      ],
      advanced: [
        {
          question: '¿Qué palabras empiezan con el mismo sonido?',
          options: ['casa-cama', 'perro-gato', 'sol-luna'],
          correct: [0],
          complexity: 'advanced',
        },
        {
          question: '¿Cuál tiene el sonido "rr" fuerte?',
          options: ['caro', 'carro', 'cara'],
          correct: [1],
          complexity: 'advanced',
        },
      ],
    },
    'lectura-basica': {
      simple: [
        {
          question: '¿Qué dice aquí? "sol"',
          options: ['sol', 'luna', 'casa'],
          correct: [0],
          complexity: 'simple',
        },
      ],
      standard: [
        {
          question: '¿Qué dice aquí? "gato"',
          options: ['perro', 'gato', 'casa'],
          correct: [1],
          complexity: 'standard',
        },
        {
          question: 'Une la imagen 🌸 con su palabra',
          options: ['flor', 'árbol', 'casa'],
          correct: [0],
          complexity: 'standard',
        },
        {
          question: '¿Cuál rima con "mesa"?',
          options: ['casa', 'fresa', 'peso'],
          correct: [1],
          complexity: 'standard',
        },
      ],
      advanced: [
        {
          question: 'Lee: "El gato duerme". ¿Quién duerme?',
          options: ['El niño', 'El gato', 'El perro'],
          correct: [1],
          complexity: 'advanced',
        },
        {
          question: '¿Cuál palabra tiene 3 sílabas?',
          options: ['sol', 'mariposa', 'flor'],
          correct: [1],
          complexity: 'advanced',
        },
      ],
    },
  };

  const scienceTemplates = {
    'experimentos-agua': {
      simple: [
        {
          question: '¿El agua está mojada?',
          options: ['Sí', 'No'],
          correct: [0],
          complexity: 'simple',
        },
      ],
      standard: [
        {
          question: '¿Qué pasa cuando el agua se congela?',
          options: ['Se vuelve gas', 'Se vuelve hielo', 'Desaparece'],
          correct: [1],
          complexity: 'standard',
        },
        {
          question: '¿Cuál flota en el agua?',
          options: ['Piedra', 'Moneda', 'Pelota'],
          correct: [2],
          complexity: 'standard',
        },
        {
          question: '¿De dónde viene la lluvia?',
          options: ['Del sol', 'De las nubes', 'De las plantas'],
          correct: [1],
          complexity: 'standard',
        },
      ],
      advanced: [
        {
          question: '¿Qué estados del agua conoces?',
          options: ['Solo líquido', 'Líquido y sólido', 'Líquido, sólido y gas'],
          correct: [2],
          complexity: 'advanced',
        },
        {
          question: '¿Por qué flotan algunos objetos?',
          options: ['Por su color', 'Por su peso y tamaño', 'Por su forma'],
          correct: [1],
          complexity: 'advanced',
        },
      ],
    },
  };

  // Seleccionar templates basados en la materia, tema y complejidad
  let selectedTemplates;
  
  switch (subject.toLowerCase()) {
    case 'math':
    case 'matematicas':
      const mathTopic = mathTemplates[topic as keyof typeof mathTemplates];
      selectedTemplates = mathTopic 
        ? mathTopic[complexity] || mathTopic['standard']
        : mathTemplates['numeros-0-10'][complexity] || mathTemplates['numeros-0-10']['standard'];
      break;

    case 'literacy':
    case 'lectoescritura':
      const litTopic = literacyTemplates[topic as keyof typeof literacyTemplates];
      selectedTemplates = litTopic
        ? litTopic[complexity] || litTopic['standard']
        : literacyTemplates['sonidos-consonantes'][complexity] || literacyTemplates['sonidos-consonantes']['standard'];
      break;

    case 'science':
    case 'ciencias':
      const sciTopic = scienceTemplates[topic as keyof typeof scienceTemplates];
      selectedTemplates = sciTopic
        ? sciTopic[complexity] || sciTopic['standard']
        : scienceTemplates['experimentos-agua'][complexity] || scienceTemplates['experimentos-agua']['standard'];
      break;

    default:
      // Fallback a math si no se reconoce la materia
      selectedTemplates = mathTemplates['numeros-0-10'][complexity] || mathTemplates['numeros-0-10']['standard'];
  }

  return selectedTemplates;
}
