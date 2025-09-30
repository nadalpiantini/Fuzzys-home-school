'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Users,
  Target,
  Zap,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: 'collaboration' | 'creative' | 'problem-solving' | 'communication';
  points: number;
  timeLimit: number;
  teamSize: number;
}

interface Team {
  id: string;
  name: string;
  members: string[];
  score: number;
  completedChallenges: number[];
  currentChallenge?: number;
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'Torre de Espaguetis',
    description: 'Construyan la torre más alta usando solo espaguetis y malvaviscos. Trabajen juntos para crear una estructura estable.',
    type: 'collaboration',
    points: 100,
    timeLimit: 300, // 5 minutes
    teamSize: 4
  },
  {
    id: 2,
    title: 'Historia Colaborativa',
    description: 'Creen una historia donde cada miembro debe contribuir con al menos dos oraciones. La historia debe tener un tema central.',
    type: 'creative',
    points: 80,
    timeLimit: 480, // 8 minutes
    teamSize: 3
  },
  {
    id: 3,
    title: 'Escape Room Virtual',
    description: 'Resuelvan acertijos y puzzles trabajando en equipo. Cada miembro tiene pistas únicas que deben compartir.',
    type: 'problem-solving',
    points: 150,
    timeLimit: 600, // 10 minutes
    teamSize: 4
  },
  {
    id: 4,
    title: 'Teléfono Descompuesto',
    description: 'Comuniquen un mensaje complejo a través del equipo sin usar palabras escritas. Solo gestos y dibujos.',
    type: 'communication',
    points: 90,
    timeLimit: 240, // 4 minutes
    teamSize: 5
  },
  {
    id: 5,
    title: 'Innovación Ecológica',
    description: 'Diseñen una solución creativa para un problema ambiental. Incluyan presupuesto, timeline y plan de implementación.',
    type: 'creative',
    points: 120,
    timeLimit: 720, // 12 minutes
    teamSize: 4
  },
  {
    id: 6,
    title: 'Puente de Cartas',
    description: 'Construyan un puente que soporte el peso de un libro usando solo cartas de juego y cinta adhesiva.',
    type: 'collaboration',
    points: 110,
    timeLimit: 420, // 7 minutes
    teamSize: 3
  }
];

const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Los Innovadores',
    members: ['Ana', 'Carlos', 'Sofía', 'Diego'],
    score: 280,
    completedChallenges: [1, 2]
  },
  {
    id: '2',
    name: 'Equipo Águila',
    members: ['María', 'Luis', 'Carmen'],
    score: 190,
    completedChallenges: [2]
  },
  {
    id: '3',
    name: 'Los Creativos',
    members: ['Pablo', 'Elena', 'Javier', 'Isabella'],
    score: 150,
    completedChallenges: [1]
  }
];

export default function TeamChallengeGame() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [currentChallenge, setCurrentChallenge] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>('1');
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && currentChallenge !== null && timeLeft > 0 && !challengeCompleted) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, currentChallenge, timeLeft, challengeCompleted]);

  const handleTimeUp = () => {
    alert('¡Se acabó el tiempo! El desafío no se completó.');
    setCurrentChallenge(null);
    setGameStarted(false);
  };

  const startChallenge = (challengeId: number) => {
    const challenge = CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return;

    setCurrentChallenge(challengeId);
    setTimeLeft(challenge.timeLimit);
    setGameStarted(true);
    setChallengeCompleted(false);
  };

  const completeChallenge = () => {
    if (currentChallenge === null) return;

    const challenge = CHALLENGES.find(c => c.id === currentChallenge);
    if (!challenge) return;

    // Calculate bonus points based on time remaining
    const timeBonus = Math.floor((timeLeft / challenge.timeLimit) * 50);
    const totalPoints = challenge.points + timeBonus;

    // Update team score
    setTeams(prev => prev.map(team => {
      if (team.id === selectedTeam) {
        return {
          ...team,
          score: team.score + totalPoints,
          completedChallenges: [...team.completedChallenges, currentChallenge]
        };
      }
      return team;
    }));

    setScore(prev => prev + totalPoints);
    setChallengeCompleted(true);
    
    setTimeout(() => {
      setCurrentChallenge(null);
      setGameStarted(false);
      setChallengeCompleted(false);
    }, 3000);
  };

  const resetGame = () => {
    setTeams(MOCK_TEAMS);
    setCurrentChallenge(null);
    setTimeLeft(0);
    setGameStarted(false);
    setSelectedTeam('1');
    setChallengeCompleted(false);
    setScore(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'collaboration': return 'bg-blue-100 text-blue-800';
      case 'creative': return 'bg-purple-100 text-purple-800';
      case 'problem-solving': return 'bg-green-100 text-green-800';
      case 'communication': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'collaboration': return <Users className="w-4 h-4" />;
      case 'creative': return <Star className="w-4 h-4" />;
      case 'problem-solving': return <Target className="w-4 h-4" />;
      case 'communication': return <Zap className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const currentTeam = teams.find(t => t.id === selectedTeam);
  const activeChallengeData = currentChallenge ? CHALLENGES.find(c => c.id === currentChallenge) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🚀 Desafíos en Equipo
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Colabora y resuelve juntos!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg">{score}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/games')}
                className="bg-white/50 hover:bg-white/80"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver a Juegos
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Team Selection */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Selecciona tu Equipo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card 
                key={team.id} 
                className={`cursor-pointer transition-all ${
                  selectedTeam === team.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTeam(team.id)}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{team.name}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    Miembros: {team.members.join(', ')}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold">{team.score}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{team.completedChallenges.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Active Challenge */}
      {gameStarted && activeChallengeData && (
        <section className="container mx-auto px-4 sm:px-6 pb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{activeChallengeData.title}</h2>
                  <Badge className="bg-white/20 text-white">
                    {activeChallengeData.type === 'collaboration' && 'Colaboración'}
                    {activeChallengeData.type === 'creative' && 'Creatividad'}
                    {activeChallengeData.type === 'problem-solving' && 'Resolución de Problemas'}
                    {activeChallengeData.type === 'communication' && 'Comunicación'}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className={`text-2xl font-bold ${
                      timeLeft <= 60 ? 'animate-pulse' : ''
                    }`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div className="text-sm opacity-90">
                    {activeChallengeData.points} puntos
                  </div>
                </div>
              </div>
              
              <p className="text-lg mb-6 opacity-95">
                {activeChallengeData.description}
              </p>

              <Progress 
                value={(timeLeft / activeChallengeData.timeLimit) * 100} 
                className="h-3 mb-6 bg-white/20" 
              />

              <div className="flex gap-4">
                <Button
                  onClick={completeChallenge}
                  disabled={challengeCompleted}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  size="lg"
                >
                  {challengeCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      ¡Completado!
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      Completar Desafío
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setCurrentChallenge(null);
                    setGameStarted(false);
                  }}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  size="lg"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Challenges Grid */}
      {!gameStarted && (
        <section className="container mx-auto px-4 sm:px-6 pb-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Desafíos Disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHALLENGES.map((challenge) => {
              const isCompleted = currentTeam?.completedChallenges.includes(challenge.id);
              return (
                <Card key={challenge.id} className={`${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className={getTypeColor(challenge.type)}>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(challenge.type)}
                          <span className="text-xs">
                            {challenge.type === 'collaboration' && 'Colaboración'}
                            {challenge.type === 'creative' && 'Creatividad'}
                            {challenge.type === 'problem-solving' && 'Problemas'}
                            {challenge.type === 'communication' && 'Comunicación'}
                          </span>
                        </div>
                      </Badge>
                      {isCompleted && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2">{challenge.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {challenge.description}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(challenge.timeLimit)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {challenge.teamSize}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold">{challenge.points}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => startChallenge(challenge.id)}
                      disabled={isCompleted || !currentTeam}
                      className={`w-full ${
                        isCompleted 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completado
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Iniciar Desafío
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Leaderboard */}
      {!gameStarted && (
        <section className="container mx-auto px-4 sm:px-6 pb-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Tabla de Líderes
            </h2>
            <div className="space-y-3">
              {teams
                .sort((a, b) => b.score - a.score)
                .map((team, index) => (
                <div
                  key={team.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    team.id === selectedTeam ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{team.name}</div>
                      <div className="text-sm text-gray-600">
                        {team.completedChallenges.length} desafíos completados
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-lg">{team.score}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reset Button */}
      {!gameStarted && (
        <section className="container mx-auto px-4 sm:px-6 pb-6">
          <div className="text-center">
            <Button
              onClick={resetGame}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
              size="lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reiniciar Juego
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}