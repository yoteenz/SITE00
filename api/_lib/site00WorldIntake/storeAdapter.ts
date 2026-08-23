/**
 * World intake store adapter — Supabase in production, memory in tests.
 */

import { hasSupabaseServiceRole } from '../supabase.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useWorldIntakeMemoryStore(): boolean {
  return process.env.SITE00_WORLD_INTAKE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveWorldIntakeStoreMode(): Promise<'memory' | 'supabase'> {
  if (useWorldIntakeMemoryStore()) {
    storeModeCache = null;
    return 'memory';
  }
  if (storeModeCache) return storeModeCache;
  if (!hasSupabaseServiceRole()) {
    storeModeCache = 'memory';
    return 'memory';
  }
  const exists = await db.worldIntakeTablesExist();
  storeModeCache = exists ? 'supabase' : 'memory';
  return storeModeCache;
}

export function resetWorldIntakeStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  return (await resolveWorldIntakeStoreMode()) === 'memory' ? mem : db;
}

export async function saveInvite(invite: Parameters<typeof mem.saveInvite>[0]) {
  return (await store()).saveInvite(invite);
}

export async function getInviteById(id: string) {
  return (await store()).getInviteById(id);
}

export async function getInviteByTokenHash(hash: string) {
  return (await store()).getInviteByTokenHash(hash);
}

export async function listInvites() {
  return (await store()).listInvites();
}

export async function saveSession(session: Parameters<typeof mem.saveSession>[0]) {
  return (await store()).saveSession(session);
}

export async function getSessionByInviteId(inviteId: string) {
  return (await store()).getSessionByInviteId(inviteId);
}

export async function saveSnapshot(snapshot: Parameters<typeof mem.saveSnapshot>[0]) {
  return (await store()).saveSnapshot(snapshot);
}

export async function getSnapshotByInviteId(inviteId: string) {
  return (await store()).getSnapshotByInviteId(inviteId);
}

export async function saveProjectStub(project: Parameters<typeof mem.saveProjectStub>[0]) {
  return (await store()).saveProjectStub(project);
}

export { resetWorldIntakeMemory } from './memoryStore.js';
