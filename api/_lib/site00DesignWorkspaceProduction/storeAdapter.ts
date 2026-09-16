import { resolveDurableStoreMode } from '../../../shared/site00-studio-world-execution/persistencePolicy.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';
import { createInitialDesignProductionState } from '../../../shared/site00-design-workspace-production/designProductionStore.js';
import type { DesignProductionState } from '../../../shared/site00-design-workspace-production/types.js';
import type { DesignWorkspaceAuthoritySessionRow } from './types.js';

export function useDesignWorkspaceProductionMemoryStore(): boolean {
  return process.env.SITE00_DESIGN_WORKSPACE_PRODUCTION_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

type Store = {
  getSession(projectId: string, pageId: string): Promise<DesignWorkspaceAuthoritySessionRow | null>;
  createInitialSession(projectId: string, pageId: string): Promise<DesignWorkspaceAuthoritySessionRow>;
  upsertSession(input: {
    projectId: string;
    pageId: string;
    expectedSessionVersion: number | null;
    state: DesignProductionState;
    latestBuildPackageId: string | null;
    newEvents: { type: string; payload?: Record<string, unknown>; actorEmail: string | null; at: string }[];
  }): Promise<DesignWorkspaceAuthoritySessionRow>;
  persistBuildPackage(input: Parameters<typeof db.persistBuildPackageSupabase>[0]): Promise<void>;
};

let cached: Store | null = null;

async function resolveStore(): Promise<Store> {
  if (useDesignWorkspaceProductionMemoryStore()) {
    return {
      getSession: async (p, page) => mem.getSessionMemory(p, page),
      createInitialSession: async (p, page) => mem.createInitialSessionMemory(p, page),
      upsertSession: async (input) =>
        mem.upsertSessionMemory({
          projectId: input.projectId,
          pageId: input.pageId,
          expectedSessionVersion: input.expectedSessionVersion,
          state: input.state,
          latestBuildPackageId: input.latestBuildPackageId,
          newEvents: input.newEvents,
        }),
      persistBuildPackage: async () => {},
    };
  }

  const mode = await resolveDurableStoreMode({
    storeName: 'DesignWorkspaceProduction',
    explicitUseMemory: false,
    schemaExists: db.designWorkspaceProductionTablesExist,
    migrationHint: 'run supabase/migrations/20260916143000_site00_design_workspace_authority_session.sql',
  });

  if (mode === 'memory') {
    return resolveStore(); // unreachable unless policy allows
  }

  return {
    getSession: db.getSessionSupabase,
    createInitialSession: async (projectId, pageId) => {
      const state = createInitialDesignProductionState(projectId);
      return db.upsertSessionSupabase({
        projectId,
        pageId,
        expectedSessionVersion: null,
        state,
        latestBuildPackageId: null,
        newEvents: [],
      });
    },
    upsertSession: db.upsertSessionSupabase,
    persistBuildPackage: db.persistBuildPackageSupabase,
  };
}

async function store(): Promise<Store> {
  if (!cached) cached = await resolveStore();
  return cached;
}

export const designWorkspaceProductionStore = {
  resetForTests: () => {
    cached = null;
    mem.resetDesignWorkspaceProductionMemory();
  },
  getSession: (projectId: string, pageId: string) => store().then((s) => s.getSession(projectId, pageId)),
  createInitialSession: (projectId: string, pageId: string) => store().then((s) => s.createInitialSession(projectId, pageId)),
  upsertSession: (input: Parameters<Store['upsertSession']>[0]) => store().then((s) => s.upsertSession(input)),
  persistBuildPackage: (input: Parameters<Store['persistBuildPackage']>[0]) =>
    store().then((s) => s.persistBuildPackage(input)),
};
