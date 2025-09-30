'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Brain,
  Timer,
  Target,
  Sparkles,
  Heart,
  Eye,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';

interface Hotspot {
  id: number;
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
  description: string;
  funFact: string;
  found: boolean;
}

interface GameStats {
  score: number;
  hintsUsed: number;
  timeElapsed: number;
  hotspotsFound: number;
}

const HotspotGame: React.FC = () => {
  const router = useRouter();

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Game stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    hintsUsed: 0,
    timeElapsed: 0,
    hotspotsFound: 0,
  });

  // Human body hotspots
  const [hotspots, setHotspots] = useState<Hotspot[]>([
    {
      id: 1,
      name: 'Brain',
      x: 50,
      y: 15,
      description: 'The control center of your body',
      funFact: 'Your brain uses about 20% of your body\'s total energy!',
      found: false,
    },
    {
      id: 2,
      name: 'Heart',
      x: 45,
      y: 35,
      description: 'Pumps blood throughout your body',
      funFact: 'Your heart beats about 100,000 times per day!',
      found: false,
    },
    {
      id: 3,
      name: 'Lungs',
      x: 55,
      y: 40,
      description: 'Help you breathe oxygen and release carbon dioxide',
      funFact: 'You take about 20,000 breaths every day!',
      found: false,
    },
    {
      id: 4,
      name: 'Stomach',
      x: 50,
      y: 55,
      description: 'Digests the food you eat',
      funFact: 'Your stomach can stretch to hold up to 4 liters of food!',
      found: false,
    },
    {
      id: 5,
      name: 'Muscles',
      x: 35,
      y: 70,
      description: 'Help you move and stay strong',
      funFact: 'You have over 600 muscles in your body!',
      found: false,
    },
  ]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  // Check for game completion
  useEffect(() => {
    const foundCount = hotspots.filter(h => h.found).length;
    if (foundCount === hotspots.length && gameStarted) {
      setGameCompleted(true);
      const finalScore = calculateFinalScore();
      setStats(prev => ({ ...prev, score: finalScore }));
    }
  }, [hotspots, gameStarted]);

  const calculateFinalScore = useCallback(() => {
    const baseScore = hotspots.filter(h => h.found).length * 100;
    const timeBonus = Math.max(0, 300 - stats.timeElapsed); // Bonus for speed
    const hintPenalty = stats.hintsUsed * 25; // Penalty for hints
    return Math.max(0, baseScore + timeBonus - hintPenalty);
  }, [hotspots, stats.timeElapsed, stats.hintsUsed]);

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (hotspot.found || !gameStarted) return;

    const updatedHotspots = hotspots.map(h =>
      h.id === hotspot.id ? { ...h, found: true } : h
    );
    setHotspots(updatedHotspots);
    setSelectedHotspot(hotspot);
    setStats(prev => ({
      ...prev,
      hotspotsFound: prev.hotspotsFound + 1,
    }));

    // Auto-hide selection after 3 seconds
    setTimeout(() => {
      setSelectedHotspot(null);
    }, 3000);
  };

  const useHint = () => {
    setShowHints(!showHints);
    if (!showHints) {
      setStats(prev => ({
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
      }));
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setStats({ score: 0, hintsUsed: 0, timeElapsed: 0, hotspotsFound: 0 });
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setShowHints(false);
    setSelectedHotspot(null);
    setStats({ score: 0, hintsUsed: 0, timeElapsed: 0, hotspotsFound: 0 });
    setHotspots(prev => prev.map(h => ({ ...h, found: false })));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (stats.hotspotsFound / hotspots.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Human Body Hotspot Explorer
              </h1>
              <p className="text-gray-600">Find and learn about body parts!</p>
            </div>
          </div>

          <Button
            onClick={() => router.push('/games')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Games
          </Button>
        </div>

        {/* Game Stats */}
        {gameStarted && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-3 text-center">
                <Timer className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-bold">{formatTime(stats.timeElapsed)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 text-center">
                <Target className="w-5 h-5 mx-auto mb-1 text-green-600" />
                <p className="text-sm text-gray-600">Found</p>
                <p className="font-bold">{stats.hotspotsFound}/{hotspots.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 text-center">
                <Lightbulb className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                <p className="text-sm text-gray-600">Hints</p>
                <p className="font-bold">{stats.hintsUsed}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 text-center">
                <Star className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <p className="text-sm text-gray-600">Score</p>
                <p className="font-bold">{gameCompleted ? stats.score : calculateFinalScore()}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Bar */}
        {gameStarted && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{stats.hotspotsFound}/{hotspots.length} parts found</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        )}

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Canvas */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="relative bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg overflow-hidden">
                {/* Human Body Illustration */}
                <div className="relative w-full h-96 md:h-[500px] mx-auto">
                  {/* Body outline using CSS and emojis */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Head */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-6xl">
                        😊
                      </div>

                      {/* Body */}
                      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-24 h-32 bg-orange-200 rounded-t-full opacity-80"></div>

                      {/* Arms */}
                      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 -translate-y-2">
                        <div className="absolute -left-8 w-6 h-20 bg-orange-200 rounded-full opacity-80 rotate-12"></div>
                        <div className="absolute -right-2 w-6 h-20 bg-orange-200 rounded-full opacity-80 -rotate-12"></div>
                      </div>

                      {/* Legs */}
                      <div className="absolute top-48 left-1/2 transform -translate-x-1/2">
                        <div className="absolute -left-4 w-6 h-24 bg-orange-200 rounded-full opacity-80"></div>
                        <div className="absolute right-2 w-6 h-24 bg-orange-200 rounded-full opacity-80"></div>
                      </div>
                    </div>
                  </div>

                  {/* Hotspots */}
                  {hotspots.map((hotspot) => (
                    <button
                      key={hotspot.id}
                      onClick={() => handleHotspotClick(hotspot)}
                      className={`absolute w-8 h-8 rounded-full border-2 transition-all duration-300 transform hover:scale-125 ${
                        hotspot.found
                          ? 'bg-green-500 border-green-600 shadow-lg'
                          : showHints
                          ? 'bg-yellow-400 border-yellow-500 animate-pulse shadow-lg'
                          : 'bg-red-500 border-red-600 hover:bg-red-400'
                      }`}
                      style={{
                        left: `${hotspot.x}%`,
                        top: `${hotspot.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      disabled={!gameStarted || hotspot.found}
                    >
                      {hotspot.found && (
                        <CheckCircle className="w-4 h-4 text-white mx-auto" />
                      )}
                    </button>
                  ))}

                  {/* Game instructions overlay */}
                  {!gameStarted && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white p-6">
                        <Brain className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Ready to Explore?</h2>
                        <p className="text-lg mb-6">Find all 5 body parts by clicking on the red dots!</p>
                        <Button
                          onClick={startGame}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Start Game
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Completion celebration */}
                  {gameCompleted && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white p-6">
                        <Trophy className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">🎉 Congratulations!</h2>
                        <p className="text-xl mb-2">You found all body parts!</p>
                        <p className="text-lg mb-6">Final Score: {stats.score} points</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            onClick={resetGame}
                            variant="outline"
                            className="bg-white text-green-600 hover:bg-gray-100"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Play Again
                          </Button>
                          <Button
                            onClick={() => router.push('/games')}
                            className="bg-green-700 hover:bg-green-800"
                          >
                            <Home className="w-4 h-4 mr-2" />
                            More Games
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Game Controls */}
            {gameStarted && !gameCompleted && (
              <div className="flex flex-wrap gap-3 mt-4">
                <Button
                  onClick={useHint}
                  variant={showHints ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showHints ? 'Hide Hints' : 'Show Hints'}
                </Button>

                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Game
                </Button>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            {/* Instructions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  How to Play
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-red-500 mt-0.5" />
                    Click on the red dots to discover body parts
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-yellow-500 mt-0.5" />
                    Use hints to highlight unfound parts
                  </li>
                  <li className="flex items-start gap-2">
                    <Timer className="w-4 h-4 text-blue-500 mt-0.5" />
                    Find all parts quickly for bonus points
                  </li>
                  <li className="flex items-start gap-2">
                    <Trophy className="w-4 h-4 text-purple-500 mt-0.5" />
                    Learn amazing facts about your body!
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Selected Hotspot Info */}
            {selectedHotspot && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    {selectedHotspot.name}
                  </h3>
                  <p className="text-gray-700 mb-3">{selectedHotspot.description}</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      💡 Fun Fact:
                    </p>
                    <p className="text-sm text-blue-700">{selectedHotspot.funFact}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Found Parts List */}
            {gameStarted && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Discovered Parts
                  </h3>
                  <div className="space-y-2">
                    {hotspots.map((hotspot) => (
                      <div
                        key={hotspot.id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          hotspot.found
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {hotspot.found ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                        )}
                        <span className="font-medium">{hotspot.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scoring System */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Scoring
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Per body part found:</span>
                    <Badge variant="secondary">100 pts</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed bonus:</span>
                    <Badge variant="secondary">Up to 300 pts</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Hint penalty:</span>
                    <Badge variant="destructive">-25 pts each</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotGame;