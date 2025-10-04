'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, RotateCcw, Trophy, Heart } from 'lucide-react';
import type { BranchingScenarioGame } from '@/types/workspace';

interface BranchingScenarioProps {
  game: BranchingScenarioGame;
  onAnswer: (path: string[], score: number) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    finalScore?: number;
  };
}

const BranchingScenario: React.FC<BranchingScenarioProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback,
}) => {
  const [currentNodeId, setCurrentNodeId] = useState(game.startNode);
  const [path, setPath] = useState<string[]>([game.startNode]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isComplete, setIsComplete] = useState(false);

  const currentNode = game.nodes.find((node) => node.id === currentNodeId);

  const handleChoice = (option: {
    text: string;
    next: string;
    points?: number;
  }) => {
    if (isComplete || showFeedback) return;

    const newPath = [...path, option.next];
    setPath(newPath);

    if (option.points) {
      setScore(score + option.points);
    }

    const nextNode = game.nodes.find((node) => node.id === option.next);

    if (!nextNode || nextNode.options.length === 0 || option.next === 'end') {
      // Scenario complete
      setIsComplete(true);
      onAnswer(newPath, score + (option.points || 0));
    } else {
      setCurrentNodeId(option.next);
    }
  };

  const handleRestart = () => {
    setCurrentNodeId(game.startNode);
    setPath([game.startNode]);
    setScore(0);
    setLives(3);
    setIsComplete(false);
  };

  const getProgressPercentage = () => {
    const maxNodes = game.nodes.length;
    const visitedNodes = new Set(path).size;
    return (visitedNodes / maxNodes) * 100;
  };

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Escenario Interactivo
          </h3>
          <div className="flex items-center gap-4">
            {/* Lives */}
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 ${
                    i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {/* Score */}
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold">{score}</span>
            </div>
            {/* Restart */}
            {!showFeedback && !isComplete && (
              <Button
                onClick={handleRestart}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Current Node Content */}
        {currentNode && !isComplete && !showFeedback && (
          <div className="space-y-4">
            {/* Media */}
            {currentNode.media && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={currentNode.media}
                  alt="Scenario visual"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Content */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-gray-800 whitespace-pre-wrap">
                {currentNode.content}
              </p>
            </Card>

            {/* Options */}
            <div className="space-y-3">
              <h4 className="font-semibold">¿Qué decides hacer?</h4>
              {currentNode.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleChoice(option)}
                  variant="outline"
                  className="w-full justify-start text-left hover:bg-blue-50 hover:border-blue-300"
                >
                  <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{option.text}</span>
                  {option.points && option.points > 0 && (
                    <span className="ml-auto text-green-600 font-bold">
                      +{option.points}
                    </span>
                  )}
                  {option.points && option.points < 0 && (
                    <span className="ml-auto text-red-600 font-bold">
                      {option.points}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Completion Screen */}
        {isComplete && !showFeedback && (
          <div className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="text-center space-y-3">
                <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
                <h3 className="text-2xl font-bold">¡Aventura Completada!</h3>
                <p className="text-gray-600">
                  Has terminado el escenario con una puntuación de:
                </p>
                <p className="text-4xl font-bold text-blue-600">
                  {score} puntos
                </p>
              </div>
            </Card>

            {/* Path Summary */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Tu recorrido:</h4>
              <div className="space-y-2">
                {path.map((nodeId, index) => {
                  const node = game.nodes.find((n) => n.id === nodeId);
                  if (!node) return null;

                  return (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm text-gray-500 mt-0.5">
                        {index + 1}.
                      </span>
                      <p className="text-sm text-gray-700">
                        {node.content.substring(0, 100)}
                        {node.content.length > 100 && '...'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="flex justify-between">
              <Button onClick={handleRestart} variant="outline">
                Jugar de Nuevo
              </Button>
              <Button onClick={() => onAnswer(path, score)}>Finalizar</Button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && feedback && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}
            >
              <p className="font-medium">Escenario completado</p>
              {feedback.finalScore && (
                <p className="text-sm">
                  Puntuación final: {feedback.finalScore} puntos
                </p>
              )}
              {feedback.explanation && (
                <p className="mt-1 text-sm">{feedback.explanation}</p>
              )}
            </div>

            {onNext && (
              <div className="flex justify-end">
                <Button onClick={onNext}>Siguiente</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default BranchingScenario;
