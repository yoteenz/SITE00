import type { ConceptDirectedTwinSession } from './types.js';

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

export function resolveConceptDirectedTwinSessionForPreview(input: {
  projectSlug: string;
  sessionId: string;
}): ConceptDirectedTwinSession | null {
  const raw =
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(`${HANDOFF_PREFIX}${input.sessionId}`)
      : null;
  const fromHandoff = raw ? (JSON.parse(raw) as ConceptDirectedTwinSession) : null;
  if (fromHandoff?.sessionId === input.sessionId && fromHandoff.projectId === input.projectSlug) {
    return fromHandoff;
  }
  if (fromHandoff) return fromHandoff;
  return null;
}
