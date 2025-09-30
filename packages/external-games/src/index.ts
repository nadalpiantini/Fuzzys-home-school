// Components
export { ExternalGameWrapper } from './components/ExternalGameWrapper';
export { BlocklyGamePlayer, createFuzzyBlocklyConfig } from './components/BlocklyGamePlayer';

// Hooks
export { useExternalGameTracking } from './hooks/useExternalGameTracking';

// Types
export type {
  ExternalGameSource,
  ExternalGameEvent,
  ExternalGameConfig,
  GameObjective,
  ExternalGameProgress,
  ExternalGameWrapperProps,
} from './types';
export type { BlocklyGamePlayerProps } from './components/BlocklyGamePlayer';

// Utils and helpers
export * from './utils/gameConfigs';

// Store and state management
export {
  useExternalGamesStore,
  useExternalGameAutoTracking,
  selectStudentStats,
  selectGlobalStats,
} from './store/externalGamesStore';