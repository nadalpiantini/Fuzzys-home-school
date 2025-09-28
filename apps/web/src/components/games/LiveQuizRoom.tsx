'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Users,
  Crown,
  MessageSquare,
  Trophy,
  Timer,
  Send,
  Zap,
  Shield,
  Target,
  Volume2,
  VolumeX
} from 'lucide-react';
import { getWebSocketManager } from '@/services/multiplayer/websocket-manager';
import type { GameRoom, Player } from '@/services/multiplayer/types';

interface LiveQuizRoomProps {
  roomId: string;
  player: Partial<Player>;
  onGameEnd?: (analytics: any) => void;
  onLeaveRoom?: () => void;
  className?: string;
}

interface QuestionData {
  id: string;
  question: string;
  options: string[];
  timeLimit: number;
  difficulty: string;
}

export const LiveQuizRoom: React.FC<LiveQuizRoomProps> = ({
  roomId,
  player,
  onGameEnd,
  onLeaveRoom,
  className = ''
}) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [gamePhase, setGamePhase] = useState<'waiting' | 'starting' | 'active' | 'finished'>('waiting');

  const wsManager = useRef(getWebSocketManager());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const joinRoom = useCallback(async () => {
    try {
      const joinedRoom = await wsManager.current.joinRoom(roomId, player);
      setRoom(joinedRoom);
      setGamePhase(joinedRoom.status as any);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  }, [roomId, player]);

  const playSound = useCallback((type: string) => {
    if (!soundEnabled) return;

    // Simple audio feedback - in production would use actual sound files
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const frequencies: Record<string, number> = {
      join: 523.25,      // C5
      leave: 392.00,     // G4
      game_start: 659.25, // E5
      question_start: 783.99, // G5
      question_end: 523.25,   // C5
      game_end: 880.00,       // A5
      message: 440.00,        // A4
      submit: 698.46,         // F5
      score: 1046.50          // C6
    };

    oscillator.frequency.setValueAtTime(frequencies[type] || 440, audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [soundEnabled]);

  useEffect(() => {
    const ws = wsManager.current;

    // Connection events
    ws.on('connection_status', (data: { connected: boolean }) => {
      setConnected(data.connected);
    });

    // Game events
    ws.on('room_state_update', (data: { room: GameRoom }) => {
      setRoom(data.room);
      setGamePhase(data.room.status as any);
    });

    ws.on('player_joined', (data: { player: Player; room: GameRoom }) => {
      setRoom(data.room);
      playSound('join');
    });

    ws.on('player_left', (data: { playerId: string; room: GameRoom }) => {
      setRoom(data.room);
      playSound('leave');
    });

    ws.on('game_start', (data: { room: GameRoom }) => {
      setRoom(data.room);
      setGamePhase('starting');
      playSound('game_start');
    });

    ws.on('question_start', (data: { question: QuestionData; timeLimit: number }) => {
      setCurrentQuestion(data.question);
      setTimeLeft(data.timeLimit);
      setSelectedAnswer(null);
      setShowResults(false);
      setGamePhase('active');
      startTimer(data.timeLimit);
      playSound('question_start');
    });

    ws.on('question_end', (data: { results: any }) => {
      setShowResults(true);
      playSound('question_end');
    });

    ws.on('game_end', (data: { analytics: any }) => {
      setGamePhase('finished');
      playSound('game_end');
      if (onGameEnd) {
        onGameEnd(data.analytics);
      }
    });

    ws.on('chat_message', (data: { message: any }) => {
      // Chat will be updated through room_state_update
      playSound('message');
    });

    ws.on('leaderboard_update', (data: { room: GameRoom }) => {
      setRoom(data.room);
    });

    ws.on('score_update', (data: { playerId: string; score: number; room: GameRoom }) => {
      setRoom(data.room);
      if (data.playerId === player.id) {
        playSound('score');
      }
    });

    // Join room
    joinRoom();

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      ws.leaveRoom();
    };
  }, [joinRoom, onGameEnd, playSound, player.id]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.chat]);

  const startTimer = (seconds: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const timeSpent = (currentQuestion.timeLimit - timeLeft) * 1000;
    wsManager.current.submitAnswer(selectedAnswer, timeSpent);

    // Disable further selection
    setSelectedAnswer(null);
    playSound('submit');
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    wsManager.current.sendChatMessage(chatMessage.trim());
    setChatMessage('');
  };

  const startGame = () => {
    wsManager.current.startGame();
  };

  const leaveRoom = async () => {
    await wsManager.current.leaveRoom();
    if (onLeaveRoom) {
      onLeaveRoom();
    }
  };

  const getPlayerRank = (playerId: string): number => {
    return room?.leaderboard.find(entry => entry.playerId === playerId)?.rank || 0;
  };

  const getTimerColor = (): string => {
    if (timeLeft > 20) return 'text-green-600';
    if (timeLeft > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isRoomCreator = room?.config.createdBy === player.userId;

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error al cargar la sala</p>
          <Button onClick={joinRoom} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`live-quiz-room grid grid-cols-1 lg:grid-cols-4 gap-4 h-full ${className}`}>
      {/* Main Game Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Room Header */}
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{room.config.name}</h2>
              <p className="text-gray-600">
                {room.config.subject} • {room.config.difficulty}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button variant="outline" onClick={leaveRoom}>
                Salir
              </Button>
            </div>
          </div>
        </Card>

        {/* Game Status */}
        {gamePhase === 'waiting' && (
          <Card className="p-6 text-center">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Esperando jugadores ({room.players.length}/{room.config.maxPlayers})
            </h3>
            <p className="text-gray-600 mb-4">
              Se necesitan al menos 2 jugadores para comenzar
            </p>
            {isRoomCreator && room.players.length >= 2 && (
              <Button onClick={startGame} size="lg">
                Iniciar Juego
              </Button>
            )}
          </Card>
        )}

        {gamePhase === 'starting' && (
          <Card className="p-6 text-center">
            <Timer className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">¡El juego está comenzando!</h3>
            <p className="text-gray-600">Prepárate...</p>
          </Card>
        )}

        {/* Question Area */}
        {gamePhase === 'active' && currentQuestion && (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className={`text-3xl font-bold mb-2 ${getTimerColor()}`}>
                {timeLeft}s
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timeLeft > 20 ? 'bg-green-500' : timeLeft > 10 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${(timeLeft / currentQuestion.timeLimit) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Pregunta {(room.currentQuestion?.index || 0) + 1} de {room.config.totalQuestions}
              </h3>
              <p className="text-xl mb-6">{currentQuestion.question}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(option)}
                    disabled={showResults || timeLeft === 0}
                    className={`p-4 text-left border-2 rounded-lg transition-all ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${
                      showResults || timeLeft === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium text-blue-600 mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>

              {selectedAnswer && !showResults && timeLeft > 0 && (
                <div className="text-center mt-6">
                  <Button onClick={submitAnswer} size="lg">
                    Enviar Respuesta
                  </Button>
                </div>
              )}
            </div>

            {showResults && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Resultados de la pregunta</h4>
                <p className="text-blue-700">Esperando la siguiente pregunta...</p>
              </div>
            )}
          </Card>
        )}

        {gamePhase === 'finished' && (
          <Card className="p-6 text-center">
            <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">¡Juego Terminado!</h3>

            {/* Final Leaderboard */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Resultados Finales</h4>
              {room.leaderboard.slice(0, 3).map((entry, index) => (
                <div
                  key={entry.playerId}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                    {index === 1 && <div className="w-5 h-5 bg-gray-400 rounded-full" />}
                    {index === 2 && <div className="w-5 h-5 bg-amber-600 rounded-full" />}
                    <span className="font-medium">{entry.name}</span>
                  </div>
                  <span className="font-bold text-blue-600">{entry.score}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Players List */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Jugadores ({room.players.length})
          </h4>
          <div className="space-y-2">
            {room.players.map((roomPlayer) => (
              <div
                key={roomPlayer.id}
                className={`flex items-center justify-between p-2 rounded ${
                  roomPlayer.id === player.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    roomPlayer.status === 'connected' ? 'bg-green-500' :
                    roomPlayer.status === 'answering' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium">{roomPlayer.name}</span>
                  {room.config.createdBy === roomPlayer.userId && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-600">{roomPlayer.score}</div>
                  <div className="text-xs text-gray-500">#{getPlayerRank(roomPlayer.id)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Leaderboard */}
        {room.leaderboard.length > 0 && gamePhase === 'active' && (
          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Clasificación
            </h4>
            <div className="space-y-2">
              {room.leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.playerId}
                  className="flex items-center justify-between p-2 rounded bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-600">#{entry.rank}</span>
                    <span className="text-sm">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600">{entry.score}</div>
                    {entry.streak > 0 && (
                      <div className="text-xs text-orange-600">🔥 {entry.streak}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Chat */}
        {room.config.settings.enableChat && (
          <Card className="p-4 flex flex-col h-80">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {room.chat.slice(-20).map((message) => (
                <div
                  key={message.id}
                  className={`text-sm ${
                    message.type === 'system' ? 'text-gray-500 italic' : ''
                  }`}
                >
                  {message.type !== 'system' && (
                    <span className="font-medium text-blue-600">{message.playerName}: </span>
                  )}
                  {message.message}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendChatMessage} className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                maxLength={200}
              />
              <Button type="submit" size="sm" disabled={!chatMessage.trim()}>
                <Send className="w-3 h-3" />
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};