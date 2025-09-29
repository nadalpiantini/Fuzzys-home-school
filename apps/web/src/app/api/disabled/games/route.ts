import { NextRequest, NextResponse } from 'next/server';

// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const subject = searchParams.get('subject');
    const level = searchParams.get('level');

    // Generate game based on type
    const game = generateGame(type, subject, level);

    return NextResponse.json({ game });
  } catch (error) {
    console.error('Game generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate game' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gameId, answers, userId } = await request.json();

    if (!gameId || !answers) {
      return NextResponse.json(
        { error: 'Game ID and answers are required' },
        { status: 400 },
      );
    }

    // Calculate score and provide feedback
    const result = calculateGameScore(gameId, answers);

    return NextResponse.json({
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      feedback: result.feedback,
      correctAnswers: result.correctAnswers,
    });
  } catch (error) {
    console.error('Game scoring error:', error);
    return NextResponse.json(
      { error: 'Failed to score game' },
      { status: 500 },
    );
  }
}

function generateGame(
  type: string | null,
  subject: string | null,
  level: string | null,
) {
  const gameTypes = {
    dragdrop: {
      id: `dragdrop_${Date.now()}`,
      title: 'Drag and Drop Game',
      items: [
        { id: 'item1', content: 'Mammal', targetZone: 'animals' },
        { id: 'item2', content: 'Tree', targetZone: 'plants' },
        { id: 'item3', content: 'Fish', targetZone: 'animals' },
        { id: 'item4', content: 'Flower', targetZone: 'plants' },
      ],
      zones: [
        { id: 'animals', label: 'Animals' },
        { id: 'plants', label: 'Plants' },
      ],
    },
    hotspot: {
      id: `hotspot_${Date.now()}`,
      title: 'Hotspot Game',
      image: '/api/placeholder/400/300',
      hotspots: [
        { id: 'hotspot1', x: 25, y: 30, width: 50, height: 40, correct: true },
        { id: 'hotspot2', x: 70, y: 60, width: 30, height: 30, correct: false },
      ],
      targets: [
        { x: 25, y: 30, correct: true, radius: 25 },
        { x: 70, y: 60, correct: false, radius: 15 },
      ],
    },
    mcq: {
      id: `mcq_${Date.now()}`,
      title: 'Multiple Choice Question',
      question: 'What is the capital of France?',
      options: [
        { id: 'a', text: 'London', correct: false },
        { id: 'b', text: 'Paris', correct: true },
        { id: 'c', text: 'Berlin', correct: false },
        { id: 'd', text: 'Madrid', correct: false },
      ],
      explanation: 'Paris is the capital and largest city of France.',
    },
  };

  return gameTypes[type as keyof typeof gameTypes] || gameTypes.mcq;
}

function calculateGameScore(gameId: string, answers: any) {
  // Mock scoring logic - in real implementation, this would query the database
  const mockScore = Math.floor(Math.random() * 10) + 1;
  const maxScore = 10;

  return {
    score: mockScore,
    maxScore: maxScore,
    percentage: Math.round((mockScore / maxScore) * 100),
    feedback:
      mockScore >= 8
        ? 'Excellent!'
        : mockScore >= 6
          ? 'Good job!'
          : 'Keep practicing!',
    correctAnswers: answers,
  };
}
