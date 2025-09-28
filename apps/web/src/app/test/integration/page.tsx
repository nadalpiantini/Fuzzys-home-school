'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube } from 'lucide-react';

export default function IntegrationTest() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Pruebas de Integración</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-6 w-6" />
            Testing Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Las pruebas de integración están siendo configuradas. Sistema de
            testing incluye:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Pruebas de componentes H5P</li>
            <li>• Testing de servicios adaptativos</li>
            <li>• Validación de WebSocket multiplayer</li>
            <li>• Testing de generación de quizzes</li>
            <li>• Pruebas end-to-end completas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
