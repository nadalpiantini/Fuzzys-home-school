'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Trophy, Timer, Play, User } from 'lucide-react';

interface LiveQuizProps {
  mode: 'host' | 'player';
  quizId?: string;
  onJoin?: (pin: string, nickname: string) => void;
  onStart?: () => void;
  onAnswer?: (answer: string) => void;
}

interface Player {
  id: string;
  nickname: string;
  score: number;
  answered: boolean;
}

interface Question {
  id: string;
  type: 'mcq';
  stem: string;
  choices: Array<{ id: string; text: string }>;
  timeLimit: number;
}

interface GameState {
  status: 'waiting' | 'question' | 'results' | 'leaderboard' | 'finished';
  pin?: string;
  players: Player[];
  currentQuestion?: Question;
  questionNumber?: number;
  totalQuestions?: number;
  timeRemaining?: number;
  leaderboard?: Player[];
}

export const LiveQuiz: React.FC<LiveQuizProps> = ({
  mode,
  quizId,
  onJoin,
  onStart,
  onAnswer,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    players: [],
  });

  const [joinPin, setJoinPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Shuffle choices to randomize order
  const shuffledChoices = useMemo(() => {
    if (!gameState.currentQuestion?.choices) return [];
    return [...gameState.currentQuestion.choices].sort(
      () => Math.random() - 0.5,
    );
  }, [gameState.currentQuestion]);

  // Mock data for demonstration
  useEffect(() => {
    if (mode === 'host' && quizId) {
      setGameState({
        status: 'waiting',
        pin: '123456',
        players: [
          { id: '1', nickname: 'Juan', score: 0, answered: false },
          { id: '2', nickname: 'María', score: 0, answered: false },
        ],
      });
    }
  }, [mode, quizId]);

  const handleJoinGame = () => {
    if (onJoin && joinPin && nickname) {
      onJoin(joinPin, nickname);
    }
  };

  const handleStartGame = () => {
    if (onStart) {
      onStart();
    }
    setGameState((prev) => ({
      ...prev,
      status: 'question',
      questionNumber: 1,
      totalQuestions: 5,
      timeRemaining: 30,
      currentQuestion: {
        id: '1',
        type: 'mcq',
        stem: '¿Cuál es la capital de República Dominicana?',
        choices: [
          { id: 'a', text: 'Santo Domingo' },
          { id: 'b', text: 'Santiago' },
          { id: 'c', text: 'La Romana' },
          { id: 'd', text: 'Puerto Plata' },
        ],
        timeLimit: 30,
      },
    }));
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer && onAnswer && !hasAnswered) {
      onAnswer(selectedAnswer);
      setHasAnswered(true);
    }
  };

  const getAnswerButtonColor = (choiceId: string) => {
    const colors = {
      a: 'bg-red-500 hover:bg-red-600',
      b: 'bg-blue-500 hover:bg-blue-600',
      c: 'bg-yellow-500 hover:bg-yellow-600',
      d: 'bg-green-500 hover:bg-green-600',
    };
    return colors[choiceId as keyof typeof colors] || 'bg-gray-500';
  };

  // Host View - Waiting Room
  if (mode === 'host' && gameState.status === 'waiting') {
    return (
      <Card className="p-8 max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Quiz en Vivo</h2>

          <div className="bg-blue-100 rounded-lg p-6">
            <p className="text-lg text-gray-600 mb-2">PIN del juego:</p>
            <p className="text-5xl font-bold text-blue-600">{gameState.pin}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium">
                <Users className="inline mr-2" />
                Jugadores conectados: {gameState.players.length}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className="bg-white px-3 py-2 rounded-lg shadow-sm"
                >
                  <User className="inline w-4 h-4 mr-1" />
                  {player.nickname}
                </div>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleStartGame}
            disabled={gameState.players.length < 2}
            className="w-full"
          >
            <Play className="mr-2" />
            Iniciar Juego
          </Button>
        </div>
      </Card>
    );
  }

  // Host View - Question Display
  if (mode === 'host' && gameState.status === 'question') {
    return (
      <Card className="p-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-lg">
              Pregunta {gameState.questionNumber} de {gameState.totalQuestions}
            </span>
            <div className="flex items-center space-x-2 text-lg">
              <Timer className="w-5 h-5" />
              <span className="font-bold">{gameState.timeRemaining}s</span>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">
              {gameState.currentQuestion?.stem}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {shuffledChoices.map((choice) => (
                <div
                  key={choice.id}
                  className={`p-6 rounded-lg text-white font-medium ${getAnswerButtonColor(choice.id)}`}
                >
                  {choice.text}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-center text-gray-600">
              {gameState.players.filter((p) => p.answered).length} de{' '}
              {gameState.players.length} jugadores han respondido
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Player View - Join Game
  if (mode === 'player' && !nickname) {
    return (
      <Card className="p-8 max-w-md mx-auto">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Unirse al Quiz</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              PIN del juego
            </label>
            <Input
              type="text"
              value={joinPin}
              onChange={(e) => setJoinPin(e.target.value)}
              placeholder="123456"
              className="text-center text-2xl font-bold"
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tu nombre</label>
            <Input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 20))}
              placeholder="Ingresa tu nombre"
              maxLength={20}
            />
          </div>

          <Button
            onClick={handleJoinGame}
            disabled={!joinPin || !nickname}
            className="w-full"
            size="lg"
          >
            Unirse al Juego
          </Button>
        </div>
      </Card>
    );
  }

  // Player View - Answer Question
  if (mode === 'player' && gameState.status === 'question') {
    return (
      <Card className="p-8 max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg mb-2">Pregunta {gameState.questionNumber}</p>
            <div className="flex items-center justify-center space-x-2 text-xl">
              <Timer className="w-5 h-5" />
              <span className="font-bold">{gameState.timeRemaining}s</span>
            </div>
          </div>

          {!hasAnswered ? (
            <>
              <p className="text-center text-gray-600">
                Selecciona tu respuesta:
              </p>

              <div className="grid grid-cols-2 gap-3">
                {['a', 'b', 'c', 'd'].map((choice) => (
                  <Button
                    key={choice}
                    onClick={() => {
                      setSelectedAnswer(choice);
                      handleAnswerSubmit();
                    }}
                    className={`h-24 ${getAnswerButtonColor(choice)} text-white`}
                  >
                    <span className="text-3xl font-bold">
                      {choice.toUpperCase()}
                    </span>
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✓</div>
              <p className="text-xl font-medium">¡Respuesta enviada!</p>
              <p className="text-gray-600 mt-2">
                Esperando a los demás jugadores...
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Leaderboard View
  if (gameState.status === 'leaderboard') {
    return (
      <Card className="p-8 max-w-2xl mx-auto">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">
            <Trophy className="inline mr-2 text-yellow-500" />
            Tabla de Posiciones
          </h2>

          <div className="space-y-3">
            {gameState.leaderboard?.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0
                    ? 'bg-yellow-100'
                    : index === 1
                      ? 'bg-gray-100'
                      : index === 2
                        ? 'bg-orange-100'
                        : 'bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold">{index + 1}</span>
                  <span className="text-lg font-medium">{player.nickname}</span>
                </div>
                <span className="text-xl font-bold">{player.score} pts</span>
              </div>
            ))}
          </div>

          {mode === 'host' && (
            <Button onClick={() => {}} className="w-full" size="lg">
              Siguiente Pregunta
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return null;
};
