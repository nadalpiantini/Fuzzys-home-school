import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { DialogCardsSchema, H5PEvent } from '../types';

interface DialogCardsProps {
  content: z.infer<typeof DialogCardsSchema>;
  onEvent?: (event: H5PEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface Card {
  text: string;
  answer: string;
  image?: {
    url: string;
    alt: string;
  };
  audio?: string;
  tips?: string[];
}

interface CardProgress {
  correct: number;
  incorrect: number;
  proficiency: number;
}

export const DialogCards: React.FC<DialogCardsProps> = ({
  content,
  onEvent,
  className = '',
  style = {}
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardOrder, setCardOrder] = useState<number[]>([]);
  const [cardProgress, setCardProgress] = useState<Record<number, CardProgress>>({});
  const [showTips, setShowTips] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const { title, description, cards, behaviour } = content.params;
  const currentCard = cards[cardOrder[currentCardIndex]];
  const progress = cardProgress[cardOrder[currentCardIndex]] || { correct: 0, incorrect: 0, proficiency: 0 };

  useEffect(() => {
    // Initialize card order
    const initialOrder = cards.map((_, index) => index);
    if (behaviour.randomCards) {
      // Fisher-Yates shuffle
      for (let i = initialOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [initialOrder[i], initialOrder[j]] = [initialOrder[j], initialOrder[i]];
      }
    }
    setCardOrder(initialOrder);

    // Initialize progress for all cards
    const initialProgress: Record<number, CardProgress> = {};
    cards.forEach((_, index) => {
      initialProgress[index] = { correct: 0, incorrect: 0, proficiency: 0 };
    });
    setCardProgress(initialProgress);
  }, [cards, behaviour.randomCards]);

  const calculateProficiency = (correct: number, incorrect: number): number => {
    const total = correct + incorrect;
    if (total === 0) return 0;

    // Simple proficiency calculation: weighted towards recent performance
    const accuracy = correct / total;
    const experience = Math.min(total / 5, 1); // Cap experience factor at 5 attempts

    return Math.round(accuracy * experience * behaviour.maxProficiency);
  };

  const handleResponse = (isCorrect: boolean) => {
    const cardIndex = cardOrder[currentCardIndex];
    const newProgress = { ...cardProgress };

    if (isCorrect) {
      newProgress[cardIndex].correct++;
    } else {
      newProgress[cardIndex].incorrect++;
    }

    newProgress[cardIndex].proficiency = calculateProficiency(
      newProgress[cardIndex].correct,
      newProgress[cardIndex].incorrect
    );

    setCardProgress(newProgress);

    onEvent?.({
      type: 'interaction',
      data: {
        correct: isCorrect,
        score: Object.values(newProgress).reduce((sum, p) => sum + p.proficiency, 0),
        maxScore: cards.length * behaviour.maxProficiency
      }
    });

    // Auto-advance after a short delay
    setTimeout(() => {
      goToNextCard();
    }, 1500);
  };

  const goToNextCard = () => {
    setShowAnswer(false);
    setShowTips(false);

    if (currentCardIndex < cardOrder.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Check if all cards have reached minimum proficiency
      const allProficient = Object.values(cardProgress).every(
        p => p.proficiency >= Math.ceil(behaviour.maxProficiency * 0.8)
      );

      if (allProficient || !behaviour.enableRetry) {
        setSessionComplete(true);
        onEvent?.({
          type: 'completed',
          data: {
            completion: 100,
            score: Object.values(cardProgress).reduce((sum, p) => sum + p.proficiency, 0),
            maxScore: cards.length * behaviour.maxProficiency
          }
        });
      } else {
        // Reset to first card for another round
        setCurrentCardIndex(0);
        // Optionally re-shuffle cards
        if (behaviour.randomCards) {
          const newOrder = [...cardOrder];
          for (let i = newOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
          }
          setCardOrder(newOrder);
        }
      }
    }
  };

  const goToPreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setShowAnswer(false);
      setShowTips(false);
    }
  };

  const restartSession = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setShowTips(false);
    setSessionComplete(false);

    // Reset progress
    const resetProgress: Record<number, CardProgress> = {};
    cards.forEach((_, index) => {
      resetProgress[index] = { correct: 0, incorrect: 0, proficiency: 0 };
    });
    setCardProgress(resetProgress);
  };

  if (sessionComplete) {
    const totalScore = Object.values(cardProgress).reduce((sum, p) => sum + p.proficiency, 0);
    const maxScore = cards.length * behaviour.maxProficiency;
    const percentage = Math.round((totalScore / maxScore) * 100);

    return (
      <div className={`max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg ${className}`} style={style}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">¡Sesión Completada!</h2>
          <div className="mb-4">
            <div className="text-4xl font-bold text-gray-800">{percentage}%</div>
            <div className="text-gray-600">Puntuación Final</div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Progreso por Tarjeta:</h3>
            <div className="space-y-1">
              {cards.map((card, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="truncate">{card.text.substring(0, 30)}...</span>
                  <span className="ml-2">
                    {cardProgress[index]?.proficiency || 0}/{behaviour.maxProficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {behaviour.enableRetry && (
            <button
              onClick={restartSession}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Repetir Sesión
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`max-w-md mx-auto bg-white rounded-lg shadow-lg ${className}`} style={style}>
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg">
        <h1 className="text-lg font-bold">{title}</h1>
        {description && <p className="text-sm opacity-90">{description}</p>}
        <div className="mt-2 flex justify-between text-sm">
          <span>Tarjeta {currentCardIndex + 1} de {cards.length}</span>
          <span>Nivel: {progress.proficiency}/{behaviour.maxProficiency}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Card Front */}
        {!showAnswer && (
          <div className="text-center">
            {currentCard.image && (
              <img
                src={currentCard.image.url}
                alt={currentCard.image.alt}
                className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
              />
            )}

            <div className="text-lg font-medium mb-4 p-4 bg-gray-50 rounded">
              {currentCard.text}
            </div>

            {currentCard.audio && (
              <audio controls className="w-full mb-4">
                <source src={currentCard.audio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}

            <button
              onClick={() => setShowAnswer(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Mostrar Respuesta
            </button>

            {currentCard.tips && currentCard.tips.length > 0 && (
              <button
                onClick={() => setShowTips(!showTips)}
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                💡 Pistas
              </button>
            )}

            {showTips && currentCard.tips && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-yellow-800 mb-2">Pistas:</h4>
                <ul className="text-sm text-yellow-700 list-disc list-inside">
                  {currentCard.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Card Back */}
        {showAnswer && (
          <div className="text-center">
            <div className="text-lg font-medium mb-6 p-4 bg-green-50 border border-green-200 rounded">
              {currentCard.answer}
            </div>

            <p className="text-sm text-gray-600 mb-4">¿Respondiste correctamente?</p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleResponse(false)}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
              >
                ❌ Incorrecto
              </button>
              <button
                onClick={() => handleResponse(true)}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
              >
                ✅ Correcto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 p-4 rounded-b-lg flex justify-between items-center">
        <button
          onClick={goToPreviousCard}
          disabled={currentCardIndex === 0}
          className="text-gray-600 hover:text-gray-800 disabled:opacity-30 transition-colors"
        >
          ← Anterior
        </button>

        {/* Progress Indicators */}
        <div className="flex space-x-1">
          {cardOrder.map((cardIdx, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentCardIndex
                  ? 'bg-blue-500'
                  : cardProgress[cardIdx]?.proficiency >= behaviour.maxProficiency * 0.8
                  ? 'bg-green-500'
                  : cardProgress[cardIdx]?.proficiency > 0
                  ? 'bg-yellow-500'
                  : 'bg-gray-300'
              }`}
              title={`Card ${index + 1} - Proficiency: ${cardProgress[cardIdx]?.proficiency || 0}`}
            />
          ))}
        </div>

        <button
          onClick={goToNextCard}
          disabled={!showAnswer}
          className="text-gray-600 hover:text-gray-800 disabled:opacity-30 transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default DialogCards;