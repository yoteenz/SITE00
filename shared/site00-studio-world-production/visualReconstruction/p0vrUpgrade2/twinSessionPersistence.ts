/**
 * P0.VR.CONVERGE.1R1 — Persist twin sessions across refresh (browser localStorage).
 */

import type { ReconstructionTwinSession } from './types.js';

const STORAGE_KEY = 'site00:reconstruction-twin-sessions:v1';

type PersistedTwinStore = {
  sessions: Record<string, ReconstructionTwinSession>;
  pageIndex: Record<string, string>;
};

let memorySessions: Record<string, ReconstructionTwinSession> = {};
let memoryPageIndex: Record<string, string> = {};
let hydrated = false;

function pageSessionsKey(projectId: string, pageId: string): string {
  return `${projectId}::${pageId}`;
}

export function hydrateTwinSessionsStoreFromPersistence(): void {
  if (hydrated || typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      hydrated = true;
      return;
    }
    const parsed = JSON.parse(raw) as PersistedTwinStore;
    memorySessions = parsed.sessions ?? {};
    memoryPageIndex = parsed.pageIndex ?? {};
  } catch {
    memorySessions = {};
    memoryPageIndex = {};
  }
  hydrated = true;
}

export function persistTwinSessionsStore(): void {
  if (typeof localStorage === 'undefined') return;
  const payload: PersistedTwinStore = { sessions: memorySessions, pageIndex: memoryPageIndex };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Mobile Safari quota — drop oldest sessions until write succeeds
    const ids = Object.keys(memorySessions).sort(
      (a, b) => (memorySessions[a]?.updatedAt ?? '').localeCompare(memorySessions[b]?.updatedAt ?? ''),
    );
    while (ids.length > 1) {
      const drop = ids.shift();
      if (drop) delete memorySessions[drop];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions: memorySessions, pageIndex: memoryPageIndex }));
        return;
      } catch {
        continue;
      }
    }
  }
}

export function listPersistedTwinSessionsForProject(projectId: string): ReconstructionTwinSession[] {
  hydrateTwinSessionsStoreFromPersistence();
  return Object.values(memorySessions).filter((s) => s.projectId === projectId);
}

export function readPersistedTwinSession(sessionId: string): ReconstructionTwinSession | null {
  hydrateTwinSessionsStoreFromPersistence();
  return memorySessions[sessionId] ?? null;
}

export function readPersistedActiveTwinSessionId(projectId: string, pageId: string): string | null {
  hydrateTwinSessionsStoreFromPersistence();
  return memoryPageIndex[pageSessionsKey(projectId, pageId)] ?? null;
}

export function writePersistedTwinSession(session: ReconstructionTwinSession): void {
  hydrateTwinSessionsStoreFromPersistence();
  memorySessions[session.sessionId] = session;
  if (session.status !== 'PROMOTED' && session.status !== 'SUPERSEDED') {
    memoryPageIndex[pageSessionsKey(session.projectId, session.pageId)] = session.sessionId;
  }
  persistTwinSessionsStore();
}

export function removePersistedTwinSession(sessionId: string): void {
  hydrateTwinSessionsStoreFromPersistence();
  delete memorySessions[sessionId];
  persistTwinSessionsStore();
}

export function resetTwinSessionPersistenceForTest(): void {
  memorySessions = {};
  memoryPageIndex = {};
  hydrated = true;
  if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
}

/** Merge persisted twin sessions into the in-memory upgrade.2 registry (newer updatedAt wins). */
export function mergePersistedTwinSessionsIntoRuntime(
  sessions: Map<string, ReconstructionTwinSession>,
  pageSessionIndex: Map<string, string>,
): void {
  hydrateTwinSessionsStoreFromPersistence();
  for (const [sessionId, persisted] of Object.entries(memorySessions)) {
    const existing = sessions.get(sessionId);
    if (!existing || persisted.updatedAt >= existing.updatedAt) {
      sessions.set(sessionId, persisted);
    }
    if (persisted.status !== 'PROMOTED' && persisted.status !== 'SUPERSEDED') {
      pageSessionIndex.set(pageSessionsKey(persisted.projectId, persisted.pageId), sessionId);
    }
  }
}
