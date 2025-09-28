'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Bell } from 'lucide-react';
import { useHookedSystem } from '@/hooks/useHookedSystem';
import Inbox from '@/components/hooked/Inbox';

export default function InboxPage() {
  const router = useRouter();
  const { messages, loading, markMessageAsRead } = useHookedSystem();
  const [filteredMessages, setFilteredMessages] = useState(messages);

  useEffect(() => {
    setFilteredMessages(messages);
  }, [messages]);

  const handleMessageClick = (message: any) => {
    if (message.cta_url) {
      router.push(message.cta_url);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    await markMessageAsRead(messageId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-600 mx-auto mb-4"></div>
          <p className="text-earth-600">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/student')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-earth-800 flex items-center gap-2">
                <Bell className="w-6 h-6 text-earth-600" />
                Mi Bandeja
              </h1>
              <p className="text-earth-600">Mensajes de Fuzzy y tus logros</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="p-6">
          <Inbox
            messages={filteredMessages}
            onMarkAsRead={handleMarkAsRead}
            onMessageClick={handleMessageClick}
          />
        </Card>
      </div>
    </div>
  );
}
