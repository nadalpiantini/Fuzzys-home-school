'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function H5PDemo() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Demo H5P</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-6 w-6" />
            En Construcción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Los componentes H5P interactivos están siendo integrados.
            Pronto podrás disfrutar de:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Contenido interactivo H5P</li>
            <li>• Escenarios de ramificación</li>
            <li>• Actividades drag & drop</li>
            <li>• Videos interactivos</li>
            <li>• Presentaciones de curso</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}