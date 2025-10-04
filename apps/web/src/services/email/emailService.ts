import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: 'notification' | 'alert' | 'report' | 'engagement';
}

export interface EmailNotification {
  id: string;
  recipientId: string;
  recipientEmail: string;
  templateId: string;
  variables: Record<string, any>;
  scheduledFor?: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

export interface EmailPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  categories: {
    progress: boolean;
    achievements: boolean;
    alerts: boolean;
    reports: boolean;
    engagement: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

export class EmailService {
  /**
   * Send email notification
   */
  static async sendNotification(
    notification: Omit<EmailNotification, 'id' | 'sentAt' | 'status'>,
  ): Promise<boolean> {
    try {
      // Check user preferences
      const preferences = await this.getUserPreferences(
        notification.recipientId,
      );
      if (!preferences.emailNotifications) {
        console.log('User has disabled email notifications');
        return false;
      }

      // Check quiet hours
      if (
        preferences.quietHours.enabled &&
        this.isInQuietHours(preferences.quietHours)
      ) {
        // Schedule for later
        await this.scheduleNotification({
          ...notification,
          scheduledFor: this.getNextAvailableTime(preferences.quietHours),
        });
        return true;
      }

      // Get template
      const template = await this.getTemplate(notification.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Process template with variables
      const processedSubject = this.processTemplate(
        template.subject,
        notification.variables,
      );
      const processedHtml = this.processTemplate(
        template.htmlContent,
        notification.variables,
      );
      const processedText = this.processTemplate(
        template.textContent,
        notification.variables,
      );

      // Send email (using your preferred email service)
      const emailSent = await this.sendEmail({
        to: notification.recipientEmail,
        subject: processedSubject,
        html: processedHtml,
        text: processedText,
      });

      if (emailSent) {
        // Record in database
        await this.recordNotification({
          ...notification,
          status: 'sent',
          sentAt: new Date(),
        });
      }

      return emailSent;
    } catch (error) {
      console.error('Error sending notification:', error);
      await this.recordNotification({
        ...notification,
        status: 'failed',
      });
      return false;
    }
  }

  /**
   * Schedule email notification
   */
  static async scheduleNotification(
    notification: Omit<EmailNotification, 'id' | 'sentAt' | 'status'>,
  ): Promise<string> {
    const { data, error } = await supabase
      .from('email_notifications')
      .insert({
        recipient_id: notification.recipientId,
        recipient_email: notification.recipientEmail,
        template_id: notification.templateId,
        variables: notification.variables,
        scheduled_for: notification.scheduledFor,
        status: 'pending',
        priority: notification.priority,
        category: notification.category,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Get user email preferences
   */
  static async getUserPreferences(userId: string): Promise<EmailPreferences> {
    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Return default preferences
      return {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        categories: {
          progress: true,
          achievements: true,
          alerts: true,
          reports: false,
          engagement: true,
        },
        frequency: 'daily',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
      };
    }

    return data;
  }

  /**
   * Update user email preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<EmailPreferences>,
  ): Promise<void> {
    const { error } = await supabase.from('email_preferences').upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  /**
   * Get email template
   */
  static async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Process template with variables
   */
  static processTemplate(
    template: string,
    variables: Record<string, any>,
  ): string {
    let processed = template;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    });

    return processed;
  }

  /**
   * Check if current time is in quiet hours
   */
  static isInQuietHours(quietHours: { start: string; end: string }): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const startTime = this.timeToMinutes(quietHours.start);
    const endTime = this.timeToMinutes(quietHours.end);

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Get next available time outside quiet hours
   */
  static getNextAvailableTime(quietHours: {
    start: string;
    end: string;
  }): Date {
    const now = new Date();
    const endTime = this.timeToMinutes(quietHours.end);

    const nextAvailable = new Date(now);
    nextAvailable.setHours(Math.floor(endTime / 60));
    nextAvailable.setMinutes(endTime % 60);
    nextAvailable.setSeconds(0);

    return nextAvailable;
  }

  /**
   * Convert time string to minutes
   */
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Send email using your preferred service (Resend, SendGrid, etc.)
   */
  static async sendEmail({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<boolean> {
    try {
      // Example using Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'noreply@fuzzyshomeschool.com',
          to: [to],
          subject,
          html,
          text,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Record notification in database
   */
  static async recordNotification(
    notification: Omit<EmailNotification, 'id'>,
  ): Promise<void> {
    const { error } = await supabase.from('email_notifications').insert({
      recipient_id: notification.recipientId,
      recipient_email: notification.recipientEmail,
      template_id: notification.templateId,
      variables: notification.variables,
      scheduled_for: notification.scheduledFor,
      sent_at: notification.sentAt,
      status: notification.status,
      priority: notification.priority,
      category: notification.category,
    });

    if (error) throw error;
  }

  /**
   * Process scheduled notifications
   */
  static async processScheduledNotifications(): Promise<void> {
    const now = new Date();

    const { data: notifications, error } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString());

    if (error) throw error;

    for (const notification of notifications || []) {
      await this.sendNotification(notification);
    }
  }

  /**
   * Get notification history for user
   */
  static async getNotificationHistory(
    userId: string,
    limit = 50,
  ): Promise<EmailNotification[]> {
    const { data, error } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}
