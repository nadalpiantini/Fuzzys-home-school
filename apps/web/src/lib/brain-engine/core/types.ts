export type BrainCmdType = 'GENERATE' | 'CONFIGURE' | 'ANALYZE' | 'OPTIMIZE';
export type DiffMode = 'adaptive' | 'fixed';

export interface BrainCommand {
  type: BrainCmdType;
  parameters: {
    gradeLevel?: number[];
    subjects?: string[];
    quantity?: number;
    difficulty?: DiffMode;
    culturalContext?: 'argentina' | 'dominican' | 'general';
    language?: 'es' | 'en';
    learningObjectives?: string[];
  };
}

export interface BrainResponse {
  ok: boolean;
  received?: BrainCommand;
  error?: string;
  data?: any;
}

export interface BrainStatus {
  status: 'ready' | 'busy' | 'error' | 'initializing';
  version: string;
  lastActivity?: string;
  queuedJobs?: number;
}
