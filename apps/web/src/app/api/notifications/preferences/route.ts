import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/services/email/emailService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 },
      );
    }

    const preferences = await EmailService.getUserPreferences(userId);

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, preferences' },
        { status: 400 },
      );
    }

    await EmailService.updateUserPreferences(userId, preferences);

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
