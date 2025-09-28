export type Check = { ok: boolean; issues?: string[] };

export class QualityValidator {
  run(g: {
    title: string;
    subject: string;
    grade: number;
    questions: { prompt: string; choices: string[]; answer: number }[];
  }): Check {
    const issues: string[] = [];
    if (!g.title || g.title.length < 4) issues.push('title_short');
    if (!g.subject) issues.push('no_subject');
    if (!Number.isFinite(g.grade) || g.grade < 1) issues.push('bad_grade');
    if (!g.questions?.length || g.questions.length < 2)
      issues.push('few_questions');

    g.questions?.forEach((q, i) => {
      if (!q.prompt || q.prompt.length < 5) issues.push(`q${i}_prompt_short`);
      if (!q.choices || q.choices.length < 3) issues.push(`q${i}_few_choices`);
      if (q.answer == null || q.answer < 0 || q.answer >= q.choices.length) {
        issues.push(`q${i}_bad_answer`);
      }
    });

    // Permite publicar con warnings leves: solo bloquea si hay errores graves
    const blockers = issues.filter(
      (x) =>
        x.includes('bad_grade') ||
        x.includes('few_questions') ||
        (x.includes('q') && x.includes('bad_answer')),
    );
    return { ok: blockers.length === 0, issues };
  }
}
