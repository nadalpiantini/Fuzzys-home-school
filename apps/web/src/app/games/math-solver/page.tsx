'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Calculator,
  Timer,
  Target,
  Sparkles,
  Brain,
  Lightbulb,
  ChevronRight,
  Check,
  X,
  HelpCircle,
  BookOpen,
  Zap,
  Award,
  TrendingUp,
} from 'lucide-react';

// Types
interface MathProblem {
  id: number;
  type: 'addition' | 'subtraction' | 'multiplication' | 'fraction';
  difficulty: 'easy' | 'medium' | 'hard';
  problem: string;
  steps: MathStep[];
  finalAnswer: string;
  points: number;
}

interface MathStep {
  id: number;
  description: string;
  calculation: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
}

interface GameStats {
  score: number;
  totalProblems: number;
  correctSteps: number;
  totalSteps: number;
  timeElapsed: number;
  currentStreak: number;
  maxStreak: number;
  hintsUsed: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: GameStats) => boolean;
}

// Problem generators
const generateAdditionProblem = (difficulty: 'easy' | 'medium' | 'hard'): MathProblem => {
  let num1: number, num2: number;

  switch (difficulty) {
    case 'easy':
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      break;
    case 'medium':
      num1 = Math.floor(Math.random() * 100) + 10;
      num2 = Math.floor(Math.random() * 100) + 10;
      break;
    case 'hard':
      num1 = Math.floor(Math.random() * 500) + 100;
      num2 = Math.floor(Math.random() * 500) + 100;
      break;
  }

  const answer = num1 + num2;
  const carry = num1 + num2 >= Math.pow(10, num1.toString().length);

  const steps: MathStep[] = [
    {
      id: 1,
      description: "Alinea los números por su valor posicional",
      calculation: `  ${num1}\n+ ${num2}\n____`,
      options: ["Correcto", "Incorrecto", "No sé"],
      correctAnswer: "Correcto",
      explanation: "Siempre alinea las unidades con unidades, decenas con decenas, etc.",
      hint: "Coloca un número debajo del otro, alineando por la derecha"
    }
  ];

  if (difficulty !== 'easy') {
    steps.push({
      id: 2,
      description: carry ? "Suma las unidades y reagrupa si es necesario" : "Suma las unidades",
      calculation: `${num1 % 10} + ${num2 % 10} = ${(num1 + num2) % 10}${carry ? ' (lleva 1)' : ''}`,
      options: [
        `${(num1 + num2) % 10}${carry ? ' llevando 1' : ''}`,
        `${((num1 + num2) % 10) + 1}`,
        `${(num1 + num2) % 10 - 1}`,
        "No sé"
      ],
      correctAnswer: `${(num1 + num2) % 10}${carry ? ' llevando 1' : ''}`,
      explanation: carry ? "Cuando la suma es ≥ 10, escribes la unidad y llevas 1 a las decenas" : "Suma directamente las unidades",
      hint: "Mira solo los números de la derecha primero"
    });

    if (carry || difficulty === 'hard') {
      const tens1 = Math.floor(num1 / 10) % 10;
      const tens2 = Math.floor(num2 / 10) % 10;
      const carryValue = carry ? 1 : 0;

      steps.push({
        id: 3,
        description: "Suma las decenas" + (carry ? " más lo que llevaste" : ""),
        calculation: `${tens1} + ${tens2}${carry ? ' + 1' : ''} = ${tens1 + tens2 + carryValue}`,
        options: [
          `${tens1 + tens2 + carryValue}`,
          `${tens1 + tens2}`,
          `${tens1 + tens2 + carryValue + 1}`,
          "No sé"
        ],
        correctAnswer: `${tens1 + tens2 + carryValue}`,
        explanation: carry ? "No olvides sumar el 1 que llevaste de las unidades" : "Suma las decenas normalmente",
        hint: carry ? "Recuerda el número que llevaste del paso anterior" : "Suma los números de la segunda posición"
      });
    }
  }

  steps.push({
    id: steps.length + 1,
    description: "Escribe la respuesta final",
    calculation: `${num1} + ${num2} = ${answer}`,
    options: [`${answer}`, `${answer + 1}`, `${answer - 1}`, "No sé"],
    correctAnswer: `${answer}`,
    explanation: "La suma de todos los pasos nos da el resultado final",
    hint: "Combina todos los resultados de los pasos anteriores"
  });

  return {
    id: Date.now(),
    type: 'addition',
    difficulty,
    problem: `${num1} + ${num2}`,
    steps,
    finalAnswer: answer.toString(),
    points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30
  };
};

const generateSubtractionProblem = (difficulty: 'easy' | 'medium' | 'hard'): MathProblem => {
  let num1: number, num2: number;

  switch (difficulty) {
    case 'easy':
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
      break;
    case 'medium':
      num1 = Math.floor(Math.random() * 100) + 50;
      num2 = Math.floor(Math.random() * (num1 - 10)) + 10;
      break;
    case 'hard':
      num1 = Math.floor(Math.random() * 500) + 200;
      num2 = Math.floor(Math.random() * (num1 - 50)) + 50;
      break;
  }

  const answer = num1 - num2;
  const needsBorrow = (num1 % 10) < (num2 % 10);

  const steps: MathStep[] = [
    {
      id: 1,
      description: "Alinea los números para restar",
      calculation: `  ${num1}\n- ${num2}\n____`,
      options: ["Correcto", "Incorrecto", "No sé"],
      correctAnswer: "Correcto",
      explanation: "Alinea el número menor debajo del mayor, por valor posicional",
      hint: "El número más grande va arriba"
    }
  ];

  if (needsBorrow && difficulty !== 'easy') {
    steps.push({
      id: 2,
      description: "Pide prestado de las decenas porque no puedes restar",
      calculation: `${num1 % 10} < ${num2 % 10}, así que pide prestado`,
      options: [
        `Sí, pedir prestado 1 decena`,
        `No es necesario`,
        `Pedir prestado 2 decenas`,
        "No sé"
      ],
      correctAnswer: `Sí, pedir prestado 1 decena`,
      explanation: "Cuando el dígito de arriba es menor, necesitas pedir prestado de la siguiente posición",
      hint: "¿Puedes restar un número mayor de uno menor?"
    });

    steps.push({
      id: 3,
      description: "Resta las unidades después de pedir prestado",
      calculation: `${(num1 % 10) + 10} - ${num2 % 10} = ${((num1 % 10) + 10) - (num2 % 10)}`,
      options: [
        `${((num1 % 10) + 10) - (num2 % 10)}`,
        `${(num1 % 10) - (num2 % 10)}`,
        `${((num1 % 10) + 10) - (num2 % 10) + 1}`,
        "No sé"
      ],
      correctAnswer: `${((num1 % 10) + 10) - (num2 % 10)}`,
      explanation: "Ahora que tienes 10 unidades extra, puedes restar normalmente",
      hint: "Agregaste 10 al número de arriba"
    });
  } else {
    steps.push({
      id: 2,
      description: "Resta las unidades",
      calculation: `${num1 % 10} - ${num2 % 10} = ${(num1 % 10) - (num2 % 10)}`,
      options: [
        `${(num1 % 10) - (num2 % 10)}`,
        `${(num1 % 10) - (num2 % 10) + 1}`,
        `${(num1 % 10) - (num2 % 10) - 1}`,
        "No sé"
      ],
      correctAnswer: `${(num1 % 10) - (num2 % 10)}`,
      explanation: "Resta los dígitos de las unidades directamente",
      hint: "Resta los números de la derecha"
    });
  }

  const tens1 = Math.floor(num1 / 10) % 10;
  const tens2 = Math.floor(num2 / 10) % 10;
  const borrowedTens = needsBorrow ? tens1 - 1 : tens1;

  if (difficulty !== 'easy') {
    steps.push({
      id: steps.length + 1,
      description: "Resta las decenas" + (needsBorrow ? " (recuerda que prestaste 1)" : ""),
      calculation: `${needsBorrow ? tens1 - 1 : tens1} - ${tens2} = ${borrowedTens - tens2}`,
      options: [
        `${borrowedTens - tens2}`,
        `${tens1 - tens2}`,
        `${borrowedTens - tens2 + 1}`,
        "No sé"
      ],
      correctAnswer: `${borrowedTens - tens2}`,
      explanation: needsBorrow ? "Recuerda restar 1 porque prestaste a las unidades" : "Resta las decenas normalmente",
      hint: needsBorrow ? "Prestaste 1 decena en el paso anterior" : "Resta los números de la segunda posición"
    });
  }

  steps.push({
    id: steps.length + 1,
    description: "Escribe la respuesta final",
    calculation: `${num1} - ${num2} = ${answer}`,
    options: [`${answer}`, `${answer + 1}`, `${answer - 1}`, "No sé"],
    correctAnswer: `${answer}`,
    explanation: "El resultado de la resta paso a paso",
    hint: "Combina todos los resultados de los pasos"
  });

  return {
    id: Date.now(),
    type: 'subtraction',
    difficulty,
    problem: `${num1} - ${num2}`,
    steps,
    finalAnswer: answer.toString(),
    points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30
  };
};

const generateMultiplicationProblem = (difficulty: 'easy' | 'medium' | 'hard'): MathProblem => {
  let num1: number, num2: number;

  switch (difficulty) {
    case 'easy':
      num1 = Math.floor(Math.random() * 10) + 2;
      num2 = Math.floor(Math.random() * 10) + 2;
      break;
    case 'medium':
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * 9) + 2;
      break;
    case 'hard':
      num1 = Math.floor(Math.random() * 50) + 20;
      num2 = Math.floor(Math.random() * 20) + 10;
      break;
  }

  const answer = num1 * num2;

  const steps: MathStep[] = [
    {
      id: 1,
      description: "Configura la multiplicación",
      calculation: `${num1} × ${num2}`,
      options: ["Correcto", "Incorrecto", "No sé"],
      correctAnswer: "Correcto",
      explanation: "Identifica los números que vas a multiplicar",
      hint: "Escribe los números que necesitas multiplicar"
    }
  ];

  if (difficulty === 'easy') {
    steps.push({
      id: 2,
      description: "Multiplica usando tablas de multiplicar",
      calculation: `${num1} × ${num2} = ${answer}`,
      options: [`${answer}`, `${answer + num1}`, `${answer - num2}`, "No sé"],
      correctAnswer: `${answer}`,
      explanation: "Usa las tablas de multiplicar que has memorizado",
      hint: `Piensa en la tabla del ${num2}: ${num2} × ${num1} = ?`
    });
  } else {
    // For medium and hard, break down multiplication
    if (num2 >= 10) {
      const tens = Math.floor(num2 / 10);
      const units = num2 % 10;

      steps.push({
        id: 2,
        description: `Multiplica ${num1} × ${units} (unidades)`,
        calculation: `${num1} × ${units} = ${num1 * units}`,
        options: [
          `${num1 * units}`,
          `${num1 * units + 10}`,
          `${num1 * units - 5}`,
          "No sé"
        ],
        correctAnswer: `${num1 * units}`,
        explanation: "Multiplica por las unidades primero",
        hint: `¿Cuánto es ${num1} × ${units}?`
      });

      steps.push({
        id: 3,
        description: `Multiplica ${num1} × ${tens}0 (decenas)`,
        calculation: `${num1} × ${tens}0 = ${num1 * tens * 10}`,
        options: [
          `${num1 * tens * 10}`,
          `${num1 * tens}`,
          `${num1 * tens * 10 + 10}`,
          "No sé"
        ],
        correctAnswer: `${num1 * tens * 10}`,
        explanation: "Multiplica por las decenas (no olvides el cero)",
        hint: `${num1} × ${tens} = ${num1 * tens}, luego agrega un cero`
      });

      steps.push({
        id: 4,
        description: "Suma los productos parciales",
        calculation: `${num1 * units} + ${num1 * tens * 10} = ${answer}`,
        options: [`${answer}`, `${answer + 10}`, `${answer - 10}`, "No sé"],
        correctAnswer: `${answer}`,
        explanation: "Suma los resultados de multiplicar por unidades y decenas",
        hint: "Suma los dos números que calculaste antes"
      });
    } else {
      steps.push({
        id: 2,
        description: "Multiplica usando la propiedad distributiva o tablas",
        calculation: `${num1} × ${num2} = ${answer}`,
        options: [`${answer}`, `${answer + 5}`, `${answer - 5}`, "No sé"],
        correctAnswer: `${answer}`,
        explanation: "Usa las estrategias de multiplicación que conoces",
        hint: `Puedes pensar en ${num1} sumado ${num2} veces`
      });
    }
  }

  steps.push({
    id: steps.length + 1,
    description: "Verifica tu respuesta",
    calculation: `${num1} × ${num2} = ${answer}`,
    options: [`${answer}`, `${answer + 1}`, `${answer - 1}`, "No sé"],
    correctAnswer: `${answer}`,
    explanation: "Confirma que tu multiplicación es correcta",
    hint: "¿Tiene sentido tu respuesta?"
  });

  return {
    id: Date.now(),
    type: 'multiplication',
    difficulty,
    problem: `${num1} × ${num2}`,
    steps,
    finalAnswer: answer.toString(),
    points: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 35
  };
};

const generateFractionProblem = (difficulty: 'easy' | 'medium' | 'hard'): MathProblem => {
  let num1: number, den1: number, num2: number, den2: number;

  switch (difficulty) {
    case 'easy':
      // Same denominators
      den1 = den2 = Math.floor(Math.random() * 8) + 2;
      num1 = Math.floor(Math.random() * den1) + 1;
      num2 = Math.floor(Math.random() * (den1 - num1)) + 1;
      break;
    case 'medium':
      // Different denominators, but one is multiple of other
      den1 = Math.floor(Math.random() * 5) + 2;
      den2 = den1 * (Math.floor(Math.random() * 3) + 2);
      num1 = Math.floor(Math.random() * den1) + 1;
      num2 = Math.floor(Math.random() * den2) + 1;
      break;
    case 'hard':
      // Different denominators
      den1 = Math.floor(Math.random() * 8) + 2;
      den2 = Math.floor(Math.random() * 8) + 2;
      if (den1 === den2) den2 += 1;
      num1 = Math.floor(Math.random() * den1) + 1;
      num2 = Math.floor(Math.random() * den2) + 1;
      break;
  }

  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

  const commonDen = lcm(den1, den2);
  const newNum1 = num1 * (commonDen / den1);
  const newNum2 = num2 * (commonDen / den2);
  const answerNum = newNum1 + newNum2;

  // Simplify the answer
  const answerGcd = gcd(answerNum, commonDen);
  const finalNum = answerNum / answerGcd;
  const finalDen = commonDen / answerGcd;

  const steps: MathStep[] = [
    {
      id: 1,
      description: "Identifica las fracciones a sumar",
      calculation: `${num1}/${den1} + ${num2}/${den2}`,
      options: ["Correcto", "Incorrecto", "No sé"],
      correctAnswer: "Correcto",
      explanation: "Primero identifica claramente las fracciones que vas a sumar",
      hint: "Lee cuidadosamente cada fracción"
    }
  ];

  if (den1 !== den2) {
    steps.push({
      id: 2,
      description: "Encuentra el denominador común",
      calculation: `MCM(${den1}, ${den2}) = ${commonDen}`,
      options: [`${commonDen}`, `${den1 * den2}`, `${Math.max(den1, den2)}`, "No sé"],
      correctAnswer: `${commonDen}`,
      explanation: "Para sumar fracciones necesitas el mismo denominador",
      hint: "Busca el mínimo común múltiplo de los denominadores"
    });

    steps.push({
      id: 3,
      description: "Convierte a fracciones equivalentes",
      calculation: `${num1}/${den1} = ${newNum1}/${commonDen}, ${num2}/${den2} = ${newNum2}/${commonDen}`,
      options: [
        `${newNum1}/${commonDen} y ${newNum2}/${commonDen}`,
        `${num1}/${commonDen} y ${num2}/${commonDen}`,
        `${newNum1}/${den1} y ${newNum2}/${den2}`,
        "No sé"
      ],
      correctAnswer: `${newNum1}/${commonDen} y ${newNum2}/${commonDen}`,
      explanation: "Multiplica numerador y denominador por el mismo número para mantener el valor",
      hint: "¿Por qué número multiplicas cada fracción para obtener el denominador común?"
    });
  } else {
    steps.push({
      id: 2,
      description: "Los denominadores ya son iguales",
      calculation: `${num1}/${den1} + ${num2}/${den2} = ${num1}/${den1} + ${num2}/${den1}`,
      options: ["Correcto, puedo sumar directamente", "Necesito cambiar denominadores", "No sé"],
      correctAnswer: "Correcto, puedo sumar directamente",
      explanation: "Cuando los denominadores son iguales, solo sumas los numeradores",
      hint: "¿Son iguales los números de abajo?"
    });
  }

  steps.push({
    id: steps.length + 1,
    description: "Suma los numeradores",
    calculation: `${newNum1} + ${newNum2} = ${answerNum}`,
    options: [`${answerNum}`, `${answerNum + 1}`, `${answerNum - 1}`, "No sé"],
    correctAnswer: `${answerNum}`,
    explanation: "Con denominadores iguales, suma solo los numeradores",
    hint: "Suma los números de arriba, mantén el denominador igual"
  });

  if (answerGcd > 1) {
    steps.push({
      id: steps.length + 1,
      description: "Simplifica la fracción",
      calculation: `${answerNum}/${commonDen} = ${finalNum}/${finalDen}`,
      options: [
        `${finalNum}/${finalDen}`,
        `${answerNum}/${commonDen}`,
        `${finalNum + 1}/${finalDen}`,
        "No sé"
      ],
      correctAnswer: `${finalNum}/${finalDen}`,
      explanation: `Divide numerador y denominador por su máximo común divisor (${answerGcd})`,
      hint: "¿Puedes dividir ambos números por un número común?"
    });
  }

  steps.push({
    id: steps.length + 1,
    description: "Respuesta final",
    calculation: `${num1}/${den1} + ${num2}/${den2} = ${finalNum}/${finalDen}`,
    options: [
      `${finalNum}/${finalDen}`,
      `${answerNum}/${commonDen}`,
      `${finalNum}/${finalDen + 1}`,
      "No sé"
    ],
    correctAnswer: `${finalNum}/${finalDen}`,
    explanation: "Esta es la suma de fracciones en su forma más simple",
    hint: "¿Está tu fracción en la forma más simple?"
  });

  return {
    id: Date.now(),
    type: 'fraction',
    difficulty,
    problem: `${num1}/${den1} + ${num2}/${den2}`,
    steps,
    finalAnswer: `${finalNum}/${finalDen}`,
    points: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 40
  };
};

// Achievements
const achievements: Achievement[] = [
  {
    id: 'first_problem',
    title: '🌟 Primer Problema',
    description: 'Resuelve tu primer problema',
    icon: '🌟',
    unlocked: false,
    condition: (stats) => stats.totalProblems >= 1
  },
  {
    id: 'perfect_problem',
    title: '💎 Perfeccionista',
    description: 'Resuelve un problema sin errores',
    icon: '💎',
    unlocked: false,
    condition: (stats) => stats.currentStreak >= 1
  },
  {
    id: 'speed_solver',
    title: '⚡ Solucionador Rápido',
    description: 'Resuelve 5 problemas seguidos',
    icon: '⚡',
    unlocked: false,
    condition: (stats) => stats.totalProblems >= 5
  },
  {
    id: 'hint_master',
    title: '🧠 Maestro de Pistas',
    description: 'Resuelve 3 problemas usando pocas pistas',
    icon: '🧠',
    unlocked: false,
    condition: (stats) => stats.totalProblems >= 3 && stats.hintsUsed <= 2
  },
  {
    id: 'streak_master',
    title: '🔥 Racha Maestra',
    description: 'Mantén una racha de 10 respuestas correctas',
    icon: '🔥',
    unlocked: false,
    condition: (stats) => stats.maxStreak >= 10
  }
];

export default function MathSolverGame() {
  const router = useRouter();

  // Game state
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [problemType, setProblemType] = useState<'addition' | 'subtraction' | 'multiplication' | 'fraction'>('addition');

  // Stats
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    totalProblems: 0,
    correctSteps: 0,
    totalSteps: 0,
    timeElapsed: 0,
    currentStreak: 0,
    maxStreak: 0,
    hintsUsed: 0
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [problemCompleted, setProblemCompleted] = useState(false);
  const [stepResults, setStepResults] = useState<boolean[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);

  // Generate new problem
  const generateNewProblem = useCallback(() => {
    let problem: MathProblem;

    switch (problemType) {
      case 'addition':
        problem = generateAdditionProblem(difficulty);
        break;
      case 'subtraction':
        problem = generateSubtractionProblem(difficulty);
        break;
      case 'multiplication':
        problem = generateMultiplicationProblem(difficulty);
        break;
      case 'fraction':
        problem = generateFractionProblem(difficulty);
        break;
      default:
        problem = generateAdditionProblem(difficulty);
    }

    setCurrentProblem(problem);
    setCurrentStepIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setShowHint(false);
    setProblemCompleted(false);
    setStepResults([]);

    if (!gameStarted) {
      setGameStarted(true);
    }
  }, [difficulty, problemType, gameStarted]);

  // Initialize first problem
  useEffect(() => {
    generateNewProblem();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && !problemCompleted) {
      interval = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, problemCompleted]);

  // Check achievements
  const checkAchievements = useCallback((newStats: GameStats) => {
    const newUnlocked: Achievement[] = [];

    achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(newStats)) {
        achievement.unlocked = true;
        newUnlocked.push({ ...achievement });
      }
    });

    if (newUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newUnlocked]);
    }
  }, []);

  // Handle answer submission
  const handleAnswerSubmit = () => {
    if (!currentProblem || !selectedAnswer) return;

    const currentStep = currentProblem.steps[currentStepIndex];
    const isCorrect = selectedAnswer === currentStep.correctAnswer;

    const newStepResults = [...stepResults, isCorrect];
    setStepResults(newStepResults);

    setShowResult(true);

    // Update stats
    setGameStats(prev => {
      const newStats = {
        ...prev,
        totalSteps: prev.totalSteps + 1,
        correctSteps: isCorrect ? prev.correctSteps + 1 : prev.correctSteps,
        currentStreak: isCorrect ? prev.currentStreak + 1 : 0,
        maxStreak: isCorrect ? Math.max(prev.maxStreak, prev.currentStreak + 1) : prev.maxStreak
      };

      checkAchievements(newStats);
      return newStats;
    });

    // Auto-advance after delay
    setTimeout(() => {
      if (currentStepIndex < currentProblem.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        setSelectedAnswer('');
        setShowResult(false);
        setShowHint(false);
      } else {
        // Problem completed
        setProblemCompleted(true);
        const problemScore = newStepResults.filter(r => r).length === currentProblem.steps.length
          ? currentProblem.points
          : Math.floor(currentProblem.points * (newStepResults.filter(r => r).length / currentProblem.steps.length));

        setGameStats(prev => {
          const newStats = {
            ...prev,
            score: prev.score + problemScore,
            totalProblems: prev.totalProblems + 1
          };

          checkAchievements(newStats);
          return newStats;
        });
      }
    }, 2000);
  };

  // Handle hint usage
  const handleShowHint = () => {
    setShowHint(true);
    setGameStats(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }));
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get difficulty color
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'addition': return 'from-blue-500 to-cyan-500';
      case 'subtraction': return 'from-green-500 to-emerald-500';
      case 'multiplication': return 'from-purple-500 to-pink-500';
      case 'fraction': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'addition': return '➕';
      case 'subtraction': return '➖';
      case 'multiplication': return '✖️';
      case 'fraction': return '📊';
      default: return '🔢';
    }
  };

  if (!currentProblem) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Calculator className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
        <p>Generando problema matemático...</p>
      </div>
    </div>;
  }

  const currentStep = currentProblem.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / currentProblem.steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gradient-to-r ${getTypeColor(currentProblem.type)} rounded-xl text-white`}>
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🧮 Matemáticas Paso a Paso
                </h1>
                <p className="text-sm text-gray-600">
                  {getTypeIcon(currentProblem.type)} {currentProblem.problem}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(difficulty)}>
                {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'}
              </Badge>
              <Button
                variant="outline"
                onClick={() => router.push('/games')}
                className="bg-white/50 hover:bg-white/80"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Puntos</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{gameStats.score}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Precisión</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {gameStats.totalSteps ? Math.round((gameStats.correctSteps / gameStats.totalSteps) * 100) : 0}%
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Racha</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{gameStats.currentStreak}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Timer className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Tiempo</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{formatTime(gameStats.timeElapsed)}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Problemas</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{gameStats.totalProblems}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Settings */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <Tabs defaultValue="game" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50">
            <TabsTrigger value="game">🎮 Juego</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Configuración</TabsTrigger>
            <TabsTrigger value="achievements">🏆 Logros</TabsTrigger>
          </TabsList>

          <TabsContent value="game" className="mt-6">
            {/* Progress Bar */}
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  Paso {currentStepIndex + 1} de {currentProblem.steps.length}
                </h3>
                <Badge variant="outline" className="bg-white/50">
                  {currentProblem.points} puntos
                </Badge>
              </div>
              <Progress value={progress} className="h-3 mb-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progreso del problema</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Current Step */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="space-y-6">
                {/* Step Description */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {currentStep.description}
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-lg whitespace-pre-line">
                    {currentStep.calculation}
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700">Selecciona tu respuesta:</h3>
                  <div className="grid gap-3">
                    {currentStep.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedAnswer === option ? "default" : "outline"}
                        className={`p-4 text-left justify-start h-auto ${
                          selectedAnswer === option
                            ? `bg-gradient-to-r ${getTypeColor(currentProblem.type)} text-white`
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                        onClick={() => setSelectedAnswer(option)}
                        disabled={showResult}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswer === option
                              ? 'border-white bg-white/20'
                              : 'border-gray-300'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-base">{option}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer || showResult}
                    className={`bg-gradient-to-r ${getTypeColor(currentProblem.type)} text-white hover:opacity-90`}
                    size="lg"
                  >
                    <ChevronRight className="w-5 h-5 mr-2" />
                    Confirmar Respuesta
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleShowHint}
                    disabled={showHint || showResult}
                    className="bg-white/50 hover:bg-white/80"
                    size="lg"
                  >
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Pista
                  </Button>
                </div>

                {/* Hint */}
                {showHint && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">💡 Pista:</h4>
                        <p className="text-yellow-700">{currentStep.hint}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Result */}
                {showResult && (
                  <div className={`${
                    selectedAnswer === currentStep.correctAnswer
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  } border rounded-lg p-4`}>
                    <div className="flex items-start gap-2">
                      {selectedAnswer === currentStep.correctAnswer ? (
                        <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <h4 className={`font-semibold mb-1 ${
                          selectedAnswer === currentStep.correctAnswer
                            ? 'text-green-800'
                            : 'text-red-800'
                        }`}>
                          {selectedAnswer === currentStep.correctAnswer ? '✅ ¡Correcto!' : '❌ Incorrecto'}
                        </h4>
                        <p className={
                          selectedAnswer === currentStep.correctAnswer
                            ? 'text-green-700'
                            : 'text-red-700'
                        }>
                          {currentStep.explanation}
                        </p>
                        {selectedAnswer !== currentStep.correctAnswer && (
                          <p className="text-red-600 mt-2">
                            <strong>Respuesta correcta:</strong> {currentStep.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Problem Completed */}
            {problemCompleted && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl border border-white/20">
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">
                      {stepResults.every(r => r) ? '🎉' : '👏'}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                      ¡Problema Completado!
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Resolviste {stepResults.filter(r => r).length} de {stepResults.length} pasos correctamente
                    </p>

                    {/* Performance */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Pasos Correctos</div>
                          <div className="font-bold text-green-600">
                            {stepResults.filter(r => r).length}/{stepResults.length}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Puntos Ganados</div>
                          <div className="font-bold text-yellow-600">
                            {stepResults.filter(r => r).length === stepResults.length
                              ? currentProblem.points
                              : Math.floor(currentProblem.points * (stepResults.filter(r => r).length / stepResults.length))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={generateNewProblem}
                        className={`bg-gradient-to-r ${getTypeColor(currentProblem.type)} text-white hover:opacity-90`}
                        size="lg"
                      >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Nuevo Problema
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/games')}
                        size="lg"
                      >
                        <Home className="w-5 h-5 mr-2" />
                        Otros Juegos
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Configuración del Juego</h3>

              <div className="space-y-6">
                {/* Difficulty */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Nivel de Dificultad</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['easy', 'medium', 'hard'].map((diff) => (
                      <Button
                        key={diff}
                        variant={difficulty === diff ? "default" : "outline"}
                        onClick={() => setDifficulty(diff as any)}
                        className={`${
                          difficulty === diff
                            ? getDifficultyColor(diff).replace('bg-', 'bg-gradient-to-r from-').replace('text-', 'text-white border-')
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                      >
                        {diff === 'easy' ? '🟢 Fácil' : diff === 'medium' ? '🟡 Medio' : '🔴 Difícil'}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Problem Type */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Tipo de Problema</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { type: 'addition', label: '➕ Suma', desc: 'Problemas de suma' },
                      { type: 'subtraction', label: '➖ Resta', desc: 'Problemas de resta' },
                      { type: 'multiplication', label: '✖️ Multiplicación', desc: 'Tablas y productos' },
                      { type: 'fraction', label: '📊 Fracciones', desc: 'Suma de fracciones' }
                    ].map((item) => (
                      <Button
                        key={item.type}
                        variant={problemType === item.type ? "default" : "outline"}
                        onClick={() => setProblemType(item.type as any)}
                        className={`${
                          problemType === item.type
                            ? `bg-gradient-to-r ${getTypeColor(item.type)} text-white`
                            : 'bg-white/50 hover:bg-white/80'
                        } h-auto p-4 flex-col`}
                      >
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-sm opacity-80">{item.desc}</div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={generateNewProblem}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generar Nuevo Problema
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">🏆 Logros</h3>

              <div className="grid gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.unlocked || unlockedAchievements.some(a => a.id === achievement.id)
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          achievement.unlocked || unlockedAchievements.some(a => a.id === achievement.id)
                            ? 'text-yellow-800'
                            : 'text-gray-600'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm ${
                          achievement.unlocked || unlockedAchievements.some(a => a.id === achievement.id)
                            ? 'text-yellow-700'
                            : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                      {(achievement.unlocked || unlockedAchievements.some(a => a.id === achievement.id)) && (
                        <Award className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Achievement Notification */}
      {unlockedAchievements.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          {unlockedAchievements.slice(-1).map((achievement) => (
            <div
              key={achievement.id}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-lg shadow-lg animate-bounce"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <div className="font-bold">¡Logro Desbloqueado!</div>
                  <div className="text-sm">{achievement.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}