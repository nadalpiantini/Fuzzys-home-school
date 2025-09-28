import { NextRequest, NextResponse } from 'next/server';
import { TutorEngine } from '@/services/tutor/tutor-engine';
import { DeepSeekClient } from '@/services/tutor/deepseek-client';
import { z } from 'zod';

// Initialize tutor engine
const deepseekClient = new DeepSeekClient({
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: 'You are Fuzzy, a helpful educational AI tutor.',
});

const tutorEngine = new TutorEngine(deepseekClient);

// Request schemas
const StartSessionSchema = z.object({
  userId: z.string(),
  subject: z.string(),
  studentProfile: z
    .object({
      grade: z.number().int().min(1).max(12),
      learningStyle: z.enum([
        'visual',
        'auditory',
        'kinesthetic',
        'reading_writing',
      ]),
      currentLevel: z.enum(['beginner', 'intermediate', 'advanced']),
      strongAreas: z.array(z.string()),
      challengeAreas: z.array(z.string()),
    })
    .optional(),
});

const QuerySchema = z.object({
  sessionId: z.string(),
  query: z.string(),
  metadata: z
    .object({
      concept: z.string().optional(),
      context: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'start_session': {
        const validatedData = StartSessionSchema.parse(data);
        const session = await tutorEngine.startSession(
          validatedData.userId,
          validatedData.subject,
          validatedData.studentProfile,
        );

        return NextResponse.json({
          success: true,
          data: {
            sessionId: session.id,
            welcomeMessage:
              session.messages[0]?.content || '¡Hola! ¿En qué puedo ayudarte?',
            session: {
              id: session.id,
              subject: session.subject,
              startTime: session.startTime,
              language: session.language,
            },
          },
        });
      }

      case 'send_query': {
        const validatedData = QuerySchema.parse(data);
        const response = await tutorEngine.processQuery(
          validatedData.sessionId,
          validatedData.query,
          validatedData.metadata,
        );

        return NextResponse.json({
          success: true,
          data: {
            response: response.content,
            type: response.type,
            confidence: response.confidence,
            followUpSuggestions: response.followUpSuggestions,
            visualElements: response.visualElements,
            adaptations: response.adaptations,
          },
        });
      }

      case 'check_understanding': {
        const { sessionId, concept } = data;
        if (!sessionId || !concept) {
          return NextResponse.json(
            { success: false, error: 'SessionId and concept are required' },
            { status: 400 },
          );
        }

        const questions = await tutorEngine.generateCheckUnderstanding(
          sessionId,
          concept,
        );

        return NextResponse.json({
          success: true,
          data: {
            questions,
            concept,
          },
        });
      }

      case 'step_by_step': {
        const { sessionId, concept, context } = data;
        if (!sessionId || !concept) {
          return NextResponse.json(
            { success: false, error: 'SessionId and concept are required' },
            { status: 400 },
          );
        }

        const response = await tutorEngine.provideStepByStep(
          sessionId,
          concept,
          context,
        );

        return NextResponse.json({
          success: true,
          data: {
            response: response.content,
            type: response.type,
            followUpSuggestions: response.followUpSuggestions,
          },
        });
      }

      case 'request_examples': {
        const { sessionId, concept, type = 'local' } = data;
        if (!sessionId || !concept) {
          return NextResponse.json(
            { success: false, error: 'SessionId and concept are required' },
            { status: 400 },
          );
        }

        const response = await tutorEngine.requestExamples(
          sessionId,
          concept,
          type as 'local' | 'visual' | 'analogies',
        );

        return NextResponse.json({
          success: true,
          data: {
            response: response.content,
            type: response.type,
            exampleType: type,
          },
        });
      }

      case 'end_session': {
        const { sessionId } = data;
        if (!sessionId) {
          return NextResponse.json(
            { success: false, error: 'SessionId is required' },
            { status: 400 },
          );
        }

        const analytics = await tutorEngine.endSession(sessionId);

        return NextResponse.json({
          success: true,
          data: {
            analytics,
            summary: {
              timeSpent: analytics.metrics.timeSpent,
              questionsAsked: analytics.metrics.questionsAsked,
              conceptsCovered: analytics.metrics.conceptsCovered.length,
              insights: analytics.insights.recommendedNextSteps,
            },
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Tutor API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'health') {
    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  }

  return NextResponse.json(
    { success: false, error: 'Invalid GET action' },
    { status: 400 },
  );
}
