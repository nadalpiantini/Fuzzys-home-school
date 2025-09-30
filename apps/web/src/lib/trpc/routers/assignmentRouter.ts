import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

const t = initTRPC
  .context<{
    supabase: SupabaseClient;
  }>()
  .create();

// Validation schemas
const createAssignmentSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  type: z
    .enum(['homework', 'quiz', 'project', 'exam', 'activity'])
    .default('homework'),
  dueDate: z.string().datetime().optional(),
  points: z.number().min(1).max(1000).default(100),
  instructions: z.object({}).optional(),
  resources: z.array(z.string()).optional(),
  rubric: z.object({}).optional(),
  allowLateSubmission: z.boolean().default(true),
});

const updateAssignmentSchema = createAssignmentSchema.partial().extend({
  assignmentId: z.string().uuid(),
});

const gradeSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  grade: z.number().min(0).max(100),
  feedback: z.string().optional(),
});

export const assignmentRouter = t.router({
  // Create a new assignment
  create: t.procedure
    .input(createAssignmentSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Verify teacher owns the class
      const { data: classData } = await ctx.supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', input.classId)
        .single();

      if (classData?.teacher_id !== session.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const { data, error } = await ctx.supabase
        .from('assignments')
        .insert({
          class_id: input.classId,
          title: input.title,
          description: input.description,
          type: input.type,
          due_date: input.dueDate,
          points: input.points,
          instructions: input.instructions || {},
          resources: input.resources || [],
          rubric: input.rubric || {},
          allow_late_submission: input.allowLateSubmission,
          created_by: session.session.user.id,
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

  // Update an assignment
  update: t.procedure
    .input(updateAssignmentSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const { assignmentId, ...updateData } = input;

      // Verify teacher owns the assignment
      const { data: assignmentData } = await ctx.supabase
        .from('assignments')
        .select(
          `
          id,
          classes!inner (
            teacher_id
          )
        `,
        )
        .eq('id', assignmentId)
        .single();

      if (
        (assignmentData?.classes as any)?.teacher_id !== session.session.user.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const { data, error } = await ctx.supabase
        .from('assignments')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assignmentId)
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

  // Delete an assignment
  delete: t.procedure
    .input(z.object({ assignmentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Verify teacher owns the assignment
      const { data: assignmentData } = await ctx.supabase
        .from('assignments')
        .select(
          `
          id,
          classes!inner (
            teacher_id
          )
        `,
        )
        .eq('id', input.assignmentId)
        .single();

      if (
        (assignmentData?.classes as any)?.teacher_id !== session.session.user.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const { error } = await ctx.supabase
        .from('assignments')
        .delete()
        .eq('id', input.assignmentId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { success: true };
    }),

  // Get assignments for a class
  getByClass: t.procedure
    .input(
      z.object({
        classId: z.string().uuid(),
        includeUnpublished: z.boolean().default(false),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      let query = ctx.supabase
        .from('assignments')
        .select(
          `
          *,
          classes!inner (
            teacher_id
          )
        `,
        )
        .eq('class_id', input.classId)
        .order('created_at', { ascending: false });

      // If not including unpublished, filter for published only
      if (!input.includeUnpublished) {
        query = query.eq('is_published', true);
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

  // Get a single assignment
  getById: t.procedure
    .input(z.object({ assignmentId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const { data, error } = await ctx.supabase
        .from('assignments')
        .select(
          `
          *,
          classes!inner (
            id,
            name,
            teacher_id
          )
        `,
        )
        .eq('id', input.assignmentId)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Publish/unpublish an assignment
  togglePublished: t.procedure
    .input(
      z.object({
        assignmentId: z.string().uuid(),
        isPublished: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Verify teacher owns the assignment
      const { data: assignmentData } = await ctx.supabase
        .from('assignments')
        .select(
          `
          id,
          classes!inner (
            teacher_id
          )
        `,
        )
        .eq('id', input.assignmentId)
        .single();

      if (
        (assignmentData?.classes as any)?.teacher_id !== session.session.user.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const { data, error } = await ctx.supabase
        .from('assignments')
        .update({
          is_published: input.isPublished,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.assignmentId)
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

  // Get submissions for an assignment
  getSubmissions: t.procedure
    .input(
      z.object({
        assignmentId: z.string().uuid(),
        status: z
          .enum(['draft', 'submitted', 'graded', 'returned', 'all'])
          .default('all'),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Verify teacher owns the assignment
      const { data: assignmentData } = await ctx.supabase
        .from('assignments')
        .select(
          `
          id,
          classes!inner (
            teacher_id
          )
        `,
        )
        .eq('id', input.assignmentId)
        .single();

      if (
        (assignmentData?.classes as any)?.teacher_id !== session.session.user.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      let query = ctx.supabase
        .from('submissions')
        .select(
          `
          *,
          profiles!student_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `,
        )
        .eq('assignment_id', input.assignmentId)
        .order('submitted_at', { ascending: false });

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

  // Grade a submission
  gradeSubmission: t.procedure
    .input(gradeSubmissionSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Verify teacher owns the assignment
      const { data: submissionData } = await ctx.supabase
        .from('submissions')
        .select(
          `
          id,
          assignment_id,
          assignments!inner (
            classes!inner (
              teacher_id
            )
          )
        `,
        )
        .eq('id', input.submissionId)
        .single();

      if (
        (submissionData?.assignments as any)?.classes?.teacher_id !==
        session.session.user.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const { data, error } = await ctx.supabase
        .from('submissions')
        .update({
          grade: input.grade,
          feedback: input.feedback,
          status: 'graded',
          graded_at: new Date().toISOString(),
          graded_by: session.session.user.id,
        })
        .eq('id', input.submissionId)
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

  // Get assignment statistics
  getStatistics: t.procedure
    .input(z.object({ assignmentId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Verify teacher owns the assignment
      const { data: assignmentData } = await ctx.supabase
        .from('assignments')
        .select(
          `
          id,
          classes!inner (
            teacher_id
          )
        `,
        )
        .eq('id', input.assignmentId)
        .single();

      if (
        (assignmentData?.classes as any)?.teacher_id !== session.session.user.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Get submission counts
      const { count: totalSubmissions } = await ctx.supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('assignment_id', input.assignmentId);

      const { count: gradedSubmissions } = await ctx.supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('assignment_id', input.assignmentId)
        .eq('status', 'graded');

      const { count: pendingSubmissions } = await ctx.supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('assignment_id', input.assignmentId)
        .eq('status', 'submitted');

      // Get average grade
      const { data: gradeData } = await ctx.supabase
        .from('submissions')
        .select('grade')
        .eq('assignment_id', input.assignmentId)
        .eq('status', 'graded')
        .not('grade', 'is', null);

      const averageGrade =
        gradeData && gradeData.length > 0
          ? gradeData.reduce((sum, sub) => sum + (sub.grade || 0), 0) /
            gradeData.length
          : 0;

      return {
        totalSubmissions: totalSubmissions || 0,
        gradedSubmissions: gradedSubmissions || 0,
        pendingSubmissions: pendingSubmissions || 0,
        averageGrade: Math.round(averageGrade * 100) / 100,
      };
    }),

  // Get my assignments (for students)
  getMyAssignments: t.procedure
    .input(
      z.object({
        classId: z.string().uuid().optional(),
        status: z.enum(['active', 'completed', 'all']).default('active'),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data: session } = await ctx.supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Get enrolled classes
      let classQuery = ctx.supabase
        .from('enrollments')
        .select('class_id')
        .eq('student_id', session.session.user.id)
        .eq('status', 'active');

      if (input.classId) {
        classQuery = classQuery.eq('class_id', input.classId);
      }

      const { data: enrollments } = await classQuery;
      const classIds = enrollments?.map((e) => e.class_id) || [];

      if (classIds.length === 0) {
        return [];
      }

      // Get assignments for enrolled classes
      let assignmentQuery = ctx.supabase
        .from('assignments')
        .select(
          `
          *,
          classes!inner (
            id,
            name,
            subjects (
              name,
              icon,
              color
            )
          )
        `,
        )
        .in('class_id', classIds)
        .eq('is_published', true)
        .order('due_date', { ascending: true });

      const { data: assignments, error } = await assignmentQuery;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Get submissions for these assignments
      const { data: submissions } = await ctx.supabase
        .from('submissions')
        .select('assignment_id, status, grade, submitted_at')
        .eq('student_id', session.session.user.id)
        .in('assignment_id', assignments?.map((a) => a.id) || []);

      // Combine assignments with submission data
      const assignmentsWithSubmissions = assignments?.map((assignment) => {
        const submission = submissions?.find(
          (s) => s.assignment_id === assignment.id,
        );
        return {
          ...assignment,
          submission: submission || null,
          isSubmitted: !!submission,
          isGraded: submission?.status === 'graded',
          grade: submission?.grade,
        };
      });

      // Filter by status
      if (input.status === 'completed') {
        return assignmentsWithSubmissions?.filter((a) => a.isSubmitted) || [];
      } else if (input.status === 'active') {
        return assignmentsWithSubmissions?.filter((a) => !a.isSubmitted) || [];
      }

      return assignmentsWithSubmissions || [];
    }),
});

export type AssignmentRouter = typeof assignmentRouter;
