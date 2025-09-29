import {
  DeepSeekConfig,
  TutorResponse,
  QueryType,
  UnderstandingLevel,
} from './types';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Mock responses for different types of questions
const MOCK_RESPONSES = {
  fotosintesis: `¡Qué excelente pregunta! 🌱

La fotosíntesis es como la "comida mágica" que hacen las plantas. Te lo voy a explicar de forma súper sencilla:

Imagina que las plantas son como pequeñas fábricas de comida. Para hacer su alimento necesitan tres ingredientes especiales:

1. **Luz del sol** ☀️ - Es como la electricidad que hace funcionar la fábrica

2. **Agua** 💧 - Las plantas la toman del suelo con sus raíces, como cuando tú tomas agua con un sorbete

3. **Aire** 🌬️ - Las plantas respiran un gas especial del aire llamado dióxido de carbono

Con estos tres ingredientes, las hojas verdes (que tienen algo especial llamado clorofila) hacen algo increíble: ¡crean su propia comida! Esta comida es como azúcar que les da energía para crecer.

Y lo más genial es que mientras hacen esto, las plantas nos regalan oxígeno, ¡el aire que nosotros necesitamos para respirar!

¿Te das cuenta? Las plantas nos ayudan a respirar mientras ellas comen. ¡Por eso son tan importantes para nosotros!

¿Qué parte te gustó más de esta explicación?`,

  matematicas: `¡Hola! Soy Fuzzy y me encanta las matemáticas! 🔢

Las matemáticas son como un juego súper divertido con números. Te ayudan a:

• Contar tus juguetes favoritos

• Saber cuánto dinero necesitas para comprar dulces

• Medir qué tan alto eres

• Resolver acertijos numéricos

¿Qué tema de matemáticas te gustaría aprender hoy? Puedo ayudarte con:
- Sumas y restas
- Multiplicaciones
- Fracciones
- Problemas divertidos

¡Vamos a hacer que las matemáticas sean tu materia favorita!`,

  default: `¡Genial! Me encanta tu curiosidad para aprender! 🌟

Esa es una pregunta muy interesante. Déjame explicártelo paso a paso de una forma que sea fácil de entender.

Primero, vamos a pensar en algo que ya conoces de tu vida diaria...

[Aquí iría la explicación específica del tema]

¿Te gustaría que profundizara en alguna parte específica? ¡Estoy aquí para ayudarte a entender todo!`
};

export class MockDeepSeekClient {
  private config: DeepSeekConfig;

  constructor(config: DeepSeekConfig) {
    this.config = config;
  }

  async generateResponse(
    messages: DeepSeekMessage[],
    context: {
      subject: string;
      grade: number;
      queryType: QueryType;
      understandingLevel: UnderstandingLevel;
      language: 'es' | 'en';
      learningStyle?: string;
    },
  ): Promise<TutorResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lastMessage = messages[messages.length - 1];
    const query = lastMessage?.content.toLowerCase() || '';

    let responseContent = MOCK_RESPONSES.default;

    // Check for specific topics
    if (query.includes('fotosíntesis') || query.includes('fotosintesis')) {
      responseContent = MOCK_RESPONSES.fotosintesis;
    } else if (query.includes('matemática') || query.includes('matematica') || query.includes('número')) {
      responseContent = MOCK_RESPONSES.matematicas;
    } else if (query.includes('ciencia')) {
      responseContent = `¡Las ciencias son fascinantes! 🔬

Las ciencias nos ayudan a entender cómo funciona el mundo que nos rodea. Es como ser un detective que descubre los secretos de la naturaleza.

¿Sobre qué tema de ciencias te gustaría aprender?
• Los animales y plantas
• El cuerpo humano
• El clima y el tiempo
• Los planetas y las estrellas

¡Elige uno y empecemos nuestra aventura científica!`;
    } else if (query.includes('historia')) {
      responseContent = `¡La historia es como un viaje en el tiempo! ⏰

Podemos aprender sobre:
• Los taínos, los primeros habitantes de nuestra isla
• Cristóbal Colón y el descubrimiento
• Nuestros héroes patrios como Duarte, Sánchez y Mella
• La vida en el pasado

¿Qué período de la historia dominicana te gustaría explorar?`;
    }

    // Add personalization based on grade
    if (context.grade <= 3) {
      responseContent = responseContent.replace(/complicad[oa]/g, 'difícil');
      responseContent = responseContent.replace(/comprend/g, 'entend');
    }

    return {
      content: responseContent,
      type: this.determineResponseType(responseContent),
      confidence: 0.95,
      followUpSuggestions: this.generateFollowUpSuggestions(context.language),
    };
  }

  async detectUnderstanding(
    studentResponse: string,
    concept: string,
    context: { subject: string; grade: number; language: 'es' | 'en' },
  ): Promise<{
    level: UnderstandingLevel;
    reasoning: string;
    nextAction: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple mock understanding detection
    const responseLength = studentResponse.length;
    let level: UnderstandingLevel = 'partial_understanding';

    if (responseLength > 100) {
      level = 'good_understanding';
    } else if (responseLength > 50) {
      level = 'partial_understanding';
    } else if (responseLength > 20) {
      level = 'minimal_understanding';
    } else {
      level = 'no_understanding';
    }

    return {
      level,
      reasoning: 'Análisis basado en la respuesta del estudiante',
      nextAction: 'Continuar con ejemplos prácticos',
    };
  }

  async generateFollowUpQuestions(
    concept: string,
    currentUnderstanding: UnderstandingLevel,
    context: { subject: string; grade: number; language: 'es' | 'en' },
  ): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (context.language === 'es') {
      return [
        '¿Puedes darme un ejemplo de esto en tu vida diaria?',
        '¿Qué parte te pareció más interesante?',
        '¿Te gustaría aprender más sobre este tema?',
      ];
    } else {
      return [
        'Can you give me an example from your daily life?',
        'What part did you find most interesting?',
        'Would you like to learn more about this topic?',
      ];
    }
  }

  private determineResponseType(content: string): TutorResponse['type'] {
    if (content.includes('?')) {
      return 'socratic_question';
    } else if (content.toLowerCase().includes('ejemplo')) {
      return 'example';
    } else if (content.toLowerCase().includes('paso')) {
      return 'step_by_step';
    }
    return 'explanation';
  }

  private generateFollowUpSuggestions(language: 'es' | 'en'): string[] {
    if (language === 'es') {
      return [
        'Ver más ejemplos',
        'Practicar con ejercicios',
        'Hacer más preguntas',
      ];
    } else {
      return [
        'See more examples',
        'Practice with exercises',
        'Ask more questions',
      ];
    }
  }
}