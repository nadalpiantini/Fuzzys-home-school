'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Trophy,
  Lock,
  CheckCircle,
  TrendingUp,
  Target,
  Sparkles,
} from 'lucide-react';
import { useChildProfile } from '@/hooks/useChildProfile';

// Custom node component
function CurriculumNode({ data }: { data: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600';
      case 'unlocked':
        return 'bg-blue-500 border-blue-600';
      case 'locked':
        return 'bg-gray-400 border-gray-500';
      default:
        return 'bg-gray-400 border-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'unlocked':
        return <BookOpen className="h-4 w-4" />;
      case 'locked':
        return <Lock className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 ${getStatusColor(data.status)} text-white min-w-[200px]`}
    >
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon(data.status)}
        <div className="font-semibold text-sm line-clamp-2">{data.label}</div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline" className={`text-xs ${getDifficultyColor(data.difficulty)} border`}>
          {data.difficulty}
        </Badge>
        {data.score !== undefined && (
          <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/40">
            {data.score}%
          </Badge>
        )}
      </div>
    </div>
  );
}

const nodeTypes = {
  custom: CurriculumNode,
};

export default function CurriculumMapPage() {
  const { childData } = useChildProfile();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);
  const [availableCurriculums, setAvailableCurriculums] = useState<string[]>([]);

  const fetchCurriculumMap = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCurriculum !== 'all') {
        params.append('curriculumId', selectedCurriculum);
      }
      if (childData?.id) {
        params.append('studentId', childData.id);
      }

      const response = await fetch(`/api/curriculum/map?${params.toString()}`);
      const result = await response.json();

      if (result.ok) {
        setNodes(result.nodes || []);
        setEdges(result.edges || []);
        setStats(result.stats);

        // Extract unique curriculum IDs
        const curriculumIds = Array.from(
          new Set((result.nodes || []).map((n: Node) => n.data.curriculumId))
        ) as string[];
        setAvailableCurriculums(curriculumIds);
      }
    } catch (error) {
      console.error('Error fetching curriculum map:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCurriculum, childData?.id]);

  useEffect(() => {
    fetchCurriculumMap();
  }, [fetchCurriculumMap]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando mapa curricular...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Mapa de Aprendizaje
          </h1>
          <p className="text-gray-600 mt-1">Visualiza tu camino educativo</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecciona materia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las materias</SelectItem>
              {availableCurriculums.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr.replace(/-/g, ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capítulos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChapters}</div>
              <p className="text-xs text-muted-foreground">En este currículum</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedChapters}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalChapters > 0
                  ? Math.round((stats.completedChapters / stats.totalChapters) * 100)
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desbloqueados</CardTitle>
              <Sparkles className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.unlockedChapters}</div>
              <p className="text-xs text-muted-foreground">Listos para jugar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">Puntuación general</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Completado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Desbloqueado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-sm">Bloqueado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-0.5 bg-gray-400"></div>
              <span className="text-sm">Camino Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-0.5 bg-yellow-500 border-dashed border-t-2 border-yellow-500"></div>
              <span className="text-sm">Camino Alternativo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-0.5 bg-red-500 border-dashed border-t-2 border-red-500"></div>
              <span className="text-sm">Refuerzo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ReactFlow Map */}
      <Card>
        <CardContent className="p-0">
          <div style={{ width: '100%', height: '70vh' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Strict}
              fitView
              minZoom={0.5}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            >
              <Background color="#aaa" gap={16} />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  switch (node.data.status) {
                    case 'completed':
                      return '#22c55e';
                    case 'unlocked':
                      return '#3b82f6';
                    case 'locked':
                      return '#9ca3af';
                    default:
                      return '#9ca3af';
                  }
                }}
                maskColor="rgb(240, 240, 240, 0.8)"
              />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Path Types Info */}
      {stats?.pathTypes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tipos de Rutas Disponibles
            </CardTitle>
            <CardDescription>Diferentes caminos para aprender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <h4 className="font-semibold">Camino Principal</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {stats.pathTypes.linear} conexiones lineales para progresión normal
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="font-semibold">Caminos Alternativos</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {stats.pathTypes.alternative} rutas opcionales para alto rendimiento
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="font-semibold">Refuerzo</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {stats.pathTypes.reinforcement} rutas de refuerzo para áreas débiles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
