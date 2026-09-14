import { hasSupabaseServiceRole } from '../supabase.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';
import type { PersistPackageApprovalInput } from './types.js';

export function useMobileTwinImplementationMemoryStore(): boolean {
  return process.env.SITE00_MOBILE_TWIN_IMPL_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

type Store = {
  persistPackageApproval(input: PersistPackageApprovalInput): Promise<ReturnType<typeof mem.persistPackageApprovalMemory> extends Promise<infer T> ? T : never>;
  getImplementationState(projectId: string): ReturnType<typeof mem.getImplementationStateMemory>;
  saveBuild(input: Parameters<typeof mem.saveBuildMemory>[0]): ReturnType<typeof mem.saveBuildMemory>;
  getBuild(buildId: string): ReturnType<typeof mem.getBuildMemory>;
  updateBuildFounderStatus(input: Parameters<typeof mem.updateBuildFounderStatusMemory>[0]): ReturnType<typeof mem.updateBuildFounderStatusMemory>;
};

async function resolveStore(): Promise<Store> {
  if (useMobileTwinImplementationMemoryStore()) {
    return {
      persistPackageApproval: mem.persistPackageApprovalMemory,
      getImplementationState: mem.getImplementationStateMemory,
      saveBuild: mem.saveBuildMemory,
      getBuild: mem.getBuildMemory,
      updateBuildFounderStatus: mem.updateBuildFounderStatusMemory,
    };
  }
  if (!hasSupabaseServiceRole()) {
    throw new Error('MOBILE_TWIN_IMPLEMENTATION_STORE_UNAVAILABLE');
  }
  const ok = await db.mobileTwinImplementationTablesExist();
  if (!ok) throw new Error('MOBILE_TWIN_IMPLEMENTATION_SCHEMA_MISSING');
  return {
    persistPackageApproval: db.persistPackageApprovalSupabase,
    getImplementationState: db.getImplementationStateSupabase,
    saveBuild: db.saveBuildSupabase,
    getBuild: db.getBuildSupabase,
    updateBuildFounderStatus: db.updateBuildFounderStatusSupabase,
  };
}

let cached: Store | null = null;

async function store(): Promise<Store> {
  if (cached) return cached;
  cached = await resolveStore();
  return cached;
}

export const mobileTwinImplementationStore = {
  resetMemory: () => {
    cached = null;
    mem.resetMobileTwinImplementationMemoryStore();
  },
  persistPackageApproval: (input: PersistPackageApprovalInput) => store().then((s) => s.persistPackageApproval(input)),
  getImplementationState: (projectId: string) => store().then((s) => s.getImplementationState(projectId)),
  saveBuild: (input: Parameters<typeof mem.saveBuildMemory>[0]) => store().then((s) => s.saveBuild(input)),
  getBuild: (buildId: string) => store().then((s) => s.getBuild(buildId)),
  updateBuildFounderStatus: (input: Parameters<typeof mem.updateBuildFounderStatusMemory>[0]) =>
    store().then((s) => s.updateBuildFounderStatus(input)),
};
