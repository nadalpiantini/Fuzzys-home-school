'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calculator, Check, X, HelpCircle } from 'lucide-react';

interface MathSolverGame {
  type: 'math_solver';
  equation: string;
  steps?: string[];
  answer: number | string;
  showSteps?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface MathSolverProps {
  game: MathSolverGame;
  onAnswer: (answer: string, steps?: string[]) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    correctAnswer?: string;
  };
}

export const MathSolver: React.FC<MathSolverProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [userSteps, setUserSteps] = useState<string[]>(['']);
  const [showHints, setShowHints] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleAddStep = () => {
    setUserSteps([...userSteps, '']);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...userSteps];
    newSteps[index] = value;
    setUserSteps(newSteps);
  };

  const handleSubmit = () => {
    onAnswer(
      userAnswer,
      userSteps.filter((step) => step.trim() !== ''),
    );
  };

  const handleShowNextHint = () => {
    if (game.steps && currentStep < game.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getDifficultyColor = () => {
    switch (game.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Resuelve la Ecuación
            </h3>
          </div>
          {game.difficulty && (
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor()}`}
            >
              {game.difficulty === 'easy'
                ? 'Fácil'
                : game.difficulty === 'medium'
                  ? 'Medio'
                  : 'Difícil'}
            </span>
          )}
        </div>

        {/* Equation Display */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="text-center">
            <p className="text-3xl font-bold font-mono text-gray-800">
              {game.equation}
            </p>
          </div>
        </Card>

        {/* Steps Section */}
        {game.showSteps !== false && !showFeedback && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Pasos de Resolución</h4>
              <div className="flex gap-2">
                {game.steps && (
                  <Button
                    onClick={() => setShowHints(!showHints)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    {showHints ? 'Ocultar' : 'Mostrar'} Pistas
                  </Button>
                )}
                <Button onClick={handleAddStep} variant="outline" size="sm">
                  + Agregar Paso
                </Button>
              </div>
            </div>

            {/* User Steps */}
            <div className="space-y-2">
              {userSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-sm font-medium text-gray-500 mt-2">
                    Paso {index + 1}:
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe tu paso aquí..."
                    disabled={showFeedback}
                  />
                </div>
              ))}
            </div>

            {/* Hints */}
            {showHints && game.steps && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="space-y-2">
                  <h5 className="font-medium text-yellow-800">Pistas:</h5>
                  {game.steps.slice(0, currentStep + 1).map((hint, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm font-medium text-yellow-700">
                        {index + 1}.
                      </span>
                      <p className="text-sm text-yellow-700">{hint}</p>
                    </div>
                  ))}
                  {currentStep < game.steps.length - 1 && (
                    <Button
                      onClick={handleShowNextHint}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Siguiente Pista
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Answer Input */}
        <div className="space-y-2">
          <label className="font-semibold">Respuesta Final:</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="flex-1 p-3 border-2 rounded-lg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu respuesta..."
              disabled={showFeedback}
            />
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && feedback && (
          <div
            className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
          >
            <div className="flex items-center gap-2">
              {feedback.correct ? (
                <Check className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
              <p className="font-medium">
                {feedback.correct ? '¡Correcto!' : 'Incorrecto'}
              </p>
            </div>
            {!feedback.correct && feedback.correctAnswer && (
              <p className="mt-2">
                Respuesta correcta:{' '}
                <span className="font-mono font-bold">
                  {feedback.correctAnswer}
                </span>
              </p>
            )}
            {feedback.explanation && (
              <p className="mt-2 text-sm">{feedback.explanation}</p>
            )}

            {/* Show solution steps if available */}
            {game.steps && !feedback.correct && (
              <Card className="mt-4 p-3 bg-white">
                <h5 className="font-medium mb-2">Solución paso a paso:</h5>
                <div className="space-y-1">
                  {game.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        {index + 1}.
                      </span>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm font-medium">
                      Respuesta:{' '}
                      <span className="font-mono">{game.answer}</span>
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              className="ml-auto"
              disabled={!userAnswer.trim()}
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
