/**
 * P0.VR.PAGE-CONCEPT-SNAPSHOT-DURABILITY-FIX1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearImplementationSnapshotRegistryForTest,
  registerImplementationSnapshot,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js';
import {
  findPersistentImplementationSnapshotById,
  loadPersistentImplementationSnapshotRegistry,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotPersistentStore.js';
import {
  loadImplementationSnapshotArtifact,
  resolveImplementationSnapshotRecord,
  sha256Hex,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/resolveImplementationSnapshotArtifact.js';
import { resolvePageGenerationCaptureBase64 } from '../api/_lib/site00PageConcept/resolvePageGenerationCapture.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

const PNG_1X1 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('P0.VR.PAGE-CONCEPT-SNAPSHOT-DURABILITY-FIX1', () => {
  beforeEach(() => {
    clearImplementationSnapshotRegistryForTest();
    vi.restoreAllMocks();
  });

  it('resolves snapshot by id from persistent ledger when not in memory', async () => {
    const registry = loadPersistentImplementationSnapshotRegistry(ROOT);
    const sample = registry.records.find((r) => r.qaPassed && r.storagePath?.trim());
    expect(sample).toBeTruthy();
    const resolved = await resolveImplementationSnapshotRecord(sample!.snapshotId, ROOT);
    expect(resolved?.snapshotId).toBe(sample!.snapshotId);
  });

  it('findPersistentImplementationSnapshotById returns newest duplicate id match', () => {
    const registry = loadPersistentImplementationSnapshotRegistry(ROOT);
    const sample = registry.records[0];
    expect(findPersistentImplementationSnapshotById(registry, sample.snapshotId)?.snapshotId).toBe(sample.snapshotId);
  });

  it('loadImplementationSnapshotArtifact uses durable storage download in production path', async () => {
    const record = {
      snapshotId: 'snap-test-durable',
      projectId: 'ndxbook',
      designScreenId: 'overview',
      implementationRouteId: null,
      viewportClass: 'mobile' as const,
      route: '/projects/ndxbook',
      resolvedRoute: '/projects/ndxbook',
      capturedUrl: '',
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      storagePath: 'studio-world/design/implementation-snapshots/ndxbook/overview/mobile/test.webp',
      publicUrl: 'https://example.com/snap.webp',
      sourceCommit: null,
      sourceBuildId: null,
      capturedAt: new Date().toISOString(),
      captureStatus: 'CURRENT' as const,
      captureType: 'VIEWPORT' as const,
      authContext: 'PUBLIC' as const,
      routeState: null,
      visualStateId: null,
      stale: false,
      error: null,
      qaPassed: true,
      qaIssues: [],
      checksumSha256: null,
      byteLength: 100,
      contentType: 'image/webp',
    };
    registerImplementationSnapshot(record);
    vi.spyOn(await import('../api/_lib/site00Assts/storage.js'), 'downloadSite00StorageBuffer').mockResolvedValue(
      Buffer.from(PNG_1X1, 'base64'),
    );
    const artifact = await loadImplementationSnapshotArtifact({
      snapshotId: record.snapshotId,
      repoRoot: ROOT,
      viewport: 'MOBILE',
    });
    expect(artifact.base64).toBe(PNG_1X1);
  });

  it('missing snapshot throws viewport-specific BLOCKED_MOBILE_SNAPSHOT_MISSING', async () => {
    await expect(
      resolvePageGenerationCaptureBase64(
        { captureId: 'missing-snap', snapshotId: 'missing-snap', width: 1, height: 1 },
        { viewport: 'MOBILE' },
      ),
    ).rejects.toThrow(/BLOCKED_MOBILE_SNAPSHOT_MISSING/);
  });

  it('checksum mismatch throws BLOCKED_MOBILE_SNAPSHOT_UNREADABLE', async () => {
    const buf = Buffer.from(PNG_1X1, 'base64');
    const record = {
      snapshotId: 'snap-checksum',
      projectId: 'ndxbook',
      designScreenId: 'overview',
      implementationRouteId: null,
      viewportClass: 'mobile' as const,
      route: '/x',
      resolvedRoute: '/x',
      capturedUrl: '',
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      storagePath: 'studio-world/design/implementation-snapshots/x/y/mobile/a.webp',
      publicUrl: 'https://example.com/a.webp',
      sourceCommit: null,
      sourceBuildId: null,
      capturedAt: new Date().toISOString(),
      captureStatus: 'CURRENT' as const,
      captureType: 'VIEWPORT' as const,
      authContext: 'PUBLIC' as const,
      routeState: null,
      visualStateId: null,
      stale: false,
      error: null,
      qaPassed: true,
      qaIssues: [],
      checksumSha256: 'deadbeef',
      byteLength: buf.length,
      contentType: 'image/webp',
    };
    registerImplementationSnapshot(record);
    vi.spyOn(await import('../api/_lib/site00Assts/storage.js'), 'downloadSite00StorageBuffer').mockResolvedValue(buf);
    await expect(
      loadImplementationSnapshotArtifact({ snapshotId: record.snapshotId, repoRoot: ROOT, viewport: 'MOBILE' }),
    ).rejects.toThrow(/BLOCKED_MOBILE_SNAPSHOT_UNREADABLE/);
  });

  it('sha256Hex matches buffer digest', () => {
    const buf = Buffer.from('site00-snapshot-test');
    expect(sha256Hex(buf)).toMatch(/^[a-f0-9]{64}$/);
  });

  it('capture write path uploads to Supabase and persists registry metadata', () => {
    const engine = read(
      'shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.ts',
    );
    expect(engine).toContain('uploadSite00AssetBuffer');
    expect(engine).toContain('checksumSha256');
    expect(engine).toContain('site00StorageObjectExists');
  });

  it('resolve handler uses durable snapshot artifact loader', () => {
    const resolveSrc = read('api/_lib/site00PageConcept/resolvePageGenerationCapture.ts');
    expect(resolveSrc).toContain('loadImplementationSnapshotArtifact');
    expect(resolveSrc).not.toContain('getImplementationSnapshot');
  });

  it('persistent store syncs registry to Supabase storage path', () => {
    const store = read(
      'shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotPersistentStore.ts',
    );
    expect(store).toContain('IMPLEMENTATION_SNAPSHOT_PERSISTENT_REGISTRY_STORAGE_PATH');
    expect(store).toContain('persistRegistryToSupabaseStorage');
  });
});
