'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2 } from 'lucide-react';

export default function GamesDemo() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Demo de Juegos</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6" />
            Juegos Educativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Los juegos educativos están siendo desarrollados.
            Pronto tendrás acceso a:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Juegos de memoria y asociación</li>
            <li>• Crucigramas interactivos</li>
            <li>• Líneas de tiempo educativas</li>
            <li>• Actividades de verdadero/falso</li>
            <li>• Preguntas de selección múltiple</li>
            <li>• Hotspots interactivos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}