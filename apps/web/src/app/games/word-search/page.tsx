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
  Search,
  Timer,
  Target,
  Sparkles,
  Eye,
  Zap,
} from 'lucide-react';

interface GridCell {
  letter: string;
  row: number;
  col: number;
  isSelected: boolean;
  isFound: boolean;
  wordId?: number;
}

interface WordToFind {
  id: number;
  word: string;
  name: string;
  emoji: string;
  isFound: boolean;
  direction: 'horizontal' | 'vertical' | 'diagonal';
  startRow: number;
  startCol: number;
}

interface GameStats {
  wordsFound: number;
  timeElapsed: number;
  score: number;
  hints: number;
}

interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

// Educational words with their Spanish translations and emojis
const WORD_SETS = [
  {
    theme: 'Animales',
    words: [
      { word: 'GATO', name: 'Gato', emoji: '🐱' },
      { word: 'PERRO', name: 'Perro', emoji: '🐶' },
      { word: 'LEON', name: 'León', emoji: '🦁' },
      { word: 'OSO', name: 'Oso', emoji: '🐻' },
      { word: 'PATO', name: 'Pato', emoji: '🦆' },
      { word: 'PEZ', name: 'Pez', emoji: '🐟' },
    ]
  },
  {
    theme: 'Ciencia',
    words: [
      { word: 'AGUA', name: 'Agua', emoji: '💧' },
      { word: 'FUEGO', name: 'Fuego', emoji: '🔥' },
      { word: 'TIERRA', name: 'Tierra', emoji: '🌍' },
      { word: 'AIRE', name: 'Aire', emoji: '💨' },
      { word: 'SOL', name: 'Sol', emoji: '☀️' },
      { word: 'LUNA', name: 'Luna', emoji: '🌙' },
    ]
  },
  {
    theme: 'Cuerpo',
    words: [
      { word: 'OJO', name: 'Ojo', emoji: '👁️' },
      { word: 'MANO', name: 'Mano', emoji: '✋' },
      { word: 'PIE', name: 'Pie', emoji: '🦶' },
      { word: 'BOCA', name: 'Boca', emoji: '👄' },
      { word: 'NARIZ', name: 'Nariz', emoji: '👃' },
      { word: 'OREJA', name: 'Oreja', emoji: '👂' },
    ]
  }
];

const GRID_SIZE = 8;
const HIGHLIGHT_COLORS = [
  'bg-red-200 border-red-400',
  'bg-blue-200 border-blue-400',
  'bg-green-200 border-green-400',
  'bg-yellow-200 border-yellow-400',
  'bg-purple-200 border-purple-400',
  'bg-pink-200 border-pink-400',
];

export default function WordSearchGame() {
  const router = useRouter();
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [wordsToFind, setWordsToFind] = useState<WordToFind[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    wordsFound: 0,
    timeElapsed: 0,
    score: 0,
    hints: 3,
  });
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Selection | null>(null);
  const [currentTheme, setCurrentTheme] = useState('Animales');
  const gridRef = useRef<HTMLDivElement>(null);

  // Initialize empty grid
  const createEmptyGrid = useCallback(() => {
    const newGrid: GridCell[][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = {
          letter: '',
          row,
          col,
          isSelected: false,
          isFound: false,
        };
      }
    }
    return newGrid;
  }, []);

  // Place word in grid
  const placeWordInGrid = (grid: GridCell[][], word: string, direction: 'horizontal' | 'vertical' | 'diagonal', startRow: number, startCol: number, wordId: number) => {
    const letters = word.split('');

    for (let i = 0; i < letters.length; i++) {
      let row = startRow;
      let col = startCol;

      if (direction === 'horizontal') {
        col += i;
      } else if (direction === 'vertical') {
        row += i;
      } else if (direction === 'diagonal') {
        row += i;
        col += i;
      }

      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        grid[row][col].letter = letters[i];
        grid[row][col].wordId = wordId;
      }
    }
  };

  // Check if word can be placed
  const canPlaceWord = (grid: GridCell[][], word: string, direction: 'horizontal' | 'vertical' | 'diagonal', startRow: number, startCol: number) => {
    const letters = word.split('');

    for (let i = 0; i < letters.length; i++) {
      let row = startRow;
      let col = startCol;

      if (direction === 'horizontal') {
        col += i;
      } else if (direction === 'vertical') {
        row += i;
      } else if (direction === 'diagonal') {
        row += i;
        col += i;
      }

      // Check bounds
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
        return false;
      }

      // Check if cell is empty or has the same letter
      if (grid[row][col].letter !== '' && grid[row][col].letter !== letters[i]) {
        return false;
      }
    }

    return true;
  };

  // Fill empty cells with random letters
  const fillEmptyCells = (grid: GridCell[][]) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col].letter === '') {
          grid[row][col].letter = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const newGrid = createEmptyGrid();
    const currentWordSet = WORD_SETS.find(set => set.theme === currentTheme);
    if (!currentWordSet) return;

    const newWordsToFind: WordToFind[] = [];
    const directions: ('horizontal' | 'vertical' | 'diagonal')[] = ['horizontal', 'vertical', 'diagonal'];

    // Try to place each word
    currentWordSet.words.forEach((wordData, index) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const maxRow = direction === 'vertical' || direction === 'diagonal'
          ? GRID_SIZE - wordData.word.length
          : GRID_SIZE - 1;
        const maxCol = direction === 'horizontal' || direction === 'diagonal'
          ? GRID_SIZE - wordData.word.length
          : GRID_SIZE - 1;

        const startRow = Math.floor(Math.random() * (maxRow + 1));
        const startCol = Math.floor(Math.random() * (maxCol + 1));

        if (canPlaceWord(newGrid, wordData.word, direction, startRow, startCol)) {
          placeWordInGrid(newGrid, wordData.word, direction, startRow, startCol, index);
          newWordsToFind.push({
            id: index,
            word: wordData.word,
            name: wordData.name,
            emoji: wordData.emoji,
            isFound: false,
            direction,
            startRow,
            startCol,
          });
          placed = true;
        }

        attempts++;
      }
    });

    // Fill empty cells
    fillEmptyCells(newGrid);

    setGrid(newGrid);
    setWordsToFind(newWordsToFind);
    setGameStats({
      wordsFound: 0,
      timeElapsed: 0,
      score: 0,
      hints: 3,
    });
    setGameWon(false);
    setGameStarted(false);
    setCurrentSelection(null);
    setIsSelecting(false);
  }, [createEmptyGrid, currentTheme]);

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

  // Get cells in selection
  const getCellsInSelection = (selection: Selection): {row: number, col: number}[] => {
    const cells: {row: number, col: number}[] = [];
    const { startRow, startCol, endRow, endCol } = selection;

    // Determine direction
    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    // Normalize direction
    const rowStep = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
    const colStep = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;

    // Check if it's a valid selection (straight line)
    if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
      return cells; // Not a valid selection
    }

    const distance = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

    for (let i = 0; i <= distance; i++) {
      const row = startRow + (i * rowStep);
      const col = startCol + (i * colStep);
      cells.push({ row, col });
    }

    return cells;
  };

  // Check if selection matches a word
  const checkWordMatch = (selection: Selection): WordToFind | null => {
    const cells = getCellsInSelection(selection);
    if (cells.length === 0) return null;

    const selectedWord = cells.map(({row, col}) => grid[row][col].letter).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    return wordsToFind.find(word =>
      !word.isFound && (word.word === selectedWord || word.word === reversedWord)
    ) || null;
  };

  // Handle mouse down on cell
  const handleMouseDown = (row: number, col: number) => {
    if (gameWon) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    setIsSelecting(true);
    setCurrentSelection({ startRow: row, startCol: col, endRow: row, endCol: col });

    // Clear previous selection highlighting
    setGrid(prev => prev.map(gridRow =>
      gridRow.map(cell => ({ ...cell, isSelected: false }))
    ));
  };

  // Handle mouse move over cell
  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting || !currentSelection) return;

    const newSelection = { ...currentSelection, endRow: row, endCol: col };
    setCurrentSelection(newSelection);

    // Update grid selection highlighting
    const cellsInSelection = getCellsInSelection(newSelection);

    setGrid(prev => prev.map(gridRow =>
      gridRow.map(cell => ({
        ...cell,
        isSelected: cellsInSelection.some(({row: r, col: c}) => r === cell.row && c === cell.col)
      }))
    ));
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (!isSelecting || !currentSelection) return;

    setIsSelecting(false);

    const matchedWord = checkWordMatch(currentSelection);

    if (matchedWord) {
      // Word found!
      const cells = getCellsInSelection(currentSelection);
      const colorIndex = matchedWord.id % HIGHLIGHT_COLORS.length;

      // Mark cells as found
      setGrid(prev => prev.map(gridRow =>
        gridRow.map(cell => {
          const isInWord = cells.some(({row: r, col: c}) => r === cell.row && c === cell.col);
          return {
            ...cell,
            isSelected: false,
            isFound: isInWord ? true : cell.isFound,
            wordId: isInWord ? matchedWord.id : cell.wordId,
          };
        })
      ));

      // Mark word as found
      setWordsToFind(prev => prev.map(word =>
        word.id === matchedWord.id ? { ...word, isFound: true } : word
      ));

      // Update stats
      const newWordsFound = gameStats.wordsFound + 1;
      const timeBonus = Math.max(0, 300 - gameStats.timeElapsed);
      const newScore = gameStats.score + 100 + timeBonus;

      setGameStats(prev => ({
        ...prev,
        wordsFound: newWordsFound,
        score: newScore,
      }));

      // Check if game is won
      if (newWordsFound === wordsToFind.length) {
        setGameWon(true);
      }
    } else {
      // Clear selection
      setGrid(prev => prev.map(gridRow =>
        gridRow.map(cell => ({ ...cell, isSelected: false }))
      ));
    }

    setCurrentSelection(null);
  };

  // Use hint
  const useHint = () => {
    if (gameStats.hints <= 0) return;

    const unFoundWords = wordsToFind.filter(word => !word.isFound);
    if (unFoundWords.length === 0) return;

    const randomWord = unFoundWords[Math.floor(Math.random() * unFoundWords.length)];

    // Highlight first letter of the word
    setGrid(prev => prev.map(gridRow =>
      gridRow.map(cell => ({
        ...cell,
        isSelected: cell.row === randomWord.startRow && cell.col === randomWord.startCol
      }))
    ));

    setGameStats(prev => ({
      ...prev,
      hints: prev.hints - 1,
    }));

    // Clear hint after 2 seconds
    setTimeout(() => {
      setGrid(prev => prev.map(gridRow =>
        gridRow.map(cell => ({ ...cell, isSelected: false }))
      ));
    }, 2000);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get performance rating
  const getPerformanceRating = () => {
    if (gameStats.timeElapsed <= 60) return { stars: 3, text: '¡Excelente!' };
    if (gameStats.timeElapsed <= 120) return { stars: 2, text: '¡Muy bien!' };
    return { stars: 1, text: '¡Bien hecho!' };
  };

  // Get cell styling
  const getCellStyling = (cell: GridCell) => {
    if (cell.isFound) {
      const colorIndex = (cell.wordId || 0) % HIGHLIGHT_COLORS.length;
      return `${HIGHLIGHT_COLORS[colorIndex]} border-2`;
    }
    if (cell.isSelected) {
      return 'bg-blue-300 border-blue-500 border-2';
    }
    return 'bg-white hover:bg-gray-100 border border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl text-white">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🔍 Sopa de Letras
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Encuentra las palabras escondidas!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="bg-white/50 border border-white/20 rounded-lg px-3 py-2 text-sm"
                disabled={gameStarted}
              >
                {WORD_SETS.map(set => (
                  <option key={set.theme} value={set.theme}>{set.theme}</option>
                ))}
              </select>

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

      {/* Game Stats */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Palabras</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {gameStats.wordsFound}/{wordsToFind.length}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Timer className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
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

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Eye className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Pistas</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{gameStats.hints}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Content */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Word List */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Palabras a Encontrar
              </h3>

              <div className="space-y-2">
                {wordsToFind.map((word) => (
                  <div
                    key={word.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                      word.isFound
                        ? 'bg-green-100 border border-green-300'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{word.emoji}</span>
                      <span className={`font-medium ${
                        word.isFound ? 'line-through text-green-600' : 'text-gray-700'
                      }`}>
                        {word.name}
                      </span>
                    </div>
                    {word.isFound && (
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        ✓
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={useHint}
                  disabled={gameStats.hints <= 0 || gameWon}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Usar Pista ({gameStats.hints})
                </Button>

                <Button
                  onClick={initializeGame}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Nuevo Juego
                </Button>
              </div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
              <div
                ref={gridRef}
                className="grid grid-cols-8 gap-1 sm:gap-2 max-w-md lg:max-w-lg mx-auto select-none"
                onMouseLeave={() => {
                  if (isSelecting) {
                    handleMouseUp();
                  }
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`aspect-square flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer transition-all duration-200 rounded ${getCellStyling(cell)}`}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                      onMouseUp={handleMouseUp}
                    >
                      {cell.letter}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 text-center text-sm text-gray-600">
                <p>🖱️ Arrastra para seleccionar palabras</p>
                <p>📱 En móvil: toca y arrastra</p>
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
                ¡Felicitaciones!
              </h2>

              <p className="text-gray-600 mb-6">
                ¡Has encontrado todas las palabras!
              </p>

              {/* Performance Rating */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6">
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
                <div className="text-lg font-semibold text-blue-600 mb-2">
                  {getPerformanceRating().text}
                </div>

                {/* Final Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Palabras</div>
                    <div className="font-bold text-green-600">{gameStats.wordsFound}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tiempo</div>
                    <div className="font-bold text-blue-600">
                      {formatTime(gameStats.timeElapsed)}
                    </div>
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
                  className="bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600"
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