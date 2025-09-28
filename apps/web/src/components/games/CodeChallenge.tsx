'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Code, Play, Check, X, Copy, Terminal } from 'lucide-react';

interface CodeChallengeGame {
  type: 'code_challenge';
  title: string;
  description: string;
  language: 'javascript' | 'python' | 'html' | 'css';
  starterCode?: string;
  testCases?: {
    input: string;
    expectedOutput: string;
    description?: string;
  }[];
  solution?: string;
  hints?: string[];
}

interface CodeChallengeProps {
  game: CodeChallengeGame;
  onAnswer: (code: string, testResults?: boolean[]) => void;
  onNext?: () => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    explanation?: string;
    testResults?: boolean[];
  };
}

export const CodeChallenge: React.FC<CodeChallengeProps> = ({
  game,
  onAnswer,
  onNext,
  showFeedback = false,
  feedback,
}) => {
  const [code, setCode] = useState(game.starterCode || '');
  const [output, setOutput] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Ejecutando código...\n');

    // Simulate code execution
    setTimeout(() => {
      try {
        // Simple evaluation for demo (in production, use a safe sandbox)
        if (game.language === 'javascript') {
          // Create a safe function from the code
          const func = new Function('console', code);

          // Capture console output
          let capturedOutput = '';
          const mockConsole = {
            log: (...args: any[]) => {
              capturedOutput += args.join(' ') + '\n';
            },
          };

          func(mockConsole);
          setOutput(capturedOutput || 'Código ejecutado sin salida');
        } else {
          setOutput('// Simulación de salida para ' + game.language);
        }
      } catch (error: any) {
        setOutput('Error: ' + error.message);
      }
      setIsRunning(false);
    }, 1000);
  };

  const handleSubmit = () => {
    // Run tests if available
    if (game.testCases) {
      const results = game.testCases.map(() => Math.random() > 0.3); // Simulated test results
      onAnswer(code, results);
    } else {
      onAnswer(code);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const handleShowHint = () => {
    if (game.hints && currentHintIndex < game.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const getLanguageColor = () => {
    switch (game.language) {
      case 'javascript':
        return 'bg-yellow-100 text-yellow-800';
      case 'python':
        return 'bg-blue-100 text-blue-800';
      case 'html':
        return 'bg-orange-100 text-orange-800';
      case 'css':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSyntaxHighlight = (text: string) => {
    // Simple syntax highlighting for demo
    const keywords = [
      'function',
      'const',
      'let',
      'var',
      'if',
      'else',
      'for',
      'while',
      'return',
      'class',
      'def',
      'import',
    ];
    let highlighted = text;

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(
        regex,
        `<span class="text-blue-600 font-bold">${keyword}</span>`,
      );
    });

    // Highlight strings
    highlighted = highlighted.replace(
      /(["'])(?:(?=(\\?))\2.)*?\1/g,
      '<span class="text-green-600">$&</span>',
    );

    // Highlight comments
    highlighted = highlighted.replace(
      /(\/\/.*$)/gm,
      '<span class="text-gray-500">$1</span>',
    );

    return highlighted;
  };

  return (
    <Card className="p-6 max-w-6xl mx-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Code className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">{game.title}</h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getLanguageColor()}`}
          >
            {game.language.toUpperCase()}
          </span>
        </div>

        {/* Description */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-gray-800">{game.description}</p>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Code Editor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-semibold">Tu Código:</label>
              <div className="flex gap-2">
                <Button onClick={handleCopyCode} variant="outline" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleRunCode}
                  variant="outline"
                  size="sm"
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Ejecutar
                </Button>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Escribe tu código aquí..."
                disabled={showFeedback}
                spellCheck={false}
              />
              <div className="absolute top-2 right-2 text-xs text-gray-500">
                Líneas: {code.split('\n').length}
              </div>
            </div>
          </div>

          {/* Output & Test Cases */}
          <div className="space-y-4">
            {/* Output Console */}
            <div className="space-y-2">
              <label className="font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Salida:
              </label>
              <div className="h-32 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg overflow-auto">
                <pre>{output || '// La salida aparecerá aquí'}</pre>
              </div>
            </div>

            {/* Test Cases */}
            {game.testCases && (
              <div className="space-y-2">
                <label className="font-semibold">Casos de Prueba:</label>
                <div className="space-y-2">
                  {game.testCases.map((testCase, index) => {
                    const isCorrect = feedback?.testResults?.[index];
                    return (
                      <Card
                        key={index}
                        className={`p-3 text-sm ${
                          showFeedback
                            ? isCorrect
                              ? 'bg-green-50 border-green-300'
                              : 'bg-red-50 border-red-300'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">Test {index + 1}</p>
                            {testCase.description && (
                              <p className="text-gray-600 text-xs mt-1">
                                {testCase.description}
                              </p>
                            )}
                            <div className="mt-2 space-y-1">
                              <p className="font-mono text-xs">
                                <span className="text-gray-500">Entrada:</span>{' '}
                                {testCase.input}
                              </p>
                              <p className="font-mono text-xs">
                                <span className="text-gray-500">Esperado:</span>{' '}
                                {testCase.expectedOutput}
                              </p>
                            </div>
                          </div>
                          {showFeedback && (
                            <div className="ml-2">
                              {isCorrect ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <X className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hints Section */}
        {game.hints && !showFeedback && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-semibold">Pistas:</label>
              <Button
                onClick={() => setShowHints(!showHints)}
                variant="outline"
                size="sm"
              >
                {showHints ? 'Ocultar' : 'Mostrar'} Pistas
              </Button>
            </div>
            {showHints && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="space-y-2">
                  {game.hints
                    .slice(0, currentHintIndex + 1)
                    .map((hint, index) => (
                      <p key={index} className="text-sm text-yellow-800">
                        <span className="font-medium">{index + 1}.</span> {hint}
                      </p>
                    ))}
                  {currentHintIndex < game.hints.length - 1 && (
                    <Button
                      onClick={handleShowHint}
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
                {feedback.correct
                  ? '¡Excelente! Solución correcta.'
                  : 'Hay algunos errores en tu código.'}
              </p>
            </div>
            {feedback.explanation && (
              <p className="mt-2 text-sm">{feedback.explanation}</p>
            )}

            {/* Show solution if incorrect */}
            {!feedback.correct && game.solution && (
              <Card className="mt-4 p-4 bg-white">
                <h5 className="font-medium mb-2">Solución de ejemplo:</h5>
                <pre className="text-sm font-mono bg-gray-100 p-3 rounded overflow-x-auto">
                  <code>{game.solution}</code>
                </pre>
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
              disabled={!code.trim()}
            >
              Enviar Solución
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
