'use client';

import React, { useState, useEffect } from 'react';
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

interface DragDropItem {
  id: string;
  text: string;
  correctCategory: number;
  explanation: string;
}

interface DragDropGameData {
  title: string;
  description: string;
  categories: string[];
  items: DragDropItem[];
  metadata: {
    subject: string;
    grade: number;
    estimatedTime: string;
  };
}

interface DragDropGameProps {
  gameData: DragDropGameData;
  onComplete: (score: number, totalItems: number, timeSpent: number) => void;
}

interface DraggedItem {
  item: DragDropItem;
  categoryIndex: number;
}

export default function DragDropGame({
  gameData,
  onComplete,
}: DragDropGameProps) {
  const [draggedItems, setDraggedItems] = useState<DraggedItem[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const { addGameSession } = useGameProgress();

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  // Auto-verify when all items are classified
  useEffect(() => {
    if (!showResults && draggedItems.length === gameData.items.length) {
      // Small delay to ensure UI updates are complete
      setTimeout(() => {
        handleSubmit();
      }, 500);
    }
  }, [draggedItems.length, gameData.items.length, showResults]);

  const handleDragStart = (e: React.DragEvent, item: DragDropItem) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, categoryIndex: number) => {
    e.preventDefault();
    if (showResults) return;

    const itemData = e.dataTransfer.getData('text/plain');
    const item = JSON.parse(itemData);

    // Remove item from previous category if it exists
    const updatedItems = draggedItems.filter(
      (draggedItem) => draggedItem.item.id !== item.id,
    );

    // Add item to new category
    setDraggedItems([...updatedItems, { item, categoryIndex }]);
  };

  const handleSubmit = () => {
    if (draggedItems.length !== gameData.items.length) {
      toast.error('Por favor clasifica todos los elementos');
      return;
    }

    let correctCount = 0;
    draggedItems.forEach(({ item, categoryIndex }) => {
      if (categoryIndex === item.correctCategory) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResults(true);

    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    // Save game session to progress
    addGameSession({
      gameId: `dragdrop-${Date.now()}`,
      gameType: 'dragdrop',
      subject: gameData.metadata.subject,
      grade: gameData.metadata.grade,
      score: correctCount,
      totalQuestions: gameData.items.length,
      timeSpent,
      difficulty: 'medium',
    });

    onComplete(correctCount, gameData.items.length, timeSpent);
  };

  const handleReset = () => {
    setDraggedItems([]);
    setShowResults(false);
    setScore(0);
    setStartTime(Date.now());
  };

  const getItemsInCategory = (categoryIndex: number) => {
    return draggedItems
      .filter((draggedItem) => draggedItem.categoryIndex === categoryIndex)
      .map((draggedItem) => draggedItem.item);
  };

  const getRemainingItems = () => {
    const usedItemIds = draggedItems.map((draggedItem) => draggedItem.item.id);
    return gameData.items.filter((item) => !usedItemIds.includes(item.id));
  };

  const getCategoryColor = (categoryIndex: number) => {
    const colors = [
      'bg-blue-50 border-blue-200',
      'bg-green-50 border-green-200',
      'bg-purple-50 border-purple-200',
      'bg-orange-50 border-orange-200',
      'bg-pink-50 border-pink-200',
      'bg-yellow-50 border-yellow-200',
    ];
    return colors[categoryIndex % colors.length];
  };

  if (gameCompleted) {
    const percentage = Math.round((score / gameData.items.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    return (
      <div className="max-w-6xl mx-auto p-6">
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
                ? '¡Excelente clasificación!'
                : percentage >= 60
                  ? '¡Bien hecho!'
                  : '¡Sigue practicando!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {score}/{gameData.items.length}
                </div>
                <div className="text-sm text-blue-800">Elementos correctos</div>
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

            <div className="flex gap-4 justify-center">
              <Button onClick={handleReset} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Jugar de nuevo
              </Button>
            </div>
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
            <span>Clasifica {gameData.items.length} elementos</span>
            <span>
              Clasificados: {draggedItems.length}/{gameData.items.length}
            </span>
          </div>
          <Progress
            value={(draggedItems.length / gameData.items.length) * 100}
            className="h-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Items to drag */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Elementos para clasificar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getRemainingItems().map((item) => (
                <div
                  key={item.id}
                  draggable={!showResults}
                  onDragStart={(e) => handleDragStart(e, item)}
                  className={`p-3 rounded-lg border-2 border-dashed border-gray-300 bg-white cursor-move hover:border-gray-400 transition-colors ${
                    showResults ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gameData.categories.map((category, categoryIndex) => (
                <div
                  key={categoryIndex}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, categoryIndex)}
                  className={`p-4 rounded-lg border-2 border-dashed min-h-[100px] ${getCategoryColor(categoryIndex)} ${
                    showResults ? 'cursor-not-allowed' : 'hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold text-lg mb-3">{category}</div>
                  <div className="space-y-2">
                    {getItemsInCategory(categoryIndex).map((item) => (
                      <div
                        key={item.id}
                        className={`p-2 rounded border ${
                          showResults
                            ? item.correctCategory === categoryIndex
                              ? 'bg-green-100 border-green-300 text-green-800'
                              : 'bg-red-100 border-red-300 text-red-800'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.text}</span>
                          {showResults && (
                            <div className="flex items-center gap-1">
                              {item.correctCategory === categoryIndex ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          )}
                        </div>
                        {showResults && (
                          <div className="text-xs mt-1 text-gray-600">
                            {item.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results section */}
      {showResults && (
        <div className="flex justify-center mt-6">
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold">
              Puntuación: {score}/{gameData.items.length} (
              {Math.round((score / gameData.items.length) * 100)}%)
            </div>
            <Button onClick={handleReset} size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Jugar de nuevo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
