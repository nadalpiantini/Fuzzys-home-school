// Curriculum exports
import literacyLevel1 from './literacy/level1.json';
import literacyLevel2 from './literacy/level2.json';
import literacyLevel3 from './literacy/level3.json';
import mathLevel1 from './math/level1.json';
import mathLevel2 from './math/level2.json';
import mathLevel3 from './math/level3.json';
import scienceLevel1 from './science/level1.json';
// import scienceLevel2 from './science/level2.json';
// import scienceLevel3 from './science/level3.json';
import historyLevel1 from './history/level1.json';
import artLevel1 from './art/level1.json';

export interface CurriculumActivity {
  type: 'internal' | 'external' | 'quiz' | 'branching';
  component: string;
  title: string;
  data: any;
}

export interface CurriculumChapter {
  id: string;
  title: string;
  goals: string[];
  activities: CurriculumActivity[];
  badge: string;
  badgeDescription: string;
  sequence?: string[];
}

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  estimatedDuration: string;
  chapters: CurriculumChapter[];
  finalBadge: string;
  prerequisites: string[];
  nextLevel?: string | null;
}

// Available curriculums
export const curriculums = {
  literacy: {
    level1: literacyLevel1 as Curriculum,
    level2: literacyLevel2 as Curriculum,
    level3: literacyLevel3 as Curriculum,
  },
  math: {
    level1: mathLevel1 as Curriculum,
    level2: mathLevel2 as Curriculum,
    level3: mathLevel3 as Curriculum,
  },
  science: {
    level1: scienceLevel1 as Curriculum,
    // level2: scienceLevel2 as Curriculum,
    // level3: scienceLevel3 as Curriculum,
  },
  history: {
    level1: historyLevel1 as Curriculum,
  },
  art: {
    level1: artLevel1 as Curriculum,
  },
} as const;

// Helper functions
export function getCurriculum(
  subject: string,
  level: string,
): Curriculum | null {
  const subjectCurriculum = curriculums[subject as keyof typeof curriculums];
  if (!subjectCurriculum) return null;

  const levelCurriculum =
    subjectCurriculum[level as keyof typeof subjectCurriculum];
  return levelCurriculum || null;
}

export function getAllCurriculums(): Curriculum[] {
  const allCurriculums: Curriculum[] = [];

  Object.values(curriculums).forEach((subject) => {
    Object.values(subject).forEach((curriculum) => {
      allCurriculums.push(curriculum);
    });
  });

  return allCurriculums;
}

export function getCurriculumsBySubject(subject: string): Curriculum[] {
  const subjectCurriculum = curriculums[subject as keyof typeof curriculums];
  if (!subjectCurriculum) return [];

  return Object.values(subjectCurriculum);
}
