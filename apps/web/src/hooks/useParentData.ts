import { useState, useEffect } from 'react';
import { Student } from '@/app/api/parents/students/route';
import { ParentAnalyticsData } from '@/app/api/parents/analytics/[studentId]/route';

export interface UseParentStudentsResult {
  students: Student[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseStudentAnalyticsResult {
  data: ParentAnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all students for the current parent
 */
export function useParentStudents(): UseParentStudentsResult {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/parents/students', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
  };
}

/**
 * Hook to fetch analytics data for a specific student
 */
export function useStudentAnalytics(
  studentId: string | null,
  period: 'week' | 'month' | 'year' = 'week'
): UseStudentAnalyticsResult {
  const [data, setData] = useState<ParentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!studentId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/parents/analytics/${studentId}?period=${period}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }

      const responseData = await response.json();
      setData(responseData.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [studentId, period]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}

/**
 * Hook for real-time updates (using polling for now, can be enhanced with WebSockets)
 */
export function useRealTimeStudentData(
  studentId: string | null,
  intervalMs: number = 30000 // 30 seconds
) {
  const analytics = useStudentAnalytics(studentId);

  useEffect(() => {
    if (!studentId) return;

    const interval = setInterval(() => {
      analytics.refetch();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [studentId, intervalMs, analytics.refetch]);

  return analytics;
}

/**
 * Hook to manage parent notification preferences
 */
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState({
    weeklyReports: true,
    achievementAlerts: true,
    streakBreakAlerts: true,
    lowPerformanceAlerts: true,
    emailFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    language: 'es' as 'es' | 'en',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePreferences = async (newPreferences: Partial<typeof preferences>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/parents/notifications/preferences', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...preferences,
          ...newPreferences,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update preferences');
      }

      setPreferences(prev => ({ ...prev, ...newPreferences }));
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/parents/notifications/preferences', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
      // Don't set error for preferences fetch - just use defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}

/**
 * Utility hook to format analytics data for charts
 */
export function useChartData(analyticsData: ParentAnalyticsData | null) {
  return {
    subjectRadarData: analyticsData?.subjectBreakdown.map(subject => ({
      subject: subject.subject,
      mastery: subject.mastery,
    })) || [],

    weeklyProgressData: analyticsData?.weeklyBreakdown.map(day => ({
      day: day.day,
      points: day.points,
      timeSpent: day.timeSpent,
      games: day.gamesPlayed,
    })) || [],

    timeDistributionData: analyticsData?.subjectBreakdown.map(subject => ({
      name: subject.subject,
      value: subject.timeSpent,
      color: getSubjectColor(subject.subject),
    })) || [],

    streakData: analyticsData?.weeklyBreakdown.map((day, index) => ({
      day: day.day,
      streak: day.gamesPlayed > 0 ? 1 : 0,
      index,
    })) || [],
  };
}

/**
 * Helper function to get consistent colors for subjects
 */
function getSubjectColor(subject: string): string {
  const colorMap: { [key: string]: string } = {
    'Matemáticas': '#3B82F6', // Blue
    'Lengua': '#10B981', // Green
    'Ciencias': '#8B5CF6', // Purple
    'Historia': '#F59E0B', // Amber
    'Arte': '#EF4444', // Red
    'Inglés': '#06B6D4', // Cyan
    'Educación Física': '#84CC16', // Lime
  };

  return colorMap[subject] || '#6B7280'; // Gray fallback
}