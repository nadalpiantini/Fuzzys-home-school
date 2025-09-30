'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Brain,
  Timer,
  Target,
  Sparkles,
  Lightbulb,
  Check,
  X,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

interface CrosswordCell {
  id: string;
  row: number;
  col: number;
  letter: string;
  userLetter: string;
  isBlack: boolean;
  number?: number;
  acrossClueId?: string;
  downClueId?: string;
  isHighlighted: boolean;
  isCurrentWord: boolean;
}

interface CrosswordClue {
  id: string;
  number: number;
  direction: 'across' | 'down';
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
  length: number;
  isCompleted: boolean;
}

interface GameStats {
  cellsFilled: number;
  totalCells: number;
  hintsUsed: number;
  timeElapsed: number;
  score: number;
  wordsCompleted: number;
  totalWords: number;
}

// Educational crossword puzzle data
const CROSSWORD_DATA: {
  grid: string[][];
  clues: Omit<CrosswordClue, 'isCompleted'>[];
} = {
  grid: [
    ['S', 'O', 'L', 'A', 'R'],
    ['O', '#', 'U', '#', 'I'],
    ['I', 'L', 'U', 'N', 'A'],
    ['L', '#', 'Z', '#', 'R'],
    ['S', 'T', 'A', 'R', 'S'],
  ],
  clues: [
    {
      id: 'across-1',
      number: 1,
      direction: 'across',
      clue: 'Energía del sol que podemos usar',
      answer: 'SOLAR',
      startRow: 0,
      startCol: 0,
      length: 5,
    },
    {
      id: 'across-3',
      number: 3,
      direction: 'across',
      clue: 'Satélite natural de la Tierra',
      answer: 'LUNA',
      startRow: 2,
      startCol: 2,
      length: 4,
    },
    {
      id: 'across-5',
      number: 5,
      direction: 'across',
      clue: 'Puntos brillantes en el cielo nocturno',
      answer: 'STARS',
      startRow: 4,
      startCol: 0,
      length: 5,
    },
    {
      id: 'down-1',
      number: 1,
      direction: 'down',
      clue: 'Capa superior de la Tierra',
      answer: 'SOILS',
      startRow: 0,
      startCol: 0,
      length: 5,
    },
    {
      id: 'down-2',
      number: 2,
      direction: 'down',
      clue: 'Gas que respiramos del aire',
      answer: 'AIRE',
      startRow: 0,
      startCol: 4,
      length: 4,
    },
  ],
};

export default function CrosswordGame() {
  const router = useRouter();
  const [cells, setCells] = useState<CrosswordCell[]>([]);
  const [clues, setClues] = useState<CrosswordClue[]>([]);
  const [currentClue, setCurrentClue] = useState<CrosswordClue | null>(null);
  const [selectedCell, setSelectedCell] = useState<CrosswordCell | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    cellsFilled: 0,
    totalCells: 0,
    hintsUsed: 0,
    timeElapsed: 0,
    score: 0,
    wordsCompleted: 0,
    totalWords: CROSSWORD_DATA.clues.length,
  });
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [checkedAnswers, setCheckedAnswers] = useState(false);
  const cellRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Initialize game
  const initializeGame = useCallback(() => {
    const gameGrid = CROSSWORD_DATA.grid;
    const totalValidCells = gameGrid.flat().filter(cell => cell !== '#').length;

    // Create cells
    const gameCells: CrosswordCell[] = [];
    const cellNumbers: { [key: string]: number } = {};
    let numberCounter = 1;

    // Assign numbers to cells that start words
    CROSSWORD_DATA.clues.forEach(clue => {
      const key = `${clue.startRow}-${clue.startCol}`;
      if (!cellNumbers[key]) {
        cellNumbers[key] = numberCounter++;
      }
    });

    // Create grid cells
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const isBlack = gameGrid[row][col] === '#';
        const cellKey = `${row}-${col}`;

        if (!isBlack) {
          const cell: CrosswordCell = {
            id: `cell-${row}-${col}`,
            row,
            col,
            letter: gameGrid[row][col],
            userLetter: '',
            isBlack: false,
            number: cellNumbers[cellKey],
            isHighlighted: false,
            isCurrentWord: false,
          };

          // Find which clues this cell belongs to
          CROSSWORD_DATA.clues.forEach(clue => {
            if (clue.direction === 'across') {
              if (row === clue.startRow && col >= clue.startCol && col < clue.startCol + clue.length) {
                cell.acrossClueId = clue.id;
              }
            } else {
              if (col === clue.startCol && row >= clue.startRow && row < clue.startRow + clue.length) {
                cell.downClueId = clue.id;
              }
            }
          });

          gameCells.push(cell);
        }
      }
    }

    // Initialize clues
    const gameClues: CrosswordClue[] = CROSSWORD_DATA.clues.map(clue => ({
      ...clue,
      number: cellNumbers[`${clue.startRow}-${clue.startCol}`] || clue.number,
      isCompleted: false,
    }));

    setCells(gameCells);
    setClues(gameClues);
    setCurrentClue(null);
    setSelectedCell(null);
    setGameStats({
      cellsFilled: 0,
      totalCells: totalValidCells,
      hintsUsed: 0,
      timeElapsed: 0,
      score: 0,
      wordsCompleted: 0,
      totalWords: CROSSWORD_DATA.clues.length,
    });
    setGameWon(false);
    setGameStarted(false);
    setShowHints(false);
    setCheckedAnswers(false);
  }, []);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameWon]);

  // Handle cell click
  const handleCellClick = (cell: CrosswordCell) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    setSelectedCell(cell);

    // Determine which clue to highlight (prefer across, then down)
    const clueId = cell.acrossClueId || cell.downClueId;
    if (clueId) {
      const clue = clues.find(c => c.id === clueId);
      if (clue) {
        setCurrentClue(clue);
        highlightWord(clue);
      }
    }

    // Focus the input
    const cellInput = cellRefs.current[cell.id];
    if (cellInput) {
      cellInput.focus();
    }
  };

  // Highlight cells for current word
  const highlightWord = (clue: CrosswordClue) => {
    setCells(prev => prev.map(cell => {
      const belongsToClue = clue.direction === 'across'
        ? cell.row === clue.startRow && cell.col >= clue.startCol && cell.col < clue.startCol + clue.length
        : cell.col === clue.startCol && cell.row >= clue.startRow && cell.row < clue.startRow + clue.length;

      return {
        ...cell,
        isCurrentWord: belongsToClue,
        isHighlighted: belongsToClue,
      };
    }));
  };

  // Handle letter input
  const handleLetterInput = (cellId: string, letter: string) => {
    if (!letter.match(/[a-zA-ZñÑ]/)) return;

    const upperLetter = letter.toUpperCase();

    setCells(prev => {
      const newCells = prev.map(cell =>
        cell.id === cellId
          ? { ...cell, userLetter: upperLetter }
          : cell
      );

      // Update stats
      const filledCells = newCells.filter(cell => cell.userLetter !== '').length;
      setGameStats(prevStats => ({
        ...prevStats,
        cellsFilled: filledCells,
        score: Math.max(0, 1000 - (prevStats.hintsUsed * 50) - (prevStats.timeElapsed * 2)),
      }));

      return newCells;
    });

    // Move to next cell if in current word
    if (currentClue) {
      const currentCell = cells.find(c => c.id === cellId);
      if (currentCell) {
        const nextCell = getNextCell(currentCell, currentClue);
        if (nextCell) {
          setSelectedCell(nextCell);
          const nextInput = cellRefs.current[nextCell.id];
          if (nextInput) {
            setTimeout(() => nextInput.focus(), 10);
          }
        }
      }
    }
  };

  // Get next cell in current word
  const getNextCell = (currentCell: CrosswordCell, clue: CrosswordClue): CrosswordCell | null => {
    if (clue.direction === 'across') {
      return cells.find(cell =>
        cell.row === currentCell.row &&
        cell.col === currentCell.col + 1 &&
        cell.col < clue.startCol + clue.length
      ) || null;
    } else {
      return cells.find(cell =>
        cell.col === currentCell.col &&
        cell.row === currentCell.row + 1 &&
        cell.row < clue.startRow + clue.length
      ) || null;
    }
  };

  // Handle backspace
  const handleBackspace = (cellId: string) => {
    const currentCell = cells.find(c => c.id === cellId);
    if (!currentCell) return;

    // If current cell is empty, move to previous cell
    if (currentCell.userLetter === '' && currentClue) {
      const prevCell = getPreviousCell(currentCell, currentClue);
      if (prevCell) {
        setCells(prev => prev.map(cell =>
          cell.id === prevCell.id ? { ...cell, userLetter: '' } : cell
        ));
        setSelectedCell(prevCell);
        const prevInput = cellRefs.current[prevCell.id];
        if (prevInput) {
          setTimeout(() => prevInput.focus(), 10);
        }
      }
    } else {
      // Clear current cell
      setCells(prev => prev.map(cell =>
        cell.id === cellId ? { ...cell, userLetter: '' } : cell
      ));
    }
  };

  // Get previous cell in current word
  const getPreviousCell = (currentCell: CrosswordCell, clue: CrosswordClue): CrosswordCell | null => {
    if (clue.direction === 'across') {
      return cells.find(cell =>
        cell.row === currentCell.row &&
        cell.col === currentCell.col - 1 &&
        cell.col >= clue.startCol
      ) || null;
    } else {
      return cells.find(cell =>
        cell.col === currentCell.col &&
        cell.row === currentCell.row - 1 &&
        cell.row >= clue.startRow
      ) || null;
    }
  };

  // Use hint for current word
  const useHint = () => {
    if (!currentClue) return;

    const wordCells = cells.filter(cell => {
      return currentClue.direction === 'across'
        ? cell.row === currentClue.startRow && cell.col >= currentClue.startCol && cell.col < currentClue.startCol + currentClue.length
        : cell.col === currentClue.startCol && cell.row >= currentClue.startRow && cell.row < currentClue.startRow + currentClue.length;
    });

    // Find first empty cell and fill it
    const emptyCell = wordCells.find(cell => cell.userLetter === '');
    if (emptyCell) {
      setCells(prev => prev.map(cell =>
        cell.id === emptyCell.id
          ? { ...cell, userLetter: cell.letter }
          : cell
      ));

      setGameStats(prev => ({
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
        score: Math.max(0, prev.score - 50),
      }));
    }
  };

  // Check answers
  const checkAnswers = () => {
    setCheckedAnswers(true);

    // Update clue completion status
    const updatedClues = clues.map(clue => {
      const wordCells = cells.filter(cell => {
        return clue.direction === 'across'
          ? cell.row === clue.startRow && cell.col >= clue.startCol && cell.col < clue.startCol + clue.length
          : cell.col === clue.startCol && cell.row >= clue.startRow && cell.row < clue.startRow + clue.length;
      });

      const userWord = wordCells.map(cell => cell.userLetter).join('');
      const isCompleted = userWord === clue.answer;

      return { ...clue, isCompleted };
    });

    setClues(updatedClues);

    const completedWords = updatedClues.filter(clue => clue.isCompleted).length;
    setGameStats(prev => ({
      ...prev,
      wordsCompleted: completedWords,
    }));

    // Check if game is won
    if (completedWords === updatedClues.length) {
      setGameWon(true);
    }

    // Auto-hide check results after 3 seconds
    setTimeout(() => {
      setCheckedAnswers(false);
    }, 3000);
  };

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent, cellId: string) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace(cellId);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentCell = cells.find(c => c.id === cellId);
      if (currentCell) {
        let nextCell: CrosswordCell | null = null;

        if (e.key === 'ArrowRight') {
          nextCell = cells.find(c => c.row === currentCell.row && c.col === currentCell.col + 1) || null;
        } else if (e.key === 'ArrowLeft') {
          nextCell = cells.find(c => c.row === currentCell.row && c.col === currentCell.col - 1) || null;
        } else if (e.key === 'ArrowDown') {
          nextCell = cells.find(c => c.col === currentCell.col && c.row === currentCell.row + 1) || null;
        } else if (e.key === 'ArrowUp') {
          nextCell = cells.find(c => c.col === currentCell.col && c.row === currentCell.row - 1) || null;
        }

        if (nextCell) {
          handleCellClick(nextCell);
        }
      }
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get performance rating
  const getPerformanceRating = () => {
    if (gameStats.hintsUsed === 0 && gameStats.timeElapsed <= 300) return { stars: 3, text: '¡Excelente!' };
    if (gameStats.hintsUsed <= 2 && gameStats.timeElapsed <= 600) return { stars: 2, text: '¡Muy bien!' };
    return { stars: 1, text: '¡Bien hecho!' };
  };

  // Get cell display letter
  const getCellDisplayLetter = (cell: CrosswordCell) => {
    if (checkedAnswers) {
      if (cell.userLetter === cell.letter) {
        return cell.userLetter;
      } else if (cell.userLetter !== '') {
        return cell.userLetter;
      }
    }
    return cell.userLetter;
  };

  // Get cell styling based on state
  const getCellStyling = (cell: CrosswordCell) => {
    let baseClasses = "w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200";

    if (cell.isCurrentWord) {
      baseClasses += " bg-purple-100 border-purple-400";
    } else {
      baseClasses += " bg-white";
    }

    if (selectedCell?.id === cell.id) {
      baseClasses += " ring-2 ring-purple-600";
    }

    if (checkedAnswers) {
      if (cell.userLetter === cell.letter && cell.userLetter !== '') {
        baseClasses += " bg-green-100 border-green-400 text-green-800";
      } else if (cell.userLetter !== '' && cell.userLetter !== cell.letter) {
        baseClasses += " bg-red-100 border-red-400 text-red-800";
      }
    }

    return baseClasses;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  📝 Crucigrama Científico
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Resuelve el crucigrama sobre ciencias!
                </p>
              </div>
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
      </header>

      {/* Game Stats */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Progreso</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {gameStats.cellsFilled}/{gameStats.totalCells}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Palabras</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {gameStats.wordsCompleted}/{gameStats.totalWords}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Timer className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatTime(gameStats.timeElapsed)}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Puntos</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{gameStats.score}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Game Area */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Crossword Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex justify-center">
                <div className="grid grid-cols-5 gap-1 p-4 bg-white/60 rounded-xl border border-gray-200">
                  {Array.from({ length: 25 }).map((_, index) => {
                    const row = Math.floor(index / 5);
                    const col = index % 5;
                    const cell = cells.find(c => c.row === row && c.col === col);

                    if (!cell) {
                      // Black cell
                      return (
                        <div
                          key={`black-${index}`}
                          className="w-12 h-12 bg-gray-800 border border-gray-600"
                        />
                      );
                    }

                    return (
                      <div key={cell.id} className="relative">
                        {cell.number && (
                          <div className="absolute top-0 left-0 text-xs font-bold text-gray-700 z-10 bg-white/80 rounded-br px-1">
                            {cell.number}
                          </div>
                        )}
                        <input
                          ref={el => { cellRefs.current[cell.id] = el; }}
                          type="text"
                          maxLength={1}
                          value={getCellDisplayLetter(cell)}
                          onChange={(e) => handleLetterInput(cell.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, cell.id)}
                          onClick={() => handleCellClick(cell)}
                          className={getCellStyling(cell)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Game Controls */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Button
                  onClick={checkAnswers}
                  disabled={gameStats.cellsFilled === 0}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Verificar Respuestas
                </Button>

                <Button
                  onClick={useHint}
                  disabled={!currentClue}
                  variant="outline"
                  className="bg-white/50 hover:bg-white/80"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Pista ({gameStats.hintsUsed} usadas)
                </Button>

                <Button
                  onClick={() => setShowHints(!showHints)}
                  variant="outline"
                  className="bg-white/50 hover:bg-white/80"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {showHints ? 'Ocultar' : 'Mostrar'} Ayuda
                </Button>

                <Button
                  onClick={initializeGame}
                  variant="outline"
                  className="bg-white/50 hover:bg-white/80"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reiniciar
                </Button>
              </div>
            </div>
          </div>

          {/* Clues Panel */}
          <div className="space-y-6">
            {/* Across Clues */}
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-blue-500" />
                Horizontales
              </h3>
              <div className="space-y-3">
                {clues
                  .filter(clue => clue.direction === 'across')
                  .map(clue => (
                    <div
                      key={clue.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        currentClue?.id === clue.id
                          ? 'bg-blue-100 border-2 border-blue-300'
                          : 'bg-white/60 hover:bg-white/80 border border-gray-200'
                      } ${clue.isCompleted ? 'ring-2 ring-green-400' : ''}`}
                      onClick={() => {
                        setCurrentClue(clue);
                        highlightWord(clue);
                        // Focus first cell of the word
                        const firstCell = cells.find(cell =>
                          cell.row === clue.startRow && cell.col === clue.startCol
                        );
                        if (firstCell) {
                          setSelectedCell(firstCell);
                          const input = cellRefs.current[firstCell.id];
                          if (input) input.focus();
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="min-w-8">
                          {clue.number}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{clue.clue}</p>
                          {showHints && (
                            <p className="text-xs text-gray-500 mt-1">
                              ({clue.length} letras: {clue.answer})
                            </p>
                          )}
                        </div>
                        {clue.isCompleted && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Down Clues */}
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowDown className="w-5 h-5 text-purple-500" />
                Verticales
              </h3>
              <div className="space-y-3">
                {clues
                  .filter(clue => clue.direction === 'down')
                  .map(clue => (
                    <div
                      key={clue.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        currentClue?.id === clue.id
                          ? 'bg-purple-100 border-2 border-purple-300'
                          : 'bg-white/60 hover:bg-white/80 border border-gray-200'
                      } ${clue.isCompleted ? 'ring-2 ring-green-400' : ''}`}
                      onClick={() => {
                        setCurrentClue(clue);
                        highlightWord(clue);
                        // Focus first cell of the word
                        const firstCell = cells.find(cell =>
                          cell.row === clue.startRow && cell.col === clue.startCol
                        );
                        if (firstCell) {
                          setSelectedCell(firstCell);
                          const input = cellRefs.current[firstCell.id];
                          if (input) input.focus();
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="min-w-8">
                          {clue.number}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{clue.clue}</p>
                          {showHints && (
                            <p className="text-xs text-gray-500 mt-1">
                              ({clue.length} letras: {clue.answer})
                            </p>
                          )}
                        </div>
                        {clue.isCompleted && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl border border-white/20">
            <div className="text-center">
              {/* Celebration Animation */}
              <div className="text-6xl mb-4 animate-bounce">
                🎉
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                ¡Excelente trabajo!
              </h2>

              <p className="text-gray-600 mb-6">
                ¡Has completado el crucigrama científico!
              </p>

              {/* Performance Rating */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                <div className="flex justify-center gap-1 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < getPerformanceRating().stars
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-lg font-semibold text-purple-600 mb-2">
                  {getPerformanceRating().text}
                </div>

                {/* Final Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Tiempo</div>
                    <div className="font-bold text-green-600">
                      {formatTime(gameStats.timeElapsed)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Pistas usadas</div>
                    <div className="font-bold text-blue-600">{gameStats.hintsUsed}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-gray-600">Puntuación Final</div>
                  <div className="text-2xl font-bold text-yellow-600">{gameStats.score}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={initializeGame}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Jugar de Nuevo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/games')}
                  size="lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Otros Juegos
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}