/**
 * P0.VR.PAGE-CONCEPT-FOUNDER-START-AND-PROGRESS-EVENTS1 — session boundary for observe vs auto-start.
 */

const KEY_PREFIX = 'site00:page-concept-founder-run-session:v1';

export type PageConceptFounderRunSession = {
  runId: string;
  confirmedAt: string;
};

export function pageConceptFounderRunSessionStorageKey(projectId: string, pageId: string): string {
  return `${KEY_PREFIX}:${projectId}:${pageId}`;
}

export function markPageConceptFounderRunSession(
  projectId: string,
  pageId: string,
  runId: string,
): void {
  if (typeof sessionStorage === 'undefined') return;
  const payload: PageConceptFounderRunSession = {
    runId,
    confirmedAt: new Date().toISOString(),
  };
  sessionStorage.setItem(
    pageConceptFounderRunSessionStorageKey(projectId, pageId),
    JSON.stringify(payload),
  );
}

export function loadPageConceptFounderRunSession(
  projectId: string,
  pageId: string,
): PageConceptFounderRunSession | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(pageConceptFounderRunSessionStorageKey(projectId, pageId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PageConceptFounderRunSession;
    if (!parsed.runId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPageConceptFounderRunSession(projectId: string, pageId: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(pageConceptFounderRunSessionStorageKey(projectId, pageId));
}
