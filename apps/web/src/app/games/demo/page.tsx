import GameRenderer from '@/components/games/GameRenderer';
import { gameFactory } from '@/lib/game-factory/factory';

export default function DemoPage() {
  // Generar un juego de demostración
  const demoGame = gameFactory.createGame({
    type: 'multiple-choice',
    subject: 'mathematics',
    grade: '5',
    difficulty: 'beginner',
    title: 'Demo Game',
    description: 'A demonstration game',
    content: {
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      explanation: '2 + 2 equals 4',
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Demo Game</h1>
      <GameRenderer game={demoGame} />
    </div>
  );
}
