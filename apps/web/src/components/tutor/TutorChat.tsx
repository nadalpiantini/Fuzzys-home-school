'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Send,
  Mic,
  MicOff,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Target,
  MessageSquare,
  Bot,
  User,
  Loader2,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?:
    | 'explanation'
    | 'socratic_question'
    | 'example'
    | 'step_by_step'
    | 'encouragement';
  followUpSuggestions?: string[];
  visualElements?: Array<{
    type: 'diagram' | 'image' | 'animation' | 'interactive';
    description: string;
    url?: string;
  }>;
}

interface TutorChatProps {
  subject: string;
  studentProfile?: {
    grade: number;
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
    strongAreas: string[];
    challengeAreas: string[];
  };
  onSessionEnd?: (analytics: any) => void;
  className?: string;
}

export const TutorChat: React.FC<TutorChatProps> = ({
  subject,
  studentProfile,
  onSessionEnd,
  className = '',
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentConcept, setCurrentConcept] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognition = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      if (recognition.current) {
        recognition.current.continuous = false;
        recognition.current.interimResults = false;
        recognition.current.lang = 'es-DO'; // Dominican Spanish
      }

      if (recognition.current) {
        (recognition.current as any).onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        (recognition.current as any).onerror = () => {
          setIsListening(false);
        };

        (recognition.current as any).onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const startSession = useCallback(async () => {
    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_session',
          userId: 'current_user', // Would come from auth context
          subject,
          studentProfile,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.data.sessionId);

        // Add welcome message
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: data.data.welcomeMessage,
          timestamp: new Date(),
          type: 'encouragement',
        };

        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [subject, studentProfile]);

  // Start session on mount
  useEffect(() => {
    startSession();
  }, [startSession]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_query',
          sessionId,
          query: messageText,
          metadata: {
            concept: currentConcept,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: Date.now().toString() + '_assistant',
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          type: data.data.type,
          followUpSuggestions: data.data.followUpSuggestions,
          visualElements: data.data.visualElements,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content:
          'Lo siento, tuve un problema técnico. ¿Puedes intentar de nuevo?',
        timestamp: new Date(),
        type: 'explanation',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognition.current) return;

    if (isListening) {
      recognition.current?.stop();
      setIsListening(false);
    } else {
      recognition.current?.start();
      setIsListening(true);
    }
  };

  const requestStepByStep = async () => {
    if (!currentConcept) {
      sendMessage('Explícame paso a paso el último tema que estábamos viendo');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'step_by_step',
          sessionId,
          concept: currentConcept,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const stepByStepMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          type: 'step_by_step',
          followUpSuggestions: data.data.followUpSuggestions,
        };

        setMessages((prev) => [...prev, stepByStepMessage]);
      }
    } catch (error) {
      console.error('Error requesting step by step:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestExamples = async (
    type: 'local' | 'visual' | 'analogies' = 'local',
  ) => {
    if (!currentConcept) {
      sendMessage(`Dame ejemplos de lo que estábamos viendo`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_examples',
          sessionId,
          concept: currentConcept,
          type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const exampleMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          type: 'example',
        };

        setMessages((prev) => [...prev, exampleMessage]);
      }
    } catch (error) {
      console.error('Error requesting examples:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.success && onSessionEnd) {
        onSessionEnd(data.data.analytics);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'socratic_question':
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case 'example':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'step_by_step':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'encouragement':
        return <MessageSquare className="w-4 h-4 text-green-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('es-DO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`tutor-chat flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="chat-header bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              Fuzzy - Tu Tutor de {subject}
            </h3>
            <p className="text-blue-100 text-sm">
              {studentProfile
                ? `Grado ${studentProfile.grade} • ${studentProfile.learningStyle}`
                : 'Tutor personalizado'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                {getMessageIcon(message.type)}
              </div>
            )}

            <div
              className={`message-content max-w-xs md:max-w-md lg:max-w-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg'
                  : 'bg-white border border-gray-200 rounded-r-lg rounded-tl-lg shadow-sm'
              } p-3`}
            >
              <div className="message-text text-sm leading-relaxed">
                {message.content}
              </div>

              {/* Visual Elements */}
              {message.visualElements && message.visualElements.length > 0 && (
                <div className="visual-elements mt-3 space-y-2">
                  {message.visualElements.map((element, index) => (
                    <div
                      key={index}
                      className="visual-element p-2 bg-blue-50 rounded border"
                    >
                      <div className="flex items-center gap-2 text-xs text-blue-700">
                        <span className="font-medium">{element.type}:</span>
                        <span>{element.description}</span>
                      </div>
                      {element.url && (
                        <div className="mt-2">
                          <img
                            src={element.url}
                            alt={element.description}
                            className="max-w-full h-auto rounded"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up Suggestions */}
              {message.followUpSuggestions &&
                message.followUpSuggestions.length > 0 && (
                  <div className="follow-up-suggestions mt-3 space-y-1">
                    <div className="text-xs text-gray-600 font-medium">
                      Sugerencias:
                    </div>
                    {message.followUpSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(suggestion)}
                        className="block w-full text-left text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

              <div
                className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="message-content bg-white border border-gray-200 rounded-r-lg rounded-tl-lg shadow-sm p-3">
              <div className="text-sm text-gray-500">
                Fuzzy está pensando...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions p-3 bg-white border-t border-gray-200">
        <div className="flex gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={requestStepByStep}
            disabled={isLoading}
            className="text-xs"
          >
            <Target className="w-3 h-3 mr-1" />
            Paso a paso
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => requestExamples('local')}
            disabled={isLoading}
            className="text-xs"
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            Ejemplos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              sendMessage(
                '¿Puedes hacerme unas preguntas para verificar si entendí?',
              )
            }
            disabled={isLoading}
            className="text-xs"
          >
            <HelpCircle className="w-3 h-3 mr-1" />
            Verificar
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="input-area p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta o duda..."
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleVoiceInput}
            disabled={isLoading || !recognition.current}
            className={isListening ? 'bg-red-50 border-red-300' : ''}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>

          <Button
            onClick={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          Presiona Enter para enviar • Click en el micrófono para usar voz
        </div>
      </div>
    </div>
  );
};
