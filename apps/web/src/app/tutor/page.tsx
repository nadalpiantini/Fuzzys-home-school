'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Brain, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChildProfile } from '@/hooks/useChildProfile';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function TutorPage() {
  const { t, language } = useTranslation();
  const { childData } = useChildProfile();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Inicializar sesión del tutor
  const initializeSession = async () => {
    if (sessionId) return; // Ya hay una sesión activa

    try {
      const studentProfile = childData
        ? {
            grade:
              childData.age <= 5
                ? 1
                : childData.age <= 8
                  ? 3
                  : childData.age <= 12
                    ? 6
                    : 9,
            age: childData.age,
            learningStyle: 'visual' as const,
            currentLevel: 'beginner' as const,
            strongAreas: childData.interests,
            challengeAreas: [],
          }
        : undefined;

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_session',
          userId: 'current_user',
          subject: 'Ciencias Naturales', // Materia por defecto
          studentProfile,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.data.sessionId);
        // Agregar mensaje de bienvenida
        const welcomeMessage: Message = {
          id: 'welcome',
          text: data.data.welcomeMessage,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  // Inicializar sesión al cargar la página
  React.useEffect(() => {
    initializeSession();
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_query',
          sessionId: sessionId,
          query: inputMessage,
          metadata: {
            concept: 'general',
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.data.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Error en la respuesta del tutor');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          language === 'es'
            ? 'Lo siento, hubo un error al procesar tu pregunta. Por favor, inténtalo de nuevo.'
            : 'Sorry, there was an error processing your question. Please try again.',
        isUser: false,
        timestamp: new Date(),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'es' ? 'Volver' : 'Back'}
            </Button>
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-fuzzy-purple" />
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'es' ? 'Tutor IA' : 'AI Tutor'}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'es'
                    ? 'Tu asistente educativo personal'
                    : 'Your personal educational assistant'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Card */}
          {messages.length === 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-fuzzy-purple" />
                  {language === 'es'
                    ? '¡Hola! Soy tu tutor IA'
                    : "Hello! I'm your AI tutor"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {language === 'es'
                    ? 'Puedo ayudarte con cualquier materia: matemáticas, ciencias, historia, idiomas y más. ¡Pregúntame lo que necesites!'
                    : 'I can help you with any subject: math, science, history, languages, and more. Ask me anything you need!'}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">
                      {language === 'es'
                        ? 'Ejemplos de preguntas:'
                        : 'Example questions:'}
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>
                        •{' '}
                        {language === 'es'
                          ? '¿Cómo resuelvo ecuaciones?'
                          : 'How do I solve equations?'}
                      </li>
                      <li>
                        •{' '}
                        {language === 'es'
                          ? 'Explícame la fotosíntesis'
                          : 'Explain photosynthesis'}
                      </li>
                      <li>
                        •{' '}
                        {language === 'es'
                          ? '¿Qué es la Revolución Francesa?'
                          : 'What is the French Revolution?'}
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">
                      {language === 'es' ? 'Características:' : 'Features:'}
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>
                        •{' '}
                        {language === 'es'
                          ? 'Respuestas instantáneas'
                          : 'Instant responses'}
                      </li>
                      <li>
                        •{' '}
                        {language === 'es'
                          ? 'Adaptado a tu nivel'
                          : 'Adapted to your level'}
                      </li>
                      <li>
                        •{' '}
                        {language === 'es'
                          ? 'Explicaciones claras'
                          : 'Clear explanations'}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Messages */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="h-96 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isUser
                          ? 'bg-fuzzy-purple text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                        <span className="text-sm">
                          {language === 'es' ? 'Pensando...' : 'Thinking...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Input Area */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    language === 'es'
                      ? 'Escribe tu pregunta aquí...'
                      : 'Type your question here...'
                  }
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-fuzzy-purple hover:bg-fuzzy-purple/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
