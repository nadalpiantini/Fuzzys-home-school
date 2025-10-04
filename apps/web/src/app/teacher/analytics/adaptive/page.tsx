'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

interface TrendPoint {
  day: string;
  avgScore: number;
}

interface HeatmapCell {
  curriculum_id: string;
  day: string;
  completed: number;
}

export default function AdaptiveAnalytics() {
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/adaptive-trend');
        const result = await response.json();

        if (result.ok) {
          setTrendData(result.data.trend || []);
          setHeatmapData(result.data.weekly || []);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Get unique curricula for heatmap rows
  const curricula = Array.from(
    new Set(heatmapData.map((cell) => cell.curriculum_id))
  ).sort();

  // Get unique days for heatmap columns
  const days = Array.from(
    new Set(heatmapData.map((cell) => cell.day))
  ).sort();

  // Create heatmap matrix
  const getHeatValue = (curriculumId: string, day: string) => {
    const cell = heatmapData.find(
      (c) => c.curriculum_id === curriculumId && c.day === day
    );
    return cell?.completed || 0;
  };

  // Calculate color intensity (0-1 scale)
  const getHeatColor = (value: number) => {
    const maxValue = Math.max(...heatmapData.map((c) => c.completed));
    const intensity = maxValue > 0 ? Math.min(1, value / maxValue) : 0;
    return `rgba(79, 70, 229, ${intensity})`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-indigo-600" />
          Analíticas Adaptativas
        </h1>
        <p className="text-gray-600 mt-2">
          Seguimiento del rendimiento y patrones de aprendizaje
        </p>
      </div>

      {/* Trend Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Tendencia de Puntuación Promedio (últimos 30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px' 
                    }}
                    formatter={(value: number) => [`${value}%`, 'Puntuación']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('es-ES', { 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgScore" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No hay datos de tendencia disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Mapa de Actividad por Currículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {curricula.length > 0 && days.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 p-2 border-b">
                        Currículo
                      </th>
                      {days.slice(-14).map((day) => (
                        <th 
                          key={day} 
                          className="text-center text-xs font-medium text-gray-500 p-2 border-b"
                        >
                          {new Date(day).getDate()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {curricula.map((curriculum) => (
                      <tr key={curriculum}>
                        <td className="text-xs font-medium text-gray-700 p-2 border-b">
                          {curriculum.replace('_', ' ')}
                        </td>
                        {days.slice(-14).map((day) => {
                          const value = getHeatValue(curriculum, day);
                          return (
                            <td 
                              key={`${curriculum}-${day}`} 
                              className="p-1 border-b"
                            >
                              <div
                                className="w-8 h-8 rounded mx-auto transition-all hover:scale-110"
                                style={{ 
                                  backgroundColor: getHeatColor(value),
                                  border: value > 0 ? '1px solid #4f46e5' : '1px solid #e5e7eb'
                                }}
                                title={`${curriculum} - ${day}: ${value} capítulos completados`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(79, 70, 229, 0.2)' }}></div>
                  <span>Baja actividad</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(79, 70, 229, 0.6)' }}></div>
                  <span>Media actividad</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(79, 70, 229, 1)' }}></div>
                  <span>Alta actividad</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No hay datos de actividad disponibles
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
