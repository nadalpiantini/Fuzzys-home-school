import { AllOr } from './types';

// Incluye si value no es 'all'
export function includesIfNotAll<T extends string>(value: AllOr<T>, list: readonly T[]) {
  return value === 'all' || list.includes(value);
}

export function eqIfNotAll<T extends string>(value: AllOr<T>, current: T) {
  return value === 'all' || value === current;
}

// Garantiza Record completo en compile-time
export function expectCompleteMap<K extends readonly string[], V>(
  keys: K,
  map: Record<K[number], V>
) {
  return map;
}
