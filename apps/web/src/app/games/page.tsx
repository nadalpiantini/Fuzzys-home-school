'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InstantGameSelector } from '@/components/games/InstantGameSelector';
import OrganizedGameList from '@/components/games/OrganizedGameList';
import {
  Gamepad2,
  BookOpen,
  Music,
  Beaker,
  Brain,
  Blocks,
  Camera,
  Globe,
  Sparkles,
  Users,
  Clock,
  Trophy,
  Target,
  ChevronRight,
  Star,
  Play,
  ArrowRight,
  Heart,
  Zap,
  Shield,
} from 'lucide-react';

interface GameButton {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageRange: string;
  duration: string;
  players: string;
  type: 'simulation' | 'programming' | 'music' | 'ar' | 'traditional';
  url: string;
  tags: string[];
  rating: number;
  plays: number;
  icon: React.ReactNode;
  glassColor: string;
  gradientColor: string;
  emoji: string;
}

interface DifficultyLevel {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  glassColor: string;
  games: GameButton[];
}

const gradeLevels: DifficultyLevel[] = [
  {
    id: 'prek-2',
    title: '🌱 Pequeños Exploradores (Pre-K a 2do)',
    description: '¡Aprende jugando con colores y formas!',
    icon: <Heart className="w-8 h-8" />,
    color: 'from-pink-300 to-purple-300',
    glassColor: 'bg-pink-50/30',
    games: [
      {
        id: 'blockly-puzzle',
        title: '🧩 Rompecabezas Mágico',
        description: '¡Arrastra y conecta bloques de colores!',
        difficulty: 'beginner',
        ageRange: '4-8',
        duration: '10-15 min',
        players: '1',
        type: 'programming',
        url: '/games/external?type=blockly&game=puzzle',
        tags: ['Colores', 'Formas', 'Diversión'],
        rating: 4.8,
        plays: 23150,
        icon: <Blocks className="w-6 h-6" />,
        glassColor: 'bg-pink-50/40',
        gradientColor: 'from-pink-300 to-purple-300',
        emoji: '🧩',
      },
      {
        id: 'blockly-maze',
        title: '🌀 Aventura en el Laberinto',
        description: '¡Guía al personaje por el laberinto!',
        difficulty: 'beginner',
        ageRange: '6-8',
        duration: '20-30 min',
        players: '1',
        type: 'programming',
        url: '/games/external?type=blockly&game=maze',
        tags: ['Aventura', 'Laberinto', 'Explorar'],
        rating: 4.7,
        plays: 18750,
        icon: <Target className="w-6 h-6" />,
        glassColor: 'bg-purple-50/40',
        gradientColor: 'from-purple-300 to-indigo-300',
        emoji: '🌀',
      },
      {
        id: 'memory-cards',
        title: '🧠 Memoria de Animales',
        description: '¡Encuentra las parejas de animales!',
        difficulty: 'beginner',
        ageRange: '5-8',
        duration: '10-15 min',
        players: '1-2',
        type: 'traditional',
        url: '/games/memory-cards',
        tags: ['Animales', 'Memoria', 'Parejas'],
        rating: 4.6,
        plays: 12340,
        icon: <Brain className="w-6 h-6" />,
        glassColor: 'bg-indigo-50/40',
        gradientColor: 'from-indigo-300 to-blue-300',
        emoji: '🐾',
      },
      {
        id: 'flashcards',
        title: '📚 Tarjetas de Colores',
        description: '¡Aprende los colores y números!',
        difficulty: 'beginner',
        ageRange: '4-8',
        duration: '5-10 min',
        players: '1',
        type: 'traditional',
        url: '/games/flashcards',
        tags: ['Colores', 'Números', 'Básico'],
        rating: 4.5,
        plays: 9876,
        icon: <BookOpen className="w-6 h-6" />,
        glassColor: 'bg-blue-50/40',
        gradientColor: 'from-blue-300 to-cyan-300',
        emoji: '🌈',
      },
      {
        id: 'drag-drop-shapes',
        title: '🔷 Formas y Colores',
        description: '¡Arrastra las formas a su lugar correcto!',
        difficulty: 'beginner',
        ageRange: '4-6',
        duration: '8-12 min',
        players: '1',
        type: 'traditional',
        url: '/games/drag-drop',
        tags: ['Formas', 'Colores', 'Arrastrar'],
        rating: 4.7,
        plays: 15600,
        icon: <Target className="w-6 h-6" />,
        glassColor: 'bg-cyan-50/40',
        gradientColor: 'from-cyan-300 to-teal-300',
        emoji: '🔷',
      },
    ],
  },
  {
    id: 'grades-3-5',
    title: '🌿 Pequeños Científicos (3ro a 5to)',
    description: '¡Descubre el mundo de las ciencias y matemáticas!',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-green-400 to-emerald-400',
    glassColor: 'bg-green-50/30',
    games: [
      {
        id: 'blockly-bird',
        title: '🐦 Aventura del Pájaro',
        description: '¡Programa un pájaro para atrapar gusanos!',
        difficulty: 'intermediate',
        ageRange: '8-12',
        duration: '30-45 min',
        players: '1',
        type: 'programming',
        url: '/games/external?type=blockly&game=bird',
        tags: ['Aventura', 'Animales', 'Lógica'],
        rating: 4.7,
        plays: 15680,
        icon: <Blocks className="w-6 h-6" />,
        glassColor: 'bg-green-50/40',
        gradientColor: 'from-green-400 to-emerald-400',
        emoji: '🐦',
      },
      {
        id: 'forces-motion',
        title: '⚡ Fuerzas Mágicas',
        description: '¡Descubre cómo se mueven las cosas!',
        difficulty: 'beginner',
        ageRange: '8-11',
        duration: '20-30 min',
        players: '1',
        type: 'simulation',
        url: '/games/external?type=phet&sim=forces-and-motion-basics',
        tags: ['Física', 'Movimiento', 'Experimentos'],
        rating: 4.8,
        plays: 6789,
        icon: <Target className="w-6 h-6" />,
        glassColor: 'bg-emerald-50/40',
        gradientColor: 'from-emerald-400 to-teal-400',
        emoji: '⚡',
      },
      {
        id: 'phet-simulations',
        title: '🧪 Laboratorio Virtual',
        description: '¡Haz experimentos científicos increíbles!',
        difficulty: 'intermediate',
        ageRange: '8-12',
        duration: '15-30 min',
        players: '1',
        type: 'simulation',
        url: '/games/external?type=phet',
        tags: ['Experimentos', 'Ciencias', 'Laboratorio'],
        rating: 4.9,
        plays: 15420,
        icon: <Beaker className="w-6 h-6" />,
        glassColor: 'bg-teal-50/40',
        gradientColor: 'from-teal-400 to-cyan-400',
        emoji: '🧪',
      },
      {
        id: 'music-blocks',
        title: '🎵 Música y Matemáticas',
        description: '¡Crea música mientras aprendes matemáticas!',
        difficulty: 'intermediate',
        ageRange: '8-12',
        duration: '20-40 min',
        players: '1',
        type: 'music',
        url: '/games/external?type=music',
        tags: ['Música', 'Matemáticas', 'Creatividad'],
        rating: 4.7,
        plays: 8934,
        icon: <Music className="w-6 h-6" />,
        glassColor: 'bg-cyan-50/40',
        gradientColor: 'from-cyan-400 to-blue-400',
        emoji: '🎵',
      },
      {
        id: 'drag-drop-math',
        title: '📊 Clasificación de Números',
        description: '¡Arrastra números a sus casillas correctas!',
        difficulty: 'intermediate',
        ageRange: '8-11',
        duration: '15-25 min',
        players: '1',
        type: 'traditional',
        url: '/games/drag-drop',
        tags: ['Números', 'Clasificación', 'Interactivo'],
        rating: 4.6,
        plays: 11200,
        icon: <Trophy className="w-6 h-6" />,
        glassColor: 'bg-blue-50/40',
        gradientColor: 'from-blue-400 to-indigo-400',
        emoji: '📊',
      },
      {
        id: 'word-search',
        title: '🔍 Sopa de Letras Científica',
        description: '¡Encuentra palabras de ciencias!',
        difficulty: 'beginner',
        ageRange: '8-12',
        duration: '10-20 min',
        players: '1-2',
        type: 'traditional',
        url: '/games/word-search',
        tags: ['Palabras', 'Ciencias', 'Búsqueda'],
        rating: 4.5,
        plays: 8750,
        icon: <BookOpen className="w-6 h-6" />,
        glassColor: 'bg-indigo-50/40',
        gradientColor: 'from-indigo-400 to-purple-400',
        emoji: '🔍',
      },
      {
        id: 'crossword-science',
        title: '📝 Crucigrama Científico',
        description: '¡Resuelve crucigramas sobre ciencias!',
        difficulty: 'intermediate',
        ageRange: '9-12',
        duration: '15-25 min',
        players: '1-2',
        type: 'traditional',
        url: '/games/crossword',
        tags: ['Crucigrama', 'Ciencias', 'Puzzle'],
        rating: 4.6,
        plays: 7200,
        icon: <BookOpen className="w-6 h-6" />,
        glassColor: 'bg-purple-50/40',
        gradientColor: 'from-purple-400 to-pink-400',
        emoji: '📝',
      },
      {
        id: 'gap-fill-stories',
        title: '📖 Completar Historias',
        description: '¡Completa las historias con las palabras correctas!',
        difficulty: 'beginner',
        ageRange: '8-11',
        duration: '10-15 min',
        players: '1',
        type: 'traditional',
        url: '/games/gap-fill',
        tags: ['Historias', 'Lenguaje', 'Completar'],
        rating: 4.4,
        plays: 6800,
        icon: <BookOpen className="w-6 h-6" />,
        glassColor: 'bg-pink-50/40',
        gradientColor: 'from-pink-400 to-rose-400',
        emoji: '📖',
      },
    ],
  },
  {
    id: 'grades-6-8',
    title: '🌳 Jóvenes Exploradores (6to a 8vo)',
    description: '¡Explora el mundo con aventuras más emocionantes!',
    icon: <Trophy className="w-8 h-8" />,
    color: 'from-blue-400 to-cyan-400',
    glassColor: 'bg-blue-50/30',
    games: [
      {
        id: 'blockly-turtle',
        title: '🐢 Arte con Tortuga',
        description: '¡Crea arte increíble programando una tortuga!',
        difficulty: 'intermediate',
        ageRange: '10-14',
        duration: '30-60 min',
        players: '1',
        type: 'programming',
        url: '/games/external?type=blockly&game=turtle',
        tags: ['Arte', 'Programación', 'Creatividad'],
        rating: 4.8,
        plays: 18900,
        icon: <Blocks className="w-6 h-6" />,
        glassColor: 'bg-blue-50/40',
        gradientColor: 'from-blue-400 to-cyan-400',
        emoji: '🐢',
      },
      {
        id: 'math-solver',
        title: '🧮 Matemáticas Mágicas',
        description: '¡Resuelve problemas paso a paso!',
        difficulty: 'intermediate',
        ageRange: '11-14',
        duration: '15-25 min',
        players: '1',
        type: 'traditional',
        url: '/games/math-solver',
        tags: ['Matemáticas', 'Problemas', 'Soluciones'],
        rating: 4.6,
        plays: 12340,
        icon: <Trophy className="w-6 h-6" />,
        glassColor: 'bg-cyan-50/40',
        gradientColor: 'from-cyan-400 to-teal-400',
        emoji: '🧮',
      },
      {
        id: 'crossword-puzzle',
        title: '📝 Crucigrama de Ciencias',
        description: '¡Resuelve crucigramas sobre ciencias!',
        difficulty: 'intermediate',
        ageRange: '11-14',
        duration: '20-30 min',
        players: '1-2',
        type: 'traditional',
        url: '/games/crossword',
        tags: ['Ciencias', 'Vocabulario', 'Puzzle'],
        rating: 4.7,
        plays: 9450,
        icon: <BookOpen className="w-6 h-6" />,
        glassColor: 'bg-teal-50/40',
        gradientColor: 'from-teal-400 to-green-400',
        emoji: '📝',
      },
      {
        id: 'hotspot-anatomy',
        title: '🫀 Cuerpo Humano Interactivo',
        description: '¡Haz clic en las partes del cuerpo!',
        difficulty: 'intermediate',
        ageRange: '11-14',
        duration: '15-25 min',
        players: '1',
        type: 'traditional',
        url: '/games/hotspot',
        tags: ['Biología', 'Cuerpo', 'Interactivo'],
        rating: 4.8,
        plays: 11200,
        icon: <Target className="w-6 h-6" />,
        glassColor: 'bg-green-50/40',
        gradientColor: 'from-green-400 to-emerald-400',
        emoji: '🫀',
      },
      {
        id: 'timeline-history',
        title: '📅 Aventura en el Tiempo',
        description: '¡Ordena eventos históricos en secuencia!',
        difficulty: 'intermediate',
        ageRange: '11-14',
        duration: '20-30 min',
        players: '1-2',
        type: 'traditional',
        url: '/games/timeline',
        tags: ['Historia', 'Tiempo', 'Orden'],
        rating: 4.6,
        plays: 7800,
        icon: <Brain className="w-6 h-6" />,
        glassColor: 'bg-emerald-50/40',
        gradientColor: 'from-emerald-400 to-teal-400',
        emoji: '📅',
      },
      {
        id: 'image-sequence',
        title: '🖼️ Secuencia de Imágenes',
        description: '¡Ordena las imágenes en la secuencia correcta!',
        difficulty: 'intermediate',
        ageRange: '11-14',
        duration: '10-20 min',
        players: '1-2',
        type: 'traditional',
        url: '/games/image-sequence',
        tags: ['Imágenes', 'Secuencia', 'Lógica'],
        rating: 4.5,
        plays: 6500,
        icon: <Target className="w-6 h-6" />,
        glassColor: 'bg-teal-50/40',
        gradientColor: 'from-teal-400 to-cyan-400',
        emoji: '🖼️',
      },
      {
        id: 'short-answer-ai',
        title: '🤖 Preguntas con IA',
        description: '¡Responde preguntas y la IA te califica!',
        difficulty: 'intermediate',
        ageRange: '11-14',
        duration: '15-25 min',
        players: '1',
        type: 'traditional',
        url: '/games/short-answer',
        tags: ['IA', 'Preguntas', 'Respuestas'],
        rating: 4.7,
        plays: 8900,
        icon: <Brain className="w-6 h-6" />,
        glassColor: 'bg-cyan-50/40',
        gradientColor: 'from-cyan-400 to-blue-400',
        emoji: '🤖',
      },
      {
        id: 'colonial-zone-ar',
        title: '📱 Aventura Colonial AR',
        description: '¡Explora la historia dominicana con realidad aumentada!',
        difficulty: 'intermediate',
        ageRange: '12-15',
        duration: '30-45 min',
        players: '1-4',
        type: 'ar',
        url: '/games/external?type=ar',
        tags: ['Historia', 'AR', 'Aventura', 'RD'],
        rating: 4.9,
        plays: 5678,
        icon: <Camera className="w-6 h-6" />,
        glassColor: 'bg-blue-50/40',
        gradientColor: 'from-blue-400 to-indigo-400',
        emoji: '📱',
      },
    ],
  },
  {
    id: 'grades-9-12',
    title: '🏔️ Grandes Aventureros (9no a 12mo)',
    description: '¡Desafíos épicos para futuros universitarios!',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-purple-400 to-pink-400',
    glassColor: 'bg-purple-50/30',
    games: [
      {
        id: 'blockly-movie',
        title: '🎬 Creador de Películas',
        description: '¡Programa una película corta con actores!',
        difficulty: 'advanced',
        ageRange: '12-18',
        duration: '45-60 min',
        players: '1-2',
        type: 'programming',
        url: '/games/external?type=blockly&game=movie',
        tags: ['Películas', 'Programación', 'Creatividad'],
        rating: 4.8,
        plays: 12400,
        icon: <Blocks className="w-6 h-6" />,
        glassColor: 'bg-purple-50/40',
        gradientColor: 'from-purple-400 to-pink-400',
        emoji: '🎬',
      },
      {
        id: 'blockly-music',
        title: '🎵 Compositor Musical',
        description: '¡Crea música programando con bloques!',
        difficulty: 'advanced',
        ageRange: '12-18',
        duration: '30-60 min',
        players: '1',
        type: 'programming',
        url: '/games/external?type=blockly&game=music',
        tags: ['Música', 'Programación', 'Composición'],
        rating: 4.7,
        plays: 9800,
        icon: <Music className="w-6 h-6" />,
        glassColor: 'bg-pink-50/40',
        gradientColor: 'from-pink-400 to-rose-400',
        emoji: '🎵',
      },
      {
        id: 'code-challenge',
        title: '💻 Desafío de Programación',
        description: '¡Resuelve problemas de programación avanzada!',
        difficulty: 'advanced',
        ageRange: '14-18',
        duration: '20-45 min',
        players: '1',
        type: 'traditional',
        url: '/games/code-challenge',
        tags: ['Programación', 'Algoritmos', 'Desafío'],
        rating: 4.5,
        plays: 8765,
        icon: <Gamepad2 className="w-6 h-6" />,
        glassColor: 'bg-rose-50/40',
        gradientColor: 'from-rose-400 to-red-400',
        emoji: '💻',
      },
      {
        id: 'branching-scenario',
        title: '🌳 Aventura de Decisiones',
        description: '¡Elige tu propia aventura educativa!',
        difficulty: 'advanced',
        ageRange: '14-18',
        duration: '30-45 min',
        players: '1-4',
        type: 'traditional',
        url: '/games/branching-scenario',
        tags: ['Aventura', 'Decisiones', 'Narrativa'],
        rating: 4.6,
        plays: 7200,
        icon: <Brain className="w-6 h-6" />,
        glassColor: 'bg-red-50/40',
        gradientColor: 'from-red-400 to-orange-400',
        emoji: '🌳',
      },
      {
        id: 'mind-map',
        title: '🧠 Creador de Mapas Mentales',
        description: '¡Crea mapas conceptuales interactivos!',
        difficulty: 'advanced',
        ageRange: '14-18',
        duration: '25-40 min',
        players: '1-3',
        type: 'traditional',
        url: '/games/mind-map',
        tags: ['Conceptos', 'Visualización', 'Creatividad'],
        rating: 4.7,
        plays: 6500,
        icon: <Target className="w-6 h-6" />,
        glassColor: 'bg-orange-50/40',
        gradientColor: 'from-orange-400 to-yellow-400',
        emoji: '🧠',
      },
      {
        id: 'live-quiz',
        title: '⚡ Quiz en Vivo',
        description: '¡Competencia en tiempo real estilo Kahoot!',
        difficulty: 'advanced',
        ageRange: '14-18',
        duration: '15-30 min',
        players: '2-50',
        type: 'traditional',
        url: '/games/live-quiz',
        tags: ['Competencia', 'Tiempo Real', 'Diversión'],
        rating: 4.9,
        plays: 15200,
        icon: <Trophy className="w-6 h-6" />,
        glassColor: 'bg-yellow-50/40',
        gradientColor: 'from-yellow-400 to-amber-400',
        emoji: '⚡',
      },
      {
        id: 'team-challenge',
        title: '👥 Desafío en Equipo',
        description: '¡Colabora para resolver problemas complejos!',
        difficulty: 'advanced',
        ageRange: '14-18',
        duration: '45-60 min',
        players: '3-8',
        type: 'traditional',
        url: '/games/team-challenge',
        tags: ['Colaboración', 'Liderazgo', 'Equipo'],
        rating: 4.8,
        plays: 8900,
        icon: <Users className="w-6 h-6" />,
        glassColor: 'bg-amber-50/40',
        gradientColor: 'from-amber-400 to-orange-400',
        emoji: '👥',
      },
      {
        id: 'match-concepts',
        title: '🔗 Emparejador de Conceptos',
        description: '¡Conecta conceptos relacionados!',
        difficulty: 'advanced',
        ageRange: '14-18',
        duration: '20-30 min',
        players: '1-2',
        type: 'traditional',
        url: '/games/match',
        tags: ['Conceptos', 'Conexiones', 'Lógica'],
        rating: 4.6,
        plays: 7200,
        icon: <Target className="w-6 h-6" />,
        glassColor: 'bg-orange-50/40',
        gradientColor: 'from-orange-400 to-red-400',
        emoji: '🔗',
      },
      {
        id: 'true-false-advanced',
        title: '✅ Verdadero o Falso Avanzado',
        description: '¡Demuestra tus conocimientos con preguntas difíciles!',
        difficulty: 'advanced',
        ageRange: '14-18',
        duration: '15-25 min',
        players: '1-4',
        type: 'traditional',
        url: '/games/true-false',
        tags: ['Conocimientos', 'Verdadero/Falso', 'Desafío'],
        rating: 4.5,
        plays: 6800,
        icon: <Brain className="w-6 h-6" />,
        glassColor: 'bg-red-50/40',
        gradientColor: 'from-red-400 to-pink-400',
        emoji: '✅',
      },
    ],
  },
  {
    id: 'adult',
    title: '🎓 Aprendizaje Avanzado (18+ años)',
    description: '¡Desafíos profesionales y universitarios!',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-indigo-400 to-purple-400',
    glassColor: 'bg-indigo-50/30',
    games: [
      {
        id: 'advanced-programming',
        title: '💻 Programación Avanzada',
        description: '¡Desarrolla aplicaciones y algoritmos complejos!',
        difficulty: 'advanced',
        ageRange: '18+',
        duration: '60-120 min',
        players: '1-4',
        type: 'programming',
        url: '/games/external?type=programming&level=advanced',
        tags: ['Programación', 'Algoritmos', 'Desarrollo'],
        rating: 4.8,
        plays: 8900,
        icon: <Blocks className="w-6 h-6" />,
        glassColor: 'bg-indigo-50/40',
        gradientColor: 'from-indigo-400 to-purple-400',
        emoji: '💻',
      },
      {
        id: 'research-methods',
        title: '🔬 Métodos de Investigación',
        description: '¡Aprende metodologías científicas avanzadas!',
        difficulty: 'advanced',
        ageRange: '18+',
        duration: '45-90 min',
        players: '1-3',
        type: 'traditional',
        url: '/games/research-methods',
        tags: ['Investigación', 'Ciencia', 'Metodología'],
        rating: 4.7,
        plays: 5600,
        icon: <Beaker className="w-6 h-6" />,
        glassColor: 'bg-purple-50/40',
        gradientColor: 'from-purple-400 to-pink-400',
        emoji: '🔬',
      },
      {
        id: 'critical-thinking',
        title: '🧠 Pensamiento Crítico',
        description: '¡Desarrolla habilidades de análisis y evaluación!',
        difficulty: 'advanced',
        ageRange: '18+',
        duration: '30-60 min',
        players: '1-6',
        type: 'traditional',
        url: '/games/critical-thinking',
        tags: ['Lógica', 'Análisis', 'Evaluación'],
        rating: 4.6,
        plays: 7200,
        icon: <Brain className="w-6 h-6" />,
        glassColor: 'bg-pink-50/40',
        gradientColor: 'from-pink-400 to-rose-400',
        emoji: '🧠',
      },
      {
        id: 'leadership-simulation',
        title: '👥 Simulación de Liderazgo',
        description: '¡Practica habilidades de liderazgo y gestión!',
        difficulty: 'advanced',
        ageRange: '18+',
        duration: '60-90 min',
        players: '3-8',
        type: 'traditional',
        url: '/games/leadership',
        tags: ['Liderazgo', 'Gestión', 'Equipo'],
        rating: 4.9,
        plays: 4500,
        icon: <Users className="w-6 h-6" />,
        glassColor: 'bg-rose-50/40',
        gradientColor: 'from-rose-400 to-red-400',
        emoji: '👥',
      },
    ],
  },
];

export default function GamesPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showInstantGames, setShowInstantGames] = useState(true);
  const [showOrganizedView, setShowOrganizedView] = useState(false);

  const allGames = gradeLevels.flatMap((level) => level.games);

  const filteredLevels =
    selectedLevel === 'all'
      ? gradeLevels
      : gradeLevels.filter((level) => level.id === selectedLevel);

  const handleGameSelect = (game: any) => {
    // Aquí puedes manejar la selección del juego
    console.log('Game selected:', game);
    // Por ahora, redirigir a una página de juego demo
    router.push(`/games/${game.content?.type || 'quiz'}&id=${game.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100/30 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100/30 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-100/30 text-red-700 border-red-200';
      default:
        return 'bg-gray-100/30 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return difficulty;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'simulation':
        return <Beaker className="w-4 h-4" />;
      case 'programming':
        return <Blocks className="w-4 h-4" />;
      case 'music':
        return <Music className="w-4 h-4" />;
      case 'ar':
        return <Camera className="w-4 h-4" />;
      case 'traditional':
        return <Gamepad2 className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'simulation':
        return 'Simulación';
      case 'programming':
        return 'Programación';
      case 'music':
        return 'Música';
      case 'ar':
        return 'Realidad Aumentada';
      case 'traditional':
        return 'Tradicional';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
                🎮 Mundo de Juegos Educativos
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                ¡Más de 30 juegos divertidos organizados por edad!
              </p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-pink-600">
                  4
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Niveles</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  30+
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Juegos</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  4.8★
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Calificación
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Toggle between views */}
      <section className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-1 shadow-sm w-full max-w-md">
            <Button
              variant={!showOrganizedView ? 'default' : 'ghost'}
              onClick={() => setShowOrganizedView(false)}
              className="mr-1 flex-1 text-xs sm:text-sm touch-target"
            >
              <span className="hidden sm:inline">Vista por Grados</span>
              <span className="sm:hidden">Grados</span>
            </Button>
            <Button
              variant={showOrganizedView ? 'default' : 'ghost'}
              onClick={() => setShowOrganizedView(true)}
              className="ml-1 flex-1 text-xs sm:text-sm touch-target"
            >
              <span className="hidden sm:inline">Vista Organizada</span>
              <span className="sm:hidden">Organizada</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Juegos Instantáneos - Nueva Sección */}
      {showInstantGames && !showOrganizedView && (
        <section className="container mx-auto px-6 py-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  ⚡ Juegos Listos para Jugar
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Nuevo
                  </Badge>
                </h2>
                <p className="text-gray-600">
                  Juegos generados automáticamente, listos para jugar al
                  instante
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowInstantGames(false)}
                className="text-gray-500"
              >
                Ocultar
              </Button>
            </div>
            <InstantGameSelector onGameSelect={handleGameSelect} />
          </div>
        </section>
      )}

      {/* Vista Organizada */}
      {showOrganizedView && (
        <section className="container mx-auto px-6 py-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  📚 Juegos Organizados
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800"
                  >
                    Corregido
                  </Badge>
                </h2>
                <p className="text-gray-600">
                  Juegos organizados por materia y grado, con contenido validado
                </p>
              </div>
            </div>
            <OrganizedGameList />
          </div>
        </section>
      )}

      {/* Level Selector */}
      <section className="container mx-auto px-6 py-6">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <Button
              variant={selectedLevel === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedLevel('all')}
              className={`${
                selectedLevel === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/50 text-gray-700 hover:bg-purple-100'
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Todos los Grados
            </Button>
            {gradeLevels.map((level) => (
              <Button
                key={level.id}
                variant={selectedLevel === level.id ? 'default' : 'outline'}
                onClick={() => setSelectedLevel(level.id)}
                className={`${
                  selectedLevel === level.id
                    ? `bg-gradient-to-r ${level.color} text-white`
                    : 'bg-white/50 text-gray-700 hover:bg-purple-100'
                }`}
              >
                {level.icon}
                <span className="ml-2">{level.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Difficulty Levels */}
      <section className="container mx-auto px-6 pb-12">
        {filteredLevels.map((level) => (
          <div key={level.id} className="mb-12">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-r ${level.color} text-white shadow-lg`}
                >
                  {level.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {level.title}
                  </h2>
                  <p className="text-gray-600">{level.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {level.games.map((game) => (
                  <Card
                    key={game.id}
                    className={`group hover:scale-105 transition-all duration-300 cursor-pointer border-0 shadow-lg ${game.glassColor} backdrop-blur-sm`}
                    onClick={() => {
                      if (game.url.startsWith('http')) {
                        window.open(game.url, '_blank');
                      } else {
                        router.push(game.url);
                      }
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-3xl">{game.emoji}</div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{game.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                        {game.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {game.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge
                            className={getDifficultyColor(game.difficulty)}
                          >
                            {getDifficultyLabel(game.difficulty)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-white/50 text-gray-700"
                          >
                            {getTypeIcon(game.type)}
                            <span className="ml-1">
                              {getTypeLabel(game.type)}
                            </span>
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {game.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {game.players}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {game.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs bg-white/50"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {game.plays.toLocaleString()} jugadas
                          </span>
                          <Button
                            size="sm"
                            className={`bg-gradient-to-r ${game.gradientColor} text-white hover:opacity-90`}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Jugar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-pink-500/80 to-purple-500/80 backdrop-blur-sm text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¡Comienza tu aventura de aprendizaje!
          </h2>
          <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
            Más de 30 juegos divertidos organizados por edad, desde Pre-K hasta
            12mo grado. ¡Aprende jugando con contenido adaptado a tu nivel!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white/90 text-pink-600 hover:bg-white hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/games/external')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              🎮 Explorar Todos los Juegos
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
              onClick={() => router.push('/student')}
            >
              🏠 Volver al Dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
