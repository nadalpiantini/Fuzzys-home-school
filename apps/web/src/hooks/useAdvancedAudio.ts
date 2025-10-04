'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { audioService } from '@/services/audio/AudioService';

interface VoiceSettings {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

interface UseAdvancedAudioReturn {
  isPlaying: boolean;
  isSupported: boolean;
  playAudio: (text: string, settings?: VoiceSettings) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  isPaused: boolean;
  hasPreRecordedAudio: (text: string) => Promise<boolean>;
  audioType: 'pre-recorded' | 'tts' | 'none';
}

export const useAdvancedAudio = (): UseAdvancedAudioReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [audioType, setAudioType] = useState<'pre-recorded' | 'tts' | 'none'>('none');
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentTextRef = useRef<string>('');

  // Check if audio is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('Audio' in window || 'speechSynthesis' in window);
      
      // Load voices for TTS fallback
      const loadVoices = () => {
        if ('speechSynthesis' in window) {
          const availableVoices = speechSynthesis.getVoices();
          setVoices(availableVoices);
          
          // Auto-select Spanish voice if available
          if (!selectedVoice) {
            const spanishVoice = availableVoices.find(voice => 
              voice.lang.startsWith('es') || 
              voice.name.toLowerCase().includes('spanish') ||
              voice.name.toLowerCase().includes('español')
            );
            if (spanishVoice) {
              setSelectedVoice(spanishVoice);
            }
          }
        }
      };

      loadVoices();
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [selectedVoice]);

  const playAudio = useCallback(async (text: string, settings: VoiceSettings = {}): Promise<void> => {
    if (!isSupported) {
      console.warn('Audio not supported');
      return;
    }

    // Stop any current audio
    stop();
    currentTextRef.current = text;

    try {
      // Try pre-recorded audio first
      const hasPreRecorded = await audioService.hasAudio(text, 'es');
      if (hasPreRecorded) {
        setAudioType('pre-recorded');
        setIsPlaying(true);
        await audioService.playAudio(text, 'es');
        setIsPlaying(false);
        setAudioType('none');
        return;
      }

      // Fallback to text-to-speech
      if ('speechSynthesis' in window) {
        setAudioType('tts');
        await playTextToSpeech(text, settings);
      } else {
        setAudioType('none');
        console.warn('No audio available for:', text);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setAudioType('none');
    }
  }, [isSupported]);

  const playTextToSpeech = useCallback(async (text: string, settings: VoiceSettings): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Apply voice settings
        utterance.rate = settings.rate ?? 0.7; // Slower for children
        utterance.pitch = settings.pitch ?? 1.0;
        utterance.volume = settings.volume ?? 0.8;
        utterance.voice = settings.voice ?? selectedVoice;
        utterance.lang = 'es-ES';

        // Event handlers
        utterance.onstart = () => {
          setIsPlaying(true);
          setIsPaused(false);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
          utteranceRef.current = null;
          setAudioType('none');
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          setIsPaused(false);
          utteranceRef.current = null;
          setAudioType('none');
          reject(event);
        };

        utterance.onpause = () => {
          setIsPaused(true);
        };

        utterance.onresume = () => {
          setIsPaused(false);
        };

        // Start speaking
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error creating speech utterance:', error);
        reject(error);
      }
    });
  }, [selectedVoice]);

  const stop = useCallback(() => {
    if (isSupported) {
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
      setAudioType('none');
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isPlaying) {
      if (utteranceRef.current) {
        speechSynthesis.pause();
      }
    }
  }, [isSupported, isPlaying]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      if (utteranceRef.current) {
        speechSynthesis.resume();
      }
    }
  }, [isSupported, isPaused]);

  const hasPreRecordedAudio = useCallback(async (text: string): Promise<boolean> => {
    return await audioService.hasAudio(text, 'es');
  }, []);

  return {
    isPlaying,
    isSupported,
    playAudio,
    stop,
    pause,
    resume,
    voices,
    selectedVoice,
    setSelectedVoice,
    isPaused,
    hasPreRecordedAudio,
    audioType,
  };
};
