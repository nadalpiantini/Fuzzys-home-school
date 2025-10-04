'use client';

import React from 'react';
import StoryLesson from '@/components/lesson/StoryLesson';
import { getCurriculum } from '@/curriculum';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function LiteracyLevel2Page() {
  const router = useRouter();
  const curriculum = getCurriculum('literacy', 'level2');

  if (!curriculum) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error: Curriculum no encontrado
        </h1>
        <p className="text-gray-600 mb-6">
          No se pudo cargar el curriculum de Lectoescritura Nivel 2.
        </p>
        <Button onClick={() => router.push('/learn')}>
          Volver a Mundos de Aprendizaje
        </Button>
      </div>
    );
  }

  const handleProgress = (
    chapterId: string,
    activityIndex: number,
    completed: boolean,
  ) => {
    // Here you can integrate with your progress tracking system
    console.log('Progress update:', { chapterId, activityIndex, completed });

    // TODO: Save progress to Supabase
    // Example:
    // await supabase
    //   .from('student_progress')
    //   .upsert({
    //     student_id: currentStudentId,
    //     curriculum_id: curriculum.id,
    //     chapter_id: chapterId,
    //     activity_index: activityIndex,
    //     completed: completed,
    //     updated_at: new Date().toISOString()
    //   });
  };

  const handleBadgeEarned = (badge: string, description: string) => {
    console.log('Badge earned:', { badge, description });
    // TODO: Show badge notification and save to database
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/learn')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mundos de Aprendizaje
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-purple-800 mb-2">
              {curriculum.title}
            </h1>
            <p className="text-gray-600">{curriculum.description}</p>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-500">
              <span>👶 {curriculum.ageRange}</span>
              <span>⏱️ {curriculum.estimatedDuration}</span>
            </div>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Curriculum Content */}
        <div className="max-w-4xl mx-auto">
          <StoryLesson
            curriculum={curriculum}
            onProgress={handleProgress}
            onBadgeEarned={handleBadgeEarned}
          />
        </div>
      </div>
    </div>
  );
}
