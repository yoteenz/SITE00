/**
 * P0.BRIDGE.1-SITE00 — Cross-repo design control plane tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ALLOWED_RUNTIME_COMPONENT_KEYS,
  BRIDGE_SCHEMA_TABLES,
  FORBIDDEN_OPERATION_TYPES,
  RUNTIME_SAFE_CHANGE_TYPES,
  SOURCE_CODE_CHANGE_TYPES,
  arbitraryCodeOperationBlocked,
  classifyChangeExecution,
  listProjectRuntimeCapabilities,
  studioWorldNativeInfrastructureTargetable,
  validateChangeOperations,
  Site00DesignControlPlane,
  initDesignControlPlaneForTest,
} from '../shared/site00-design-control-plane/client.js';
import {
  memoryGetManagedProject,
  memoryGetRepoBindingForProject,
  memoryListManagedProjects,
  memoryListReadyForRepo,
} from '../shared/site00-design-control-plane/memoryStore.js';
import { getManagedProjectRepoBinding } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const baseOps = [
  { operationOrder: 1, operationType: 'UPDATE_CONTENT_BINDING' as const, payload: { title: 'Home' } },
];

describe('P0.BRIDGE.1 design control plane', () => {
  beforeEach(() => {
    initDesignControlPlaneForTest();
  });

  it('shared schema migration defines canonical tables and RLS', () => {
    const sql = read('supabase/migrations/20260826123000_site00_design_control_plane_bridge.sql');
    for (const table of BRIDGE_SCHEMA_TABLES) {
      expect(sql).toContain(table);
    }
    expect(sql).toContain('site00_managed_projects');
    expect(sql).toContain('site00_repo_bindings');
    expect(sql).toContain('row level security');
    expect(sql).toContain('service_role_all');
    expect(sql).toContain("('frontal-slayer'");
    expect(sql).toContain("('studio-world'");
  });

  it('managed project and repo binding records work', () => {
    const projects = memoryListManagedProjects();
    expect(projects.map((p) => p.projectKey)).toEqual(
      expect.arrayContaining(['site00', 'ndxbook', 'frontal-slayer', 'all-in-one-enterprises', 'studio-world']),
    );
    const fsBinding = memoryGetRepoBindingForProject('frontal-slayer');
    expect(fsBinding?.repoOwner).toBe('yoteenz');
    expect(fsBinding?.repoName).toBe('fsbw');
    expect(fsBinding?.defaultBranch).toBe('master');
    const ndxBinding = memoryGetRepoBindingForProject('ndxbook');
    expect(ndxBinding?.repoName).toBe('SITE00');
    expect(getManagedProjectRepoBinding('frontal-slayer')?.sourceProjectPath).toBe('frontal-slayer');
    expect(getManagedProjectRepoBinding('ndxbook')?.sourceRepo).toBe('yoteenz/SITE00');
  });

  it('creates change request with ordered operations', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'frontal-slayer',
      routeKey: '/',
      changeType: 'MODIFY_COMPONENT_STRUCTURE',
      baseSourceCommit: 'abc123',
      operations: [
        { operationOrder: 1, operationType: 'UPDATE_COMPONENT_PROP', payload: { prop: 'title' } },
        { operationOrder: 2, operationType: 'UPDATE_LAYOUT_REGION', payload: { region: 'hero' } },
      ],
    });
    expect(req.id).toBeTruthy();
    expect(req.operations).toHaveLength(2);
    expect(req.operations![0].operationOrder).toBe(1);
    expect(req.changeExecutionClass).toBe('SOURCE_CODE_MATERIALIZATION');
  });

  it('blocks arbitrary code operations and payload code', () => {
    expect(arbitraryCodeOperationBlocked()).toBe(true);
    for (const forbidden of FORBIDDEN_OPERATION_TYPES) {
      const result = validateChangeOperations([
        { operationOrder: 1, operationType: forbidden as never, payload: {} },
      ]);
      expect(result.valid).toBe(false);
    }
    const withCode = validateChangeOperations([
      { operationOrder: 1, operationType: 'UPDATE_COMPONENT_PROP', payload: { code: 'eval("hack")' } },
    ]);
    expect(withCode.valid).toBe(false);
  });

  it('classifies runtime-safe vs source-code changes', () => {
    const runtime = classifyChangeExecution('PAGE_METADATA', baseOps, 'site00');
    expect(runtime.executionClass).toBe('RUNTIME_SAFE_BINDING');
    expect(runtime.implementationMode).toBe('SITE00_NATIVE');

    const source = classifyChangeExecution('ADD_ROUTE', baseOps, 'frontal-slayer');
    expect(source.executionClass).toBe('SOURCE_CODE_MATERIALIZATION');
    expect(source.implementationMode).toBe('SOURCE_REPO_CHANGE');
  });

  it('requires base commit for source materialization', () => {
    expect(() =>
      Site00DesignControlPlane.createChangeRequest({
        projectKey: 'frontal-slayer',
        changeType: 'MODIFY_COMPONENT_STRUCTURE',
        operations: baseOps,
      }),
    ).toThrow(/base_source_commit/);
  });

  it('requires founder approval before READY_FOR_REPO', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'frontal-slayer',
      changeType: 'MODIFY_COMPONENT_STRUCTURE',
      baseSourceCommit: 'abc123',
      operations: baseOps,
    });
    expect(() => Site00DesignControlPlane.markReadyForRepo(req.id!)).toThrow(/Founder approval/);
    Site00DesignControlPlane.approveChangeRequest(req.id!, 'founder@site00.com');
    const ready = Site00DesignControlPlane.markReadyForRepo(req.id!, { currentSourceCommit: 'abc123' });
    expect(ready.status).toBe('READY_FOR_REPO');
  });

  it('enforces idempotency for duplicate prepare requests', () => {
    const input = {
      projectKey: 'frontal-slayer',
      routeKey: '/about',
      changeType: 'MODIFY_COMPONENT_STRUCTURE',
      baseSourceCommit: 'abc123',
      operations: baseOps,
    };
    const first = Site00DesignControlPlane.createChangeRequest(input);
    const second = Site00DesignControlPlane.createChangeRequest(input);
    expect(second.id).toBe(first.id);
  });

  it('detects stale source divergence', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'studio-world',
      routeKey: '/marketing',
      changeType: 'MODIFY_SHARED_SHELL',
      baseSourceCommit: 'design-commit',
      scope: 'SHARED_SHELL_GLOBAL',
      shellVersion: 2,
      operations: [{ operationOrder: 1, operationType: 'CHANGE_SHARED_SHELL', payload: { shellKey: 'main' } }],
    });
    Site00DesignControlPlane.approveChangeRequest(req.id!, 'founder@site00.com');
    const blocked = Site00DesignControlPlane.markReadyForRepo(req.id!, { currentSourceCommit: 'newer-commit' });
    expect(blocked.status).toBe('BLOCKED_SOURCE_DIVERGENCE');
  });

  it('lists READY_FOR_REPO handoffs scoped to FSBW repo binding', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'all-in-one-enterprises',
      changeType: 'ADD_PAGE',
      baseSourceCommit: 'aio-base',
      operations: [{ operationOrder: 1, operationType: 'REGISTER_ROUTE', payload: { route: '/new' } }],
    });
    Site00DesignControlPlane.approveChangeRequest(req.id!, 'founder@site00.com');
    Site00DesignControlPlane.markReadyForRepo(req.id!, { currentSourceCommit: 'aio-base' });
    const ready = memoryListReadyForRepo('yoteenz', 'fsbw');
    expect(ready.some((r) => r.id === req.id)).toBe(true);
    expect(ready.every((r) => r.status === 'READY_FOR_REPO')).toBe(true);
  });

  it('shell propagation contract persists members and blast radius', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'frontal-slayer',
      routeKey: '/',
      changeType: 'MODIFY_SHARED_SHELL',
      baseSourceCommit: 'shell-base',
      scope: 'SHARED_SHELL_GLOBAL',
      shellVersion: 3,
      operations: [{ operationOrder: 1, operationType: 'CHANGE_SHARED_SHELL', payload: { shellKey: 'site-shell' } }],
    });
    const summary = Site00DesignControlPlane.prepareRepoChangeSummary(req.id!);
    expect(summary.shellPropagation).toBeTruthy();
    expect(summary.shellPropagation!.members.length).toBeGreaterThan(0);
    expect(summary.affectedRoutes).toContain('/');
  });

  it('records reference and snapshot staleness after approved shell change', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'ndxbook',
      routeKey: '/campaign-board',
      changeType: 'MODIFY_SHARED_SHELL',
      baseSourceCommit: 'ndx-base',
      scope: 'SHARED_SHELL_GLOBAL',
      shellVersion: 2,
      operations: [{ operationOrder: 1, operationType: 'CHANGE_SHARED_SHELL', payload: {} }],
    });
    Site00DesignControlPlane.approveChangeRequest(req.id!, 'founder@site00.com');
    const summary = Site00DesignControlPlane.prepareRepoChangeSummary(req.id!);
    expect(summary.referenceStaleness.some((r) => r.stalenessStatus === 'POSSIBLY_STALE')).toBe(true);
    expect(summary.snapshotStaleness.some((s) => s.stalenessStatus === 'POSSIBLY_STALE')).toBe(true);
  });

  it('runtime capability registry and fallback to source materialization', () => {
    expect(listProjectRuntimeCapabilities('site00')).toContain('CONTENT_RUNTIME');
    const fallback = classifyChangeExecution(
      'PAGE_METADATA',
      [{ operationOrder: 1, operationType: 'REGISTER_ROUTE', payload: {} }],
      'site00',
    );
    expect(fallback.executionClass).toBe('SOURCE_CODE_MATERIALIZATION');
    expect(fallback.fallbackReason).toMatch(/REGISTER_ROUTE/);
  });

  it('cross-repo receipt updates visible status', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'frontal-slayer',
      changeType: 'ADD_COMPONENT',
      baseSourceCommit: 'fs-base',
      operations: [{ operationOrder: 1, operationType: 'ADD_SECTION', payload: { componentKey: 'HERO' } }],
    });
    Site00DesignControlPlane.approveChangeRequest(req.id!, 'founder@site00.com');
    Site00DesignControlPlane.markReadyForRepo(req.id!, { currentSourceCommit: 'fs-base' });
    Site00DesignControlPlane.recordCrossRepoReceipt({
      changeRequestId: req.id!,
      eventType: 'PR_OPENED',
      status: 'PR_CREATED',
      prUrlOrId: 'https://github.com/yoteenz/fsbw/pull/1',
    });
    const summary = Site00DesignControlPlane.prepareRepoChangeSummary(req.id!);
    expect(summary.status).toBe('PR_CREATED');
    expect(summary.receipts.length).toBe(1);
  });

  it('protects Studio World website scope and blocks native infrastructure routes', () => {
    expect(studioWorldNativeInfrastructureTargetable()).toBe(false);
    expect(memoryGetManagedProject('studio-world')?.metadata.websiteScopeOnly).toBe(true);
    expect(() =>
      Site00DesignControlPlane.createChangeRequest({
        projectKey: 'studio-world',
        routeKey: '/studio/campaign-pipeline',
        changeType: 'MODIFY_COMPONENT_STRUCTURE',
        baseSourceCommit: 'sw-base',
        operations: baseOps,
      }),
    ).toThrow(/native infrastructure/);
  });

  it('allows Studio World website routes and blocks cross-project contamination', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'studio-world',
      routeKey: '/',
      changeType: 'PAGE_METADATA',
      operations: [{ operationOrder: 1, operationType: 'UPDATE_CONTENT_BINDING', payload: { headline: 'Studio' } }],
    });
    expect(req.projectKey).toBe('studio-world');
    expect(req.repoBindingId).toBe(memoryGetRepoBindingForProject('studio-world')?.id);
    expect(req.repoBindingId).not.toBe(memoryGetRepoBindingForProject('frontal-slayer')?.id);
  });

  it('supersedes prior unmerged change requests', () => {
    const req = Site00DesignControlPlane.createChangeRequest({
      projectKey: 'frontal-slayer',
      changeType: 'ADD_TAB',
      baseSourceCommit: 'v1',
      operations: [{ operationOrder: 1, operationType: 'REGISTER_TAB', payload: { tab: 'new' } }],
    });
    const superseded = Site00DesignControlPlane.supersedeChangeRequest(req.id!);
    expect(superseded.status).toBe('SUPERSEDED');
  });

  it('component allowlist rejects arbitrary runtime components', () => {
    const bad = validateChangeOperations([
      {
        operationOrder: 1,
        operationType: 'UPDATE_ALLOWED_COMPONENT_VARIANT',
        payload: { componentKey: 'ARBITRARY_WIDGET' },
      },
    ]);
    expect(bad.valid).toBe(false);
    expect(ALLOWED_RUNTIME_COMPONENT_KEYS).toContain('HERO');
  });

  it('Design review UI exposes prepare repo change panel', () => {
    expect(read('src/site00/components/designWorkspace/DesignRepoChangePanel.tsx')).toContain('PREPARE REPO CHANGE');
    expect(read('src/site00/components/designWorkspace/DesignRepoChangePanel.tsx')).toContain('APPROVE FOR SOURCE REPO');
    expect(read('src/site00/components/designWorkspace/DesignRepoChangePanel.tsx')).toContain('SITE 00 NATIVE');
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('DesignRepoChangePanel');
    expect(read('src/site00/styles/site00-design-workspace-p0vr2b.css')).toContain('site00-dw-repo-change');
  });

  it('API route registered without client service role exposure', () => {
    expect(read('api/site00/design-control-plane.ts')).toContain('requireAdmin');
    expect(read('api/site00/design-control-plane.ts')).not.toContain('SUPABASE_SERVICE_ROLE');
    expect(read('scripts/vite-site00-local-api.mjs')).toContain('/api/site00/design-control-plane');
  });

  it('documents runtime-safe and source-code change type vocabularies', () => {
    expect(RUNTIME_SAFE_CHANGE_TYPES).toContain('CONTENT_BINDING');
    expect(SOURCE_CODE_CHANGE_TYPES).toContain('MODIFY_SHARED_SHELL');
  });
});
