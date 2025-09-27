'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
interface HotspotGame {
  id: string;
  title: string;
  image: string;
  hotspots: Array<{ id: string; x: number; y: number; width: number; height: number; correct: boolean }>;
  targets?: Array<{ x: number; y: number; correct: boolean; radius?: number }>;
}
import { Target } from 'lucide-react';

interface HotspotProps {
  game: HotspotGame;
  onAnswer: (answer: { x: number; y: number }[]) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    score: number;
    maxScore: number;
    explanation?: string;
  };
}

export const Hotspot: React.FC<HotspotProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback
}) => {
  const [clicks, setClicks] = useState<{ x: number; y: number }[]>([]);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showFeedback) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClicks([...clicks, { x, y }]);
  };

  const handleReset = () => {
    setClicks([]);
  };

  const handleSubmit = () => {
    onAnswer(clicks);
  };

  const isClickCorrect = (click: { x: number; y: number }) => {
    if (!showFeedback) return false;

    return game.targets?.some(target => {
      if (!target.correct) return false;
      const distance = Math.sqrt(
        Math.pow(click.x - target.x, 2) +
        Math.pow(click.y - target.y, 2)
      );
      return distance <= (target.radius || 20);
    });
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="text-lg font-medium text-gray-900">
          Haz clic en las áreas correctas de la imagen
        </div>

        <p className="text-sm text-gray-600">
          Necesitas encontrar {game.targets?.filter(t => t.correct).length || 0} área(s) correcta(s)
        </p>

        <div
          ref={imageRef}
          className="relative bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
          onClick={handleImageClick}
          style={{
            backgroundImage: `url(${game.image})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            paddingBottom: '56.25%' // 16:9 aspect ratio
          }}
        >
          {/* Show clicks */}
          {clicks.map((click, index) => (
            <div
              key={index}
              className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center ${
                showFeedback
                  ? isClickCorrect(click)
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{ left: `${click.x}%`, top: `${click.y}%` }}
            >
              <span className="text-white text-xs font-bold">{index + 1}</span>
            </div>
          ))}

          {/* Show correct areas when feedback is shown */}
          {showFeedback &&
            game.targets &&
            game.targets
              .filter(target => target.correct)
              .map((target, index) => (
                <div
                  key={`target-${index}`}
                  className="absolute border-2 border-green-500 bg-green-500 bg-opacity-20 rounded-full"
                  style={{
                    left: `${target.x - (target.radius || 20)}%`,
                    top: `${target.y - (target.radius || 20)}%`,
                    width: `${(target.radius || 20) * 2}%`,
                    height: `${(target.radius || 20) * 2}%`
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Clicks: {clicks.length}
          </div>
          {!showFeedback && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reiniciar
            </Button>
          )}
        </div>

        {showFeedback && feedback && (
          <div className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
            <p className="font-medium">
              {feedback.correct ? '¡Perfecto!' : `Encontraste ${feedback.score}/${feedback.maxScore} áreas correctas`}
            </p>
            {feedback.explanation && (
              <p className="mt-1 text-sm">{feedback.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-between">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={clicks.length === 0}
              className="ml-auto"
            >
              Verificar Respuesta
            </Button>
          ) : (
            onNext && (
              <Button onClick={onNext} className="ml-auto">
                Siguiente
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  );
};