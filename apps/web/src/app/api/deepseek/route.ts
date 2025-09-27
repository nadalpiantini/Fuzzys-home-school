import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, language = 'es' } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: language === 'es' 
              ? 'Eres un tutor educativo inteligente especializado en ayudar estudiantes. Responde de manera clara, educativa y motivadora. Adapta tu respuesta al nivel del estudiante.'
              : 'You are an intelligent educational tutor specialized in helping students. Respond clearly, educationally and motivatingly. Adapt your response to the student\'s level.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || 'No response generated'

    return NextResponse.json({ 
      response: aiResponse,
      usage: data.usage 
    })

  } catch (error) {
    console.error('DeepSeek API error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' }, 
      { status: 500 }
    )
  }
}
