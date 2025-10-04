import { NextResponse } from 'next/server';

// Demo quiz generator - en el futuro se conectará al servicio real de quiz-generator
export async function POST(req: Request) {
  try {
    const params = await req.json();
    const { subject, grade, topic, levels = ['remember', 'understand'], questionCount = 3 } = params;

    // Validar parámetros requeridos
    if (!subject || !topic) {
      return NextResponse.json(
        { ok: false, error: 'Missing required parameters: subject, topic' },
        { status: 400 }
      );
    }

    // Generar preguntas demo coherentes basadas en el tema
    const questions = generateDemoQuestions(subject, topic, questionCount);

    return NextResponse.json({
      ok: true,
      questions,
      meta: {
        subject,
        grade: grade || 'K-2',
        topic,
        levels,
        questionCount: questions.length,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Quiz Generator API Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Función para generar preguntas demo basadas en el tema
function generateDemoQuestions(subject: string, topic: string, count: number = 3) {
  const templates = getTemplatesBySubject(subject, topic);
  const questions = [];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    questions.push({
      q: template.question,
      options: template.options,
      correct: template.correct // Array de índices de respuestas correctas
    });
  }

  return questions;
}

// Templates de preguntas organizados por materia y tema
function getTemplatesBySubject(subject: string, topic: string) {
  const mathTemplates = {
    'numeros-0-10': [
      {
        question: '¿Cuántas tortugas ves? 🐢🐢🐢',
        options: ['2', '3', '4'],
        correct: [1] // Respuesta correcta: '3'
      },
      {
        question: 'Selecciona el número cero',
        options: ['0', '5', '10'],
        correct: [0] // Respuesta correcta: '0'
      },
      {
        question: '¿Qué número viene después del 7?',
        options: ['6', '8', '9'],
        correct: [1] // Respuesta correcta: '8'
      }
    ],
    'sumas-basicas': [
      {
        question: '2 + 3 = ?',
        options: ['4', '5', '6'],
        correct: [1] // Respuesta correcta: '5'
      },
      {
        question: '1 + 1 = ?',
        options: ['1', '2', '3'],
        correct: [1] // Respuesta correcta: '2'
      },
      {
        question: '4 + 2 = ?',
        options: ['5', '6', '7'],
        correct: [1] // Respuesta correcta: '6'
      }
    ]
  };

  const literacyTemplates = {
    'sonidos-consonantes': [
      {
        question: '¿Con qué letra empieza "perro"?',
        options: ['p', 'r', 'o'],
        correct: [0] // Respuesta correcta: 'p'
      },
      {
        question: 'Selecciona la palabra que empieza con "m"',
        options: ['casa', 'mesa', 'pelo'],
        correct: [1] // Respuesta correcta: 'mesa'
      },
      {
        question: '¿Cuál de estas tiene el sonido "ñ"?',
        options: ['niño', 'nido', 'mono'],
        correct: [0] // Respuesta correcta: 'niño'
      }
    ],
    'lectura-basica': [
      {
        question: '¿Qué dice aquí? "gato"',
        options: ['perro', 'gato', 'casa'],
        correct: [1] // Respuesta correcta: 'gato'
      },
      {
        question: 'Une la imagen 🌸 con su palabra',
        options: ['flor', 'árbol', 'casa'],
        correct: [0] // Respuesta correcta: 'flor'
      },
      {
        question: '¿Cuál rima con "mesa"?',
        options: ['casa', 'fresa', 'peso'],
        correct: [1] // Respuesta correcta: 'fresa'
      }
    ]
  };

  const scienceTemplates = {
    'experimentos-agua': [
      {
        question: '¿Qué pasa cuando el agua se congela?',
        options: ['Se vuelve gas', 'Se vuelve hielo', 'Desaparece'],
        correct: [1] // Respuesta correcta: 'Se vuelve hielo'
      },
      {
        question: '¿Cuál flota en el agua?',
        options: ['Piedra', 'Moneda', 'Pelota'],
        correct: [2] // Respuesta correcta: 'Pelota'
      },
      {
        question: '¿De dónde viene la lluvia?',
        options: ['Del sol', 'De las nubes', 'De las plantas'],
        correct: [1] // Respuesta correcta: 'De las nubes'
      }
    ]
  };

  // Seleccionar templates basados en la materia
  switch (subject.toLowerCase()) {
    case 'math':
    case 'matematicas':
      return mathTemplates[topic] || mathTemplates['numeros-0-10'];

    case 'literacy':
    case 'lectoescritura':
      return literacyTemplates[topic] || literacyTemplates['sonidos-consonantes'];

    case 'science':
    case 'ciencias':
      return scienceTemplates[topic] || scienceTemplates['experimentos-agua'];

    default:
      // Fallback a math si no se reconoce la materia
      return mathTemplates['numeros-0-10'];
  }
}