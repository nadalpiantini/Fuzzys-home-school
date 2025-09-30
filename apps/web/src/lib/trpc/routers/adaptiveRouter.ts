import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

const t = initTRPC
  .context<{
    supabase: SupabaseClient;
  }>()
  .create();

// Schemas for adaptive learning
const aiQuizGenerationSchema = z.object({
  subject: z.string(),
  grade_level: z.number().min(1).max(12),
  difficulty_level: z.number().min(1).max(5).default(3),
  question_count: z.number().min(1).max(50).default(10),
  question_types: z.array(z.enum(['mcq', 'true_false', 'fill_blank', 'short_answer', 'essay'])).optional(),
  language: z.enum(['es', 'en']).default('es'),
  time_limit: z.number().optional(),
  passing_score: z.number().min(0).max(100).default(70),
  is_adaptive: z.boolean().default(false),
  class_id: z.string().uuid().optional(),
  topic: z.string().optional(),
  learning_objectives: z.array(z.string()).optional(),
});

const quizAttemptSchema = z.object({
  quiz_id: z.string().uuid(),
  answers: z.array(z.any()),
  time_taken: z.number(),
  class_id: z.string().uuid().optional(),
});

const srsReviewSchema = z.object({
  card_id: z.string().uuid(),
  quality_rating: z.number().min(0).max(5),
  time_taken: z.number(),
});

const srsCardSchema = z.object({
  front_content: z.string(),
  back_content: z.string(),
  deck_id: z.string().uuid().optional(),
  content_id: z.string().uuid().optional(),
  card_type: z.enum(['basic', 'cloze', 'image', 'audio']).default('basic'),
  tags: z.array(z.string()).optional(),
  media_urls: z.array(z.string()).optional(),
});

export const adaptiveRouter = t.router({
  // =====================================================
  // AI QUIZ GENERATION
  // =====================================================

  generateQuiz: t.procedure
    .input(aiQuizGenerationSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      try {
        // Create quiz record
        const { data: quiz, error: quizError } = await ctx.supabase
          .from('ai_quizzes')
          .insert({
            title: `${input.subject} - Nivel ${input.grade_level}`,
            subject: input.subject,
            grade_level: input.grade_level,
            difficulty_level: input.difficulty_level,
            language: input.language,
            question_count: input.question_count,
            time_limit: input.time_limit,
            passing_score: input.passing_score,
            generated_by_ai: true,
            ai_model: 'deepseek-chat',
            generation_params: input,
            is_adaptive: input.is_adaptive,
            created_by: userData.user.id,
            class_id: input.class_id,
          })
          .select()
          .single();

        if (quizError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: quizError.message });

        // Generate questions using DeepSeek API
        const questions = await generateQuestionsWithAI(input, quiz.id);

        // Insert questions
        const { error: questionsError } = await ctx.supabase
          .from('quiz_questions')
          .insert(questions);

        if (questionsError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: questionsError.message });

        return {
          ...quiz,
          questions,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  getQuizzes: t.procedure
    .input(z.object({
      subject: z.string().optional(),
      grade_level: z.number().optional(),
      class_id: z.string().uuid().optional(),
      created_by: z.string().uuid().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      let query = ctx.supabase
        .from('ai_quizzes')
        .select('*, quiz_questions(id)')
        .order('created_at', { ascending: false });

      if (input.subject) query = query.eq('subject', input.subject);
      if (input.grade_level) query = query.eq('grade_level', input.grade_level);
      if (input.class_id) query = query.eq('class_id', input.class_id);
      if (input.created_by) query = query.eq('created_by', input.created_by);

      query = query.range(input.offset, input.offset + input.limit - 1);

      const { data, error } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  getQuizById: t.procedure
    .input(z.object({ quiz_id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: quiz, error: quizError } = await ctx.supabase
        .from('ai_quizzes')
        .select('*')
        .eq('id', input.quiz_id)
        .single();

      if (quizError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: quizError.message });

      const { data: questions, error: questionsError } = await ctx.supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', input.quiz_id)
        .order('order_position', { ascending: true });

      if (questionsError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: questionsError.message });

      return {
        ...quiz,
        questions,
      };
    }),

  submitQuizAttempt: t.procedure
    .input(quizAttemptSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // Get quiz questions for grading
      const { data: questions, error: questionsError } = await ctx.supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', input.quiz_id)
        .order('order_position', { ascending: true });

      if (questionsError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: questionsError.message });

      // Grade the quiz
      const gradingResult = await gradeQuiz(questions, input.answers);

      // Save attempt
      const { data: attempt, error: attemptError } = await ctx.supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: input.quiz_id,
          student_id: userData.user.id,
          answers: input.answers,
          score: gradingResult.score,
          percentage: gradingResult.percentage,
          time_taken: input.time_taken,
          status: 'graded',
          feedback: gradingResult.feedback,
          ai_evaluation: gradingResult.evaluation,
          submitted_at: new Date().toISOString(),
          graded_at: new Date().toISOString(),
          class_id: input.class_id,
        })
        .select()
        .single();

      if (attemptError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: attemptError.message });

      // Log analytics
      await ctx.supabase
        .from('learning_analytics')
        .insert({
          student_id: userData.user.id,
          event_type: 'quiz_submitted',
          quiz_id: input.quiz_id,
          class_id: input.class_id,
          platform_source: 'ai_quiz',
          event_data: {
            score: gradingResult.score,
            percentage: gradingResult.percentage,
            time_taken: input.time_taken,
          },
          performance_metrics: gradingResult.metrics,
        });

      return {
        attempt,
        gradingResult,
      };
    }),

  getQuizAttempts: t.procedure
    .input(z.object({
      quiz_id: z.string().uuid().optional(),
      student_id: z.string().uuid().optional(),
      class_id: z.string().uuid().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      let query = ctx.supabase
        .from('quiz_attempts')
        .select('*, ai_quizzes(title, subject, grade_level)')
        .order('submitted_at', { ascending: false });

      if (input.quiz_id) query = query.eq('quiz_id', input.quiz_id);
      if (input.student_id) {
        query = query.eq('student_id', input.student_id);
      } else {
        query = query.eq('student_id', userData.user.id);
      }
      if (input.class_id) query = query.eq('class_id', input.class_id);

      const { data, error } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  // =====================================================
  // SPACED REPETITION SYSTEM
  // =====================================================

  getSRSCards: t.procedure
    .input(z.object({
      deck_id: z.string().uuid().optional(),
      due_today: z.boolean().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      let query = ctx.supabase
        .from('srs_cards')
        .select('*')
        .eq('student_id', userData.user.id)
        .eq('is_suspended', false)
        .order('next_review_date', { ascending: true });

      if (input.deck_id) query = query.eq('deck_id', input.deck_id);
      if (input.due_today) {
        const today = new Date().toISOString().split('T')[0];
        query = query.lte('next_review_date', today);
      }

      query = query.limit(input.limit);

      const { data, error } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  createSRSCard: t.procedure
    .input(srsCardSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      const { data, error } = await ctx.supabase
        .from('srs_cards')
        .insert({
          ...input,
          student_id: userData.user.id,
          next_review_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  reviewSRSCard: t.procedure
    .input(srsReviewSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // Get current card data
      const { data: card, error: cardError } = await ctx.supabase
        .from('srs_cards')
        .select('*')
        .eq('id', input.card_id)
        .eq('student_id', userData.user.id)
        .single();

      if (cardError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: cardError.message });

      // Calculate next review using SM-2 algorithm
      const { data: reviewCalc, error: calcError } = await ctx.supabase
        .rpc('calculate_next_srs_review', {
          quality: input.quality_rating,
          repetitions: card.repetitions,
          ease_factor: card.ease_factor,
          interval_days: card.interval_days,
        });

      if (calcError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: calcError.message });

      // Update card with new values
      const { data: updatedCard, error: updateError } = await ctx.supabase
        .from('srs_cards')
        .update({
          interval_days: reviewCalc.interval_days,
          ease_factor: reviewCalc.ease_factor,
          repetitions: reviewCalc.repetitions,
          last_review_date: new Date().toISOString(),
          next_review_date: reviewCalc.next_review_date,
          total_reviews: card.total_reviews + 1,
          correct_reviews: input.quality_rating >= 3 ? card.correct_reviews + 1 : card.correct_reviews,
        })
        .eq('id', input.card_id)
        .select()
        .single();

      if (updateError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message });

      // Save review history
      await ctx.supabase
        .from('srs_review_history')
        .insert({
          card_id: input.card_id,
          student_id: userData.user.id,
          quality_rating: input.quality_rating,
          time_taken: input.time_taken,
          previous_interval: card.interval_days,
          new_interval: reviewCalc.interval_days,
          previous_ease: card.ease_factor,
          new_ease: reviewCalc.ease_factor,
          review_type: card.repetitions === 0 ? 'learning' : 'review',
        });

      return updatedCard;
    }),

  getSRSStats: t.procedure.query(async ({ ctx }) => {
    const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
    if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

    // Get cards due today
    const today = new Date().toISOString().split('T')[0];
    const { data: dueCards, error: dueError } = await ctx.supabase
      .from('srs_cards')
      .select('id')
      .eq('student_id', userData.user.id)
      .eq('is_suspended', false)
      .lte('next_review_date', today);

    if (dueError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dueError.message });

    // Get total cards
    const { data: totalCards, error: totalError } = await ctx.supabase
      .from('srs_cards')
      .select('id')
      .eq('student_id', userData.user.id)
      .eq('is_suspended', false);

    if (totalError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: totalError.message });

    // Get review history for stats
    const { data: history, error: historyError } = await ctx.supabase
      .from('srs_review_history')
      .select('*')
      .eq('student_id', userData.user.id)
      .gte('reviewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (historyError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: historyError.message });

    // Calculate stats
    const stats = {
      cards_due_today: dueCards.length,
      total_cards: totalCards.length,
      reviews_last_30_days: history.length,
      average_ease_factor: history.reduce((acc, h) => acc + h.new_ease, 0) / (history.length || 1),
      success_rate: history.filter(h => h.quality_rating >= 3).length / (history.length || 1),
      daily_reviews: history.reduce((acc, h) => {
        const date = new Date(h.reviewed_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  }),

  // =====================================================
  // ADAPTIVE RECOMMENDATIONS
  // =====================================================

  generateRecommendations: t.procedure
    .input(z.object({
      force_refresh: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // Get student's skill assessments
      const { data: skills, error: skillsError } = await ctx.supabase
        .from('student_skill_assessments')
        .select('*')
        .eq('student_id', userData.user.id)
        .order('current_level', { ascending: true })
        .limit(5); // Focus on 5 weakest skills

      if (skillsError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: skillsError.message });

      // Get student's recent progress
      const { data: recentProgress, error: progressError } = await ctx.supabase
        .from('student_content_progress')
        .select('*')
        .eq('student_id', userData.user.id)
        .order('last_accessed', { ascending: false })
        .limit(20);

      if (progressError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: progressError.message });

      // Generate recommendations based on skills and progress
      const recommendations = await generateAdaptiveRecommendations(skills, recentProgress);

      // Clear old recommendations if force refresh
      if (input.force_refresh) {
        await ctx.supabase
          .from('content_recommendations')
          .update({ is_dismissed: true })
          .eq('student_id', userData.user.id)
          .eq('is_completed', false);
      }

      // Insert new recommendations
      const { data: newRecs, error: recError } = await ctx.supabase
        .from('content_recommendations')
        .insert(recommendations.map(rec => ({
          ...rec,
          student_id: userData.user.id,
        })))
        .select();

      if (recError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: recError.message });
      return newRecs;
    }),

  getAdaptivePath: t.procedure
    .input(z.object({
      subject: z.string(),
      target_skill_level: z.number().min(0).max(1),
    }))
    .query(async ({ input, ctx }) => {
      const { data: userData, error: userError } = await ctx.supabase.auth.getUser();
      if (userError) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });

      // Get current skill level
      const { data: currentSkill, error: skillError } = await ctx.supabase
        .from('student_skill_assessments')
        .select('*')
        .eq('student_id', userData.user.id)
        .eq('subject', input.subject)
        .single();

      if (skillError && skillError.code !== 'PGRST116') {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: skillError.message });
      }

      const currentLevel = currentSkill?.current_level || 0;

      // Get recommended content for learning path
      const { data: content, error: contentError } = await ctx.supabase
        .from('educational_content')
        .select('*')
        .eq('subject', input.subject)
        .eq('is_published', true)
        .gte('difficulty_level', Math.floor(currentLevel * 5) + 1)
        .lte('difficulty_level', Math.floor(input.target_skill_level * 5) + 1)
        .order('difficulty_level', { ascending: true });

      if (contentError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: contentError.message });

      // Create learning path
      const path = {
        current_level: currentLevel,
        target_level: input.target_skill_level,
        estimated_time: content.reduce((acc, c) => acc + (c.estimated_duration || 30), 0),
        steps: content.map((c, index) => ({
          order: index + 1,
          content_id: c.id,
          title: c.title,
          difficulty: c.difficulty_level,
          estimated_duration: c.estimated_duration || 30,
          learning_objectives: c.learning_objectives,
        })),
        milestones: [
          { level: 0.25, description: 'Fundamentos básicos' },
          { level: 0.5, description: 'Comprensión intermedia' },
          { level: 0.75, description: 'Dominio avanzado' },
          { level: 1.0, description: 'Maestría completa' },
        ],
      };

      return path;
    }),
});

// Helper function to generate questions with AI
async function generateQuestionsWithAI(params: any, quizId: string) {
  // This would integrate with DeepSeek API
  // For now, return sample questions
  const questionTypes = params.question_types || ['mcq', 'true_false'];
  const questions = [];

  for (let i = 0; i < params.question_count; i++) {
    const type = questionTypes[i % questionTypes.length];
    const question = {
      quiz_id: quizId,
      question_text: `Pregunta ${i + 1} sobre ${params.subject}`,
      question_type: type,
      correct_answer: type === 'mcq' ? { answer: 'A' } : { answer: true },
      options: type === 'mcq' ? {
        A: 'Opción A',
        B: 'Opción B',
        C: 'Opción C',
        D: 'Opción D',
      } : null,
      ai_explanation: `Explicación generada por IA para la pregunta ${i + 1}`,
      difficulty_score: params.difficulty_level / 5,
      bloom_level: ['remember', 'understand', 'apply'][i % 3],
      points: type === 'essay' ? 5 : 1,
      time_estimate: type === 'essay' ? 300 : 60,
      order_position: i,
    };
    questions.push(question);
  }

  return questions;
}

// Helper function to grade quiz
async function gradeQuiz(questions: any[], answers: any[]) {
  let totalPoints = 0;
  let earnedPoints = 0;
  const feedback = [];
  const metrics = {
    correct: 0,
    incorrect: 0,
    skipped: 0,
    by_type: {} as Record<string, { correct: number; total: number }>,
  };

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const answer = answers[i];
    const points = question.points || 1;
    totalPoints += points;

    // Initialize type metrics
    if (!metrics.by_type[question.question_type]) {
      metrics.by_type[question.question_type] = { correct: 0, total: 0 };
    }
    metrics.by_type[question.question_type].total++;

    if (!answer) {
      metrics.skipped++;
      feedback.push({
        question_id: question.id,
        correct: false,
        skipped: true,
        explanation: 'Pregunta no respondida',
      });
      continue;
    }

    // Grade based on question type
    let isCorrect = false;
    switch (question.question_type) {
      case 'mcq':
        isCorrect = answer === question.correct_answer.answer;
        break;
      case 'true_false':
        isCorrect = answer === question.correct_answer.answer;
        break;
      case 'fill_blank':
      case 'short_answer':
        // Simple string matching for now
        isCorrect = answer.toLowerCase().includes(question.correct_answer.answer.toLowerCase());
        break;
      case 'essay':
        // Would use AI for essay grading
        // For now, give partial credit
        isCorrect = answer.length > 50;
        earnedPoints += points * 0.7; // Partial credit
        break;
    }

    if (isCorrect) {
      earnedPoints += points;
      metrics.correct++;
      metrics.by_type[question.question_type].correct++;
    } else {
      metrics.incorrect++;
    }

    feedback.push({
      question_id: question.id,
      correct: isCorrect,
      explanation: question.ai_explanation,
      your_answer: answer,
      correct_answer: question.correct_answer.answer,
    });
  }

  const percentage = (earnedPoints / totalPoints) * 100;

  return {
    score: earnedPoints,
    total: totalPoints,
    percentage,
    feedback,
    metrics,
    evaluation: `Has obtenido ${earnedPoints} de ${totalPoints} puntos (${percentage.toFixed(1)}%). ${percentage >= 70 ? '¡Aprobado!' : 'Necesitas más práctica.'}`,
  };
}

// Helper function to generate adaptive recommendations
async function generateAdaptiveRecommendations(skills: any[], progress: any[]) {
  const recommendations = [];

  // Recommend content for weak skills
  for (const skill of skills) {
    if (skill.current_level < 0.5) {
      // This would query content based on skill gaps
      recommendations.push({
        content_id: null, // Would be actual content ID
        recommendation_score: 1 - skill.current_level,
        recommendation_type: 'skill_gap',
        reasoning: `Necesitas mejorar en ${skill.skill_name}`,
        context: { skill },
      });
    }
  }

  // Recommend based on recent activity patterns
  const subjects = new Set(progress.map(p => p.subject));
  for (const subject of subjects) {
    recommendations.push({
      content_id: null, // Would be actual content ID
      recommendation_score: 0.7,
      recommendation_type: 'interest_based',
      reasoning: `Continúa tu progreso en ${subject}`,
      context: { subject },
    });
  }

  return recommendations.slice(0, 10); // Limit to 10 recommendations
}