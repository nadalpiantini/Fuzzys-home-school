'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ArrowLeft,
  Search,
  Filter,
  Book,
  Video,
  FileText,
  Image,
  Music,
  Code,
  Calculator,
  Globe,
  Microscope,
  Map,
  Palette,
  Gamepad2,
  MessageCircle,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const resources = [
  {
    id: 'math',
    title: 'Matemáticas',
    description: 'Álgebra, geometría, cálculo y más',
    icon: <Calculator className="w-6 h-6" />,
    color: 'bg-blue-500',
    items: [
      { name: 'Álgebra Básica', type: 'video', duration: '45 min' },
      { name: 'Geometría Euclidiana', type: 'book', pages: '120' },
      { name: 'Cálculo Diferencial', type: 'interactive', level: 'Avanzado' },
    ],
  },
  {
    id: 'science',
    title: 'Ciencias',
    description: 'Física, química, biología y ciencias naturales',
    icon: <Microscope className="w-6 h-6" />,
    color: 'bg-green-500',
    items: [
      { name: 'Fotosíntesis', type: 'simulation', duration: '30 min' },
      { name: 'Tabla Periódica', type: 'interactive', level: 'Intermedio' },
      { name: 'Leyes de Newton', type: 'video', duration: '60 min' },
    ],
  },
  {
    id: 'history',
    title: 'Historia',
    description: 'Historia universal, geografía y cultura',
    icon: <Globe className="w-6 h-6" />,
    color: 'bg-purple-500',
    items: [
      { name: 'Revolución Francesa', type: 'documentary', duration: '90 min' },
      { name: 'Mapas Históricos', type: 'interactive', level: 'Básico' },
      { name: 'Culturas Antiguas', type: 'book', pages: '200' },
    ],
  },
  {
    id: 'language',
    title: 'Lenguaje',
    description: 'Gramática, literatura y comunicación',
    icon: <Book className="w-6 h-6" />,
    color: 'bg-yellow-500',
    items: [
      { name: 'Gramática Española', type: 'interactive', level: 'Básico' },
      { name: 'Literatura Clásica', type: 'book', pages: '300' },
      { name: 'Ortografía', type: 'game', duration: '20 min' },
    ],
  },
  {
    id: 'arts',
    title: 'Artes',
    description: 'Música, pintura, escultura y expresión creativa',
    icon: <Palette className="w-6 h-6" />,
    color: 'bg-pink-500',
    items: [
      { name: 'Historia del Arte', type: 'video', duration: '75 min' },
      { name: 'Composición Musical', type: 'interactive', level: 'Intermedio' },
      { name: 'Técnicas de Pintura', type: 'tutorial', duration: '45 min' },
    ],
  },
  {
    id: 'programming',
    title: 'Programación',
    description: 'Código, algoritmos y desarrollo de software',
    icon: <Code className="w-6 h-6" />,
    color: 'bg-orange-500',
    items: [
      { name: 'Python Básico', type: 'interactive', level: 'Básico' },
      { name: 'Algoritmos', type: 'simulation', duration: '60 min' },
      { name: 'Desarrollo Web', type: 'tutorial', duration: '120 min' },
    ],
  },
];

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

export default function LibraryPage() {
  const { t, language } = useTranslation();
  const router = useRouter();

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
              <BookOpen className="w-8 h-8 text-fuzzy-purple" />
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'es' ? 'Biblioteca Digital' : 'Digital Library'}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'es'
                    ? 'Recursos educativos organizados por materia'
                    : 'Educational resources organized by subject'}
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuzzy-purple focus:border-transparent"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {language === 'es' ? 'Filtrar' : 'Filter'}
            </Button>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${resource.color} rounded-lg flex items-center justify-center text-white`}
                  >
                    {resource.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{resource.title}</h3>
                    <p className="text-sm text-gray-600">
                      {resource.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resource.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="text-gray-600">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{item.type}</span>
                          {item.duration && <span>• {item.duration}</span>}
                          {item.pages && <span>• {item.pages} páginas</span>}
                          {item.level && <span>• {item.level}</span>}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        {language === 'es' ? 'Abrir' : 'Open'}
                      </Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  {language === 'es'
                    ? 'Ver todos los recursos'
                    : 'View all resources'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Access */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            {language === 'es' ? 'Acceso Rápido' : 'Quick Access'}
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => router.push('/games')}
            >
              <Gamepad2 className="w-6 h-6" />
              <span className="text-sm">
                {language === 'es' ? 'Juegos' : 'Games'}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => router.push('/tutor')}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm">
                {language === 'es' ? 'Tutor IA' : 'AI Tutor'}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => router.push('/games/external')}
            >
              <Globe className="w-6 h-6" />
              <span className="text-sm">
                {language === 'es' ? 'Recursos Externos' : 'External Resources'}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => router.push('/colonial-rally')}
            >
              <Map className="w-6 h-6" />
              <span className="text-sm">
                {language === 'es' ? 'Rally Colonial' : 'Colonial Rally'}
              </span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
