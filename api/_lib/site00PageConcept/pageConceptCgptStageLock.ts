/**
 * P0.VR.PAGE-CONCEPT-CGPT-429-RESILIENCE1 — one CGPT dispatch lane per generation run.
 */

export type PageConceptCgptStagePhase = 'RUNNING' | 'RETRY_WAIT' | 'COMPLETE';

const phases = new Map<string, PageConceptCgptStagePhase>();

export function pageConceptCgptIdempotencyKey(runId: string): string {
  return `${runId}:CGPT`;
}

export function getPageConceptCgptStagePhase(runId: string): PageConceptCgptStagePhase | null {
  return phases.get(pageConceptCgptIdempotencyKey(runId)) ?? null;
}

export function setPageConceptCgptStagePhase(runId: string, phase: PageConceptCgptStagePhase): void {
  phases.set(pageConceptCgptIdempotencyKey(runId), phase);
}

export function clearPageConceptCgptStageLock(runId: string): void {
  phases.delete(pageConceptCgptIdempotencyKey(runId));
}

/** Returns false when another in-flight CGPT lane holds RUNNING/RETRY_WAIT (duplicate worker guard). */
export function tryBeginPageConceptCgptDispatch(runId: string): boolean {
  const key = pageConceptCgptIdempotencyKey(runId);
  const existing = phases.get(key);
  if (existing === 'RUNNING' || existing === 'RETRY_WAIT') return false;
  phases.set(key, 'RUNNING');
  return true;
}

/** Test-only */
export function clearAllPageConceptCgptStageLocks(): void {
  phases.clear();
}
