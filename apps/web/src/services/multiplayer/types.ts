import { z } from 'zod';

// Game Room Status
export const GameRoomStatusSchema = z.enum([
  'waiting', // Waiting for players
  'starting', // Game about to start (countdown)
  'active', // Game in progress
  'paused', // Game paused
  'finished', // Game completed
  'cancelled', // Game cancelled
]);

export type GameRoomStatus = z.infer<typeof GameRoomStatusSchema>;

// Player Status
export const PlayerStatusSchema = z.enum([
  'connected',
  'disconnected',
  'away',
  'answering',
  'finished',
]);

export type PlayerStatus = z.infer<typeof PlayerStatusSchema>;

// Game Room Configuration
export const GameRoomConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  gameType: z.enum([
    'quiz_battle',
    'collaborative_solve',
    'speed_round',
    'team_challenge',
  ]),
  subject: z.string(),
  topic: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  maxPlayers: z.number().int().min(2).max(20).default(6),
  timePerQuestion: z.number().int().min(10).max(300).default(30), // seconds
  totalQuestions: z.number().int().min(5).max(50).default(10),
  language: z.enum(['es', 'en']).default('es'),
  settings: z.object({
    allowLateJoin: z.boolean().default(false),
    showLeaderboard: z.boolean().default(true),
    enableChat: z.boolean().default(true),
    powerUpsEnabled: z.boolean().default(false),
    teamMode: z.boolean().default(false),
  }),
  createdBy: z.string(),
  createdAt: z.date(),
  scheduledStart: z.date().optional(),
});

export type GameRoomConfig = z.infer<typeof GameRoomConfigSchema>;

// Player Information
export const PlayerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  grade: z.number().int().min(1).max(12).optional(),
  status: PlayerStatusSchema,
  score: z.number().default(0),
  streak: z.number().int().default(0),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.array(z.string())]),
      timeSpent: z.number(), // milliseconds
      correct: z.boolean(),
      points: z.number(),
    }),
  ),
  powerUps: z
    .array(
      z.object({
        type: z.string(),
        count: z.number(),
      }),
    )
    .default([]),
  team: z.string().optional(),
  joinedAt: z.date(),
  lastSeen: z.date(),
});

export type Player = z.infer<typeof PlayerSchema>;

// Game Room State
export const GameRoomSchema = z.object({
  config: GameRoomConfigSchema,
  status: GameRoomStatusSchema,
  players: z.array(PlayerSchema),
  currentQuestion: z
    .object({
      index: z.number().int(),
      questionId: z.string(),
      startTime: z.date(),
      endTime: z.date(),
      answers: z.record(z.string()), // playerId -> answer
    })
    .optional(),
  leaderboard: z.array(
    z.object({
      playerId: z.string(),
      name: z.string(),
      score: z.number(),
      rank: z.number(),
      streak: z.number(),
    }),
  ),
  chat: z
    .array(
      z.object({
        id: z.string(),
        playerId: z.string(),
        playerName: z.string(),
        message: z.string(),
        timestamp: z.date(),
        type: z.enum(['message', 'system', 'reaction']).default('message'),
      }),
    )
    .default([]),
  gameData: z.record(z.any()).optional(), // Game-specific data
});

export type GameRoom = z.infer<typeof GameRoomSchema>;

// WebSocket Message Types
export const WebSocketMessageSchema = z.object({
  type: z.enum([
    // Connection events
    'join_room',
    'leave_room',
    'player_joined',
    'player_left',
    'player_status_change',

    // Game flow events
    'game_start',
    'game_pause',
    'game_resume',
    'game_end',
    'question_start',
    'question_end',

    // Player actions
    'submit_answer',
    'answer_submitted',
    'use_powerup',
    'send_chat',
    'chat_message',
    'emoji_reaction',

    // Real-time updates
    'leaderboard_update',
    'room_state_update',
    'timer_update',
    'score_update',

    // System events
    'error',
    'ping',
    'pong',
  ]),
  roomId: z.string(),
  playerId: z.string().optional(),
  data: z.any().optional(),
  timestamp: z.date().default(() => new Date()),
});

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

// Quiz Battle Specific Types
export const QuizBattleConfigSchema = z.object({
  battleType: z.enum(['elimination', 'points', 'survival', 'team_vs_team']),
  eliminationThreshold: z.number().min(0).max(1).default(0.3), // Eliminate bottom 30%
  survivalLives: z.number().int().min(1).max(5).default(3),
  teamSize: z.number().int().min(2).max(5).default(3),
  bonusMultipliers: z.object({
    streak: z.number().default(1.2),
    speed: z.number().default(1.5),
    perfect: z.number().default(2.0),
  }),
});

export type QuizBattleConfig = z.infer<typeof QuizBattleConfigSchema>;

// Collaborative Solve Types
export const CollaborativeSolveConfigSchema = z.object({
  problemType: z.enum([
    'math_problem',
    'science_experiment',
    'essay_writing',
    'project_based',
  ]),
  roles: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      maxPlayers: z.number().int(),
    }),
  ),
  phases: z.array(
    z.object({
      name: z.string(),
      timeLimit: z.number().int(), // minutes
      deliverable: z.string(),
    }),
  ),
  sharedWorkspace: z.boolean().default(true),
});

export type CollaborativeSolveConfig = z.infer<
  typeof CollaborativeSolveConfigSchema
>;

// Power-ups System
export const PowerUpSchema = z.object({
  type: z.enum([
    'time_freeze', // Pause timer for everyone
    'double_points', // Double points for next answer
    'skip_question', // Skip current question
    'hint_reveal', // Reveal a hint
    'steal_points', // Steal points from leader
    'shield', // Protect from negative effects
    'speed_boost', // Extra time for answering
  ]),
  name: z.string(),
  description: z.string(),
  cost: z.number().int(), // Cost in points or coins
  cooldown: z.number().int().default(0), // Seconds before can use again
  targetType: z.enum(['self', 'others', 'all']),
  effect: z.object({
    duration: z.number().int().optional(), // Duration in seconds
    value: z.number().optional(), // Effect magnitude
    conditions: z.array(z.string()).optional(),
  }),
});

export type PowerUp = z.infer<typeof PowerUpSchema>;

// Game Analytics
export const GameAnalyticsSchema = z.object({
  roomId: z.string(),
  gameType: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  playerCount: z.number().int(),
  totalQuestions: z.number().int(),
  averageScore: z.number(),
  completionRate: z.number(), // Percentage of players who finished
  engagementMetrics: z.object({
    averageAnswerTime: z.number(),
    chatMessages: z.number().int(),
    powerUpsUsed: z.number().int(),
    disconnections: z.number().int(),
  }),
  questionAnalytics: z.array(
    z.object({
      questionId: z.string(),
      correctAnswers: z.number().int(),
      averageTime: z.number(),
      difficulty: z.number(), // Calculated difficulty based on performance
      commonMistakes: z.array(z.string()),
    }),
  ),
  playerPerformance: z.array(
    z.object({
      playerId: z.string(),
      finalScore: z.number(),
      finalRank: z.number(),
      questionsCorrect: z.number().int(),
      averageAnswerTime: z.number(),
      streakRecord: z.number().int(),
      engagement: z.number(), // Engagement score 0-1
    }),
  ),
});

export type GameAnalytics = z.infer<typeof GameAnalyticsSchema>;

// Matchmaking System
export const MatchmakingCriteriaSchema = z.object({
  grade: z.number().int().min(1).max(12),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  subject: z.string(),
  preferredGameType: z.string().optional(),
  maxWaitTime: z.number().int().default(120), // seconds
  allowCrossGrade: z.boolean().default(true),
  allowCrossSkill: z.boolean().default(false),
});

export type MatchmakingCriteria = z.infer<typeof MatchmakingCriteriaSchema>;

// Room Events for Supabase Realtime
export const RoomEventSchema = z.object({
  event_type: z.enum([
    'player_joined',
    'player_left',
    'game_started',
    'question_answered',
    'game_ended',
    'chat_sent',
    'powerup_used',
  ]),
  room_id: z.string(),
  player_id: z.string().optional(),
  data: z.record(z.any()),
  created_at: z.date().default(() => new Date()),
});

export type RoomEvent = z.infer<typeof RoomEventSchema>;
