'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioButton, AudioButtonWithText } from '@/components/ui/AudioButton';
import { useAdvancedAudio } from '@/hooks/useAdvancedAudio';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const DEMO_WORDS = [
  { text: 'niña', hasAudio: true, description: 'Palabra con ñ' },
  { text: 'nido', hasAudio: false, description: 'Palabra sin ñ' },
  { text: 'año', hasAudio: true, description: 'Palabra con ñ' },
  { text: 'nube', hasAudio: false, description: 'Palabra sin ñ' },
  { text: 'piña', hasAudio: true, description: 'Palabra con ñ' },
];

export const AudioDemo: React.FC = () => {
  const { isPlaying, isSupported, playAudio, stop, audioType, hasPreRecordedAudio } = useAdvancedAudio();
  const [selectedWord, setSelectedWord] = useState<string>('');

  const handleWordClick = async (word: string) => {
    setSelectedWord(word);
    try {
      await playAudio(word);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const checkAudioAvailability = async (word: string) => {
    const hasAudio = await hasPreRecordedAudio(word);
    console.log(`Audio available for "${word}":`, hasAudio);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Demostración del Sistema de Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado del sistema */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Estado del Sistema</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Soporte de Audio:</span>
                <span className={`ml-2 ${isSupported ? 'text-green-600' : 'text-red-600'}`}>
                  {isSupported ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <div>
                <span className="font-medium">Tipo de Audio:</span>
                <span className="ml-2 text-blue-600">
                  {audioType === 'pre-recorded' ? 'Pre-grabado' : 
                   audioType === 'tts' ? 'Text-to-Speech' : 'Ninguno'}
                </span>
              </div>
              <div>
                <span className="font-medium">Reproduciendo:</span>
                <span className={`ml-2 ${isPlaying ? 'text-green-600' : 'text-gray-500'}`}>
                  {isPlaying ? 'Sí' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Palabra Seleccionada:</span>
                <span className="ml-2 text-blue-600">
                  {selectedWord || 'Ninguna'}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de audio individuales */}
          <div>
            <h3 className="font-semibold mb-4">Palabras con y sin "ñ"</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_WORDS.map((word, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium text-lg">{word.text}</span>
                    <p className="text-sm text-gray-600">{word.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AudioButton
                      text={word.text}
                      size="sm"
                      rate={0.7}
                      volume={0.9}
                    />
                    <button
                      onClick={() => checkAudioAvailability(word.text)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Verificar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones con texto */}
          <div>
            <h3 className="font-semibold mb-4">Botones con Texto</h3>
            <div className="flex flex-wrap gap-3">
              <AudioButtonWithText
                text="¿Suena /ñ/ en «niña»?"
                showText={true}
                rate={0.6}
                volume={0.9}
                className="bg-blue-50 hover:bg-blue-100"
              />
              <AudioButtonWithText
                text="¿Suena /ñ/ en «nido»?"
                showText={true}
                rate={0.6}
                volume={0.9}
                className="bg-green-50 hover:bg-green-100"
              />
              <AudioButtonWithText
                text="¿Suena /ñ/ en «año»?"
                showText={true}
                rate={0.6}
                volume={0.9}
                className="bg-purple-50 hover:bg-purple-100"
              />
            </div>
          </div>

          {/* Controles de audio */}
          <div>
            <h3 className="font-semibold mb-4">Controles de Audio</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleWordClick('niña')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Reproducir "niña"
              </button>
              <button
                onClick={() => handleWordClick('año')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Reproducir "año"
              </button>
              <button
                onClick={stop}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={!isPlaying}
              >
                Detener Audio
              </button>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Instrucciones</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Haz clic en los botones de audio para escuchar las palabras</li>
              <li>• El sistema intentará usar audio pre-grabado primero</li>
              <li>• Si no hay audio pre-grabado, usará text-to-speech</li>
              <li>• Los botones cambian de estado mientras se reproduce el audio</li>
              <li>• Puedes pausar y reanudar la reproducción</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
