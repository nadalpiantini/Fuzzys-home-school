'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Quest {
  id: string;
  title: string;
  description?: string;
}

interface MessageBarProps {
  quest?: Quest;
  onDismiss?: () => void;
  onStartQuest?: (questId: string) => void;
}

export default function MessageBar({
  quest,
  onDismiss,
  onStartQuest,
}: MessageBarProps) {
  const [show, setShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (quest) {
      const dismissedKey = `msg.dismiss.${quest.id}`;
      const wasDismissed = localStorage.getItem(dismissedKey);

      if (!wasDismissed) {
        setShow(true);
        // Pequeño delay para la animación
        setTimeout(() => setIsVisible(true), 100);
      }
    }
  }, [quest]);

  const handleDismiss = () => {
    if (quest) {
      localStorage.setItem(`msg.dismiss.${quest.id}`, '1');
    }
    setIsVisible(false);
    setTimeout(() => {
      setShow(false);
      onDismiss?.();
    }, 300);
  };

  const handleStartQuest = () => {
    if (quest) {
      onStartQuest?.(quest.id);
    }
  };

  if (!show || !quest) return null;

  return (
    <div
      className={`mx-4 my-3 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="glass rounded-xl border border-earth-200/50 p-4 flex items-center gap-3 bg-gradient-to-r from-earth-50 to-green-50">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-earth-500/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-earth-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-earth-800">
            🤫 <span className="font-semibold">Fuzzy dice:</span> {quest.title}{' '}
            te espera
          </p>
          {quest.description && (
            <p className="text-xs text-earth-600 mt-1">{quest.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleStartQuest}
            className="btn-earth text-xs px-3 py-1 h-auto"
          >
            Ir
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-earth-500 hover:text-earth-700 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
