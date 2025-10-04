'use client';

interface AudioFile {
  id: string;
  text: string;
  url: string;
  language: string;
}

interface AudioServiceConfig {
  baseUrl: string;
  fallbackToTTS: boolean;
  preloadAudio: boolean;
}

export class AudioService {
  private config: AudioServiceConfig;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private isSupported: boolean;

  constructor(config: Partial<AudioServiceConfig> = {}) {
    this.config = {
      baseUrl: '/audio/literacy',
      fallbackToTTS: true,
      preloadAudio: false,
      ...config,
    };
    this.isSupported = typeof window !== 'undefined' && 'Audio' in window;
  }

  /**
   * Reproduce audio para una palabra o frase específica
   */
  async playAudio(text: string, language: string = 'es'): Promise<void> {
    if (!this.isSupported) {
      console.warn('Audio not supported in this browser');
      return;
    }

    try {
      // Intentar usar audio pre-grabado primero
      const audioFile = await this.getAudioFile(text, language);
      if (audioFile) {
        await this.playPreRecordedAudio(audioFile);
        return;
      }

      // Fallback a text-to-speech si está disponible
      if (this.config.fallbackToTTS && 'speechSynthesis' in window) {
        await this.playTextToSpeech(text, language);
      } else {
        console.warn('No audio available for:', text);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  /**
   * Obtiene el archivo de audio pre-grabado para un texto
   */
  private async getAudioFile(text: string, language: string): Promise<AudioFile | null> {
    // Mapeo de palabras comunes a archivos de audio de Fuzzy
    const audioMap: Record<string, string> = {
      // Palabras con ñ
      'niña': 'fuzzy_nina.mp3',
      'año': 'fuzzy_ano.mp3', 
      'piña': 'fuzzy_pina.mp3',
      'caña': 'fuzzy_cana.mp3',
      'señor': 'fuzzy_senor.mp3',
      'niño': 'fuzzy_nino.mp3',
      'sueño': 'fuzzy_sueno.mp3',
      'pequeño': 'fuzzy_pequeno.mp3',
      'español': 'fuzzy_espanol.mp3',
      
      // Palabras sin ñ para comparación
      'nido': 'fuzzy_nido.mp3',
      'nube': 'fuzzy_nube.mp3',
      'naranja': 'fuzzy_naranja.mp3',
      'noche': 'fuzzy_noche.mp3',
      
      // Sílabas con ñ
      'ña': 'fuzzy_nya.mp3',
      'ñe': 'fuzzy_nye.mp3', 
      'ñi': 'fuzzy_nyi.mp3',
      'ño': 'fuzzy_nyo.mp3',
      'ñu': 'fuzzy_nyu.mp3',
      
      // Palabras adicionales del curriculum
      'cañón': 'fuzzy_canon.mp3',
      'cañaveral': 'fuzzy_canaveral.mp3',      
      // Preguntas completas del curriculum de literacy level 1
      '¿suena \'ñ\' en "niña"?': 'fuzzy_nina.mp3',
      '¿suena \'ñ\' en "nido"?': 'fuzzy_nido.mp3',
      '¿suena \'ñ\' en "año"?': 'fuzzy_ano.mp3',
      '¿suena \'ñ\' en "nube"?': 'fuzzy_nube.mp3',
      '¿suena \'ñ\' en "piña"?': 'fuzzy_pina.mp3',
    };

    const normalizedText = text.toLowerCase().trim();
    const audioFileName = audioMap[normalizedText];
    
    if (!audioFileName) {
      return null;
    }

    return {
      id: normalizedText,
      text: text,
      url: `${this.config.baseUrl}/${audioFileName}`,
      language,
    };
  }

  /**
   * Reproduce audio pre-grabado
   */
  private async playPreRecordedAudio(audioFile: AudioFile): Promise<void> {
    return new Promise((resolve, reject) => {
      let audio = this.audioCache.get(audioFile.id);
      
      if (!audio) {
        audio = new Audio(audioFile.url);
        audio.preload = this.config.preloadAudio ? 'auto' : 'none';
        this.audioCache.set(audioFile.id, audio);
      }

      audio.onended = () => resolve();
      audio.onerror = (error) => {
        console.error('Error playing audio file:', error);
        reject(error);
      };

      audio.play().catch((error) => {
        console.error('Error starting audio playback:', error);
        reject(error);
      });
    });
  }

  /**
   * Fallback a text-to-speech
   */
  private async playTextToSpeech(text: string, language: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'es' ? 'es-ES' : language;
      utterance.rate = 0.7; // Más lento para niños
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => {
        console.error('Text-to-speech error:', error);
        reject(error);
      };

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Pre-carga archivos de audio importantes
   */
  async preloadImportantAudio(): Promise<void> {
    if (!this.config.preloadAudio) return;

    const importantWords = ['niña', 'año', 'piña', 'caña', 'niño', 'nido', 'nube'];
    
    for (const word of importantWords) {
      try {
        const audioFile = await this.getAudioFile(word, 'es');
        if (audioFile) {
          const audio = new Audio(audioFile.url);
          audio.preload = 'auto';
          this.audioCache.set(audioFile.id, audio);
        }
      } catch (error) {
        console.warn(`Failed to preload audio for ${word}:`, error);
      }
    }
  }

  /**
   * Limpia la caché de audio
   */
  cleanup(): void {
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioCache.clear();
  }

  /**
   * Verifica si hay audio disponible para un texto
   */
  async hasAudio(text: string, language: string = 'es'): Promise<boolean> {
    const audioFile = await this.getAudioFile(text, language);
    return audioFile !== null;
  }
}

// Instancia singleton del servicio de audio
export const audioService = new AudioService({
  baseUrl: '/audio/literacy',
  fallbackToTTS: true,
  preloadAudio: true,
});
