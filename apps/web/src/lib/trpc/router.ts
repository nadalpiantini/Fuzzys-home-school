import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { classRouter } from './routers/classRouter';
import { enrollmentRouter } from './routers/enrollmentRouter';
import { assignmentRouter } from './routers/assignmentRouter';
import { educationalRouter } from './routers/educationalRouter';
import { adaptiveRouter } from './routers/adaptiveRouter';
import { liveGameRouter } from './routers/liveGameRouter';
import type { SupabaseClient } from '@supabase/supabase-js';

const t = initTRPC
  .context<{
    supabase: SupabaseClient;
  }>()
  .create();

export const appRouter = t.router({
  // Class Management System
  classes: classRouter,
  enrollments: enrollmentRouter,
  assignments: assignmentRouter,
  
  // Educational Platform System
  educational: educationalRouter,
  adaptive: adaptiveRouter,
  liveGame: liveGameRouter,

  // User management
  getUser: t.procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('users')
        .select('*')
        .eq('id', input.userId)
        .single();

      if (error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      return data;
    }),

  updateUser: t.procedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().optional(),
        email: z.string().optional(),
        preferences: z.any().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('users')
        .update({
          name: input.name,
          email: input.email,
          preferences: input.preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.userId)
        .select()
        .single();

      if (error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      return data;
    }),

  // Progress tracking
  getProgress: t.procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', input.userId)
        .order('created_at', { ascending: false });

      if (error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      return data;
    }),

  updateProgress: t.procedure
    .input(
      z.object({
        userId: z.string(),
        subject: z.string(),
        level: z.string(),
        score: z.number(),
        timeSpent: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('user_progress')
        .insert({
          user_id: input.userId,
          subject: input.subject,
          level: input.level,
          score: input.score,
          time_spent: input.timeSpent,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      return data;
    }),

  // Games and quizzes
  getGames: t.procedure
    .input(
      z.object({
        type: z.string().optional(),
        subject: z.string().optional(),
        level: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      let query = ctx.supabase.from('games').select('*');

      if (input.type) query = query.eq('type', input.type);
      if (input.subject) query = query.eq('subject', input.subject);
      if (input.level) query = query.eq('level', input.level);

      const { data, error } = await query;
      if (error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      return data;
    }),

  // AI Tutor
  askTutor: t.procedure
    .input(
      z.object({
        question: z.string(),
        context: z.string().optional(),
        language: z.string().default('es'),
      }),
    )
    .mutation(async ({ input }) => {
      // This would call the DeepSeek API
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.question,
          language: input.language,
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      return await response.json();
    }),
});;

export type AppRouter = typeof appRouter;
