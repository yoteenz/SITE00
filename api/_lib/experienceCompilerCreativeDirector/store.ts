import type { CreativeContextPack, CreativeDirectorRunRecord, CreativeThread } from '../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import {
  creativeDirectorPersistenceEnabled,
  loadThreadFromDb,
  listThreadsByProject,
  persistContextPack,
  persistRawResponse,
  persistRun,
  persistThreadBundle,
} from './supabasePersistence.js';

const threads = new Map<string, CreativeThread>();
const runs = new Map<string, CreativeDirectorRunRecord>();
const rawResponses = new Map<string, string>();

export function resetExperienceCompilerCreativeDirectorStore(): void {
  threads.clear();
  runs.clear();
  rawResponses.clear();
}

export function persistenceBackendLabel(): 'supabase' | 'memory' {
  return creativeDirectorPersistenceEnabled() ? 'supabase' : 'memory';
}

function strictPersistence(): boolean {
  return process.env.SITE00_CREATIVE_DIRECTOR_STRICT_PERSISTENCE === '1';
}

export async function saveThread(thread: CreativeThread): Promise<void> {
  threads.set(thread.thread_id, thread);
  if (creativeDirectorPersistenceEnabled()) {
    try {
      await persistThreadBundle(thread);
    } catch (e) {
      if (strictPersistence()) throw e;
    }
  }
}

export async function getThread(threadId: string): Promise<CreativeThread | null> {
  if (creativeDirectorPersistenceEnabled()) {
    try {
      const fromDb = await loadThreadFromDb(threadId);
      if (fromDb) {
        threads.set(threadId, fromDb);
        return fromDb;
      }
    } catch {
      // fall through to memory cache
    }
  }
  return threads.get(threadId) ?? null;
}

export async function listThreadsForProject(projectId: string): Promise<CreativeThread[]> {
  if (creativeDirectorPersistenceEnabled()) {
    try {
      return await listThreadsByProject(projectId);
    } catch {
      return [...threads.values()].filter((t) => t.project_id === projectId);
    }
  }
  return [...threads.values()].filter((t) => t.project_id === projectId);
}

export async function saveRun(run: CreativeDirectorRunRecord): Promise<void> {
  runs.set(run.run_id, run);
  if (creativeDirectorPersistenceEnabled()) {
    try {
      await persistRun(run);
    } catch (e) {
      if (strictPersistence()) throw e;
    }
  }
}

export async function getRun(runId: string): Promise<CreativeDirectorRunRecord | null> {
  return runs.get(runId) ?? null;
}

export async function stashRawResponse(key: string, raw: string, runId?: string): Promise<void> {
  rawResponses.set(key, raw);
  if (creativeDirectorPersistenceEnabled()) {
    try {
      await persistRawResponse(key, raw, runId);
    } catch (e) {
      if (strictPersistence()) throw e;
    }
  }
}

export async function getRawResponse(key: string): Promise<string | null> {
  return rawResponses.get(key) ?? null;
}

export async function saveContextPack(pack: CreativeContextPack): Promise<void> {
  if (creativeDirectorPersistenceEnabled()) {
    try {
      await persistContextPack(pack, false);
    } catch (e) {
      if (strictPersistence()) throw e;
    }
  }
}
