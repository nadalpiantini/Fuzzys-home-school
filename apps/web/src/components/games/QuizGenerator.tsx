'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Upload,
  Link,
  Brain,
  Wand2,
  Download,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings,
  Lightbulb,
  Target,
  Clock,
  BookOpen,
} from 'lucide-react';

import {
  AIQuizGenerator,
  QuizGenerationOptions,
  GeneratedQuiz,
  QuizUtils,
} from '@/lib/ai-quiz-generator';

interface QuizGeneratorProps {
  onQuizGenerated?: (quiz: GeneratedQuiz) => void;
  onClose?: () => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  onQuizGenerated,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [textContent, setTextContent] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<QuizGenerationOptions>({
    questionCount: 10,
    difficulty: 'mixed',
    questionTypes: ['mcq', 'true_false'],
    bloomsLevels: ['remember', 'understand', 'apply'],
    language: 'es',
    gradeLevel: 'middle school',
    subject: 'general',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const generator = new AIQuizGenerator();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      let quiz: GeneratedQuiz;

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      switch (activeTab) {
        case 'text':
          if (!textContent.trim()) {
            throw new Error('Por favor ingresa algún contenido de texto');
          }
          quiz = await generator.generateFromText(textContent, options);
          break;

        case 'file':
          if (!selectedFile) {
            throw new Error('Por favor selecciona un archivo');
          }
          quiz = await generator.generateFromDocument(selectedFile, options);
          break;

        case 'url':
          if (!url.trim()) {
            throw new Error('Por favor ingresa una URL válida');
          }
          quiz = await generator.generateFromUrl(url, options);
          break;

        default:
          throw new Error('Método de generación no válido');
      }

      clearInterval(progressInterval);
      setProgress(100);

      // Validate quiz quality
      const qualityCheck = QuizUtils.validateQuizQuality(quiz);
      if (!qualityCheck.isValid) {
        console.warn('Quiz quality issues:', qualityCheck.issues);
      }

      setGeneratedQuiz(quiz);
      onQuizGenerated?.(quiz);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error desconocido al generar el quiz',
      );
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleDownloadReport = () => {
    if (!generatedQuiz) return;

    const report = QuizUtils.generateQuizReport(generatedQuiz);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedQuiz.title.replace(/\s+/g, '_')}_report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadQuiz = () => {
    if (!generatedQuiz) return;

    const blob = new Blob([JSON.stringify(generatedQuiz, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedQuiz.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBloomsColor = (level: string) => {
    const colors = {
      remember: 'bg-blue-100 text-blue-800',
      understand: 'bg-cyan-100 text-cyan-800',
      apply: 'bg-green-100 text-green-800',
      analyze: 'bg-yellow-100 text-yellow-800',
      evaluate: 'bg-orange-100 text-orange-800',
      create: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (generatedQuiz) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quiz Header */}
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{generatedQuiz.title}</h2>
              <p className="text-gray-600 mb-4">{generatedQuiz.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{generatedQuiz.subject}</Badge>
                <Badge variant="outline">{generatedQuiz.gradeLevel}</Badge>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.round(generatedQuiz.estimatedDuration / 60)} min
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Reporte
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadQuiz}>
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>

          {/* Quiz Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {generatedQuiz.questions.length}
              </div>
              <div className="text-sm text-gray-600">Preguntas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {generatedQuiz.metadata.difficultyDistribution.easy}
              </div>
              <div className="text-sm text-gray-600">Fáciles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {generatedQuiz.metadata.difficultyDistribution.medium}
              </div>
              <div className="text-sm text-gray-600">Medianas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {generatedQuiz.metadata.difficultyDistribution.hard}
              </div>
              <div className="text-sm text-gray-600">Difíciles</div>
            </div>
          </div>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Preguntas Generadas</h3>
          {generatedQuiz.questions.map((question, index) => (
            <Card key={question.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="font-semibold text-lg">
                  Pregunta {index + 1}
                </span>
                <div className="flex gap-1">
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                  <Badge className={getBloomsColor(question.bloomsTaxonomy)}>
                    {question.bloomsTaxonomy}
                  </Badge>
                </div>
              </div>

              <div className="mb-3">
                <p className="font-medium mb-2">{question.stem}</p>
                {question.type === 'mcq' && question.choices && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                    {question.choices.map((choice) => (
                      <div
                        key={choice.id}
                        className={`p-2 rounded border ${
                          choice.correct
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className="font-medium">
                          {choice.id.toUpperCase()})
                        </span>{' '}
                        {choice.text}
                        {choice.correct && (
                          <CheckCircle className="inline w-4 h-4 ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <strong>Explicación:</strong> {question.explanation}
              </div>

              <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                <span>Categoría: {question.category}</span>
                <span>Puntos: {question.points}</span>
                <span>Tiempo: {question.timeLimit}s</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setGeneratedQuiz(null)}>
            Generar Otro Quiz
          </Button>
          <Button onClick={() => onQuizGenerated?.(generatedQuiz)}>
            Usar Este Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Generador de Quiz con IA
            </h2>
            <p className="text-gray-600">
              Crea quizzes automáticamente desde cualquier contenido
            </p>
          </div>
          <div className="text-right">
            <Brain className="w-8 h-8 text-blue-500 mx-auto mb-1" />
            <div className="text-xs text-gray-500">Powered by DeepSeek</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Texto
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Archivo
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div>
              <Label htmlFor="content">Contenido de texto</Label>
              <Textarea
                id="content"
                placeholder="Pega aquí el contenido desde el cual quieres generar preguntas..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={8}
                className="mt-1"
              />
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div>
              <Label>Subir archivo</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                {selectedFile ? (
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {Math.round(selectedFile.size / 1024)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p>Haz clic para seleccionar un archivo</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Soporta: TXT, PDF, DOCX
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".txt,.pdf,.docx"
                onChange={handleFileSelect}
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div>
              <Label htmlFor="url">URL del contenido</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://ejemplo.com/articulo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Ingresa la URL de una página web o artículo
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Generation Options */}
        <Card className="p-4 bg-gray-50 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4" />
            <h3 className="font-semibold">Opciones de Generación</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="questionCount">Número de preguntas</Label>
              <Select
                value={options.questionCount?.toString()}
                onValueChange={(value) =>
                  setOptions((prev) => ({
                    ...prev,
                    questionCount: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 preguntas</SelectItem>
                  <SelectItem value="10">10 preguntas</SelectItem>
                  <SelectItem value="15">15 preguntas</SelectItem>
                  <SelectItem value="20">20 preguntas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Dificultad</Label>
              <Select
                value={options.difficulty}
                onValueChange={(value: any) =>
                  setOptions((prev) => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                  <SelectItem value="mixed">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gradeLevel">Nivel educativo</Label>
              <Select
                value={options.gradeLevel}
                onValueChange={(value) =>
                  setOptions((prev) => ({ ...prev, gradeLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementary">Primaria</SelectItem>
                  <SelectItem value="middle school">Secundaria</SelectItem>
                  <SelectItem value="high school">Bachillerato</SelectItem>
                  <SelectItem value="university">Universidad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Materia</Label>
              <Input
                id="subject"
                value={options.subject}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Ej: Matemáticas, Historia..."
              />
            </div>

            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={options.language}
                onValueChange={(value: any) =>
                  setOptions((prev) => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Progress */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generando quiz...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center gap-4">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={
              isGenerating ||
              (activeTab === 'text' && !textContent.trim()) ||
              (activeTab === 'file' && !selectedFile) ||
              (activeTab === 'url' && !url.trim())
            }
            className="px-8"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Generar Quiz
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QuizGenerator;
