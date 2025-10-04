'use client';

import { useState } from 'react';
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
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Search,
  Filter,
  Download,
  Star,
  Clock,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function ResourcesPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const resources = [
    {
      id: 1,
      title: 'Matemáticas Interactivas',
      category: 'math',
      type: 'lesson',
      rating: 4.8,
      downloads: 1250,
      description: 'Recursos interactivos para enseñar matemáticas básicas',
      url: 'https://math-interactive.com',
      tags: ['matemáticas', 'interactivo', 'básico'],
    },
    {
      id: 2,
      title: 'Ciencias Naturales - Experimentos',
      category: 'science',
      type: 'activity',
      rating: 4.6,
      downloads: 980,
      description: 'Colección de experimentos para ciencias naturales',
      url: 'https://science-experiments.com',
      tags: ['ciencias', 'experimentos', 'práctico'],
    },
    {
      id: 3,
      title: 'Lengua y Literatura',
      category: 'literacy',
      type: 'lesson',
      rating: 4.7,
      downloads: 1100,
      description: 'Materiales para enseñanza de lengua y literatura',
      url: 'https://literacy-materials.com',
      tags: ['lengua', 'literatura', 'lectura'],
    },
  ];

  const handleBack = () => {
    router.push('/teacher');
  };

  const handleUseResource = (resource: any) => {
    toast.success(
      language === 'es'
        ? `Abriendo ${resource.title}...`
        : `Opening ${resource.title}...`,
    );
    window.open(resource.url, '_blank');
  };

  const handleDownload = (resource: any) => {
    toast.success(
      language === 'es' ? 'Descargando recurso...' : 'Downloading resource...',
    );
    // TODO: Implement actual download
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es'
                  ? 'Recursos Educativos'
                  : 'Educational Resources'}
              </h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Volver' : 'Back'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuzzy-purple focus:border-transparent"
            >
              <option value="all">
                {language === 'es' ? 'Todas las categorías' : 'All Categories'}
              </option>
              <option value="math">
                {language === 'es' ? 'Matemáticas' : 'Math'}
              </option>
              <option value="science">
                {language === 'es' ? 'Ciencias' : 'Science'}
              </option>
              <option value="literacy">
                {language === 'es' ? 'Lengua' : 'Literacy'}
              </option>
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card
              key={resource.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <Badge variant="secondary">
                    {resource.type === 'lesson'
                      ? language === 'es'
                        ? 'Lección'
                        : 'Lesson'
                      : resource.type === 'activity'
                        ? language === 'es'
                          ? 'Actividad'
                          : 'Activity'
                        : resource.type}
                  </Badge>
                </div>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Rating and Downloads */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{resource.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{resource.downloads}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUseResource(resource)}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {language === 'es' ? 'Usar' : 'Use'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(resource)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {language === 'es'
                ? 'No se encontraron recursos'
                : 'No resources found'}
            </h3>
            <p className="text-gray-500">
              {language === 'es'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Try adjusting your search filters'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
