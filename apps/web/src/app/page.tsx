'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Gamepad2, Map, Users, Brain, Globe, Heart } from 'lucide-react';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { useHookedSystem } from '@/hooks/useHookedSystem';
import { useMobileDetection } from '@/lib/hooks/useMobileDetection';
import MessageBar from '@/components/hooked/MessageBar';
import Bell from '@/components/hooked/Bell';
import OnboardingTour, {
  useOnboardingTour,
} from '@/components/hooked/OnboardingTour';

export default function HomePage() {
  const { t, language, setLanguage } = useTranslation();
  const { todayQuest, messages, loading } = useHookedSystem();
  const { isMobile } = useMobileDetection();
  const { showTour, completeTour, skipTour } = useOnboardingTour();
  const [showMessageBar, setShowMessageBar] = useState(false);

  const handleStartQuest = (questId: string) => {
    window.location.href = `/quest/${questId}`;
  };

  const handleDismissMessage = () => {
    setShowMessageBar(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 bg-sky-400 gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-60 lg:h-60">
            <Image
              src="/fuzzy.png"
              alt="Fuzzy Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 192px, 240px"
            />
          </div>
          <h1
            className="text-3xl sm:text-5xl lg:text-7xl font-bold text-barney-green-800 fuzzy-title"
            style={{ color: 'var(--barney-green-800)' }}
          >
            Fuzzy&apos;s Home School
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div id="bell-notification">
            <Bell
              hasUnread={messages.some((msg) => !msg.seen_at)}
              onClick={() => setShowMessageBar(!showMessageBar)}
              className="text-barney-green-800 hover:text-barney-green-900 touch-target"
            />
          </div>
          <LanguageToggle
            language={language}
            onToggle={() => setLanguage(language === 'es' ? 'en' : 'es')}
          />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="glass rounded-3xl p-4 sm:p-6 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 text-cream-50 title-font">
                {t('home.tagline')}
              </h2>
              <p className="text-lg sm:text-xl text-cream-100 mb-4 sm:mb-6 max-w-2xl mx-auto lg:mx-0 body-font">
                {t('home.description')}
              </p>
            </div>

            {/* Fuzzy Character */}
            <div className="flex-shrink-0">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[32rem] lg:h-[32rem]">
                <Image
                  src="/fuzzy.png"
                  alt="Fuzzy - Happy Character"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, (max-width: 1024px) 384px, 512px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
          <Card
            className="card-minimal group touch-target"
            id="daily-quest-card"
          >
            <Link href="/student" className="block">
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-barney-blue-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-barney-blue-500/30 transition-colors">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-barney-blue-700" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-barney-green-800 title-font text-center">
                  {t('home.studentRole')}
                </h3>
                <p className="text-sm sm:text-base text-barney-green-700 body-font text-center">
                  {t('home.studentDescription')}
                </p>
                <Button className="btn-cream w-full touch-target">
                  {t('common.continue')}
                </Button>
              </div>
            </Link>
          </Card>

          <Card className="card-minimal group touch-target" id="profile-button">
            <Link href="/teacher" className="block">
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-barney-red-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-barney-red-500/30 transition-colors">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-barney-red-700" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-barney-green-800 title-font text-center">
                  {t('home.teacherRole')}
                </h3>
                <p className="text-sm sm:text-base text-barney-green-700 body-font text-center">
                  {t('home.teacherDescription')}
                </p>
                <Button className="btn-cream w-full touch-target">
                  {t('common.continue')}
                </Button>
              </div>
            </Link>
          </Card>

          <Card className="card-minimal group touch-target">
            <Link href="/parent/dashboard" className="block">
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-barney-purple-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-barney-purple-500/30 transition-colors">
                  <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-barney-purple-700" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-barney-green-800 title-font text-center">
                  {language === 'es' ? 'Padres' : 'Parents'}
                </h3>
                <p className="text-sm sm:text-base text-barney-green-700 body-font text-center">
                  {language === 'es'
                    ? 'Monitorea el progreso de tus hijos y recibe reportes semanales'
                    : 'Monitor your children\'s progress and receive weekly reports'
                  }
                </p>
                <Button className="btn-cream w-full touch-target">
                  {t('common.continue')}
                </Button>
              </div>
            </Link>
          </Card>

          <Card className="card-minimal group touch-target">
            <Link href="/colonial-rally" className="block">
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-barney-orange-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-barney-orange-500/30 transition-colors">
                  <Map className="w-8 h-8 sm:w-10 sm:h-10 text-barney-orange-700" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-barney-green-800 title-font text-center">
                  {t('home.colonialRally')}
                </h3>
                <p className="text-sm sm:text-base text-barney-green-700 body-font text-center">
                  {t('home.rallyDescription')}
                </p>
                <Button className="btn-cream w-full touch-target">
                  {t('colonial.startRally')}
                </Button>
              </div>
            </Link>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-cream-50 title-font">
          {t('features.title')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <div id="tutor-card">
            <FeatureCard
              icon={<Brain />}
              title={t('features.aiTutor')}
              description={t('features.aiTutorDesc')}
            />
          </div>
          <div id="games-card">
            <FeatureCard
              icon={<Gamepad2 />}
              title={t('features.games')}
              description={t('features.gamesDesc')}
            />
          </div>
          <div id="library-card">
            <FeatureCard
              icon={<Map />}
              title={t('features.arRally')}
              description={t('features.arRallyDesc')}
            />
          </div>
          <FeatureCard
            icon={<Globe />}
            title={t('features.multiLanguage')}
            description={t('features.multiLanguageDesc')}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-barney-green-800 text-cream-50 py-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="glass rounded-full p-2">
                <Brain className="w-6 h-6 text-barney-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold title-font">
                Fuzzy&apos;s Home School
              </h3>
            </div>
            <p className="text-cream-100 body-font mb-4">
              {language === 'es'
                ? 'Plataforma educativa con IA, juegos y exploración'
                : 'Educational platform with AI, games and exploration'}
            </p>
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
          onDismiss={handleDismissMessage}
          onStartQuest={handleStartQuest}
        />
      )}

      {/* Onboarding Tour - Deshabilitado en móvil */}
      {!isMobile && (
        <OnboardingTour
          isVisible={showTour}
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="card-minimal text-center group p-4 sm:p-6">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cream-200/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-cream-300/50 transition-colors">
        <div className="text-barney-green-700 text-xl sm:text-2xl">{icon}</div>
      </div>
      <h4 className="font-semibold mb-2 sm:mb-3 text-barney-green-800 text-base sm:text-lg title-font">
        {title}
      </h4>
      <p className="text-sm sm:text-base text-barney-green-700 body-font">
        {description}
      </p>
    </Card>
  );
}
