/**
 * P0.VR.REPLICATION.3B-R1 — Browser-safe runtime checks (no bare `process` in client bundles).
 */

/** Vitest sets import.meta.env.MODE === 'test'. Never use process.env.VITEST in shared client code. */
export function isVitestRuntime(): boolean {
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test') {
    return true;
  }
  return false;
}

export function resolveClientApiBase(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) {
    return String(import.meta.env.VITE_API_BASE).replace(/\/$/, '');
  }
  return '';
}

export function isPlaywrightReplicationCaptureEnabled(): boolean {
  if (typeof import.meta !== 'undefined') {
    if (import.meta.env?.VITE_SITE00_REPLICATION_PLAYWRIGHT === '1') return true;
  }
  if (isVitestRuntime()) return true;
  return false;
}
