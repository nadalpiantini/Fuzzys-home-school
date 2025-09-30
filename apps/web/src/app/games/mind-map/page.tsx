'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Brain,
  Plus,
  Lightbulb,
  Target,
  Zap,
} from 'lucide-react';

interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  connections: string[];
}

interface Connection {
  from: string;
  to: string;
}

const INITIAL_NODES: Node[] = [
  {
    id: '1',
    x: 400,
    y: 200,
    text: 'Aprendizaje',
    color: 'bg-blue-500',
    connections: [],
  },
];

const CONCEPT_IDEAS = [
  'Lectura', 'Escritura', 'Matemáticas', 'Ciencias', 'Historia',
  'Arte', 'Música', 'Deportes', 'Tecnología', 'Idiomas',
  'Creatividad', 'Memoria', 'Atención', 'Práctica', 'Evaluación'
];

const COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

export default function MindMapGame() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const addNode = useCallback((x: number = 300, y: number = 300) => {
    const randomConcept = CONCEPT_IDEAS[Math.floor(Math.random() * CONCEPT_IDEAS.length)];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const newNode: Node = {
      id: Date.now().toString(),
      x,
      y,
      text: randomConcept,
      color: randomColor,
      connections: [],
    };

    setNodes(prev => [...prev, newNode]);
    setScore(prev => prev + 10);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (isConnecting && selectedNode && selectedNode !== nodeId) {
      // Create connection
      const newConnection: Connection = {
        from: selectedNode,
        to: nodeId,
      };
      
      setConnections(prev => [...prev, newConnection]);
      setNodes(prev => prev.map(node => {
        if (node.id === selectedNode) {
          return { ...node, connections: [...node.connections, nodeId] };
        }
        if (node.id === nodeId) {
          return { ...node, connections: [...node.connections, selectedNode] };
        }
        return node;
      }));
      
      setScore(prev => prev + 20);
      setSelectedNode(null);
      setIsConnecting(false);
    } else {
      setSelectedNode(nodeId);
      setIsConnecting(true);
    }
  }, [isConnecting, selectedNode]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addNode(x, y);
    }
  }, [addNode]);

  const resetGame = () => {
    setNodes(INITIAL_NODES);
    setConnections([]);
    setSelectedNode(null);
    setScore(0);
    setIsConnecting(false);
  };

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  🧠 Mapa Mental
                </h1>
                <p className="text-sm text-gray-600">
                  ¡Conecta ideas y conceptos!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg">{score}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/games')}
                className="bg-white/50 hover:bg-white/80"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver a Juegos
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Game Stats */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Nodos</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{nodes.length}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Conexiones</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{connections.length}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Puntos</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{score}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Nivel</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{Math.floor(score / 100) + 1}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="container mx-auto px-4 sm:px-6 pb-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Instrucciones:</span>
          </div>
          <p className="text-blue-700 text-sm">
            {isConnecting && selectedNode 
              ? '¡Selecciona otro nodo para crear una conexión!' 
              : 'Haz clic en el área vacía para agregar nodos. Haz clic en un nodo y luego en otro para conectarlos.'}
          </p>
        </div>
      </section>

      {/* Mind Map Canvas */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <svg
            ref={svgRef}
            width="100%"
            height="500"
            className="border-2 border-dashed border-gray-300 rounded-xl cursor-pointer"
            onClick={handleCanvasClick}
          >
            {/* Render connections */}
            {connections.map((connection, index) => {
              const fromPos = getNodePosition(connection.from);
              const toPos = getNodePosition(connection.to);
              return (
                <line
                  key={index}
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })}

            {/* Render nodes */}
            {nodes.map((node) => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="30"
                  className={`${node.color} ${selectedNode === node.id ? 'ring-4 ring-yellow-400' : ''} cursor-pointer transition-all hover:scale-110`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node.id);
                  }}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className="fill-white text-sm font-semibold pointer-events-none"
                  style={{ fontSize: '12px' }}
                >
                  {node.text.length > 8 ? node.text.substring(0, 8) + '...' : node.text}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => addNode()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Nodo
          </Button>
          
          <Button
            onClick={resetGame}
            variant="outline"
            className="bg-white/50 hover:bg-white/80"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reiniciar
          </Button>
        </div>
      </section>
    </div>
  );
}