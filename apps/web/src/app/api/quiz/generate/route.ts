import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { subject, level, language = 'es' } = await request.json()

    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }

    // Generate quiz questions based on subject and level
    const questions = generateQuizQuestions(subject, level, language)

    return NextResponse.json({ 
      quiz: {
        id: `quiz_${Date.now()}`,
        subject,
        level,
        language,
        questions,
        totalQuestions: questions.length,
        timeLimit: 30 * questions.length // 30 seconds per question
      }
    })

  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' }, 
      { status: 500 }
    )
  }
}

function generateQuizQuestions(subject: string, level: string, language: string) {
  const questionTemplates = {
    math: {
      es: [
        {
          type: 'mcq',
          question: '¿Cuál es el resultado de 15 + 27?',
          options: [
            { id: 'a', text: '42', correct: true },
            { id: 'b', text: '32', correct: false },
            { id: 'c', text: '52', correct: false },
            { id: 'd', text: '22', correct: false }
          ],
          explanation: '15 + 27 = 42'
        },
        {
          type: 'true_false',
          question: 'El número 7 es un número primo.',
          correctAnswer: true,
          explanation: 'Un número primo solo es divisible por 1 y por sí mismo. 7 cumple esta condición.'
        }
      ],
      en: [
        {
          type: 'mcq',
          question: 'What is the result of 15 + 27?',
          options: [
            { id: 'a', text: '42', correct: true },
            { id: 'b', text: '32', correct: false },
            { id: 'c', text: '52', correct: false },
            { id: 'd', text: '22', correct: false }
          ],
          explanation: '15 + 27 = 42'
        },
        {
          type: 'true_false',
          question: 'The number 7 is a prime number.',
          correctAnswer: true,
          explanation: 'A prime number is only divisible by 1 and itself. 7 meets this condition.'
        }
      ]
    },
    science: {
      es: [
        {
          type: 'mcq',
          question: '¿Cuál es el planeta más cercano al Sol?',
          options: [
            { id: 'a', text: 'Venus', correct: false },
            { id: 'b', text: 'Mercurio', correct: true },
            { id: 'c', text: 'Tierra', correct: false },
            { id: 'd', text: 'Marte', correct: false }
          ],
          explanation: 'Mercurio es el planeta más cercano al Sol en nuestro sistema solar.'
        }
      ],
      en: [
        {
          type: 'mcq',
          question: 'Which is the closest planet to the Sun?',
          options: [
            { id: 'a', text: 'Venus', correct: false },
            { id: 'b', text: 'Mercury', correct: true },
            { id: 'c', text: 'Earth', correct: false },
            { id: 'd', text: 'Mars', correct: false }
          ],
          explanation: 'Mercury is the closest planet to the Sun in our solar system.'
        }
      ]
    }
  }

  const templates = questionTemplates[subject as keyof typeof questionTemplates]
  if (!templates) {
    return []
  }

  const questions = templates[language as keyof typeof templates]
  return questions || []
}
