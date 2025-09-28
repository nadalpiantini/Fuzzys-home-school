'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Trophy,
  Star,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface Message {
  id: string;
  kind: 'info' | 'quest' | 'badge' | 'achievement' | 'reminder';
  title: string;
  body: string;
  cta_url?: string;
  seen_at?: string;
  created_at: string;
  expires_at?: string;
}

interface InboxProps {
  messages: Message[];
  onMarkAsRead?: (messageId: string) => void;
  onMessageClick?: (message: Message) => void;
}

export default function Inbox({
  messages,
  onMarkAsRead,
  onMessageClick,
}: InboxProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'quest' | 'badge'>(
    'all',
  );

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unread') return !msg.seen_at;
    if (filter === 'quest') return msg.kind === 'quest';
    if (filter === 'badge')
      return msg.kind === 'badge' || msg.kind === 'achievement';
    return true;
  });

  const getIcon = (kind: string) => {
    switch (kind) {
      case 'quest':
        return <MessageSquare className="w-4 h-4" />;
      case 'badge':
      case 'achievement':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getColor = (kind: string) => {
    switch (kind) {
      case 'quest':
        return 'bg-blue-100 text-blue-800';
      case 'badge':
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMessageClick = (message: Message) => {
    if (!message.seen_at) {
      onMarkAsRead?.(message.id);
    }
    onMessageClick?.(message);
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay mensajes
        </h3>
        <p className="text-gray-500">
          Fuzzy te notificará cuando tengas algo nuevo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Todos', count: messages.length },
          {
            key: 'unread',
            label: 'No leídos',
            count: messages.filter((m) => !m.seen_at).length,
          },
          {
            key: 'quest',
            label: 'Retos',
            count: messages.filter((m) => m.kind === 'quest').length,
          },
          {
            key: 'badge',
            label: 'Logros',
            count: messages.filter(
              (m) => m.kind === 'badge' || m.kind === 'achievement',
            ).length,
          },
        ].map(({ key, label, count }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="text-xs"
          >
            {label} {count > 0 && `(${count})`}
          </Button>
        ))}
      </div>

      {/* Lista de mensajes */}
      <div className="space-y-3">
        {filteredMessages.map((message) => (
          <Card
            key={message.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              !message.seen_at
                ? 'border-l-4 border-l-earth-500 bg-earth-50/50'
                : ''
            }`}
            onClick={() => handleMessageClick(message)}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${getColor(message.kind)}`}>
                  {getIcon(message.kind)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {message.title}
                    </h4>
                    {!message.seen_at && (
                      <Badge variant="secondary" className="text-xs">
                        Nuevo
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {message.body}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(message.created_at).toLocaleDateString()}
                    </div>

                    {message.seen_at ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Leído
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Clock className="w-3 h-3" />
                        Sin leer
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
