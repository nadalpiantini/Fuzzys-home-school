'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Gamepad2, Map, Users, Brain, Globe } from 'lucide-react';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';

export default function HomePage() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-sky-400">
        <div className="flex items-center gap-4">
          <div className="relative w-48 h-48 md:w-60 md:h-60">
            <Image
              src="/fuzzy.png"
              alt="Fuzzy Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1
            className="text-7xl font-bold text-barney-green-800 fuzzy-title"
            style={{ color: 'var(--barney-green-800)' }}
          >
            Fuzzy&apos;s Home School
          </h1>
        </div>
        <LanguageToggle
          language={language}
          onToggle={() => setLanguage(language === 'es' ? 'en' : 'es')}
        />
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-8">
        <div className="glass rounded-3xl p-6 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-6xl font-bold mb-4 text-cream-50 title-font">
                {t('home.tagline')}
              </h2>
              <p className="text-xl text-cream-100 mb-6 max-w-2xl mx-auto lg:mx-0 body-font">
                {t('home.description')}
              </p>
            </div>

            {/* Fuzzy Character */}
            <div className="flex-shrink-0">
              <div className="relative w-96 h-96 md:w-[32rem] md:h-[32rem]">
                <Image
                  src="/fuzzy.png"
                  alt="Fuzzy - Happy Character"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 384px, 512px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <Card className="card-minimal group">
            <Link href="/student">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-barney-blue-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-barney-blue-500/30 transition-colors">
                  <BookOpen className="w-10 h-10 text-barney-blue-700" />
                </div>
                <h3 className="text-2xl font-semibold text-barney-green-800 title-font">
                  {t('home.studentRole')}
                </h3>
                <p className="text-barney-green-700 body-font">
                  {t('home.studentDescription')}
                </p>
                <Button className="btn-cream w-full">
                  {t('common.continue')}
                </Button>
              </div>
            </Link>
          </Card>

          <Card className="card-minimal group">
            <Link href="/teacher">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-barney-red-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-barney-red-500/30 transition-colors">
                  <Users className="w-10 h-10 text-barney-red-700" />
                </div>
                <h3 className="text-2xl font-semibold text-barney-green-800 title-font">
                  {t('home.teacherRole')}
                </h3>
                <p className="text-barney-green-700 body-font">
                  {t('home.teacherDescription')}
                </p>
                <Button className="btn-cream w-full">
                  {t('common.continue')}
                </Button>
              </div>
            </Link>
          </Card>

          <Card className="card-minimal group">
            <Link href="/colonial-rally">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-barney-orange-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-barney-orange-500/30 transition-colors">
                  <Map className="w-10 h-10 text-barney-orange-700" />
                </div>
                <h3 className="text-2xl font-semibold text-barney-green-800 title-font">
                  {t('home.colonialRally')}
                </h3>
                <p className="text-barney-green-700 body-font">
                  {t('home.rallyDescription')}
                </p>
                <Button className="btn-cream w-full">
                  {t('colonial.startRally')}
                </Button>
              </div>
            </Link>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-8">
        <h3 className="text-4xl font-bold text-center mb-12 text-cream-50 title-font">
          {t('features.title')}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Brain />}
            title={t('features.aiTutor')}
            description={t('features.aiTutorDesc')}
          />
          <FeatureCard
            icon={<Gamepad2 />}
            title={t('features.games')}
            description={t('features.gamesDesc')}
          />
          <FeatureCard
            icon={<Map />}
            title={t('features.arRally')}
            description={t('features.arRallyDesc')}
          />
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
    <Card className="card-minimal text-center group">
      <div className="w-16 h-16 bg-cream-200/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-cream-300/50 transition-colors">
        <div className="text-barney-green-700 text-2xl">{icon}</div>
      </div>
      <h4 className="font-semibold mb-3 text-barney-green-800 text-lg title-font">
        {title}
      </h4>
      <p className="text-barney-green-700 body-font">{description}</p>
    </Card>
  );
}
