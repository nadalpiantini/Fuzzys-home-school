import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Plus,
  Sparkles,
} from 'lucide-react';
import { gameFactory } from '@/lib/game-factory/factory';
import { aiGameGenerator } from '@/lib/game-factory/ai-generator';
import { normalizeDifficulty } from '@/lib/game-factory/utils';
import {
  BaseGame,
  GameType,
  Subject,
  GradeLevel,
  Difficulty,
  Category,
  AllOr,
  SUBJECTS,
  SUBJECT_LABELS,
  GRADE_LEVELS,
  GRADE_LABELS,
} from '@/lib/game-factory/types';
import GameTypeSelector from './GameTypeSelector';

interface EnhancedGameListProps {
  onGameSelect: (game: BaseGame) => void;
  onCreateGame: (gameType: GameType) => void;
}

export default function EnhancedGameList({
  onGameSelect,
  onCreateGame,
}: EnhancedGameListProps) {
  const [games, setGames] = React.useState<BaseGame[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] =
    React.useState<AllOr<Category>>('all');
  const [selectedSubject, setSelectedSubject] =
    React.useState<AllOr<Subject>>('all');
  const [selectedGrade, setSelectedGrade] =
    React.useState<AllOr<GradeLevel>>('all');
  const [selectedDifficulty, setSelectedDifficulty] =
    React.useState<AllOr<Difficulty>>('all');
  const [showGameTypeSelector, setShowGameTypeSelector] = React.useState(false);

  React.useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      // This would normally fetch from the database
      // For now, generate some sample games
      const sampleGames = generateSampleGames();
      setGames(sampleGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleGames = (): BaseGame[] => {
    const gameTypes: GameType[] = [
      'multiple-choice',
      'drag-drop',
      'memory-cards',
      'blockly-puzzle',
      'physics-sim',
      'music-blocks',
      'story-creator',
      'ar-explorer',
      'vocabulary-builder',
      'coding-challenge',
      'discussion-forum',
    ];

    return gameTypes.map((type, index) => {
      const game = gameFactory.createGame(type, {
        subject: ['math', 'science', 'language', 'history'][index % 4],
        grade: ['K-2', '3-5', '6-8', '9-12'][index % 4],
        difficulty: ['beginner', 'intermediate', 'advanced'][index % 3],
        theme: 'sample',
        aiGenerated: false,
      });

      // Add some variety to the sample games
      game.plays = Math.floor(Math.random() * 1000) + 100;
      game.rating = 4.0 + Math.random() * 1.0;

      return game;
    });
  };

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || game.type.includes(selectedCategory);
    const matchesSubject =
      selectedSubject === 'all' || game.subject === selectedSubject;
    const matchesGrade =
      selectedGrade === 'all' || game.grade === selectedGrade;
    const matchesDifficulty =
      selectedDifficulty === 'all'
        ? true
        : normalizeDifficulty(game.difficulty as Difficulty) ===
          normalizeDifficulty(selectedDifficulty);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSubject &&
      matchesGrade &&
      matchesDifficulty
    );
  });

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
  ];

  const subjects = ['all', ...SUBJECTS];
  const grades = ['all', ...GRADE_LEVELS];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (showGameTypeSelector) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Crear Nuevo Juego
          </h2>
          <Button
            variant="outline"
            onClick={() => setShowGameTypeSelector(false)}
          >
            ← Volver a Juegos
          </Button>
        </div>
        <GameTypeSelector
          onGameSelect={(gameType) => {
            onCreateGame(gameType);
            setShowGameTypeSelector(false);
          }}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Juegos Educativos
          </h2>
          <p className="text-gray-600">
            {filteredGames.length} juegos disponibles
          </p>
        </div>
        <Button
          onClick={() => setShowGameTypeSelector(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Juego
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar juegos..."
                className="pl-10"
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

        {/* Filter Chips */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    setSelectedCategory(category.id as AllOr<Category>)
                  }
                  className="flex items-center gap-2"
                >
                  {category.icon}
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Materia
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={selectedSubject}
                onChange={(e) =>
                  setSelectedSubject(e.target.value as AllOr<Subject>)
                }
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject === 'all'
                      ? 'Todas'
                      : SUBJECT_LABELS[subject as Subject]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Grado
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={selectedGrade}
                onChange={(e) =>
                  setSelectedGrade(e.target.value as AllOr<GradeLevel>)
                }
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade === 'all' ? 'Todos' : GRADE_LABELS[grade as GradeLevel]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Dificultad
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={selectedDifficulty}
                onChange={(e) =>
                  setSelectedDifficulty(e.target.value as AllOr<Difficulty>)
                }
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'Todas' : difficulty}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedSubject('all');
                  setSelectedGrade('all');
                  setSelectedDifficulty('all');
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-600">Cargando juegos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <Card
              key={game.id}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-105"
              onClick={() => onGameSelect(game)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                    {getTypeIcon(game.type)}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {game.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                  {game.title}
                </CardTitle>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {game.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(game.difficulty)}>
                      {game.difficulty}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-white/50 text-gray-700"
                    >
                      {game.subject}
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
                    {game.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs bg-purple-50 text-purple-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {game.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{game.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {game.plays.toLocaleString()} jugadas
                    </span>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                    >
                      <Gamepad2 className="w-4 h-4 mr-1" />
                      Jugar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredGames.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No se encontraron juegos</p>
            <p className="text-sm">
              Intenta cambiar los filtros o crear un nuevo juego
            </p>
          </div>
          <Button
            onClick={() => setShowGameTypeSelector(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Crear Primer Juego
          </Button>
        </div>
      )}
    </div>
  );
}
