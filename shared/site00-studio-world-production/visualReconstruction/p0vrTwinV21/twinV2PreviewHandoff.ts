import type { ConceptDirectedTwinSession } from './types.js';
import { listAllConceptDirectedTwinSessions } from './conceptDirectedTwinSessionStore.js';

const HANDOFF_PREFIX = 'site00:twin-v2-preview-handoff:v1:';

export function stashConceptDirectedTwinSessionForPreview(session: ConceptDirectedTwinSession): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(`${HANDOFF_PREFIX}${session.sessionId}`, JSON.stringify(session));
  } catch {
    try {
      localStorage.setItem(`${HANDOFF_PREFIX}${session.sessionId}`, JSON.stringify(session));
    } catch {
      // ignore
    }
  }
}

function readHandoffSession(sessionId: string): ConceptDirectedTwinSession | null {
  const key = `${HANDOFF_PREFIX}${sessionId}`;
  const rawSession =
    typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null;
  const rawLocal =
    typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  const raw = rawSession ?? rawLocal;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ConceptDirectedTwinSession;
  } catch {
    return null;
  }
}

export function resolveConceptDirectedTwinSessionForPreview(input: {
  projectSlug: string;
  sessionId: string;
}): ConceptDirectedTwinSession | null {
  const fromHandoff = readHandoffSession(input.sessionId);
  if (fromHandoff?.sessionId === input.sessionId && fromHandoff.projectId === input.projectSlug) {
    return fromHandoff;
  }
  if (fromHandoff?.sessionId === input.sessionId) return fromHandoff;

  const fromStore = listAllConceptDirectedTwinSessions().find(
    (s) => s.sessionId === input.sessionId && s.projectId === input.projectSlug,
  );
  return fromStore ?? null;
}
