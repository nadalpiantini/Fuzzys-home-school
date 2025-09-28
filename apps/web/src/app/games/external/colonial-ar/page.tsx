'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  MapPin,
  Play,
  Target,
  Clock,
  Users,
  Star,
  Filter,
  Search,
  Camera,
  Navigation,
  Trophy,
  History,
  Globe,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ColonialZoneAR,
  COLONIAL_SITES,
  ARExperienceMode,
} from '@fuzzy/vr-ar-adapter';

export default function ColonialARGames() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<ARExperienceMode | null>(
    null,
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [enableGPS, setEnableGPS] = useState(false);

  const categories = [
    'religious',
    'governmental',
    'residential',
    'defensive',
    'cultural',
  ];
  const yearRanges = [
    '1500-1520',
    '1520-1540',
    '1540-1560',
    '1560-1580',
    '1580-1600',
  ];

  const categoryLabels = {
    religious: language === 'es' ? 'Religioso' : 'Religious',
    governmental: language === 'es' ? 'Gubernamental' : 'Governmental',
    residential: language === 'es' ? 'Residencial' : 'Residential',
    defensive: language === 'es' ? 'Defensivo' : 'Defensive',
    cultural: language === 'es' ? 'Cultural' : 'Cultural',
  };

  const modeLabels = {
    exploration: language === 'es' ? 'Exploración Libre' : 'Free Exploration',
    'treasure-hunt':
      language === 'es' ? 'Búsqueda del Tesoro' : 'Treasure Hunt',
    'time-travel': language === 'es' ? 'Viaje en el Tiempo' : 'Time Travel',
    'quiz-challenge':
      language === 'es' ? 'Desafío de Historia' : 'History Challenge',
  };

  const modeDescriptions = {
    exploration:
      language === 'es'
        ? 'Explora los sitios históricos a tu propio ritmo'
        : 'Explore historical sites at your own pace',
    'treasure-hunt':
      language === 'es'
        ? 'Encuentra pistas históricas siguiendo un mapa del tesoro'
        : 'Find historical clues following a treasure map',
    'time-travel':
      language === 'es'
        ? 'Viaja a través del tiempo y ve cómo era la ciudad'
        : 'Travel through time and see how the city was',
    'quiz-challenge':
      language === 'es'
        ? 'Demuestra tus conocimientos históricos en desafíos'
        : 'Test your historical knowledge in challenges',
  };

  // Filter sites based on search and filters
  const filteredSites = Object.entries(COLONIAL_SITES).filter(([_, site]) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || site.category === filterCategory;
    const matchesYear =
      filterYear === 'all' ||
      (site.yearBuilt >= parseInt(filterYear.split('-')[0]) &&
        site.yearBuilt <= parseInt(filterYear.split('-')[1]));

    return matchesSearch && matchesCategory && matchesYear;
  });

  const handleModeSelect = (mode: ARExperienceMode) => {
    setSelectedMode(mode);
  };

  const handleBack = () => {
    if (selectedMode) {
      setSelectedMode(null);
    } else {
      router.back();
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      religious: '⛪',
      governmental: '🏛️',
      residential: '🏠',
      defensive: '🏰',
      cultural: '🎭',
    };
    return icons[category as keyof typeof icons] || '🏛️';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      religious: 'bg-blue-100 text-blue-800',
      governmental: 'bg-purple-100 text-purple-800',
      residential: 'bg-green-100 text-green-800',
      defensive: 'bg-red-100 text-red-800',
      cultural: 'bg-yellow-100 text-yellow-800',
    };
    return (
      colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    );
  };

  if (selectedMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'es' ? 'Volver' : 'Back'}
              </Button>
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-amber-600" />
                <div>
                  <h1 className="text-2xl font-bold">
                    {modeLabels[selectedMode]}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Zona Colonial AR Experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* AR Experience */}
        <main className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* AR Experience */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    {language === 'es' ? 'Experiencia AR' : 'AR Experience'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ColonialZoneAR
                    mode={selectedMode}
                    studentId="demo-student"
                    onEvent={(event) => console.log('AR Event:', event)}
                    onComplete={(data) => console.log('AR Complete:', data)}
                    onError={(error) => console.error('AR Error:', error)}
                    language="es"
                    enableGPS={enableGPS}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              {/* Mode Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {language === 'es' ? 'Instrucciones' : 'Instructions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {modeDescriptions[selectedMode]}
                  </p>
                  <div className="text-sm space-y-2">
                    <p>• Apunta tu cámara a los marcadores AR</p>
                    <p>• Toca los elementos 3D para más información</p>
                    <p>• Escucha las grabaciones de audio</p>
                    <p>• Toma capturas para tu portafolio</p>
                  </div>
                </CardContent>
              </Card>

              {/* GPS Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    {language === 'es' ? 'Configuración GPS' : 'GPS Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {language === 'es' ? 'Ubicación GPS' : 'GPS Location'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {language === 'es'
                          ? 'Usar ubicación real para experiencia inmersiva'
                          : 'Use real location for immersive experience'}
                      </p>
                    </div>
                    <Button
                      variant={enableGPS ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEnableGPS(!enableGPS)}
                    >
                      {enableGPS ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {language === 'es'
                      ? 'Consejos de Seguridad'
                      : 'Safety Tips'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p>• Mantente consciente de tu entorno</p>
                    <p>• No uses AR en calles transitadas</p>
                    <p>• Asegúrate de tener buena iluminación</p>
                    <p>• Mantén tu dispositivo estable</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
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
              <MapPin className="w-8 h-8 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'es'
                    ? 'AR Colonial Rally'
                    : 'Colonial AR Rally'}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'es'
                    ? 'Explora la Zona Colonial con realidad aumentada'
                    : 'Explore the Colonial Zone with augmented reality'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                {language === 'es'
                  ? 'Acerca de la Zona Colonial'
                  : 'About the Colonial Zone'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {language === 'es'
                  ? 'La Zona Colonial de Santo Domingo fue la primera ciudad europea en América, fundada en 1496. Sus edificaciones representan más de 500 años de historia y son Patrimonio de la Humanidad de la UNESCO desde 1990.'
                  : 'The Colonial Zone of Santo Domingo was the first European city in America, founded in 1496. Its buildings represent more than 500 years of history and are a UNESCO World Heritage Site since 1990.'}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es' ? 'Historia Viva' : 'Living History'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Más de 500 años de historia colonial'
                      : 'More than 500 years of colonial history'}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es'
                      ? 'Realidad Aumentada'
                      : 'Augmented Reality'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Modelos 3D y contenido interactivo'
                      : '3D models and interactive content'}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es'
                      ? 'Patrimonio UNESCO'
                      : 'UNESCO Heritage'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Patrimonio de la Humanidad desde 1990'
                      : 'World Heritage Site since 1990'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Experience Modes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {language === 'es' ? 'Modos de Experiencia' : 'Experience Modes'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(modeLabels).map(([mode, label]) => (
              <Card
                key={mode}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => handleModeSelect(mode as ARExperienceMode)}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-white mx-auto mb-3">
                      {mode === 'exploration' && <Globe className="w-6 h-6" />}
                      {mode === 'treasure-hunt' && (
                        <Trophy className="w-6 h-6" />
                      )}
                      {mode === 'time-travel' && (
                        <History className="w-6 h-6" />
                      )}
                      {mode === 'quiz-challenge' && (
                        <Target className="w-6 h-6" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{label}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {modeDescriptions[mode as keyof typeof modeDescriptions]}
                    </p>
                    <Button size="sm" className="w-full">
                      <Play className="w-3 h-3 mr-2" />
                      {language === 'es' ? 'Comenzar' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Historical Sites */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {language === 'es' ? 'Sitios Históricos' : 'Historical Sites'}
          </h2>

          {/* Filters */}
          <div className="mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder={
                        language === 'es'
                          ? 'Buscar sitios...'
                          : 'Search sites...'
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">
                        {language === 'es'
                          ? 'Todas las categorías'
                          : 'All categories'}
                      </option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {
                            categoryLabels[
                              category as keyof typeof categoryLabels
                            ]
                          }
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">
                        {language === 'es' ? 'Todos los años' : 'All years'}
                      </option>
                      {yearRanges.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sites Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map(([siteId, site]) => (
              <Card key={siteId} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getCategoryIcon(site.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{site.name}</h3>
                      <p className="text-sm text-gray-600">
                        {site.description}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getCategoryColor(site.category)}>
                        {
                          categoryLabels[
                            site.category as keyof typeof categoryLabels
                          ]
                        }
                      </Badge>
                      <Badge variant="outline">{site.yearBuilt}</Badge>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700 text-sm">
                        {language === 'es'
                          ? 'Estilo arquitectónico:'
                          : 'Architectural style:'}
                      </span>
                      <p className="text-sm text-gray-600">
                        {site.architecturalStyle}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700 text-sm">
                        {language === 'es' ? 'Datos curiosos:' : 'Fun facts:'}
                      </span>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        {site.funFacts.slice(0, 2).map((fact, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-amber-500 mt-1">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSites.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {language === 'es'
                  ? 'No se encontraron sitios'
                  : 'No sites found'}
              </h3>
              <p className="text-gray-500">
                {language === 'es'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Try adjusting your search filters'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
