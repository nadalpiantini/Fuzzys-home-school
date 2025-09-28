import { sb } from './db';
import { QualityValidator } from './QualityValidator';
import { llmChat } from './llm';
import { genPrompt } from '../prompts/generator';
import { safeParseGames } from './parse';

export class GameGenerator {
  async generateAndSave(p: any) {
    const s = sb();
    // 🔎 log request
    try {
      await (s.from('brain_logs') as any).insert({
        kind: 'request',
        payload: JSON.stringify(p).slice(0, 8000),
      });
    } catch {}

    const messages = genPrompt(p);
    const raw = await llmChat(messages);

    // 🔎 log response (truncado)
    try {
      await (s.from('brain_logs') as any).insert({
        kind: 'response',
        payload: String(raw).slice(0, 8000),
      });
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

      const { data: game, error: ge } = await (s.from('games') as any)
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
        })
        .select('id')
        .single();

      if (ge) {
        // si hay duplicado u otro error, lo registramos y seguimos
        try {
          await (s.from('brain_logs') as any).insert({
            kind: 'parse_issues',
            payload: `insert_game_error: ${ge.message}`,
          });
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
