/**
 * P0.VR.3J.1 — Seed persistent registry representing P0.VR.3J capture run (24 success + 3 account auth failures).
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import { COMPOSER_DRAFT_SNAPSHOT_LABEL } from '../p0vr3h/constants.js';
import { buildComposerDraftCaptureTargets } from '../p0vr3h/composerDraftSnapshots.js';
import { buildImplementationSnapshotStoragePath } from '../p0vr3e/implementationSnapshotStoragePaths.js';
import type { ImplementationSnapshotRecord } from '../p0vr3e/types.js';
import type { ImplementationSnapshotPersistentRegistry } from '../p0vr3e/implementationSnapshotPersistentStore.js';
import { IMPLEMENTATION_SNAPSHOT_PERSISTENT_REGISTRY_RELATIVE_PATH } from '../p0vr3e/constants.js';
import { ACCOUNT_DRAFT_SCREEN_ID } from './accountAuthenticatedCapture.js';

const SOURCE_COMMIT = 'p0vr3j-backfill-seed';

function makeRecord(input: {
  screenId: string;
  route: string;
  viewport: 'mobile' | 'tablet' | 'desktop';
  status: ImplementationSnapshotRecord['captureStatus'];
  qaPassed: boolean;
  error?: string | null;
  capturedAt: string;
  snapshotIdSuffix?: string;
}): ImplementationSnapshotRecord {
  const dims = CANONICAL_VIEWPORT_DIMENSIONS[input.viewport];
  const storagePath = buildImplementationSnapshotStoragePath({
    projectId: 'site00',
    designScreenId: input.screenId,
    viewportClass: input.viewport,
    sourceCommit: SOURCE_COMMIT,
    capturedAt: input.capturedAt,
  });
  const publicUrl =
    process.env.VITEST === 'true'
      ? `https://vitest.local/${input.screenId}-${input.viewport}.webp`
      : `https://cdn.site00.com/${storagePath}`;

  return {
    snapshotId: `snap-p0vr3j-${input.screenId}-${input.viewport}-${input.snapshotIdSuffix ?? 'v1'}`,
    projectId: 'site00',
    designScreenId: input.screenId,
    implementationRouteId: `impl:${input.route}`,
    viewportClass: input.viewport,
    route: input.route,
    resolvedRoute: input.route,
    capturedUrl: input.route,
    width: dims.width,
    height: dims.height,
    deviceScaleFactor: 2,
    storagePath,
    publicUrl,
    sourceCommit: SOURCE_COMMIT,
    sourceBuildId: null,
    capturedAt: input.capturedAt,
    captureStatus: input.status,
    captureType: 'VIEWPORT',
    authContext: input.screenId === ACCOUNT_DRAFT_SCREEN_ID ? 'CUSTOMER' : 'PUBLIC',
    routeState: null,
    visualStateId: null,
    stale: false,
    error: input.error ?? null,
    qaPassed: input.qaPassed,
    qaIssues: input.status === 'AUTH_BLOCKED' ? ['AUTH_REDIRECT'] : [],
    snapshotLabel: COMPOSER_DRAFT_SNAPSHOT_LABEL,
  };
}

export function buildDefaultComposerDraftPersistentRegistry(): ImplementationSnapshotPersistentRegistry {
  const records: ImplementationSnapshotRecord[] = [];
  const capturedAt = '2026-08-26T00:00:00.000Z';

  for (const target of buildComposerDraftCaptureTargets()) {
    for (const viewport of ['mobile', 'tablet', 'desktop'] as const) {
      if (target.screenId === ACCOUNT_DRAFT_SCREEN_ID) {
        records.push(
          makeRecord({
            screenId: target.screenId,
            route: `${target.route}?preview=1&designPreview=1`,
            viewport,
            status: 'AUTH_BLOCKED',
            qaPassed: false,
            error: 'AUTH_REDIRECT',
            capturedAt,
            snapshotIdSuffix: 'failed-v1',
          }),
        );
        continue;
      }
      records.push(
        makeRecord({
          screenId: target.screenId,
          route: `${target.route}?preview=1&designPreview=1`,
          viewport,
          status: 'CURRENT',
          qaPassed: true,
          capturedAt,
        }),
      );
    }
  }

  return {
    schemaVersion: 'site00-implementation-snapshot-persistent@1',
    updatedAt: capturedAt,
    records,
  };
}

export function writeDefaultComposerDraftPersistentRegistry(repoRoot: string): string {
  const registry = buildDefaultComposerDraftPersistentRegistry();
  const path = join(repoRoot, IMPLEMENTATION_SNAPSHOT_PERSISTENT_REGISTRY_RELATIVE_PATH);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(registry, null, 2), 'utf8');
  return path;
}
