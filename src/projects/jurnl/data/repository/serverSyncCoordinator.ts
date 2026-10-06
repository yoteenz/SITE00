/**
 * Debounced server snapshot sync (Wave 5). Registered from runtime when data plane is SERVER_SYNC.
 */
import type { RepositorySnapshot } from './types';
import { getAccessTokenForSync, pushServerSnapshot, pullServerSnapshot } from './serverSnapshotSync';
import { resolveJurnlProductionConfig } from '../production/productionConfig';

export type ServerSyncState = 'idle' | 'syncing' | 'pending' | 'error' | 'offline';

type SyncListener = (state: ServerSyncState, detail?: string) => void;

let enabled = false;
let apiBase = '';
let lastServerUpdatedAt: string | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let syncState: ServerSyncState = 'idle';
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
}

export function setLastServerUpdatedAt(iso: string | null): void {
  lastServerUpdatedAt = iso;
}

export function notifyRepositoryPersisted(snapshot: RepositorySnapshot): void {
  if (!enabled || !apiBase) return;
  setState('pending');
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void flushPush(snapshot);
  }, 800);
}

async function flushPush(snapshot: RepositorySnapshot): Promise<void> {
  if (!enabled || !apiBase) return;
  setState('syncing');
  const token = await getAccessTokenForSync();
  if (!token) {
    setState('error', 'SESSION EXPIRED');
    return;
  }
  const idempotencyKey = `snap-${snapshot.updatedAt}-${snapshot.userId}`;
  const result = await pushServerSnapshot(apiBase, token, snapshot, lastServerUpdatedAt, idempotencyKey);
  if (result.ok) {
    lastServerUpdatedAt = result.updatedAt;
    setState('idle');
    return;
  }
  if (result.code === 'CONFLICT') setState('error', result.message);
  else if (result.code === 'AUTH') setState('error', result.message);
  else setState(result.code === 'OFFLINE' ? 'offline' : 'error', result.message);
}

/** Pull server snapshot on login (caller merges via importSnapshotForUser). */
export async function pullServerSnapshotForHydrate(mode: 'design-preview' | 'production'): Promise<{
  snapshot: RepositorySnapshot | null;
  updatedAt: string | null;
}> {
  configureServerSync(mode);
  if (!enabled || !apiBase) return { snapshot: null, updatedAt: null };
  const token = await getAccessTokenForSync();
  if (!token) return { snapshot: null, updatedAt: null };
  try {
    const pulled = await pullServerSnapshot(apiBase, token);
    lastServerUpdatedAt = pulled.updatedAt;
    return pulled;
  } catch {
    setState('offline');
    return { snapshot: null, updatedAt: null };
  }
}
