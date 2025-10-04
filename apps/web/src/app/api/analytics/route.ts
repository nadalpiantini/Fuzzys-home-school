import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import { AnalyticsFilters } from '@/services/analytics/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period =
      (searchParams.get('period') as AnalyticsFilters['period']) || 'week';
    const subjectId = searchParams.get('subjectId') || undefined;
    const classId = searchParams.get('classId') || undefined;
    const gradeLevel = searchParams.get('gradeLevel')
      ? parseInt(searchParams.get('gradeLevel')!)
      : undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const filters: AnalyticsFilters = {
      period,
      subjectId,
      classId,
      gradeLevel,
      startDate,
      endDate,
    };

    const analyticsData = await AnalyticsService.getAnalyticsData(filters);

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error fetching analytics data',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters } = body;

    const report = await AnalyticsService.generateReport(filters);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating analytics report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error generating analytics report',
      },
      { status: 500 },
    );
  }
}
