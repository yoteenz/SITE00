import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { resolvePageViewportBundle } from '../shared/site00-design-workspace-production/designProjectBinding/pageViewportAuthority.js';
import { pageConceptSourceCaptureBlockMessage } from '../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';

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

describe('page concept capture preflight UX', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('window', { localStorage, dispatchEvent: () => undefined });
  });

  it('viewport band shows CAPTURE when only design authority exists (mobile only impl capture)', () => {
    const pageId = overviewPageId();
    appendPageCapture({
      captureId: 'm-only',
      projectId: 'ndxbook',
      pageId,
      screenId: 'overview',
      viewport: 'MOBILE',
      route: '/projects/ndxbook/overview',
      timestamp: new Date().toISOString(),
      buildVersion: null,
      artifactPath: 'https://cdn.site00.com/storage/v1/object/public/x/mobile.webp',
      createdBy: 'test',
      source: 'IMPLEMENTATION_SNAPSHOT_API',
    });

    const bundle = resolvePageViewportBundle('ndxbook', pageId);
    const mobile = bundle?.controls.find((c) => c.viewport === 'MOBILE');
    const desktop = bundle?.controls.find((c) => c.viewport === 'DESKTOP');
    expect(mobile?.statusShort).toBe('OK');
    expect(desktop?.statusShort).toBe('CAPTURE');
    expect(pageConceptSourceCaptureBlockMessage('ndxbook', pageId)).toContain('Desktop');
  });
});
