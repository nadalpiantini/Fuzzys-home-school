import { NextRequest, NextResponse } from 'next/server';
import { aiGameGenerator } from '@/lib/game-factory/ai-generator';
import { AIGameGenerationRequest } from '@/lib/game-factory/ai-generator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      type,
      subject,
      grade,
      difficulty,
      theme,
      customPrompt,
      learningObjectives,
      prerequisites,
      targetAudience,
    } = body;

    // Validate required fields
    if (!type || !subject || !grade || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: type, subject, grade, difficulty' },
        { status: 400 },
      );
    }

    const gameRequest: AIGameGenerationRequest = {
      type,
      subject,
      grade,
      difficulty,
      theme,
      customPrompt,
      learningObjectives,
      prerequisites,
      targetAudience,
    };

    // Generate game using AI
    const result = await aiGameGenerator.generateGame(gameRequest);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate game' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      game: result.game,
      suggestions: result.suggestions,
      alternatives: result.alternatives,
    });
  } catch (error) {
    console.error('Game generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const difficulty = searchParams.get('difficulty');

    // Generate multiple game suggestions
    const suggestions = await generateGameSuggestions(
      subject,
      grade,
      difficulty,
    );

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Game suggestions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function generateGameSuggestions(
  subject: string | null,
  grade: string | null,
  difficulty: string | null,
) {
  // This would integrate with the brain system to generate intelligent suggestions
  // For now, return mock suggestions based on the parameters

  const baseSuggestions = [
    {
      type: 'multiple-choice',
      title: 'Quiz Interactivo',
      description: 'Preguntas de opción múltiple adaptativas',
      difficulty: 'beginner',
      estimatedTime: '10-15 min',
      learningObjectives: ['Evaluar comprensión', 'Reforzar conceptos'],
    },
    {
      type: 'drag-drop',
      title: 'Clasificación Interactiva',
      description: 'Arrastra y suelta elementos en categorías',
      difficulty: 'intermediate',
      estimatedTime: '15-20 min',
      learningObjectives: [
        'Organizar información',
        'Desarrollar categorización',
      ],
    },
    {
      type: 'blockly-puzzle',
      title: 'Programación Visual',
      description: 'Resuelve puzzles usando bloques de programación',
      difficulty: 'beginner',
      estimatedTime: '20-30 min',
      learningObjectives: ['Pensamiento lógico', 'Programación básica'],
    },
  ];

  // Filter suggestions based on parameters
  let filteredSuggestions = baseSuggestions;

  if (subject) {
    filteredSuggestions = filteredSuggestions.filter((s) =>
      s.learningObjectives.some((obj) =>
        obj.toLowerCase().includes(subject.toLowerCase()),
      ),
    );
  }

  if (grade) {
    const gradeNum = parseInt(grade);
    if (gradeNum <= 5) {
      filteredSuggestions = filteredSuggestions.filter(
        (s) => s.difficulty === 'beginner',
      );
    } else if (gradeNum >= 9) {
      filteredSuggestions = filteredSuggestions.filter(
        (s) => s.difficulty === 'intermediate' || s.difficulty === 'advanced',
      );
    }
  }

  if (difficulty) {
    filteredSuggestions = filteredSuggestions.filter(
      (s) => s.difficulty === difficulty,
    );
  }

  return filteredSuggestions;
}
