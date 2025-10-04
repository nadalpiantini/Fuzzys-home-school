import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/services/email/emailService';
import { getTemplatesByCategory } from '@/services/email/emailTemplates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipientId,
      recipientEmail,
      templateId,
      variables,
      priority = 'medium',
      category = 'notification',
      scheduledFor,
    } = body;

    // Validate required fields
    if (!recipientId || !recipientEmail || !templateId) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: recipientId, recipientEmail, templateId',
        },
        { status: 400 },
      );
    }

    // Check if template exists
    const templates = getTemplatesByCategory(category);
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 },
      );
    }

    // Send notification
    const success = await EmailService.sendNotification({
      recipientId,
      recipientEmail,
      templateId,
      variables,
      priority,
      category,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 },
      );
    }

    const history = await EmailService.getNotificationHistory(userId, limit);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
