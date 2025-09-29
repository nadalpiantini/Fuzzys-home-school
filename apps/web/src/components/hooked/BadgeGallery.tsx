'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useConfetti } from '@/hooks/useConfetti';

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earned_at?: string;
}

interface BadgeGalleryProps {
  badges: Badge[];
  totalBadges?: number;
  onBadgeClick?: (badge: Badge) => void;
  className?: string;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600',
};

const rarityGlow = {
  common: '',
  uncommon: 'shadow-green-400/50',
  rare: 'shadow-blue-400/50',
  epic: 'shadow-purple-400/50',
  legendary: 'shadow-yellow-400/50',
};

export default function BadgeGallery({
  badges,
  totalBadges,
  onBadgeClick,
  className = '',
}: BadgeGalleryProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const { stars, fire } = useConfetti();

  // Obtener categorías únicas
  const categories = ['all', ...new Set(badges.map((b) => b.category))];

  // Filtrar badges
  const filteredBadges = filter === 'all'
    ? badges
    : badges.filter((b) => b.category === filter);

  // Crear placeholders para badges no obtenidos
  const badgeSlots = totalBadges ? Array.from({ length: totalBadges }) : [];

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    onBadgeClick?.(badge);

    // Celebrar si es un badge legendario o épico
    if (badge.rarity === 'legendary') {
      stars();
      toast.success(`¡Increíble! Has desbloqueado ${badge.name}`, {
        description: badge.description,
        duration: 5000,
      });
    } else if (badge.rarity === 'epic') {
      fire();
      toast.success(`¡Épico! Has conseguido ${badge.name}`, {
        description: badge.description,
        duration: 4000,
      });
    }
  };

  return (
    <div className={`badge-gallery ${className}`}>
      {/* Filtros de categoría */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              filter === category
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category === 'all' ? 'Todos' : category}
          </button>
        ))}
      </div>

      {/* Estadísticas */}
      {totalBadges && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Progreso de Badges
            </span>
            <span className="text-lg font-bold text-purple-600">
              {badges.length} / {totalBadges}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(badges.length / totalBadges) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Grid de badges */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {totalBadges ? (
          // Con placeholders
          badgeSlots.map((_, index) => {
            const badge = filteredBadges[index];

            if (badge) {
              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative cursor-pointer"
                  onClick={() => handleBadgeClick(badge)}
                >
                  <div
                    className={`aspect-square rounded-xl bg-gradient-to-br ${
                      rarityColors[badge.rarity]
                    } p-1 shadow-lg ${rarityGlow[badge.rarity]}`}
                  >
                    <div className="w-full h-full bg-white rounded-lg flex items-center justify-center p-2">
                      <span className="text-3xl" role="img" aria-label={badge.name}>
                        {badge.icon}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    +{badge.points}
                  </div>
                </motion.div>
              );
            } else {
              return (
                <div
                  key={`placeholder-${index}`}
                  className="aspect-square rounded-xl bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center"
                >
                  <span className="text-2xl text-gray-400">?</span>
                </div>
              );
            }
          })
        ) : (
          // Sin placeholders
          filteredBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative cursor-pointer"
              onClick={() => handleBadgeClick(badge)}
            >
              <div
                className={`aspect-square rounded-xl bg-gradient-to-br ${
                  rarityColors[badge.rarity]
                } p-1 shadow-lg ${rarityGlow[badge.rarity]}`}
              >
                <div className="w-full h-full bg-white rounded-lg flex items-center justify-center p-2">
                  <span className="text-3xl" role="img" aria-label={badge.name}>
                    {badge.icon}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                +{badge.points}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal de detalles del badge */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-20 h-20 rounded-xl bg-gradient-to-br ${
                    rarityColors[selectedBadge.rarity]
                  } p-1 shadow-lg ${rarityGlow[selectedBadge.rarity]}`}
                >
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                    <span className="text-4xl" role="img" aria-label={selectedBadge.name}>
                      {selectedBadge.icon}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedBadge.name}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedBadge.rarity} • {selectedBadge.category}
                  </p>
                  <p className="text-sm font-semibold text-purple-600">
                    +{selectedBadge.points} puntos
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{selectedBadge.description}</p>

              {selectedBadge.earned_at && (
                <p className="text-sm text-gray-500">
                  Obtenido el{' '}
                  {new Date(selectedBadge.earned_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="mt-4 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}