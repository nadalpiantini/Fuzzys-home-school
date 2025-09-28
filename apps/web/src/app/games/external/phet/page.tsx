'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Atom,
  Play,
  BookOpen,
  Target,
  Clock,
  Users,
  Star,
  Filter,
  Search,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PhETSimulation, PHET_SIMULATIONS } from '@fuzzy/simulation-engine';

export default function PhETGames() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [selectedSim, setSelectedSim] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const subjects = ['Física', 'Química', 'Biología', 'Matemáticas'];
  const gradeLevels = ['3-5', '6-8', '9-12'];

  // Filter simulations based on search and filters
  const filteredSimulations = Object.entries(PHET_SIMULATIONS).filter(
    ([_, sim]) => {
      const matchesSearch =
        sim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sim.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject =
        filterSubject === 'all' || sim.subjects.includes(filterSubject);
      const matchesGrade =
        filterGrade === 'all' ||
        sim.gradeLevel.includes(filterGrade.split('-')[0]);

      return matchesSearch && matchesSubject && matchesGrade;
    },
  );

  const handleSimulationSelect = (simId: string) => {
    setSelectedSim(simId);
  };

  const handleBack = () => {
    if (selectedSim) {
      setSelectedSim(null);
    } else {
      router.back();
    }
  };

  if (selectedSim) {
    const simulation = PHET_SIMULATIONS[selectedSim];
    if (!simulation) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Simulación no encontrada
            </h1>
            <Button onClick={handleBack}>Volver</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
                <Atom className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">{simulation.title}</h1>
                  <p className="text-sm text-gray-600">
                    PhET Interactive Simulation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Simulation Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Simulation */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    {language === 'es'
                      ? 'Simulación Interactiva'
                      : 'Interactive Simulation'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PhETSimulation
                    simId={selectedSim}
                    studentId="demo-student"
                    onEvent={(event) => console.log('PhET Event:', event)}
                    onComplete={(data) => console.log('PhET Complete:', data)}
                    onError={(error) => console.error('PhET Error:', error)}
                    showInfo={true}
                    autoStart={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              {/* Learning Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {language === 'es'
                      ? 'Objetivos de Aprendizaje'
                      : 'Learning Goals'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {simulation.learningGoals.map((goal, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Simulation Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {language === 'es' ? 'Información' : 'Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Grado:</span>
                    <div className="mt-1">
                      <Badge variant="secondary">{simulation.gradeLevel}</Badge>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Materias:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {simulation.subjects.map((subject, index) => (
                        <Badge key={index} variant="outline">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Temas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {simulation.topics.map((topic, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">
                      Accesibilidad:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {simulation.accessibility.screenReader && (
                        <Badge variant="outline" className="text-xs">
                          🔊 Lector de pantalla
                        </Badge>
                      )}
                      {simulation.accessibility.keyboard && (
                        <Badge variant="outline" className="text-xs">
                          ⌨️ Teclado
                        </Badge>
                      )}
                      {simulation.accessibility.sound && (
                        <Badge variant="outline" className="text-xs">
                          🔈 Audio
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {language === 'es' ? 'Consejos' : 'Tips'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p>
                      • Experimenta con diferentes valores para ver cómo cambian
                      los resultados
                    </p>
                    <p>
                      • Usa los controles para hacer predicciones antes de
                      observar
                    </p>
                    <p>
                      • Observa los gráficos y tablas para entender las
                      relaciones
                    </p>
                    <p>
                      • No tengas miedo de probar configuraciones "incorrectas"
                    </p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
              <Atom className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'es' ? 'Simulaciones PhET' : 'PhET Simulations'}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'es'
                    ? 'Simulaciones científicas interactivas de la Universidad de Colorado'
                    : 'Interactive science simulations from University of Colorado'}
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
                <Atom className="h-6 w-6" />
                {language === 'es' ? 'Acerca de PhET' : 'About PhET'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {language === 'es'
                  ? 'PhET Interactive Simulations es un proyecto de la Universidad de Colorado Boulder que crea simulaciones matemáticas y científicas gratuitas. Estas simulaciones están diseñadas para hacer el aprendizaje más intuitivo y divertido.'
                  : 'PhET Interactive Simulations is a project from University of Colorado Boulder that creates free math and science simulations. These simulations are designed to make learning more intuitive and fun.'}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es' ? 'Ciencias' : 'Sciences'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Física, química, biología y matemáticas'
                      : 'Physics, chemistry, biology and mathematics'}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es' ? 'Accesibilidad' : 'Accessibility'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Soporte para lectores de pantalla y navegación por teclado'
                      : 'Screen reader and keyboard navigation support'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es' ? 'Investigación' : 'Research'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Basado en investigación educativa'
                      : 'Based on educational research'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                        ? 'Buscar simulaciones...'
                        : 'Search simulations...'
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">
                      {language === 'es'
                        ? 'Todas las materias'
                        : 'All subjects'}
                    </option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">
                      {language === 'es' ? 'Todos los grados' : 'All grades'}
                    </option>
                    {gradeLevels.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simulations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSimulations.map(([simId, simulation]) => (
            <Card
              key={simId}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              onClick={() => handleSimulationSelect(simId)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <Atom className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {simulation.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {simulation.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {simulation.subjects.map((subject, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{simulation.gradeLevel}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {simulation.topics.length} temas
                      </Badge>
                    </div>

                    <Button size="sm" className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {language === 'es' ? 'Abrir' : 'Open'}
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500">
                    {simulation.learningGoals.length} objetivos de aprendizaje
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSimulations.length === 0 && (
          <div className="text-center py-12">
            <Atom className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {language === 'es'
                ? 'No se encontraron simulaciones'
                : 'No simulations found'}
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
