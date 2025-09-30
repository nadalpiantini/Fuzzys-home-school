import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

const t = initTRPC
  .context<{
    supabase: SupabaseClient;
  }>()
  .create();

export const enrollmentRouter = t.router({
  // Join a class by code
  joinByCode: t.procedure
    .input(
      z.object({
        code: z.string().length(6).toUpperCase(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // First, find the class by code
      const { data: classData, error: classError } = await ctx.supabase
        .from('classes')
        .select('id, name, max_students')
        .eq('code', input.code)
        .eq('is_active', true)
        .single();

      if (classError || !classData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Código de clase no válido o clase inactiva',
        });
      }

      // Check if student is already enrolled
      const { data: existingEnrollment } = await ctx.supabase
        .from('enrollments')
        .select('id, status')
        .eq('class_id', classData.id)
        .eq('student_id', session.session.user.id)
        .single();

      if (existingEnrollment) {
        if (existingEnrollment.status === 'active') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Ya estás inscrito en esta clase',
          });
        }
        // Reactivate enrollment if it was inactive
        const { data, error } = await ctx.supabase
          .from('enrollments')
          .update({
            status: 'active',
            enrolled_at: new Date().toISOString(),
          })
          .eq('id', existingEnrollment.id)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          });
        }

        return { ...data, className: classData.name };
      }

      // Check if class is full
      const { count } = await ctx.supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classData.id)
        .eq('status', 'active');

      if (count && count >= classData.max_students) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'La clase ha alcanzado el límite de estudiantes',
        });
      }

      // Create new enrollment
      const { data, error } = await ctx.supabase
        .from('enrollments')
        .insert({
          class_id: classData.id,
          student_id: session.session.user.id,
          enrollment_code: input.code,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { ...data, className: classData.name };
    }),

  // Get all students in a class
  getStudents: t.procedure
    .input(
      z.object({
        classId: z.string().uuid(),
        status: z
          .enum(['active', 'inactive', 'pending', 'blocked', 'all'])
          .default('active'),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      let query = ctx.supabase
        .from('enrollments')
        .select(
          `
          id,
          enrolled_at,
          status,
          notes,
          profiles!student_id (
            id,
            username,
            full_name,
            avatar_url,
            grade_level
          ),
          student_progress (
            total_points,
            games_played,
            last_activity
          )
        `,
        )
        .eq('class_id', input.classId)
        .order('enrolled_at', { ascending: true });

      if (input.status !== 'all') {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Remove a student from a class
  removeStudent: t.procedure
    .input(
      z.object({
        enrollmentId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Check if user is the teacher of this class
      const { data: enrollmentData } = await ctx.supabase
        .from('enrollments')
        .select(
          `
          id,
          classes!inner (
            teacher_id
          )
        `,
        )
        .eq('id', input.enrollmentId)
        .single();

      if (
        !enrollmentData ||
        (enrollmentData.classes as any)?.teacher_id !== session.session.user.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Soft delete by setting status to inactive
      const { data, error } = await ctx.supabase
        .from('enrollments')
        .update({
          status: 'inactive',
        })
        .eq('id', input.enrollmentId)
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

  // Get all classes for a student
  getMyClasses: t.procedure
    .input(
      z.object({
        status: z.enum(['active', 'inactive', 'all']).default('active'),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      let query = ctx.supabase
        .from('enrollments')
        .select(
          `
          id,
          enrolled_at,
          status,
          classes!inner (
            id,
            name,
            description,
            code,
            grade_level,
            is_active,
            subjects (
              name,
              icon,
              color
            ),
            profiles!teacher_id (
              username,
              full_name
            )
          )
        `,
        )
        .eq('student_id', session.session.user.id)
        .order('enrolled_at', { ascending: false });

      if (input.status !== 'all') {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Flatten the data structure
      const classes = data?.map((enrollment) => ({
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolled_at,
        status: enrollment.status,
        ...enrollment.classes,
      }));

      return classes;
    }),

  // Leave a class (student)
  leaveClass: t.procedure
    .input(
      z.object({
        classId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const { data, error } = await ctx.supabase
        .from('enrollments')
        .update({
          status: 'inactive',
        })
        .eq('class_id', input.classId)
        .eq('student_id', session.session.user.id)
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

  // Send invitation (by email or generate link)
  sendInvitation: t.procedure
    .input(
      z.object({
        classId: z.string().uuid(),
        emails: z.array(z.string().email()).optional(),
        generateLink: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Get class details and verify teacher
      const { data: classData, error: classError } = await ctx.supabase
        .from('classes')
        .select('id, name, code, teacher_id')
        .eq('id', input.classId)
        .single();

      if (classError || !classData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Clase no encontrada',
        });
      }

      if (classData.teacher_id !== session.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Generate invitation link
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const invitationLink = `${baseUrl}/student/join?code=${classData.code}`;

      // If emails provided, send invitations (would need email service)
      if (input.emails && input.emails.length > 0) {
        // TODO: Implement email sending with SendGrid/Resend
        // For now, just return the link
        console.log('Would send emails to:', input.emails);
      }

      return {
        invitationLink,
        code: classData.code,
        className: classData.name,
      };
    }),

  // Update enrollment status
  updateStatus: t.procedure
    .input(
      z.object({
        enrollmentId: z.string().uuid(),
        status: z.enum(['active', 'inactive', 'pending', 'blocked']),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Verify teacher permissions
      const { data: enrollmentData } = await ctx.supabase
        .from('enrollments')
        .select(
          `
          id,
          classes!inner (
            teacher_id
          )
        `,
        )
        .eq('id', input.enrollmentId)
        .single();

      if (
        !enrollmentData ||
        (enrollmentData.classes as any)?.teacher_id !== session.session.user.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const { data, error } = await ctx.supabase
        .from('enrollments')
        .update({
          status: input.status,
          notes: input.notes,
        })
        .eq('id', input.enrollmentId)
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

  // Check enrollment status for a specific class
  checkEnrollment: t.procedure
    .input(
      z.object({
        classId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const { data, error } = await ctx.supabase
        .from('enrollments')
        .select('id, status')
        .eq('class_id', input.classId)
        .eq('student_id', session.session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return {
        isEnrolled: !!data && data.status === 'active',
        enrollmentId: data?.id,
        status: data?.status || 'not_enrolled',
      };
    }),
});

export type EnrollmentRouter = typeof enrollmentRouter;
