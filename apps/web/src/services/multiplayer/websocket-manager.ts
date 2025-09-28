'use client';

import { io, Socket } from 'socket.io-client';
import { ENV } from '@/lib/env';
import {
  WebSocketMessage,
  GameRoom,
  Player,
  GameRoomStatus,
  PlayerStatus,
} from './types';

export class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentRoomId: string | null = null;
  private playerId: string | null = null;

  // Event handlers
  private eventHandlers: Map<string, Set<Function>> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    if (typeof window === 'undefined') return; // Only run on client

    this.socket = io(ENV.NEXT_PUBLIC_WEBSOCKET_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });

      // Rejoin room if we were in one
      if (this.currentRoomId && this.playerId) {
        this.rejoinRoom();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      this.emit('connection_status', { connected: false, reason });

      if (reason === 'io server disconnect') {
        // Server disconnected us, don't auto-reconnect
        return;
      }

      this.handleReconnection();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('connection_error', { error });
      this.handleReconnection();
    });

    // Game events
    this.socket.on('player_joined', (data) => {
      this.emit('player_joined', data);
    });

    this.socket.on('player_left', (data) => {
      this.emit('player_left', data);
    });

    this.socket.on('player_status_change', (data) => {
      this.emit('player_status_change', data);
    });

    this.socket.on('game_start', (data) => {
      this.emit('game_start', data);
    });

    this.socket.on('game_pause', (data) => {
      this.emit('game_pause', data);
    });

    this.socket.on('game_resume', (data) => {
      this.emit('game_resume', data);
    });

    this.socket.on('game_end', (data) => {
      this.emit('game_end', data);
    });

    this.socket.on('question_start', (data) => {
      this.emit('question_start', data);
    });

    this.socket.on('question_end', (data) => {
      this.emit('question_end', data);
    });

    this.socket.on('answer_submitted', (data) => {
      this.emit('answer_submitted', data);
    });

    this.socket.on('chat_message', (data) => {
      this.emit('chat_message', data);
    });

    this.socket.on('leaderboard_update', (data) => {
      this.emit('leaderboard_update', data);
    });

    this.socket.on('room_state_update', (data) => {
      this.emit('room_state_update', data);
    });

    this.socket.on('timer_update', (data) => {
      this.emit('timer_update', data);
    });

    this.socket.on('score_update', (data) => {
      this.emit('score_update', data);
    });

    this.socket.on('powerup_used', (data) => {
      this.emit('powerup_used', data);
    });

    this.socket.on('emoji_reaction', (data) => {
      this.emit('emoji_reaction', data);
    });

    // Error handling
    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.emit('error', data);
    });

    // Ping/Pong for connection health
    this.socket.on('ping', () => {
      this.send('pong', {});
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts', {});
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );
      this.socket?.connect();
    }, delay);
  }

  private rejoinRoom() {
    if (this.currentRoomId && this.playerId) {
      this.send('join_room', {
        roomId: this.currentRoomId,
        playerId: this.playerId,
        rejoin: true,
      });
    }
  }

  // Public API
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public joinRoom(roomId: string, player: Partial<Player>): Promise<GameRoom> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.currentRoomId = roomId;
      this.playerId = player.id || player.userId || null;

      const timeout = setTimeout(() => {
        reject(new Error('Join room timeout'));
      }, 10000);

      this.socket.once('room_joined', (data) => {
        clearTimeout(timeout);
        if (data.success) {
          resolve(data.room);
        } else {
          reject(new Error(data.error || 'Failed to join room'));
        }
      });

      this.send('join_room', {
        roomId,
        player,
      });
    });
  }

  public leaveRoom(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected || !this.currentRoomId) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Leave room timeout'));
      }, 5000);

      this.socket.once('room_left', () => {
        clearTimeout(timeout);
        this.currentRoomId = null;
        this.playerId = null;
        resolve();
      });

      this.send('leave_room', {
        roomId: this.currentRoomId,
      });
    });
  }

  public submitAnswer(answer: string | string[], timeSpent: number): void {
    if (!this.currentRoomId) return;

    this.send('submit_answer', {
      roomId: this.currentRoomId,
      answer,
      timeSpent,
    });
  }

  public sendChatMessage(message: string): void {
    if (!this.currentRoomId) return;

    this.send('send_chat', {
      roomId: this.currentRoomId,
      message,
    });
  }

  public sendEmojiReaction(emoji: string, targetPlayerId?: string): void {
    if (!this.currentRoomId) return;

    this.send('emoji_reaction', {
      roomId: this.currentRoomId,
      emoji,
      targetPlayerId,
    });
  }

  public usePowerUp(powerUpType: string, targetPlayerId?: string): void {
    if (!this.currentRoomId) return;

    this.send('use_powerup', {
      roomId: this.currentRoomId,
      powerUpType,
      targetPlayerId,
    });
  }

  public updatePlayerStatus(status: PlayerStatus): void {
    if (!this.currentRoomId) return;

    this.send('player_status_change', {
      roomId: this.currentRoomId,
      status,
    });
  }

  public startGame(): void {
    if (!this.currentRoomId) return;

    this.send('game_start', {
      roomId: this.currentRoomId,
    });
  }

  public pauseGame(): void {
    if (!this.currentRoomId) return;

    this.send('game_pause', {
      roomId: this.currentRoomId,
    });
  }

  public resumeGame(): void {
    if (!this.currentRoomId) return;

    this.send('game_resume', {
      roomId: this.currentRoomId,
    });
  }

  // Event system
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  public off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  public once(event: string, handler: Function): void {
    const wrappedHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, wrappedHandler);
    };
    this.on(event, wrappedHandler);
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  private send(type: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn(`Cannot send ${type}: not connected`);
      return;
    }

    const message: WebSocketMessage = {
      type: type as any,
      roomId: this.currentRoomId || '',
      playerId: this.playerId || undefined,
      data,
      timestamp: new Date(),
    };

    this.socket.emit(type, message);
  }

  // Cleanup
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentRoomId = null;
    this.playerId = null;
    this.eventHandlers.clear();
  }
}

// Singleton instance
let wsManagerInstance: WebSocketManager | null = null;

export const getWebSocketManager = (): WebSocketManager => {
  if (!wsManagerInstance) {
    wsManagerInstance = new WebSocketManager();
  }
  return wsManagerInstance;
};
