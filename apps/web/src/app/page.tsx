'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Gamepad2, Map, Users, Brain, Globe } from 'lucide-react';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';

export default function HomePage() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-earth-100 to-earth-200">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <div className="glass rounded-full p-2">
            <Brain className="w-8 h-8 text-earth-700" />
          </div>
          <h1 className="text-3xl font-bold text-earth-800">
            Fuzzy&apos;s Home School
          </h1>
        </div>
        <LanguageToggle
          language={language}
          onToggle={() => setLanguage(language === 'es' ? 'en' : 'es')}
        />
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="glass rounded-3xl p-12 max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold mb-6 text-earth-800">
            {language === 'es'
              ? 'Aprende Jugando, Explora Aprendiendo'
              : 'Learn by Playing, Explore by Learning'}
          </h2>
          <p className="text-xl text-earth-600 mb-12 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Plataforma educativa con tutor IA, juegos interactivos y rally de exploración en la Zona Colonial'
              : 'Educational platform with AI tutor, interactive games, and Colonial Zone exploration rally'}
          </p>

          {/* Role Selection */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-minimal group">
              <Link href="/student">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-earth-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-earth-500/30 transition-colors">
                    <BookOpen className="w-10 h-10 text-earth-700" />
                  </div>
                  <h3 className="text-2xl font-semibold text-earth-800">
                    {language === 'es' ? 'Soy Estudiante' : "I'm a Student"}
                  </h3>
                  <p className="text-earth-600">
                    {language === 'es'
                      ? 'Accede a tu tutor IA y juegos educativos'
                      : 'Access your AI tutor and educational games'}
                  </p>
                  <Button className="btn-earth w-full">
                    {language === 'es' ? 'Entrar' : 'Enter'}
                  </Button>
                </div>
              </Link>
            </Card>

            <Card className="card-minimal group">
              <Link href="/teacher">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-earth-600/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-earth-600/30 transition-colors">
                    <Users className="w-10 h-10 text-earth-700" />
                  </div>
                  <h3 className="text-2xl font-semibold text-earth-800">
                    {language === 'es' ? 'Soy Profesor' : "I'm a Teacher"}
                  </h3>
                  <p className="text-earth-600">
                    {language === 'es'
                      ? 'Gestiona clases y crea contenido educativo'
                      : 'Manage classes and create educational content'}
                  </p>
                  <Button className="btn-earth w-full">
                    {language === 'es' ? 'Entrar' : 'Enter'}
                  </Button>
                </div>
              </Link>
            </Card>

            <Card className="card-minimal group">
              <Link href="/colonial-rally">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-earth-700/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-earth-700/30 transition-colors">
                    <Map className="w-10 h-10 text-earth-700" />
                  </div>
                  <h3 className="text-2xl font-semibold text-earth-800">
                    {language === 'es' ? 'Rally Colonial' : 'Colonial Rally'}
                  </h3>
                  <p className="text-earth-600">
                    {language === 'es'
                      ? 'Explora la Zona Colonial con AR'
                      : 'Explore the Colonial Zone with AR'}
                  </p>
                  <Button className="btn-earth w-full">
                    {language === 'es' ? 'Explorar' : 'Explore'}
                  </Button>
                </div>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="text-4xl font-bold text-center mb-12 text-earth-800">
          {language === 'es' ? 'Características' : 'Features'}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Brain />}
            title={language === 'es' ? 'Tutor IA 24/7' : 'AI Tutor 24/7'}
            description={
              language === 'es'
                ? 'Asistente inteligente que responde dudas al instante'
                : 'Smart assistant that answers questions instantly'
            }
          />
          <FeatureCard
            icon={<Gamepad2 />}
            title={
              language === 'es'
                ? '100+ Recursos Educativos'
                : '100+ Educational Resources'
            }
            description={
              language === 'es'
                ? 'PhET, Blockly, Music Blocks, AR Colonial y más'
                : 'PhET, Blockly, Music Blocks, AR Colonial and more'
            }
          />
          <FeatureCard
            icon={<Map />}
            title={language === 'es' ? 'Rally AR/QR' : 'AR/QR Rally'}
            description={
              language === 'es'
                ? 'Aprende historia explorando lugares reales'
                : 'Learn history by exploring real places'
            }
          />
          <FeatureCard
            icon={<Globe />}
            title={language === 'es' ? 'Multi-idioma' : 'Multi-language'}
            description={
              language === 'es'
                ? 'Disponible en español e inglés'
                : 'Available in Spanish and English'
            }
          />
        </div>
      </section>
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
      <div className="w-16 h-16 bg-earth-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-earth-500/30 transition-colors">
        <div className="text-earth-700 text-2xl">{icon}</div>
      </div>
      <h4 className="font-semibold mb-3 text-earth-800 text-lg">{title}</h4>
      <p className="text-earth-600">{description}</p>
    </Card>
  );
}
