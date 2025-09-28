'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useExternalGameTracking } from '../hooks/useExternalGameTracking';
import type { ExternalGameWrapperProps } from '../types';

export function ExternalGameWrapper({
  config,
  studentId,
  onEvent,
  onComplete,
  onError,
  className = '',
  style = {},
}: ExternalGameWrapperProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { progress, isActive, startTracking, stopTracking, sendMessage } =
    useExternalGameTracking({
      config,
      studentId,
      onEvent,
      onComplete,
      enabled: config.trackingEnabled !== false,
    });

  const handleIframeLoad = () => {
    setIsLoaded(true);
    setError(null);
    startTracking();

    // Enviar mensaje inicial al juego con configuración
    if (iframeRef.current?.contentWindow) {
      const initMessage = sendMessage({
        action: 'init',
        studentId,
        config: {
          gameId: config.gameId,
          objectives: config.objectives,
          trackingEnabled: config.trackingEnabled,
        },
      });

      try {
        iframeRef.current.contentWindow.postMessage(initMessage, '*');
      } catch (err) {
        console.warn('Failed to send init message to iframe:', err);
      }
    }
  };

  const handleIframeError = () => {
    const errorMsg = `Failed to load external game: ${config.title}`;
    setError(errorMsg);
    onError?.(new Error(errorMsg));
  };

  const handleUnload = () => {
    stopTracking();
  };

  useEffect(() => {
    // Agregar listener para detectar cuando la página se está descargando
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      stopTracking();
    };
  }, [stopTracking]);

  // Configurar sandbox attributes basado en la configuración
  const getSandboxAttributes = () => {
    if (config.sandbox === false) {
      return undefined;
    }

    // Sandbox por defecto con permisos básicos
    return [
      'allow-scripts',
      'allow-same-origin',
      'allow-forms',
      'allow-popups',
      'allow-presentation',
      'allow-top-navigation-by-user-activation',
    ].join(' ');
  };

  return (
    <div
      className={`external-game-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Header con información del juego */}
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
        }}
      >
        <div>
          <strong>{config.title}</strong>
          {config.description && (
            <span style={{ marginLeft: '8px', color: '#666' }}>
              - {config.description}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
          {progress.totalTimeSpent > 0 && (
            <span>
              Tiempo: {Math.round(progress.totalTimeSpent / 1000 / 60)}m
            </span>
          )}

          {config.objectives && (
            <span>
              Objetivos: {progress.objectivesCompleted.length}/{config.objectives.length}
            </span>
          )}

          <span
            style={{
              color: isActive ? '#28a745' : '#6c757d',
              fontWeight: 'bold',
            }}
          >
            {isActive ? '🟢 Activo' : '⚪ Inactivo'}
          </span>
        </div>
      </div>

      {/* Área principal del iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        {!isLoaded && !error && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#666',
            }}
          >
            <div>Cargando {config.title}...</div>
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              Fuente: {config.source}
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#dc3545',
              padding: '20px',
            }}
          >
            <div>❌ Error</div>
            <div style={{ marginTop: '8px', fontSize: '14px' }}>{error}</div>
            <button
              onClick={() => {
                setError(null);
                if (iframeRef.current) {
                  iframeRef.current.src = config.url;
                }
              }}
              style={{
                marginTop: '12px',
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={config.url}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox={getSandboxAttributes()}
          title={config.title}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            visibility: isLoaded && !error ? 'visible' : 'hidden',
          }}
          allow="accelerometer; autoplay; camera; display-capture; encrypted-media; fullscreen; gamepad; geolocation; gyroscope; microphone; midi; payment; picture-in-picture; publickey-credentials-get; screen-wake-lock; web-share; xr-spatial-tracking"
        />
      </div>

      {/* Footer con objetivos */}
      {config.objectives && config.objectives.length > 0 && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e9ecef',
            fontSize: '12px',
            maxHeight: '100px',
            overflowY: 'auto',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Objetivos:
          </div>
          {config.objectives.map((objective) => (
            <div
              key={objective.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '2px',
              }}
            >
              <span>
                {progress.objectivesCompleted.includes(objective.id) ? '✅' : '⭕'}
              </span>
              <span
                style={{
                  textDecoration: progress.objectivesCompleted.includes(
                    objective.id
                  )
                    ? 'line-through'
                    : 'none',
                  color: progress.objectivesCompleted.includes(objective.id)
                    ? '#666'
                    : 'inherit',
                }}
              >
                {objective.title}
              </span>
              {objective.points && (
                <span style={{ color: '#007bff', fontWeight: 'bold' }}>
                  ({objective.points}pts)
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}