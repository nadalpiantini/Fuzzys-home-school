import { BrainCommand, BrainResponse, BrainStatus } from './types';
import { gameGenerator } from './GameGenerator';
import { sb } from './db';

export class BrainEngine {
  private status: BrainStatus['status'] = 'ready';
  private version = '0.1.0';
  private lastActivity?: string;

  async execute(cmd: BrainCommand): Promise<BrainResponse> {
    try {
      this.status = 'busy';
      this.lastActivity = new Date().toISOString();

      if (cmd.type === 'GENERATE') {
        try {
          // Starting game generation
          const res = await gameGenerator.generateAndSave(
            cmd.parameters as any,
          );
          // Game generation completed

          this.status = 'ready';
          return { ok: true, data: res };
        } catch (e: any) {
          console.error('❌ Game generation failed:', e);
          this.status = 'error';
          throw e;
        }
      }

      if (cmd.type === 'CONFIGURE') {
        this.status = 'ready';
        return { ok: true, data: { message: 'Configuration updated' } };
      }

      if (cmd.type === 'ANALYZE') {
        this.status = 'ready';
        return { ok: true, data: { gaps: [], analysis: 'Complete' } };
      }

      if (cmd.type === 'OPTIMIZE') {
        this.status = 'ready';
        return { ok: true, data: { optimizations: [], status: 'Complete' } };
      }

      this.status = 'ready';
      return { ok: false, error: `Unknown command type: ${cmd.type}` };
    } catch (error) {
      this.status = 'error';
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getStatus(): BrainStatus {
    return {
      status: this.status,
      version: this.version,
      lastActivity: this.lastActivity,
      queuedJobs: 0, // TODO: implement queue
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const brain = new BrainEngine();
