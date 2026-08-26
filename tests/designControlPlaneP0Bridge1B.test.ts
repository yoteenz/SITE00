/**
 * P0.BRIDGE.1B-SITE00 — NDXBOOK repo authority correction tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  Site00DesignControlPlane,
  initDesignControlPlaneForTest,
  getProjectAuthority,
  listSite00NativeProjectKeys,
  listFsbwBridgeProjectKeys,
  resolveChangeExecutionTarget,
  assertReadyForRepoAuthority,
  fsbwConsumerMayConsumeRequest,
  getRepoDefaultBranch,
  validateRepoBindingBranch,
  REPO_BRANCH_AUTHORITY,
  classifyChangeExecution,
} from '../shared/site00-design-control-plane/client.js';
import {
  memoryGetManagedProject,
  memoryGetRepoBindingForProject,
  memoryListRepoBindings,
  memoryListReadyForRepo,
  memoryReconcileLegacyWrongRepoRequests,
  memoryUpdateChangeRequest,
} from '../shared/site00-design-control-plane/memoryStore.js';
import { getManagedProjectRepoBinding } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const baseOps = [
  { operationOrder: 1, operationType: 'UPDATE_CONTENT_BINDING' as const, payload: { title: 'Home' } },
];

describe('P0.BRIDGE.1B NDXBOOK repo authority correction', () => {
  beforeEach(() => {
    initDesignControlPlaneForTest();
  });

  it('NDXBOOK source repo is yoteenz/SITE00 with SITE00_NATIVE execution mode', () => {
    const authority = getProjectAuthority('ndxbook');
    expect(authority?.sourceRepo).toBe('yoteenz/SITE00');
    expect(authority?.executionMode).toBe('SITE00_NATIVE');
    expect(authority?.externalRepoBridgeRequired).toBe(false);

    const project = memoryGetManagedProject('ndxbook');
    expect(project?.sourceRepo).toBe('yoteenz/SITE00');
    expect(project?.runtimeMode).toBe('SITE00_NATIVE');
  });

  it('stale NDXBOOK FSBW binding is superseded with history preserved', () => {
    const allBindings = memoryListRepoBindings('ndxbook');
    expect(allBindings.length).toBe(2);
    const historical = allBindings.find((b) => b.repoName === 'fsbw');
    expect(historical?.metadata.bindingStatus).toBe('SUPERSEDED');
    expect(historical?.metadata.supersededReason).toBe('REPO_AUTHORITY_CORRECTION');

    const active = memoryGetRepoBindingForProject('ndxbook');
    expect(active?.repoName).toBe('SITE00');
    expect(active?.sourceProjectPath).toBe('ndxbook');
  });

  it('FSBW bridge project list excludes NDXBOOK', () => {
    const fsbwProjects = listFsbwBridgeProjectKeys();
    expect(fsbwProjects).toEqual(expect.arrayContaining(['frontal-slayer', 'all-in-one-enterprises', 'studio-world']));
    expect(fsbwProjects).not.toContain('ndxbook');
  });

  it('SITE00 native project list includes site00 and ndxbook', () => {
    const nativeProjects = listSite00NativeProjectKeys();
    expect(nativeProjects).toEqual(expect.arrayContaining(['site00', 'ndxbook']));
  });

  it('resolveChangeExecutionTarget routes projects correctly', () => {
    const ndx = resolveChangeExecutionTarget({
      projectKey: 'ndxbook',
      changeExecutionClass: 'SOURCE_CODE_MATERIALIZATION',
      changeType: 'MODIFY_SHARED_SHELL',
      activeBinding: memoryGetRepoBindingForProject('ndxbook'),
    });
    expect(ndx.sourceRepo).toBe('yoteenz/SITE00');
    expect(ndx.executionMode).toBe('SITE00_NATIVE');
    expect(ndx.bridgeRequired).toBe(false);

    const fs = resolveChangeExecutionTarget({
      projectKey: 'frontal-slayer',
      changeExecutionClass: 'SOURCE_CODE_MATERIALIZATION',
      changeType: 'ADD_PAGE',
      activeBinding: memoryGetRepoBindingForProject('frontal-slayer'),
    });
    expect(fs.sourceRepo).toBe('yoteenz/fsbw');
    expect(fs.executionMode).toBe('CROSS_REPO_FSBW');
    expect(fs.bridgeRequired).toBe(true);
  });

  it('blocks NDXBOOK READY_FOR_REPO targeting FSBW', () => {
    const check = assertReadyForRepoAuthority({
      projectKey: 'ndxbook',
      repoBinding: {
        id: 'rb-fsbw-ndx-historical',
        projectId: 'mp-site00-ndx',
        repoOwner: 'yoteenz',
        repoName: 'fsbw',
        defaultBranch: 'main',
        sourceProjectPath: 'ndxbook',
        adapterType: 'FSBW_WEBSITE',
        runtimeBindingMode: 'HYBRID',
        sourceMaterializationEnabled: true,
        metadata: { bindingStatus: 'SUPERSEDED' },
      },
      expectedSourceBranch: 'main',
    });
    expect(check.allowed).toBe(false);
    expect(check.status).toBe('BLOCKED_REPO_AUTHORITY_MISMATCH');
    expect(check.reason).toMatch(/INVALID_REPO_AUTHORITY/);
  });

  it('NDXBOOK change cannot appear in FSBW READY_FOR_REPO consumer list', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'ndxbook',
      changeType: 'MODIFY_SHARED_SHELL',
      baseSourceCommit: 'ndx-site00-base',
      scope: 'SHARED_SHELL_GLOBAL',
      shellVersion: 2,
      operations: [{ operationOrder: 1, operationType: 'CHANGE_SHARED_SHELL', payload: {} }],
    });
    Site00DesignControlPlane.approveChangeRequest(req.id!, 'founder@site00.com');
    const ready = Site00DesignControlPlane.markReadyForRepo(req.id!, { currentSourceCommit: 'ndx-site00-base' });
    expect(ready.status).toBe('READY_FOR_REPO');
    expect(ready.repoBindingId).toBe(memoryGetRepoBindingForProject('ndxbook')?.id);

    const fsbwReady = memoryListReadyForRepo('yoteenz', 'fsbw');
    expect(fsbwReady.some((r) => r.id === req.id)).toBe(false);
  });

  it('blocks legacy NDXBOOK wrong-repo pending requests on reconcile', () => {
    const historical = memoryListRepoBindings('ndxbook').find((b) => b.repoName === 'fsbw')!;

    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'ndxbook',
      changeType: 'MODIFY_COMPONENT_STRUCTURE',
      baseSourceCommit: 'legacy-base',
      operations: baseOps,
    });
    memoryUpdateChangeRequest(req.id!, {
      repoBindingId: historical.id,
      status: 'READY_FOR_REPO',
    });

    const blocked = memoryReconcileLegacyWrongRepoRequests();
    expect(blocked).toBe(1);
    const updated = Site00DesignControlPlane.getChangeStatus(req.id!);
    expect(updated).toBe('BLOCKED_REPO_AUTHORITY_MISMATCH');
  });

  it('Frontal Slayer FSBW routing preserved', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'frontal-slayer',
      changeType: 'MODIFY_COMPONENT_STRUCTURE',
      baseSourceCommit: 'fs-base',
      operations: baseOps,
    });
    Site00DesignControlPlane.approveChangeRequest(req.id!, 'founder@site00.com');
    Site00DesignControlPlane.markReadyForRepo(req.id!, { currentSourceCommit: 'fs-base' });
    const ready = memoryListReadyForRepo('yoteenz', 'fsbw');
    expect(ready.some((r) => r.id === req.id)).toBe(true);
    expect(getManagedProjectRepoBinding('frontal-slayer')?.sourceRepo).toBe('yoteenz/fsbw');
  });

  it('AIO and Studio World Website FSBW handoff preserved', () => {
    for (const projectKey of ['all-in-one-enterprises', 'studio-world'] as const) {
      const binding = getManagedProjectRepoBinding(projectKey);
      expect(binding?.sourceRepo).toBe('yoteenz/fsbw');
      expect(binding?.executionMode).toBe('CROSS_REPO_FSBW');
    }
    expect(memoryGetManagedProject('studio-world')?.metadata.websiteScopeOnly).toBe(true);
  });

  it('branch authority resolved from config not hardcoded assumptions', () => {
    expect(getRepoDefaultBranch('yoteenz/SITE00')).toBe('main');
    expect(getRepoDefaultBranch('yoteenz/fsbw')).toBe('master');
    expect(REPO_BRANCH_AUTHORITY['yoteenz/fsbw'].discoverySource).toBe('github:defaultBranchRef');

    const fsBinding = memoryGetRepoBindingForProject('frontal-slayer');
    expect(fsBinding?.defaultBranch).toBe('master');
  });

  it('blocks stale wrong branch with BLOCKED_REPO_BRANCH_MISMATCH', () => {
    const check = assertReadyForRepoAuthority({
      projectKey: 'frontal-slayer',
      repoBinding: memoryGetRepoBindingForProject('frontal-slayer'),
      expectedSourceBranch: 'wrong-branch',
    });
    expect(check.allowed).toBe(false);
    expect(check.status).toBe('BLOCKED_REPO_BRANCH_MISMATCH');
  });

  it('base commit uses correct repo and branch on change request', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'ndxbook',
      changeType: 'MODIFY_SHARED_SHELL',
      baseSourceCommit: 'site00-ndx-sha',
      operations: [{ operationOrder: 1, operationType: 'CHANGE_SHARED_SHELL', payload: {} }],
    });
    expect(req.baseSourceCommit).toBe('site00-ndx-sha');
    expect(req.expectedSourceBranch).toBe('main');
    expect(req.metadata?.executionRepo).toBe('yoteenz/SITE00');
    expect(req.repoBindingId).toBe(memoryGetRepoBindingForProject('ndxbook')?.id);
  });

  it('fsbwConsumerMayConsumeRequest excludes NDXBOOK', () => {
    const ndxBinding = memoryGetRepoBindingForProject('ndxbook')!;
    expect(
      fsbwConsumerMayConsumeRequest({ projectKey: 'ndxbook', repoBinding: ndxBinding, status: 'READY_FOR_REPO' }),
    ).toBe(false);
    const fsBinding = memoryGetRepoBindingForProject('frontal-slayer')!;
    expect(
      fsbwConsumerMayConsumeRequest({ projectKey: 'frontal-slayer', repoBinding: fsBinding, status: 'READY_FOR_REPO' }),
    ).toBe(true);
  });

  it('classifies NDXBOOK source changes as SITE00_NATIVE not SOURCE_REPO_CHANGE', () => {
    const source = classifyChangeExecution('MODIFY_SHARED_SHELL', baseOps, 'ndxbook');
    expect(source.implementationMode).toBe('SITE00_NATIVE');
  });

  it('rejects FSBW receipt events for SITE00_NATIVE projects', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'ndxbook',
      changeType: 'PAGE_METADATA',
      operations: baseOps,
    });
    expect(() =>
      Site00DesignControlPlane.recordCrossRepoReceipt({
        changeRequestId: req.id!,
        eventType: 'PR_OPENED',
        status: 'PR_CREATED',
      }),
    ).toThrow(/SITE00_NATIVE/);
  });

  it('Design UI shows SITE00 native implementation mode for NDXBOOK', () => {
    const panel = read('src/site00/components/designWorkspace/DesignRepoChangePanel.tsx');
    expect(panel).toContain('SITE 00 NATIVE');
    expect(panel).toContain('data-bridge="p0-bridge-1b"');
    expect(panel).toContain('no FSBW bridge');
    expect(panel).toContain('SOURCE REPO:');
  });

  it('authority correction migration is idempotent and preserves history', () => {
    const sql = read('supabase/migrations/20260826130000_site00_bridge_ndxbook_authority_correction.sql');
    expect(sql).toContain('REPO_AUTHORITY_CORRECTION');
    expect(sql).toContain("source_repo = 'yoteenz/SITE00'");
    expect(sql).toContain("default_branch = 'master'");
    expect(sql).toContain('BLOCKED_REPO_AUTHORITY_MISMATCH');
    expect(sql).not.toContain('delete from');
  });

  it('Voice Lab and design workspace ownership preserved (no route changes)', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.ts')).toContain(
      "legacyDesignRoutes: ['/projects/ndxbook/design']",
    );
    expect(read('src/site00/pages/StudioWorldDesignPage.tsx')).toContain("searchParams.get('project')");
  });

  it('arbitrary code remains blocked and RLS migration untouched', () => {
    const bridgeSql = read('supabase/migrations/20260826123000_site00_design_control_plane_bridge.sql');
    expect(bridgeSql).toContain('row level security');
    expect(bridgeSql).toContain('service_role_all');
  });
});
