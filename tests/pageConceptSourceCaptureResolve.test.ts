import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appendPageCapture, getPageConceptSourceCaptures } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { evaluatePageConceptReadiness } from '../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';

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

describe('page concept source capture resolution', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
  });

  it('resolves legacy pageId alias to canonical overview captures', () => {
    const canonical = listSiteDesignPagesForProject('ndxbook').find((p) => p.screenId === 'overview')!.pageId;
    const legacy = 'ndxbook:overview';
    expect(canonical).not.toBe(legacy);

    const base = {
      projectId: 'ndxbook',
      screenId: 'overview',
      route: '/projects/ndxbook/overview',
      timestamp: new Date().toISOString(),
      buildVersion: 't',
      createdBy: 't',
      source: 'LOCAL_FALLBACK' as const,
    };
    appendPageCapture({
      ...base,
      pageId: legacy,
      captureId: 'm-legacy',
      viewport: 'MOBILE',
      artifactPath: 'data:image/png;base64,aaaa',
    });
    appendPageCapture({
      ...base,
      pageId: legacy,
      captureId: 'd-legacy',
      viewport: 'DESKTOP',
      artifactPath: 'data:image/png;base64,bbbb',
    });

    const resolved = getPageConceptSourceCaptures('ndxbook', canonical);
    expect(resolved.mobile?.captureId).toBe('m-legacy');
    expect(resolved.desktop?.captureId).toBe('d-legacy');
    expect(evaluatePageConceptReadiness('ndxbook', canonical)).toBe('READY_FOR_CREATIVE_INJECTION');
  });
});
