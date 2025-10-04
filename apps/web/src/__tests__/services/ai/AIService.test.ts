import { AIService } from '@/services/ai/AIService';

// Mock de los servicios dependientes
jest.mock('@/services/tutor/tutor-engine');
jest.mock('@/services/tutor/deepseek-client');
jest.mock('@/services/adaptive/AdaptiveService');

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  describe('analyzeLearningProfile', () => {
    it('should analyze learning profile correctly', async () => {
      const mockData = {
        responses: [
          'Me gusta ver diagramas y dibujos',
          'Prefiero escuchar explicaciones',
          'Disfruto hacer experimentos',
        ],
        timeSpent: {
          Matemáticas: 45,
          Ciencias: 30,
          Lengua: 60,
        },
        scores: {
          Matemáticas: 85,
          Ciencias: 78,
          Lengua: 92,
        },
        preferences: ['games', 'visual', 'interactive'],
      };

      const result = await aiService.analyzeLearningProfile(
        'test-student',
        mockData,
      );

      expect(result).toHaveProperty('learningStyle');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('nextSteps');
      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should identify visual learning style', async () => {
      const mockData = {
        responses: [
          'Me gusta ver diagramas',
          'Prefiero imágenes',
          'Dibujos me ayudan',
        ],
        timeSpent: { Matemáticas: 30 },
        scores: { Matemáticas: 80 },
        preferences: ['visual'],
      };

      const result = await aiService.analyzeLearningProfile(
        'test-student',
        mockData,
      );
      expect(result.learningStyle).toBe('visual');
    });

    it('should identify auditory learning style', async () => {
      const mockData = {
        responses: ['Me gusta escuchar', 'Prefiero audio', 'Sonidos me ayudan'],
        timeSpent: { Matemáticas: 30 },
        scores: { Matemáticas: 80 },
        preferences: ['auditory'],
      };

      const result = await aiService.analyzeLearningProfile(
        'test-student',
        mockData,
      );
      expect(result.learningStyle).toBe('auditory');
    });
  });

  describe('generatePersonalizedContent', () => {
    it('should generate personalized content based on preferences', async () => {
      const result = await aiService.generatePersonalizedContent(
        'test-student',
        'Matemáticas',
        'intermediate',
        ['games', 'lessons', 'activities'],
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      result.forEach((content) => {
        expect(content).toHaveProperty('type');
        expect(content).toHaveProperty('title');
        expect(content).toHaveProperty('description');
        expect(content).toHaveProperty('difficulty');
        expect(content).toHaveProperty('estimatedTime');
        expect(content).toHaveProperty('learningObjectives');
        expect(content).toHaveProperty('prerequisites');
      });
    });

    it('should generate game content when games preference is included', async () => {
      const result = await aiService.generatePersonalizedContent(
        'test-student',
        'Ciencias',
        'beginner',
        ['games'],
      );

      const gameContent = result.find((content) => content.type === 'game');
      expect(gameContent).toBeDefined();
      expect(gameContent?.title).toContain('Aventura');
    });

    it('should generate lesson content when lessons preference is included', async () => {
      const result = await aiService.generatePersonalizedContent(
        'test-student',
        'Historia',
        'advanced',
        ['lessons'],
      );

      const lessonContent = result.find((content) => content.type === 'lesson');
      expect(lessonContent).toBeDefined();
      expect(lessonContent?.title).toContain('Lección');
    });
  });

  describe('generateInsights', () => {
    it('should generate comprehensive insights', async () => {
      const result = await aiService.generateInsights('test-student');

      expect(result).toHaveProperty('studentProgress');
      expect(result).toHaveProperty('personalizedRecommendations');
      expect(result).toHaveProperty('learningPath');
      expect(result).toHaveProperty('engagement');

      expect(result.studentProgress).toHaveProperty('overall');
      expect(result.studentProgress).toHaveProperty('bySubject');
      expect(result.studentProgress).toHaveProperty('trends');

      expect(result.engagement).toHaveProperty('level');
      expect(result.engagement).toHaveProperty('factors');
      expect(result.engagement).toHaveProperty('suggestions');
    });

    it('should analyze engagement levels correctly', async () => {
      const result = await aiService.generateInsights('test-student');

      expect(['high', 'medium', 'low']).toContain(result.engagement.level);
      expect(Array.isArray(result.engagement.factors)).toBe(true);
      expect(Array.isArray(result.engagement.suggestions)).toBe(true);
    });
  });

  describe('startIntelligentTutoring', () => {
    it('should start tutoring session with student profile', async () => {
      const result = await aiService.startIntelligentTutoring(
        'test-student',
        'Matemáticas',
        'contexto de prueba',
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('studentId');
      expect(result).toHaveProperty('subject');
      expect(result.subject).toBe('Matemáticas');
    });
  });

  describe('processIntelligentQuery', () => {
    it('should process query with context', async () => {
      const result = await aiService.processIntelligentQuery(
        'test-session',
        '¿Cómo resuelvo esta ecuación?',
        {
          subject: 'Matemáticas',
          difficulty: 'intermediate',
          learningStyle: 'visual',
        },
      );

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('confidence');
      expect(typeof result.content).toBe('string');
      expect(result.content.length).toBeGreaterThan(0);
    });
  });
});
