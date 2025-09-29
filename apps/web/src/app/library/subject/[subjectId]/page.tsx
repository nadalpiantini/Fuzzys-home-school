'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Search,
  Filter,
  Book,
  Video,
  FileText,
  Microscope,
  Calculator,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';

interface SubjectPageProps {
  params: {
    subjectId: string;
  };
}

const subjectResources: { [key: string]: any[] } = {
  math: [
    {
      name: 'Álgebra Básica',
      type: 'video',
      duration: '45 min',
      level: 'Básico',
    },
    {
      name: 'Geometría Euclidiana',
      type: 'book',
      pages: '120',
      level: 'Intermedio',
    },
    {
      name: 'Cálculo Diferencial',
      type: 'interactive',
      duration: '60 min',
      level: 'Avanzado',
    },
    {
      name: 'Trigonometría',
      type: 'simulation',
      duration: '30 min',
      level: 'Intermedio',
    },
    {
      name: 'Estadística',
      type: 'interactive',
      duration: '45 min',
      level: 'Intermedio',
    },
  ],
  science: [
    {
      name: 'Fotosíntesis',
      type: 'simulation',
      duration: '30 min',
      level: 'Básico',
    },
    {
      name: 'Tabla Periódica',
      type: 'interactive',
      duration: '20 min',
      level: 'Intermedio',
    },
    {
      name: 'Leyes de Newton',
      type: 'video',
      duration: '60 min',
      level: 'Intermedio',
    },
    { name: 'Química Orgánica', type: 'book', pages: '150', level: 'Avanzado' },
    {
      name: 'Biología Celular',
      type: 'simulation',
      duration: '40 min',
      level: 'Intermedio',
    },
  ],
  history: [
    {
      name: 'Revolución Francesa',
      type: 'documentary',
      duration: '90 min',
      level: 'Intermedio',
    },
    {
      name: 'Mapas Históricos',
      type: 'interactive',
      duration: '25 min',
      level: 'Básico',
    },
    {
      name: 'Culturas Antiguas',
      type: 'book',
      pages: '200',
      level: 'Intermedio',
    },
    {
      name: 'Guerras Mundiales',
      type: 'video',
      duration: '120 min',
      level: 'Avanzado',
    },
    {
      name: 'Historia de América',
      type: 'interactive',
      duration: '50 min',
      level: 'Intermedio',
    },
  ],
  language: [
    {
      name: 'Gramática Española',
      type: 'interactive',
      duration: '30 min',
      level: 'Básico',
    },
    {
      name: 'Literatura Clásica',
      type: 'book',
      pages: '300',
      level: 'Avanzado',
    },
    { name: 'Ortografía', type: 'game', duration: '20 min', level: 'Básico' },
    {
      name: 'Redacción',
      type: 'interactive',
      duration: '40 min',
      level: 'Intermedio',
    },
    {
      name: 'Análisis Literario',
      type: 'book',
      pages: '180',
      level: 'Avanzado',
    },
  ],
  arts: [
    {
      name: 'Historia del Arte',
      type: 'video',
      duration: '75 min',
      level: 'Intermedio',
    },
    {
      name: 'Composición Musical',
      type: 'interactive',
      duration: '35 min',
      level: 'Intermedio',
    },
    {
      name: 'Técnicas de Pintura',
      type: 'tutorial',
      duration: '45 min',
      level: 'Básico',
    },
    {
      name: 'Escultura',
      type: 'video',
      duration: '50 min',
      level: 'Intermedio',
    },
    {
      name: 'Dibujo Técnico',
      type: 'interactive',
      duration: '40 min',
      level: 'Intermedio',
    },
  ],
  programming: [
    {
      name: 'Python Básico',
      type: 'interactive',
      duration: '60 min',
      level: 'Básico',
    },
    {
      name: 'Algoritmos',
      type: 'simulation',
      duration: '60 min',
      level: 'Intermedio',
    },
    {
      name: 'Desarrollo Web',
      type: 'tutorial',
      duration: '120 min',
      level: 'Intermedio',
    },
    {
      name: 'Estructuras de Datos',
      type: 'interactive',
      duration: '45 min',
      level: 'Avanzado',
    },
    {
      name: 'Base de Datos',
      type: 'tutorial',
      duration: '90 min',
      level: 'Intermedio',
    },
  ],
};

const getSubjectInfo = (id: string) => {
  const subjects: {
    [key: string]: {
      title: string;
      description: string;
      color: string;
      icon: React.ReactNode;
    };
  } = {
    math: {
      title: 'Matemáticas',
      description: 'Álgebra, geometría, cálculo y más',
      color: 'bg-blue-500',
      icon: <Calculator className="w-6 h-6" />,
    },
    science: {
      title: 'Ciencias',
      description: 'Física, química, biología y ciencias naturales',
      color: 'bg-green-500',
      icon: <Microscope className="w-6 h-6" />,
    },
    history: {
      title: 'Historia',
      description: 'Historia universal, geografía y cultura',
      color: 'bg-purple-500',
      icon: <Book className="w-6 h-6" />,
    },
    language: {
      title: 'Lenguaje',
      description: 'Gramática, literatura y comunicación',
      color: 'bg-yellow-500',
      icon: <Book className="w-6 h-6" />,
    },
    arts: {
      title: 'Artes',
      description: 'Música, pintura, escultura y expresión creativa',
      color: 'bg-pink-500',
      icon: <Book className="w-6 h-6" />,
    },
    programming: {
      title: 'Programación',
      description: 'Código, algoritmos y desarrollo de software',
      color: 'bg-orange-500',
      icon: <FileText className="w-6 h-6" />,
    },
  };
  return (
    subjects[id] || {
      title: 'Materia',
      description: 'Recursos educativos',
      color: 'bg-gray-500',
      icon: <Book className="w-6 h-6" />,
    }
  );
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'book':
      return <Book className="w-4 h-4" />;
    case 'interactive':
      return <FileText className="w-4 h-4" />;
    case 'simulation':
      return <Microscope className="w-4 h-4" />;
    case 'game':
      return <Calculator className="w-4 h-4" />;
    case 'documentary':
      return <Video className="w-4 h-4" />;
    case 'tutorial':
      return <FileText className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

export default function SubjectPage({ params }: SubjectPageProps) {
  const { language } = useTranslation();
  const router = useRouter();
  const { subjectId } = params;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const subjectInfo = getSubjectInfo(subjectId);
  const resources = subjectResources[subjectId] || [];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLevel =
      selectedLevel === 'all' || resource.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleResourceOpen = (resourceName: string) => {
    router.push(
      `/library/resource/${subjectId}/${encodeURIComponent(resourceName)}`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'es' ? 'Volver' : 'Back'}
            </Button>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${subjectInfo.color} rounded-lg flex items-center justify-center text-white`}
              >
                {subjectInfo.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{subjectInfo.title}</h1>
                <p className="text-sm text-gray-600">
                  {subjectInfo.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={
                  language === 'es'
                    ? 'Buscar recursos...'
                    : 'Search resources...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuzzy-purple focus:border-transparent"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuzzy-purple focus:border-transparent"
            >
              <option value="all">
                {language === 'es' ? 'Todos los niveles' : 'All levels'}
              </option>
              <option value="Básico">
                {language === 'es' ? 'Básico' : 'Beginner'}
              </option>
              <option value="Intermedio">
                {language === 'es' ? 'Intermedio' : 'Intermediate'}
              </option>
              <option value="Avanzado">
                {language === 'es' ? 'Avanzado' : 'Advanced'}
              </option>
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <Card key={index} className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="text-gray-600">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{resource.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{resource.type}</span>
                      {resource.duration && <span>• {resource.duration}</span>}
                      {resource.pages && (
                        <span>• {resource.pages} páginas</span>
                      )}
                      {resource.level && <span>• {resource.level}</span>}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => handleResourceOpen(resource.name)}
                >
                  {language === 'es' ? 'Abrir' : 'Open'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {language === 'es'
                ? 'No se encontraron recursos con los filtros aplicados'
                : 'No resources found with the applied filters'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
