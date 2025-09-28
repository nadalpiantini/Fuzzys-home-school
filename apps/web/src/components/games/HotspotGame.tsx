'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Brain,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGameProgress } from '@/hooks/useGameProgress';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  explanation: string;
  correct: boolean;
}

interface HotspotGameData {
  title: string;
  description: string;
  imageUrl: string;
  hotspots: Hotspot[];
  metadata: {
    subject: string;
    grade: number;
    estimatedTime: string;
  };
}

interface HotspotGameProps {
  gameData: HotspotGameData;
  onComplete: (score: number, totalHotspots: number, timeSpent: number) => void;
}

export default function HotspotGame({
  gameData,
  onComplete,
}: HotspotGameProps) {
  const [clickedHotspots, setClickedHotspots] = useState<Set<string>>(
    new Set(),
  );
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { addGameSession } = useGameProgress();

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (showResults || gameCompleted) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if click is within any hotspot
    const clickedHotspot = gameData.hotspots.find((hotspot) => {
      const isWithinX = x >= hotspot.x && x <= hotspot.x + hotspot.width;
      const isWithinY = y >= hotspot.y && y <= hotspot.y + hotspot.height;
      return isWithinX && isWithinY;
    });

    if (clickedHotspot && !clickedHotspots.has(clickedHotspot.id)) {
      setClickedHotspots((prev) => new Set([...prev, clickedHotspot.id]));

      if (clickedHotspot.correct) {
        toast.success(`¡Correcto! ${clickedHotspot.label}`);
      } else {
        toast.error(`Incorrecto. ${clickedHotspot.explanation}`);
      }
    }
  };

  const handleSubmit = () => {
    const correctHotspots = gameData.hotspots.filter(
      (hotspot) => hotspot.correct && clickedHotspots.has(hotspot.id),
    );

    setScore(correctHotspots.length);
    setShowResults(true);

    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    // Save game session to progress
    addGameSession({
      gameId: `hotspot-${Date.now()}`,
      gameType: 'hotspot',
      subject: gameData.metadata.subject,
      grade: gameData.metadata.grade,
      score: correctHotspots.length,
      totalQuestions: gameData.hotspots.filter((h) => h.correct).length,
      timeSpent,
      difficulty: 'medium',
    });

    onComplete(
      correctHotspots.length,
      gameData.hotspots.filter((h) => h.correct).length,
      timeSpent,
    );
  };

  const handleReset = () => {
    setClickedHotspots(new Set());
    setShowResults(false);
    setScore(0);
    setGameCompleted(false);
    setStartTime(Date.now());
  };

  const getHotspotStyle = (hotspot: Hotspot) => {
    const isClicked = clickedHotspots.has(hotspot.id);
    const isCorrect = hotspot.correct;

    if (showResults) {
      if (isCorrect && isClicked) {
        return 'bg-green-500 border-green-600';
      } else if (isCorrect && !isClicked) {
        return 'bg-yellow-500 border-yellow-600';
      } else if (!isCorrect && isClicked) {
        return 'bg-red-500 border-red-600';
      } else {
        return 'bg-gray-300 border-gray-400';
      }
    }

    if (isClicked) {
      return isCorrect
        ? 'bg-green-500 border-green-600'
        : 'bg-red-500 border-red-600';
    }

    return 'bg-blue-500 border-blue-600 hover:bg-blue-600';
  };

  const getHotspotIcon = (hotspot: Hotspot) => {
    const isClicked = clickedHotspots.has(hotspot.id);

    if (showResults) {
      if (hotspot.correct && isClicked) {
        return <CheckCircle className="h-4 w-4 text-white" />;
      } else if (hotspot.correct && !isClicked) {
        return <XCircle className="h-4 w-4 text-white" />;
      } else if (!hotspot.correct && isClicked) {
        return <XCircle className="h-4 w-4 text-white" />;
      }
    }

    if (isClicked) {
      return hotspot.correct ? (
        <CheckCircle className="h-4 w-4 text-white" />
      ) : (
        <XCircle className="h-4 w-4 text-white" />
      );
    }

    return null;
  };

  if (gameCompleted) {
    const correctHotspots = gameData.hotspots.filter((h) => h.correct);
    const percentage = Math.round((score / correctHotspots.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {percentage >= 80 ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : percentage >= 60 ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <Brain className="h-16 w-16 text-blue-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {percentage >= 80
                ? '¡Excelente identificación!'
                : percentage >= 60
                  ? '¡Bien hecho!'
                  : '¡Sigue practicando!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {score}/{correctHotspots.length}
                </div>
                <div className="text-sm text-blue-800">Hotspots correctos</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {percentage}%
                </div>
                <div className="text-sm text-green-800">Puntuación</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.floor(timeSpent / 60)}:
                  {(timeSpent % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-purple-800">Tiempo</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Explicaciones:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameData.hotspots.map((hotspot) => (
                  <div key={hotspot.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{hotspot.label}</span>
                      {hotspot.correct ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {hotspot.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleReset} className="w-full" size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Jugar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{gameData.title}</h1>
            <p className="text-gray-600">{gameData.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm text-gray-600">
                {gameData.metadata.estimatedTime}
              </span>
            </div>
            <Badge variant="outline">
              {gameData.metadata.subject} - Grado {gameData.metadata.grade}
            </Badge>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Haz clic en las áreas correctas</span>
            <span>Identificados: {clickedHotspots.size}</span>
          </div>
          <Progress
            value={
              (clickedHotspots.size /
                gameData.hotspots.filter((h) => h.correct).length) *
              100
            }
            className="h-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image with hotspots */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imagen interactiva</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <img
                  ref={imageRef}
                  src={gameData.imageUrl}
                  alt={gameData.title}
                  className="w-full h-auto rounded-lg cursor-crosshair"
                  onClick={handleImageClick}
                  onLoad={() => setImageLoaded(true)}
                />

                {imageLoaded && (
                  <>
                    {gameData.hotspots.map((hotspot) => (
                      <div
                        key={hotspot.id}
                        className={`absolute border-2 rounded-lg flex items-center justify-center transition-all ${
                          showResults ? 'cursor-not-allowed' : 'cursor-pointer'
                        } ${getHotspotStyle(hotspot)}`}
                        style={{
                          left: `${hotspot.x}%`,
                          top: `${hotspot.y}%`,
                          width: `${hotspot.width}%`,
                          height: `${hotspot.height}%`,
                        }}
                        title={hotspot.label}
                      >
                        {getHotspotIcon(hotspot)}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions and results */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instrucciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Haz clic en las áreas correctas de la imagen. Cada área correcta
                te dará puntos.
              </p>

              {showResults && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Resultados:</h4>
                  {gameData.hotspots.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {hotspot.correct ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={
                          hotspot.correct ? 'text-green-800' : 'text-red-800'
                        }
                      >
                        {hotspot.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Identificados</span>
                  <span>{clickedHotspots.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Correctos</span>
                  <span>{score}</span>
                </div>
                <Progress
                  value={
                    (clickedHotspots.size /
                      gameData.hotspots.filter((h) => h.correct).length) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-center mt-6">
        {!showResults ? (
          <Button onClick={handleSubmit} size="lg">
            Verificar respuestas
          </Button>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold">
              Puntuación: {score}/
              {gameData.hotspots.filter((h) => h.correct).length} (
              {Math.round(
                (score / gameData.hotspots.filter((h) => h.correct).length) *
                  100,
              )}
              %)
            </div>
            <Button onClick={handleReset} size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Jugar de nuevo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
