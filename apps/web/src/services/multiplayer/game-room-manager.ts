import {
  GameRoom,
  GameRoomConfig,
  Player,
  GameRoomStatus,
  PlayerStatus,
  QuizBattleConfig,
  PowerUp,
  GameAnalytics
} from './types';

export class GameRoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private playerRoomMap: Map<string, string> = new Map(); // playerId -> roomId
  private roomTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create a new game room
   */
  createRoom(config: GameRoomConfig): GameRoom {
    const room: GameRoom = {
      config,
      status: 'waiting',
      players: [],
      leaderboard: [],
      chat: [],
      gameData: this.initializeGameData(config.gameType)
    };

    this.rooms.set(config.id, room);
    console.log(`Room created: ${config.id} (${config.gameType})`);

    return room;
  }

  /**
   * Add player to room
   */
  addPlayer(roomId: string, player: Player): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Check room capacity
    if (room.players.length >= room.config.maxPlayers) {
      throw new Error('Room is full');
    }

    // Check if game allows late joining
    if (room.status === 'active' && !room.config.settings.allowLateJoin) {
      throw new Error('Game is already in progress');
    }

    // Remove player from previous room if any
    const previousRoomId = this.playerRoomMap.get(player.id);
    if (previousRoomId && previousRoomId !== roomId) {
      this.removePlayer(previousRoomId, player.id);
    }

    // Add player to room
    room.players.push(player);
    this.playerRoomMap.set(player.id, roomId);

    // Update leaderboard
    this.updateLeaderboard(roomId);

    // Add system message
    this.addChatMessage(roomId, {
      id: this.generateId(),
      playerId: 'system',
      playerName: 'Sistema',
      message: `${player.name} se unió a la sala`,
      timestamp: new Date(),
      type: 'system'
    });

    console.log(`Player ${player.name} joined room ${roomId}`);
    return room;
  }

  /**
   * Remove player from room
   */
  removePlayer(roomId: string, playerId: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return room;

    const player = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
    this.playerRoomMap.delete(playerId);

    // Update leaderboard
    this.updateLeaderboard(roomId);

    // Add system message
    this.addChatMessage(roomId, {
      id: this.generateId(),
      playerId: 'system',
      playerName: 'Sistema',
      message: `${player.name} salió de la sala`,
      timestamp: new Date(),
      type: 'system'
    });

    // Check if room should be closed
    if (room.players.length === 0) {
      this.closeRoom(roomId);
      return null;
    }

    // If game creator left, assign new creator
    if (room.config.createdBy === playerId && room.players.length > 0) {
      room.config.createdBy = room.players[0].userId;
    }

    console.log(`Player ${player.name} left room ${roomId}`);
    return room;
  }

  /**
   * Start game in room
   */
  startGame(roomId: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.status !== 'waiting') {
      throw new Error('Game is not in waiting state');
    }

    if (room.players.length < 2) {
      throw new Error('At least 2 players required to start');
    }

    room.status = 'starting';

    // Start countdown
    let countdown = 5;
    const countdownTimer = setInterval(() => {
      countdown--;

      if (countdown <= 0) {
        clearInterval(countdownTimer);
        this.actuallyStartGame(roomId);
      } else {
        this.addChatMessage(roomId, {
          id: this.generateId(),
          playerId: 'system',
          playerName: 'Sistema',
          message: `El juego comienza en ${countdown}...`,
          timestamp: new Date(),
          type: 'system'
        });
      }
    }, 1000);

    this.addChatMessage(roomId, {
      id: this.generateId(),
      playerId: 'system',
      playerName: 'Sistema',
      message: '¡El juego está comenzando!',
      timestamp: new Date(),
      type: 'system'
    });

    return room;
  }

  private actuallyStartGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.status = 'active';

    // Initialize game-specific logic
    this.initializeGameLogic(room);

    // Start first question
    this.startNextQuestion(roomId);

    this.addChatMessage(roomId, {
      id: this.generateId(),
      playerId: 'system',
      playerName: 'Sistema',
      message: '¡El juego ha comenzado! ¡Buena suerte!',
      timestamp: new Date(),
      type: 'system'
    });
  }

  /**
   * Submit answer for player
   */
  submitAnswer(
    roomId: string,
    playerId: string,
    answer: string | string[],
    timeSpent: number
  ): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'active' || !room.currentQuestion) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    // Check if player already answered
    if (room.currentQuestion.answers[playerId]) return room;

    // Record answer
    room.currentQuestion.answers[playerId] = Array.isArray(answer) ? answer.join(',') : answer;

    // Update player status
    player.status = 'finished';

    // Evaluate answer (simplified - would integrate with quiz engine)
    const isCorrect = this.evaluateAnswer(room, answer);
    const points = this.calculatePoints(room, isCorrect, timeSpent);

    // Update player data
    const questionAnswer = {
      questionId: room.currentQuestion.questionId,
      answer,
      timeSpent,
      correct: isCorrect,
      points
    };

    player.answers.push(questionAnswer);
    player.score += points;

    if (isCorrect) {
      player.streak++;
    } else {
      player.streak = 0;
    }

    // Update leaderboard
    this.updateLeaderboard(roomId);

    // Check if all players answered
    const allAnswered = room.players.every(p =>
      room.currentQuestion!.answers[p.id] !== undefined
    );

    if (allAnswered) {
      this.endCurrentQuestion(roomId);
    }

    return room;
  }

  /**
   * Start next question
   */
  private startNextQuestion(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const currentQuestionIndex = room.currentQuestion?.index ?? -1;
    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex >= room.config.totalQuestions) {
      this.endGame(roomId);
      return;
    }

    // Reset player statuses
    room.players.forEach(player => {
      player.status = 'connected';
    });

    // Set up new question
    const questionId = this.generateQuestionId(room, nextQuestionIndex);
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + room.config.timePerQuestion * 1000);

    room.currentQuestion = {
      index: nextQuestionIndex,
      questionId,
      startTime,
      endTime,
      answers: {}
    };

    // Set timer for question end
    const timeoutId = setTimeout(() => {
      this.endCurrentQuestion(roomId);
    }, room.config.timePerQuestion * 1000);

    this.roomTimers.set(`${roomId}_question`, timeoutId);

    console.log(`Started question ${nextQuestionIndex + 1} in room ${roomId}`);
  }

  /**
   * End current question
   */
  private endCurrentQuestion(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentQuestion) return;

    // Clear question timer
    const timerId = this.roomTimers.get(`${roomId}_question`);
    if (timerId) {
      clearTimeout(timerId);
      this.roomTimers.delete(`${roomId}_question`);
    }

    // Process results for players who didn't answer
    room.players.forEach(player => {
      if (!room.currentQuestion!.answers[player.id]) {
        player.answers.push({
          questionId: room.currentQuestion!.questionId,
          answer: '',
          timeSpent: room.config.timePerQuestion * 1000,
          correct: false,
          points: 0
        });
        player.streak = 0;
      }
    });

    // Update leaderboard
    this.updateLeaderboard(roomId);

    // Show question results
    setTimeout(() => {
      this.startNextQuestion(roomId);
    }, 3000); // 3 second delay between questions
  }

  /**
   * End game
   */
  private endGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.status = 'finished';
    room.currentQuestion = undefined;

    // Clear any active timers
    this.roomTimers.forEach((timer, key) => {
      if (key.startsWith(roomId)) {
        clearTimeout(timer);
        this.roomTimers.delete(key);
      }
    });

    // Final leaderboard update
    this.updateLeaderboard(roomId);

    // Generate analytics
    const analytics = this.generateGameAnalytics(room);

    // Add final message
    const winner = room.leaderboard[0];
    this.addChatMessage(roomId, {
      id: this.generateId(),
      playerId: 'system',
      playerName: 'Sistema',
      message: `¡Juego terminado! Ganador: ${winner?.name || 'Empate'}`,
      timestamp: new Date(),
      type: 'system'
    });

    console.log(`Game ended in room ${roomId}. Winner: ${winner?.name}`);

    // Schedule room cleanup
    setTimeout(() => {
      this.closeRoom(roomId);
    }, 300000); // Keep room for 5 minutes after game ends
  }

  /**
   * Close room and cleanup
   */
  private closeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Remove all players from room map
    room.players.forEach(player => {
      this.playerRoomMap.delete(player.id);
    });

    // Clear timers
    this.roomTimers.forEach((timer, key) => {
      if (key.startsWith(roomId)) {
        clearTimeout(timer);
        this.roomTimers.delete(key);
      }
    });

    // Remove room
    this.rooms.delete(roomId);

    console.log(`Room ${roomId} closed`);
  }

  /**
   * Add chat message
   */
  addChatMessage(roomId: string, message: GameRoom['chat'][0]): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.chat.push(message);

    // Keep only last 100 messages
    if (room.chat.length > 100) {
      room.chat.splice(0, room.chat.length - 100);
    }

    return room;
  }

  /**
   * Update leaderboard
   */
  private updateLeaderboard(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.leaderboard = room.players
      .map(player => ({
        playerId: player.id,
        name: player.name,
        score: player.score,
        rank: 0, // Will be set below
        streak: player.streak
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
  }

  /**
   * Get room by ID
   */
  getRoom(roomId: string): GameRoom | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Get player's current room
   */
  getPlayerRoom(playerId: string): GameRoom | null {
    const roomId = this.playerRoomMap.get(playerId);
    return roomId ? this.getRoom(roomId) : null;
  }

  /**
   * List all active rooms
   */
  listRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }

  // Helper methods
  private initializeGameData(gameType: string): Record<string, any> {
    switch (gameType) {
      case 'quiz_battle':
        return {
          battleType: 'points',
          eliminationThreshold: 0.3,
          bonusMultipliers: {
            streak: 1.2,
            speed: 1.5,
            perfect: 2.0
          }
        };
      case 'collaborative_solve':
        return {
          phases: [],
          sharedWorkspace: {}
        };
      default:
        return {};
    }
  }

  private initializeGameLogic(room: GameRoom): void {
    // Game-specific initialization
    switch (room.config.gameType) {
      case 'quiz_battle':
        this.initializeQuizBattle(room);
        break;
      case 'collaborative_solve':
        this.initializeCollaborativeSolve(room);
        break;
    }
  }

  private initializeQuizBattle(room: GameRoom): void {
    // Initialize quiz battle specific logic
    room.players.forEach(player => {
      player.powerUps = [
        { type: 'double_points', count: 1 },
        { type: 'time_freeze', count: 1 }
      ];
    });
  }

  private initializeCollaborativeSolve(room: GameRoom): void {
    // Initialize collaborative solve specific logic
    // Would assign roles, set up shared workspace, etc.
  }

  private generateQuestionId(room: GameRoom, questionIndex: number): string {
    return `${room.config.id}_q${questionIndex}`;
  }

  private evaluateAnswer(room: GameRoom, answer: string | string[]): boolean {
    // Simplified evaluation - would integrate with quiz engine
    // For now, simulate random correct/incorrect answers
    return Math.random() > 0.3; // 70% chance of correct answer
  }

  private calculatePoints(room: GameRoom, isCorrect: boolean, timeSpent: number): number {
    if (!isCorrect) return 0;

    const basePoints = 100;
    const timeBonus = Math.max(0, (room.config.timePerQuestion * 1000 - timeSpent) / 1000);

    return Math.round(basePoints + timeBonus);
  }

  private generateGameAnalytics(room: GameRoom): GameAnalytics {
    const playerPerformance = room.players.map(player => ({
      playerId: player.id,
      finalScore: player.score,
      finalRank: room.leaderboard.find(l => l.playerId === player.id)?.rank || 0,
      questionsCorrect: player.answers.filter(a => a.correct).length,
      averageAnswerTime: player.answers.reduce((sum, a) => sum + a.timeSpent, 0) / player.answers.length,
      streakRecord: Math.max(...player.answers.map((_, index, arr) => {
        let streak = 0;
        for (let i = index; i < arr.length && arr[i].correct; i++) {
          streak++;
        }
        return streak;
      })),
      engagement: this.calculateEngagementScore(player, room)
    }));

    return {
      roomId: room.config.id,
      gameType: room.config.gameType,
      startTime: room.config.createdAt,
      endTime: new Date(),
      playerCount: room.players.length,
      totalQuestions: room.config.totalQuestions,
      averageScore: playerPerformance.reduce((sum, p) => sum + p.finalScore, 0) / playerPerformance.length,
      completionRate: room.players.filter(p => p.answers.length === room.config.totalQuestions).length / room.players.length,
      engagementMetrics: {
        averageAnswerTime: playerPerformance.reduce((sum, p) => sum + p.averageAnswerTime, 0) / playerPerformance.length,
        chatMessages: room.chat.filter(c => c.type === 'message').length,
        powerUpsUsed: 0, // Would be tracked
        disconnections: 0 // Would be tracked
      },
      questionAnalytics: [], // Would be populated with question-specific data
      playerPerformance
    };
  }

  private calculateEngagementScore(player: Player, room: GameRoom): number {
    // Calculate engagement based on various factors
    let score = 0;

    // Answer rate
    score += (player.answers.length / room.config.totalQuestions) * 0.4;

    // Chat participation
    const playerMessages = room.chat.filter(c => c.playerId === player.id).length;
    score += Math.min(playerMessages / 10, 0.2); // Up to 0.2 for chat participation

    // Average answer time (faster = more engaged)
    const avgTime = player.answers.reduce((sum, a) => sum + a.timeSpent, 0) / player.answers.length;
    const timeScore = Math.max(0, (room.config.timePerQuestion * 1000 - avgTime) / (room.config.timePerQuestion * 1000));
    score += timeScore * 0.4;

    return Math.min(1, score);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}