export type Check = { ok: boolean; issues?: string[] };

export class QualityValidator {
  run(g: {
    title: string;
    subject: string;
    grade: number;
    questions: { prompt: string; choices: string[]; answer: number }[];
  }): Check {
    const issues: string[] = [];

    // Title validation
    if (!g.title || g.title.length < 4) issues.push('title_short');
    if (g.title && g.title.length > 100) issues.push('title_long');

    // Subject validation
    if (!g.subject) issues.push('no_subject');

    // Grade validation
    if (!Number.isFinite(g.grade) || g.grade < 1) issues.push('bad_grade');
    if (g.grade > 12) issues.push('grade_too_high');

    // Questions validation
    if (!g.questions?.length || g.questions.length < 2)
      issues.push('few_questions');
    if (g.questions && g.questions.length > 10)
      issues.push('too_many_questions');

    // Individual question validation
    g.questions?.forEach((q, i) => {
      if (!q.prompt || q.prompt.length < 5) issues.push(`q${i}_prompt_short`);
      if (q.prompt && q.prompt.length > 500) issues.push(`q${i}_prompt_long`);
      if (!q.choices || q.choices.length < 3) issues.push(`q${i}_few_choices`);
      if (q.choices && q.choices.length > 6)
        issues.push(`q${i}_too_many_choices`);
      if (q.answer == null || q.answer < 0 || q.answer >= q.choices.length) {
        issues.push(`q${i}_bad_answer`);
      }

      // Check for duplicate choices
      const uniqueChoices = new Set(q.choices);
      if (uniqueChoices.size !== q.choices.length) {
        issues.push(`q${i}_duplicate_choices`);
      }
    });

    // Bloqueadores duros - estos impiden que el juego se guarde
    const blockers = issues.filter(
      (x) =>
        x.includes('bad_grade') ||
        x.includes('few_questions') ||
        x.includes('bad_answer') ||
        x.includes('no_subject'),
    );

    return { ok: blockers.length === 0, issues };
  }
}
