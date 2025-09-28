// apps/web/src/services/quiz/QuizService.ts
// Servicio delgado: NO usa process.env privadas ni service_role.
// Solo llama a /api/quiz. Incluye alias de compatibilidad para código legado.

type Op = 'status' | 'list' | 'get' | 'create' | 'submitResult' | 'generate'; // generate: opcional (shim)

export type QuizQuestion = {
  id?: string;
  prompt: string;
  options?: string[];
  answer?: string | number;
  type?: 'mcq' | 'boolean' | 'open' | string;
};

export type QuizDTO = {
  id?: string;
  title: string;
  topic?: string;
  level?: string;
  questions: QuizQuestion[];
  created_at?: string;
};

async function call<T = any>(op: Op, payload?: any): Promise<T> {
  const res = await fetch('/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ op, payload }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || `Quiz API error (${res.status})`);
  }
  return json;
}

export const QuizService = {
  // API formal
  status: () => call('status'),
  list: () => call<{ ok: true; data: QuizDTO[] }>('list'),
  get: (id: string) => call<{ ok: true; data: QuizDTO }>('get', { id }),
  create: (quiz: QuizDTO) =>
    call<{ ok: true; data: { id: string } }>('create', quiz),
  submitResult: (payload: {
    quiz_id: string;
    score: number;
    answers?: any;
    user_id?: string;
  }) => call<{ ok: true; data: { id: string } }>('submitResult', payload),

  // ====== ALIAS DE COMPATIBILIDAD (para evitar TS2339 sin tocar componentes) ======
  // getAll() -> list()
  getAll() {
    return this.list();
  },
  // getById(id) -> get(id)
  getById(id: string) {
    return this.get(id);
  },
  // createQuiz(quiz) -> create(quiz)
  createQuiz(quiz: QuizDTO) {
    return this.create(quiz);
  },
  // submit(payload) -> submitResult(payload)
  submit(payload: {
    quiz_id: string;
    score: number;
    answers?: any;
    user_id?: string;
  }) {
    return this.submitResult(payload);
  },
  // generate(spec) -> (shim) por ahora crea un quiz vacío con título
  // Si tus componentes llaman quizService.generate(...), no romperán el build.
  async generate(spec: Partial<QuizDTO> & { title?: string }) {
    const draft: QuizDTO = {
      title: spec.title ?? 'Untitled Quiz',
      topic: spec.topic ?? 'general',
      level: spec.level ?? 'easy',
      questions: Array.isArray(spec.questions) ? spec.questions : [],
    };
    // Si luego implementamos generación real con IA, se reemplaza esta llamada.
    return this.create(draft);
  },

  // ====== MÉTODOS ESPECÍFICOS PARA COMPONENTES ======
  // getSubjectRecommendations(userId) -> (shim) retorna array vacío por ahora
  async getSubjectRecommendations(userId: string) {
    // TODO: Implementar lógica real de recomendaciones
    return [];
  },

  // generateAdaptiveQuiz(userId, subject, grade, questionCount) -> (shim)
  async generateAdaptiveQuiz(
    userId: string,
    subject: string,
    grade: string,
    questionCount: number,
  ) {
    // TODO: Implementar generación adaptiva real
    return Array(questionCount)
      .fill(null)
      .map((_, i) => ({
        id: `adaptive_${i}`,
        prompt: `Adaptive question ${i + 1} for ${subject}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 0,
        type: 'mcq',
      }));
  },

  // generateCurriculumQuiz(grade, subject, unit, questionCount, difficulty) -> (shim)
  async generateCurriculumQuiz(
    grade: string,
    subject: string,
    unit: string,
    questionCount: number,
    difficulty: string,
  ) {
    // TODO: Implementar generación curricular real
    return Array(questionCount)
      .fill(null)
      .map((_, i) => ({
        id: `curriculum_${i}`,
        prompt: `Curriculum question ${i + 1} for ${subject} - ${unit}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 0,
        type: 'mcq',
      }));
  },

  // generateTopicQuiz(topic, difficulty, questionCount) -> (shim)
  async generateTopicQuiz(
    topic: string,
    difficulty: string,
    questionCount: number,
  ) {
    // TODO: Implementar generación por tópico real
    return Array(questionCount)
      .fill(null)
      .map((_, i) => ({
        id: `topic_${i}`,
        prompt: `Topic question ${i + 1} about ${topic}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 0,
        type: 'mcq',
      }));
  },
} as const;

// ====== EXPORTS LEGACY OPCIONALES ======
// Si en algún archivo aún se hace `import { quizService } from "@/services/quiz/QuizService"`:
export const quizService = QuizService;
