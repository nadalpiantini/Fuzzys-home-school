import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const t = initTRPC
  .context<{
    supabase: SupabaseClient;
  }>()
  .create();

// Educational content schemas
const educationalContentSchema = z.object({
  id: z.string().uuid(),
  platform_id: z.string().uuid(),
  content_type: z.string(),
  title: z.string(),
  description: z.string().optional(),
  subject: z.string(),
  grade_level: z.number().min(1).max(12),
  difficulty_level: z.number().min(1).max(5),
  content_data: z.any(),
  metadata: z.any().default({}),
  language: z.enum(['es', 'en']).default('es'),
  estimated_duration: z.number().optional(),
  learning_objectives: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  is_published: z.boolean().default(false),
});

const progressUpdateSchema = z.object({
  content_id: z.string().uuid(),
  progress_percentage: z.number().min(0).max(100),
  time_spent: z.number(),
  score: z.number().optional(),
  completion_status: z.enum(['not_started', 'in_progress', 'completed', 'mastered']),
  performance_data: z.any().optional(),
});

const skillAssessmentSchema = z.object({
  skill_name: z.string(),
  subject: z.string(),
  current_level: z.number().min(0).max(1),
  confidence_level: z.number().min(0).max(1),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
});

export const educationalRouter = t.router({
  // =====================================================
  // EDUCATIONAL PLATFORMS
  // =====================================================

  getPlatforms: t.procedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('educational_platforms')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    return data;
  }),

  // =====================================================
  // EDUCATIONAL CONTENT
  // =====================================================

  getContent: t.procedure
    .input(z.object({
      platform_type: z.string().optional(),
      subject: z.string().optional(),
      grade_level: z.number().optional(),
      language: z.enum(['es', 'en']).optional(),
      is_published: z.boolean().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      let query = ctx.supabase
        .from('educational_content')
        .select('*, educational_platforms(name, platform_type)')
        .order('created_at', { ascending: false });

      if (input.platform_type) {
        query = query.eq('educational_platforms.platform_type', input.platform_type);
      }
      if (input.subject) {
        query = query.eq('subject', input.subject);
      }
      if (input.grade_level) {
        query = query.eq('grade_level', input.grade_level);
      }
      if (input.language) {
        query = query.eq('language', input.language);
      }
      if (input.is_published !== undefined) {
        query = query.eq('is_published', input.is_published);
      }

      query = query.range(input.offset, input.offset + input.limit - 1);

      const { data, error } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  getContentById: t.procedure
    .input(z.object({ content_id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('educational_content')
        .select('*, educational_platforms(*)')
        .eq('id', input.content_id)
        .single();

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Increment view count
      await ctx.supabase
        .from('educational_content')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', input.content_id);

      return data;
    }),

  createContent: t.procedure
    .input(educationalContentSchema.omit({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      const { data, error } = await ctx.supabase
        .from('educational_content')
        .insert({
          ...input,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  updateContent: t.procedure
    .input(educationalContentSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('educational_content')
        .update(input)
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  deleteContent: t.procedure
    .input(z.object({ content_id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from('educational_content')
        .delete()
        .eq('id', input.content_id);

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return { success: true };
    }),

  // =====================================================
  // STUDENT PROGRESS
  // =====================================================

  getStudentProgress: t.procedure
    .input(z.object({
      student_id: z.string().uuid().optional(),
      content_id: z.string().uuid().optional(),
      class_id: z.string().uuid().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      let query = ctx.supabase
        .from('student_content_progress')
        .select('*, educational_content(title, subject, grade_level)')
        .order('last_accessed', { ascending: false });

      const student_id = input.student_id || userData.user.id;
      query = query.eq('student_id', student_id);

      if (input.content_id) {
        query = query.eq('content_id', input.content_id);
      }
      if (input.class_id) {
        query = query.eq('class_id', input.class_id);
      }

      const { data, error } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  updateProgress: t.procedure
    .input(progressUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      const progressData: any = {
        student_id: userData.user.id,
        content_id: input.content_id,
        progress_percentage: input.progress_percentage,
        time_spent: input.time_spent,
        last_score: input.score,
        completion_status: input.completion_status,
        performance_data: input.performance_data || {},
        last_accessed: new Date().toISOString(),
      };

      // Update best score if provided and better
      if (input.score !== undefined) {
        const { data: existing } = await ctx.supabase
          .from('student_content_progress')
          .select('best_score')
          .eq('student_id', userData.user.id)
          .eq('content_id', input.content_id)
          .single();

        if (!existing || !existing.best_score || input.score > existing.best_score) {
          progressData.best_score = input.score;
        }
      }

      // Set completed_at if status is completed
      if (input.completion_status === 'completed' || input.completion_status === 'mastered') {
        progressData.completed_at = new Date().toISOString();
      }

      const { data, error } = await ctx.supabase
        .from('student_content_progress')
        .upsert(progressData)
        .select()
        .single();

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Log analytics event
      await ctx.supabase
        .from('learning_analytics')
        .insert({
          student_id: userData.user.id,
          event_type: `content_${input.completion_status}`,
          content_id: input.content_id,
          platform_source: 'educational_platform',
          event_data: {
            progress: input.progress_percentage,
            score: input.score,
            time_spent: input.time_spent,
          },
          performance_metrics: input.performance_data || {},
        });

      return data;
    }),

  // =====================================================
  // SKILL ASSESSMENTS
  // =====================================================

  getSkillAssessments: t.procedure
    .input(z.object({
      student_id: z.string().uuid().optional(),
      subject: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      let query = ctx.supabase
        .from('student_skill_assessments')
        .select('*')
        .order('current_level', { ascending: false });

      const student_id = input.student_id || userData.user.id;
      query = query.eq('student_id', student_id);

      if (input.subject) {
        query = query.eq('subject', input.subject);
      }

      const { data, error } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  updateSkillAssessment: t.procedure
    .input(skillAssessmentSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // First get existing assessment history
      const { data: existing } = await ctx.supabase
        .from('student_skill_assessments')
        .select('assessment_history')
        .eq('student_id', userData.user.id)
        .eq('skill_name', input.skill_name)
        .eq('subject', input.subject)
        .single();

      const newHistoryEntry = {
        date: new Date().toISOString(),
        level: input.current_level,
        confidence: input.confidence_level,
      };

      const assessmentData = {
        student_id: userData.user.id,
        ...input,
        last_assessment_date: new Date().toISOString(),
        assessment_history: existing?.assessment_history
          ? [...(existing.assessment_history as any[]), newHistoryEntry]
          : [newHistoryEntry],
      };

      const { data, error } = await ctx.supabase
        .from('student_skill_assessments')
        .upsert(assessmentData)
        .select()
        .single();

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  // =====================================================
  // CONTENT RECOMMENDATIONS
  // =====================================================

  getRecommendations: t.procedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      const { data, error } = await ctx.supabase
        .from('content_recommendations')
        .select('*, educational_content(*)')
        .eq('student_id', userData.user.id)
        .eq('is_completed', false)
        .eq('is_dismissed', false)
        .gte('expires_at', new Date().toISOString())
        .order('recommendation_score', { ascending: false })
        .limit(input.limit);

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  dismissRecommendation: t.procedure
    .input(z.object({ recommendation_id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('content_recommendations')
        .update({ is_dismissed: true })
        .eq('id', input.recommendation_id)
        .select()
        .single();

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  // =====================================================
  // H5P INTEGRATION
  // =====================================================

  h5p: t.router({
    getContent: t.procedure
      .input(z.object({ content_id: z.string() }))
      .query(async ({ input, ctx }) => {
        const { data, error } = await ctx.supabase
          .from('educational_content')
          .select('*')
          .eq('id', input.content_id)
          .eq('content_type', 'h5p')
          .single();

        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      }),

    saveProgress: t.procedure
      .input(z.object({
        content_id: z.string(),
        progress: z.number(),
        score: z.number().optional(),
        interaction_data: z.any().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
        if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

        const progressData = {
          student_id: userData.user.id,
          content_id: input.content_id,
          progress_percentage: input.progress,
          last_score: input.score,
          performance_data: {
            h5p_interaction: input.interaction_data,
          },
          last_accessed: new Date().toISOString(),
        };

        const { data, error } = await ctx.supabase
          .from('student_content_progress')
          .upsert(progressData)
          .select()
          .single();

        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      }),
  }),

  // =====================================================
  // FEATURED CONTENT
  // =====================================================

  getFeaturedContent: t.procedure
    .input(z.object({
      limit: z.number().default(6),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('educational_content')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(input.limit);

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  // =====================================================
  // LEARNING ANALYTICS
  // =====================================================

  logAnalytics: t.procedure
    .input(z.object({
      event_type: z.string(),
      content_id: z.string().uuid().optional(),
      quiz_id: z.string().uuid().optional(),
      session_id: z.string().uuid().optional(),
      class_id: z.string().uuid().optional(),
      platform_source: z.string(),
      event_data: z.any(),
      performance_metrics: z.any().optional(),
      session_duration: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      const { data, error } = await ctx.supabase
        .from('learning_analytics')
        .insert({
          student_id: userData.user.id,
          ...input,
          device_info: {
            userAgent: 'unknown',
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  getAnalyticsSummary: t.procedure
    .input(z.object({
      student_id: z.string().uuid().optional(),
      date_from: z.string().optional(),
      date_to: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      const student_id = input.student_id || userData.user.id;

      let query = ctx.supabase
        .from('learning_analytics')
        .select('*')
        .eq('student_id', student_id)
        .order('timestamp', { ascending: false });

      if (input.date_from) {
        query = query.gte('timestamp', input.date_from);
      }
      if (input.date_to) {
        query = query.lte('timestamp', input.date_to);
      }

      const { data, error } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Process analytics data into summary
      const summary = {
        total_events: data.length,
        unique_content: new Set(data.map(d => d.content_id).filter(Boolean)).size,
        total_time_spent: data.reduce((acc, d) => acc + (d.session_duration || 0), 0),
        event_breakdown: data.reduce((acc, d) => {
          acc[d.event_type] = (acc[d.event_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        daily_activity: data.reduce((acc, d) => {
          const date = new Date(d.timestamp).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return summary;
    }),
});