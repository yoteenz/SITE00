/**
 * P0.VR.PAGE-CONCEPT-SOURCE-CAPTURE-RESOLUTION-FIX1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  appendPageCapture,
  DESIGN_PAGE_CAPTURE_UPDATED_EVENT,
  resolveCurrentPageCapture,
} from '../shared/site00-design-workspace-production/designPageCapture.js';
import {
  designPageCaptureEventMatches,
  designPageIdsEquivalent,
  resolveDesignPageIdentity,
} from '../shared/site00-design-workspace-production/designPageIdentity.js';
import { resolvePageConceptSourceCaptureRefs } from '../shared/site00-design-workspace-production/pageConceptPipeline/sourceCaptureRefs.js';
import {
  evaluatePageConceptReadiness,
  pageConceptCaptureConfirmBlockMessage,
  pageConceptSourceCaptureBlockMessage,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';

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

function captureRecord(
  viewport: 'MOBILE' | 'DESKTOP',
  artifactPath: string,
  pageId: string,
  captureId: string,
  timestamp: string,
): Parameters<typeof appendPageCapture>[0] {
  return {
    captureId,
    projectId: 'ndxbook',
    pageId,
    screenId: 'overview',
    viewport,
    route: '/projects/ndxbook',
    timestamp,
    buildVersion: 'vitest',
    artifactPath,
    createdBy: 'test',
    source: 'IMPLEMENTATION_SNAPSHOT_API',
  };
}

const CDN_MOBILE = 'https://cdn.site00.com/storage/v1/object/public/x/mobile.webp';
const CDN_DESKTOP = 'https://cdn.site00.com/storage/v1/object/public/x/desktop.webp';
const BAD_ROUTE = '/projects/ndxbook/overview';

describe('P0.VR.PAGE-CONCEPT-SOURCE-CAPTURE-RESOLUTION-FIX1', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('window', { localStorage, dispatchEvent: vi.fn() });
  });

  it('1. no captures → blocked (both missing)', () => {
    const pageId = overviewPageId();
    expect(evaluatePageConceptReadiness('ndxbook', pageId)).toBe('BLOCKED_NO_SOURCE_CAPTURE');
  });

  it('2. mobile only → desktop blocked (both required)', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-02T00:00:00.000Z'));
    expect(evaluatePageConceptReadiness('ndxbook', pageId)).toBe('BLOCKED_NO_DESKTOP_CAPTURE');
  });

  it('3. mobile only message names desktop explicitly', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-02T00:00:00.000Z'));
    expect(pageConceptSourceCaptureBlockMessage('ndxbook', pageId)).toMatch(/Desktop/i);
    expect(pageConceptCaptureConfirmBlockMessage('ndxbook', pageId)).not.toContain('BLOCKED_NO');
  });

  it('4. desktop only → mobile blocked', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('DESKTOP', CDN_DESKTOP, pageId, 'd1', '2026-01-02T00:00:00.000Z'));
    expect(evaluatePageConceptReadiness('ndxbook', pageId)).toBe('BLOCKED_NO_MOBILE_CAPTURE');
  });

  it('5. both ready → generation ready', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z'));
    appendPageCapture(captureRecord('DESKTOP', CDN_DESKTOP, pageId, 'd1', '2026-01-01T00:00:00.000Z'));
    expect(evaluatePageConceptReadiness('ndxbook', pageId)).toBe('READY_FOR_CREATIVE_INJECTION');
  });

  it('6. newest displayable capture wins', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'old', '2026-01-01T00:00:00.000Z'));
    appendPageCapture(captureRecord('MOBILE', CDN_DESKTOP, pageId, 'new', '2026-01-03T00:00:00.000Z'));
    expect(resolveCurrentPageCapture('ndxbook', pageId, 'MOBILE').record?.captureId).toBe('new');
  });

  it('7. failed route artifact ignored', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', BAD_ROUTE, pageId, 'bad', '2026-01-04T00:00:00.000Z'));
    expect(resolveCurrentPageCapture('ndxbook', pageId, 'MOBILE').ready).toBe(false);
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'good', '2026-01-05T00:00:00.000Z'));
    expect(resolveCurrentPageCapture('ndxbook', pageId, 'MOBILE').record?.captureId).toBe('good');
  });

  it('8. older bad capture in history does not block newer good latest', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', BAD_ROUTE, pageId, 'bad', '2026-01-01T00:00:00.000Z'));
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'good', '2026-01-02T00:00:00.000Z'));
    expect(evaluatePageConceptReadiness('ndxbook', pageId)).toBe('BLOCKED_NO_DESKTOP_CAPTURE');
  });

  it('9. writer and reader share canonical page identity', () => {
    const pageId = overviewPageId();
    const identity = resolveDesignPageIdentity({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      route: '/projects/ndxbook',
    });
    expect(designPageIdsEquivalent('ndxbook', pageId, identity.canonicalPageId)).toBe(true);
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z'));
    expect(resolveCurrentPageCapture('ndxbook', identity.registryPageId, 'MOBILE').ready).toBe(true);
    expect(resolveCurrentPageCapture('ndxbook', identity.canonicalPageId, 'MOBILE').ready).toBe(true);
  });

  it('10. source refs include artifact paths for API package', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z'));
    appendPageCapture(captureRecord('DESKTOP', CDN_DESKTOP, pageId, 'd1', '2026-01-01T00:00:00.000Z'));
    const refs = resolvePageConceptSourceCaptureRefs('ndxbook', pageId);
    expect(refs.mobile?.artifactPath).toBe(CDN_MOBILE);
    expect(refs.desktop?.artifactPath).toBe(CDN_DESKTOP);
    expect(refs.mobile?.captureId).toBe('m1');
  });

  it('11. capture event matches registry page when bucket uses canonical id', () => {
    const pageId = overviewPageId();
    const identity = resolveDesignPageIdentity({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
    });
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z'));
    expect(
      designPageCaptureEventMatches('ndxbook', pageId, {
        projectId: 'ndxbook',
        pageId: identity.canonicalPageId,
      }),
    ).toBe(true);
  });

  it('12. hook listens with canonical-aware matcher (static)', () => {
    const hook = readFileSync(
      join(import.meta.dirname, '../src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts'),
      'utf8',
    );
    expect(hook).toContain('designPageCaptureEventMatches');
    expect(hook).toContain('DESIGN_PAGE_CAPTURE_UPDATED_EVENT');
  });

  it('13. no generic blocked enum in founder confirm copy when viewport known', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z'));
    const msg = pageConceptCaptureConfirmBlockMessage('ndxbook', pageId);
    expect(msg).not.toMatch(/^BLOCKED_/);
    expect(msg).toMatch(/Desktop/i);
  });
});
