import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const t = initTRPC
  .context<{
    supabase: SupabaseClient;
  }>()
  .create();

// Schemas for live gaming
const createSessionSchema = z.object({
  game_type: z.enum(['live_quiz', 'collaborative_puzzle', 'team_challenge', 'speed_math', 'vocabulary_race']),
  content_id: z.string().uuid().optional(),
  class_id: z.string().uuid().optional(),
  max_participants: z.number().min(1).max(100).default(30),
  settings: z.object({
    time_per_question: z.number().optional(),
    show_leaderboard: z.boolean().default(true),
    allow_late_join: z.boolean().default(true),
    team_mode: z.boolean().default(false),
    randomize_questions: z.boolean().default(true),
    show_correct_answers: z.boolean().default(true),
  }).optional(),
  is_public: z.boolean().default(false),
});

const joinSessionSchema = z.object({
  session_code: z.string(),
  display_name: z.string().min(1).max(30),
  avatar_url: z.string().optional(),
  team_id: z.string().uuid().optional(),
});

const submitAnswerSchema = z.object({
  session_id: z.string().uuid(),
  question_index: z.number(),
  answer: z.any(),
  time_taken: z.number(),
});

const updateSessionStateSchema = z.object({
  session_id: z.string().uuid(),
  state: z.enum(['waiting', 'active', 'paused', 'completed', 'cancelled']),
  game_state: z.any().optional(),
});

export const liveGameRouter = t.router({
  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  createSession: t.procedure
    .input(createSessionSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // Generate unique session code
      const { data: sessionCode, error: codeError } = await ctx.supabase
        .rpc('generate_session_code');

      if (codeError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: codeError.message });

      // Create the session
      const { data: session, error: sessionError } = await ctx.supabase
        .from('game_sessions')
        .insert({
          session_code: sessionCode,
          host_id: userData.user.id,
          game_type: input.game_type,
          content_id: input.content_id,
          class_id: input.class_id,
          max_participants: input.max_participants,
          settings: input.settings || {},
          is_public: input.is_public,
          session_status: 'waiting',
          game_state: {
            current_question: 0,
            scores: {},
            started_at: null,
          },
        })
        .select()
        .single();

      if (sessionError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: sessionError.message });

      // Create realtime channel for the session
      const channelName = `game-session-${session.id}`;

      // The host will manage the channel on the client side
      // Return session with channel info
      return {
        ...session,
        channel_name: channelName,
        join_url: `/games/live/${session.session_code}`,
      };
    }),

  joinSession: t.procedure
    .input(joinSessionSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: userData } = await ctx.supabase.auth.getUser();

      // Get session by code
      const { data: session, error: sessionError } = await ctx.supabase
        .from('game_sessions')
        .select('*')
        .eq('session_code', input.session_code)
        .eq('session_status', 'waiting')
        .single();

      if (sessionError || !session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found or already started'
        });
      }

      // Check if session is full
      if (session.current_participants >= session.max_participants) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Session is full'
        });
      }

      // Add participant
      const { data: participant, error: participantError } = await ctx.supabase
        .from('game_participants')
        .insert({
          session_id: session.id,
          participant_id: userData?.user?.id || null,
          display_name: input.display_name,
          avatar_url: input.avatar_url,
          team_id: input.team_id,
          connection_status: 'connected',
          device_info: {
            userAgent: 'unknown',
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (participantError) {
        // Check if participant already exists
        if (participantError.code === '23505') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You have already joined this session'
          });
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: participantError.message });
      }

      // Return session and participant info
      return {
        session,
        participant,
        channel_name: `game-session-${session.id}`,
      };
    }),

  leaveSession: t.procedure
    .input(z.object({ session_id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // Remove participant
      const { error } = await ctx.supabase
        .from('game_participants')
        .delete()
        .eq('session_id', input.session_id)
        .eq('participant_id', userData.user.id);

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      return { success: true };
    }),

  // =====================================================
  // GAME STATE MANAGEMENT
  // =====================================================

  startSession: t.procedure
    .input(z.object({ session_id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // Verify host
      const { data: session, error: sessionError } = await ctx.supabase
        .from('game_sessions')
        .select('*')
        .eq('id', input.session_id)
        .eq('host_id', userData.user.id)
        .single();

      if (sessionError || !session) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the host can start the session'
        });
      }

      // Update session status
      const { data: updatedSession, error: updateError } = await ctx.supabase
        .from('game_sessions')
        .update({
          session_status: 'active',
          start_time: new Date().toISOString(),
          game_state: {
            ...session.game_state,
            started_at: new Date().toISOString(),
            current_question: 0,
          },
        })
        .eq('id', input.session_id)
        .select()
        .single();

      if (updateError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message });

      // Broadcast start event through Realtime
      const channel = ctx.supabase.channel(`game-session-${input.session_id}`);
      await channel.send({
        type: 'broadcast',
        event: 'session_started',
        payload: { session: updatedSession },
      });

      return updatedSession;
    }),

  updateSessionState: t.procedure
    .input(updateSessionStateSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // Verify host
      const { data: session, error: sessionError } = await ctx.supabase
        .from('game_sessions')
        .select('*')
        .eq('id', input.session_id)
        .eq('host_id', userData.user.id)
        .single();

      if (sessionError || !session) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the host can update the session'
        });
      }

      // Update session
      const updateData: any = {
        session_status: input.state,
      };

      if (input.state === 'completed') {
        updateData.end_time = new Date().toISOString();
      }

      if (input.game_state) {
        updateData.game_state = input.game_state;
      }

      const { data: updatedSession, error: updateError } = await ctx.supabase
        .from('game_sessions')
        .update(updateData)
        .eq('id', input.session_id)
        .select()
        .single();

      if (updateError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message });

      // Broadcast state change
      const channel = ctx.supabase.channel(`game-session-${input.session_id}`);
      await channel.send({
        type: 'broadcast',
        event: 'state_updated',
        payload: { session: updatedSession },
      });

      return updatedSession;
    }),

  // =====================================================
  // GAMEPLAY
  // =====================================================

  submitAnswer: t.procedure
    .input(submitAnswerSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: userData } = await ctx.supabase.auth.getUser();

      // Get participant
      const { data: participant, error: participantError } = await ctx.supabase
        .from('game_participants')
        .select('*')
        .eq('session_id', input.session_id)
        .eq('participant_id', userData?.user?.id || null)
        .single();

      if (participantError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: participantError.message });

      // Update participant answers
      const answers = participant.answers || [];
      answers[input.question_index] = {
        answer: input.answer,
        time_taken: input.time_taken,
        submitted_at: new Date().toISOString(),
      };

      // Calculate points (simplified)
      const points = calculatePoints(input.answer, input.time_taken);
      const newScore = participant.current_score + points;

      // Update participant
      const { data: updated, error: updateError } = await ctx.supabase
        .from('game_participants')
        .update({
          answers,
          current_score: newScore,
          last_activity: new Date().toISOString(),
        })
        .eq('id', participant.id)
        .select()
        .single();

      if (updateError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message });

      // Broadcast answer submission
      const channel = ctx.supabase.channel(`game-session-${input.session_id}`);
      await channel.send({
        type: 'broadcast',
        event: 'answer_submitted',
        payload: {
          participant_id: participant.id,
          display_name: participant.display_name,
          question_index: input.question_index,
          points,
          new_score: newScore,
        },
      });

      return {
        points,
        new_score: newScore,
      };
    }),

  nextQuestion: t.procedure
    .input(z.object({ session_id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // Verify host and get session
      const { data: session, error: sessionError } = await ctx.supabase
        .from('game_sessions')
        .select('*')
        .eq('id', input.session_id)
        .eq('host_id', userData.user.id)
        .single();

      if (sessionError || !session) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the host can control questions'
        });
      }

      // Update current question
      const nextQuestionIndex = (session.game_state?.current_question || 0) + 1;
      const { data: updated, error: updateError } = await ctx.supabase
        .from('game_sessions')
        .update({
          game_state: {
            ...session.game_state,
            current_question: nextQuestionIndex,
            question_started_at: new Date().toISOString(),
          },
        })
        .eq('id', input.session_id)
        .select()
        .single();

      if (updateError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message });

      // Broadcast next question
      const channel = ctx.supabase.channel(`game-session-${input.session_id}`);
      await channel.send({
        type: 'broadcast',
        event: 'next_question',
        payload: {
          question_index: nextQuestionIndex,
          started_at: new Date().toISOString(),
        },
      });

      return updated;
    }),

  // =====================================================
  // LEADERBOARD & RESULTS
  // =====================================================

  getLeaderboard: t.procedure
    .input(z.object({ session_id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: participants, error } = await ctx.supabase
        .from('game_participants')
        .select('*')
        .eq('session_id', input.session_id)
        .order('current_score', { ascending: false });

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Add rankings
      const leaderboard = participants.map((p, index) => ({
        ...p,
        rank: index + 1,
        score_display: p.current_score.toLocaleString(),
      }));

      return leaderboard;
    }),

  updateLeaderboard: t.procedure
    .input(z.object({
      session_id: z.string().uuid(),
      leaderboard: z.array(z.object({
        participant_id: z.string().uuid(),
        final_score: z.number(),
        final_rank: z.number(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // Verify host
      const { data: session, error: sessionError } = await ctx.supabase
        .from('game_sessions')
        .select('*')
        .eq('id', input.session_id)
        .eq('host_id', userData.user.id)
        .single();

      if (sessionError || !session) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the host can update the leaderboard'
        });
      }

      // Update each participant's final score and rank
      for (const entry of input.leaderboard) {
        await ctx.supabase
          .from('game_participants')
          .update({
            final_score: entry.final_score,
            final_rank: entry.final_rank,
          })
          .eq('id', entry.participant_id);
      }

      // Update session leaderboard
      const { data: updated, error: updateError } = await ctx.supabase
        .from('game_sessions')
        .update({
          leaderboard: input.leaderboard,
        })
        .eq('id', input.session_id)
        .select()
        .single();

      if (updateError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message });

      // Broadcast final leaderboard
      const channel = ctx.supabase.channel(`game-session-${input.session_id}`);
      await channel.send({
        type: 'broadcast',
        event: 'final_leaderboard',
        payload: { leaderboard: input.leaderboard },
      });

      return updated;
    }),

  // =====================================================
  // SESSION DISCOVERY
  // =====================================================

  getActiveSessions: t.procedure
    .input(z.object({
      class_id: z.string().uuid().optional(),
      is_public: z.boolean().optional(),
      limit: z.number().default(10),
    }))
    .query(async ({ input, ctx }) => {
      let query = ctx.supabase
        .from('game_sessions')
        .select('*, game_participants(id)')
        .in('session_status', ['waiting', 'active'])
        .order('created_at', { ascending: false });

      if (input.class_id) {
        query = query.eq('class_id', input.class_id);
      }
      if (input.is_public !== undefined) {
        query = query.eq('is_public', input.is_public);
      }

      query = query.limit(input.limit);

      const { data, error } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Add participant count
      return data.map(session => ({
        ...session,
        participant_count: session.game_participants?.length || 0,
        available_spots: session.max_participants - (session.game_participants?.length || 0),
      }));
    }),

  getSessionById: t.procedure
    .input(z.object({ session_id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: session, error: sessionError } = await ctx.supabase
        .from('game_sessions')
        .select('*')
        .eq('id', input.session_id)
        .single();

      if (sessionError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: sessionError.message });

      // Get participants
      const { data: participants, error: participantsError } = await ctx.supabase
        .from('game_participants')
        .select('*')
        .eq('session_id', input.session_id)
        .order('current_score', { ascending: false });

      if (participantsError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: participantsError.message });

      return {
        ...session,
        participants,
      };
    }),

  getSessionByCode: t.procedure
    .input(z.object({ session_code: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data: session, error } = await ctx.supabase
        .from('game_sessions')
        .select('*')
        .eq('session_code', input.session_code)
        .single();

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      return session;
    }),

  // =====================================================
  // SESSION HISTORY
  // =====================================================

  getMySessionHistory: t.procedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // Get sessions where user was host
      const { data: hostedSessions, error: hostedError } = await ctx.supabase
        .from('game_sessions')
        .select('*')
        .eq('host_id', userData.user.id)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (hostedError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: hostedError.message });

      // Get sessions where user was participant
      const { data: participations, error: participationsError } = await ctx.supabase
        .from('game_participants')
        .select('*, game_sessions(*)')
        .eq('participant_id', userData.user.id)
        .order('joined_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (participationsError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: participationsError.message });

      return {
        hosted: hostedSessions,
        participated: participations,
      };
    }),
});

// Helper function to calculate points
function calculatePoints(answer: any, timeTaken: number): number {
  // Simple scoring: base points minus time penalty
  const basePoints = 100;
  const timePenalty = Math.floor(timeTaken / 100); // Lose 1 point per 100ms
  return Math.max(10, basePoints - timePenalty); // Minimum 10 points
}