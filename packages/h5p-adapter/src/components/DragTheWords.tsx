import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { DragTheWordsSchema, H5PEvent } from '../types';

interface DragTheWordsProps {
  content: z.infer<typeof DragTheWordsSchema>;
  onEvent?: (event: H5PEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface DragWord {
  id: string;
  text: string;
  correctPosition: number;
  currentPosition: number | null;
  isPlaced: boolean;
}

interface DropZone {
  id: string;
  position: number;
  expectedWord: string;
  currentWord: DragWord | null;
  isCorrect: boolean;
}

export const DragTheWords: React.FC<DragTheWordsProps> = ({
  content,
  onEvent,
  className = '',
  style = {}
}) => {
  const [dragWords, setDragWords] = useState<DragWord[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [textParts, setTextParts] = useState<string[]>([]);
  const [draggedWord, setDraggedWord] = useState<DragWord | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const { taskDescription, textField, checkAnswer, tryAgain, showSolution: showSolutionText, behaviour } = content.params;

  useEffect(() => {
    parseTextAndInitialize();
  }, [textField]);

  const parseTextAndInitialize = () => {
    // Parse text field looking for words marked with asterisks *word*
    const regex = /\*([^*]+)\*/g;
    const matches: { word: string; position: number }[] = [];
    let match;
    let position = 0;

    while ((match = regex.exec(textField)) !== null) {
      matches.push({
        word: match[1],
        position: position++
      });
    }

    // Split text into parts and create drop zones
    const parts = textField.split(regex);
    const filteredParts: string[] = [];
    const zones: DropZone[] = [];
    const words: DragWord[] = [];

    let zoneIndex = 0;
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        filteredParts.push(parts[i]);
      } else {
        // This was a draggable word, create a drop zone
        const word = parts[i];
        zones.push({
          id: `zone-${zoneIndex}`,
          position: zoneIndex,
          expectedWord: word,
          currentWord: null,
          isCorrect: false
        });

        words.push({
          id: `word-${zoneIndex}`,
          text: word,
          correctPosition: zoneIndex,
          currentPosition: null,
          isPlaced: false
        });

        filteredParts.push(`__DROP_ZONE_${zoneIndex}__`);
        zoneIndex++;
      }
    }

    // Shuffle the words
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);

    setTextParts(filteredParts);
    setDropZones(zones);
    setDragWords(shuffledWords);
    setShowSolution(false);
    setIsCompleted(false);
    setScore(0);
    setAttempts(0);
  };

  const handleDragStart = (word: DragWord) => {
    setDraggedWord(word);
  };

  const handleDragEnd = () => {
    setDraggedWord(null);
  };

  const handleDrop = (zoneId: string) => {
    if (!draggedWord) return;

    const newDropZones = [...dropZones];
    const newDragWords = [...dragWords];

    // Find the target zone
    const targetZone = newDropZones.find(zone => zone.id === zoneId);
    if (!targetZone) return;

    // If the zone already has a word, move it back to the word bank
    if (targetZone.currentWord) {
      const wordToReturn = newDragWords.find(w => w.id === targetZone.currentWord!.id);
      if (wordToReturn) {
        wordToReturn.isPlaced = false;
        wordToReturn.currentPosition = null;
      }
    }

    // If the dragged word was already placed, clear its previous position
    if (draggedWord.isPlaced && draggedWord.currentPosition !== null) {
      const previousZone = newDropZones.find(zone => zone.position === draggedWord.currentPosition);
      if (previousZone) {
        previousZone.currentWord = null;
        previousZone.isCorrect = false;
      }
    }

    // Place the word in the new zone
    const wordToPlace = newDragWords.find(w => w.id === draggedWord.id);
    if (wordToPlace) {
      wordToPlace.isPlaced = true;
      wordToPlace.currentPosition = targetZone.position;
      targetZone.currentWord = wordToPlace;
      targetZone.isCorrect = wordToPlace.text === targetZone.expectedWord;
    }

    setDropZones(newDropZones);
    setDragWords(newDragWords);
    setDraggedWord(null);
  };

  const handleCheck = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    let correctCount = 0;
    const totalWords = dropZones.length;

    dropZones.forEach(zone => {
      if (zone.isCorrect) {
        correctCount++;
      }
    });

    const newScore = correctCount;
    setScore(newScore);

    const isComplete = correctCount === totalWords;
    setIsCompleted(isComplete);

    onEvent?.({
      type: isComplete ? 'completed' : 'score',
      data: {
        score: newScore,
        maxScore: totalWords,
        completion: isComplete ? 100 : (correctCount / totalWords) * 100,
        answered: true
      }
    });

    if (behaviour.instantFeedback && !isComplete) {
      // Show visual feedback for incorrect answers
      setTimeout(() => {
        // Visual feedback handled by CSS classes
      }, 100);
    }
  };

  const handleTryAgain = () => {
    if (!behaviour.enableRetry) return;

    // Move all words back to word bank
    const resetWords = dragWords.map(word => ({
      ...word,
      isPlaced: false,
      currentPosition: null
    }));

    const resetZones = dropZones.map(zone => ({
      ...zone,
      currentWord: null,
      isCorrect: false
    }));

    setDragWords(resetWords);
    setDropZones(resetZones);
    setShowSolution(false);
  };

  const handleShowSolution = () => {
    if (!behaviour.enableSolutionsButton) return;

    setShowSolution(true);

    // Place all words in their correct positions
    const solutionWords = [...dragWords];
    const solutionZones = [...dropZones];

    solutionZones.forEach(zone => {
      const correctWord = solutionWords.find(word => word.correctPosition === zone.position);
      if (correctWord) {
        correctWord.isPlaced = true;
        correctWord.currentPosition = zone.position;
        zone.currentWord = correctWord;
        zone.isCorrect = true;
      }
    });

    setDragWords(solutionWords);
    setDropZones(solutionZones);
    setScore(dropZones.length);
    setIsCompleted(true);
  };

  const renderTextWithDropZones = () => {
    return textParts.map((part, index) => {
      if (part.startsWith('__DROP_ZONE_')) {
        const zoneIndex = parseInt(part.match(/__DROP_ZONE_(\d+)__/)?.[1] || '0');
        const zone = dropZones[zoneIndex];

        return (
          <span
            key={`zone-${index}`}
            className={`inline-block min-w-[80px] min-h-[2em] mx-1 px-2 py-1 border-2 border-dashed rounded transition-all ${
              zone?.currentWord
                ? zone.isCorrect
                  ? 'border-green-500 bg-green-50'
                  : showSolution
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-400 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(zone?.id || '')}
          >
            {zone?.currentWord ? (
              <span
                className={`cursor-move font-medium ${
                  zone.isCorrect || showSolution ? 'text-green-700' : 'text-red-700'
                }`}
                draggable={!showSolution && !isCompleted}
                onDragStart={() => zone.currentWord && handleDragStart(zone.currentWord)}
                onDragEnd={handleDragEnd}
              >
                {zone.currentWord.text}
              </span>
            ) : (
              <span className="text-gray-400 text-sm">Drop here</span>
            )}
          </span>
        );
      }

      return <span key={`text-${index}`}>{part}</span>;
    });
  };

  const availableWords = dragWords.filter(word => !word.isPlaced);

  return (
    <div className={`max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg ${className}`} style={style}>
      {/* Task Description */}
      <div className="mb-6">
        <p className="text-lg text-gray-700">{taskDescription}</p>
      </div>

      {/* Text with Drop Zones */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg text-lg leading-relaxed">
        {renderTextWithDropZones()}
      </div>

      {/* Word Bank */}
      {availableWords.length > 0 && !showSolution && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Available Words:</h3>
          <div className="flex flex-wrap gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {availableWords.map(word => (
              <span
                key={word.id}
                className="px-3 py-2 bg-white border border-blue-300 rounded cursor-move hover:bg-blue-50 transition-colors font-medium"
                draggable={!isCompleted}
                onDragStart={() => handleDragStart(word)}
                onDragEnd={handleDragEnd}
              >
                {word.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mb-4">
        {!isCompleted && !showSolution && (
          <button
            onClick={handleCheck}
            disabled={dragWords.some(word => !word.isPlaced)}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {checkAnswer}
          </button>
        )}

        {!isCompleted && behaviour.enableRetry && attempts > 0 && (
          <button
            onClick={handleTryAgain}
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors"
          >
            {tryAgain}
          </button>
        )}

        {behaviour.enableSolutionsButton && !showSolution && (
          <button
            onClick={handleShowSolution}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            {showSolutionText}
          </button>
        )}
      </div>

      {/* Score Display */}
      {(isCompleted || attempts > 0) && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 px-4 py-2 bg-gray-100 rounded-lg">
            <span className="text-gray-600">Score:</span>
            <span className="font-bold text-lg">
              {score}/{dropZones.length}
            </span>
            <span className="text-gray-600">
              ({Math.round((score / dropZones.length) * 100)}%)
            </span>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {isCompleted && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-green-600">
            <span className="text-2xl">🎉</span>
            <span className="font-semibold">
              {score === dropZones.length ? 'Perfect! All words placed correctly!' : 'Exercise completed!'}
            </span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        Drag words from the word bank to the correct positions in the text.
      </div>
    </div>
  );
};

export default DragTheWords;