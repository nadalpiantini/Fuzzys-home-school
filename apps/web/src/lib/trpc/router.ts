import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'

const t = initTRPC.create()

export const appRouter = t.router({
  // User management
  getUser: t.procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', input.userId)
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  updateUser: t.procedure
    .input(z.object({
      userId: z.string(),
      name: z.string().optional(),
      email: z.string().optional(),
      preferences: z.any().optional()
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: input.name,
          email: input.email,
          preferences: input.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', input.userId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  // Progress tracking
  getProgress: t.procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', input.userId)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return data
    }),

  updateProgress: t.procedure
    .input(z.object({
      userId: z.string(),
      subject: z.string(),
      level: z.string(),
      score: z.number(),
      timeSpent: z.number()
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: input.userId,
          subject: input.subject,
          level: input.level,
          score: input.score,
          time_spent: input.timeSpent,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  // Games and quizzes
  getGames: t.procedure
    .input(z.object({
      type: z.string().optional(),
      subject: z.string().optional(),
      level: z.string().optional()
    }))
    .query(async ({ input }) => {
      let query = supabase.from('games').select('*')
      
      if (input.type) query = query.eq('type', input.type)
      if (input.subject) query = query.eq('subject', input.subject)
      if (input.level) query = query.eq('level', input.level)

      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data
    }),

  // AI Tutor
  askTutor: t.procedure
    .input(z.object({
      question: z.string(),
      context: z.string().optional(),
      language: z.string().default('es')
    }))
    .mutation(async ({ input }) => {
      // This would call the DeepSeek API
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.question,
          language: input.language
        })
      })

      if (!response.ok) throw new Error('Failed to get AI response')
      return await response.json()
    })
})

export type AppRouter = typeof appRouter
