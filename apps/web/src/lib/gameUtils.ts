// Game utility functions and constants

export interface GameQuestion {
  id: string;
  question: string;
  answer: string | string[];
  options?: string[];
  hint?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
  imageUrl?: string;
}

export interface GameLevel {
  id: string;
  name: string;
  description: string;
  questions: GameQuestion[];
  timeLimit?: number;
  requiredScore?: number;
}

export interface GameProgress {
  userId: string;
  gameId: string;
  level: number;
  score: number;
  highScore: number;
  completedLevels: string[];
  achievements: string[];
  lastPlayed: Date;
}

// Shuffle array utility
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Calculate score based on time and difficulty
export function calculateScore(
  basePoints: number,
  timeBonus: number,
  difficulty: 'easy' | 'medium' | 'hard',
  streakMultiplier: number = 1,
): number {
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  };

  return Math.floor(
    basePoints * difficultyMultiplier[difficulty] * streakMultiplier + timeBonus
  );
}

// Format score with thousand separators
export function formatScore(score: number): string {
  return score.toLocaleString('es-ES');
}

// Check if answer is correct (handles various formats)
export function checkAnswer(
  userAnswer: string,
  correctAnswer: string | string[],
  caseSensitive: boolean = false,
): boolean {
  const normalizeAnswer = (answer: string) => {
    let normalized = answer.trim();
    if (!caseSensitive) {
      normalized = normalized.toLowerCase();
    }
    // Remove accents for Spanish
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized;
  };

  const normalizedUserAnswer = normalizeAnswer(userAnswer);

  if (Array.isArray(correctAnswer)) {
    return correctAnswer.some(
      (answer) => normalizeAnswer(answer) === normalizedUserAnswer
    );
  }

  return normalizeAnswer(correctAnswer) === normalizedUserAnswer;
}

// Generate math problem based on grade level
export function generateMathProblem(gradeLevel: number): GameQuestion {
  const id = generateId();
  let question = '';
  let answer = '';
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';

  if (gradeLevel <= 2) {
    // K-2: Simple addition and subtraction
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';

    if (operation === '+') {
      question = `${a} + ${b} = ?`;
      answer = (a + b).toString();
    } else {
      const max = Math.max(a, b);
      const min = Math.min(a, b);
      question = `${max} - ${min} = ?`;
      answer = (max - min).toString();
    }
    difficulty = 'easy';
  } else if (gradeLevel <= 5) {
    // 3-5: Multiplication and division
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    switch (operation) {
      case '+':
        question = `${a} + ${b} = ?`;
        answer = (a + b).toString();
        break;
      case '-':
        const max = Math.max(a, b);
        const min = Math.min(a, b);
        question = `${max} - ${min} = ?`;
        answer = (max - min).toString();
        break;
      case '×':
        question = `${a} × ${b} = ?`;
        answer = (a * b).toString();
        break;
      case '÷':
        const product = a * b;
        question = `${product} ÷ ${a} = ?`;
        answer = b.toString();
        break;
    }
    difficulty = 'medium';
  } else {
    // 6+: Fractions, decimals, algebra
    const problemTypes = ['fraction', 'decimal', 'algebra'];
    const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];

    switch (type) {
      case 'fraction':
        const num1 = Math.floor(Math.random() * 9) + 1;
        const den1 = Math.floor(Math.random() * 9) + 1;
        const num2 = Math.floor(Math.random() * 9) + 1;
        const den2 = Math.floor(Math.random() * 9) + 1;
        question = `${num1}/${den1} + ${num2}/${den2} = ? (simplifica)`;
        const resultNum = num1 * den2 + num2 * den1;
        const resultDen = den1 * den2;
        const gcd = getGCD(resultNum, resultDen);
        answer = `${resultNum / gcd}/${resultDen / gcd}`;
        break;
      case 'decimal':
        const d1 = (Math.random() * 10).toFixed(2);
        const d2 = (Math.random() * 10).toFixed(2);
        question = `${d1} + ${d2} = ?`;
        answer = (parseFloat(d1) + parseFloat(d2)).toFixed(2);
        break;
      case 'algebra':
        const coef = Math.floor(Math.random() * 9) + 1;
        const constant = Math.floor(Math.random() * 20) + 1;
        const result = Math.floor(Math.random() * 50) + 20;
        question = `${coef}x + ${constant} = ${result}, x = ?`;
        answer = ((result - constant) / coef).toString();
        break;
    }
    difficulty = 'hard';
  }

  return {
    id,
    question,
    answer,
    difficulty,
    points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30,
    hint: 'Piensa paso a paso',
    explanation: `La respuesta correcta es ${answer}`,
  };
}

// Get greatest common divisor
function getGCD(a: number, b: number): number {
  return b === 0 ? a : getGCD(b, a % b);
}

// Generate vocabulary word for language games
export function generateVocabularyWord(
  gradeLevel: number,
  subject: 'spanish' | 'english' = 'spanish'
): GameQuestion {
  const vocabularyByGrade = {
    spanish: {
      1: [
        { word: 'casa', definition: 'lugar donde vives', category: 'sustantivo' },
        { word: 'perro', definition: 'animal doméstico que ladra', category: 'sustantivo' },
        { word: 'correr', definition: 'moverse rápidamente con las piernas', category: 'verbo' },
      ],
      3: [
        { word: 'biblioteca', definition: 'lugar donde se guardan libros', category: 'sustantivo' },
        { word: 'estudiar', definition: 'aprender y practicar', category: 'verbo' },
        { word: 'inteligente', definition: 'que aprende con facilidad', category: 'adjetivo' },
      ],
      5: [
        { word: 'democracia', definition: 'sistema de gobierno del pueblo', category: 'sustantivo' },
        { word: 'analizar', definition: 'examinar con detalle', category: 'verbo' },
        { word: 'eficiente', definition: 'que logra buenos resultados con poco esfuerzo', category: 'adjetivo' },
      ],
    },
    english: {
      1: [
        { word: 'house', definition: 'place where you live', category: 'noun' },
        { word: 'dog', definition: 'pet animal that barks', category: 'noun' },
        { word: 'run', definition: 'move quickly with legs', category: 'verb' },
      ],
      3: [
        { word: 'library', definition: 'place where books are kept', category: 'noun' },
        { word: 'study', definition: 'learn and practice', category: 'verb' },
        { word: 'smart', definition: 'learns easily', category: 'adjective' },
      ],
      5: [
        { word: 'democracy', definition: 'government by the people', category: 'noun' },
        { word: 'analyze', definition: 'examine in detail', category: 'verb' },
        { word: 'efficient', definition: 'achieving good results with little effort', category: 'adjective' },
      ],
    },
  };

  const level = Math.min(5, Math.max(1, Math.floor(gradeLevel / 2)));
  const words = vocabularyByGrade[subject][level] || vocabularyByGrade[subject][1];
  const wordData = words[Math.floor(Math.random() * words.length)];

  return {
    id: generateId(),
    question: `¿Qué significa "${wordData.word}"?`,
    answer: wordData.definition,
    options: shuffleArray([
      wordData.definition,
      ...words
        .filter((w) => w.word !== wordData.word)
        .map((w) => w.definition)
        .slice(0, 3),
    ]),
    difficulty: level <= 2 ? 'easy' : level <= 4 ? 'medium' : 'hard',
    points: 15,
    hint: `Es un ${wordData.category}`,
    explanation: `"${wordData.word}" significa: ${wordData.definition}`,
  };
}

// Generate science question
export function generateScienceQuestion(gradeLevel: number): GameQuestion {
  const scienceTopics = {
    elementary: [
      {
        question: '¿Cuántos planetas hay en nuestro sistema solar?',
        answer: '8',
        options: ['6', '7', '8', '9'],
        explanation: 'Hay 8 planetas: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno',
      },
      {
        question: '¿Qué necesitan las plantas para crecer?',
        answer: 'Agua, luz solar y nutrientes',
        options: ['Solo agua', 'Agua, luz solar y nutrientes', 'Solo luz', 'Solo tierra'],
        explanation: 'Las plantas necesitan agua, luz solar y nutrientes del suelo para la fotosíntesis',
      },
    ],
    middle: [
      {
        question: '¿Cuál es la fórmula química del agua?',
        answer: 'H2O',
        options: ['H2O', 'CO2', 'O2', 'NaCl'],
        explanation: 'El agua está formada por 2 átomos de hidrógeno y 1 de oxígeno',
      },
      {
        question: '¿Qué tipo de energía tiene un objeto en movimiento?',
        answer: 'Energía cinética',
        options: ['Energía potencial', 'Energía cinética', 'Energía térmica', 'Energía eléctrica'],
        explanation: 'La energía cinética es la energía del movimiento',
      },
    ],
    high: [
      {
        question: '¿Qué es la mitosis?',
        answer: 'División celular que produce dos células hijas idénticas',
        options: [
          'División celular que produce dos células hijas idénticas',
          'Proceso de fotosíntesis',
          'Reproducción sexual',
          'Muerte celular',
        ],
        explanation: 'La mitosis es el proceso de división celular para el crecimiento y reparación',
      },
      {
        question: '¿Cuál es la ley de conservación de la energía?',
        answer: 'La energía no se crea ni se destruye, solo se transforma',
        options: [
          'La energía siempre aumenta',
          'La energía no se crea ni se destruye, solo se transforma',
          'La energía siempre disminuye',
          'La energía puede crearse de la nada',
        ],
        explanation: 'Esta es la primera ley de la termodinámica',
      },
    ],
  };

  const level = gradeLevel <= 5 ? 'elementary' : gradeLevel <= 8 ? 'middle' : 'high';
  const questions = scienceTopics[level];
  const questionData = questions[Math.floor(Math.random() * questions.length)];

  return {
    id: generateId(),
    ...questionData,
    difficulty: level === 'elementary' ? 'easy' : level === 'middle' ? 'medium' : 'hard',
    points: 20,
    hint: 'Piensa en lo que aprendiste en ciencias',
  };
}

// Generate history question
export function generateHistoryQuestion(gradeLevel: number): GameQuestion {
  const historyTopics = {
    elementary: [
      {
        question: '¿Quién descubrió América en 1492?',
        answer: 'Cristóbal Colón',
        options: ['Cristóbal Colón', 'Américo Vespucio', 'Fernando Magallanes', 'Vasco da Gama'],
        explanation: 'Cristóbal Colón llegó a América el 12 de octubre de 1492',
      },
    ],
    middle: [
      {
        question: '¿En qué año comenzó la Segunda Guerra Mundial?',
        answer: '1939',
        options: ['1914', '1939', '1941', '1945'],
        explanation: 'La Segunda Guerra Mundial comenzó en 1939 con la invasión de Polonia',
      },
    ],
    high: [
      {
        question: '¿Qué fue la Guerra Fría?',
        answer: 'Tensión política entre USA y URSS sin guerra directa',
        options: [
          'Una guerra en el Ártico',
          'Tensión política entre USA y URSS sin guerra directa',
          'La Primera Guerra Mundial',
          'Una guerra civil',
        ],
        explanation: 'La Guerra Fría fue un período de tensión entre las superpotencias (1947-1991)',
      },
    ],
  };

  const level = gradeLevel <= 5 ? 'elementary' : gradeLevel <= 8 ? 'middle' : 'high';
  const questions = historyTopics[level];
  const questionData = questions[Math.floor(Math.random() * questions.length)];

  return {
    id: generateId(),
    ...questionData,
    difficulty: level === 'elementary' ? 'easy' : level === 'middle' ? 'medium' : 'hard',
    points: 20,
    hint: 'Recuerda tus lecciones de historia',
  };
}

// Timer utility for games
export class GameTimer {
  private startTime: number;
  private endTime: number | null = null;
  private pausedTime: number = 0;
  private isPaused: boolean = false;

  constructor() {
    this.startTime = Date.now();
  }

  pause(): void {
    if (!this.isPaused) {
      this.pausedTime = Date.now();
      this.isPaused = true;
    }
  }

  resume(): void {
    if (this.isPaused) {
      const pauseDuration = Date.now() - this.pausedTime;
      this.startTime += pauseDuration;
      this.isPaused = false;
    }
  }

  stop(): number {
    if (!this.endTime) {
      this.endTime = Date.now();
    }
    return this.getElapsedTime();
  }

  getElapsedTime(): number {
    const end = this.endTime || Date.now();
    return Math.floor((end - this.startTime) / 1000);
  }

  getRemainingTime(totalSeconds: number): number {
    return Math.max(0, totalSeconds - this.getElapsedTime());
  }
}

// Sound effects manager
export class SoundManager {
  private enabled: boolean = true;
  private sounds: { [key: string]: HTMLAudioElement } = {};

  constructor() {
    // Initialize with basic sounds
    this.loadSound('correct', '/sounds/correct.mp3');
    this.loadSound('incorrect', '/sounds/incorrect.mp3');
    this.loadSound('complete', '/sounds/complete.mp3');
    this.loadSound('click', '/sounds/click.mp3');
  }

  loadSound(name: string, url: string): void {
    if (typeof window !== 'undefined') {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.sounds[name] = audio;
    }
  }

  play(soundName: string): void {
    if (this.enabled && this.sounds[soundName]) {
      this.sounds[soundName].currentTime = 0;
      this.sounds[soundName].play().catch(() => {
        // Ignore errors (e.g., autoplay policy)
      });
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Achievement system
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: Date;
}

export class AchievementManager {
  private achievements: Achievement[] = [
    {
      id: 'first_game',
      name: 'Primera Victoria',
      description: 'Completa tu primer juego',
      icon: '🎮',
      points: 10,
    },
    {
      id: 'perfect_score',
      name: 'Puntuación Perfecta',
      description: 'Obtén 100% en un juego',
      icon: '💯',
      points: 50,
    },
    {
      id: 'streak_5',
      name: 'Racha de 5',
      description: 'Responde 5 preguntas correctas seguidas',
      icon: '🔥',
      points: 25,
    },
    {
      id: 'speed_demon',
      name: 'Rayo Veloz',
      description: 'Completa un juego en menos de 1 minuto',
      icon: '⚡',
      points: 30,
    },
  ];

  checkAchievement(achievementId: string, userId: string): boolean {
    const key = `achievement_${userId}_${achievementId}`;
    return localStorage.getItem(key) === 'true';
  }

  unlockAchievement(achievementId: string, userId: string): Achievement | null {
    if (this.checkAchievement(achievementId, userId)) {
      return null;
    }

    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (achievement) {
      const key = `achievement_${userId}_${achievementId}`;
      localStorage.setItem(key, 'true');
      return { ...achievement, unlockedAt: new Date() };
    }

    return null;
  }

  getUserAchievements(userId: string): Achievement[] {
    return this.achievements
      .filter((a) => this.checkAchievement(a.id, userId))
      .map((a) => ({ ...a, unlockedAt: new Date() }));
  }
}

export default {
  shuffleArray,
  generateId,
  calculateScore,
  formatScore,
  checkAnswer,
  generateMathProblem,
  generateVocabularyWord,
  generateScienceQuestion,
  generateHistoryQuestion,
  GameTimer,
  SoundManager,
  AchievementManager,
};