'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Import all the new components
import { TutorChat } from '@/components/tutor/TutorChat';
import { AdaptiveProgress } from '@/components/adaptive/AdaptiveProgress';
import { QuizGenerator } from '@/components/quiz/QuizGenerator';
import { H5PContainer } from '@/components/h5p/H5PContainer';
import { H5PLibrary } from '@/components/h5p/H5PLibrary';
import { LiveQuizRoom } from '@/components/games/LiveQuizRoom';

// Import H5P components from adapter
import { BranchingScenario, DragDropAdvanced } from '@fuzzy/h5p-adapter';

import { Brain, Target, MessageSquare, BookOpen, Users, Sparkles } from 'lucide-react';

// Mock data for demonstrations
const mockUserId = 'demo-user-123';

const mockH5PContent = {
  branching: {
    params: {
      title: 'Aventura en el Ecosistema',
      startingScreen: 'screen1',
      screens: [
        {
          id: 'screen1',
          content: '<h3>Descubrimiento en el Bosque</h3><p>Encuentras un animal herido en el bosque. ¿Qué decides hacer?</p>',
          choices: [
            {
              text: 'Ayudar al animal inmediatamente',
              nextScreen: 'screen2',
              feedback: 'Tu compasión es admirable, pero siempre es importante evaluar la situación primero.'
            },
            {
              text: 'Observar desde lejos para evaluar la situación',
              nextScreen: 'screen3',
              feedback: '¡Excelente! Siempre es mejor evaluar antes de actuar.'
            }
          ]
        },
        {
          id: 'screen2',
          content: '<h3>Acción Directa</h3><p>Te acercas al animal. Es un pequeño zorro con una pata lastimada.</p>',
          choices: [
            {
              text: 'Buscar ayuda de un veterinario',
              nextScreen: 'screen4'
            },
            {
              text: 'Intentar curarlo tú mismo',
              nextScreen: 'screen5'
            }
          ]
        },
        {
          id: 'screen3',
          content: '<h3>Observación Cuidadosa</h3><p>Desde una distancia segura, observas que es un zorro joven con dificultades para caminar.</p>',
          choices: [
            {
              text: 'Contactar a las autoridades de vida silvestre',
              nextScreen: 'screen4'
            }
          ]
        },
        {
          id: 'screen4',
          content: '<h3>Final: Decisión Responsable</h3><p>¡Excelente! Contactaste a los expertos. El zorro recibió el cuidado adecuado y se recuperó completamente. Aprendiste sobre la importancia de la responsabilidad ambiental.</p>',
          choices: []
        },
        {
          id: 'screen5',
          content: '<h3>Final: Buenas Intenciones</h3><p>Aunque tus intenciones eran buenas, el zorro necesitaba cuidado profesional. La próxima vez, recuerda que los expertos están mejor equipados para ayudar a la vida silvestre.</p>',
          choices: []
        }
      ]
    }
  },
  dragDrop: {
    params: {
      taskDescription: 'Arrastra cada animal a su hábitat correcto para completar el ecosistema.',
      dropzones: [
        {
          id: 'ocean',
          label: 'Océano',
          x: 10,
          y: 20,
          width: 35,
          height: 30,
          correctElements: ['dolphin', 'shark', 'whale']
        },
        {
          id: 'forest',
          label: 'Bosque',
          x: 55,
          y: 20,
          width: 35,
          height: 30,
          correctElements: ['bear', 'deer', 'owl']
        },
        {
          id: 'desert',
          label: 'Desierto',
          x: 10,
          y: 60,
          width: 35,
          height: 30,
          correctElements: ['camel', 'snake']
        },
        {
          id: 'arctic',
          label: 'Ártico',
          x: 55,
          y: 60,
          width: 35,
          height: 30,
          correctElements: ['penguin', 'polar_bear']
        }
      ],
      draggables: [
        { id: 'dolphin', type: 'text' as const, content: '🐬 Delfín', multiple: false },
        { id: 'shark', type: 'text' as const, content: '🦈 Tiburón', multiple: false },
        { id: 'whale', type: 'text' as const, content: '🐋 Ballena', multiple: false },
        { id: 'bear', type: 'text' as const, content: '🐻 Oso', multiple: false },
        { id: 'deer', type: 'text' as const, content: '🦌 Ciervo', multiple: false },
        { id: 'owl', type: 'text' as const, content: '🦉 Búho', multiple: false },
        { id: 'camel', type: 'text' as const, content: '🐪 Camello', multiple: false },
        { id: 'snake', type: 'text' as const, content: '🐍 Serpiente', multiple: false },
        { id: 'penguin', type: 'text' as const, content: '🐧 Pingüino', multiple: false },
        { id: 'polar_bear', type: 'text' as const, content: '🐻‍❄️ Oso Polar', multiple: false }
      ],
      feedback: {
        correct: '¡Excelente! Has colocado correctamente todos los animales en sus hábitats.',
        incorrect: 'Revisa las colocaciones. Algunos animales no están en su hábitat natural.'
      }
    }
  }
};

const mockH5PLibrary = [
  {
    id: 'ecosistemas-basico',
    type: 'QuestionSet',
    title: 'Ecosistemas Básicos',
    description: 'Aprende sobre diferentes ecosistemas y sus características',
    difficulty: 'beginner',
    subject: 'ciencias_naturales',
    estimatedTime: 10,
    rating: 4.5,
    completions: 234,
    tags: ['ecosistemas', 'naturaleza', 'medio ambiente']
  },
  {
    id: 'matematicas-fracciones',
    type: 'InteractiveVideo',
    title: 'Fracciones Divertidas',
    description: 'Video interactivo para aprender fracciones con ejemplos visuales',
    difficulty: 'intermediate',
    subject: 'matematicas',
    estimatedTime: 15,
    rating: 4.8,
    completions: 456,
    tags: ['fracciones', 'matemáticas', 'números']
  },
  {
    id: 'historia-colonizacion',
    type: 'Timeline',
    title: 'Colonización de América',
    description: 'Línea de tiempo interactiva de la colonización americana',
    difficulty: 'advanced',
    subject: 'ciencias_sociales',
    estimatedTime: 20,
    rating: 4.3,
    completions: 189,
    tags: ['historia', 'colonización', 'américa']
  }
];

export default function EducationalFeaturesDemo() {
  const [activeTab, setActiveTab] = useState('tutor');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  const handleQuizGenerated = (questions: any[]) => {
    setGeneratedQuestions(questions);
    console.log('Generated quiz questions:', questions);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Funciones Educativas Integradas</h1>
        <p className="text-gray-600">
          Demostración de todas las nuevas funciones educativas implementadas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="tutor" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Tutor IA
          </TabsTrigger>
          <TabsTrigger value="adaptive" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Adaptativo
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Quiz Gen
          </TabsTrigger>
          <TabsTrigger value="h5p" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            H5P
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Biblioteca
          </TabsTrigger>
          <TabsTrigger value="multiplayer" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Multijugador
          </TabsTrigger>
        </TabsList>

        {/* AI Tutor Tab */}
        <TabsContent value="tutor">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Chat del Tutor IA
                <Badge variant="secondary">DeepSeek Integration</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <TutorChat
                  subject="Ciencias Naturales"
                  studentProfile={{
                    grade: 4,
                    learningStyle: 'visual',
                    currentLevel: 'beginner',
                    strongAreas: ['observación', 'curiosidad'],
                    challengeAreas: ['análisis', 'síntesis']
                  }}
                />
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                <strong>Características:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Integración completa con DeepSeek AI</li>
                  <li>Contexto curricular dominicano</li>
                  <li>Seguimiento de sesiones en Supabase</li>
                  <li>Sugerencias de seguimiento inteligentes</li>
                  <li>Soporte para entrada de voz</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adaptive Learning Tab */}
        <TabsContent value="adaptive">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Motor de Aprendizaje Adaptativo
                <Badge variant="secondary">ZPD Algorithm</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdaptiveProgress
                userId={mockUserId}
                timeframe="month"
              />
              <div className="mt-4 p-3 bg-purple-50 rounded-lg text-sm">
                <strong>Algoritmos implementados:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Zona de Desarrollo Próximo (ZPD)</li>
                  <li>Repetición espaciada</li>
                  <li>Perfiles de aprendizaje personalizados</li>
                  <li>Análisis de rendimiento en tiempo real</li>
                  <li>Recomendaciones de dificultad dinámicas</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Generator Tab */}
        <TabsContent value="quiz">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  Generador de Quiz
                  <Badge variant="secondary">Bloom&apos;s Taxonomy</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuizGenerator
                  userId={mockUserId}
                  onQuizGenerated={handleQuizGenerated}
                />
              </CardContent>
            </Card>

            {generatedQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Generado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {generatedQuestions.slice(0, 3).map((q, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium mb-2">{q.question}</p>
                        {q.options && (
                          <div className="space-y-1">
                            {q.options.map((option: string, optIndex: number) => (
                              <div
                                key={optIndex}
                                className={`text-sm p-2 rounded ${
                                  optIndex === q.correctAnswer
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-50'
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* H5P Interactive Content Tab */}
        <TabsContent value="h5p">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Escenario Interactivo (Branching Scenario)
                  <Badge variant="secondary">H5P Component</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BranchingScenario
                  content={mockH5PContent.branching}
                  onEvent={(event) => console.log('H5P Event:', event)}
                  className="border rounded-lg"
                />
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm">
                  <strong>Funcionalidades:</strong> Navegación por decisiones, feedback inmediato, seguimiento de progreso, historial de decisiones
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Arrastrar y Soltar Avanzado
                  <Badge variant="secondary">H5P Component</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropAdvanced
                  content={mockH5PContent.dragDrop}
                  onEvent={(event) => console.log('H5P Drag Event:', event)}
                  className="border rounded-lg"
                />
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                  <strong>Funcionalidades:</strong> Zonas de arrastre personalizables, feedback visual, validación automática, puntuación
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* H5P Library Tab */}
        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Biblioteca de Contenido H5P
                <Badge variant="secondary">Content Management</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <H5PLibrary
                onContentComplete={(contentId, results) => console.log('Content completed:', contentId, results)}
                studentLevel="beginner"
                subject="Ciencias Naturales"
              />
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm">
                <strong>Sistema de gestión:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Filtrado por materia, dificultad y tipo</li>
                  <li>Sistema de calificaciones y reviews</li>
                  <li>Estadísticas de completación</li>
                  <li>Etiquetas y categorización</li>
                  <li>Almacenamiento en Supabase</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multiplayer Tab */}
        <TabsContent value="multiplayer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Sistema Multijugador
                <Badge variant="secondary">WebSocket + Supabase</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LiveQuizRoom
                roomId="demo-room-123"
                player={{
                  id: mockUserId,
                  name: "Demo Student",
                  avatar: "/avatars/student.png"
                }}
              />
              <div className="mt-4 p-3 bg-orange-50 rounded-lg text-sm">
                <strong>Características multijugador:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>WebSocket en tiempo real con Socket.io</li>
                  <li>Salas de juego con hasta 20 jugadores</li>
                  <li>Chat en vivo durante las partidas</li>
                  <li>Leaderboard dinámico</li>
                  <li>Persistencia en Supabase</li>
                  <li>Analíticas de participación</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resumen de Integración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Tecnologías Principales</h3>
              <ul className="text-sm space-y-1">
                <li>• DeepSeek AI para tutoring</li>
                <li>• WebSocket para tiempo real</li>
                <li>• Supabase para persistencia</li>
                <li>• H5P para contenido interactivo</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Funciones Educativas</h3>
              <ul className="text-sm space-y-1">
                <li>• Aprendizaje adaptativo</li>
                <li>• Generación automática de quiz</li>
                <li>• Tutoring conversacional</li>
                <li>• Juegos multijugador</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Curriculum Dominicano</h3>
              <ul className="text-sm space-y-1">
                <li>• Matemáticas por grados</li>
                <li>• Ciencias Naturales</li>
                <li>• Lengua Española</li>
                <li>• Ciencias Sociales</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}