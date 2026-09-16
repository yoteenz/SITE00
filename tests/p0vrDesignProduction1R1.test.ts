/**
 * P0.VR.DESIGN-PRODUCTION1R1 — server-authoritative design workspace persistence
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  applyDesignWorkspaceProductionCommand,
  getDesignWorkspaceProductionSession,
} from '../api/_lib/site00DesignWorkspaceProduction/designWorkspaceProductionService.js';
import { designWorkspaceProductionStore } from '../api/_lib/site00DesignWorkspaceProduction/storeAdapter.js';
import { createInitialDesignProductionState } from '../shared/site00-design-workspace-production/designProductionStore.js';

const root = resolve(__dirname, '..');
const read = (relative: string) => readFileSync(resolve(root, relative), 'utf8');

const founder = { actorEmail: 'kateenaarmstrong@gmail.com', actorIsFounder: true };
const guest = { actorEmail: 'guest@example.com', actorIsFounder: false };

describe('DESIGN-PRODUCTION1R1 — schema + wiring', () => {
  it('documents persistence audit', () => {
    const audit = read('docs/design-workspace/DESIGN-PRODUCTION1R1-PERSISTENCE-AUDIT.md');
    expect(audit).toContain('EXISTING_TABLES_REVIEWED');
    expect(audit).toContain('site00_design_workspace_authority_sessions');
  });

  it('registers API route', () => {
    expect(read('server/routes.ts')).toContain('/api/site00/design-workspace-production');
    expect(read('scripts/vite-site00-local-api.mjs')).toContain('design-workspace-production');
  });

  it('uses server hydration client (not legacy authority store)', () => {
    const hook = read('src/site00/components/designBench/opusDirect/useTwinOpusDirectProduction.ts');
    expect(hook).toContain('fetchDesignWorkspaceProductionSession');
    expect(hook).toContain('AUTHORITY STATE UNAVAILABLE');
    expect(hook).toContain('writeDesignProductionCache');
    expect(hook).not.toContain('loadDesignProductionState');
  });
});

describe('DESIGN-PRODUCTION1R1 — multi-session memory store', () => {
  beforeEach(() => {
    designWorkspaceProductionStore.resetForTests();
  });

  it('syncs lock state across sessions', async () => {
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: 'design-twin-opus-direct',
      command: 'START_PAIR_REVIEW',
      expectedSessionVersion: null,
      ...founder,
    });
    let session = await getDesignWorkspaceProductionSession('ndxbook');
    const v1 = session!.sessionVersion;

    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: 'design-twin-opus-direct',
      command: 'APPROVE_AUTHORITY',
      expectedSessionVersion: v1,
      payload: { decision: 'APPROVE' },
      ...founder,
    });
    session = await getDesignWorkspaceProductionSession('ndxbook');
    const v2 = session!.sessionVersion;

    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: 'design-twin-opus-direct',
      command: 'LOCK_AUTHORITY_PAIR',
      expectedSessionVersion: v2,
      ...founder,
    });

    const sessionB = await getDesignWorkspaceProductionSession('ndxbook');
    expect(sessionB?.state.mobileAuthority).toBe('LOCKED');
    expect(sessionB?.state.desktopAuthority).toBe('LOCKED');
    expect(sessionB?.state.authorityLockedBy).toBe(founder.actorEmail);
  });

  it('rejects stale writes', async () => {
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: 'design-twin-opus-direct',
      command: 'START_PAIR_REVIEW',
      expectedSessionVersion: null,
      ...founder,
    });
    let session = await getDesignWorkspaceProductionSession('ndxbook');
    const staleVersion = session!.sessionVersion;
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: 'design-twin-opus-direct',
      command: 'APPROVE_AUTHORITY',
      expectedSessionVersion: session!.sessionVersion,
      payload: { decision: 'APPROVE' },
      ...founder,
    });
    await expect(
      applyDesignWorkspaceProductionCommand({
        projectId: 'ndxbook',
        pageId: 'design-twin-opus-direct',
        command: 'LOCK_AUTHORITY_PAIR',
        expectedSessionVersion: staleVersion,
        ...founder,
      }),
    ).rejects.toThrow(/STALE_STATE/);
  });

  it('enforces founder-only lock server-side', async () => {
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: 'design-twin-opus-direct',
      command: 'START_PAIR_REVIEW',
      expectedSessionVersion: null,
      ...founder,
    });
    const session = await getDesignWorkspaceProductionSession('ndxbook');
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: 'design-twin-opus-direct',
      command: 'APPROVE_AUTHORITY',
      expectedSessionVersion: session!.sessionVersion,
      payload: { decision: 'APPROVE' },
      ...founder,
    });
    const session2 = await getDesignWorkspaceProductionSession('ndxbook');
    await expect(
      applyDesignWorkspaceProductionCommand({
        projectId: 'ndxbook',
        pageId: 'design-twin-opus-direct',
        command: 'LOCK_AUTHORITY_PAIR',
        expectedSessionVersion: session2!.sessionVersion,
        ...guest,
      }),
    ).rejects.toThrow(/FOUNDER_ONLY/);
  });

  it('persists build package on move to build', async () => {
    let session = await getDesignWorkspaceProductionSession('ndxbook');
    if (!session) {
      await applyDesignWorkspaceProductionCommand({
        projectId: 'ndxbook',
        pageId: 'design-twin-opus-direct',
        command: 'MIGRATE_FROM_LOCAL',
        expectedSessionVersion: null,
        payload: { localState: createInitialDesignProductionState('ndxbook') },
        ...founder,
      });
    }
    session = await getDesignWorkspaceProductionSession('ndxbook');
    let v = session!.sessionVersion;
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: 'design-twin-opus-direct',
      command: 'START_PAIR_REVIEW',
      expectedSessionVersion: v,
      ...founder,
    });
    session = await getDesignWorkspaceProductionSession('ndxbook');
    v = session!.sessionVersion;
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: 'design-twin-opus-direct',
      command: 'APPROVE_AUTHORITY',
      expectedSessionVersion: v,
      payload: { decision: 'APPROVE' },
      ...founder,
    });
    session = await getDesignWorkspaceProductionSession('ndxbook');
    v = session!.sessionVersion;
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: 'design-twin-opus-direct',
      command: 'LOCK_AUTHORITY_PAIR',
      expectedSessionVersion: v,
      ...founder,
    });
    session = await getDesignWorkspaceProductionSession('ndxbook');
    v = session!.sessionVersion;
    const moved = await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: 'design-twin-opus-direct',
      command: 'MOVE_TO_BUILD',
      expectedSessionVersion: v,
      ...founder,
    });
    expect(moved.state.workflowStage).toBe('BUILD');
    expect(moved.state.buildPackage?.id).toBeTruthy();
  });
});
