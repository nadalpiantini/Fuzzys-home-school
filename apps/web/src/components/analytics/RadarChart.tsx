'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Brain, Target, Zap } from 'lucide-react';

interface RadarDataPoint {
  subject: string;
  mastery: number;
  engagement: number;
  timeSpent: number;
  gamesPlayed: number;
  difficulty: number;
  confidence: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  title?: string;
  description?: string;
  showMetrics?: boolean;
}

export function RadarChart({
  data,
  title = 'Análisis Multidimensional',
  description = 'Visualización de múltiples métricas de aprendizaje',
  showMetrics = true,
}: RadarChartProps) {
  const maxValues = {
    mastery: 100,
    engagement: 100,
    timeSpent: 300, // 5 hours max
    gamesPlayed: 20,
    difficulty: 5,
    confidence: 100,
  };

  const getRadarPath = (dataPoint: RadarDataPoint) => {
    const centerX = 150;
    const centerY = 150;
    const radius = 120;

    const points = [
      { angle: 0, value: (dataPoint.mastery / maxValues.mastery) * radius },
      {
        angle: 60,
        value: (dataPoint.engagement / maxValues.engagement) * radius,
      },
      {
        angle: 120,
        value: (dataPoint.timeSpent / maxValues.timeSpent) * radius,
      },
      {
        angle: 180,
        value: (dataPoint.gamesPlayed / maxValues.gamesPlayed) * radius,
      },
      {
        angle: 240,
        value: (dataPoint.difficulty / maxValues.difficulty) * radius,
      },
      {
        angle: 300,
        value: (dataPoint.confidence / maxValues.confidence) * radius,
      },
    ];

    const pathData = points
      .map((point, index) => {
        const x =
          centerX +
          point.value * Math.cos(((point.angle - 90) * Math.PI) / 180);
        const y =
          centerY +
          point.value * Math.sin(((point.angle - 90) * Math.PI) / 180);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    return `${pathData} Z`;
  };

  const getLabelPosition = (angle: number, radius: number) => {
    const centerX = 150;
    const centerY = 150;
    const labelRadius = radius + 20;
    return {
      x: centerX + labelRadius * Math.cos(((angle - 90) * Math.PI) / 180),
      y: centerY + labelRadius * Math.sin(((angle - 90) * Math.PI) / 180),
    };
  };

  const labels = [
    { text: 'Maestría', angle: 0, color: '#3B82F6' },
    { text: 'Engagement', angle: 60, color: '#10B981' },
    { text: 'Tiempo', angle: 120, color: '#F59E0B' },
    { text: 'Juegos', angle: 180, color: '#EF4444' },
    { text: 'Dificultad', angle: 240, color: '#8B5CF6' },
    { text: 'Confianza', angle: 300, color: '#06B6D4' },
  ];

  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const radius = (120 / 5) * (i + 1);
    const points = labels
      .map((label) => {
        const x = 150 + radius * Math.cos(((label.angle - 90) * Math.PI) / 180);
        const y = 150 + radius * Math.sin(((label.angle - 90) * Math.PI) / 180);
        return `${x},${y}`;
      })
      .join(' ');
    return { points, opacity: 0.2 - i * 0.03 };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Radar Chart */}
          <div className="flex-1">
            <div className="relative">
              <svg width="300" height="300" className="mx-auto">
                {/* Grid Lines */}
                {gridLines.map((grid, index) => (
                  <polygon
                    key={index}
                    points={grid.points}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    opacity={grid.opacity}
                  />
                ))}

                {/* Axis Lines */}
                {labels.map((label, index) => {
                  const x2 =
                    150 + 120 * Math.cos(((label.angle - 90) * Math.PI) / 180);
                  const y2 =
                    150 + 120 * Math.sin(((label.angle - 90) * Math.PI) / 180);
                  return (
                    <line
                      key={index}
                      x1="150"
                      y1="150"
                      x2={x2}
                      y2={y2}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Data Polygons */}
                {data.map((dataPoint, index) => (
                  <g key={index}>
                    <path
                      d={getRadarPath(dataPoint)}
                      fill={`url(#gradient-${index})`}
                      fillOpacity="0.3"
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                      strokeWidth="2"
                    />
                    <defs>
                      <linearGradient
                        id={`gradient-${index}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor={`hsl(${index * 60}, 70%, 50%)`}
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor={`hsl(${index * 60}, 70%, 50%)`}
                          stopOpacity="0.1"
                        />
                      </linearGradient>
                    </defs>
                  </g>
                ))}

                {/* Labels */}
                {labels.map((label, index) => {
                  const pos = getLabelPosition(label.angle, 120);
                  return (
                    <text
                      key={index}
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-medium"
                      fill={label.color}
                    >
                      {label.text}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Metrics Panel */}
          {showMetrics && (
            <div className="lg:w-80 space-y-4">
              <h4 className="font-semibold text-lg">Métricas Detalladas</h4>
              {data.map((dataPoint, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {dataPoint.subject}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {dataPoint.mastery}% maestría
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span>Engagement: {dataPoint.engagement}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-blue-500" />
                      <span>Confianza: {dataPoint.confidence}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span>Juegos: {dataPoint.gamesPlayed}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="w-3 h-3 text-purple-500" />
                      <span>Dificultad: {dataPoint.difficulty}/5</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    Tiempo: {Math.round(dataPoint.timeSpent / 60)} min
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
