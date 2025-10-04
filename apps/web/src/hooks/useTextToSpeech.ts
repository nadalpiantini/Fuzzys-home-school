'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface VoiceSettings {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string, settings?: VoiceSettings) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  isPaused: boolean;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if speech synthesis is supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load voices when they become available
      const loadVoices = () => {
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
      };

      // Load voices immediately if available
      loadVoices();
      
      // Also listen for voice changes
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [selectedVoice]);

  const speak = useCallback(async (text: string, settings: VoiceSettings = {}): Promise<void> => {
    if (!isSupported) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Stop any current speech
    stop();

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Apply voice settings
        utterance.rate = settings.rate ?? 0.8; // Slightly slower for children
        utterance.pitch = settings.pitch ?? 1.0;
        utterance.volume = settings.volume ?? 0.8;
        utterance.voice = settings.voice ?? selectedVoice;

        // Event handlers
        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          utteranceRef.current = null;
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsSpeaking(false);
          setIsPaused(false);
          utteranceRef.current = null;
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
  }, [isSupported, selectedVoice]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      speechSynthesis.resume();
    }
  }, [isSupported, isPaused]);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    pause,
    resume,
    voices,
    selectedVoice,
    setSelectedVoice,
    isPaused,
  };
};
