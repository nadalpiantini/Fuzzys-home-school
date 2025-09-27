'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, RotateCcw } from 'lucide-react';

interface WordSearchGame {
  type: 'word_search';
  grid: string[][];
  words: string[];
  theme?: string;
}

interface WordSearchProps {
  game: WordSearchGame;
  onAnswer: (foundWords: string[]) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    correctWords?: string[];
  };
}

interface CellPosition {
  row: number;
  col: number;
}

export const WordSearch: React.FC<WordSearchProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback
}) => {
  const [selectedCells, setSelectedCells] = useState<CellPosition[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<CellPosition[]>([]);

  const handleCellMouseDown = (row: number, col: number) => {
    if (showFeedback) return;
    setIsSelecting(true);
    setCurrentSelection([{ row, col }]);
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting || showFeedback) return;

    const lastCell = currentSelection[currentSelection.length - 1];
    if (!lastCell) return;

    // Check if selection is in a straight line
    const rowDiff = Math.abs(row - lastCell.row);
    const colDiff = Math.abs(col - lastCell.col);

    if (rowDiff <= 1 && colDiff <= 1 && (rowDiff > 0 || colDiff > 0)) {
      // Valid adjacent cell
      const cellExists = currentSelection.some(cell => cell.row === row && cell.col === col);
      if (!cellExists) {
        setCurrentSelection([...currentSelection, { row, col }]);
      }
    }
  };

  const handleCellMouseUp = () => {
    if (!isSelecting) return;

    // Check if selected cells form a word
    const word = currentSelection
      .map(cell => game.grid[cell.row][cell.col])
      .join('');

    const reversedWord = word.split('').reverse().join('');

    if (game.words.includes(word) || game.words.includes(reversedWord)) {
      const matchedWord = game.words.includes(word) ? word : reversedWord;
      if (!foundWords.includes(matchedWord)) {
        setFoundWords([...foundWords, matchedWord]);
        setSelectedCells([...selectedCells, ...currentSelection]);
      }
    }

    setCurrentSelection([]);
    setIsSelecting(false);
  };

  const handleSubmit = () => {
    onAnswer(foundWords);
  };

  const handleReset = () => {
    setSelectedCells([]);
    setFoundWords([]);
    setCurrentSelection([]);
  };

  const getCellStyle = (row: number, col: number) => {
    const isSelected = selectedCells.some(cell => cell.row === row && cell.col === col);
    const isCurrentlySelecting = currentSelection.some(cell => cell.row === row && cell.col === col);

    if (showFeedback && isSelected) {
      return 'bg-green-200 border-green-500';
    }

    if (isCurrentlySelecting) {
      return 'bg-blue-300 border-blue-500';
    }

    if (isSelected) {
      return 'bg-yellow-200 border-yellow-500';
    }

    return 'bg-white hover:bg-gray-50';
  };

  const getWordStyle = (word: string) => {
    if (foundWords.includes(word)) {
      return 'line-through text-green-600';
    }
    return '';
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Sopa de Letras</h3>
            {game.theme && (
              <p className="text-sm text-gray-600">Tema: {game.theme}</p>
            )}
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Word Grid */}
          <div
            className="flex justify-center select-none"
            onMouseUp={handleCellMouseUp}
            onMouseLeave={handleCellMouseUp}
          >
            <div className="inline-block border-2 border-gray-800">
              {game.grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((letter, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-10 h-10 border border-gray-400 flex items-center justify-center cursor-pointer font-bold ${getCellStyle(rowIndex, colIndex)}`}
                      onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Word List */}
          <div className="space-y-2">
            <h4 className="font-semibold mb-3">Encuentra estas palabras:</h4>
            <div className="grid grid-cols-2 gap-2">
              {game.words.map((word, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border ${getWordStyle(word)}`}
                >
                  {foundWords.includes(word) && (
                    <Check className="w-4 h-4 inline-block mr-1 text-green-600" />
                  )}
                  {word}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className="text-sm font-medium">Progreso</p>
              <p className="text-2xl font-bold text-blue-600">
                {foundWords.length} / {game.words.length}
              </p>
            </div>
          </div>
        </div>

        {showFeedback && feedback && (
          <div className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="font-medium">
              {feedback.correct ? '¡Excelente! Encontraste todas las palabras.' : `Encontraste ${foundWords.length} de ${game.words.length} palabras.`}
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
              disabled={foundWords.length === 0}
            >
              Verificar Respuestas
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