'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export default function ExternalGames() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Juegos Externos</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-6 w-6" />
            Herramientas Educativas Externas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Las integraciones con herramientas externas están siendo
            configuradas. Pronto podrás acceder a:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Simulaciones PhET Interactive</li>
            <li>• Editor de código Blockly</li>
            <li>• Music Blocks para crear música</li>
            <li>• Entornos sandbox seguros</li>
            <li>• Integración con herramientas VR/AR</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
