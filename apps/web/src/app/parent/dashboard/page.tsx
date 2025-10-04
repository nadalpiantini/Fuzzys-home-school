'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

// Import curriculum data
import literacy1 from '@/curriculum/literacy/level1.json';
import literacy2 from '@/curriculum/literacy/level2.json';
import literacy3 from '@/curriculum/literacy/level3.json';
import math1 from '@/curriculum/math/level1.json';
import math2 from '@/curriculum/math/level2.json';
import math3 from '@/curriculum/math/level3.json';
import science1 from '@/curriculum/science/level1.json';
import history1 from '@/curriculum/history/level1.json';
import art1 from '@/curriculum/art/level1.json';

type StudentSummary = {
  studentId: string;
  studentName: string;
  totalPoints: number;
  streakDays: number;
  chapters: {
    curriculumId: string;
    chapterId: string;
    completed: boolean;
    score?: number;
    updatedAt: string;
  }[];
};

type WeeklyReportData = {
  students: StudentSummary[];
  recommendations: Record<
    string,
    Array<{ curriculumId: string; nextChapter: string }>
  >;
};

// Curriculum mapping
const CURRICULA: Record<string, any> = {
  'literacy-level1': literacy1,
  'literacy-level2': literacy2,
  'literacy-level3': literacy3,
  'math-level1': math1,
  'math-level2': math2,
  'math-level3': math3,
  'science-level1': science1,
  'history-level1': history1,
  'art-level1': art1,
};

const getCurriculumTitle = (curriculumId: string): string => {
  const curriculum = CURRICULA[curriculumId];
  return curriculum?.title || curriculumId;
};

export default function ParentDashboard() {
  // In a real app, get parent ID from auth context
  const parentId =
    typeof window !== 'undefined'
      ? (window as any).__user?.id || 'demo-parent-id'
      : 'demo-parent-id';

  const [data, setData] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/parents/weekly-report?parentId=${parentId}`,
        );
        const result = await response.json();

        if (result.ok) {
          setData(result.data);
        } else {
          setError(result.error || 'Error al obtener datos');
        }
      } catch (err) {
        console.error('Error fetching parent dashboard data:', err);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parentId]);

  const computeProgress = (
    studentId: string,
    curriculumId: string,
    chapters: StudentSummary['chapters'],
  ) => {
    const curriculum = CURRICULA[curriculumId];
    const totalChapters = curriculum?.chapters?.length || 1;
    const completedChapters = chapters.filter(
      (ch) => ch.curriculumId === curriculumId && ch.completed,
    ).length;

    return {
      completed: completedChapters,
      total: totalChapters,
      percentage: Math.round((completedChapters / totalChapters) * 100),
    };
  };

  const getNextChapter = (
    curriculumId: string,
    chapters: StudentSummary['chapters'],
  ) => {
    const curriculum = CURRICULA[curriculumId];
    if (!curriculum?.chapters) return null;

    const completedSet = new Set(
      chapters
        .filter((ch) => ch.curriculumId === curriculumId && ch.completed)
        .map((ch) => ch.chapterId),
    );

    const nextChapter = curriculum.chapters.find(
      (ch: any) => !completedSet.has(ch.id),
    );
    return nextChapter ? nextChapter.id : null;
  };

  if (loading) {
    return (
      <div className="container p-6 mx-auto">
        <div className="animate-pulse">
          <div className="mb-6 w-1/3 h-8 bg-gray-200 rounded"></div>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="p-5 rounded-2xl border">
                <div className="mb-4 w-1/4 h-6 bg-gray-200 rounded"></div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((j) => (
                    <div key={j} className="p-4 rounded-xl border">
                      <div className="mb-2 w-1/2 h-4 bg-gray-200 rounded"></div>
                      <div className="mb-3 h-2 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-6 mx-auto">
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold text-red-800">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📊 Reporte Semanal</h1>
        <p className="mt-1 text-gray-600">
          Progreso y actividad de tus estudiantes
        </p>
      </div>

      {!data?.students?.length ? (
        <div className="p-6 text-center bg-blue-50 rounded-lg border border-blue-200">
          <div className="mb-4 text-4xl">👨‍👩‍👧‍👦</div>
          <h3 className="mb-2 text-lg font-semibold text-blue-800">
            No hay estudiantes vinculados
          </h3>
          <p className="mb-4 text-blue-600">
            Aún no se han configurado vínculos entre padres y estudiantes.
          </p>
          <p className="text-sm text-blue-500">
            Contacta al administrador para configurar los vínculos familiares.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.students.map((student) => (
            <div
              key={student.studentId}
              className="p-6 bg-white rounded-2xl border shadow-sm"
            >
              {/* Student Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-3 items-center">
                  <div className="flex justify-center items-center w-12 h-12 text-lg font-bold text-white bg-gradient-to-br from-blue-400 to-purple-500 rounded-full">
                    {student.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {student.studentName}
                    </h2>
                    <div className="flex gap-4 items-center text-sm text-gray-600">
                      <span className="flex gap-1 items-center">
                        🏆 {student.totalPoints} puntos
                      </span>
                      <span className="flex gap-1 items-center">
                        🔥 {student.streakDays} días seguidos
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress by Curriculum */}
              <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.keys(CURRICULA).map((curriculumId) => {
                  const progress = computeProgress(
                    student.studentId,
                    curriculumId,
                    student.chapters,
                  );

                  return (
                    <div
                      key={curriculumId}
                      className="p-4 bg-gray-50 rounded-xl border"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {getCurriculumTitle(curriculumId)}
                        </h3>
                        <span className="text-sm font-semibold text-gray-700">
                          {progress.percentage}%
                        </span>
                      </div>

                      <div className="mb-3 w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between mb-2 text-xs text-gray-600">
                        <span>
                          {progress.completed} / {progress.total} capítulos
                        </span>
                      </div>

                      <Link
                        href={`/learn/${curriculumId.replace('-', '/')}`}
                        className="text-xs text-emerald-700 underline hover:text-emerald-800"
                      >
                        Ver mundo →
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <div className="mb-6">
                <h3 className="flex gap-2 items-center mb-3 font-semibold text-gray-900">
                  📅 Actividad reciente
                </h3>
                <div className="overflow-y-auto space-y-2 max-h-40">
                  {student.chapters
                    .sort(
                      (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime(),
                    )
                    .slice(0, 8)
                    .map((chapter, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-center p-2 text-sm bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            chapter.completed ? 'bg-green-500' : 'bg-amber-500'
                          }`}
                        />
                        <span className="flex-1">
                          <span className="font-medium">
                            {getCurriculumTitle(chapter.curriculumId)}
                          </span>
                          <span className="text-gray-600">
                            {' '}
                            - {chapter.chapterId}
                          </span>
                        </span>
                        {typeof chapter.score === 'number' && (
                          <span className="font-medium text-gray-600">
                            {chapter.score}%
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(chapter.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-blue-50 rounded-xl">
                <h3 className="flex gap-2 items-center mb-3 font-semibold text-blue-900">
                  💡 Recomendaciones
                </h3>
                <div className="space-y-2">
                  {Object.keys(CURRICULA).map((curriculumId) => {
                    const nextChapter = getNextChapter(
                      curriculumId,
                      student.chapters,
                    );
                    return (
                      <div key={curriculumId} className="text-sm">
                        <span className="font-medium text-blue-800">
                          {getCurriculumTitle(curriculumId)}:
                        </span>{' '}
                        {nextChapter ? (
                          <span className="text-blue-700">
                            Siguiente capítulo sugerido:{' '}
                            <strong>{nextChapter}</strong>
                          </span>
                        ) : (
                          <span className="font-medium text-green-700">
                            ¡Mundo completado! 🎉
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
