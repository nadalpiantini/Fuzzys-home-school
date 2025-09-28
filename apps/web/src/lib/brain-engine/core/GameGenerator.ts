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

    // Log request (temporarily disabled for build)
    // try { await s.from('brain_logs').insert({ kind:'request', payload: JSON.stringify(withDiff).slice(0,8000) }); } catch {}

    const messages = genPrompt(withDiff);
    const raw = await llmChat(messages);

    // Log response (temporarily disabled for build)
    // try { await s.from('brain_logs').insert({ kind:'response', payload: String(raw).slice(0,8000) }); } catch {}

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
          subject: g.subject,
          grade_level: g.grade,
          language: g.language,
          metadata: g.metadata
        })
        .select('id').single();

      if (ge) {
        if ((ge as any).code === '23505') {
          try { await s.from('brain_logs').insert({ kind:'parse_issues', payload:`duplicate: ${g.title}/${g.subject}/${g.grade}` }); } catch {}
          continue;
        }
        try { await s.from('brain_logs').insert({ kind:'parse_issues', payload:`insert_game_error: ${ge.message}` }); } catch {}
        continue;
      }

      for (const q of g.questions) {
        const { error: qe } = await s.from('quiz_questions').insert({
          game_id: game.id,
          prompt: q.prompt,
          choices: q.choices,
          correct_index: q.answer
        });
        if (qe) {
          try { await s.from('brain_logs').insert({ kind:'parse_issues', payload:`insert_question_error: ${qe.message}` }); } catch {}
        }
      }
      ids.push(game.id);
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
