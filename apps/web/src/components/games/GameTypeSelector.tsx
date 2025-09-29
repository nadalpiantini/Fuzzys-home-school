import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { gameFactory } from '@/lib/game-factory/factory';
import { GameType } from '@/lib/game-factory/types';

// Tipos específicos para los filtros
type Subject =
  | 'math'
  | 'science'
  | 'language'
  | 'history'
  | 'geography'
  | 'art'
  | 'music'
  | 'programming'
  | 'literature'
  | 'grammar'
  | 'creativity'
  | 'physics'
  | 'chemistry'
  | 'anatomy'
  | 'logic'
  | 'spatial'
  | 'geometry'
  | 'vocabulary'
  | 'computer-science'
  | 'philosophy'
  | 'general';
type GradeLevel =
  | 'prek'
  | 'k'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12';
type Difficulty =
  | 'easy'
  | 'medium'
  | 'hard'
  | 'beginner'
  | 'intermediate'
  | 'advanced';
type Category =
  | 'Assessment'
  | 'Interactive'
  | 'Programming'
  | 'Creative'
  | 'Simulation'
  | 'AR/VR'
  | 'Language'
  | 'STEM'
  | 'Social'
  | 'Gamification';
import {
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Brain,
  Gamepad2,
  Music,
  Beaker,
  Camera,
  Code,
  BookOpen,
  Target,
  Zap,
} from 'lucide-react';

// Helper genérico anti-"never"
function includesIfNotAll<T extends string>(arr: readonly T[], val: T | 'all') {
  return val === 'all' || arr.includes(val);
}

interface GameTypeSelectorProps {
  onGameSelect: (gameType: GameType) => void;
  selectedSubject?: 'all' | Subject;
  selectedGrade?: 'all' | GradeLevel;
  selectedDifficulty?: 'all' | Difficulty;
}

export default function GameTypeSelector({
  onGameSelect,
  selectedSubject = 'all',
  selectedGrade = 'all',
  selectedDifficulty = 'all',
}: GameTypeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Category>(
    'all',
  );

  const templates = gameFactory.getTemplates();

  // Opciones tipadas con as const para inferencia de literales
  const SUBJECT_OPTIONS = [
    'math',
    'science',
    'language',
    'history',
    'geography',
    'art',
    'music',
    'programming',
    'literature',
    'grammar',
    'creativity',
    'physics',
    'chemistry',
    'anatomy',
    'logic',
    'spatial',
    'geometry',
    'vocabulary',
    'computer-science',
    'philosophy',
    'general',
  ] as const satisfies readonly Subject[];

  const GRADE_OPTIONS = [
    'prek',
    'k',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ] as const satisfies readonly GradeLevel[];

  const DIFFICULTY_OPTIONS = [
    'easy',
    'medium',
    'hard',
    'beginner',
    'intermediate',
    'advanced',
  ] as const satisfies readonly Difficulty[];

  const CATEGORY_OPTIONS = [
    'Assessment',
    'Interactive',
    'Programming',
    'Creative',
    'Simulation',
    'AR/VR',
    'Language',
    'STEM',
    'Social',
    'Gamification',
  ] as const satisfies readonly Category[];

  const categories = [
    { id: 'all', name: 'Todos', icon: <Gamepad2 className="w-4 h-4" /> },
    {
      id: 'Assessment',
      name: 'Evaluación',
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: 'Interactive',
      name: 'Interactivo',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'Programming',
      name: 'Programación',
      icon: <Code className="w-4 h-4" />,
    },
    { id: 'Creative', name: 'Creativo', icon: <Music className="w-4 h-4" /> },
    {
      id: 'Simulation',
      name: 'Simulación',
      icon: <Beaker className="w-4 h-4" />,
    },
    { id: 'AR/VR', name: 'AR/VR', icon: <Camera className="w-4 h-4" /> },
    { id: 'Language', name: 'Idiomas', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'STEM', name: 'STEM', icon: <Brain className="w-4 h-4" /> },
    { id: 'Social', name: 'Social', icon: <Users className="w-4 h-4" /> },
    {
      id: 'Gamification',
      name: 'Gamificación',
      icon: <Star className="w-4 h-4" />,
    },
  ];

  const getTypeIcon = (type: GameType) => {
    const icons: Partial<Record<GameType, React.ReactNode>> = {
      'multiple-choice': <Target className="w-5 h-5" />,
      'true-false': <Target className="w-5 h-5" />,
      'fill-blank': <BookOpen className="w-5 h-5" />,
      'short-answer': <BookOpen className="w-5 h-5" />,
      'drag-drop': <Zap className="w-5 h-5" />,
      hotspot: <Target className="w-5 h-5" />,
      sequence: <Clock className="w-5 h-5" />,
      matching: <Zap className="w-5 h-5" />,
      'memory-cards': <Brain className="w-5 h-5" />,
      'blockly-puzzle': <Code className="w-5 h-5" />,
      'blockly-maze': <Code className="w-5 h-5" />,
      'scratch-project': <Code className="w-5 h-5" />,
      'turtle-blocks': <Code className="w-5 h-5" />,
      'music-blocks': <Music className="w-5 h-5" />,
      'story-creator': <BookOpen className="w-5 h-5" />,
      'art-generator': <Music className="w-5 h-5" />,
      'poetry-maker': <BookOpen className="w-5 h-5" />,
      'physics-sim': <Beaker className="w-5 h-5" />,
      'chemistry-lab': <Beaker className="w-5 h-5" />,
      'math-visualizer': <Brain className="w-5 h-5" />,
      'geography-explorer': <Target className="w-5 h-5" />,
      'ar-explorer': <Camera className="w-5 h-5" />,
      'vr-classroom': <Camera className="w-5 h-5" />,
      'mixed-reality': <Camera className="w-5 h-5" />,
      'adaptive-quiz': <Brain className="w-5 h-5" />,
      competition: <Star className="w-5 h-5" />,
      collaborative: <Users className="w-5 h-5" />,
      'peer-review': <Users className="w-5 h-5" />,
      'vocabulary-builder': <BookOpen className="w-5 h-5" />,
      pronunciation: <BookOpen className="w-5 h-5" />,
      conversation: <Users className="w-5 h-5" />,
      'grammar-practice': <BookOpen className="w-5 h-5" />,
      'coding-challenge': <Code className="w-5 h-5" />,
      'robotics-sim': <Code className="w-5 h-5" />,
      'data-analysis': <Brain className="w-5 h-5" />,
      'experiment-design': <Beaker className="w-5 h-5" />,
      'discussion-forum': <Users className="w-5 h-5" />,
      'peer-teaching': <Users className="w-5 h-5" />,
      'group-project': <Users className="w-5 h-5" />,
      presentation: <Users className="w-5 h-5" />,
      'achievement-system': <Star className="w-5 h-5" />,
      leaderboard: <Star className="w-5 h-5" />,
      'quest-chain': <Star className="w-5 h-5" />,
      'badge-collection': <Star className="w-5 h-5" />,
    };
    return icons[type] || <Gamepad2 className="w-5 h-5" />;
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSubject = includesIfNotAll(
      template.subjects as readonly Subject[],
      selectedSubject,
    );
    const matchesGrade = includesIfNotAll(
      template.ageRange as readonly GradeLevel[],
      selectedGrade,
    );
    const matchesDifficulty = includesIfNotAll(
      (template.features ?? []) as readonly Difficulty[],
      selectedDifficulty,
    );

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSubject &&
      matchesGrade &&
      matchesDifficulty
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar tipos de juegos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Game Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.type}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-105"
            onClick={() => onGameSelect(template.type)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                  {getTypeIcon(template.type)}
                </div>
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
              </div>
              <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                {template.name}
              </CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">
                {template.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {template.ageRange}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {template.subjects.length} materias
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 3).map((feature) => (
                    <Badge
                      key={feature}
                      variant="outline"
                      className="text-xs bg-purple-50 text-purple-700"
                    >
                      {feature}
                    </Badge>
                  ))}
                  {template.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.features.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>4.5</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                  >
                    <Gamepad2 className="w-4 h-4 mr-1" />
                    Crear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No se encontraron tipos de juegos</p>
            <p className="text-sm">Intenta cambiar los filtros</p>
          </div>
        </div>
      )}
    </div>
  );
}
