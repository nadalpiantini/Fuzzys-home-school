import {
  GameType,
  GameContent,
  MCQGame,
  TrueFalseGame,
  GapFillGame,
  MatchGame,
  GameContentSchema
} from './types';

export interface GeneratorOptions {
  type: GameType;
  topic: string;
  difficulty: number;
  language?: 'es' | 'en';
  count?: number;
  gradeLevel?: string;
}

export interface GameTemplate {
  type: GameType;
  promptTemplate: string;
  exampleOutput: any;
  validator: (data: any) => boolean;
}

export class GameGenerator {
  private templates: Map<GameType, GameTemplate>;

  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // MCQ Template
    this.templates.set(GameType.MCQ, {
      type: GameType.MCQ,
      promptTemplate: `
Generate a multiple choice question about {topic} for {gradeLevel} students.
Difficulty: {difficulty}/10
Language: {language}

Format the response as JSON:
{
  "type": "mcq",
  "stem": "question text",
  "choices": [
    {"id": "a", "text": "option 1", "correct": false},
    {"id": "b", "text": "option 2", "correct": true},
    {"id": "c", "text": "option 3", "correct": false},
    {"id": "d", "text": "option 4", "correct": false}
  ],
  "explanation": "Why this answer is correct"
}`,
      exampleOutput: {
        type: 'mcq',
        stem: '¿Cuál es la capital de España?',
        choices: [
          { id: 'a', text: 'Barcelona', correct: false },
          { id: 'b', text: 'Madrid', correct: true },
          { id: 'c', text: 'Valencia', correct: false },
          { id: 'd', text: 'Sevilla', correct: false }
        ],
        explanation: 'Madrid es la capital y ciudad más grande de España.'
      },
      validator: (data) => {
        try {
          GameContentSchema.parse(data);
          return true;
        } catch {
          return false;
        }
      }
    });

    // True/False Template
    this.templates.set(GameType.TrueFalse, {
      type: GameType.TrueFalse,
      promptTemplate: `
Generate a true/false statement about {topic} for {gradeLevel} students.
Difficulty: {difficulty}/10
Language: {language}

Format as JSON:
{
  "type": "true_false",
  "statement": "statement text",
  "correct": true or false,
  "explanation": "explanation"
}`,
      exampleOutput: {
        type: 'true_false',
        statement: 'El agua hierve a 100°C al nivel del mar',
        correct: true,
        explanation: 'A presión atmosférica normal (nivel del mar), el agua hierve a 100°C.'
      },
      validator: (data) => {
        try {
          GameContentSchema.parse(data);
          return true;
        } catch {
          return false;
        }
      }
    });

    // Gap Fill Template
    this.templates.set(GameType.GapFill, {
      type: GameType.GapFill,
      promptTemplate: `
Create a fill-in-the-blanks exercise about {topic} for {gradeLevel} students.
Difficulty: {difficulty}/10
Language: {language}
Use _____ to indicate blanks.

Format as JSON:
{
  "type": "gap_fill",
  "text": "text with _____ for blanks",
  "answers": [["correct answer", "alternative"]]
}`,
      exampleOutput: {
        type: 'gap_fill',
        text: 'La fotosíntesis ocurre en los _____ de las plantas verdes.',
        answers: [['cloroplastos', 'chloroplastos']]
      },
      validator: (data) => {
        try {
          GameContentSchema.parse(data);
          return true;
        } catch {
          return false;
        }
      }
    });

    // Match Template
    this.templates.set(GameType.Match, {
      type: GameType.Match,
      promptTemplate: `
Create a matching exercise about {topic} for {gradeLevel} students.
Difficulty: {difficulty}/10
Language: {language}

Format as JSON:
{
  "type": "match",
  "pairs": [
    {"left": "term1", "right": "definition1"},
    {"left": "term2", "right": "definition2"}
  ]
}`,
      exampleOutput: {
        type: 'match',
        pairs: [
          { left: 'Fotosíntesis', right: 'Proceso que convierte luz en energía' },
          { left: 'Respiración', right: 'Proceso que libera energía de glucosa' },
          { left: 'Mitosis', right: 'División celular que produce células idénticas' }
        ]
      },
      validator: (data) => {
        try {
          GameContentSchema.parse(data);
          return true;
        } catch {
          return false;
        }
      }
    });
  }

  async generateGame(options: GeneratorOptions): Promise<GameContent | null> {
    const template = this.templates.get(options.type);
    if (!template) {
      throw new Error(`No template found for game type: ${options.type}`);
    }

    // This would normally call an AI service
    // For now, return the example output
    return template.exampleOutput as GameContent;
  }

  async generateBatch(options: GeneratorOptions): Promise<GameContent[]> {
    const games: GameContent[] = [];
    const count = options.count || 5;

    for (let i = 0; i < count; i++) {
      const game = await this.generateGame({
        ...options,
        difficulty: options.difficulty + (i * 0.1) // Slightly increase difficulty
      });
      if (game) games.push(game);
    }

    return games;
  }

  validateGame(game: any): boolean {
    try {
      GameContentSchema.parse(game);
      return true;
    } catch (error) {
      console.error('Game validation failed:', error);
      return false;
    }
  }

  getTemplate(type: GameType): GameTemplate | undefined {
    return this.templates.get(type);
  }

  getAllTemplates(): GameTemplate[] {
    return Array.from(this.templates.values());
  }
}