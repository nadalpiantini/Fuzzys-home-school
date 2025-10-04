/**
 * Curriculum Resolver Utility
 * 
 * Provides intelligent next chapter resolution based on:
 * - Student progress
 * - Curriculum structure
 * - AI recommendations
 */

import type { Curriculum } from '@/curriculum';

export interface ChapterProgress {
  curriculum_id: string;
  chapter_id: string;
  completed: boolean;
  score?: number;
}

export interface NextChapterResult {
  curriculumId: string;
  chapterId: string;
  chapterTitle: string;
  chapterIndex: number;
  isFirstChapter: boolean;
  isLastChapter: boolean;
  completionPercentage: number;
}

/**
 * Finds the next incomplete chapter in a curriculum
 */
export function findNextChapter(
  curriculum: Curriculum,
  progress: ChapterProgress[]
): NextChapterResult | null {
  const curriculumProgress = progress.filter(
    (p) => p.curriculum_id === curriculum.id
  );

  const completedChapterIds = new Set(
    curriculumProgress
      .filter((p) => p.completed)
      .map((p) => p.chapter_id)
  );

  // Find first incomplete chapter
  const nextChapterIndex = curriculum.chapters.findIndex(
    (chapter) => !completedChapterIds.has(chapter.id)
  );

  // If all chapters are completed
  if (nextChapterIndex === -1) {
    const lastChapter = curriculum.chapters[curriculum.chapters.length - 1];
    return {
      curriculumId: curriculum.id,
      chapterId: lastChapter.id,
      chapterTitle: lastChapter.title,
      chapterIndex: curriculum.chapters.length - 1,
      isFirstChapter: false,
      isLastChapter: true,
      completionPercentage: 100,
    };
  }

  const nextChapter = curriculum.chapters[nextChapterIndex];
  const completionPercentage = Math.round(
    (completedChapterIds.size / curriculum.chapters.length) * 100
  );

  return {
    curriculumId: curriculum.id,
    chapterId: nextChapter.id,
    chapterTitle: nextChapter.title,
    chapterIndex: nextChapterIndex,
    isFirstChapter: nextChapterIndex === 0,
    isLastChapter: nextChapterIndex === curriculum.chapters.length - 1,
    completionPercentage,
  };
}

/**
 * Resolves AUTO_CLIENT placeholder with actual next chapter
 */
export function resolveNextChapter(
  curriculumId: string,
  nextChapterPlaceholder: string,
  curriculum: Curriculum,
  progress: ChapterProgress[]
): string {
  if (nextChapterPlaceholder !== 'AUTO_CLIENT') {
    return nextChapterPlaceholder;
  }

  const result = findNextChapter(curriculum, progress);
  return result ? result.chapterId : curriculum.chapters[0]?.id || 'unknown';
}

/**
 * Gets recommended chapter based on difficulty and progress
 */
export function getRecommendedChapter(
  curriculum: Curriculum,
  progress: ChapterProgress[],
  suggestedDifficulty: 'easy' | 'medium' | 'hard'
): NextChapterResult | null {
  const nextChapter = findNextChapter(curriculum, progress);
  
  if (!nextChapter) return null;

  // For 'easy' difficulty, suggest review of last completed chapter if score was low
  if (suggestedDifficulty === 'easy') {
    const curriculumProgress = progress.filter(
      (p) => p.curriculum_id === curriculum.id && p.completed
    );

    // Find last completed chapter with low score (< 70)
    const lowScoreChapter = curriculumProgress
      .filter((p) => (p.score || 0) < 70)
      .sort((a, b) => {
        const indexA = curriculum.chapters.findIndex((ch) => ch.id === a.chapter_id);
        const indexB = curriculum.chapters.findIndex((ch) => ch.id === b.chapter_id);
        return indexB - indexA; // Most recent first
      })[0];

    if (lowScoreChapter) {
      const chapterIndex = curriculum.chapters.findIndex(
        (ch) => ch.id === lowScoreChapter.chapter_id
      );
      
      if (chapterIndex !== -1) {
        const chapter = curriculum.chapters[chapterIndex];
        return {
          curriculumId: curriculum.id,
          chapterId: chapter.id,
          chapterTitle: `${chapter.title} (Repaso)`,
          chapterIndex,
          isFirstChapter: chapterIndex === 0,
          isLastChapter: chapterIndex === curriculum.chapters.length - 1,
          completionPercentage: nextChapter.completionPercentage,
        };
      }
    }
  }

  // For 'medium' and 'hard', return the next incomplete chapter
  return nextChapter;
}

/**
 * Calculate overall curriculum progress
 */
export function calculateCurriculumProgress(
  curriculum: Curriculum,
  progress: ChapterProgress[]
): {
  completedChapters: number;
  totalChapters: number;
  percentage: number;
  averageScore: number;
} {
  const curriculumProgress = progress.filter(
    (p) => p.curriculum_id === curriculum.id && p.completed
  );

  const completedCount = curriculumProgress.length;
  const totalCount = curriculum.chapters.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const scores = curriculumProgress
    .map((p) => p.score || 0)
    .filter((score) => score > 0);
  
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return {
    completedChapters: completedCount,
    totalChapters: totalCount,
    percentage,
    averageScore,
  };
}

/**
 * Get chapter status (locked, available, completed)
 */
export function getChapterStatus(
  curriculum: Curriculum,
  chapterId: string,
  progress: ChapterProgress[]
): 'locked' | 'available' | 'completed' {
  const chapterIndex = curriculum.chapters.findIndex((ch) => ch.id === chapterId);
  
  if (chapterIndex === -1) return 'locked';

  const curriculumProgress = progress.filter(
    (p) => p.curriculum_id === curriculum.id
  );

  // Check if this chapter is completed
  const isCompleted = curriculumProgress.some(
    (p) => p.chapter_id === chapterId && p.completed
  );

  if (isCompleted) return 'completed';

  // First chapter is always available
  if (chapterIndex === 0) return 'available';

  // Check if previous chapter is completed
  const previousChapter = curriculum.chapters[chapterIndex - 1];
  const isPreviousCompleted = curriculumProgress.some(
    (p) => p.chapter_id === previousChapter.id && p.completed
  );

  return isPreviousCompleted ? 'available' : 'locked';
}

/**
 * Get all available chapters for a curriculum
 */
export function getAvailableChapters(
  curriculum: Curriculum,
  progress: ChapterProgress[]
): Array<{
  chapter: typeof curriculum.chapters[0];
  status: 'locked' | 'available' | 'completed';
  index: number;
}> {
  return curriculum.chapters.map((chapter, index) => ({
    chapter,
    status: getChapterStatus(curriculum, chapter.id, progress),
    index,
  }));
}
