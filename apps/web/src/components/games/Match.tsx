'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link2, Check, X, RotateCcw } from 'lucide-react';
import type { MatchGame } from '@fuzzy/game-engine';

interface MatchProps {
  game: MatchGame;
  onAnswer: (matches: { left: string; right: string }[]) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    correctMatches?: { left: string; right: string }[];
  };
}

export const Match: React.FC<MatchProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback
}) => {
  const [leftColumn, setLeftColumn] = useState<string[]>([]);
  const [rightColumn, setRightColumn] = useState<string[]>([]);
  const [connections, setConnections] = useState<{ left: string; right: string }[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  useEffect(() => {
    // Initialize and shuffle columns
    const leftItems = game.pairs.map(pair => pair.left);
    const rightItems = game.pairs.map(pair => pair.right);

    if (game.shuffle !== false && !showFeedback) {
      setLeftColumn(leftItems);
      setRightColumn(rightItems.sort(() => Math.random() - 0.5));
    } else {
      setLeftColumn(leftItems);
      setRightColumn(rightItems);
    }
  }, [game.pairs, game.shuffle, showFeedback]);

  useEffect(() => {
    // Check if a match should be made
    if (selectedLeft && selectedRight) {
      const newConnection = { left: selectedLeft, right: selectedRight };

      // Remove any existing connections with these items
      const filteredConnections = connections.filter(
        conn => conn.left !== selectedLeft && conn.right !== selectedRight
      );

      setConnections([...filteredConnections, newConnection]);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [selectedLeft, selectedRight, connections]);

  const handleLeftClick = (item: string) => {
    if (showFeedback) return;

    if (selectedLeft === item) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(item);
    }
  };

  const handleRightClick = (item: string) => {
    if (showFeedback) return;

    if (selectedRight === item) {
      setSelectedRight(null);
    } else {
      setSelectedRight(item);
    }
  };

  const handleSubmit = () => {
    onAnswer(connections);
  };

  const handleReset = () => {
    setConnections([]);
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const getConnectionForLeft = (leftItem: string) => {
    return connections.find(conn => conn.left === leftItem);
  };

  const getConnectionForRight = (rightItem: string) => {
    return connections.find(conn => conn.right === rightItem);
  };

  const isCorrectConnection = (left: string, right: string) => {
    if (!showFeedback) return null;

    const correctPair = game.pairs.find(pair => pair.left === left);
    return correctPair?.right === right;
  };

  const getItemStyle = (item: string, side: 'left' | 'right', isConnected: boolean) => {
    const isSelected = side === 'left' ? selectedLeft === item : selectedRight === item;

    if (showFeedback && isConnected) {
      const connection = side === 'left'
        ? getConnectionForLeft(item)
        : getConnectionForRight(item);

      if (connection) {
        const isCorrect = isCorrectConnection(connection.left, connection.right);
        if (isCorrect) {
          return 'bg-green-100 border-green-500';
        } else {
          return 'bg-red-100 border-red-500';
        }
      }
    }

    if (isSelected) {
      return 'bg-blue-100 border-blue-500 ring-2 ring-blue-400';
    }

    if (isConnected) {
      return 'bg-purple-50 border-purple-400';
    }

    return 'hover:bg-gray-50 hover:border-gray-400';
  };

  const renderConnection = (leftItem: string, rightItem: string) => {
    const leftIndex = leftColumn.indexOf(leftItem);
    const rightIndex = rightColumn.indexOf(rightItem);

    if (leftIndex === -1 || rightIndex === -1) return null;

    const isCorrect = showFeedback ? isCorrectConnection(leftItem, rightItem) : null;
    const color = isCorrect === true ? 'stroke-green-500' : isCorrect === false ? 'stroke-red-500' : 'stroke-purple-400';

    return (
      <svg
        key={`${leftItem}-${rightItem}`}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <line
          x1="33%"
          y1={`${(leftIndex * 80) + 60}px`}
          x2="67%"
          y2={`${(rightIndex * 80) + 60}px`}
          className={color}
          strokeWidth="2"
          strokeDasharray={isCorrect === false ? "5,5" : "0"}
        />
      </svg>
    );
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Conecta los conceptos relacionados
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Conexiones: {connections.length}/{game.pairs.length}
            </div>
            {!showFeedback && (
              <Button
                onClick={handleReset}
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

        {/* Matching Area */}
        <div className="relative min-h-[400px]">
          {/* Connection Lines */}
          {connections.map(conn => renderConnection(conn.left, conn.right))}

          {/* Columns */}
          <div className="grid grid-cols-3 gap-8 relative" style={{ zIndex: 1 }}>
            {/* Left Column */}
            <div className="space-y-4">
              {leftColumn.map((item, index) => {
                const connection = getConnectionForLeft(item);
                const isConnected = !!connection;

                return (
                  <Card
                    key={item}
                    onClick={() => handleLeftClick(item)}
                    className={`p-4 cursor-pointer transition-all border-2 ${getItemStyle(item, 'left', isConnected)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item}</span>
                      {showFeedback && isConnected && (
                        isCorrectConnection(connection.left, connection.right) ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Middle Icon */}
            <div className="flex items-center justify-center">
              <Link2 className="w-8 h-8 text-gray-400" />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {rightColumn.map((item, index) => {
                const connection = getConnectionForRight(item);
                const isConnected = !!connection;

                return (
                  <Card
                    key={item}
                    onClick={() => handleRightClick(item)}
                    className={`p-4 cursor-pointer transition-all border-2 ${getItemStyle(item, 'right', isConnected)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item}</span>
                      {showFeedback && isConnected && (
                        isCorrectConnection(connection.left, connection.right) ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!showFeedback && (
          <div className="text-sm text-gray-600 text-center">
            Haz clic en un elemento de la izquierda y luego en su pareja de la derecha para conectarlos
          </div>
        )}

        {showFeedback && feedback && (
          <div className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="font-medium">
              {feedback.correct
                ? '¡Perfecto! Todas las conexiones son correctas.'
                : `${connections.filter(conn => isCorrectConnection(conn.left, conn.right)).length} de ${game.pairs.length} conexiones correctas.`}
            </p>
            {feedback.explanation && (
              <p className="mt-1 text-sm">{feedback.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              className="ml-auto"
              disabled={connections.length === 0}
            >
              Verificar Conexiones
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