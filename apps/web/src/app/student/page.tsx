'use client';

import React, { useState } from 'react';
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
  Brain,
  BookOpen,
  Gamepad2,
  Trophy,
  Target,
  Clock,
  Star,
  ArrowRight,
  Play,
  Sparkles,
  Users,
  Map,
  Library,
  MessageCircle,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  Heart,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChildProfile } from '@/hooks/useChildProfile';
import { useHookedSystem } from '@/hooks/useHookedSystem';
import { toast } from 'sonner';
import Image from 'next/image';
import Bell from '@/components/hooked/Bell';
import MessageBar from '@/components/hooked/MessageBar';

export default function StudentDashboard() {
  const { t, language } = useTranslation();
  const { childData } = useChildProfile();
  const { todayQuest, messages } = useHookedSystem();
  const router = useRouter();
  const [currentStreak, setCurrentStreak] = useState(7);
  const [totalPoints, setTotalPoints] = useState(1250);
  const [level, setLevel] = useState(5);
  const [showMessageBar, setShowMessageBar] = useState(false);

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

  const handleVisitLibrary = () => {
    toast.info(
      language === 'es' ? 'Abriendo biblioteca...' : 'Opening library...',
    );
    router.push('/library');
  };

  const handleStartQuest = (questId: string) => {
    toast.success(
      language === 'es'
        ? `Iniciando aventura ${questId}...`
        : `Starting adventure ${questId}...`,
    );
    router.push(`/quest/${questId}`);
  };

  const handleViewProgress = () => {
    toast.info(
      language === 'es' ? 'Mostrando progreso...' : 'Showing progress...',
    );
    router.push('/student/progress');
  };

  const handleJoinColonialRally = () => {
    toast.success(
      language === 'es'
        ? '¡Uniéndose al Rally Colonial!'
        : 'Joining Colonial Rally!',
    );
    router.push('/colonial-rally');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-sky-400 backdrop-blur-sm border-b border-sky-500">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-48 lg:h-48">
                <Image
                  src="/fuzzy.png"
                  alt="Fuzzy Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-barney-green-800"
                style={{ color: 'var(--barney-green-800)' }}
              >
                {t('student.dashboard')}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Bell
                hasUnread={messages.some((msg) => !msg.seen_at)}
                onClick={() => setShowMessageBar(!showMessageBar)}
                className="text-barney-green-800 hover:text-barney-green-900 touch-target"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Badge
                  variant="secondary"
                  className="bg-barney-yellow-500 text-barney-green-800 text-xs sm:text-sm"
                >
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Nivel {level}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-barney-green-600 text-barney-green-700 text-xs sm:text-sm"
                >
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {totalPoints} pts
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-cream-50 title-font">
            ¡Hola, {childData?.name || 'Explorador'}! 👋
          </h2>
          <p className="text-sm sm:text-base text-cream-100 body-font">
            {language === 'es'
              ? '¡Es hora de aprender y divertirse!'
              : "It's time to learn and have fun!"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="card-minimal bg-barney-yellow-500/20 border-barney-yellow-500/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-barney-yellow-500/30 rounded-full">
                  <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-barney-yellow-700" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-barney-green-700 body-font">
                    Racha
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-barney-green-800 body-font">
                    {currentStreak} días
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-minimal bg-barney-blue-500/20 border-barney-blue-500/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-barney-blue-500/30 rounded-full">
                  <Star className="w-4 h-4 sm:w-6 sm:h-6 text-barney-blue-700" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-barney-green-700 body-font">
                    Puntos
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-barney-green-800 body-font">
                    {totalPoints}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-minimal bg-barney-red-500/20 border-barney-red-500/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-barney-red-500/30 rounded-full">
                  <Target className="w-4 h-4 sm:w-6 sm:h-6 text-barney-red-700" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-barney-green-700 body-font">
                    Objetivos
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-barney-green-800 body-font">
                    3/5
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-minimal bg-barney-orange-500/20 border-barney-orange-500/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-barney-orange-500/30 rounded-full">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-barney-orange-700" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-barney-green-700 body-font">
                    Tiempo
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-barney-green-800 body-font">
                    45 min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card
            className="card-minimal group cursor-pointer touch-target"
            onClick={handleAskTutor}
          >
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-barney-green-800 title-font text-base sm:text-lg">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-barney-blue-700" />
                {t('student.askTutor')}
              </CardTitle>
              <CardDescription className="text-barney-green-700 body-font text-sm">
                {language === 'es'
                  ? 'Pregunta lo que quieras'
                  : 'Ask anything you want'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Button className="btn-cream w-full touch-target">
                <Play className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Comenzar' : 'Start'}
              </Button>
            </CardContent>
          </Card>

          <Card
            className="card-minimal group cursor-pointer"
            onClick={handlePlayGames}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-barney-green-800 title-font">
                <Gamepad2 className="w-6 h-6 text-barney-red-700" />
                {t('student.practice')}
              </CardTitle>
              <CardDescription className="text-barney-green-700 body-font">
                {language === 'es'
                  ? 'Juegos educativos divertidos'
                  : 'Fun educational games'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="btn-cream w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Jugar' : 'Play'}
              </Button>
            </CardContent>
          </Card>

          <Card
            className="card-minimal group cursor-pointer"
            onClick={handleVisitLibrary}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-barney-green-800 title-font">
                <Library className="w-6 h-6 text-barney-orange-700" />
                {t('student.library')}
              </CardTitle>
              <CardDescription className="text-barney-green-700 body-font">
                {language === 'es'
                  ? 'Recursos y materiales'
                  : 'Resources and materials'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="btn-cream w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Explorar' : 'Explore'}
              </Button>
            </CardContent>
          </Card>

          <Card
            className="card-minimal group cursor-pointer"
            onClick={handleJoinColonialRally}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-barney-green-800 title-font">
                <Map className="w-6 h-6 text-barney-yellow-700" />
                Rally Colonial
              </CardTitle>
              <CardDescription className="text-barney-green-700 body-font">
                {language === 'es'
                  ? 'Aventura en la Zona Colonial'
                  : 'Adventure in Colonial Zone'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="btn-cream w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Explorar' : 'Explore'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Daily Challenges */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-cream-50 title-font">
            {t('student.dailyChallenge')}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="card-minimal bg-gradient-to-br from-barney-yellow-500/20 to-barney-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-barney-green-800">
                  <Heart className="w-6 h-6 text-barney-red-700" />
                  {language === 'es' ? 'Reto del Día' : 'Daily Challenge'}
                </CardTitle>
                <CardDescription className="text-barney-green-700">
                  {language === 'es'
                    ? 'Completa 3 juegos de matemáticas'
                    : 'Complete 3 math games'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-barney-green-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-barney-green-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-cream-300 rounded-full"></div>
                    <span className="text-sm text-barney-green-700">2/3</span>
                  </div>
                  <Button size="sm" className="btn-cream">
                    {language === 'es' ? 'Continuar' : 'Continue'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-minimal bg-gradient-to-br from-barney-blue-500/20 to-barney-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-barney-green-800">
                  <Award className="w-6 h-6 text-barney-yellow-700" />
                  {language === 'es'
                    ? 'Logros Recientes'
                    : 'Recent Achievements'}
                </CardTitle>
                <CardDescription className="text-barney-green-700">
                  {language === 'es'
                    ? '¡Has ganado 3 medallas esta semana!'
                    : 'You earned 3 medals this week!'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-barney-yellow-600" />
                  <Trophy className="w-6 h-6 text-barney-yellow-600" />
                  <Trophy className="w-6 h-6 text-barney-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-cream-50">
              {t('student.progress')}
            </h3>
            <Button
              variant="outline"
              onClick={handleViewProgress}
              className="border-cream-300 text-cream-100 hover:bg-cream-200/20"
            >
              {language === 'es' ? 'Ver Todo' : 'View All'}
            </Button>
          </div>
          <Card className="card-minimal">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-barney-green-800 font-medium">
                    {language === 'es' ? 'Matemáticas' : 'Mathematics'}
                  </span>
                  <span className="text-barney-green-700">85%</span>
                </div>
                <div className="w-full bg-cream-200 rounded-full h-3">
                  <div
                    className="bg-barney-green-500 h-3 rounded-full"
                    style={{ width: '85%' }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-barney-green-800 font-medium">
                    {language === 'es' ? 'Ciencias' : 'Science'}
                  </span>
                  <span className="text-barney-green-700">72%</span>
                </div>
                <div className="w-full bg-cream-200 rounded-full h-3">
                  <div
                    className="bg-barney-blue-500 h-3 rounded-full"
                    style={{ width: '72%' }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-barney-green-800 font-medium">
                    {language === 'es' ? 'Historia' : 'History'}
                  </span>
                  <span className="text-barney-green-700">60%</span>
                </div>
                <div className="w-full bg-cream-200 rounded-full h-3">
                  <div
                    className="bg-barney-orange-500 h-3 rounded-full"
                    style={{ width: '60%' }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-barney-green-800 text-cream-50 py-6 mt-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="glass rounded-full p-2">
                <Brain className="w-5 h-5 text-barney-yellow-500" />
              </div>
              <h3 className="text-xl font-bold title-font">
                Fuzzy&apos;s Home School
              </h3>
            </div>
            <p className="text-sm text-cream-200 body-font">
              © 2024 Fuzzy&apos;s Home School.{' '}
              {language === 'es'
                ? 'Todos los derechos reservados.'
                : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>

      {/* Sistema Hooked */}
      {todayQuest && showMessageBar && (
        <MessageBar
          quest={todayQuest}
          onDismiss={() => setShowMessageBar(false)}
          onStartQuest={(questId) => router.push(`/quest/${questId}`)}
        />
      )}
    </div>
  );
}
