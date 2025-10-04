'use client';

import { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChildProfile } from '@/hooks/useChildProfile';
import { BookOpen, MapPin, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface SuggestedPath {
  chapterId: string;
  title: string;
  priority: number;
  reason: string;
}

export default function StudentMapPage() {
  const { childData } = useChildProfile();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [suggestedPath, setSuggestedPath] = useState<SuggestedPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPath, setShowPath] = useState(false);

  const studentId = childData?.id || '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    loadMap();
  }, [studentId]);

  const loadMap = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/curriculum/map/student?studentId=${studentId}`);
      const result = await response.json();

      if (result.ok) {
        setNodes(result.nodes);
        setEdges(result.edges);
      } else {
        toast.error('Error cargando el mapa');
      }
    } catch (error) {
      console.error('Error loading map:', error);
      toast.error('Error cargando el mapa');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestedPath = async () => {
    try {
      const response = await fetch(`/api/curriculum/route/suggest?studentId=${studentId}`);
      const result = await response.json();

      if (result.ok) {
        setSuggestedPath(result.plan);
        setShowPath(true);
        toast.success('🎯 Ruta personalizada cargada');
      } else {
        toast.error('Error cargando la ruta sugerida');
      }
    } catch (error) {
      console.error('Error loading suggested path:', error);
      toast.error('Error cargando la ruta sugerida');
    }
  };

  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 1:
        return '🎯'; // Refuerzo
      case 2:
        return '➡️'; // Lineal
      case 3:
        return '🔀'; // Alternativa
      default:
        return '📍';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 2:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 3:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu mapa de aprendizaje...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="w-8 h-8 text-purple-600" />
            Mapa de Aprendizaje
          </h1>
          <p className="text-gray-600 mt-1">
            Visualiza tu progreso y descubre nuevos caminos
          </p>
        </div>
        <Button onClick={loadSuggestedPath} className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          Mi Camino
        </Button>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-100"></div>
              <span>Completado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-purple-600 bg-purple-100"></div>
              <span>Desbloqueado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-gray-400 bg-gray-100"></div>
              <span>Bloqueado</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-600"></div>
                <span>Principal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-purple-500"></div>
                <span>Alternativo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-amber-500"></div>
                <span>Refuerzo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Path */}
      {showPath && suggestedPath.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Tu Ruta Personalizada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {suggestedPath.map((item, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${getPriorityColor(item.priority)}`}
                >
                  <span className="text-2xl">{getPriorityIcon(item.priority)}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs opacity-75">{item.reason}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    #{i + 1}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Map Visualization */}
      <Card>
        <CardContent className="p-0">
          <div style={{ width: '100%', height: '75vh' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              attributionPosition="bottom-left"
            >
              <MiniMap />
              <Controls />
              <Background color="#eee" gap={16} />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-green-600">
                  {nodes.filter((n) => n.data.completed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">🔓</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-purple-600">
                  {nodes.filter((n) => n.data.unlocked && !n.data.completed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Por Desbloquear</p>
                <p className="text-2xl font-bold text-gray-600">
                  {nodes.filter((n) => !n.data.unlocked).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
