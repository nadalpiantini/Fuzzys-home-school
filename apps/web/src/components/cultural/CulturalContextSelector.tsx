'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCulturalContext } from '@/hooks/useCulturalContext';
import {
  Globe,
  MapPin,
  Users,
  Settings,
  Check,
  Loader2,
  RefreshCw,
  Search, // Replaced AutoDetect with Search
} from 'lucide-react';

interface CulturalContextSelectorProps {
  userId?: string;
  onContextChange?: (contextId: string) => void;
  className?: string;
}

export const CulturalContextSelector: React.FC<
  CulturalContextSelectorProps
> = ({ userId, onContextChange, className = '' }) => {
  const {
    currentContext,
    userPreferences,
    availableContexts,
    isLoading,
    error,
    changeContext,
    enableAutoDetection,
    clearError,
  } = useCulturalContext(userId);

  const [isChanging, setIsChanging] = useState(false);

  const handleContextChange = async (contextId: string) => {
    setIsChanging(true);
    try {
      const success = await changeContext(contextId, true);
      if (success && onContextChange) {
        onContextChange(contextId);
      }
    } catch (error) {
      console.error('Error changing context:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleAutoDetection = async () => {
    setIsChanging(true);
    try {
      const success = await enableAutoDetection();
      if (success && onContextChange && currentContext) {
        onContextChange(currentContext.id);
      }
    } catch (error) {
      console.error('Error enabling auto-detection:', error);
    } finally {
      setIsChanging(false);
    }
  };

  if (isLoading && !currentContext) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fuzzy-purple" />
          <p className="text-gray-600">Cargando contexto cultural...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
            <Button onClick={clearError} variant="outline" size="sm">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-fuzzy-purple" />
            Contexto Cultural
          </h2>
          <p className="text-gray-600">
            Personaliza los juegos según tu cultura y ubicación
          </p>
        </div>
      </div>

      {/* Contexto actual */}
      {currentContext && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Contexto Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold">
                    {currentContext.country_name}
                  </span>
                  <Badge variant="secondary">
                    {currentContext.country_code}
                  </Badge>
                  {currentContext.is_default && (
                    <Badge variant="default">Por defecto</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Idioma: {currentContext.language_code.toUpperCase()}
                  {currentContext.region &&
                    ` • Región: ${currentContext.region}`}
                </p>
                {userPreferences?.auto_detect && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Auto-detección habilitada
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Elementos culturales
                </div>
                <div className="text-lg font-bold text-fuzzy-purple">
                  {Object.keys(currentContext.cultural_elements).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opciones de contexto */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Auto-detección
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Detecta automáticamente tu contexto cultural basado en tu
              ubicación
            </p>
            <Button
              onClick={handleAutoDetection}
              disabled={isChanging || userPreferences?.auto_detect}
              variant={userPreferences?.auto_detect ? 'default' : 'outline'}
              className="w-full"
            >
              {isChanging ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {userPreferences?.auto_detect
                ? 'Auto-detección Activa'
                : 'Activar Auto-detección'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Selección Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Elige manualmente tu contexto cultural preferido
            </p>
            <div className="space-y-2">
              {availableContexts.slice(0, 3).map((context) => (
                <Button
                  key={context.id}
                  onClick={() => handleContextChange(context.id)}
                  disabled={isChanging}
                  variant={
                    currentContext?.id === context.id ? 'default' : 'outline'
                  }
                  className="w-full justify-start"
                >
                  {currentContext?.id === context.id && (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  <div className="text-left">
                    <div className="font-medium">{context.country_name}</div>
                    <div className="text-xs text-gray-500">
                      {context.language_code.toUpperCase()}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista completa de contextos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Todos los Contextos Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableContexts.map((context) => (
              <Button
                key={context.id}
                onClick={() => handleContextChange(context.id)}
                disabled={isChanging}
                variant={
                  currentContext?.id === context.id ? 'default' : 'outline'
                }
                className="h-auto p-3 flex flex-col items-start"
              >
                <div className="flex items-center gap-2 w-full">
                  {currentContext?.id === context.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                  <div className="text-left flex-1">
                    <div className="font-medium">{context.country_name}</div>
                    <div className="text-xs opacity-75">
                      {context.language_code.toUpperCase()}
                      {context.is_default && ' • Por defecto'}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {context.country_code}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona el contexto cultural?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-fuzzy-purple text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <strong>Auto-detección:</strong> El sistema detecta
                automáticamente tu ubicación y adapta los juegos a tu cultura
                local.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-fuzzy-purple text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <strong>Selección manual:</strong> Puedes elegir cualquier
                contexto cultural disponible, incluso si no es tu ubicación
                actual.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-fuzzy-purple text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <strong>Contenido adaptado:</strong> Los juegos incluyen
                elementos culturales específicos como comida, lugares y
                tradiciones de tu contexto elegido.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
