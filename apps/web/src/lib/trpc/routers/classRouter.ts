import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

const t = initTRPC
  .context<{
    supabase: SupabaseClient;
  }>()
  .create();

// Validation schemas
const createClassSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  subjectId: z.string().uuid(),
  gradeLevel: z.number().min(1).max(12),
  maxStudents: z.number().min(1).max(100).default(30),
  schedule: z
    .object({
      days: z.array(z.number().min(0).max(6)).optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    })
    .optional(),
});

const updateClassSchema = createClassSchema.partial().extend({
  classId: z.string().uuid(),
});

export const classRouter = t.router({
  // Create a new class
  create: t.procedure
    .input(createClassSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const { data, error } = await ctx.supabase
        .from('classes')
        .insert({
          name: input.name,
          description: input.description,
          teacher_id: session.session.user.id,
          subject_id: input.subjectId,
          grade_level: input.gradeLevel,
          max_students: input.maxStudents,
          schedule: input.schedule || {},
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Update a class
  update: t.procedure
    .input(updateClassSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const { classId, ...updateData } = input;

      // Check if user is the teacher of this class
      const { data: classData } = await ctx.supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', classId)
        .single();

      if (classData?.teacher_id !== session.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const { data, error } = await ctx.supabase
        .from('classes')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', classId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Delete a class
  delete: t.procedure
    .input(z.object({ classId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Check if user is the teacher
      const { data: classData } = await ctx.supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', input.classId)
        .single();

      if (classData?.teacher_id !== session.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const { error } = await ctx.supabase
        .from('classes')
        .delete()
        .eq('id', input.classId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { success: true };
    }),

  // Get all classes for a teacher
  getByTeacher: t.procedure
    .input(
      z.object({
        teacherId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const teacherId = input.teacherId || session.session.user.id;

      const { data, error } = await ctx.supabase
        .from('classes')
        .select(
          `
          *,
          subjects (
            id,
            name,
            code,
            icon,
            color
          ),
          enrollments (count)
        `,
        )
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Transform data to include student count
      const classesWithCount = data?.map((cls) => ({
        ...cls,
        studentCount: cls.enrollments?.[0]?.count || 0,
      }));

      return classesWithCount;
    }),

  // Get a single class by ID
  getById: t.procedure
    .input(z.object({ classId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const { data, error } = await ctx.supabase
        .from('classes')
        .select(
          `
          *,
          subjects (
            id,
            name,
            code,
            icon,
            color
          ),
          profiles!teacher_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          enrollments (
            id,
            student_id,
            enrolled_at,
            status,
            profiles!student_id (
              id,
              username,
              full_name,
              avatar_url,
              grade_level
            )
          )
        `,
        )
        .eq('id', input.classId)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Get class by code (for joining)
  getByCode: t.procedure
    .input(z.object({ code: z.string().length(6).toUpperCase() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('classes')
        .select(
          `
          id,
          name,
          description,
          grade_level,
          max_students,
          subjects (
            name,
            icon,
            color
          ),
          profiles!teacher_id (
            username,
            full_name
          ),
          enrollments (count)
        `,
        )
        .eq('code', input.code)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Código de clase no válido',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Check if class is full
      const currentStudents = data.enrollments?.[0]?.count || 0;
      const isFull = currentStudents >= data.max_students;

      return {
        ...data,
        currentStudents,
        isFull,
      };
    }),

  // Toggle class active status
  toggleActive: t.procedure
    .input(
      z.object({
        classId: z.string().uuid(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Check ownership
      const { data: classData } = await ctx.supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', input.classId)
        .single();

      if (classData?.teacher_id !== session.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const { data, error } = await ctx.supabase
        .from('classes')
        .update({
          is_active: input.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.classId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Generate a new class code
  generateCode: t.procedure
    .input(z.object({ classId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Check ownership
      const { data: classData } = await ctx.supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', input.classId)
        .single();

      if (classData?.teacher_id !== session.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Generate new code using the database function
      const { data, error } = await ctx.supabase.rpc('generate_class_code');

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error generando código',
        });
      }

      // Update the class with the new code
      const { data: updatedClass, error: updateError } = await ctx.supabase
        .from('classes')
        .update({
          code: data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.classId)
        .select()
        .single();

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        });
      }

      return updatedClass;
    }),

  // Get class statistics
  getStatistics: t.procedure
    .input(z.object({ classId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Get enrollment count
      const { count: enrollmentCount } = await ctx.supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', input.classId)
        .eq('status', 'active');

      // Get assignment count
      const { count: assignmentCount } = await ctx.supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', input.classId)
        .eq('is_published', true);

      // Get pending submissions
      const { data: assignmentIds } = await ctx.supabase
        .from('assignments')
        .select('id')
        .eq('class_id', input.classId);

      const { count: pendingSubmissions } = await ctx.supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted')
        .in('assignment_id', assignmentIds?.map((a) => a.id) || []);

      // Get recent activity
      const { data: recentActivity } = await ctx.supabase
        .from('submissions')
        .select(
          `
          id,
          submitted_at,
          assignments!inner (
            id,
            title,
            class_id
          ),
          profiles!student_id (
            username,
            full_name
          )
        `,
        )
        .eq('assignments.class_id', input.classId)
        .order('submitted_at', { ascending: false })
        .limit(5);

      return {
        enrollmentCount: enrollmentCount || 0,
        assignmentCount: assignmentCount || 0,
        pendingSubmissions: pendingSubmissions || 0,
        recentActivity: recentActivity || [],
      };
    }),
});

export type ClassRouter = typeof classRouter;
