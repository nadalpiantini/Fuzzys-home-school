import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

export async function POST(request: NextRequest) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DeepSeek API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, language = 'es', context, systemPrompt } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Prepare the system prompt based on language and context
    const defaultSystemPrompt = language === 'es'
      ? `Eres Fuzzy, un tutor educativo amigable y paciente para estudiantes de secundaria en República Dominicana.
         Explicas conceptos de manera clara y simple, usando ejemplos locales cuando sea posible.
         Siempre respondes en español y adaptas tu lenguaje al nivel del estudiante.
         ${context ? `Contexto adicional: ${context}` : ''}`
      : `You are Fuzzy, a friendly and patient educational tutor for middle school students in Dominican Republic.
         You explain concepts clearly and simply, using local examples when possible.
         Always respond in English and adapt your language to the student's level.
         ${context ? `Additional context: ${context}` : ''}`;

    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

    // Call DeepSeek API
    const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);

      return NextResponse.json(
        {
          error: 'Failed to get AI response',
          details: process.env.NODE_ENV === 'development' ? errorText : undefined
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      response: aiResponse,
      usage: data.usage,
      model: data.model,
    });

  } catch (error) {
    console.error('Error in DeepSeek API route:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    configured: !!DEEPSEEK_API_KEY,
    model: DEEPSEEK_MODEL,
    baseUrl: DEEPSEEK_BASE_URL,
  });
}