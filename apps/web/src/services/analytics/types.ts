// Analytics Types for Teacher Dashboard
export interface AnalyticsOverview {
  totalStudents: number;
  activeClasses: number;
  averageScore: number;
  completionRate: number;
  totalTimeSpent: number; // in minutes
  averageSessionTime: number; // in minutes
  engagementScore: number; // 0-100
}

export interface SubjectPerformance {
  subject: string;
  subjectId: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  totalStudents: number;
  averageTimeSpent: number;
  completionRate: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudentActivity {
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  action: string;
  subject: string;
  score?: number;
  timeSpent: number; // in minutes
  timestamp: string;
  activityType: 'game' | 'quiz' | 'chapter' | 'tutor' | 'rally';
}

export interface TopStudent {
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  totalScore: number;
  gamesPlayed: number;
  averageScore: number;
  streakDays: number;
  lastActivity: string;
  improvement: number; // percentage change
}

export interface PopularActivity {
  activityId: string;
  activityName: string;
  activityType: string;
  subject: string;
  playCount: number;
  averageScore: number;
  completionRate: number;
  difficulty: string;
  thumbnailUrl?: string;
}

export interface ChapterTiming {
  chapterId: string;
  chapterName: string;
  subject: string;
  averageTimeSpent: number; // in minutes
  totalAttempts: number;
  completionRate: number;
  difficulty: string;
  studentsCompleted: number;
}

export interface HeatmapData {
  hour: number;
  day: number; // 0-6 (Sunday-Saturday)
  activityCount: number;
  averageScore: number;
  totalTimeSpent: number;
}

export interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  retentionRate: number;
}

export interface AnalyticsFilters {
  period: 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  subjectId?: string;
  classId?: string;
  gradeLevel?: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  subjectPerformance: SubjectPerformance[];
  recentActivity: StudentActivity[];
  topStudents: TopStudent[];
  popularActivities: PopularActivity[];
  chapterTiming: ChapterTiming[];
  heatmapData: HeatmapData[];
  engagementMetrics: EngagementMetrics;
}

export interface AnalyticsReport {
  generatedAt: string;
  period: string;
  filters: AnalyticsFilters;
  data: AnalyticsData;
  insights: string[];
  recommendations: string[];
}
