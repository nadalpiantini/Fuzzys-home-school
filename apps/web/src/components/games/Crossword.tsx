'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, HelpCircle } from 'lucide-react';
import type { CrosswordGame } from '@fuzzy/game-engine';

interface CrosswordProps {
  game: CrosswordGame;
  onAnswer: (grid: (string | null)[][]) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    correctGrid?: (string | null)[][];
  };
}

interface CellPosition {
  row: number;
  col: number;
}

export const Crossword: React.FC<CrosswordProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback
}) => {
  const [userGrid, setUserGrid] = useState<(string | null)[][]>([]);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [selectedClue, setSelectedClue] = useState<{ type: 'across' | 'down'; number: number } | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Initialize user grid with empty cells
    const initialGrid = game.grid.map(row =>
      row.map(cell => cell === null ? null : '')
    );
    setUserGrid(initialGrid);
  }, [game.grid]);

  const handleCellClick = (row: number, col: number) => {
    if (game.grid[row][col] === null || showFeedback) return;

    setSelectedCell({ row, col });

    // Find associated clue
    const acrossClue = game.clues.across.find(
      clue => clue.startRow === row && clue.startCol <= col &&
      col < clue.startCol + clue.answer.length
    );

    const downClue = game.clues.down.find(
      clue => clue.startCol === col && clue.startRow <= row &&
      row < clue.startRow + clue.answer.length
    );

    if (acrossClue) {
      setSelectedClue({ type: 'across', number: acrossClue.number });
    } else if (downClue) {
      setSelectedClue({ type: 'down', number: downClue.number });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (showFeedback) return;

    const key = e.key.toUpperCase();

    if (key.length === 1 && /[A-ZÑÁÉÍÓÚ]/.test(key)) {
      const newGrid = [...userGrid];
      newGrid[row][col] = key;
      setUserGrid(newGrid);

      // Move to next cell
      if (selectedClue?.type === 'across' && col < game.grid[0].length - 1 && game.grid[row][col + 1] !== null) {
        setSelectedCell({ row, col: col + 1 });
      } else if (selectedClue?.type === 'down' && row < game.grid.length - 1 && game.grid[row + 1][col] !== null) {
        setSelectedCell({ row: row + 1, col });
      }
    } else if (e.key === 'Backspace') {
      const newGrid = [...userGrid];
      newGrid[row][col] = '';
      setUserGrid(newGrid);

      // Move to previous cell
      if (selectedClue?.type === 'across' && col > 0 && game.grid[row][col - 1] !== null) {
        setSelectedCell({ row, col: col - 1 });
      } else if (selectedClue?.type === 'down' && row > 0 && game.grid[row - 1][col] !== null) {
        setSelectedCell({ row: row - 1, col });
      }
    }
  };

  const handleSubmit = () => {
    onAnswer(userGrid);
  };

  const getCellStyle = (row: number, col: number) => {
    if (game.grid[row][col] === null) return 'bg-gray-900';

    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isInSelectedWord = isInSelectedClue(row, col);

    if (showFeedback) {
      const userValue = userGrid[row][col];
      const correctValue = game.grid[row][col];

      if (userValue === correctValue) {
        return 'bg-green-100 border-green-500';
      } else if (userValue && userValue !== '') {
        return 'bg-red-100 border-red-500';
      }
      return 'bg-white';
    }

    if (isSelected) return 'bg-blue-200 border-blue-500';
    if (isInSelectedWord) return 'bg-blue-50 border-blue-300';

    return 'bg-white hover:bg-gray-50';
  };

  const isInSelectedClue = (row: number, col: number): boolean => {
    if (!selectedClue) return false;

    const clueList = selectedClue.type === 'across' ? game.clues.across : game.clues.down;
    const clue = clueList.find(c => c.number === selectedClue.number);

    if (!clue) return false;

    if (selectedClue.type === 'across') {
      return row === clue.startRow && col >= clue.startCol && col < clue.startCol + clue.answer.length;
    } else {
      return col === clue.startCol && row >= clue.startRow && row < clue.startRow + clue.answer.length;
    }
  };

  const getCellNumber = (row: number, col: number): number | null => {
    const acrossClue = game.clues.across.find(c => c.startRow === row && c.startCol === col);
    const downClue = game.clues.down.find(c => c.startRow === row && c.startCol === col);

    return acrossClue?.number || downClue?.number || null;
  };

  return (
    <Card className="p-6 max-w-6xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Crucigrama</h3>
          {!showFeedback && (
            <Button
              onClick={() => setShowHint(!showHint)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              {showHint ? 'Ocultar' : 'Mostrar'} Pistas
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Crossword Grid */}
          <div className="flex justify-center">
            <div className="inline-block border-2 border-gray-800">
              {userGrid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => {
                    const cellNumber = getCellNumber(rowIndex, colIndex);
                    const isBlack = game.grid[rowIndex][colIndex] === null;

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`relative w-10 h-10 border border-gray-400 ${getCellStyle(rowIndex, colIndex)}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {!isBlack && (
                          <>
                            {cellNumber && (
                              <span className="absolute top-0 left-0.5 text-xs font-bold">
                                {cellNumber}
                              </span>
                            )}
                            <input
                              type="text"
                              value={cell || ''}
                              onChange={() => {}}
                              onKeyDown={(e) => handleKeyPress(e, rowIndex, colIndex)}
                              className="w-full h-full text-center font-bold bg-transparent outline-none"
                              maxLength={1}
                              disabled={showFeedback}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Clues */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Horizontal</h4>
              <div className="space-y-1">
                {game.clues.across.map(clue => (
                  <div
                    key={clue.number}
                    className={`p-2 rounded cursor-pointer ${
                      selectedClue?.type === 'across' && selectedClue.number === clue.number
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedClue({ type: 'across', number: clue.number });
                      setSelectedCell({ row: clue.startRow, col: clue.startCol });
                    }}
                  >
                    <span className="font-medium">{clue.number}.</span> {clue.clue}
                    {showHint && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({clue.answer.length} letras)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Vertical</h4>
              <div className="space-y-1">
                {game.clues.down.map(clue => (
                  <div
                    key={clue.number}
                    className={`p-2 rounded cursor-pointer ${
                      selectedClue?.type === 'down' && selectedClue.number === clue.number
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedClue({ type: 'down', number: clue.number });
                      setSelectedCell({ row: clue.startRow, col: clue.startCol });
                    }}
                  >
                    <span className="font-medium">{clue.number}.</span> {clue.clue}
                    {showHint && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({clue.answer.length} letras)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showFeedback && feedback && (
          <div className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="font-medium">
              {feedback.correct ? '¡Excelente! Completaste el crucigrama.' : 'Hay algunos errores en el crucigrama.'}
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
            >
              Verificar Crucigrama
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