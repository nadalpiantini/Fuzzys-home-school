export type ExternalGameSource =
  | 'phet'
  | 'blockly'
  | 'scratch'
  | 'gcompris'
  | 'minetest'
  | 'aframe'
  | 'hubs'
  | 'arjs'
  | 'musicblocks'
  | 'sonicpi'
  | 'twine'
  | 'gdevelop'
  | 'stellarium'
  | 'marble'
  | 'sugarizer'
  | 'snap'
  | 'librelingo'
  | 'turtleblocks'
  | 'renpy'
  | 'godot';

export interface ExternalGameEvent {
  source: ExternalGameSource;
  gameId: string;
  action: string;
  score?: number;
  duration: number;
  timestamp: Date;
  studentId?: string;
  metadata: Record<string, any>;
}

export interface ExternalGameConfig {
  source: ExternalGameSource;
  gameId: string;
  title: string;
  description?: string;
  url: string;
  allowedOrigins?: string[];
  sandbox?: boolean;
  offline?: boolean;
  trackingEnabled?: boolean;
  objectives?: GameObjective[];
  ageRange?: [number, number];
  subjects?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface GameObjective {
  id: string;
  title: string;
  description: string;
  required: boolean;
  points?: number;
  completionCriteria: Record<string, any>;
}

export interface ExternalGameProgress {
  gameId: string;
  studentId: string;
  startedAt: Date;
  lastPlayedAt: Date;
  completedAt?: Date;
  totalTimeSpent: number;
  score?: number;
  objectivesCompleted: string[];
  events: ExternalGameEvent[];
  metadata: Record<string, any>;
}

export interface ExternalGameWrapperProps {
  config: ExternalGameConfig;
  studentId?: string;
  onEvent?: (event: ExternalGameEvent) => void;
  onComplete?: (progress: ExternalGameProgress) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}