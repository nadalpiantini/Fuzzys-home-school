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
import {
  Brain,
  BookOpen,
  Gamepad2,
  Trophy,
  Calendar,
  TrendingUp,
  MessageCircle,
  Target,
  Sparkles,
  Atom,
  Blocks,
  Music,
  MapPin,
  Settings,
  LogOut,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChildProfile } from '@/hooks/useChildProfile';
import ChildOnboarding from '@/components/onboarding/ChildOnboarding';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const {
    childData,
    isLoading,
    saveChildData,
    getGreeting,
    getPersonalizedGames,
    getAgeAppropriateLevel,
  } = useChildProfile();
  const [streak, setStreak] = useState(7);
  const [points, setPoints] = useState(1250);

  // Mostrar onboarding si no está completo
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-600">Cargando tu mundo de juegos...</p>
        </div>
      </div>
    );
  }

  if (!childData || !childData.isOnboardingComplete) {
    return <ChildOnboarding onComplete={saveChildData} />;
  }

  // Handler functions for different actions
  const handleAskTutor = () => {
    toast.info(
      language === 'es' ? 'Abriendo tutor IA...' : 'Opening AI tutor...',
    );
    router.push('/tutor');
  };

  const handlePlayGames = () => {
    toast.info(language === 'es' ? 'Cargando juegos...' : 'Loading games...');
    router.push('/games');
  };

  const handleExploreLibrary = () => {
    toast.info(
      language === 'es' ? 'Abriendo biblioteca...' : 'Opening library...',
    );
    router.push('/library');
  };

  const handleStartGeographyChallenge = () => {
    toast.success(
      language === 'es'
        ? 'Iniciando reto de geografía...'
        : 'Starting geography challenge...',
    );
    router.push('/games?type=geography');
  };

  const handleStartMathProblem = () => {
    toast.success(
      language === 'es'
        ? 'Iniciando problema de matemáticas...'
        : 'Starting math problem...',
    );
    router.push('/games?type=math');
  };

  const handleViewAllResources = () => {
    toast.info(
      language === 'es'
        ? 'Mostrando todos los recursos...'
        : 'Showing all resources...',
    );
    router.push('/games');
  };

  const getAvatarEmoji = (avatar: string) => {
    const avatars: { [key: string]: string } = {
      cat: '🐱',
      dog: '🐶',
      bunny: '🐰',
      bear: '🐻',
      bird: '🐦',
      butterfly: '🦋',
    };
    return avatars[avatar] || '👶';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Mobile-Friendly Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="text-2xl">
                {childData?.avatar ? getAvatarEmoji(childData.avatar) : '👶'}
              </div>
              <div>
                <h1 className="text-lg font-bold text-pink-600">Mi Mundo</h1>
                <p className="text-xs text-gray-500">Juegos Divertidos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-700">
                  {points}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  {streak}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section - Mobile Friendly */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 mb-4">
            <h2 className="text-2xl font-bold mb-2 text-pink-700">
              {getGreeting()}{' '}
              {childData?.avatar ? getAvatarEmoji(childData.avatar) : '👋'}
            </h2>
            <p className="text-pink-600">
              ¡Tu mundo de juegos te está esperando!
            </p>
          </div>
        </div>

        {/* Quick Actions - Mobile Friendly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card
            className="card-hover cursor-pointer bg-gradient-to-br from-purple-500 to-purple-600 text-white"
            onClick={handleAskTutor}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-6 h-6" />
                <h3 className="font-bold text-lg">🤖 Tutor IA</h3>
              </div>
              <p className="text-purple-100 text-sm mb-3">
                ¡Pregúntame cualquier cosa!
              </p>
              <div className="text-center">
                <span className="text-purple-200 text-sm">
                  Toca para preguntar
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="card-hover cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white"
            onClick={handlePlayGames}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Gamepad2 className="w-6 h-6" />
                <h3 className="font-bold text-lg">🎮 Juegos</h3>
              </div>
              <p className="text-green-100 text-sm mb-3">
                ¡Más de 30 juegos divertidos!
              </p>
              <div className="text-center">
                <span className="text-green-200 text-sm">Toca para jugar</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="card-hover cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            onClick={handleExploreLibrary}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-6 h-6" />
                <h3 className="font-bold text-lg">📚 Biblioteca</h3>
              </div>
              <p className="text-blue-100 text-sm mb-3">
                ¡Recursos especiales para ti!
              </p>
              <div className="text-center">
                <span className="text-blue-200 text-sm">
                  Toca para explorar
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* External Resources Section - Mobile Friendly */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h3 className="text-xl font-bold text-pink-600">
              🌟 Recursos Especiales
            </h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            ¡Más de 30 actividades interactivas disponibles!
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Card
              className="card-hover cursor-pointer border-2 border-blue-200 hover:border-blue-400 transition-all"
              onClick={() => router.push('/games/external?type=phet')}
            >
              <CardContent className="p-3 text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Atom className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold mb-1 text-sm">🧪 PhET</h4>
                <p className="text-xs text-gray-600">Experimentos</p>
              </CardContent>
            </Card>

            <Card
              className="card-hover cursor-pointer border-2 border-orange-200 hover:border-orange-400 transition-all"
              onClick={() => router.push('/games/external?type=blockly')}
            >
              <CardContent className="p-3 text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Blocks className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold mb-1 text-sm">🧩 Blockly</h4>
                <p className="text-xs text-gray-600">Programar</p>
              </CardContent>
            </Card>

            <Card
              className="card-hover cursor-pointer border-2 border-purple-200 hover:border-purple-400 transition-all"
              onClick={() => router.push('/games/external?type=music')}
            >
              <CardContent className="p-3 text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold mb-1 text-sm">🎵 Música</h4>
                <p className="text-xs text-gray-600">Crear</p>
              </CardContent>
            </Card>

            <Card
              className="card-hover cursor-pointer border-2 border-green-200 hover:border-green-400 transition-all"
              onClick={() => router.push('/games/external?type=colonial')}
            >
              <CardContent className="p-3 text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold mb-1 text-sm">📱 AR</h4>
                <p className="text-xs text-gray-600">Explorar</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={handleViewAllResources}
              className="w-full bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100"
            >
              🎮 Ver todos los juegos →
            </Button>
          </div>
        </div>

        {/* Progress Overview - Mobile Friendly */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <TrendingUp className="w-5 h-5" />
                📊 Mi Progreso
              </CardTitle>
              <CardDescription className="text-purple-500">
                Esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ProgressItem
                  subject="🧮 Matemáticas"
                  progress={75}
                  color="bg-purple-500"
                />
                <ProgressItem
                  subject="🔬 Ciencias"
                  progress={60}
                  color="bg-green-500"
                />
                <ProgressItem
                  subject="📚 Historia"
                  progress={85}
                  color="bg-blue-500"
                />
                <ProgressItem
                  subject="📝 Lenguaje"
                  progress={90}
                  color="bg-yellow-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Calendar className="w-5 h-5" />
                🎯 Retos del Día
              </CardTitle>
              <CardDescription className="text-green-500">
                ¡Completa para ganar puntos!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <h4 className="font-semibold mb-1 text-green-700">
                    🗺️ Reto de Geografía
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    Identifica 5 países de América del Sur
                  </p>
                  <Button
                    className="w-full text-xs py-1"
                    size="sm"
                    onClick={handleStartGeographyChallenge}
                  >
                    ¡Comenzar!
                  </Button>
                </div>

                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-1 text-blue-700">
                    🧮 Problema del Día
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    Resuelve 3 ecuaciones lineales
                  </p>
                  <Button
                    className="w-full text-xs py-1"
                    size="sm"
                    variant="outline"
                    onClick={handleStartMathProblem}
                  >
                    ¡Comenzar!
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ProgressItem({
  subject,
  progress,
  color,
}: {
  subject: string;
  progress: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{subject}</span>
          <span className="text-sm text-gray-500">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
