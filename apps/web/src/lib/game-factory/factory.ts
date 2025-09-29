import {
  BaseGame,
  GameFactory,
  GameConfig,
  GameType,
  GameContent,
  GAME_TYPES,
} from './types';
import { gameTemplates, getGameTemplate } from './templates';
import { expectCompleteMap } from './helpers';

// Helper genérico para leer mapas parciales con fallback
function fromMap<T>(
  map: Partial<Record<GameType, T>>,
  type: GameType,
  fallback: T,
): T {
  return map[type] ?? fallback;
}

export class GameFactoryImpl implements GameFactory {
  createGame(type: GameType, config: GameConfig): BaseGame {
    const template = getGameTemplate(type);
    const content = this.generateGameContent(type, config);

    return {
      id: this.generateGameId(type, config.subject),
      title: this.generateTitle(type, config),
      description: this.generateDescription(type, config),
      subject: config.subject,
      grade: config.grade,
      difficulty: config.difficulty as 'beginner' | 'intermediate' | 'advanced',
      duration: this.calculateDuration(type, config.difficulty),
      players: this.calculatePlayers(type),
      type,
      content,
      tags: this.generateTags(type, config),
      rating: 4.5, // Default rating
      plays: 0, // New game
      emoji: this.getEmoji(type),
    };
  }

  getAvailableTypes(): GameType[] {
    return Object.keys(gameTemplates) as GameType[];
  }

  getTemplates() {
    return Object.values(gameTemplates);
  }

  validateGame(game: BaseGame): boolean {
    return !!(
      game.id &&
      game.title &&
      game.type &&
      game.content &&
      game.subject &&
      game.grade &&
      game.difficulty
    );
  }

  private generateGameId(type: GameType, subject: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}-${subject}-${timestamp}-${random}`;
  }

  private generateTitle(type: GameType, config: GameConfig): string {
    const template = getGameTemplate(type);
    const subjectNames: Record<string, string> = {
      math: 'Matemáticas',
      science: 'Ciencias',
      language: 'Lenguaje',
      history: 'Historia',
      geography: 'Geografía',
      art: 'Arte',
      music: 'Música',
      programming: 'Programación',
    };

    const subjectName = subjectNames[config.subject] || config.subject;
    const gradeName = this.getGradeName(config.grade);

    return `${template.name} - ${subjectName} ${gradeName}`;
  }

  private generateDescription(type: GameType, config: GameConfig): string {
    const template = getGameTemplate(type);
    const subjectNames: Record<string, string> = {
      math: 'matemáticas',
      science: 'ciencias',
      language: 'lenguaje',
      history: 'historia',
      geography: 'geografía',
      art: 'arte',
      music: 'música',
      programming: 'programación',
    };

    const subjectName = subjectNames[config.subject] || config.subject;
    return `${template.description} enfocado en ${subjectName} para ${this.getGradeName(config.grade)}.`;
  }

  private generateGameContent(type: GameType, config: GameConfig): GameContent {
    const template = getGameTemplate(type);
    const baseContent = template.template();

    // Customize content based on config
    if (config.customContent) {
      return { ...baseContent, ...config.customContent };
    }

    // Generate AI content if requested
    if (config.aiGenerated) {
      return this.generateAIContent(type, config);
    }

    return baseContent;
  }

  private generateAIContent(type: GameType, config: GameConfig): GameContent {
    // This would integrate with the brain/DeepSeek system
    // For now, return enhanced template content
    const template = getGameTemplate(type);
    const content = template.template();

    // Add AI-generated enhancements
    return {
      ...content,
      instructions: `Actividad de ${config.subject} generada por IA para ${config.grade}`,
      timeLimit: this.calculateTimeLimit(type, config.difficulty),
      attempts: this.calculateAttempts(type, config.difficulty),
    };
  }

  private calculateDuration(type: GameType, difficulty: string): string {
    const durations: Partial<Record<GameType, string>> = {
      'multiple-choice': '5-10 min',
      'true-false': '3-5 min',
      // … los que ya tengas
    };
    const baseDuration = fromMap(durations, type, '5-10 min');

    // Adjust based on difficulty
    if (difficulty === 'beginner') {
      return baseDuration.replace(/\d+/, (match) =>
        String(Math.max(1, parseInt(match) - 5)),
      );
    } else if (difficulty === 'advanced') {
      return baseDuration.replace(/\d+/, (match) =>
        String(parseInt(match) + 10),
      );
    }

    return baseDuration;
  }

  private calculatePlayers(type: GameType): string {
    const playerCounts: Partial<Record<GameType, string>> = {
      'multiple-choice': '1',
      'true-false': '1',
      'fill-blank': '1',
      'short-answer': '1',
      'drag-drop': '1',
      hotspot: '1',
      sequence: '1',
      matching: '1',
      'memory-cards': '1-2',
      'blockly-puzzle': '1',
      'blockly-maze': '1',
      'scratch-project': '1-2',
      'turtle-blocks': '1',
      'music-blocks': '1-2',
      'story-creator': '1-3',
      'art-generator': '1-2',
      'poetry-maker': '1',
      'physics-sim': '1-2',
      'chemistry-lab': '1-2',
      'math-visualizer': '1',
      'geography-explorer': '1-2',
      'ar-explorer': '1-4',
      'vr-classroom': '2-20',
      'mixed-reality': '1-4',
      'adaptive-quiz': '1',
      competition: '2-50',
      collaborative: '3-8',
      'peer-review': '2-6',
      'vocabulary-builder': '1',
      pronunciation: '1',
      conversation: '2-4',
      'grammar-practice': '1',
      'coding-challenge': '1',
      'robotics-sim': '1-3',
      'data-analysis': '1-2',
      'experiment-design': '2-4',
      'discussion-forum': '3-20',
      'peer-teaching': '2-6',
      'group-project': '3-8',
      presentation: '1-4',
      'achievement-system': '1',
      leaderboard: '2-100',
      'quest-chain': '1',
      'badge-collection': '1',
    };

    return playerCounts[type] || '1';
  }

  private generateTags(type: GameType, config: GameConfig): string[] {
    const template = getGameTemplate(type);
    const baseTags = template.features;
    const subjectTags = [config.subject];
    const difficultyTags = [config.difficulty];
    const gradeTags = [config.grade];

    return [...baseTags, ...subjectTags, ...difficultyTags, ...gradeTags];
  }

  private getEmoji(type: GameType): string {
    const EMOJIS = expectCompleteMap(GAME_TYPES, {
      'multiple-choice':'❓','true-false':'✅','fill-blank':'📝','short-answer':'✍️',
      'drag-drop':'🧩','hotspot':'📍','sequence':'🔢','matching':'🔗','memory-cards':'🃏',
      'blockly-puzzle':'🧱','flashcards':'💡','essay':'🧾','timeline':'🕰️',
      'live-quiz':'📡','mind-map':'🧠','branching-scenario':'🌿','team-challenge':'🤝',
      'code-challenge':'💻','research-methods':'🔬','critical-thinking':'🧩',
      'leadership':'⭐','badge-collection':'🏅',
    });
    return EMOJIS[type];
  }

  private getGradeName(grade: string): string {
    const gradeNames: Record<string, string> = {
      K: 'Kínder',
      '1': '1er Grado',
      '2': '2do Grado',
      '3': '3er Grado',
      '4': '4to Grado',
      '5': '5to Grado',
      '6': '6to Grado',
      '7': '7mo Grado',
      '8': '8vo Grado',
      '9': '9no Grado',
      '10': '10mo Grado',
      '11': '11mo Grado',
      '12': '12mo Grado',
    };

    return gradeNames[grade] || `Grado ${grade}`;
  }

  private calculateTimeLimit(type: GameType, difficulty: string): number {
    const baseTimeLimits = {
      'multiple-choice': 30,
      'true-false': 15,
      'fill-blank': 45,
      'short-answer': 60,
      'drag-drop': 120,
      hotspot: 90,
      sequence: 120,
      matching: 90,
      'memory-cards': 60,
      'blockly-puzzle': 300,
      'blockly-maze': 600,
      'scratch-project': 1800,
      'turtle-blocks': 600,
      'music-blocks': 900,
      'story-creator': 1200,
      'art-generator': 600,
      'poetry-maker': 300,
      'physics-sim': 600,
      'chemistry-lab': 900,
      'math-visualizer': 300,
      'geography-explorer': 600,
      'ar-explorer': 1200,
      'vr-classroom': 1800,
      'mixed-reality': 1200,
      'adaptive-quiz': 300,
      competition: 180,
      collaborative: 1200,
      'peer-review': 600,
      'vocabulary-builder': 300,
      pronunciation: 120,
      conversation: 600,
      'grammar-practice': 300,
      'coding-challenge': 900,
      'robotics-sim': 1200,
      'data-analysis': 900,
      'experiment-design': 1800,
      'discussion-forum': 600,
      'peer-teaching': 1200,
      'group-project': 3600,
      presentation: 600,
      'achievement-system': 0,
      leaderboard: 0,
      'quest-chain': 0,
      'badge-collection': 0,
    };

    const baseTime = baseTimeLimits[type] ?? 300;

    // Adjust based on difficulty
    if (difficulty === 'beginner') {
      return Math.floor(baseTime * 1.5);
    } else if (difficulty === 'advanced') {
      return Math.floor(baseTime * 0.7);
    }

    return baseTime;
  }

  private calculateAttempts(type: GameType, difficulty: string): number {
    const baseAttempts = {
      'multiple-choice': 3,
      'true-false': 2,
      'fill-blank': 3,
      'short-answer': 2,
      'drag-drop': 5,
      hotspot: 3,
      sequence: 5,
      matching: 3,
      'memory-cards': 10,
      'blockly-puzzle': 5,
      'blockly-maze': 3,
      'scratch-project': 1,
      'turtle-blocks': 5,
      'music-blocks': 3,
      'story-creator': 1,
      'art-generator': 3,
      'poetry-maker': 2,
      'physics-sim': 5,
      'chemistry-lab': 3,
      'math-visualizer': 3,
      'geography-explorer': 5,
      'ar-explorer': 3,
      'vr-classroom': 1,
      'mixed-reality': 3,
      'adaptive-quiz': 2,
      competition: 1,
      collaborative: 1,
      'peer-review': 1,
      'vocabulary-builder': 5,
      pronunciation: 3,
      conversation: 1,
      'grammar-practice': 3,
      'coding-challenge': 3,
      'robotics-sim': 3,
      'data-analysis': 2,
      'experiment-design': 1,
      'discussion-forum': 1,
      'peer-teaching': 1,
      'group-project': 1,
      presentation: 1,
      'achievement-system': 0,
      leaderboard: 0,
      'quest-chain': 0,
      'badge-collection': 0,
    };

    const attempts = baseAttempts[type] ?? 3;

    // Adjust based on difficulty
    if (difficulty === 'beginner') {
      return attempts + 2;
    } else if (difficulty === 'advanced') {
      return Math.max(1, attempts - 1);
    }

    return attempts;
  }
}

// Export singleton instance
export const gameFactory = new GameFactoryImpl();
