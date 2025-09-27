'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Brain,
  BookOpen,
  GameController2,
  Trophy,
  Calendar,
  TrendingUp,
  MessageCircle,
  Target
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function StudentDashboard() {
  const { t, language } = useTranslation()
  const [streak, setStreak] = useState(7)
  const [points, setPoints] = useState(1250)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {t('student.dashboard')}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-fuzzy-yellow" />
                <span className="font-semibold">{points} {t('student.points')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-fuzzy-green" />
                <span className="font-semibold">{streak} {t('student.streak')}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {t('common.welcome')}, María! 👋
          </h2>
          <p className="text-gray-600">
            {t('student.continueLesson')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover cursor-pointer bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {t('student.askTutor')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100">
                {language === 'es'
                  ? 'Resuelve tus dudas al instante'
                  : 'Get instant help with your questions'}
              </p>
              <Button className="mt-4 bg-white text-purple-600 hover:bg-gray-100">
                {language === 'es' ? 'Preguntar' : 'Ask'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GameController2 className="w-5 h-5" />
                {t('student.practice')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100">
                {language === 'es'
                  ? 'Juega y aprende con retos divertidos'
                  : 'Play and learn with fun challenges'}
              </p>
              <Button className="mt-4 bg-white text-green-600 hover:bg-gray-100">
                {language === 'es' ? 'Jugar' : 'Play'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t('student.library')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100">
                {language === 'es'
                  ? 'Accede a todos tus recursos'
                  : 'Access all your resources'}
              </p>
              <Button className="mt-4 bg-white text-blue-600 hover:bg-gray-100">
                {language === 'es' ? 'Explorar' : 'Explore'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-fuzzy-purple" />
                {t('student.progress')}
              </CardTitle>
              <CardDescription>
                {language === 'es' ? 'Esta semana' : 'This week'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ProgressItem
                  subject={language === 'es' ? 'Matemáticas' : 'Math'}
                  progress={75}
                  color="bg-fuzzy-purple"
                />
                <ProgressItem
                  subject={language === 'es' ? 'Ciencias' : 'Science'}
                  progress={60}
                  color="bg-fuzzy-green"
                />
                <ProgressItem
                  subject={language === 'es' ? 'Historia' : 'History'}
                  progress={85}
                  color="bg-fuzzy-blue"
                />
                <ProgressItem
                  subject={language === 'es' ? 'Lenguaje' : 'Language'}
                  progress={90}
                  color="bg-fuzzy-yellow"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-fuzzy-green" />
                {t('student.dailyChallenge')}
              </CardTitle>
              <CardDescription>
                {language === 'es' ? 'Completa para mantener tu racha' : 'Complete to maintain your streak'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {language === 'es' ? '🎯 Reto de Geografía' : '🎯 Geography Challenge'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {language === 'es'
                      ? 'Identifica 5 países de América del Sur'
                      : 'Identify 5 South American countries'}
                  </p>
                  <Button className="w-full" size="sm">
                    {language === 'es' ? 'Comenzar' : 'Start'}
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {language === 'es' ? '🧮 Problema del Día' : '🧮 Problem of the Day'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {language === 'es'
                      ? 'Resuelve 3 ecuaciones lineales'
                      : 'Solve 3 linear equations'}
                  </p>
                  <Button className="w-full" size="sm" variant="outline">
                    {language === 'es' ? 'Comenzar' : 'Start'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function ProgressItem({ subject, progress, color }: { subject: string, progress: number, color: string }) {
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
  )
}