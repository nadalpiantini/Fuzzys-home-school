-- Email System Migration
-- This migration creates tables for email notifications and preferences

-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('notification', 'alert', 'report', 'engagement')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email notifications table
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  template_id TEXT NOT NULL REFERENCES public.email_templates(id),
  variables JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email preferences table
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  categories JSONB DEFAULT '{
    "progress": true,
    "achievements": true,
    "alerts": true,
    "reports": false,
    "engagement": true
  }',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('immediate', 'daily', 'weekly', 'monthly')),
  quiet_hours JSONB DEFAULT '{
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient ON public.email_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_scheduled ON public.email_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_notifications_category ON public.email_notifications(category);
CREATE INDEX IF NOT EXISTS idx_email_preferences_user ON public.email_preferences(user_id);

-- Insert default email templates
INSERT INTO public.email_templates (id, name, subject, html_content, text_content, variables, category) VALUES
(
  'progress-update',
  'Progress Update',
  '📈 Actualización de Progreso - {{studentName}}',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Progress Update</title></head><body><h1>Progress Update for {{studentName}}</h1><p>Average Score: {{averageScore}}%</p><p>Improvement: {{improvement}}%</p></body></html>',
  'Progress Update for {{studentName}}\n\nAverage Score: {{averageScore}}%\nImprovement: {{improvement}}%',
  ARRAY['studentName', 'averageScore', 'improvement', 'totalTimeSpent', 'sessionsCount', 'gamesCompleted', 'subjectsCount', 'achievements', 'strongSubjects', 'improvementAreas', 'dashboardUrl'],
  'notification'
),
(
  'achievement-badge',
  'Achievement Badge',
  '🏆 ¡Nueva Insignia Desbloqueada! - {{studentName}}',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Achievement Badge</title></head><body><h1>New Badge Unlocked!</h1><p>{{badgeName}}: {{badgeDescription}}</p></body></html>',
  'New Badge Unlocked!\n\n{{badgeName}}: {{badgeDescription}}',
  ARRAY['studentName', 'badgeIcon', 'badgeName', 'badgeDescription', 'achievementReason', 'totalPoints', 'totalBadges', 'maxBadges', 'currentStreak', 'currentLevel', 'nextGoals', 'profileUrl'],
  'engagement'
),
(
  'alert-struggling',
  'Student Struggling Alert',
  '⚠️ Atención: {{studentName}} necesita apoyo',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Student Alert</title></head><body><h1>Student Needs Support</h1><p>{{alertReason}}</p><p>Average Score: {{averageScore}}%</p></body></html>',
  'Student Needs Support\n\n{{alertReason}}\nAverage Score: {{averageScore}}%',
  ARRAY['studentName', 'alertReason', 'averageScore', 'scoreDecline', 'timeframe', 'timeSpent', 'timeDecline', 'strugglingSubjects', 'suggestions', 'dashboardUrl'],
  'alert'
),
(
  'weekly-report',
  'Weekly Report',
  '📊 Reporte Semanal - {{studentName}}',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Weekly Report</title></head><body><h1>Weekly Report</h1><p>Week: {{weekStart}} to {{weekEnd}}</p><p>Average Score: {{averageScore}}%</p></body></html>',
  'Weekly Report\n\nWeek: {{weekStart}} to {{weekEnd}}\nAverage Score: {{averageScore}}%',
  ARRAY['studentName', 'weekStart', 'weekEnd', 'averageScore', 'scoreTrend', 'totalTimeSpent', 'averageSessionLength', 'activitiesCompleted', 'subjectsCount', 'subjectPerformance', 'achievements', 'nextWeekGoals', 'dashboardUrl'],
  'report'
);

-- Create RLS policies
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- Email templates are readable by all authenticated users
CREATE POLICY "Email templates are viewable by authenticated users" ON public.email_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Email notifications are only accessible by the recipient
CREATE POLICY "Users can view their own notifications" ON public.email_notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can insert their own notifications" ON public.email_notifications
  FOR INSERT WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications" ON public.email_notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Email preferences are only accessible by the user
CREATE POLICY "Users can view their own preferences" ON public.email_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.email_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.email_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to process scheduled notifications
CREATE OR REPLACE FUNCTION public.process_scheduled_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update pending notifications that are due
  UPDATE public.email_notifications
  SET status = 'sent',
      sent_at = NOW()
  WHERE status = 'pending'
    AND scheduled_for <= NOW();
  
  -- This would typically trigger actual email sending
  -- For now, we just mark them as sent
END;
$$;

-- Create function to get notification statistics
CREATE OR REPLACE FUNCTION public.get_notification_stats(user_id UUID)
RETURNS TABLE(
  total_notifications BIGINT,
  sent_notifications BIGINT,
  pending_notifications BIGINT,
  failed_notifications BIGINT,
  last_notification TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE status = 'sent') as sent_notifications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_notifications,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_notifications,
    MAX(created_at) as last_notification
  FROM public.email_notifications
  WHERE recipient_id = user_id;
END;
$$;
