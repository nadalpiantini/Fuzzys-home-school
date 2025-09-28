'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGamePool } from '@/hooks/useGamePool';
import {
  Gamepad2,
  BookOpen,
  Calculator,
  Globe,
  Atom,
  MapPin,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface InstantGameSelectorProps {
  onGameSelect: (game: any) => void;
  className?: string;
}

const subjectIcons = {
  math: Calculator,
  language: BookOpen,
  science: Atom,
  social: Globe,
  geo: MapPin,
  default: Gamepad2,
};

const subjectColors = {
  math: 'bg-blue-100 text-blue-800',
  language: 'bg-green-100 text-green-800',
  science: 'bg-purple-100 text-purple-800',
  social: 'bg-orange-100 text-orange-800',
  geo: 'bg-pink-100 text-pink-800',
  default: 'bg-gray-100 text-gray-800',
};

export const InstantGameSelector: React.FC<InstantGameSelectorProps> = ({
  onGameSelect,
  className = '',
}) => {
  const { games, isLoading, error, refreshGames, readyCount } = useGamePool();

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fuzzy-purple" />
          <p className="text-gray-600">Cargando juegos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refreshGames} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">No hay juegos disponibles</p>
          <Button onClick={refreshGames} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recargar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            ¡Juegos Listos para Ti! 🎮
          </h2>
          <p className="text-gray-600">
            {readyCount} juegos disponibles • Selecciona uno para empezar
          </p>
        </div>
        <Button onClick={refreshGames} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Nuevos Juegos
        </Button>
      </div>

      {/* Grid de juegos */}
      <div className="grid md:grid-cols-2 gap-6">
        {games.map((game) => {
          const IconComponent =
            subjectIcons[game.subject as keyof typeof subjectIcons] ||
            subjectIcons.default;
          const colorClass =
            subjectColors[game.subject as keyof typeof subjectColors] ||
            subjectColors.default;

          return (
            <Card
              key={game.id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-fuzzy-purple"
              onClick={() => onGameSelect(game)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{game.title}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {game.subject.charAt(0).toUpperCase() +
                          game.subject.slice(1)}{' '}
                        • Grado {game.grade}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {game.source === 'seed' ? '🌱 Semilla' : '🤖 IA'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    {game.content?.type && (
                      <span className="capitalize">
                        {game.content.type.replace('_', ' ')}
                      </span>
                    )}
                    {game.content?.theme && (
                      <span className="text-gray-500">
                        {' '}
                        • {game.content.theme}
                      </span>
                    )}
                  </p>

                  {game.content?.difficulty && (
                    <Badge
                      variant={
                        game.content.difficulty === 'easy'
                          ? 'default'
                          : game.content.difficulty === 'medium'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="text-xs"
                    >
                      {game.content.difficulty === 'easy'
                        ? 'Fácil'
                        : game.content.difficulty === 'medium'
                          ? 'Medio'
                          : 'Difícil'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer con información del pool */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <p>
          💡 Los juegos se generan automáticamente en segundo plano para que
          siempre tengas opciones frescas
        </p>
      </div>
    </div>
  );
};
