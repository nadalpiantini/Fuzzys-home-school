export type GameDTO = {
  title: string;
  subject: string;
  grade: number;
  language: string;
  metadata?: any;
  questions: { prompt: string; choices: string[]; answer: number }[];
};

function stripFences(s: string) {
  // quita ```json ... ``` y backticks sueltos
  return s.replace(/```json|```/gi, '').trim();
}

function tryJSON(s: string): any | null {
  try {
    return JSON.parse(s);
  } catch {}
  // recorta desde primer { hasta último }
  const i = s.indexOf('{'),
    j = s.lastIndexOf('}');
  if (i >= 0 && j > i) {
    try {
      return JSON.parse(s.slice(i, j + 1));
    } catch {}
  }
  // si vino como array raíz -> lo envolvemos
  const ia = s.indexOf('['),
    ja = s.lastIndexOf(']');
  if (ia >= 0 && ja > ia) {
    try {
      const arr = JSON.parse(s.slice(ia, ja + 1));
      return { games: arr };
    } catch {}
  }
  return null;
}

function normalizeAnswer(q: any): number {
  const ch = q.choices || [];
  if (typeof q.answer === 'number') {
    // corrige si el modelo usa 1-based
    const idx = q.answer > 0 && q.answer <= ch.length ? q.answer - 1 : q.answer;
    return Math.max(0, Math.min(idx, Math.max(0, ch.length - 1)));
  }
  if (typeof q.answer === 'string') {
    const up = q.answer.trim().toUpperCase();
    // letra A/B/C/D...
    const letterIdx = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(up);
    if (letterIdx >= 0 && letterIdx < ch.length) return letterIdx;
    // texto exacto
    const i = ch.findIndex(
      (c: string) => String(c).trim().toUpperCase() === up,
    );
    if (i >= 0) return i;
  }
  return 0;
}

function normChoices(arr: any): string[] {
  const choices = (arr ?? []).map((c: any) => String(c)).filter(Boolean);
  // al menos 3 opciones: si vienen 2, duplicamos última como parche suave
  if (choices.length === 2) choices.push(choices[1] + ' (alt)');
  return choices.slice(0, 6);
}

export function safeParseGames(txt: string): GameDTO[] {
  const cleaned = stripFences(txt);
  const raw = tryJSON(cleaned);
  if (!raw) return [];

  // Acepta varias formas: {games:[...]}, {data:{games:[...]}}, array root (ya envuelta)
  const arr =
    (Array.isArray(raw?.games) && raw.games) ||
    (Array.isArray(raw?.data?.games) && raw.data.games) ||
    (Array.isArray(raw) && raw) ||
    [];

  return arr
    .map((g: any): GameDTO => {
      const qList = (g.questions ?? g.items ?? g.preguntas ?? []).slice(0, 8);
      const language = String(g.language ?? g.lang ?? 'es');
      const grade = Number(g.grade ?? g.gradeLevel ?? g.nivel ?? 3) || 3;
      const subject = String(g.subject ?? g.materia ?? 'general');

      const questions = qList
        .map((q: any) => {
          const prompt = String(
            q.prompt ?? q.enunciado ?? q.question ?? '',
          ).trim();
          const choices = normChoices(
            q.choices ?? q.options ?? q.alternativas ?? [],
          );
          const answer = normalizeAnswer({
            choices,
            answer: q.answer ?? q.correct ?? q.correct_index,
          });
          return { prompt, choices, answer };
        })
        .filter((q: any) => q.prompt);

      return {
        title: String(g.title ?? g.titulo ?? '').slice(0, 80),
        subject,
        grade,
        language,
        metadata: g.metadata ?? {
          cultural: g?.metadata?.cultural ?? 'general',
          los: g?.metadata?.los ?? [],
        },
        questions,
      };
    })
    .filter((g: GameDTO) => g.title && g.questions?.length >= 2);
}
