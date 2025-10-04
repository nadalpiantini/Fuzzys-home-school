import { NextRequest, NextResponse } from 'next/server';
import { AdvancedInsightsService } from '@/services/ai/advancedInsightsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing studentId parameter' },
        { status: 400 },
      );
    }

    const insights = await AdvancedInsightsService.generateInsights(studentId);

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, action } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing studentId parameter' },
        { status: 400 },
      );
    }

    let result;

    switch (action) {
      case 'generate_insights':
        result = await AdvancedInsightsService.generateInsights(studentId);
        break;
      case 'generate_recommendations':
        result =
          await AdvancedInsightsService.generateRecommendations(studentId);
        break;
      case 'update_profile':
        result = await AdvancedInsightsService.updateLearningProfile(studentId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error processing AI request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
