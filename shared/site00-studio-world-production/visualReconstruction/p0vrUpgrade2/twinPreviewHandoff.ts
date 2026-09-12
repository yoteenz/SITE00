/**
 * P0.VR.CONVERGE.1R1 — Twin preview tab must resolve session (localStorage + sessionStorage handoff).
 */

import type { ReconstructionTwinSession } from './types.js';
import { getTwinSession, importTwinSessionForPreview } from './reconstructionTwinSession.js';

const HANDOFF_PREFIX = 'site00:twin-preview-handoff:v1:';

function writeHandoff(sessionId: string, json: string): void {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(`${HANDOFF_PREFIX}${sessionId}`, json);
      return;
    } catch {
      // fall through
    }
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`${HANDOFF_PREFIX}${sessionId}`, json);
    } catch {
      // ignore
    }
  }
}

function readHandoffRaw(sessionId: string): string | null {
  if (typeof sessionStorage !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(`${HANDOFF_PREFIX}${sessionId}`);
      if (raw) return raw;
    } catch {
      // fall through
    }
  }
  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(`${HANDOFF_PREFIX}${sessionId}`);
    } catch {
      return null;
    }
  }
  return null;
}

export function stashTwinSessionForPreview(session: ReconstructionTwinSession): void {
  try {
    writeHandoff(session.sessionId, JSON.stringify(session));
  } catch {
    // Quota — persistence layer may still have the session
  }
}

export function readTwinSessionHandoff(sessionId: string): ReconstructionTwinSession | null {
  try {
    const raw = readHandoffRaw(sessionId);
    if (!raw) return null;
    return JSON.parse(raw) as ReconstructionTwinSession;
  } catch {
    return null;
  }
}

export function resolveTwinSessionForPreview(sessionId: string): ReconstructionTwinSession | null {
  const fromRegistry = getTwinSession(sessionId);
  if (fromRegistry) return fromRegistry;
  const handoff = readTwinSessionHandoff(sessionId);
  if (!handoff) return null;
  return importTwinSessionForPreview(handoff);
}
