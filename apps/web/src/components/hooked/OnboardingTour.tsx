'use client';

import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { useRouter } from 'next/navigation';

interface OnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({
  isVisible,
  onComplete,
  onSkip,
}: OnboardingTourProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (isVisible) {
      setRun(true);
    }
  }, [isVisible]);

  const steps = [
    {
      target: '#daily-quest-card',
      content: (
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">🎯 ¡Tu Reto Diario!</h3>
          <p>
            Cada día Fuzzy te prepara un reto especial. ¡Completa retos para
            ganar puntos y mantener tu racha!
          </p>
        </div>
      ),
      placement: 'bottom' as const,
      disableBeacon: true,
    },
    {
      target: '#bell-notification',
      content: (
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">🔔 Notificaciones</h3>
          <p>
            La campana te avisa cuando tienes mensajes nuevos de Fuzzy. ¡No te
            pierdas ningún logro!
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: '#profile-button',
      content: (
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">🏆 Tu Perfil</h3>
          <p>
            Aquí puedes ver tus badges, racha, diario personal y estadísticas.
            ¡Tu progreso está aquí!
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: '#tutor-card',
      content: (
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">🤖 Tutor IA</h3>
          <p>
            Fuzzy está aquí para ayudarte 24/7. ¡Pregúntale cualquier cosa sobre
            tus estudios!
          </p>
        </div>
      ),
      placement: 'top' as const,
    },
    {
      target: '#games-card',
      content: (
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">🎮 Juegos Educativos</h3>
          <p>
            Más de 30 juegos divertidos te esperan. ¡Aprende jugando con Fuzzy!
          </p>
        </div>
      ),
      placement: 'top' as const,
    },
    {
      target: '#library-card',
      content: (
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">📚 Biblioteca</h3>
          <p>
            Recursos especiales, simulaciones PhET, programación con Blockly y
            mucho más.
          </p>
        </div>
      ),
      placement: 'top' as const,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRun(false);
      setStepIndex(0);
      onComplete();
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (type === EVENTS.TARGET_NOT_FOUND ? -1 : 1));
    }
  };

  const handleSkip = () => {
    setRun(false);
    setStepIndex(0);
    onSkip();
  };

  const handleStart = () => {
    setRun(true);
    setStepIndex(0);
  };

  if (!isVisible) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          primaryColor: '#8B5CF6',
          textColor: '#1F2937',
          backgroundColor: '#FFFFFF',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          arrowColor: '#FFFFFF',
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'center',
        },
        buttonNext: {
          backgroundColor: '#8B5CF6',
          borderRadius: 8,
          padding: '8px 16px',
          color: 'white',
          border: 'none',
        },
        buttonBack: {
          marginRight: 8,
          color: '#6B7280',
        },
        buttonSkip: {
          color: '#6B7280',
        },
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar',
      }}
    />
  );
}

// Hook para manejar el estado del tour
export function useOnboardingTour() {
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('onboarding-tour-completed');
    if (!tourCompleted) {
      setShowTour(true);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem('onboarding-tour-completed', 'true');
    setShowTour(false);
    setHasSeenTour(true);
  };

  const skipTour = () => {
    localStorage.setItem('onboarding-tour-skipped', 'true');
    setShowTour(false);
    setHasSeenTour(true);
  };

  const restartTour = () => {
    localStorage.removeItem('onboarding-tour-completed');
    localStorage.removeItem('onboarding-tour-skipped');
    setShowTour(true);
  };

  return {
    showTour,
    hasSeenTour,
    completeTour,
    skipTour,
    restartTour,
  };
}
