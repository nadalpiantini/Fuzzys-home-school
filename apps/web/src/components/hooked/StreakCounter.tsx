'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useConfetti } from '@/hooks/useConfetti';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  totalDaysActive?: number;
  onStreakLost?: () => void;
  onStreakExtended?: (newStreak: number) => void;
  className?: string;
}

export default function StreakCounter({
  currentStreak = 0,
  longestStreak = 0,
  lastActivityDate,
  totalDaysActive = 0,
  onStreakLost,
  onStreakExtended,
  className = '',
}: StreakCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [streakStatus, setStreakStatus] = useState<'active' | 'danger' | 'lost'>('active');
  const { fire, fireworks, schoolPride } = useConfetti();

  // Calcular el estado del streak
  useEffect(() => {
    if (!lastActivityDate) {
      setStreakStatus('lost');
      return;
    }

    const lastActive = new Date(lastActivityDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      setStreakStatus('active');
    } else if (daysDiff === 1) {
      setStreakStatus('danger');
      toast.warning('¡Tu racha está en peligro! Completa un reto hoy para mantenerla', {
        duration: 5000,
        action: {
          label: 'Ver retos',
          onClick: () => window.location.href = '/student',
        },
      });
    } else {
      setStreakStatus('lost');
      if (currentStreak > 0) {
        onStreakLost?.();
        toast.error('¡Oh no! Has perdido tu racha', {
          description: `Tenías ${currentStreak} días consecutivos`,
        });
      }
    }
  }, [lastActivityDate, currentStreak, onStreakLost]);

  // Celebrar hitos del streak
  useEffect(() => {
    if (currentStreak > 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);

      // Celebraciones especiales
      if (currentStreak === 7) {
        fire();
        toast.success('¡Una semana completa! 🎉', {
          description: 'Has mantenido tu racha por 7 días',
        });
      } else if (currentStreak === 30) {
        fireworks();
        toast.success('¡UN MES COMPLETO! 🚀', {
          description: '30 días de aprendizaje continuo',
        });
      } else if (currentStreak === 100) {
        schoolPride();
        toast.success('¡CENTENARIO! 💯', {
          description: '100 días de racha. ¡Eres una leyenda!',
        });
      } else if (currentStreak % 50 === 0) {
        fireworks();
        toast.success(`¡${currentStreak} días de racha! 🎊`, {
          description: 'Increíble dedicación al aprendizaje',
        });
      }

      // Notificar extensión del streak
      if (currentStreak > longestStreak) {
        toast.success('¡Nuevo récord personal! 🏆', {
          description: `Tu racha más larga es ahora de ${currentStreak} días`,
        });
      }

      onStreakExtended?.(currentStreak);
    }
  }, [currentStreak]);

  const getStreakEmoji = () => {
    if (currentStreak === 0) return '💔';
    if (currentStreak < 3) return '🔥';
    if (currentStreak < 7) return '🔥🔥';
    if (currentStreak < 30) return '🔥🔥🔥';
    if (currentStreak < 100) return '🌟';
    return '💎';
  };

  const getStreakColor = () => {
    switch (streakStatus) {
      case 'active':
        return 'from-orange-400 to-red-600';
      case 'danger':
        return 'from-yellow-400 to-orange-600';
      case 'lost':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-orange-400 to-red-600';
    }
  };

  const getStreakMessage = () => {
    if (currentStreak === 0) return 'Comienza tu racha hoy';
    if (currentStreak === 1) return '¡Primer día!';
    if (currentStreak < 7) return `${currentStreak} días seguidos`;
    if (currentStreak < 30) return `¡${currentStreak} días increíbles!`;
    if (currentStreak < 100) return `¡${currentStreak} días épicos!`;
    return `¡${currentStreak} días legendarios!`;
  };

  return (
    <div className={`streak-counter ${className}`}>
      <motion.div
        className={`relative inline-block cursor-pointer`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDetails(!showDetails)}
        animate={isAnimating ? {
          rotate: [0, -5, 5, -5, 5, 0],
          scale: [1, 1.1, 1],
        } : {}}
      >
        {/* Contenedor principal del streak */}
        <div className={`
          bg-gradient-to-r ${getStreakColor()}
          rounded-2xl p-4 shadow-lg
          ${streakStatus === 'danger' ? 'animate-pulse' : ''}
        `}>
          <div className="flex items-center gap-3">
            {/* Emoji del streak */}
            <motion.div
              className="text-4xl"
              animate={isAnimating ? {
                scale: [1, 1.3, 1],
                rotate: [0, 360],
              } : {}}
              transition={{ duration: 0.5 }}
            >
              {getStreakEmoji()}
            </motion.div>

            {/* Contador */}
            <div className="text-white">
              <motion.div
                className="text-3xl font-bold"
                key={currentStreak}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {currentStreak}
              </motion.div>
              <div className="text-xs opacity-90">
                {getStreakMessage()}
              </div>
            </div>
          </div>

          {/* Indicador de peligro */}
          {streakStatus === 'danger' && (
            <div className="absolute -top-2 -right-2">
              <div className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold animate-bounce">
                ⚠️ En peligro
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Panel de detalles */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute mt-2 p-4 bg-white rounded-lg shadow-xl z-10 min-w-[250px]"
          >
            <h4 className="font-bold text-gray-900 mb-2">📊 Estadísticas</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Racha actual:</span>
                <span className="font-bold text-orange-600">{currentStreak} días</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Racha más larga:</span>
                <span className="font-bold text-purple-600">{longestStreak} días</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Días totales:</span>
                <span className="font-bold text-blue-600">{totalDaysActive} días</span>
              </div>

              {lastActivityDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Última actividad:</span>
                  <span className="font-medium">
                    {new Date(lastActivityDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Barra de progreso hacia el siguiente hito */}
            {currentStreak > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Siguiente hito</span>
                  <span className="font-bold">
                    {currentStreak < 7 ? '7 días' :
                     currentStreak < 30 ? '30 días' :
                     currentStreak < 100 ? '100 días' :
                     `${Math.ceil(currentStreak / 50) * 50} días`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-orange-400 to-red-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        currentStreak < 7 ? (currentStreak / 7) * 100 :
                        currentStreak < 30 ? ((currentStreak - 7) / 23) * 100 :
                        currentStreak < 100 ? ((currentStreak - 30) / 70) * 100 :
                        ((currentStreak % 50) / 50) * 100
                      }%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Motivación */}
            <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded text-xs text-center text-gray-700 italic">
              {currentStreak === 0 ? '¡Comienza hoy tu viaje de aprendizaje!' :
               currentStreak < 7 ? '¡Sigue así! La consistencia es clave' :
               currentStreak < 30 ? '¡Excelente trabajo! Eres imparable' :
               '¡Eres una inspiración! Sigue brillando ✨'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}