'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { H5PContainer } from './H5PContainer';
import type { H5PContent } from '@/types/workspace';

interface H5PLibraryProps {
  onContentComplete?: (contentId: string, results: any) => void;
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
  subject?: string;
  className?: string;
}

interface H5PContentItem extends H5PContent {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subject: string;
  estimatedTime: number; // minutes
  rating: number;
  completions: number;
  language?: string;
  type: string;
  content: any;
  tags: string[];
  completed?: boolean;
}

export const H5PLibrary: React.FC<H5PLibraryProps> = ({
  onContentComplete,
  studentLevel,
  subject,
  className = '',
}) => {
  const [contents, setContents] = useState<H5PContentItem[]>([]);
  const [filteredContents, setFilteredContents] = useState<H5PContentItem[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{
    difficulty: string[];
    subject: string[];
    type: string[];
  }>({
    difficulty: [],
    subject: [],
    type: [],
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedContent, setSelectedContent] = useState<H5PContentItem | null>(
    null,
  );

  useEffect(() => {
    // Load H5P contents - in production this would come from API
    const sampleContents: H5PContentItem[] = [
      {
        id: 'drag-drop-animals',
        library: 'H5P.DragDropAdvanced',
        type: 'drag_drop_advanced',
        title: 'Clasificación de Animales',
        description: 'Arrastra los animales a sus hábitats correctos',
        language: 'es',
        content: {},
        params: {
          taskDescription: 'Arrastra cada animal a su hábitat natural',
          dropzones: [
            {
              id: 'ocean',
              label: 'Océano',
              x: 10,
              y: 20,
              width: 30,
              height: 25,
              correctElements: ['whale', 'dolphin', 'shark'],
            },
            {
              id: 'forest',
              label: 'Bosque',
              x: 60,
              y: 20,
              width: 30,
              height: 25,
              correctElements: ['bear', 'owl', 'deer'],
            },
            {
              id: 'savanna',
              label: 'Sabana',
              x: 10,
              y: 60,
              width: 30,
              height: 25,
              correctElements: ['lion', 'elephant', 'giraffe'],
            },
          ],
          draggables: [
            {
              id: 'whale',
              type: 'image',
              content: '/images/animals/whale.png',
              multiple: false,
            },
            {
              id: 'dolphin',
              type: 'image',
              content: '/images/animals/dolphin.png',
              multiple: false,
            },
            {
              id: 'bear',
              type: 'image',
              content: '/images/animals/bear.png',
              multiple: false,
            },
            {
              id: 'lion',
              type: 'image',
              content: '/images/animals/lion.png',
              multiple: false,
            },
            {
              id: 'elephant',
              type: 'image',
              content: '/images/animals/elephant.png',
              multiple: false,
            },
            {
              id: 'owl',
              type: 'image',
              content: '/images/animals/owl.png',
              multiple: false,
            },
          ],
          feedback: {
            correct: '¡Excelente! Has clasificado correctamente los animales.',
            incorrect:
              'Algunos animales no están en el lugar correcto. Inténtalo de nuevo.',
          },
        },
        difficulty: 'beginner',
        subject: 'Ciencias Naturales',
        estimatedTime: 8,
        rating: 4.5,
        completions: 1250,
        tags: ['animales', 'hábitats', 'clasificación', 'biología'],
      },
      {
        id: 'hotspot-human-body',
        library: 'H5P.HotspotImage',
        type: 'hotspot_image',
        title: 'El Cuerpo Humano',
        description: 'Explora los sistemas del cuerpo humano',
        language: 'es',
        content: {},
        params: {
          image: {
            url: '/images/human-body.png',
            alt: 'Diagrama del cuerpo humano',
          },
          hotspots: [
            {
              id: 'heart',
              x: 50,
              y: 35,
              content: {
                header: 'El Corazón',
                text: 'El corazón es un músculo que bombea sangre por todo el cuerpo. Late aproximadamente 100,000 veces al día.',
                image: '/images/heart-detail.png',
              },
            },
            {
              id: 'lungs',
              x: 45,
              y: 30,
              content: {
                header: 'Los Pulmones',
                text: 'Los pulmones nos permiten respirar. Intercambian oxígeno y dióxido de carbono con la sangre.',
                image: '/images/lungs-detail.png',
              },
            },
            {
              id: 'brain',
              x: 50,
              y: 15,
              content: {
                header: 'El Cerebro',
                text: 'El cerebro controla todo nuestro cuerpo. Es el centro de nuestros pensamientos y emociones.',
                image: '/images/brain-detail.png',
              },
            },
          ],
        },
        difficulty: 'intermediate',
        subject: 'Ciencias Naturales',
        estimatedTime: 12,
        rating: 4.8,
        completions: 890,
        tags: ['cuerpo humano', 'anatomía', 'sistemas', 'salud'],
      },
      {
        id: 'story-branch-adventure',
        library: 'H5P.BranchingScenario',
        type: 'branching_scenario',
        title: 'Aventura en la Selva',
        description: 'Toma decisiones en esta aventura interactiva',
        language: 'es',
        content: {},
        params: {
          title: 'Aventura en la Selva Amazónica',
          startingScreen: 'start',
          screens: [
            {
              id: 'start',
              content:
                '<p>Te encuentras en la entrada de una selva tropical. Escuchas sonidos extraños a la distancia. ¿Qué decides hacer?</p>',
              choices: [
                {
                  text: 'Seguir el sendero principal',
                  nextScreen: 'main_path',
                  feedback: 'El sendero principal suele ser más seguro',
                },
                {
                  text: 'Explorar por el bosque',
                  nextScreen: 'forest_explore',
                  feedback:
                    'La exploración puede ser arriesgada pero emocionante',
                },
                {
                  text: 'Buscar un guía local',
                  nextScreen: 'find_guide',
                  feedback: 'Los guías locales conocen mejor la zona',
                },
              ],
            },
            {
              id: 'main_path',
              content:
                '<p>Caminas por el sendero y encuentras un río cristalino. Ves peces de colores nadando.</p>',
              choices: [
                {
                  text: 'Tomar fotos de los peces',
                  nextScreen: 'photo_fish',
                },
                {
                  text: 'Continuar caminando',
                  nextScreen: 'continue_walk',
                },
              ],
            },
            {
              id: 'photo_fish',
              content:
                '<p>¡Excelente! Has documentado especies únicas. Los científicos valorarán estas fotos.</p>',
              choices: [],
            },
          ],
        },
        difficulty: 'beginner',
        subject: 'Lengua Española',
        estimatedTime: 15,
        rating: 4.3,
        completions: 2100,
        tags: ['lectura', 'decisiones', 'aventura', 'comprensión'],
      },
    ];

    setContents(sampleContents);
    setFilteredContents(sampleContents);
  }, []);

  useEffect(() => {
    // Filter contents based on search and filters
    let filtered = contents;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (content) =>
          content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (content.description || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          content.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    // Difficulty filter
    if (selectedFilters.difficulty.length > 0) {
      filtered = filtered.filter((content) =>
        selectedFilters.difficulty.includes(content.difficulty),
      );
    }

    // Subject filter
    if (selectedFilters.subject.length > 0) {
      filtered = filtered.filter((content) =>
        selectedFilters.subject.includes(content.subject),
      );
    }

    // Type filter
    if (selectedFilters.type.length > 0) {
      filtered = filtered.filter(
        (content) =>
          content.type && selectedFilters.type.includes(content.type),
      );
    }

    // Auto-filter by student level if provided
    if (studentLevel && selectedFilters.difficulty.length === 0) {
      filtered = filtered.filter(
        (content) => content.difficulty === studentLevel,
      );
    }

    // Auto-filter by subject if provided
    if (subject && selectedFilters.subject.length === 0) {
      filtered = filtered.filter((content) => content.subject === subject);
    }

    setFilteredContents(filtered);
  }, [searchQuery, selectedFilters, contents, studentLevel, subject]);

  const handleFilterToggle = (
    filterType: keyof typeof selectedFilters,
    value: string,
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((v) => v !== value)
        : [...prev[filterType], value],
    }));
  };

  const handleContentComplete = (contentId: string, results: any) => {
    // Update completion status
    setContents((prev) =>
      prev.map((content) =>
        content.id === contentId ? { ...content, completed: true } : content,
      ),
    );

    if (onContentComplete) {
      onContentComplete(contentId, results);
    }

    // Go back to library
    setSelectedContent(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      drag_drop_advanced: 'Arrastrar y Soltar',
      hotspot_image: 'Imagen Interactiva',
      branching_scenario: 'Escenario Ramificado',
    };
    return labels[type] || type;
  };

  if (selectedContent) {
    return (
      <div className={className}>
        <div className="mb-4">
          <Button variant="outline" onClick={() => setSelectedContent(null)}>
            ← Volver a la Biblioteca
          </Button>
        </div>
        <H5PContainer
          content={selectedContent}
          onComplete={(results) =>
            handleContentComplete(selectedContent.id, results)
          }
        />
      </div>
    );
  }

  return (
    <div className={`h5p-library ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Biblioteca H5P</h2>
          <p className="text-gray-600 mt-1">
            Contenido interactivo para aprender jugando
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar contenido interactivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filtros:</span>
          </div>

          {/* Difficulty filters */}
          {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
            <Button
              key={difficulty}
              variant={
                selectedFilters.difficulty.includes(difficulty)
                  ? 'default'
                  : 'outline'
              }
              size="sm"
              onClick={() => handleFilterToggle('difficulty', difficulty)}
              className="text-xs"
            >
              {difficulty === 'beginner'
                ? 'Principiante'
                : difficulty === 'intermediate'
                  ? 'Intermedio'
                  : 'Avanzado'}
            </Button>
          ))}

          {/* Subject filters */}
          {[
            'Ciencias Naturales',
            'Matemáticas',
            'Lengua Española',
            'Historia',
          ].map((subj) => (
            <Button
              key={subj}
              variant={
                selectedFilters.subject.includes(subj) ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => handleFilterToggle('subject', subj)}
              className="text-xs"
            >
              {subj}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Grid/List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {filteredContents.map((content) => (
          <Card
            key={content.id}
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              viewMode === 'list' ? 'flex items-center p-4' : 'p-4'
            }`}
            onClick={() => setSelectedContent(content)}
          >
            {viewMode === 'grid' ? (
              <div>
                {/* Content thumbnail/icon */}
                <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-blue-600" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {content.title}
                    </h3>
                    {content.completed && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {content.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(content.difficulty)}`}
                    >
                      {content.difficulty === 'beginner'
                        ? 'Principiante'
                        : content.difficulty === 'intermediate'
                          ? 'Intermedio'
                          : 'Avanzado'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                      {getTypeLabel(content.type)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {content.estimatedTime} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {content.completions.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-yellow-500" />
                      {content.rating}
                    </div>
                  </div>

                  <Button className="w-full" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Comenzar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {content.title}
                    </h3>
                    {content.completed && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {content.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full ${getDifficultyColor(content.difficulty)}`}
                    >
                      {content.difficulty === 'beginner'
                        ? 'Principiante'
                        : content.difficulty === 'intermediate'
                          ? 'Intermedio'
                          : 'Avanzado'}
                    </span>
                    <span>{content.subject}</span>
                    <span>{content.estimatedTime} min</span>
                    <span>{content.rating} ★</span>
                  </div>
                </div>

                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Jugar
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredContents.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No se encontró contenido
          </h3>
          <p className="text-gray-500">
            Intenta ajustar los filtros o términos de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};
