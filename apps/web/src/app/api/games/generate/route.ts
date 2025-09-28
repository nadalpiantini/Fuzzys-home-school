import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { brain } from '@/lib/brain-engine/core/BrainEngine';

const GameGenerationRequestSchema = z.object({
  subject: z.string().min(1),
  grade: z.number().int().min(1).max(12),
  gameType: z.enum([
    'mcq',
    'truefalse',
    'dragdrop',
    'hotspot',
    'crossword',
    'memory',
    'timeline',
  ]),
  topic: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  language: z.enum(['es', 'en']).default('es'),
});

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const body = await request.json();

    // Check if Brain Engine should be used
    if (url.searchParams.get('useBrain') === '1') {
      console.log('🧠 Using Brain Engine for game generation');

      const brainResult = await brain.execute({
        type: 'GENERATE',
        parameters: {
          gradeLevel: [body.grade || 5],
          subjects: [body.subject || 'matemáticas'],
          quantity: 1,
          difficulty: body.difficulty === 'easy' ? 'adaptive' : 'fixed',
          language: body.language || 'es',
          culturalContext: 'dominican',
        },
      });

      return NextResponse.json({
        success: brainResult.ok,
        game: brainResult.data,
        source: 'brain-engine',
        message: 'Generated using Brain Engine (experimental)',
      });
    }

    const { subject, grade, gameType, topic, difficulty, language } =
      GameGenerationRequestSchema.parse(body);

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DeepSeek API key not configured' },
        { status: 500 },
      );
    }

    // Generar contenido educativo específico según el tipo de juego
    const gameContent = await generateEducationalGame({
      subject,
      grade,
      gameType,
      topic,
      difficulty,
      language,
      apiKey,
    });

    return NextResponse.json({
      success: true,
      game: gameContent,
    });
  } catch (error) {
    console.error('Error generating game:', error);
    return NextResponse.json(
      { error: 'Failed to generate game content' },
      { status: 500 },
    );
  }
}

async function generateEducationalGame({
  subject,
  grade,
  gameType,
  topic,
  difficulty,
  language,
  apiKey,
}: {
  subject: string;
  grade: number;
  gameType: string;
  topic?: string;
  difficulty: string;
  language: string;
  apiKey: string;
}) {
  const systemPrompt =
    language === 'es'
      ? `Eres un experto en educación que crea contenido educativo de alta calidad para estudiantes de ${grade} grado en ${subject}.
    
    Crea contenido educativo real, preciso y pedagógicamente sólido que:
    - Sea apropiado para la edad y nivel académico
    - Use terminología correcta y precisa
    - Incluya ejemplos reales y aplicables
    - Promueva el pensamiento crítico
    - Sea culturalmente relevante para estudiantes hispanohablantes
    
    Responde SOLO con JSON válido, sin texto adicional.`
      : `You are an education expert creating high-quality educational content for ${grade}th grade students in ${subject}.
    
    Create real, accurate, and pedagogically sound educational content that:
    - Is age and academically appropriate
    - Uses correct and precise terminology
    - Includes real and applicable examples
    - Promotes critical thinking
    - Is culturally relevant for Spanish-speaking students
    
    Respond ONLY with valid JSON, no additional text.`;

  const userPrompt = buildGamePrompt(
    subject,
    grade,
    gameType,
    topic,
    difficulty,
    language,
  );

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

function buildGamePrompt(
  subject: string,
  grade: number,
  gameType: string,
  topic: string | undefined,
  difficulty: string,
  language: string,
): string {
  const baseTopic = topic || getDefaultTopic(subject, grade);

  switch (gameType) {
    case 'mcq':
      return language === 'es'
        ? `Genera 5 preguntas de opción múltiple sobre ${baseTopic} en ${subject} para ${grade} grado (nivel ${difficulty}).
        
        Estructura JSON:
        {
          "title": "Título del juego",
          "description": "Descripción educativa",
          "questions": [
            {
              "id": "q1",
              "question": "Pregunta clara y específica",
              "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
              "correct": 0,
              "explanation": "Explicación educativa detallada",
              "difficulty": "${difficulty}"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "5-10 minutos",
            "learningObjectives": ["Objetivo 1", "Objetivo 2"]
          }
        }`
        : `Generate 5 multiple choice questions about ${baseTopic} in ${subject} for ${grade}th grade (${difficulty} level).
        
        JSON structure:
        {
          "title": "Game title",
          "description": "Educational description",
          "questions": [
            {
              "id": "q1",
              "question": "Clear and specific question",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correct": 0,
              "explanation": "Detailed educational explanation",
              "difficulty": "${difficulty}"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "5-10 minutes",
            "learningObjectives": ["Objective 1", "Objective 2"]
          }
        }`;

    case 'truefalse':
      return language === 'es'
        ? `Genera 8 preguntas de verdadero/falso sobre ${baseTopic} en ${subject} para ${grade} grado.
        
        Estructura JSON:
        {
          "title": "Verdadero o Falso: ${baseTopic}",
          "description": "Evalúa tu conocimiento sobre ${baseTopic}",
          "questions": [
            {
              "id": "q1",
              "statement": "Afirmación clara y específica",
              "correct": true,
              "explanation": "Explicación detallada del por qué es verdadero/falso",
              "difficulty": "${difficulty}"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "3-5 minutos"
          }
        }`
        : `Generate 8 true/false questions about ${baseTopic} in ${subject} for ${grade}th grade.
        
        JSON structure:
        {
          "title": "True or False: ${baseTopic}",
          "description": "Test your knowledge about ${baseTopic}",
          "questions": [
            {
              "id": "q1",
              "statement": "Clear and specific statement",
              "correct": true,
              "explanation": "Detailed explanation of why it's true/false",
              "difficulty": "${difficulty}"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "3-5 minutes"
          }
        }`;

    case 'dragdrop':
      return language === 'es'
        ? `Genera una actividad de arrastrar y soltar sobre ${baseTopic} en ${subject} para ${grade} grado.
        
        Estructura JSON:
        {
          "title": "Clasifica: ${baseTopic}",
          "description": "Arrastra cada elemento a su categoría correcta",
          "categories": ["Categoría 1", "Categoría 2", "Categoría 3"],
          "items": [
            {
              "id": "item1",
              "text": "Elemento a clasificar",
              "correctCategory": 0,
              "explanation": "Por qué pertenece a esta categoría"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "5-8 minutos"
          }
        }`
        : `Generate a drag and drop activity about ${baseTopic} in ${subject} for ${grade}th grade.
        
        JSON structure:
        {
          "title": "Classify: ${baseTopic}",
          "description": "Drag each item to its correct category",
          "categories": ["Category 1", "Category 2", "Category 3"],
          "items": [
            {
              "id": "item1",
              "text": "Item to classify",
              "correctCategory": 0,
              "explanation": "Why it belongs to this category"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "5-8 minutes"
          }
        }`;

    case 'hotspot':
      return language === 'es'
        ? `Genera una actividad de hotspots sobre ${baseTopic} en ${subject} para ${grade} grado.
        
        Estructura JSON:
        {
          "title": "Identifica: ${baseTopic}",
          "description": "Haz clic en las áreas correctas de la imagen",
          "imageUrl": "URL de imagen educativa",
          "hotspots": [
            {
              "id": "spot1",
              "x": 25,
              "y": 30,
              "width": 15,
              "height": 20,
              "label": "Parte identificada",
              "explanation": "Explicación de esta parte",
              "correct": true
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "3-5 minutos"
          }
        }`
        : `Generate a hotspot activity about ${baseTopic} in ${subject} for ${grade}th grade.
        
        JSON structure:
        {
          "title": "Identify: ${baseTopic}",
          "description": "Click on the correct areas of the image",
          "imageUrl": "Educational image URL",
          "hotspots": [
            {
              "id": "spot1",
              "x": 25,
              "y": 30,
              "width": 15,
              "height": 20,
              "label": "Identified part",
              "explanation": "Explanation of this part",
              "correct": true
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "3-5 minutes"
          }
        }`;

    case 'crossword':
      return language === 'es'
        ? `Genera un crucigrama sobre ${baseTopic} en ${subject} para ${grade} grado.
        
        Estructura JSON:
        {
          "title": "Crucigrama: ${baseTopic}",
          "description": "Completa el crucigrama con los términos correctos",
          "grid": [
            ["", "", "", ""],
            ["", "", "", ""]
          ],
          "words": [
            {
              "word": "PALABRA",
              "clue": "Pista educativa",
              "startRow": 0,
              "startCol": 0,
              "direction": "across",
              "explanation": "Explicación del término"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "10-15 minutos"
          }
        }`
        : `Generate a crossword puzzle about ${baseTopic} in ${subject} for ${grade}th grade.
        
        JSON structure:
        {
          "title": "Crossword: ${baseTopic}",
          "description": "Complete the crossword with the correct terms",
          "grid": [
            ["", "", "", ""],
            ["", "", "", ""]
          ],
          "words": [
            {
              "word": "WORD",
              "clue": "Educational clue",
              "startRow": 0,
              "startCol": 0,
              "direction": "across",
              "explanation": "Term explanation"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "10-15 minutes"
          }
        }`;

    case 'memory':
      return language === 'es'
        ? `Genera un juego de memoria sobre ${baseTopic} en ${subject} para ${grade} grado.
        
        Estructura JSON:
        {
          "title": "Memoria: ${baseTopic}",
          "description": "Encuentra las parejas correctas",
          "cards": [
            {
              "id": "card1",
              "front": "Término o concepto",
              "back": "Definición o explicación",
              "pairId": "pair1"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "5-10 minutos"
          }
        }`
        : `Generate a memory game about ${baseTopic} in ${subject} for ${grade}th grade.
        
        JSON structure:
        {
          "title": "Memory: ${baseTopic}",
          "description": "Find the correct pairs",
          "cards": [
            {
              "id": "card1",
              "front": "Term or concept",
              "back": "Definition or explanation",
              "pairId": "pair1"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "5-10 minutes"
          }
        }`;

    case 'timeline':
      return language === 'es'
        ? `Genera una línea de tiempo sobre ${baseTopic} en ${subject} para ${grade} grado.
        
        Estructura JSON:
        {
          "title": "Línea de Tiempo: ${baseTopic}",
          "description": "Ordena los eventos en secuencia cronológica",
          "events": [
            {
              "id": "event1",
              "title": "Título del evento",
              "description": "Descripción del evento",
              "date": "Año o fecha",
              "order": 1,
              "explanation": "Importancia del evento"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "8-12 minutos"
          }
        }`
        : `Generate a timeline about ${baseTopic} in ${subject} for ${grade}th grade.
        
        JSON structure:
        {
          "title": "Timeline: ${baseTopic}",
          "description": "Order the events in chronological sequence",
          "events": [
            {
              "id": "event1",
              "title": "Event title",
              "description": "Event description",
              "date": "Year or date",
              "order": 1,
              "explanation": "Event importance"
            }
          ],
          "metadata": {
            "subject": "${subject}",
            "grade": ${grade},
            "estimatedTime": "8-12 minutes"
          }
        }`;

    default:
      throw new Error(`Unsupported game type: ${gameType}`);
  }
}

function getDefaultTopic(subject: string, grade: number): string {
  const topics: Record<string, Record<number, string[]>> = {
    matemáticas: {
      1: ['números del 1 al 10', 'suma básica', 'formas geométricas'],
      2: ['suma y resta', 'números hasta 100', 'medidas básicas'],
      3: ['multiplicación', 'fracciones simples', 'perímetro y área'],
      4: ['división', 'decimales', 'geometría'],
      5: ['fracciones', 'porcentajes', 'álgebra básica'],
      6: ['números negativos', 'ecuaciones', 'estadística'],
      7: ['álgebra', 'geometría avanzada', 'probabilidad'],
      8: ['ecuaciones cuadráticas', 'trigonometría básica', 'funciones'],
      9: ['álgebra avanzada', 'geometría analítica', 'estadística'],
      10: ['trigonometría', 'cálculo básico', 'números complejos'],
      11: ['cálculo', 'geometría del espacio', 'límites'],
      12: ['cálculo avanzado', 'estadística avanzada', 'análisis'],
    },
    ciencias: {
      1: ['plantas y animales', 'el cuerpo humano', 'estaciones del año'],
      2: ['ciclo del agua', 'magnetismo', 'estados de la materia'],
      3: ['sistema solar', 'ecosistemas', 'fuerza y movimiento'],
      4: ['energía', 'células', 'clasificación de seres vivos'],
      5: ['reproducción', 'genética básica', 'evolución'],
      6: ['química básica', 'física', 'biología molecular'],
      7: ['reacciones químicas', 'ondas', 'genética'],
      8: ['átomos y moléculas', 'electricidad', 'ecología'],
      9: ['química orgánica', 'física cuántica', 'biología celular'],
      10: ['química avanzada', 'termodinámica', 'genética molecular'],
      11: ['bioquímica', 'física nuclear', 'biología molecular'],
      12: ['química analítica', 'física moderna', 'biotecnología'],
    },
    historia: {
      1: ['mi familia', 'mi comunidad', 'tradiciones locales'],
      2: [
        'historia de mi país',
        'personajes importantes',
        'cultura dominicana',
      ],
      3: ['descubrimiento de América', 'colonización', 'independencia'],
      4: ['República Dominicana', 'héroes nacionales', 'cultura taína'],
      5: ['América precolombina', 'conquista española', 'sociedad colonial'],
      6: ['independencia de América Latina', 'revoluciones', 'siglo XIX'],
      7: ['Primera Guerra Mundial', 'Revolución Rusa', 'siglo XX'],
      8: ['Segunda Guerra Mundial', 'Guerra Fría', 'América Latina'],
      9: ['historia contemporánea', 'globalización', 'conflictos modernos'],
      10: ['historia mundial', 'filosofía', 'arte y cultura'],
      11: [
        'historia de las ideas',
        'revoluciones científicas',
        'pensamiento crítico',
      ],
      12: [
        'historia del pensamiento',
        'filosofía contemporánea',
        'análisis histórico',
      ],
    },
    español: {
      1: ['letras y sonidos', 'palabras básicas', 'lectura simple'],
      2: ['sílabas', 'vocabulario', 'comprensión lectora'],
      3: ['gramática básica', 'verbos', 'redacción simple'],
      4: ['sustantivos y adjetivos', 'pronombres', 'textos narrativos'],
      5: ['tiempos verbales', 'géneros literarios', 'redacción'],
      6: ['sintaxis', 'literatura', 'análisis textual'],
      7: ['literatura hispanoamericana', 'poesía', 'ensayo'],
      8: ['literatura universal', 'teatro', 'crítica literaria'],
      9: ['literatura contemporánea', 'análisis literario', 'creación'],
      10: ['literatura comparada', 'teoría literaria', 'investigación'],
      11: ['literatura especializada', 'metodología', 'crítica avanzada'],
      12: [
        'literatura y sociedad',
        'estudios culturales',
        'investigación avanzada',
      ],
    },
  };

  const subjectTopics = topics[subject.toLowerCase()] || topics['matemáticas'];
  const gradeTopics = subjectTopics[grade] || subjectTopics[6];
  return gradeTopics[Math.floor(Math.random() * gradeTopics.length)];
}
