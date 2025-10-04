'use client';

import React from 'react';
import StoryLesson from '@/components/lesson/StoryLesson';
import { getCurriculum } from '@/curriculum';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function LiteracyLevel1Page() {
  const router = useRouter();
  const curriculum = getCurriculum('literacy', 'level1');

  if (!curriculum) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error: Curriculum no encontrado
        </h1>
        <p className="text-gray-600 mb-6">
          No se pudo cargar el curriculum de Lectoescritura Nivel 1.
        </p>
        <Button onClick={() => router.push('/learn')}>
          Volver a Mundos de Aprendizaje
        </Button>
      </div>
    );
  }

  const handleProgress = (chapterId: string, activityIndex: number, completed: boolean) => {
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
    // Here you can integrate with your achievement system
    console.log('Badge earned:', { badge, description });

    // TODO: Save achievement to Supabase
    // Example:
    // await supabase
    //   .from('student_achievements')
    //   .insert({
    //     student_id: currentStudentId,
    //     achievement_type: 'badge',
    //     achievement_name: badge,
    //     description: description,
    //     earned_at: new Date().toISOString()
    //   });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Back button */}
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/learn')}
          className="mb-4 hover:bg-purple-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Mundos de Aprendizaje
        </Button>
      </div>

      {/* Story Lesson Component */}
      <StoryLesson
        curriculum={curriculum}
        onProgress={handleProgress}
        onBadgeEarned={handleBadgeEarned}
      />
    </div>
  );
}