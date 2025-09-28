'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  ArrowLeft,
  Atom,
  Blocks,
  Music,
  MapPin,
  Globe,
  Code,
  Microscope,
  Play,
  BookOpen,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const externalResources = [
  {
    id: 'phet',
    name: 'PhET Interactive Simulations',
    description:
      'Simulaciones científicas interactivas de la Universidad de Colorado',
    icon: <Atom className="w-8 h-8" />,
    color: 'bg-blue-500',
    status: 'available',
    url: 'https://phet.colorado.edu/',
    subjects: ['Física', 'Química', 'Biología', 'Matemáticas'],
  },
  {
    id: 'blockly',
    name: 'Blockly',
    description: 'Editor visual de programación para aprender a codificar',
    icon: <Blocks className="w-8 h-8" />,
    color: 'bg-orange-500',
    status: 'available',
    url: 'https://developers.google.com/blockly',
    subjects: ['Programación', 'Lógica', 'Algoritmos'],
  },
  {
    id: 'music-blocks',
    name: 'Music Blocks',
    description: 'Crea música usando programación visual',
    icon: <Music className="w-8 h-8" />,
    color: 'bg-purple-500',
    status: 'available',
    url: 'https://musicblocks.sugarlabs.org/',
    subjects: ['Música', 'Programación', 'Creatividad'],
  },
  {
    id: 'colonial-ar',
    name: 'AR Colonial Rally',
    description: 'Exploración de la Zona Colonial con realidad aumentada',
    icon: <MapPin className="w-8 h-8" />,
    color: 'bg-green-500',
    status: 'available',
    url: '/colonial-rally',
    subjects: ['Historia', 'Geografía', 'Cultura'],
  },
  {
    id: 'scratch',
    name: 'Scratch',
    description: 'Plataforma de programación visual para niños',
    icon: <Code className="w-8 h-8" />,
    color: 'bg-yellow-500',
    status: 'available',
    url: 'https://scratch.mit.edu/',
    subjects: ['Programación', 'Creatividad', 'Lógica'],
  },
  {
    id: 'khan-academy',
    name: 'Khan Academy',
    description: 'Plataforma educativa gratuita con miles de recursos',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'bg-red-500',
    status: 'available',
    url: 'https://es.khanacademy.org/',
    subjects: ['Matemáticas', 'Ciencias', 'Historia', 'Arte'],
  },
];

export default function ExternalGames() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  const handleResourceClick = (resource: any) => {
    if (resource.status === 'available') {
      if (resource.url.startsWith('/')) {
        router.push(resource.url);
      } else {
        window.open(resource.url, '_blank');
      }
    }
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
              <Globe className="w-8 h-8 text-fuzzy-purple" />
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'es'
                    ? 'Recursos Externos'
                    : 'External Resources'}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'es'
                    ? 'Herramientas educativas de terceros integradas'
                    : 'Integrated third-party educational tools'}
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
                <ExternalLink className="h-6 w-6" />
                {language === 'es'
                  ? 'Herramientas Educativas Externas'
                  : 'External Educational Tools'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {language === 'es'
                  ? 'Accede a las mejores herramientas educativas del mundo, cuidadosamente seleccionadas y organizadas para tu aprendizaje.'
                  : "Access the world's best educational tools, carefully selected and organized for your learning."}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es'
                      ? 'Simulaciones Interactivas'
                      : 'Interactive Simulations'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Aprende ciencias con simulaciones de PhET'
                      : 'Learn science with PhET simulations'}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es'
                      ? 'Programación Visual'
                      : 'Visual Programming'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Aprende a programar con Blockly y Scratch'
                      : 'Learn programming with Blockly and Scratch'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'es'
                      ? 'Creatividad Musical'
                      : 'Musical Creativity'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'es'
                      ? 'Crea música con Music Blocks'
                      : 'Create music with Music Blocks'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {externalResources.map((resource) => (
            <Card
              key={resource.id}
              className={`card-hover cursor-pointer transition-all ${
                resource.status === 'available'
                  ? 'hover:shadow-lg hover:scale-105'
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => handleResourceClick(resource)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 ${resource.color} rounded-lg flex items-center justify-center text-white`}
                  >
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{resource.name}</h3>
                    <p className="text-sm text-gray-600">
                      {resource.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {resource.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        resource.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {resource.status === 'available'
                        ? language === 'es'
                          ? 'Disponible'
                          : 'Available'
                        : language === 'es'
                          ? 'Próximamente'
                          : 'Coming Soon'}
                    </span>

                    {resource.status === 'available' && (
                      <Button size="sm" className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {language === 'es' ? 'Abrir' : 'Open'}
                      </Button>
                    )}
                  </div>
                </div>
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
              <Play className="w-6 h-6" />
              <span className="text-sm">
                {language === 'es' ? 'Juegos Internos' : 'Internal Games'}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => router.push('/library')}
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-sm">
                {language === 'es' ? 'Biblioteca' : 'Library'}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => router.push('/tutor')}
            >
              <Microscope className="w-6 h-6" />
              <span className="text-sm">
                {language === 'es' ? 'Tutor IA' : 'AI Tutor'}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => router.push('/student')}
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-sm">
                {language === 'es' ? 'Dashboard' : 'Dashboard'}
              </span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
