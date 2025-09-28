'use client';

import { Bell as BellIcon } from 'lucide-react';
import { useState } from 'react';

interface BellProps {
  hasUnread: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Bell({
  hasUnread,
  onClick,
  className = '',
}: BellProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (hasUnread) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    onClick?.();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        className={`p-2 rounded-full transition-all duration-200 ${
          hasUnread
            ? 'bg-earth-100 hover:bg-earth-200 text-earth-700'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        } ${isAnimating ? 'animate-pulse' : ''}`}
        title={hasUnread ? 'Tienes notificaciones' : 'Sin notificaciones'}
      >
        <BellIcon className="w-5 h-5" />
      </button>

      {hasUnread && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
        </div>
      )}
    </div>
  );
}
