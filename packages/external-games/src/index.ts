// Components
export { ExternalGameWrapper } from './components/ExternalGameWrapper';

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

// Utils and helpers
export * from './utils/gameConfigs';

// Store and state management
export {
  useExternalGamesStore,
  useExternalGameAutoTracking,
  selectStudentStats,
  selectGlobalStats,
} from './store/externalGamesStore';