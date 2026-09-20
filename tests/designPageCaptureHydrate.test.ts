import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { mergeImplementationSnapshotIntoPageCapture } from '../shared/site00-design-workspace-production/designPageCaptureHydrate.js';
import {
  evaluatePageConceptReadiness,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { resolvePageViewportBundle } from '../shared/site00-design-workspace-production/designProjectBinding/pageViewportAuthority.js';
import type { ImplementationSnapshotRecord } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/types.js';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject('ndxbook').find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

function mockSnapshot(viewportClass: 'mobile' | 'desktop', publicUrl: string): ImplementationSnapshotRecord {
  return {
    snapshotId: `snap-${viewportClass}`,
    projectId: 'ndxbook',
    designScreenId: 'overview',
    implementationRouteId: null,
    viewportClass,
    route: '/projects/design/ndxbook/overview',
    resolvedRoute: '/projects/design/ndxbook/overview',
    capturedUrl: publicUrl,
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    storagePath: `studio-world/design/implementation-snapshots/ndxbook/overview/${viewportClass}/x.webp`,
    publicUrl,
    sourceCommit: null,
    sourceBuildId: 'vitest',
    capturedAt: new Date().toISOString(),
    captureStatus: 'CURRENT',
    captureType: 'VIEWPORT',
    authContext: 'PUBLIC',
    routeState: null,
    visualStateId: null,
    stale: false,
    error: null,
    qaPassed: true,
    qaIssues: [],
  };
}

describe('designPageCaptureHydrate', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('window', { localStorage, dispatchEvent: () => undefined });
  });

  it('hydrates empty localStorage from Supabase snapshot URLs', () => {
    const pageId = overviewPageId();
    expect(evaluatePageConceptReadiness('ndxbook', pageId)).toBe('BLOCKED_NO_SOURCE_CAPTURE');

    mergeImplementationSnapshotIntoPageCapture(
      mockSnapshot('mobile', 'https://cdn.site00.com/storage/v1/object/public/x/mobile.webp'),
      pageId,
    );
    mergeImplementationSnapshotIntoPageCapture(
      mockSnapshot('desktop', 'https://cdn.site00.com/storage/v1/object/public/x/desktop.webp'),
      pageId,
    );

    expect(evaluatePageConceptReadiness('ndxbook', pageId)).toBe('READY_FOR_CREATIVE_INJECTION');
  });

  it('overview registry exposes desktop authority ref', () => {
    const pageId = overviewPageId();
    const bundle = resolvePageViewportBundle('ndxbook', pageId);
    expect(bundle?.coverage.desktop).toBe(true);
  });

  it('does not overwrite newer local capture with older snapshot', () => {
    const pageId = overviewPageId();
    appendPageCapture({
      captureId: 'local-new',
      projectId: 'ndxbook',
      pageId,
      screenId: 'overview',
      viewport: 'MOBILE',
      route: '/x',
      timestamp: '2099-01-01T00:00:00.000Z',
      buildVersion: null,
      artifactPath: 'https://cdn.site00.com/storage/v1/object/public/x/local.webp',
      createdBy: 'founder',
      source: 'IMPLEMENTATION_SNAPSHOT_API',
    });

    const merged = mergeImplementationSnapshotIntoPageCapture(
      {
        ...mockSnapshot('mobile', 'https://cdn.site00.com/storage/v1/object/public/x/old.webp'),
        capturedAt: '2020-01-01T00:00:00.000Z',
        snapshotId: 'old',
      },
      pageId,
    );

    expect(merged?.captureId).toBe('local-new');
  });
});
