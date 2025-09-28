'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookOpen, Gamepad2, Map, Users, Brain, Globe } from 'lucide-react'
import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { useTranslation } from '@/hooks/useTranslation'

export default function HomePage() {
  const { t, language, setLanguage } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50" style={{background: 'linear-gradient(135deg, #f3e8ff 0%, #ecfdf5 100%)'}}>
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <Brain className="w-8 h-8 text-fuzzy-purple" />
          <h1 className="text-2xl font-bold fuzzy-text-gradient">
            Fuzzy&apos;s Home School
          </h1>
        </div>
        <LanguageToggle language={language} onToggle={() => setLanguage(language === 'es' ? 'en' : 'es')} />
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 text-center">
        <h2 className="text-5xl font-bold mb-6">
          {language === 'es'
            ? 'Aprende Jugando, Explora Aprendiendo'
            : 'Learn by Playing, Explore by Learning'}
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {language === 'es'
            ? 'Plataforma educativa con tutor IA, juegos interactivos y rally de exploración en la Zona Colonial'
            : 'Educational platform with AI tutor, interactive games, and Colonial Zone exploration rally'}
        </p>

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 card-hover cursor-pointer">
            <Link href="/student">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-fuzzy-purple/10 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8 text-fuzzy-purple" />
                </div>
                <h3 className="text-xl font-semibold">
                  {language === 'es' ? 'Soy Estudiante' : "I'm a Student"}
                </h3>
                <p className="text-gray-600">
                  {language === 'es'
                    ? 'Accede a tu tutor IA y juegos educativos'
                    : 'Access your AI tutor and educational games'}
                </p>
                <Button className="w-full bg-fuzzy-purple hover:bg-fuzzy-purple/90">
                  {language === 'es' ? 'Entrar' : 'Enter'}
                </Button>
              </div>
            </Link>
          </Card>

          <Card className="p-6 card-hover cursor-pointer">
            <Link href="/teacher">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-fuzzy-green/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-fuzzy-green" />
                </div>
                <h3 className="text-xl font-semibold">
                  {language === 'es' ? 'Soy Profesor' : "I'm a Teacher"}
                </h3>
                <p className="text-gray-600">
                  {language === 'es'
                    ? 'Gestiona clases y crea contenido educativo'
                    : 'Manage classes and create educational content'}
                </p>
                <Button className="w-full bg-fuzzy-green hover:bg-fuzzy-green/90">
                  {language === 'es' ? 'Entrar' : 'Enter'}
                </Button>
              </div>
            </Link>
          </Card>

          <Card className="p-6 card-hover cursor-pointer">
            <Link href="/colonial-rally">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-fuzzy-blue/10 rounded-full flex items-center justify-center mx-auto">
                  <Map className="w-8 h-8 text-fuzzy-blue" />
                </div>
                <h3 className="text-xl font-semibold">
                  {language === 'es' ? 'Rally Colonial' : 'Colonial Rally'}
                </h3>
                <p className="text-gray-600">
                  {language === 'es'
                    ? 'Explora la Zona Colonial con AR'
                    : 'Explore the Colonial Zone with AR'}
                </p>
                <Button className="w-full bg-fuzzy-blue hover:bg-fuzzy-blue/90">
                  {language === 'es' ? 'Explorar' : 'Explore'}
                </Button>
              </div>
            </Link>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-12">
        <h3 className="text-3xl font-bold text-center mb-8">
          {language === 'es' ? 'Características' : 'Features'}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Brain />}
            title={language === 'es' ? 'Tutor IA 24/7' : 'AI Tutor 24/7'}
            description={language === 'es'
              ? 'Asistente inteligente que responde dudas al instante'
              : 'Smart assistant that answers questions instantly'}
          />
          <FeatureCard
            icon={<Gamepad2 />}
            title={language === 'es' ? '100+ Recursos Educativos' : '100+ Educational Resources'}
            description={language === 'es'
              ? 'PhET, Blockly, Music Blocks, AR Colonial y más'
              : 'PhET, Blockly, Music Blocks, AR Colonial and more'}
          />
          <FeatureCard
            icon={<Map />}
            title={language === 'es' ? 'Rally AR/QR' : 'AR/QR Rally'}
            description={language === 'es'
              ? 'Aprende historia explorando lugares reales'
              : 'Learn history by exploring real places'}
          />
          <FeatureCard
            icon={<Globe />}
            title={language === 'es' ? 'Multi-idioma' : 'Multi-language'}
            description={language === 'es'
              ? 'Disponible en español e inglés'
              : 'Available in Spanish and English'}
          />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="p-6 text-center">
      <div className="w-12 h-12 bg-fuzzy-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <div className="text-fuzzy-purple">{icon}</div>
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </Card>
  )
}