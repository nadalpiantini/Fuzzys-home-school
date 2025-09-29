import React from 'react';
import { BaseGame, GameType } from '@/lib/game-factory/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Users,
  Trophy,
} from 'lucide-react';

interface GameRendererProps {
  game: BaseGame;
  onComplete: () => void;
  onScoreUpdate: (score: number) => void;
}

export default function GameRenderer({
  game,
  onComplete,
  onScoreUpdate,
}: GameRendererProps) {
  const renderGameContent = () => {
    switch (game.type) {
      case 'multiple-choice':
        return renderMultipleChoice();
      case 'true-false':
        return renderTrueFalse();
      case 'fill-blank':
        return renderFillBlank();
      case 'short-answer':
        return renderShortAnswer();
      case 'drag-drop':
        return renderDragDrop();
      case 'hotspot':
        return renderHotspot();
      case 'sequence':
        return renderSequence();
      case 'matching':
        return renderMatching();
      case 'memory-cards':
        return renderMemoryCards();
      case 'blockly-puzzle':
        return renderBlocklyPuzzle();
      case 'blockly-maze':
        return renderBlocklyMaze();
      case 'scratch-project':
        return renderScratchProject();
      case 'turtle-blocks':
        return renderTurtleBlocks();
      case 'music-blocks':
        return renderMusicBlocks();
      case 'story-creator':
        return renderStoryCreator();
      case 'physics-sim':
        return renderPhysicsSim();
      case 'chemistry-lab':
        return renderChemistryLab();
      case 'ar-explorer':
        return renderARExplorer();
      case 'adaptive-quiz':
        return renderAdaptiveQuiz();
      case 'competition':
        return renderCompetition();
      case 'vocabulary-builder':
        return renderVocabularyBuilder();
      case 'coding-challenge':
        return renderCodingChallenge();
      case 'discussion-forum':
        return renderDiscussionForum();
      default:
        return renderDefault();
    }
  };

  const renderMultipleChoice = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        {game.content.questions?.[0]?.question ||
          'Selecciona la respuesta correcta'}
      </h3>
      <div className="grid gap-3">
        {game.content.questions?.[0]?.options?.map(
          (option: string, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="w-full p-4 text-left justify-start hover:bg-purple-50"
              onClick={() => handleAnswer(index)}
            >
              <span className="font-medium mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </Button>
          ),
        )}
      </div>
    </div>
  );

  const renderTrueFalse = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        {game.content.questions?.[0]?.question || 'Verdadero o Falso'}
      </h3>
      <div className="flex gap-4 justify-center">
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4"
          onClick={() => handleAnswer(true)}
        >
          ✅ Verdadero
        </Button>
        <Button
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4"
          onClick={() => handleAnswer(false)}
        >
          ❌ Falso
        </Button>
      </div>
    </div>
  );

  const renderFillBlank = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        {game.content.questions?.[0]?.question ||
          'Completa el espacio en blanco'}
      </h3>
      <div className="space-y-4">
        <input
          type="text"
          className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg"
          placeholder="Escribe tu respuesta aquí..."
          onChange={(e) => setUserAnswer(e.target.value)}
        />
        <Button
          onClick={() => handleAnswer(userAnswer)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Play className="w-4 h-4 mr-2" />
          Verificar
        </Button>
      </div>
    </div>
  );

  const renderShortAnswer = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        {game.content.questions?.[0]?.question ||
          'Responde con tus propias palabras'}
      </h3>
      <div className="space-y-4">
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg min-h-[120px]"
          placeholder="Escribe tu respuesta aquí..."
          onChange={(e) => setUserAnswer(e.target.value)}
        />
        <Button
          onClick={() => handleAnswer(userAnswer)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Play className="w-4 h-4 mr-2" />
          Enviar Respuesta
        </Button>
      </div>
    </div>
  );

  const renderDragDrop = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Clasifica los elementos arrastrándolos a sus categorías!
      </h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {game.content.categories?.map((category: string) => (
          <div
            key={category}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
          >
            <h4 className="font-semibold text-gray-700 capitalize text-center">
              {category}
            </h4>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 mb-6">
        {game.content.items?.map((item: any) => (
          <Button
            key={item.id}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50"
            onClick={() => handleItemClick(item)}
          >
            <div className="text-2xl">
              {item.shape === 'circle' && '⭕'}
              {item.shape === 'square' && '⬜'}
              {item.shape === 'triangle' && '🔺'}
            </div>
            <div className="text-sm mt-1">{item.name}</div>
          </Button>
        ))}
      </div>
      <Button
        onClick={onComplete}
        className="bg-orange-600 hover:bg-orange-700"
      >
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderHotspot = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Haz clic en las áreas correctas de la imagen!
      </h3>
      <div className="relative bg-gray-100 rounded-lg p-8 min-h-[400px]">
        <div className="text-center text-gray-500 mb-4">
          Imagen interactiva - Haz clic en las zonas marcadas
        </div>
        {game.content.items?.map((item: any) => (
          <Button
            key={item.id}
            className="absolute bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12"
            style={{
              left: `${item.position?.x || 50}%`,
              top: `${item.position?.y || 50}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => handleHotspotClick(item)}
          >
            {item.name.charAt(0)}
          </Button>
        ))}
      </div>
      <Button onClick={onComplete} className="bg-blue-600 hover:bg-blue-700">
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderSequence = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Ordena los elementos en la secuencia correcta!
      </h3>
      <div className="space-y-4">
        {game.content.items?.map((item: any, index: number) => (
          <div
            key={item.id}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => handleSequenceClick(item, index)}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button
        onClick={onComplete}
        className="bg-purple-600 hover:bg-purple-700"
      >
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderMatching = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Conecta los elementos relacionados!
      </h3>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Columna A</h4>
          {game.content.items?.map((item: any) => (
            <Button
              key={item.id}
              className="w-full p-4 bg-blue-100 hover:bg-blue-200 text-blue-800"
              onClick={() => handleMatchingClick(item, 'left')}
            >
              {item.name}
            </Button>
          ))}
        </div>
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Columna B</h4>
          {game.content.items?.map((item: any) => (
            <Button
              key={`match-${item.id}`}
              className="w-full p-4 bg-green-100 hover:bg-green-200 text-green-800"
              onClick={() => handleMatchingClick(item, 'right')}
            >
              {item.match}
            </Button>
          ))}
        </div>
      </div>
      <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderMemoryCards = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Encuentra las parejas de tarjetas!
      </h3>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {game.content.cards?.map((card: any, index: number) => (
          <Button
            key={card.id}
            className="h-20 text-4xl bg-white hover:bg-gray-50 border-2 border-gray-200"
            onClick={() => handleCardClick(card)}
          >
            {card.front}
          </Button>
        ))}
      </div>
      <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderBlocklyPuzzle = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Resuelve el puzzle usando bloques de programación!
      </h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {game.content.blocks?.map((block: any) => (
          <Button
            key={block.id}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50"
            style={{ borderColor: block.color }}
            onClick={() => handleBlockClick(block)}
          >
            <div className="text-lg font-bold" style={{ color: block.color }}>
              {block.type === 'move' && '→'}
              {block.type === 'turn' && '↻'}
              {block.type === 'repeat' && '🔄'}
            </div>
            <div className="text-sm mt-1 capitalize">{block.type}</div>
          </Button>
        ))}
      </div>
      <Button
        onClick={onComplete}
        className="bg-indigo-600 hover:bg-indigo-700"
      >
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderBlocklyMaze = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Navega por el laberinto usando bloques!
      </h3>
      <div className="bg-gray-100 rounded-lg p-8 min-h-[300px] mb-6">
        <div className="text-center text-gray-500">
          Laberinto interactivo - Usa los bloques para navegar
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {game.content.blocks?.map((block: any) => (
          <Button
            key={block.id}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50"
            style={{ borderColor: block.color }}
            onClick={() => handleBlockClick(block)}
          >
            <div className="text-lg font-bold" style={{ color: block.color }}>
              {block.type === 'move' && '→'}
              {block.type === 'turn' && '↻'}
              {block.type === 'if' && '❓'}
            </div>
            <div className="text-sm mt-1 capitalize">{block.type}</div>
          </Button>
        ))}
      </div>
      <Button onClick={onComplete} className="bg-blue-600 hover:bg-blue-700">
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderScratchProject = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Crea tu proyecto con Scratch!
      </h3>
      <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] mb-6">
        <div className="text-center text-gray-500">
          Editor de Scratch - Arrastra los bloques para crear tu proyecto
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {game.content.blocks?.map((block: any) => (
          <Button
            key={block.id}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50"
            style={{ borderColor: block.color }}
            onClick={() => handleBlockClick(block)}
          >
            <div className="text-lg font-bold" style={{ color: block.color }}>
              {block.type === 'motion' && '🏃'}
              {block.type === 'looks' && '👁️'}
              {block.type === 'sound' && '🔊'}
            </div>
            <div className="text-sm mt-1 capitalize">{block.type}</div>
          </Button>
        ))}
      </div>
      <Button onClick={onComplete} className="bg-pink-600 hover:bg-pink-700">
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderTurtleBlocks = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Dibuja con la tortuga usando bloques!
      </h3>
      <div className="bg-gray-100 rounded-lg p-8 min-h-[300px] mb-6">
        <div className="text-center text-gray-500">
          Canvas de la tortuga - Usa los bloques para dibujar
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {game.content.blocks?.map((block: any) => (
          <Button
            key={block.id}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50"
            style={{ borderColor: block.color }}
            onClick={() => handleBlockClick(block)}
          >
            <div className="text-lg font-bold" style={{ color: block.color }}>
              {block.type === 'forward' && '↑'}
              {block.type === 'turn' && '↻'}
              {block.type === 'pen' && '✏️'}
            </div>
            <div className="text-sm mt-1 capitalize">{block.type}</div>
          </Button>
        ))}
      </div>
      <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderMusicBlocks = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Crea música con bloques!
      </h3>
      <div className="bg-gray-100 rounded-lg p-8 min-h-[300px] mb-6">
        <div className="text-center text-gray-500">
          Editor de música - Arrastra los bloques para crear tu melodía
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {game.content.blocks?.map((block: any) => (
          <Button
            key={block.id}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50"
            style={{ borderColor: block.color }}
            onClick={() => handleBlockClick(block)}
          >
            <div className="text-lg font-bold" style={{ color: block.color }}>
              {block.type === 'note' && '🎵'}
              {block.type === 'rhythm' && '🥁'}
              {block.type === 'scale' && '🎼'}
            </div>
            <div className="text-sm mt-1 capitalize">{block.type}</div>
          </Button>
        ))}
      </div>
      <Button
        onClick={onComplete}
        className="bg-purple-600 hover:bg-purple-700"
      >
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderStoryCreator = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Crea tu historia interactiva!
      </h3>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Escenario</h4>
          <p className="text-blue-700">
            {game.content.scenarios?.[0]?.description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Personajes</h4>
            {game.content.scenarios?.[0]?.characters?.map((char: any) => (
              <div key={char.id} className="text-green-700 text-sm">
                • {char.name} - {char.role}
              </div>
            ))}
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">Objetivos</h4>
            {game.content.scenarios?.[0]?.objectives?.map((obj: any) => (
              <div key={obj.id} className="text-orange-700 text-sm">
                • {obj.title}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button
        onClick={onComplete}
        className="bg-indigo-600 hover:bg-indigo-700"
      >
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderPhysicsSim = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Experimenta con la física!
      </h3>
      <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] mb-6">
        <div className="text-center text-gray-500">
          Simulador de física - Interactúa con los objetos
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          className="p-4 bg-blue-100 hover:bg-blue-200 text-blue-800"
          onClick={() => handleSimulationAction('gravity')}
        >
          🌍 Activar Gravedad
        </Button>
        <Button
          className="p-4 bg-red-100 hover:bg-red-200 text-red-800"
          onClick={() => handleSimulationAction('friction')}
        >
          🔥 Activar Fricción
        </Button>
      </div>
      <Button onClick={onComplete} className="bg-blue-600 hover:bg-blue-700">
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderChemistryLab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Experimenta con la química!
      </h3>
      <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] mb-6">
        <div className="text-center text-gray-500">
          Laboratorio de química - Mezcla sustancias y observa las reacciones
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Button
          className="p-4 bg-blue-100 hover:bg-blue-200 text-blue-800"
          onClick={() => handleChemistryAction('acid')}
        >
          🧪 Ácido
        </Button>
        <Button
          className="p-4 bg-red-100 hover:bg-red-200 text-red-800"
          onClick={() => handleChemistryAction('base')}
        >
          🔬 Base
        </Button>
        <Button
          className="p-4 bg-green-100 hover:bg-green-200 text-green-800"
          onClick={() => handleChemistryAction('mix')}
        >
          ⚗️ Mezclar
        </Button>
      </div>
      <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderARExplorer = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Explora el mundo con realidad aumentada!
      </h3>
      <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] mb-6">
        <div className="text-center text-gray-500">
          Cámara AR - Apunta a objetos para explorarlos
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          className="p-4 bg-blue-100 hover:bg-blue-200 text-blue-800"
          onClick={() => handleARAction('scan')}
        >
          📱 Escanear
        </Button>
        <Button
          className="p-4 bg-green-100 hover:bg-green-200 text-green-800"
          onClick={() => handleARAction('explore')}
        >
          🔍 Explorar
        </Button>
      </div>
      <Button
        onClick={onComplete}
        className="bg-purple-600 hover:bg-purple-700"
      >
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderAdaptiveQuiz = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Quiz que se adapta a tu nivel!
      </h3>
      <div className="p-4 bg-blue-50 rounded-lg mb-6">
        <p className="text-blue-800">
          Este quiz se adapta a tus respuestas para darte el nivel perfecto de
          desafío.
        </p>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700">Pregunta adaptativa:</h4>
        <p className="text-lg">{game.content.questions?.[0]?.question}</p>
        <div className="grid gap-3">
          {game.content.questions?.[0]?.options?.map(
            (option: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                className="w-full p-4 text-left justify-start hover:bg-purple-50"
                onClick={() => handleAnswer(index)}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </Button>
            ),
          )}
        </div>
      </div>
    </div>
  );

  const renderCompetition = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Competencia en tiempo real!
      </h3>
      <div className="p-4 bg-yellow-50 rounded-lg mb-6">
        <p className="text-yellow-800">
          Compite con otros estudiantes en tiempo real. ¡Responde rápido para
          ganar puntos!
        </p>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700">
          Pregunta de competencia:
        </h4>
        <p className="text-lg">{game.content.questions?.[0]?.question}</p>
        <div className="grid gap-3">
          {game.content.questions?.[0]?.options?.map(
            (option: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                className="w-full p-4 text-left justify-start hover:bg-yellow-50"
                onClick={() => handleAnswer(index)}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </Button>
            ),
          )}
        </div>
      </div>
    </div>
  );

  const renderVocabularyBuilder = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Construye tu vocabulario!
      </h3>
      <div className="space-y-4">
        {game.content.cards?.map((card: any) => (
          <div
            key={card.id}
            className="p-4 border-2 border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
            onClick={() => handleCardClick(card)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">{card.front}</h4>
                <p className="text-gray-600">{card.back}</p>
              </div>
              <div className="text-2xl">
                {card.category === 'basic' && '📚'}
                {card.category === 'animals' && '🐾'}
                {card.category === 'colors' && '🎨'}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  const renderCodingChallenge = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Desafío de programación!
      </h3>
      <div className="space-y-4">
        {game.content.challenges?.map((challenge: any) => (
          <div key={challenge.id} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-lg mb-2">{challenge.title}</h4>
            <p className="text-gray-700 mb-4">{challenge.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>⏱️ {challenge.timeLimit}s</span>
              <span>🎯 {challenge.difficulty}</span>
            </div>
            <div className="mt-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Escribe tu código aquí..."
                rows={6}
              />
            </div>
            <Button
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleCodeSubmit(challenge)}
            >
              <Play className="w-4 h-4 mr-2" />
              Ejecutar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDiscussionForum = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        ¡Participa en la discusión!
      </h3>
      <div className="space-y-4">
        {game.content.scenarios?.map((scenario: any) => (
          <div key={scenario.id} className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-lg mb-2">{scenario.title}</h4>
            <p className="text-gray-700 mb-4">{scenario.description}</p>
            <div className="space-y-2">
              <h5 className="font-medium">Objetivos:</h5>
              {scenario.objectives?.map((obj: any) => (
                <div key={obj.id} className="text-sm text-gray-600">
                  • {obj.title}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Escribe tu respuesta aquí..."
                rows={4}
              />
            </div>
            <Button
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleDiscussionSubmit(scenario)}
            >
              <Play className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDefault = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{game.title}</h3>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-700">{game.description}</p>
      </div>
      <Button onClick={onComplete} className="bg-gray-600 hover:bg-gray-700">
        <Play className="w-4 h-4 mr-2" />
        Completar Juego
      </Button>
    </div>
  );

  // Event handlers
  const handleAnswer = (answer: any) => {
    console.log('Answer selected:', answer);
    onScoreUpdate(10);
  };

  const handleItemClick = (item: any) => {
    console.log('Item clicked:', item);
  };

  const handleHotspotClick = (item: any) => {
    console.log('Hotspot clicked:', item);
    onScoreUpdate(5);
  };

  const handleSequenceClick = (item: any, index: number) => {
    console.log('Sequence item clicked:', item, index);
  };

  const handleMatchingClick = (item: any, side: string) => {
    console.log('Matching item clicked:', item, side);
  };

  const handleCardClick = (card: any) => {
    console.log('Card clicked:', card);
  };

  const handleBlockClick = (block: any) => {
    console.log('Block clicked:', block);
  };

  const handleSimulationAction = (action: string) => {
    console.log('Simulation action:', action);
  };

  const handleChemistryAction = (action: string) => {
    console.log('Chemistry action:', action);
  };

  const handleARAction = (action: string) => {
    console.log('AR action:', action);
  };

  const handleCodeSubmit = (challenge: any) => {
    console.log('Code submitted for challenge:', challenge);
  };

  const handleDiscussionSubmit = (scenario: any) => {
    console.log('Discussion submitted for scenario:', scenario);
  };

  const [userAnswer, setUserAnswer] = React.useState('');

  return <div className="space-y-6">{renderGameContent()}</div>;
}
