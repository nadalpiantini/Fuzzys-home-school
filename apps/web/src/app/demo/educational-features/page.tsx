'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function EducationalFeaturesDemo() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Educational Features Demo</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-6 w-6" />
            En Construcción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Las características educativas avanzadas están siendo implementadas.
            Pronto tendrás acceso a:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Sistema adaptativo de aprendizaje con IA</li>
            <li>• Generador inteligente de quizzes</li>
            <li>• Biblioteca completa de contenido H5P</li>
            <li>• Escenarios interactivos de ramificación</li>
            <li>• Salas de quiz en vivo</li>
            <li>• Chat tutor con DeepSeek AI</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
