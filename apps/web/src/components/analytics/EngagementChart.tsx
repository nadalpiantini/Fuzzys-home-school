'use client';

import { EngagementMetrics } from '@/services/analytics/types';
import { Users, Clock, TrendingUp, Target } from 'lucide-react';

interface EngagementChartProps {
  data: EngagementMetrics;
}

export function EngagementChart({ data }: EngagementChartProps) {
  const metrics = [
    {
      label: 'Usuarios Activos Diarios',
      value: data.dailyActiveUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Usuarios Activos Semanales',
      value: data.weeklyActiveUsers,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Usuarios Activos Mensuales',
      value: data.monthlyActiveUsers,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Duración Promedio de Sesión',
      value: `${data.averageSessionDuration}m`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const engagementScore = Math.round(
    ((data.dailyActiveUsers / data.monthlyActiveUsers) * 100 +
      (data.averageSessionDuration / 60) * 10 +
      (100 - data.bounceRate) +
      data.retentionRate) /
      4,
  );

  return (
    <div className="space-y-6">
      {/* Engagement Score */}
      <div className="text-center">
        <div className="text-3xl font-bold text-fuzzy-purple mb-2">
          {engagementScore}%
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Puntuación de Engagement
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-fuzzy-purple to-fuzzy-green h-2 rounded-full transition-all duration-500"
            style={{ width: `${engagementScore}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
            >
              <div
                className={`w-8 h-8 ${metric.bgColor} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${metric.color}`} />
              </div>
              <div>
                <div className="text-sm font-medium">{metric.value}</div>
                <div className="text-xs text-gray-500">{metric.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">
            {data.bounceRate}%
          </div>
          <div className="text-xs text-gray-500">Tasa de Rebote</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {data.retentionRate}%
          </div>
          <div className="text-xs text-gray-500">Tasa de Retención</div>
        </div>
      </div>
    </div>
  );
}
