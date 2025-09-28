import { sb } from './db';
import { QualityValidator } from './QualityValidator';
import { llmChat } from './llm';
import { genPrompt } from '../prompts/generator';
import { safeParseGames } from './parse';
import { curriculumAdjust } from '../agents/CurriculumAgent';
import { difficultyAdjust } from '../agents/DifficultyAgent';

export class GameGenerator {
  async generateAndSave(p: any) {
    const s = sb();

    // Agents pre-LLM
    const withCurr = curriculumAdjust(p);
    const withDiff = difficultyAdjust(withCurr);

    // Log request
    try {
      await s
        .from('brain_logs')
        .insert({
          kind: 'request',
          payload: JSON.stringify(withDiff).slice(0, 8000),
        } as any);
    } catch {}

    const messages = genPrompt(withDiff);
    const raw = await llmChat(messages);

    // Log response
    try {
      await s
        .from('brain_logs')
        .insert({
          kind: 'response',
          payload: String(raw).slice(0, 8000),
        } as any);
    } catch {}

    const out = safeParseGames(raw);
    const validator = new QualityValidator();

    const ids: string[] = [];
    let rejected = 0;
    let firstIssues: string[] = [];

    for (const g of out) {
      const chk = validator.run(g);
      if (!chk.ok) {
        rejected++;
        if (firstIssues.length === 0) firstIssues = chk.issues ?? [];
        continue;
      }

      // Map subject names to subject IDs
      const subjectMap: Record<string, string> = {
        matemáticas: '84b1c3d4-619b-43e2-802a-5f1baf1e2760',
        lengua: '94e54c22-2514-4fd2-9e46-31e02f497c05',
        ciencias: '90a80027-55aa-4f15-9451-36e6b3b143df',
        sociales: '21b785ae-40f1-4471-90a6-c727d55c5c22',
      };

      const subjectId =
        subjectMap[g.subject.toLowerCase()] ||
        '84b1c3d4-619b-43e2-802a-5f1baf1e2760'; // Default to math

      // Anti-duplicados por índice único (23505)
      const { data: game, error: ge } = await s
        .from('games')
        .insert({
          title: g.title,
          description: `Juego de ${g.subject} para grado ${g.grade}`,
          type: 'quiz',
          subject_id: subjectId,
          difficulty: 'medium',
          grade_level: g.grade,
          data: {
            questions: g.questions,
            metadata: g.metadata,
            language: g.language,
          },
          instructions: `Responde las preguntas sobre ${g.subject}`,
          points: 100,
          is_active: true,
        } as any)
        .select('id')
        .single();

      if (ge) {
        if ((ge as any).code === '23505') {
          try {
            await s
              .from('brain_logs')
              .insert({
                kind: 'parse_issues',
                payload: `duplicate: ${g.title}/${g.subject}/${g.grade}`,
              } as any);
          } catch {}
          continue;
        }
        try {
          await s
            .from('brain_logs')
            .insert({
              kind: 'parse_issues',
              payload: `insert_game_error: ${ge.message}`,
            } as any);
        } catch {}
        continue;
      }

      // Questions are now stored in the data field of the games table
      // No need to insert into quiz_questions table separately
      ids.push((game as any).id);
    }

    // si nada se creó, deja pistas en la respuesta
    return {
      created: ids.length,
      rejected,
      game_ids: ids,
      hint: ids.length === 0 ? { firstIssues } : undefined,
      llm_text_len: raw.length,
    };
  }
}
export const gameGenerator = new GameGenerator();
