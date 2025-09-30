'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Clock,
  Heart,
  Star,
  HelpCircle,
  Volume2,
  VolumeX,
  MessageCircle,
} from 'lucide-react';

interface BaseGameProps {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subject: string;
  gradeLevel: string;
  gameContent: React.ReactNode;
  onComplete?: (score: number) => void;
  maxLives?: number;
  timeLimit?: number;
  showTimer?: boolean;
  showScore?: boolean;
  showLives?: boolean;
  customActions?: React.ReactNode;
}

export const BaseGame: React.FC<BaseGameProps> = ({
  title,
  description,
  difficulty,
  subject,
  gradeLevel,
  gameContent,
  onComplete,
  maxLives = 3,
  timeLimit = 0,
  showTimer = true,
  showScore = true,
  showLives = true,
  customActions,
}) => {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(maxLives);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stars, setStars] = useState(0);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem(`highScore_${title}`);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, [title]);

  // Timer logic
  useEffect(() => {
    if (isPlaying && !isPaused && showTimer && timeLimit > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPlaying, isPaused, showTimer, timeLimit]);

  // Calculate stars based on score
  useEffect(() => {
    if (score >= 100) setStars(3);
    else if (score >= 70) setStars(2);
    else if (score >= 40) setStars(1);
    else setStars(0);
  }, [score]);

  const handleStart = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setScore(0);
    setLives(maxLives);
    setTimeLeft(timeLimit);
    setGameOver(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    handleStart();
  };

  const handleGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);

    // Save high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(`highScore_${title}`, score.toString());
    }

    // Call completion callback
    if (onComplete) {
      onComplete(score);
    }
  };

  const handleBack = () => {
    router.push('/games');
  };

  const handleHint = async () => {
    setShowHint(true);
    // Here we could integrate with DeepSeek AI for contextual hints
    setTimeout(() => setShowHint(false), 5000);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return difficulty;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Expose game state through context or props
  const gameState = {
    score,
    setScore,
    lives,
    setLives,
    isPlaying,
    isPaused,
    soundEnabled,
    handleGameOver,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {title}
                </h1>
                <div className="flex items-center gap-2 text-sm">
                  <Badge className={getDifficultyColor()}>
                    {getDifficultyLabel()}
                  </Badge>
                  <Badge variant="outline">{subject}</Badge>
                  <Badge variant="outline">{gradeLevel}</Badge>
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="flex items-center gap-4">
              {showScore && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {score}
                  </div>
                  <div className="text-xs text-gray-600">Puntos</div>
                </div>
              )}

              {showLives && maxLives > 0 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: maxLives }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-6 h-6 ${
                        i < lives
                          ? 'fill-red-500 text-red-500'
                          : 'fill-gray-300 text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}

              {showTimer && timeLimit > 0 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5" />
                  <span className="font-mono font-bold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSound}
                  className="text-gray-600"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleHint}
                  className="text-gray-600"
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>

                {customActions}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="container mx-auto px-4 py-6">
        {!isPlaying ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {gameOver ? '🎮 Juego Terminado!' : `🎯 ${title}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {gameOver ? (
                <>
                  <div className="text-center space-y-4">
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-12 h-12 ${
                            i < stars
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-purple-600">
                        {score} puntos
                      </p>
                      {score > highScore && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                          <Trophy className="w-4 h-4 mr-1" />
                          ¡Nuevo Récord!
                        </Badge>
                      )}
                      <p className="text-gray-600">
                        Mejor puntuación: {highScore}
                      </p>
                    </div>

                    <div className="flex justify-center gap-3 mt-6">
                      <Button onClick={handleReset} size="lg">
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Jugar de Nuevo
                      </Button>
                      <Button onClick={handleBack} variant="outline" size="lg">
                        Elegir Otro Juego
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-center text-gray-600 text-lg">
                    {description}
                  </p>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">📚 Instrucciones:</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Completa los desafíos para ganar puntos</li>
                      <li>• Usa las pistas si necesitas ayuda</li>
                      <li>• ¡Intenta superar tu mejor puntuación!</li>
                    </ul>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Comenzar Juego
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Game Controls */}
            <div className="flex justify-center gap-2">
              <Button
                onClick={handlePause}
                variant="outline"
                size="sm"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Continuar
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            </div>

            {/* Hint Display */}
            {showHint && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-auto max-w-2xl">
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-blue-900">💡 Pista:</p>
                    <p className="text-blue-700">
                      Toma tu tiempo y piensa en la respuesta correcta...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Game Content Area */}
            <Card className={`mx-auto ${isPaused ? 'opacity-50' : ''}`}>
              <CardContent className="p-6">
                {React.cloneElement(gameContent as React.ReactElement, {
                  gameState,
                  disabled: isPaused,
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default BaseGame;