import { NextResponse } from 'next/server';
import {
  buildSystemPrompt,
  buildWelcomeMessage,
  buildErrorEncouragement,
  TutorContext,
} from '@/lib/tutor/compose';
import { DeepSeekClient } from '@/services/tutor/deepseek-client';

export const runtime = 'nodejs';

// Instancia del cliente DeepSeek
const deepseekClient = new DeepSeekClient({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: 'Eres un tutor educativo amigable y motivador.',
});

// Simulación de sesiones en memoria (en producción usar DB)
const sessions = new Map<
  string,
  {
    id: string;
    userId: string;
    subject: string;
    messages: Array<{ role: string; content: string; timestamp: Date }>;
    context: TutorContext;
  }
>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, subject, sessionId, query, metadata } = body;

    if (action === 'start_session') {
      // Crear nueva sesión
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const context: TutorContext = {
        materia: subject || 'Ciencias Naturales',
        edad: body.studentProfile?.age || 8,
        grado: body.studentProfile?.grade || 3,
        idioma: 'es',
        estiloAprendizaje: body.studentProfile?.learningStyle,
      };

      sessions.set(newSessionId, {
        id: newSessionId,
        userId: userId || 'current_user',
        subject: subject || 'Ciencias Naturales',
        messages: [],
        context,
      });

      const welcomeMessage = buildWelcomeMessage(context);

      return NextResponse.json({
        success: true,
        data: {
          sessionId: newSessionId,
          welcomeMessage,
        },
      });
    }

    if (action === 'send_query') {
      const session = sessions.get(sessionId);
      if (!session) {
        return NextResponse.json(
          {
            success: false,
            error: 'Sesión no encontrada',
          },
          { status: 404 },
        );
      }

      // Agregar mensaje del usuario
      session.messages.push({
        role: 'user',
        content: query,
        timestamp: new Date(),
      });

      // Generar respuesta usando el sistema centralizado
      const systemPrompt = buildSystemPrompt(session.context);

      // Construir historial de mensajes
      const messageHistory = session.messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Generar respuesta con DeepSeek
      const response = await deepseekClient.generateResponse(messageHistory, {
        subject: session.subject,
        grade: session.context.grado || 3,
        queryType: 'question' as any,
        understandingLevel: 'beginner' as any,
        language: session.context.idioma || 'es',
        learningStyle: session.context.estiloAprendizaje,
      });

      // Agregar respuesta a la sesión
      session.messages.push({
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      });

      // Telemetría ligera
      console.log(
        `[TUTOR] Reply generated for session ${sessionId}, persona: fuzzy-v1-${session.context.idioma}`,
      );

      return NextResponse.json({
        success: true,
        data: {
          response: response.content,
          sessionId,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Acción no válida',
      },
      { status: 400 },
    );
  } catch (error) {
    console.error('Error in tutor API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 },
    );
  }
}
