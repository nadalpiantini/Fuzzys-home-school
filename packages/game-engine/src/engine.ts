import {
  GameType,
  BaseGame,
  GameSession,
  GameAttempt,
  GameContent,
  MCQGame,
  TrueFalseGame,
  DragDropGame,
  HotspotGame,
  GapFillGame,
  MatchGame
} from './types';

export interface GameEngine {
  validateAnswer(game: GameContent, answer: any): ValidationResult;
  calculateScore(game: GameContent, answer: any): number;
  generateFeedback(game: GameContent, answer: any, correct: boolean): string;
  getHint(game: GameContent, attemptNumber: number): string | null;
  adaptDifficulty(currentDifficulty: number, performance: number): number;
}

export interface ValidationResult {
  correct: boolean;
  score: number;
  maxScore: number;
  feedback?: string;
  correctAnswer?: any;
}

export class UniversalGameEngine implements GameEngine {
  validateAnswer(game: GameContent, answer: any): ValidationResult {
    switch (game.type) {
      case GameType.MCQ:
        return this.validateMCQ(game as MCQGame, answer);
      case GameType.TrueFalse:
        return this.validateTrueFalse(game as TrueFalseGame, answer);
      case GameType.DragDrop:
        return this.validateDragDrop(game as DragDropGame, answer);
      case GameType.Hotspot:
        return this.validateHotspot(game as HotspotGame, answer);
      case GameType.GapFill:
        return this.validateGapFill(game as GapFillGame, answer);
      case GameType.Match:
        return this.validateMatch(game as MatchGame, answer);
      default:
        throw new Error(`Unsupported game type: ${game.type}`);
    }
  }

  private validateMCQ(game: MCQGame, answer: string | string[]): ValidationResult {
    const correctChoices = game.choices.filter(c => c.correct).map(c => c.id);
    const isMultiple = game.multipleAnswers || correctChoices.length > 1;

    let correct = false;
    let score = 0;
    const maxScore = correctChoices.length;

    if (isMultiple && Array.isArray(answer)) {
      const correctAnswers = answer.filter(a => correctChoices.includes(a));
      score = correctAnswers.length;
      correct = correctAnswers.length === correctChoices.length &&
                answer.length === correctChoices.length;
    } else if (!isMultiple && typeof answer === 'string') {
      correct = correctChoices.includes(answer);
      score = correct ? 1 : 0;
    }

    return {
      correct,
      score,
      maxScore,
      feedback: game.explanation,
      correctAnswer: correctChoices
    };
  }

  private validateTrueFalse(game: TrueFalseGame, answer: boolean): ValidationResult {
    const correct = answer === game.correct;
    return {
      correct,
      score: correct ? 1 : 0,
      maxScore: 1,
      feedback: game.explanation,
      correctAnswer: game.correct
    };
  }

  private validateDragDrop(game: DragDropGame, answer: Record<string, string[]>): ValidationResult {
    let correctPlacements = 0;
    const totalItems = game.items.length;

    game.items.forEach(item => {
      const placedZone = Object.keys(answer).find(zone =>
        answer[zone].includes(item.id)
      );
      if (placedZone === item.targetZone) {
        correctPlacements++;
      }
    });

    const score = correctPlacements;
    const correct = correctPlacements === totalItems;

    return {
      correct,
      score,
      maxScore: totalItems,
      feedback: correct ? 'Perfect!' : `${correctPlacements}/${totalItems} items correctly placed`
    };
  }

  private validateHotspot(game: HotspotGame, answer: { x: number, y: number }[]): ValidationResult {
    const correctTargets = game.targets.filter(t => t.correct);
    let hits = 0;

    correctTargets.forEach(target => {
      const hit = answer.some(click => {
        const distance = Math.sqrt(
          Math.pow(click.x - target.x, 2) +
          Math.pow(click.y - target.y, 2)
        );
        return distance <= target.radius;
      });
      if (hit) hits++;
    });

    const score = hits;
    const maxScore = correctTargets.length;
    const correct = hits === correctTargets.length && answer.length === correctTargets.length;

    return {
      correct,
      score,
      maxScore,
      feedback: `Found ${hits}/${correctTargets.length} correct areas`
    };
  }

  private validateGapFill(game: GapFillGame, answer: string[]): ValidationResult {
    let correctGaps = 0;
    const totalGaps = game.answers.length;

    game.answers.forEach((acceptableAnswers, index) => {
      const userAnswer = answer[index] || '';
      const isCorrect = game.caseSensitive
        ? acceptableAnswers.includes(userAnswer)
        : acceptableAnswers.some(a => a.toLowerCase() === userAnswer.toLowerCase());

      if (isCorrect) correctGaps++;
    });

    const score = correctGaps;
    const correct = correctGaps === totalGaps;

    return {
      correct,
      score,
      maxScore: totalGaps,
      feedback: `${correctGaps}/${totalGaps} gaps filled correctly`,
      correctAnswer: game.answers
    };
  }

  private validateMatch(game: MatchGame, answer: Record<string, string>): ValidationResult {
    let correctMatches = 0;
    const totalPairs = game.pairs.length;

    game.pairs.forEach(pair => {
      if (answer[pair.left] === pair.right) {
        correctMatches++;
      }
    });

    const score = correctMatches;
    const correct = correctMatches === totalPairs;

    return {
      correct,
      score,
      maxScore: totalPairs,
      feedback: `${correctMatches}/${totalPairs} pairs matched correctly`
    };
  }

  calculateScore(game: GameContent, answer: any): number {
    const result = this.validateAnswer(game, answer);
    return (result.score / result.maxScore) * 100;
  }

  generateFeedback(game: GameContent, answer: any, correct: boolean): string {
    const result = this.validateAnswer(game, answer);

    if (correct) {
      return this.getPositiveFeedback();
    } else {
      return `${this.getEncouragingFeedback()} ${result.feedback || ''}`;
    }
  }

  getHint(game: GameContent, attemptNumber: number): string | null {
    if (attemptNumber < 2) return null;

    switch (game.type) {
      case GameType.MCQ:
        return "Look at the key words in the question carefully.";
      case GameType.TrueFalse:
        return "Consider if there are any absolute terms that might make it false.";
      case GameType.GapFill:
        return "Think about the context around the blank.";
      case GameType.DragDrop:
        return "Try grouping similar items first.";
      default:
        return "Take your time and read the instructions again.";
    }
  }

  adaptDifficulty(currentDifficulty: number, performance: number): number {
    // Performance is 0-1 (percentage correct)
    if (performance > 0.8) {
      // Increase difficulty
      return Math.min(1, currentDifficulty + 0.1);
    } else if (performance < 0.4) {
      // Decrease difficulty
      return Math.max(0, currentDifficulty - 0.1);
    }
    return currentDifficulty;
  }

  private getPositiveFeedback(): string {
    const messages = [
      "¡Excelente trabajo!",
      "¡Correcto! Sigue así.",
      "¡Muy bien!",
      "¡Perfecto!",
      "¡Lo lograste!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getEncouragingFeedback(): string {
    const messages = [
      "No te preocupes, intentemos de nuevo.",
      "Casi lo tienes.",
      "Buen intento, veamos la respuesta correcta.",
      "Aprender es un proceso, sigue adelante."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}