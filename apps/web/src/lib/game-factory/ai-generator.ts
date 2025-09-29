import { GameType, GameConfig, BaseGame } from './types';
import { gameFactory } from './factory';

export interface AIGameGenerationRequest {
  type: GameType;
  subject: string;
  grade: string;
  difficulty: string;
  theme?: string;
  customPrompt?: string;
  learningObjectives?: string[];
  prerequisites?: string[];
  targetAudience?: string;
}

export interface AIGameGenerationResponse {
  success: boolean;
  game?: BaseGame;
  error?: string;
  suggestions?: string[];
  alternatives?: GameType[];
}

export class AIGameGenerator {
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/brain/generate') {
    this.apiEndpoint = apiEndpoint;
  }

  async generateGame(
    request: AIGameGenerationRequest,
  ): Promise<AIGameGenerationResponse> {
    try {
      // Create base game using factory
      const baseGame = gameFactory.createGame(request.type, {
        subject: request.subject,
        grade: request.grade,
        difficulty: request.difficulty,
        theme: request.theme,
        aiGenerated: true,
      });

      // Enhance with AI-generated content
      const enhancedGame = await this.enhanceWithAI(baseGame, request);

      return {
        success: true,
        game: enhancedGame,
        suggestions: this.generateSuggestions(request),
        alternatives: this.getAlternativeTypes(request.type),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        suggestions: this.generateSuggestions(request),
        alternatives: this.getAlternativeTypes(request.type),
      };
    }
  }

  private async enhanceWithAI(
    baseGame: BaseGame,
    request: AIGameGenerationRequest,
  ): Promise<BaseGame> {
    try {
      // Call the brain API to generate enhanced content
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'game-generation',
          gameType: request.type,
          subject: request.subject,
          grade: request.grade,
          difficulty: request.difficulty,
          theme: request.theme,
          customPrompt: request.customPrompt,
          learningObjectives: request.learningObjectives,
          prerequisites: request.prerequisites,
          targetAudience: request.targetAudience,
          baseContent: baseGame.content,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const aiResponse = await response.json();

      // Enhance the game with AI-generated content
      return {
        ...baseGame,
        title: aiResponse.title || baseGame.title,
        description: aiResponse.description || baseGame.description,
        content: {
          ...baseGame.content,
          ...aiResponse.content,
          instructions: aiResponse.instructions,
          learningObjectives: request.learningObjectives,
          prerequisites: request.prerequisites,
        },
        tags: [...baseGame.tags, ...(aiResponse.tags || [])],
      };
    } catch (error) {
      console.warn('AI enhancement failed, using base game:', error);
      return baseGame;
    }
  }

  private generateSuggestions(request: AIGameGenerationRequest): string[] {
    const suggestions: string[] = [];

    // Subject-specific suggestions
    switch (request.subject) {
      case 'math':
        suggestions.push(
          'Considera usar visualizaciones matemáticas para conceptos abstractos',
        );
        suggestions.push(
          'Incluye ejercicios paso a paso para mejor comprensión',
        );
        break;
      case 'science':
        suggestions.push('Agrega simulaciones interactivas para experimentos');
        suggestions.push('Incluye elementos de observación y análisis');
        break;
      case 'language':
        suggestions.push('Incorpora elementos de pronunciación y audio');
        suggestions.push('Usa contextos culturales relevantes');
        break;
      case 'history':
        suggestions.push('Incluye líneas de tiempo interactivas');
        suggestions.push('Agrega elementos de investigación histórica');
        break;
    }

    // Grade-specific suggestions
    if (
      request.grade === 'K' ||
      request.grade === '1' ||
      request.grade === '2'
    ) {
      suggestions.push('Usa elementos visuales y táctiles para niños pequeños');
      suggestions.push('Incluye retroalimentación inmediata y positiva');
    } else if (
      request.grade === '9' ||
      request.grade === '10' ||
      request.grade === '11' ||
      request.grade === '12'
    ) {
      suggestions.push('Incorpora elementos de pensamiento crítico');
      suggestions.push('Incluye oportunidades de investigación independiente');
    }

    // Difficulty-specific suggestions
    if (request.difficulty === 'beginner') {
      suggestions.push('Proporciona múltiples intentos y pistas');
      suggestions.push('Incluye tutoriales paso a paso');
    } else if (request.difficulty === 'advanced') {
      suggestions.push('Incorpora elementos de colaboración y debate');
      suggestions.push('Incluye proyectos de investigación');
    }

    return suggestions;
  }

  private getAlternativeTypes(currentType: GameType): GameType[] {
    const alternatives: Partial<Record<GameType, GameType[]>> = {
      'multiple-choice': ['true-false', 'short-answer', 'adaptive-quiz'],
      'true-false': ['multiple-choice', 'short-answer', 'competition'],
      'fill-blank': ['short-answer', 'matching', 'vocabulary-builder'],
      'short-answer': ['fill-blank', 'essay', 'discussion-forum'],
      'drag-drop': ['matching', 'sequence', 'hotspot'],
      hotspot: ['drag-drop', 'matching', 'ar-explorer'],
      sequence: ['matching', 'drag-drop', 'timeline'],
      matching: ['drag-drop', 'sequence', 'vocabulary-builder'],
      'memory-cards': ['matching', 'vocabulary-builder', 'flashcards'],
      'blockly-puzzle': ['blockly-maze', 'scratch-project', 'coding-challenge'],
      'blockly-maze': ['blockly-puzzle', 'scratch-project', 'turtle-blocks'],
      'scratch-project': ['blockly-puzzle', 'story-creator', 'art-generator'],
      'turtle-blocks': ['blockly-puzzle', 'art-generator', 'math-visualizer'],
      'music-blocks': ['story-creator', 'art-generator', 'creative-writing'],
      'story-creator': ['scratch-project', 'art-generator', 'poetry-maker'],
      'art-generator': ['story-creator', 'music-blocks', 'creative-writing'],
      'poetry-maker': ['story-creator', 'creative-writing', 'language-arts'],
      'physics-sim': ['chemistry-lab', 'math-visualizer', 'experiment-design'],
      'chemistry-lab': ['physics-sim', 'experiment-design', 'data-analysis'],
      'math-visualizer': ['physics-sim', 'data-analysis', 'coding-challenge'],
      'geography-explorer': ['ar-explorer', 'vr-classroom', 'field-trip'],
      'ar-explorer': ['geography-explorer', 'vr-classroom', 'mixed-reality'],
      'vr-classroom': ['ar-explorer', 'mixed-reality', 'collaborative'],
      'mixed-reality': ['ar-explorer', 'vr-classroom', 'immersive-learning'],
      'adaptive-quiz': [
        'multiple-choice',
        'competition',
        'personalized-learning',
      ],
      competition: ['adaptive-quiz', 'collaborative', 'leaderboard'],
      collaborative: ['discussion-forum', 'peer-teaching', 'group-project'],
      'peer-review': ['collaborative', 'discussion-forum', 'peer-teaching'],
      'vocabulary-builder': ['matching', 'memory-cards', 'language-learning'],
      pronunciation: [
        'vocabulary-builder',
        'conversation',
        'language-learning',
      ],
      conversation: ['pronunciation', 'discussion-forum', 'language-exchange'],
      'grammar-practice': [
        'vocabulary-builder',
        'language-arts',
        'writing-practice',
      ],
      'coding-challenge': ['blockly-puzzle', 'robotics-sim', 'programming'],
      'robotics-sim': ['coding-challenge', 'physics-sim', 'engineering'],
      'data-analysis': ['math-visualizer', 'experiment-design', 'statistics'],
      'experiment-design': [
        'chemistry-lab',
        'physics-sim',
        'scientific-method',
      ],
      'discussion-forum': ['collaborative', 'peer-review', 'debate'],
      'peer-teaching': ['collaborative', 'presentation', 'knowledge-sharing'],
      'group-project': ['collaborative', 'presentation', 'teamwork'],
      presentation: ['peer-teaching', 'group-project', 'public-speaking'],
      'achievement-system': ['leaderboard', 'quest-chain', 'badge-collection'],
      leaderboard: ['competition', 'achievement-system', 'ranking'],
      'quest-chain': [
        'achievement-system',
        'adventure',
        'progressive-learning',
      ],
      'badge-collection': ['achievement-system', 'gamification', 'recognition'],
    };

    return alternatives[currentType] || [];
  }

  async generateBulkGames(
    requests: AIGameGenerationRequest[],
  ): Promise<AIGameGenerationResponse[]> {
    const results = await Promise.allSettled(
      requests.map((request) => this.generateGame(request)),
    );

    return results.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : { success: false, error: result.reason },
    );
  }

  async generateGameVariations(
    baseRequest: AIGameGenerationRequest,
    count: number = 3,
  ): Promise<BaseGame[]> {
    const variations: BaseGame[] = [];

    for (let i = 0; i < count; i++) {
      const variationRequest = {
        ...baseRequest,
        theme: `${baseRequest.theme || 'default'}-variation-${i + 1}`,
        customPrompt: `Create a variation ${i + 1} of this game type with different content but same learning objectives`,
      };

      const result = await this.generateGame(variationRequest);
      if (result.success && result.game) {
        variations.push(result.game);
      }
    }

    return variations;
  }

  async analyzeGameEffectiveness(
    gameId: string,
    metrics: any,
  ): Promise<{
    effectiveness: number;
    recommendations: string[];
    improvements: string[];
  }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          metrics,
          type: 'effectiveness-analysis',
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Game analysis failed:', error);
      return {
        effectiveness: 0.5,
        recommendations: [
          'Improve user engagement',
          'Add more interactive elements',
        ],
        improvements: [
          'Consider difficulty adjustment',
          'Add more visual elements',
        ],
      };
    }
  }
}

// Export singleton instance
export const aiGameGenerator = new AIGameGenerator();
