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

const PAGE_ID = 'design-twin-opus-direct';

/** AUTHORITY-WORKFLOW2: both viewports must be promoted before START_PAIR_REVIEW. */
async function promoteBothViewports(
  projectId: string,
  expectedSessionVersion: number | null,
): Promise<number> {
  let version = expectedSessionVersion;
  const base = { projectId, pageId: PAGE_ID, ...founder };

  for (const [viewport, candidateId, candidateVersion] of [
    ['MOBILE', 'concept-a', 'A'],
    ['DESKTOP', 'concept-c', 'C'],
  ] as const) {
    const selected = await applyDesignWorkspaceProductionCommand({
      ...base,
      command: 'SELECT_VIEWPORT_CANDIDATE',
      expectedSessionVersion: version,
      payload: { viewport, candidateId, candidateVersion },
    });
    version = selected.session.sessionVersion;
  }

  for (const viewport of ['MOBILE', 'DESKTOP'] as const) {
    const promoted = await applyDesignWorkspaceProductionCommand({
      ...base,
      command: 'PROMOTE_VIEWPORT_MASTER',
      expectedSessionVersion: version,
      payload: { viewport },
    });
    version = promoted.session.sessionVersion;
  }

  return version;
}

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
    const promotedVersion = await promoteBothViewports('ndxbook', null);
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: PAGE_ID,
      command: 'START_PAIR_REVIEW',
      expectedSessionVersion: promotedVersion,
      ...founder,
    });
    let session = await getDesignWorkspaceProductionSession('ndxbook');
    const v1 = session!.sessionVersion;

    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: PAGE_ID,
      command: 'APPROVE_AUTHORITY',
      expectedSessionVersion: v1,
      payload: { decision: 'APPROVE' },
      ...founder,
    });
    session = await getDesignWorkspaceProductionSession('ndxbook');
    const v2 = session!.sessionVersion;

    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: PAGE_ID,
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
    const promotedVersion = await promoteBothViewports('ndxbook', null);
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: PAGE_ID,
      command: 'START_PAIR_REVIEW',
      expectedSessionVersion: promotedVersion,
      ...founder,
    });
    let session = await getDesignWorkspaceProductionSession('ndxbook');
    const staleVersion = session!.sessionVersion;
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: PAGE_ID,
      command: 'APPROVE_AUTHORITY',
      expectedSessionVersion: session!.sessionVersion,
      payload: { decision: 'APPROVE' },
      ...founder,
    });
    await expect(
      applyDesignWorkspaceProductionCommand({
        projectId: 'ndxbook',
        pageId: PAGE_ID,
        command: 'LOCK_AUTHORITY_PAIR',
        expectedSessionVersion: staleVersion,
        ...founder,
      }),
    ).rejects.toThrow(/STALE_STATE/);
  });

  it('enforces founder-only lock server-side', async () => {
    const promotedVersion = await promoteBothViewports('ndxbook', null);
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: PAGE_ID,
      command: 'START_PAIR_REVIEW',
      expectedSessionVersion: promotedVersion,
      ...founder,
    });
    const session = await getDesignWorkspaceProductionSession('ndxbook');
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: PAGE_ID,
      command: 'APPROVE_AUTHORITY',
      expectedSessionVersion: session!.sessionVersion,
      payload: { decision: 'APPROVE' },
      ...founder,
    });
    const session2 = await getDesignWorkspaceProductionSession('ndxbook');
    await expect(
      applyDesignWorkspaceProductionCommand({
        projectId: 'ndxbook',
        pageId: PAGE_ID,
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
        pageId: PAGE_ID,
        command: 'MIGRATE_FROM_LOCAL',
        expectedSessionVersion: null,
        payload: { localState: createInitialDesignProductionState('ndxbook') },
        ...founder,
      });
    }
    session = await getDesignWorkspaceProductionSession('ndxbook');
    let v = await promoteBothViewports('ndxbook', session!.sessionVersion);
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: PAGE_ID,
      command: 'START_PAIR_REVIEW',
      expectedSessionVersion: v,
      ...founder,
    });
    session = await getDesignWorkspaceProductionSession('ndxbook');
    v = session!.sessionVersion;
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: PAGE_ID,
      command: 'APPROVE_AUTHORITY',
      expectedSessionVersion: v,
      payload: { decision: 'APPROVE' },
      ...founder,
    });
    session = await getDesignWorkspaceProductionSession('ndxbook');
    v = session!.sessionVersion;
    await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: PAGE_ID,
      command: 'LOCK_AUTHORITY_PAIR',
      expectedSessionVersion: v,
      ...founder,
    });
    session = await getDesignWorkspaceProductionSession('ndxbook');
    v = session!.sessionVersion;
    const moved = await applyDesignWorkspaceProductionCommand({
      projectId: 'ndxbook',
      pageId: PAGE_ID,
      command: 'MOVE_TO_BUILD',
      expectedSessionVersion: v,
      ...founder,
    });
    expect(moved.state.workflowStage).toBe('BUILD');
    expect(moved.state.buildPackage?.id).toBeTruthy();
  });
});
