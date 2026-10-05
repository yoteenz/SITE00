/** Browser-safe runtime checks — never reference bare `process` in client bundles. */

export function site00IsVitest(): boolean {
  if (typeof process !== 'undefined' && process.env?.VITEST === 'true') return true;
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test') return true;
  return false;
}

export function site00IsBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function site00ReadPublicViteEnv(key: string): string | undefined {
  if (typeof import.meta === 'undefined' || !import.meta.env) return undefined;
  const v = import.meta.env[key];
  return typeof v === 'string' && v.length ? v : undefined;
}
