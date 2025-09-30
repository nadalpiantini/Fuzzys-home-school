'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Brain,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { cn } from '@/lib/utils';
import { TutorEngine } from '@/services/tutor/tutor-engine';
import { DeepSeekClient } from '@/services/tutor/deepseek-client';
import type { TutorSession, TutorResponse } from '@/services/tutor/types';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: string;
}

interface AITutorChatProps {
  userId: string;
  subject: string;
  language?: 'es' | 'en';
  className?: string;
  onSessionEnd?: (analytics: any) => void;
}

export function AITutorChat({
  userId,
  subject,
  language = 'es',
  className,
  onSessionEnd,
}: AITutorChatProps) {
  const { t } = useTranslation('common');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<TutorSession | null>(null);
  const [tutorEngine, setTutorEngine] = useState<TutorEngine | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize tutor engine
  useEffect(() => {
    const initializeTutor = async () => {
      const deepSeekConfig = {
        apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '',
        baseURL:
          process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL ||
          'https://api.deepseek.com',
        model: process.env.NEXT_PUBLIC_DEEPSEEK_MODEL || 'deepseek-chat',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt:
          'You are an AI tutor helping students learn. Be encouraging, patient, and adapt to their learning style.',
      };

      const deepSeekClient = new DeepSeekClient(deepSeekConfig);
      const engine = new TutorEngine(deepSeekClient);
      setTutorEngine(engine);

      // Start session
      const newSession = await engine.startSession(userId, subject, {
        grade: 8,
        learningStyle: 'visual',
        currentLevel: 'beginner',
        strongAreas: [],
        challengeAreas: [],
      });

      setSession(newSession);

      // Add welcome message
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            newSession.messages[0]?.content ||
            (language === 'es'
              ? `¡Hola! Soy Fuzzy, tu tutor de ${subject}. ¿En qué puedo ayudarte hoy?`
              : `Hi! I'm Fuzzy, your ${subject} tutor. How can I help you today?`),
          timestamp: new Date(),
          type: 'welcome',
        },
      ]);
    };

    initializeTutor();
  }, [userId, subject, language]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !tutorEngine || !session || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Process query through tutor engine
      const response = await tutorEngine.processQuery(
        session.id,
        userMessage.content,
        { context: subject },
      );

      // Simulate typing effect
      setTimeout(() => {
        setIsTyping(false);

        const assistantMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          type: response.type,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }, 500);
    } catch (error) {
      console.error('Error processing message:', error);

      setIsTyping(false);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content:
          language === 'es'
            ? 'Lo siento, hubo un error. Por favor, intenta de nuevo.'
            : 'Sorry, there was an error. Please try again.',
        timestamp: new Date(),
        type: 'error',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!tutorEngine || !session) return;

    setIsLoading(true);

    try {
      let response: TutorResponse;

      switch (action) {
        case 'examples':
          response = await tutorEngine.requestExamples(
            session.id,
            subject,
            'local',
          );
          break;
        case 'step-by-step':
          response = await tutorEngine.provideStepByStep(
            session.id,
            subject,
            'current topic',
          );
          break;
        case 'visualize':
          response = await tutorEngine.requestExamples(
            session.id,
            subject,
            'visual',
          );
          break;
        default:
          response = {
            content:
              language === 'es'
                ? '¿En qué más puedo ayudarte?'
                : 'How else can I help you?',
            type: 'clarification',
            confidence: 0.8,
          };
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        type: response.type,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error with quick action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!tutorEngine || !session) return;

    const analytics = await tutorEngine.endSession(session.id);
    if (onSessionEnd) {
      onSessionEnd(analytics);
    }

    // Reset state
    setSession(null);
    setMessages([]);
    setTutorEngine(null);
  };

  return (
    <Card className={cn('h-[600px] flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            {language === 'es' ? 'Tutor AI - ' : 'AI Tutor - '}
            {subject}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              {language === 'es' ? 'Activo' : 'Active'}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEndSession}
              className="text-xs"
            >
              {language === 'es' ? 'Terminar' : 'End Session'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[70%] rounded-lg p-3',
                    message.role === 'user'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-gray-100 text-gray-900',
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <span className="text-xs opacity-50 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t">
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('examples')}
              disabled={isLoading}
              className="text-xs"
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              {language === 'es' ? 'Ejemplos' : 'Examples'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('step-by-step')}
              disabled={isLoading}
              className="text-xs"
            >
              <BookOpen className="w-3 h-3 mr-1" />
              {language === 'es' ? 'Paso a paso' : 'Step by step'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('visualize')}
              disabled={isLoading}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {language === 'es' ? 'Visualizar' : 'Visualize'}
            </Button>
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                language === 'es'
                  ? '¿Qué quieres aprender hoy?'
                  : 'What do you want to learn today?'
              }
              className="resize-none min-h-[60px]"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-3"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
