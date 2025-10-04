'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Play, Pause, Loader2 } from 'lucide-react';
import { useAdvancedAudio } from '@/hooks/useAdvancedAudio';
import { cn } from '@/lib/utils';

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
  autoPlay?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  className,
  size = 'md',
  variant = 'outline',
  disabled = false,
  autoPlay = false,
  rate = 0.8,
  pitch = 1.0,
  volume = 0.8,
}) => {
  const { isPlaying, isSupported, playAudio, stop, pause, resume, isPaused, audioType } = useAdvancedAudio();

  const handleClick = async () => {
    if (disabled || !isSupported) return;

    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      try {
        await playAudio(text, { rate, pitch, volume });
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const getIcon = () => {
    if (!isSupported) {
      return <VolumeX className="w-4 h-4 text-gray-400" />;
    }
    
    if (isPlaying) {
      if (isPaused) {
        return <Play className="w-4 h-4" />;
      }
      return <Pause className="w-4 h-4" />;
    }
    
    return <Volume2 className="w-4 h-4" />;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 p-1';
      case 'lg':
        return 'h-12 w-12 p-2';
      default:
        return 'h-10 w-10 p-2';
    }
  };

  if (!isSupported) {
    return (
      <Button
        variant={variant}
        size="icon"
        disabled
        className={cn(getSizeClasses(), className)}
        title="Audio no soportado en este navegador"
      >
        <VolumeX className="w-4 h-4 text-gray-400" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        getSizeClasses(),
        isPlaying && 'bg-blue-100 border-blue-300 text-blue-700',
        className
      )}
      title={isPlaying ? (isPaused ? 'Reanudar audio' : 'Pausar audio') : `Reproducir: ${text}`}
    >
      {getIcon()}
    </Button>
  );
};

// Componente para audio con texto visible
export const AudioButtonWithText: React.FC<AudioButtonProps & { showText?: boolean }> = ({
  text,
  showText = true,
  className,
  ...props
}) => {
  const { isPlaying, isSupported, playAudio, stop, pause, resume, isPaused } = useAdvancedAudio();

  const handleClick = async () => {
    if (props.disabled || !isSupported) return;

    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      try {
        await playAudio(text, { 
          rate: props.rate || 0.8, 
          pitch: props.pitch || 1.0, 
          volume: props.volume || 0.8 
        });
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const getIcon = () => {
    if (!isSupported) {
      return <VolumeX className="w-4 h-4 text-gray-400" />;
    }
    
    if (isPlaying) {
      if (isPaused) {
        return <Play className="w-4 h-4" />;
      }
      return <Pause className="w-4 h-4" />;
    }
    
    return <Volume2 className="w-4 h-4" />;
  };

  if (!isSupported) {
    return (
      <div className={cn("flex items-center gap-2 text-gray-500", className)}>
        <VolumeX className="w-4 h-4" />
        {showText && <span className="text-sm">Audio no disponible</span>}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={props.disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-gray-50",
        isPlaying && "bg-blue-50 border-blue-200 text-blue-700",
        props.disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      title={isPlaying ? (isPaused ? 'Reanudar audio' : 'Pausar audio') : `Reproducir: ${text}`}
    >
      {getIcon()}
      {showText && (
        <span className="text-sm font-medium">
          {isPlaying ? (isPaused ? 'Reanudar' : 'Pausar') : 'Escuchar'}
        </span>
      )}
    </button>
  );
};
