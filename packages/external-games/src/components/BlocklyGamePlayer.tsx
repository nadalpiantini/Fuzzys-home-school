import React, { useEffect, useRef, useState } from 'react';
import { ExternalGameWrapper } from './ExternalGameWrapper';
import type { ExternalGameWrapperProps, ExternalGameConfig } from '../types';

export interface BlocklyGamePlayerProps extends Omit<ExternalGameWrapperProps, 'className' | 'style'> {
  showFuzzyHeader?: boolean;
  showProgrammingTips?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function BlocklyGamePlayer({
  config,
  studentId,
  onEvent,
  onComplete,
  onError,
  showFuzzyHeader = true,
  showProgrammingTips = true,
  className = '',
  style = {},
}: BlocklyGamePlayerProps) {
  const [showTips, setShowTips] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Tips específicos para cada juego de Blockly
  const getGameTips = (gameId: string) => {
    const tips = {
      'maze': [
        '🧩 Arrastra los bloques para programar los movimientos de Fuzzy',
        '📍 Planifica la ruta antes de empezar a programar',
        '🔄 Usa bucles para movimientos repetitivos',
        '🎯 ¡Ayuda a Fuzzy a llegar a la meta!'
      ],
      'turtle': [
        '🎨 Programa a Fuzzy para crear arte increíble',
        '📐 Usa ángulos precisos para formas perfectas',
        '🌈 Experimenta con diferentes colores',
        '✨ ¡La creatividad es la clave!'
      ],
      'bird': [
        '🐦 Controla el vuelo de Fuzzy con bloques',
        '🎮 Usa condiciones para evitar obstáculos',
        '⭐ Colecta todas las estrellas posibles',
        '🚀 ¡Vuela alto con Fuzzy!'
      ],
      'pond': [
        '🏊 Programa la natación de Fuzzy',
        '⚔️ Usa estrategias inteligentes',
        '🎯 La precisión es importante',
        '🏆 ¡Conviértete en el campeón del estanque!'
      ]
    };
    return tips[gameId as keyof typeof tips] || [
      '🧩 Arrastra y conecta los bloques para programar',
      '🤔 Piensa paso a paso en la solución',
      '✨ ¡Experimenta y diviértete aprendiendo!'
    ];
  };

  const handleGameEvent = (event: any) => {
    // Detectar cuando el juego inicia
    if (event.action === 'level-started' || event.action === 'game-started') {
      setGameStarted(true);
    }

    // Propagar el evento
    onEvent?.(event);
  };

  const fuzzyEmoji = config.gameId === 'maze' ? '🧩' :
                    config.gameId === 'turtle' ? '🎨' :
                    config.gameId === 'bird' ? '🐦' :
                    config.gameId === 'pond' ? '🏊' : '🤖';

  return (
    <div
      className={`blockly-game-player ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f8f9fa',
        ...style,
      }}
    >
      {/* Header temático de Fuzzy para Blockly */}
      {showFuzzyHeader && (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>{fuzzyEmoji}</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                {config.title}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                ¡Programa junto a Fuzzy y aprende mientras juegas!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {showProgrammingTips && (
              <button
                onClick={() => setShowTips(!showTips)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  color: 'white',
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
              >
                💡 {showTips ? 'Ocultar Tips' : 'Ver Tips'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Panel de tips de programación */}
      {showTips && showProgrammingTips && (
        <div
          style={{
            backgroundColor: '#e8f4fd',
            border: '1px solid #b8daff',
            padding: '16px',
            margin: '0',
            fontSize: '14px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#004085' }}>
            💡 Tips de Programación con Fuzzy:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#004085' }}>
            {getGameTips(config.gameId).map((tip, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Área principal del juego usando ExternalGameWrapper */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ExternalGameWrapper
          config={config}
          studentId={studentId}
          onEvent={handleGameEvent}
          onComplete={onComplete}
          onError={onError}
          style={{ height: '100%' }}
        />
      </div>

      {/* Footer con motivación y progreso */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          borderTop: '2px solid #e9ecef',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🎯</span>
          <span style={{ color: '#666' }}>
            {gameStarted
              ? '¡Excelente! Sigue programando con Fuzzy 🚀'
              : '¡Haz clic en el juego para empezar la aventura! ✨'
            }
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#666' }}>
          <span>🧩 Programación Visual</span>
          <span>📚 {config.subjects?.join(', ') || 'Programación'}</span>
          <span>🎓 {config.difficulty === 'beginner' ? 'Principiante' :
                    config.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}</span>
        </div>
      </div>
    </div>
  );
}

// Función de conveniencia para crear configuraciones de Blockly con temática Fuzzy
export function createFuzzyBlocklyConfig(
  gameId: string,
  baseConfig: Partial<ExternalGameConfig>
): ExternalGameConfig {
  const gameEmojis: Record<string, string> = {
    'maze': '🧩',
    'turtle': '🎨',
    'bird': '🐦',
    'pond': '🏊',
  };

  const gameNames: Record<string, string> = {
    'maze': 'Laberinto con Fuzzy',
    'turtle': 'Arte con Fuzzy',
    'bird': 'Vuela con Fuzzy',
    'pond': 'Nada con Fuzzy',
  };

  return {
    source: 'blockly',
    gameId,
    title: `${gameEmojis[gameId] || '🤖'} ${gameNames[gameId] || baseConfig.title || 'Juego con Fuzzy'}`,
    description: baseConfig.description || `¡Aprende programación jugando con Fuzzy!`,
    url: `/games/blockly/${gameId}.html?lang=es`,
    allowedOrigins: [],
    trackingEnabled: true,
    ageRange: [8, 16],
    subjects: ['Programación', 'Lógica'],
    difficulty: 'beginner',
    ...baseConfig,
  };
}