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
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin'>(
    'student',
  );
  const router = useRouter();

  // Detectar el rol del usuario basado en la URL actual
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/teacher')) {
        setUserRole('teacher');
      } else if (path.includes('/admin')) {
        setUserRole('admin');
      } else {
        setUserRole('student');
      }
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      setRun(true);
    }
  }, [isVisible]);

  // Pasos personalizados según el rol
  const getStepsForRole = () => {
    const commonSteps = [
      {
        target: '#bell-notification',
        content: (
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">🔔 Notificaciones</h3>
            <p>
              {userRole === 'teacher'
                ? 'Recibe avisos sobre el progreso de tus estudiantes y nuevos recursos.'
                : userRole === 'admin'
                  ? 'Mantente informado sobre la actividad de la plataforma.'
                  : 'La campana te avisa cuando tienes mensajes nuevos de Fuzzy. ¡No te pierdas ningún logro!'}
            </p>
          </div>
        ),
        placement: 'bottom' as const,
      },
      {
        target: '#profile-button',
        content: (
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">
              {userRole === 'teacher'
                ? '👨‍🏫 Tu Panel'
                : userRole === 'admin'
                  ? '⚙️ Configuración'
                  : '🏆 Tu Perfil'}
            </h3>
            <p>
              {userRole === 'teacher'
                ? 'Administra tus clases, contenido y visualiza analytics detallados.'
                : userRole === 'admin'
                  ? 'Configura usuarios, permisos y supervisa el sistema.'
                  : 'Aquí puedes ver tus badges, racha, diario personal y estadísticas. ¡Tu progreso está aquí!'}
            </p>
          </div>
        ),
        placement: 'bottom' as const,
      },
    ];

    if (userRole === 'student') {
      return [
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
        ...commonSteps,
        {
          target: '#tutor-card',
          content: (
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">🤖 Tutor IA</h3>
              <p>
                Fuzzy está aquí para ayudarte 24/7. ¡Pregúntale cualquier cosa
                sobre tus estudios!
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
                Más de 30 juegos divertidos te esperan. ¡Aprende jugando con
                Fuzzy!
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
                Recursos especiales, simulaciones PhET, programación con Blockly
                y mucho más te esperan aquí.
              </p>
            </div>
          ),
          placement: 'top' as const,
        },
      ];
    } else if (userRole === 'teacher') {
      return [
        {
          target: '#classes-card',
          content: (
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">🏫 Gestión de Clases</h3>
              <p>
                Crea y administra tus clases, asigna tareas y monitorea el
                progreso de cada estudiante.
              </p>
            </div>
          ),
          placement: 'bottom' as const,
          disableBeacon: true,
        },
        ...commonSteps,
        {
          target: '#analytics-card',
          content: (
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">📊 Analytics</h3>
              <p>
                Visualiza el desempeño de tus estudiantes con métricas
                detalladas y reportes personalizados.
              </p>
            </div>
          ),
          placement: 'top' as const,
        },
        {
          target: '#content-creator-card',
          content: (
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">
                ✏️ Creador de Contenido
              </h3>
              <p>
                Crea quizzes, actividades y material educativo personalizado
                para tus clases.
              </p>
            </div>
          ),
          placement: 'top' as const,
        },
        {
          target: '#settings-card',
          content: (
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">⚙️ Configuración</h3>
              <p>
                Personaliza tu experiencia, configura notificaciones y
                preferencias de enseñanza.
              </p>
            </div>
          ),
          placement: 'top' as const,
        },
      ];
    } else {
      // Admin steps
      return [
        {
          target: '#dashboard-card',
          content: (
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">📈 Dashboard</h3>
              <p>
                Vista general del sistema, métricas de uso y actividad en tiempo
                real.
              </p>
            </div>
          ),
          placement: 'bottom' as const,
          disableBeacon: true,
        },
        ...commonSteps,
        {
          target: '#users-management-card',
          content: (
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">👥 Gestión de Usuarios</h3>
              <p>Administra usuarios, permisos y roles en la plataforma.</p>
            </div>
          ),
          placement: 'top' as const,
        },
        {
          target: '#system-settings-card',
          content: (
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">
                🔧 Configuración del Sistema
              </h3>
              <p>
                Configuración avanzada, integraciones y mantenimiento de la
                plataforma.
              </p>
            </div>
          ),
          placement: 'top' as const,
        },
      ];
    }
  };

  const steps = getStepsForRole();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (status === STATUS.FINISHED) {
        onComplete();
      } else {
        onSkip();
      }
    }

    if (type === EVENTS.STEP_AFTER) {
      setStepIndex(index + 1);
    }
  };

  const handleSkip = () => {
    setRun(false);
    onSkip();
  };

  const handleStart = () => {
    setRun(true);
    setStepIndex(0);
  };

  // No renderizar en móvil
  if (
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ))
  ) {
    return null;
  }

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous={true}
        showSkipButton={true}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#8B5CF6',
            zIndex: 10000,
            width:
              typeof window !== 'undefined' && window.innerWidth < 768
                ? '90vw'
                : 400,
          },
          buttonNext: {
            backgroundColor: '#8B5CF6',
            borderRadius: '0.5rem',
          },
          buttonBack: {
            color: '#8B5CF6',
          },
          buttonSkip: {
            color: '#6B7280',
          },
        }}
        locale={{
          back: 'Atrás',
          close: 'Cerrar',
          last: '¡Listo!',
          next: 'Siguiente',
          skip: 'Saltar tour',
        }}
      />
    </>
  );
}

// Hook para manejar el estado del tour
export function useOnboardingTour() {
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // No mostrar onboarding en dispositivos móviles
    if (typeof window !== 'undefined') {
      const isMobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );

      if (isMobile) {
        // Marcar como completado automáticamente en móvil
        localStorage.setItem('onboarding-tour-completed', 'true');
        setShowTour(false);
        return;
      }
    }

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

  const clearTourData = () => {
    localStorage.removeItem('onboarding-tour-completed');
    localStorage.removeItem('onboarding-tour-skipped');
    setShowTour(false);
    setHasSeenTour(false);
  };

  return {
    showTour,
    hasSeenTour,
    completeTour,
    skipTour,
    restartTour,
    clearTourData,
  };
}
