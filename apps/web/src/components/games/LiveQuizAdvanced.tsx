'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Trophy,
  Timer,
  Play,
  User,
  Crown,
  Zap,
  Star,
  Flame,
  Heart,
  Target,
  Medal,
  Volume2,
  VolumeX,
  Settings,
  Share2,
  BarChart3,
  Gift,
} from 'lucide-react';

interface LiveQuizAdvancedProps {
  mode: 'host' | 'player';
  quizId?: string;
  onJoin?: (pin: string, nickname: string) => void;
  onStart?: () => void;
  onAnswer?: (answer: string, responseTime: number) => void;
  onClose?: () => void;
}

interface Player {
  id: string;
  nickname: string;
  score: number;
  answered: boolean;
  streak: number;
  correctAnswers: number;
  totalAnswers: number;
  averageResponseTime: number;
  powerUps: PowerUp[];
  avatar?: string;
  team?: string;
}

interface PowerUp {
  type: 'double_points' | 'freeze_time' | 'eliminate_wrong' | 'second_chance';
  name: string;
  icon: string;
  duration?: number;
  used: boolean;
}

interface Question {
  id: string;
  type: 'mcq' | 'true_false' | 'fill_blank';
  stem: string;
  choices?: Array<{ id: string; text: string; correct: boolean }>;
  timeLimit: number;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}

interface GameSettings {
  timePerQuestion: number;
  pointsPerCorrect: number;
  streakBonus: boolean;
  powerUpsEnabled: boolean;
  teamMode: boolean;
  soundEffects: boolean;
  showLeaderboardAfterEach: boolean;
}

interface GameState {
  status:
    | 'lobby'
    | 'countdown'
    | 'question'
    | 'results'
    | 'leaderboard'
    | 'finished';
  pin?: string;
  players: Player[];
  currentQuestion?: Question;
  questionNumber?: number;
  totalQuestions?: number;
  timeRemaining?: number;
  leaderboard?: Player[];
  settings: GameSettings;
  answers?: Array<{
    playerId: string;
    choice: string;
    responseTime: number;
    correct: boolean;
  }>;
  countdownValue?: number;
}

const DEFAULT_POWERUPS: PowerUp[] = [
  { type: 'double_points', name: 'Puntos Dobles', icon: '2️⃣', used: false },
  {
    type: 'freeze_time',
    name: 'Congelar Tiempo',
    icon: '❄️',
    duration: 5,
    used: false,
  },
  {
    type: 'eliminate_wrong',
    name: 'Eliminar Incorrectas',
    icon: '🎯',
    used: false,
  },
  {
    type: 'second_chance',
    name: 'Segunda Oportunidad',
    icon: '🔄',
    used: false,
  },
];

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    type: 'mcq',
    stem: '¿Cuál es la capital de República Dominicana?',
    choices: [
      { id: 'a', text: 'Santo Domingo', correct: true },
      { id: 'b', text: 'Santiago', correct: false },
      { id: 'c', text: 'La Romana', correct: false },
      { id: 'd', text: 'Puerto Plata', correct: false },
    ],
    timeLimit: 20,
    points: 100,
    difficulty: 'easy',
    category: 'Geografía',
  },
  {
    id: '2',
    type: 'mcq',
    stem: '¿En qué año se independizó República Dominicana?',
    choices: [
      { id: 'a', text: '1821', correct: false },
      { id: 'b', text: '1844', correct: true },
      { id: 'c', text: '1865', correct: false },
      { id: 'd', text: '1898', correct: false },
    ],
    timeLimit: 25,
    points: 150,
    difficulty: 'medium',
    category: 'Historia',
  },
];

export const LiveQuizAdvanced: React.FC<LiveQuizAdvancedProps> = ({
  mode,
  quizId,
  onJoin,
  onStart,
  onAnswer,
  onClose,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    status: 'lobby',
    players: [],
    settings: {
      timePerQuestion: 20,
      pointsPerCorrect: 100,
      streakBonus: true,
      powerUpsEnabled: true,
      teamMode: false,
      soundEffects: true,
      showLeaderboardAfterEach: true,
    },
  });

  const [joinPin, setJoinPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<PowerUp | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  // Shuffle choices to randomize order
  const shuffledChoices = useMemo(() => {
    if (!gameState.currentQuestion?.choices) return [];
    return [...gameState.currentQuestion.choices].sort(
      () => Math.random() - 0.5,
    );
  }, [gameState.currentQuestion]);
  const [showSettings, setShowSettings] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound effects
  const playSound = (
    type: 'correct' | 'incorrect' | 'countdown' | 'powerup',
  ) => {
    if (!gameState.settings.soundEffects) return;

    // In a real implementation, you would load and play actual sound files
    console.log(`Playing ${type} sound`);
  };

  // Mock game initialization
  useEffect(() => {
    if (mode === 'host' && quizId) {
      setGameState((prev) => ({
        ...prev,
        pin: generateGamePin(),
        totalQuestions: SAMPLE_QUESTIONS.length,
        players: [
          {
            id: '1',
            nickname: 'Juan',
            score: 0,
            answered: false,
            streak: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            averageResponseTime: 0,
            powerUps: [...DEFAULT_POWERUPS],
            avatar: '🧑',
          },
          {
            id: '2',
            nickname: 'María',
            score: 0,
            answered: false,
            streak: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            averageResponseTime: 0,
            powerUps: [...DEFAULT_POWERUPS],
            avatar: '👩',
          },
        ],
      }));
    }
  }, [mode, quizId]);

  // Timer management
  useEffect(() => {
    if (
      gameState.status === 'question' &&
      gameState.timeRemaining !== undefined
    ) {
      timerRef.current = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          timeRemaining: Math.max(0, (prev.timeRemaining || 0) - 1),
        }));
      }, 1000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [gameState.timeRemaining, gameState.status]);

  const generateGamePin = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleJoinGame = () => {
    if (onJoin && joinPin && nickname) {
      onJoin(joinPin, nickname);
      // Mock successful join
      setGameState((prev) => ({
        ...prev,
        status: 'lobby',
      }));
    }
  };

  const handleStartGame = () => {
    if (onStart) onStart();

    setGameState((prev) => ({
      ...prev,
      status: 'countdown',
      countdownValue: 3,
    }));

    // Countdown sequence
    const countdown = setInterval(() => {
      setGameState((prev) => {
        if (prev.countdownValue === 1) {
          clearInterval(countdown);
          return {
            ...prev,
            status: 'question',
            questionNumber: 1,
            currentQuestion: SAMPLE_QUESTIONS[0],
            timeRemaining: SAMPLE_QUESTIONS[0].timeLimit,
            countdownValue: 0,
          };
        }
        return {
          ...prev,
          countdownValue: (prev.countdownValue || 0) - 1,
        };
      });
    }, 1000);

    setQuestionStartTime(Date.now());
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer && onAnswer && !hasAnswered) {
      const responseTime = Date.now() - questionStartTime;
      onAnswer(selectedAnswer, responseTime);
      setHasAnswered(true);

      // Mock answer processing
      const isCorrect =
        gameState.currentQuestion?.choices?.find((c) => c.id === selectedAnswer)
          ?.correct || false;
      playSound(isCorrect ? 'correct' : 'incorrect');

      // Update player stats (mock)
      if (mode === 'player') {
        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            status: 'results',
          }));
        }, 2000);
      }
    }
  };

  const handlePowerUp = (powerUp: PowerUp) => {
    if (powerUp.used) return;

    setActivePowerUp(powerUp);
    playSound('powerup');

    // Apply power-up effects
    switch (powerUp.type) {
      case 'freeze_time':
        setGameState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining! + (powerUp.duration || 5),
        }));
        break;
      case 'eliminate_wrong':
        // Hide two incorrect answers
        break;
      // Add other power-up logic
    }

    // Mark as used
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === '1' // Current player
          ? {
              ...player,
              powerUps: player.powerUps.map((p) =>
                p.type === powerUp.type ? { ...p, used: true } : p,
              ),
            }
          : player,
      ),
    }));
  };

  const getAnswerButtonColor = (choiceId: string, isEliminated = false) => {
    if (isEliminated) return 'bg-gray-300 opacity-50 cursor-not-allowed';

    const colors = {
      a: 'bg-red-500 hover:bg-red-600 active:scale-95',
      b: 'bg-blue-500 hover:bg-blue-600 active:scale-95',
      c: 'bg-yellow-500 hover:bg-yellow-600 active:scale-95',
      d: 'bg-green-500 hover:bg-green-600 active:scale-95',
    };
    return colors[choiceId as keyof typeof colors] || 'bg-gray-500';
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return variants[difficulty as keyof typeof variants] || 'bg-gray-100';
  };

  // Host View - Lobby
  if (mode === 'host' && gameState.status === 'lobby') {
    return (
      <Card className="p-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Quiz Avanzado en Vivo</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>

          {showSettings && (
            <Card className="p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">Configuración del Juego</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameState.settings.powerUpsEnabled}
                    onChange={(e) =>
                      setGameState((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          powerUpsEnabled: e.target.checked,
                        },
                      }))
                    }
                  />
                  <span className="text-sm">Power-ups</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameState.settings.streakBonus}
                    onChange={(e) =>
                      setGameState((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          streakBonus: e.target.checked,
                        },
                      }))
                    }
                  />
                  <span className="text-sm">Bonus por racha</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameState.settings.soundEffects}
                    onChange={(e) =>
                      setGameState((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          soundEffects: e.target.checked,
                        },
                      }))
                    }
                  />
                  <span className="text-sm">Efectos de sonido</span>
                </label>
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-100 rounded-lg p-6 text-center">
              <p className="text-lg text-gray-600 mb-2">PIN del juego:</p>
              <p className="text-6xl font-bold text-blue-600 font-mono">
                {gameState.pin}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Los jugadores pueden unirse en kahoot.it
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">
                  <Users className="inline mr-2" />
                  Jugadores: {gameState.players.length}
                </span>
                <Badge variant="outline">
                  {gameState.totalQuestions} preguntas
                </Badge>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {gameState.players.map((player, index) => (
                  <div
                    key={player.id}
                    className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{player.avatar}</span>
                      <span className="font-medium">{player.nickname}</span>
                      {index === 0 && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {player.streak > 0 && (
                        <div className="flex items-center text-orange-500">
                          <Flame className="w-4 h-4" />
                          <span className="text-sm">{player.streak}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleStartGame}
              disabled={gameState.players.length < 1}
              className="px-8 py-4 text-lg"
            >
              <Play className="mr-2 w-5 h-5" />
              Iniciar Juego ({gameState.players.length} jugadores)
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Countdown Screen
  if (gameState.status === 'countdown') {
    return (
      <Card className="p-8 max-w-2xl mx-auto">
        <div className="text-center space-y-8">
          <h2 className="text-2xl font-bold">¡El juego está por comenzar!</h2>
          <div className="text-9xl font-bold text-blue-600 animate-pulse">
            {gameState.countdownValue}
          </div>
          <p className="text-lg text-gray-600">Prepárense...</p>
        </div>
      </Card>
    );
  }

  // Host View - Question Display
  if (mode === 'host' && gameState.status === 'question') {
    return (
      <Card className="p-8 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-lg">
                Pregunta {gameState.questionNumber} de{' '}
                {gameState.totalQuestions}
              </span>
              <Badge
                className={getDifficultyBadge(
                  gameState.currentQuestion?.difficulty || 'easy',
                )}
              >
                {gameState.currentQuestion?.difficulty}
              </Badge>
              {gameState.currentQuestion?.category && (
                <Badge variant="outline">
                  {gameState.currentQuestion.category}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xl">
                <Timer className="w-6 h-6" />
                <span
                  className={`font-bold ${gameState.timeRemaining! <= 5 ? 'text-red-500 animate-pulse' : ''}`}
                >
                  {gameState.timeRemaining}s
                </span>
              </div>
              {gameState.settings.soundEffects ? (
                <Volume2 className="w-5 h-5 text-gray-500" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-3xl font-bold mb-8">
              {gameState.currentQuestion?.stem}
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {shuffledChoices?.map((choice) => (
                <div
                  key={choice.id}
                  className={`p-8 rounded-lg text-white font-medium text-xl transition-all duration-200 ${getAnswerButtonColor(choice.id)}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {choice.id.toUpperCase()}
                    </span>
                    <span className="flex-1 text-center">{choice.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {gameState.players.filter((p) => p.answered).length} de{' '}
                {gameState.players.length} jugadores respondieron
              </p>
              <div className="flex space-x-2">
                {gameState.players.map((player) => (
                  <div
                    key={player.id}
                    className={`w-3 h-3 rounded-full ${
                      player.answered ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    title={player.nickname}
                  />
                ))}
              </div>
            </div>
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
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Unirse al Quiz</h2>
            <p className="text-gray-600">
              Ingresa el PIN y tu nombre para comenzar
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              PIN del juego
            </label>
            <Input
              type="text"
              value={joinPin}
              onChange={(e) => setJoinPin(e.target.value.slice(0, 6))}
              placeholder="123456"
              className="text-center text-3xl font-bold tracking-widest"
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
            <p className="text-xs text-gray-500 mt-1">
              {nickname.length}/20 caracteres
            </p>
          </div>

          <Button
            onClick={handleJoinGame}
            disabled={!joinPin || !nickname || joinPin.length !== 6}
            className="w-full"
            size="lg"
          >
            🚀 Unirse al Juego
          </Button>
        </div>
      </Card>
    );
  }

  // Player View - Answer Question
  if (mode === 'player' && gameState.status === 'question') {
    const currentPlayer = gameState.players.find((p) => p.id === '1'); // Mock current player

    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-between items-center mb-4">
              <Badge variant="outline">#{gameState.questionNumber}</Badge>
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4" />
                <span
                  className={`font-bold ${gameState.timeRemaining! <= 5 ? 'text-red-500' : ''}`}
                >
                  {gameState.timeRemaining}s
                </span>
              </div>
            </div>

            {/* Player stats */}
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>Puntos: {currentPlayer?.score || 0}</span>
              {currentPlayer?.streak! > 0 && (
                <span className="flex items-center text-orange-500">
                  <Flame className="w-4 h-4 mr-1" />
                  {currentPlayer?.streak}
                </span>
              )}
            </div>
          </div>

          {/* Power-ups */}
          {gameState.settings.powerUpsEnabled && currentPlayer?.powerUps && (
            <div className="flex justify-center space-x-2 mb-4">
              {currentPlayer.powerUps
                .filter((p) => !p.used)
                .map((powerUp) => (
                  <Button
                    key={powerUp.type}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePowerUp(powerUp)}
                    className="p-2 h-auto"
                    title={powerUp.name}
                  >
                    <span className="text-lg">{powerUp.icon}</span>
                  </Button>
                ))}
            </div>
          )}

          {!hasAnswered ? (
            <>
              <p className="text-center text-gray-600 text-sm">
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
                    className={`h-20 ${getAnswerButtonColor(choice)} text-white transform transition-all duration-200 hover:scale-105`}
                    disabled={gameState.timeRemaining === 0}
                  >
                    <span className="text-3xl font-bold">
                      {choice.toUpperCase()}
                    </span>
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✓</div>
              <p className="text-xl font-medium">¡Respuesta enviada!</p>
              <p className="text-gray-600 mt-2">Esperando resultados...</p>

              {activePowerUp && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">
                    Power-up usado: {activePowerUp.icon} {activePowerUp.name}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Enhanced Leaderboard View
  if (gameState.status === 'leaderboard') {
    return (
      <Card className="p-8 max-w-3xl mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              <Trophy className="inline mr-2 text-yellow-500" />
              Tabla de Posiciones
            </h2>
            <p className="text-gray-600">
              Pregunta {gameState.questionNumber} de {gameState.totalQuestions}
            </p>
          </div>

          <div className="space-y-3">
            {gameState.leaderboard?.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-300'
                    : index === 1
                      ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300'
                      : index === 2
                        ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-300'
                        : 'bg-white border'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {index < 3 ? (
                      <Medal
                        className={`w-8 h-8 ${
                          index === 0
                            ? 'text-yellow-500'
                            : index === 1
                              ? 'text-gray-500'
                              : 'text-orange-500'
                        }`}
                      />
                    ) : (
                      <span className="text-2xl font-bold w-8 text-center">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{player.avatar}</span>
                    <div>
                      <span className="text-lg font-medium">
                        {player.nickname}
                      </span>
                      {player.streak > 0 && (
                        <div className="flex items-center text-orange-500 text-sm">
                          <Flame className="w-3 h-3 mr-1" />
                          <span>{player.streak} respuestas seguidas</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold">{player.score} pts</div>
                  <div className="text-sm text-gray-600">
                    {player.correctAnswers}/{player.totalAnswers} correctas
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mode === 'host' && (
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Estadísticas
              </Button>
              <Button onClick={() => {}} size="lg">
                {gameState.questionNumber === gameState.totalQuestions
                  ? 'Ver Resultados Finales'
                  : 'Siguiente Pregunta'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return null;
};
