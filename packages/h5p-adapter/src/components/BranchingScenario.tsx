'use client';

import React, { useState, useCallback } from 'react';
import { BranchingScenarioSchema, H5PEvent } from '../types';
import { z } from 'zod';

interface BranchingScenarioProps {
  content: z.infer<typeof BranchingScenarioSchema>;
  onEvent?: (event: H5PEvent) => void;
  className?: string;
}

export const BranchingScenario: React.FC<BranchingScenarioProps> = ({
  content,
  onEvent,
  className = ''
}) => {
  const [currentScreen, setCurrentScreen] = useState<string>(content.params.startingScreen);
  const [visitedScreens, setVisitedScreens] = useState<Set<string>>(new Set([content.params.startingScreen]));
  const [choiceHistory, setChoiceHistory] = useState<Array<{
    screenId: string;
    choiceText: string;
    nextScreen: string;
  }>>([]);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const { params } = content;
  const currentScreenData = params.screens.find(s => s.id === currentScreen);

  const handleChoice = useCallback((choice: {
    text: string;
    nextScreen: string;
    feedback?: string;
  }) => {
    // Add to choice history
    setChoiceHistory(prev => [...prev, {
      screenId: currentScreen,
      choiceText: choice.text,
      nextScreen: choice.nextScreen
    }]);

    // Show feedback if available
    if (choice.feedback) {
      setShowFeedback(choice.feedback);
      setTimeout(() => {
        setShowFeedback(null);
        navigateToScreen(choice.nextScreen);
      }, 2000);
    } else {
      navigateToScreen(choice.nextScreen);
    }

    // Emit interaction event
    onEvent?.({
      type: 'interaction',
      data: {
        response: choice.text,
        answered: true
      }
    });
  }, [currentScreen, onEvent]);

  const navigateToScreen = useCallback((screenId: string) => {
    setCurrentScreen(screenId);
    setVisitedScreens(prev => new Set([...prev, screenId]));

    // Check if this is an ending screen (no choices)
    const screen = params.screens.find(s => s.id === screenId);
    if (!screen?.choices || screen.choices.length === 0) {
      // Scenario completed
      onEvent?.({
        type: 'completed',
        data: {
          score: 100,
          maxScore: 100,
          completion: 100,
          answered: true,
          correct: true
        }
      });
    } else {
      // Emit progress
      onEvent?.({
        type: 'progress',
        data: {
          completion: (visitedScreens.size / params.screens.length) * 100
        }
      });
    }
  }, [params.screens, visitedScreens.size, onEvent]);

  const resetScenario = useCallback(() => {
    setCurrentScreen(params.startingScreen);
    setVisitedScreens(new Set([params.startingScreen]));
    setChoiceHistory([]);
    setShowFeedback(null);
  }, [params.startingScreen]);

  const isEndingScreen = !currentScreenData?.choices || currentScreenData.choices.length === 0;

  return (
    <div className={`h5p-branching-scenario ${className}`}>
      {/* Header */}
      <div className="scenario-header mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{params.title || 'Escenario Interactivo'}</h2>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Pantalla {visitedScreens.size} de {params.screens.length}
          </span>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs">
              Decisiones: {choiceHistory.length}
            </span>
            <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
              {Math.round((visitedScreens.size / params.screens.length) * 100)}% explorado
            </span>
          </div>
        </div>
      </div>

      {/* Current Screen Content */}
      {currentScreenData && (
        <div className="scenario-screen bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="screen-content prose prose-lg max-w-none mb-6">
            <div
              dangerouslySetInnerHTML={{ __html: currentScreenData.content }}
              className="text-gray-800 leading-relaxed"
            />
          </div>

          {/* Choices */}
          {currentScreenData.choices && currentScreenData.choices.length > 0 && (
            <div className="choices space-y-3">
              <h4 className="text-md font-semibold text-gray-700 mb-4">
                ¿Qué decides hacer?
              </h4>
              {currentScreenData.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(choice)}
                  disabled={!!showFeedback}
                  className="choice-button w-full text-left p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-gray-800">{choice.text}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Ending Screen Message */}
          {isEndingScreen && (
            <div className="ending-message bg-green-100 border border-green-400 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600 text-xl">🎯</span>
                <span className="font-semibold text-green-800">
                  ¡Has llegado al final de este escenario!
                </span>
              </div>
              <p className="text-green-700 text-sm">
                Revisaste {visitedScreens.size} pantallas y tomaste {choiceHistory.length} decisiones.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="text-3xl mb-3">💭</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Reflexión
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {showFeedback}
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
                <div className="bg-blue-600 h-1 rounded-full w-full animate-pulse" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Continuando automáticamente...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="actions flex gap-3 mb-4">
        <button
          onClick={resetScenario}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reiniciar Escenario
        </button>

        {choiceHistory.length > 0 && (
          <button
            onClick={() => {
              const lastChoice = choiceHistory[choiceHistory.length - 1];
              if (lastChoice) {
                setCurrentScreen(lastChoice.screenId);
                setChoiceHistory(prev => prev.slice(0, -1));
              }
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Volver Atrás
          </button>
        )}
      </div>

      {/* Choice History */}
      {choiceHistory.length > 0 && (
        <div className="choice-history bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            📋 Historial de Decisiones:
          </h4>
          <div className="space-y-2">
            {choiceHistory.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-gray-600 truncate">
                  {entry.choiceText}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};