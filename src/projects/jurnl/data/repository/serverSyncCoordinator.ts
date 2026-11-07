/**
 * Server snapshot sync (real modes only). Registered from runtime when the data plane is SERVER_SYNC.
 *
 * Local cache policy (financial data): the device copy is a cache of the signed-in user's server snapshot plus any
 * change not yet accepted by the server (`syncBase.dirty`). It is keyed by data mode and user id, never by email, is
 * never authoritative, and is purged on sign-out unless it holds unsynced changes. The server always wins a conflict:
 * the refused device copy is kept on this device as a conflict copy, never silently dropped.
 */
import type { RepositorySnapshot } from './types';
import { getAccessTokenForSync, pushServerSnapshot, pullServerSnapshot, type PulledSnapshot } from './serverSnapshotSync';
import { resolveJurnlProductionConfig } from '../production/productionConfig';

export type ServerSyncState = 'idle' | 'syncing' | 'pending' | 'error' | 'offline' | 'conflict';

type SyncListener = (state: ServerSyncState, detail?: string) => void;

let enabled = false;
let apiBase = '';
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let syncState: ServerSyncState = 'idle';
let inFlight = false;
let queued = false;
let onlineHooked = false;
const listeners = new Set<SyncListener>();

function setState(next: ServerSyncState, detail?: string) {
  syncState = next;
  listeners.forEach((l) => l(next, detail));
}

export function getServerSyncState(): ServerSyncState {
  return syncState;
}

export function subscribeServerSync(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function configureServerSync(mode: 'design-preview' | 'production'): void {
  const cfg = resolveJurnlProductionConfig(mode);
  enabled = cfg.dataPlane === 'SERVER_SYNC';
  apiBase = cfg.apiBase;
  if (!enabled) setState('idle');
  if (enabled && !onlineHooked && typeof window !== 'undefined') {
    onlineHooked = true;
    window.addEventListener('online', () => {
      if (syncState === 'offline' || syncState === 'pending') void flushPush();
    });
  }
}

export function serverSyncEnabled(): boolean {
  return enabled && Boolean(apiBase);
}

export function notifyRepositoryPersisted(snapshot: RepositorySnapshot): void {
  if (!enabled || !apiBase || !snapshot.syncBase?.dirty) return;
  setState('pending');
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void flushPush();
  }, 800);
}

/** Pushes the CURRENT device snapshot (not a stale captured one) with its base revision. */
export async function flushPush(): Promise<void> {
  if (!enabled || !apiBase) return;
  if (inFlight) {
    queued = true;
    return;
  }
  inFlight = true;
  try {
    const { getRepository, markSnapshotSynced, saveConflictCopy, importSnapshotForUser } = await import('./deviceRepository');
    const snapshot = getRepository().getSnapshot();
    if (!snapshot.syncBase?.dirty) {
      setState('idle');
      return;
    }
    setState('syncing');
    const token = await getAccessTokenForSync();
    if (!token) {
      setState('error', 'SESSION EXPIRED');
      return;
    }
    const base = snapshot.syncBase.revision;
    const result = await pushServerSnapshot(apiBase, token, snapshot, base, `snap-${snapshot.userId}-${base}-${snapshot.updatedAt}`);
    if (result.ok) {
      // Only mark clean if nothing changed while the request was in flight.
      // If the user changed something while the request was in flight, the newer state uploads next on this revision.
      markSnapshotSynced(snapshot.userId, result.revision, { stillDirty: getRepository().getSnapshot().updatedAt !== snapshot.updatedAt });
      setState('idle');
      return;
    }
    if (result.code === 'CONFLICT') {
      // Newer data exists on the server: load it, keep this device's refused copy, tell the user.
      const pulled = await pullServerSnapshot(apiBase, token).catch(() => null);
      saveConflictCopy(snapshot);
      if (pulled?.snapshot) {
        importSnapshotForUser(snapshot.userId, { ...pulled.snapshot, userId: snapshot.userId, dataMode: snapshot.dataMode, syncBase: { revision: pulled.revision, dirty: false, reconciledAt: new Date().toISOString() } });
      }
      setState('conflict', 'CHANGED ON ANOTHER DEVICE. JURNL LOADED THE NEWEST SAVED VERSION.');
      return;
    }
    setState(result.code === 'OFFLINE' ? 'offline' : 'error', result.message);
  } finally {
    inFlight = false;
    if (queued) {
      queued = false;
      void flushPush();
    }
  }
}

export type HydrateResult = { ok: true; pulled: PulledSnapshot } | { ok: false; code: 'AUTH' | 'OFFLINE' | 'SERVER' | 'NOT_CONFIGURED' };

/** Pulls the server snapshot for the signed-in user. Never uploads anything. */
export async function pullServerSnapshotForHydrate(mode: 'design-preview' | 'production'): Promise<HydrateResult> {
  configureServerSync(mode);
  if (!enabled || !apiBase) return { ok: false, code: 'NOT_CONFIGURED' };
  const token = await getAccessTokenForSync();
  if (!token) return { ok: false, code: 'AUTH' };
  try {
    return { ok: true, pulled: await pullServerSnapshot(apiBase, token) };
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    if (msg.includes('AUTH')) return { ok: false, code: 'AUTH' };
    setState('offline');
    return { ok: false, code: msg.includes('OFFLINE') ? 'OFFLINE' : 'SERVER' };
  }
}
