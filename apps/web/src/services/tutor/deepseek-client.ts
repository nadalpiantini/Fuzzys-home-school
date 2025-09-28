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

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export class DeepSeekClient {
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
    try {
      // Prepare system prompt with context
      const systemPrompt = this.buildSystemPrompt(context);

      const response = await fetch(
        `${this.config.baseURL}/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `DeepSeek API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Parse and structure the response
      return this.parseResponse(content, context);
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);

      // Fallback response
      return {
        content:
          context.language === 'es'
            ? 'Lo siento, estoy teniendo problemas técnicos. ¿Podrías repetir tu pregunta?'
            : "Sorry, I'm having technical issues. Could you repeat your question?",
        type: 'clarification',
        confidence: 0.1,
      };
    }
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
    const prompt =
      context.language === 'es'
        ? `
      Analiza la respuesta del estudiante para determinar su nivel de comprensión del concepto "${concept}" en ${context.subject} para grado ${context.grade}.

      Respuesta del estudiante: "${studentResponse}"

      Evalúa en una escala de 0-100% y clasifica como:
      - no_understanding (0-20%): No comprende el concepto básico
      - minimal_understanding (21-40%): Comprensión muy limitada
      - partial_understanding (41-60%): Comprensión parcial con confusiones
      - good_understanding (61-80%): Buena comprensión con pequeñas lagunas
      - excellent_understanding (81-100%): Comprensión completa y clara

      Responde en formato JSON:
      {
        "level": "nivel_detectado",
        "reasoning": "explicación_breve",
        "nextAction": "acción_recomendada"
      }
    `
        : `
      Analyze the student's response to determine their understanding level of the concept "${concept}" in ${context.subject} for grade ${context.grade}.

      Student response: "${studentResponse}"

      Evaluate on a 0-100% scale and classify as:
      - no_understanding (0-20%): Doesn't understand the basic concept
      - minimal_understanding (21-40%): Very limited understanding
      - partial_understanding (41-60%): Partial understanding with confusion
      - good_understanding (61-80%): Good understanding with small gaps
      - excellent_understanding (81-100%): Complete and clear understanding

      Respond in JSON format:
      {
        "level": "detected_level",
        "reasoning": "brief_explanation",
        "nextAction": "recommended_action"
      }
    `;

    try {
      const response = await fetch(
        `${this.config.baseURL}/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3, // Lower temperature for more consistent analysis
            max_tokens: 300,
          }),
        },
      );

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(content);
        return {
          level: parsed.level as UnderstandingLevel,
          reasoning: parsed.reasoning,
          nextAction: parsed.nextAction,
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          level: 'partial_understanding',
          reasoning: 'Unable to analyze response properly',
          nextAction: 'Ask clarifying questions',
        };
      }
    } catch (error) {
      console.error('Error detecting understanding:', error);
      return {
        level: 'partial_understanding',
        reasoning: 'Technical error in analysis',
        nextAction: 'Continue with explanation',
      };
    }
  }

  async generateFollowUpQuestions(
    concept: string,
    currentUnderstanding: UnderstandingLevel,
    context: { subject: string; grade: number; language: 'es' | 'en' },
  ): Promise<string[]> {
    const prompt =
      context.language === 'es'
        ? `
      Genera 3 preguntas de seguimiento para verificar la comprensión del concepto "${concept}" en ${context.subject} para grado ${context.grade}.

      Nivel actual de comprensión: ${currentUnderstanding}

      Las preguntas deben:
      1. Ser apropiadas para el nivel de grado
      2. Ayudar a clarificar puntos específicos de confusión
      3. Fomentar el pensamiento crítico
      4. Ser formuladas de manera amigable y motivadora

      Responde solo con las 3 preguntas, una por línea.
    `
        : `
      Generate 3 follow-up questions to verify understanding of the concept "${concept}" in ${context.subject} for grade ${context.grade}.

      Current understanding level: ${currentUnderstanding}

      Questions should:
      1. Be appropriate for the grade level
      2. Help clarify specific confusion points
      3. Encourage critical thinking
      4. Be phrased in a friendly and motivating way

      Respond with only the 3 questions, one per line.
    `;

    try {
      const response = await fetch(
        `${this.config.baseURL}/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 400,
          }),
        },
      );

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content || '';

      return content
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .slice(0, 3);
    } catch (error) {
      console.error('Error generating follow-up questions:', error);

      // Fallback questions
      return context.language === 'es'
        ? [
            '¿Puedes explicarme con tus propias palabras lo que acabamos de ver?',
            '¿Qué parte te parece más difícil de entender?',
            '¿Puedes darme un ejemplo de esto en la vida real?',
          ]
        : [
            'Can you explain what we just covered in your own words?',
            'What part seems most difficult to understand?',
            'Can you give me a real-life example of this?',
          ];
    }
  }

  private buildSystemPrompt(context: {
    subject: string;
    grade: number;
    age?: number;
    queryType: QueryType;
    understandingLevel: UnderstandingLevel;
    language: 'es' | 'en';
    learningStyle?: string;
  }): string {
    // Determinar nivel de complejidad basado en edad
    const age = context.age || context.grade + 5; // Estimación si no hay edad
    const isYoungChild = age <= 8;
    const isElementary = age <= 12;

    const ageSpecificInstructions = isYoungChild
      ? `
      ADAPTACIÓN PARA NIÑOS PEQUEÑOS (${age} años):
      - NUNCA uses fórmulas químicas, símbolos matemáticos complejos o notación científica
      - Usa lenguaje simple y palabras que un niño de ${age} años entendería
      - Enfócate en conceptos básicos y ejemplos de la vida cotidiana
      - Usa analogías con cosas que los niños conocen (juegos, comida, familia)
      - Evita términos técnicos complejos
      - Mantén las explicaciones muy cortas (50-100 palabras máximo)
      - Usa emojis y lenguaje motivador
      `
      : isElementary
        ? `
      ADAPTACIÓN PARA NIÑOS DE PRIMARIA (${age} años):
      - Evita fórmulas químicas complejas y notación científica avanzada
      - Usa ejemplos simples y analogías familiares
      - Explica conceptos paso a paso de manera clara
      - Mantén respuestas entre 100-150 palabras
      `
        : `
      ADAPTACIÓN PARA ADOLESCENTES (${age} años):
      - Puedes usar conceptos más avanzados apropiados para la edad
      - Incluye ejemplos relevantes y aplicaciones prácticas
      - Mantén respuestas entre 150-200 palabras
      `;

    const basePrompt =
      context.language === 'es'
        ? `
      Eres Fuzzy, un tutor de IA amigable y paciente especializado en educación dominicana. Tu objetivo es ayudar a estudiantes de ${age} años (grado ${context.grade}) a entender ${context.subject}.

      CARACTERÍSTICAS CLAVE:
      - Habla de manera natural y amigable, como un tutor experimentado
      - Adapta tu lenguaje específicamente a la edad de ${age} años
      - Usa ejemplos relevantes para República Dominicana
      - Detecta confusión y ajusta tu enfoque automáticamente
      - Fomenta el pensamiento crítico con preguntas guía

      CONTEXTO ACTUAL:
      - Materia: ${context.subject}
      - Edad del estudiante: ${age} años
      - Grado: ${context.grade}
      - Tipo de consulta: ${context.queryType}
      - Nivel de comprensión detectado: ${context.understandingLevel}
      ${context.learningStyle ? `- Estilo de aprendizaje: ${context.learningStyle}` : ''}

      ${ageSpecificInstructions}

      ESTRATEGIAS DE RESPUESTA:
      1. Si no entiende: Usa analogías simples y ejemplos cotidianos
      2. Si comprende parcialmente: Aclara puntos específicos de confusión
      3. Si comprende bien: Profundiza y conecta con otros conceptos
      4. Siempre termina verificando comprensión con una pregunta

      INSTRUCCIONES ESPECÍFICAS:
      - Usa ejemplos dominicanos cuando sea posible
      - Si sugiere práctica, que sea específica y alcanzable
      - Celebra el progreso y mantén motivación alta
      - NUNCA uses fórmulas químicas complejas para niños menores de 9 años
    `
        : `
      You are Fuzzy, a friendly and patient AI tutor specialized in Dominican education. Your goal is to help ${age}-year-old students (grade ${context.grade}) understand ${context.subject}.

      KEY CHARACTERISTICS:
      - Speak naturally and friendly, like an experienced tutor
      - Adapt your language specifically to ${age}-year-old students
      - Use examples relevant to Dominican Republic
      - Detect confusion and adjust your approach automatically
      - Encourage critical thinking with guiding questions

      CURRENT CONTEXT:
      - Subject: ${context.subject}
      - Student age: ${age} years
      - Grade: ${context.grade}
      - Query type: ${context.queryType}
      - Detected understanding level: ${context.understandingLevel}
      ${context.learningStyle ? `- Learning style: ${context.learningStyle}` : ''}

      ${ageSpecificInstructions}

      RESPONSE STRATEGIES:
      1. If doesn't understand: Use simple analogies and everyday examples
      2. If partially understands: Clarify specific confusion points
      3. If understands well: Deepen and connect to other concepts
      4. Always end by checking understanding with a question

      SPECIFIC INSTRUCTIONS:
      - Use Dominican examples when possible
      - If suggesting practice, make it specific and achievable
      - Celebrate progress and maintain high motivation
      - NEVER use complex chemical formulas for children under 9 years old
    `;

    return basePrompt;
  }

  private parseResponse(content: string, context: any): TutorResponse {
    // Simple parsing - in production this would be more sophisticated
    let type: TutorResponse['type'] = 'explanation';

    if (content.includes('?')) {
      type = 'socratic_question';
    } else if (
      content.toLowerCase().includes('ejemplo') ||
      content.toLowerCase().includes('example')
    ) {
      type = 'example';
    } else if (
      content.toLowerCase().includes('paso') ||
      content.toLowerCase().includes('step')
    ) {
      type = 'step_by_step';
    } else if (
      content.toLowerCase().includes('práctica') ||
      content.toLowerCase().includes('practice')
    ) {
      type = 'practice_suggestion';
    }

    return {
      content: content.trim(),
      type,
      confidence: 0.8, // Would be calculated based on various factors
      followUpSuggestions: this.extractFollowUpSuggestions(
        content,
        context.language,
      ),
    };
  }

  private extractFollowUpSuggestions(
    content: string,
    language: 'es' | 'en',
  ): string[] {
    // Extract potential follow-up actions from the response
    const suggestions: string[] = [];

    if (language === 'es') {
      if (content.includes('práctica') || content.includes('ejercicio')) {
        suggestions.push('Realizar ejercicios prácticos');
      }
      if (content.includes('ejemplo') || content.includes('demostración')) {
        suggestions.push('Ver más ejemplos');
      }
      if (content.includes('pregunta') || content.includes('duda')) {
        suggestions.push('Hacer más preguntas');
      }
    } else {
      if (content.includes('practice') || content.includes('exercise')) {
        suggestions.push('Do practice exercises');
      }
      if (content.includes('example') || content.includes('demonstration')) {
        suggestions.push('See more examples');
      }
      if (content.includes('question') || content.includes('doubt')) {
        suggestions.push('Ask more questions');
      }
    }

    return suggestions;
  }
}
