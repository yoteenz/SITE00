/**
 * P0.VR.PAGE-CONCEPT-CAPTURE-READINESS-UNIFICATION1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  appendPageCapture,
  resolveCurrentPageCapture,
} from '../shared/site00-design-workspace-production/designPageCapture.js';
import { resolveDesignPageIdentity } from '../shared/site00-design-workspace-production/designPageIdentity.js';
import {
  assertPageConceptEligibilityInvariants,
  buildPageConceptGenerationEligibility,
  pageConceptConfirmNoticeFromEligibility,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationEligibility.js';
import {
  assertPageConceptGenerationPackageParity,
  buildPageConceptGenerationPackageFingerprint,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationPackageParity.js';
import {
  isDisplayablePageConceptCapture,
  validatePageConceptSourceCaptures,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptSourceCaptureValidation.js';
import {
  evaluatePageConceptReadiness,
  pageConceptReadinessIsSourceCaptureBlocked,
  pageConceptSourceCaptureLines,
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
const DATA_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('P0.VR.PAGE-CONCEPT-CAPTURE-READINESS-UNIFICATION1', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
  });

  it('no captures → blocked after hydration', () => {
    const pageId = overviewPageId();
    const identity = resolveDesignPageIdentity({ projectSlug: 'ndxbook', pageId, screenId: 'overview' });
    const v = validatePageConceptSourceCaptures('ndxbook', identity.canonicalPageId);
    expect(v.allRequiredReady).toBe(false);
    expect(v.sourceCaptureBlockerCode).toBe('BLOCKED_NO_SOURCE_CAPTURE');
    const elig = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    expect(elig.canGenerate).toBe(false);
    expect(pageConceptReadinessIsSourceCaptureBlocked(elig.readiness)).toBe(true);
  });

  it('mobile only → desktop blocker copy', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z'));
    const elig = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    expect(elig.readiness).toBe('BLOCKED_NO_DESKTOP_CAPTURE');
    expect(elig.confirmNotice?.toLowerCase()).toContain('desktop');
  });

  it('desktop only → mobile blocker copy', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('DESKTOP', CDN_DESKTOP, pageId, 'd1', '2026-01-01T00:00:00.000Z'));
    const elig = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    expect(elig.readiness).toBe('BLOCKED_NO_MOBILE_CAPTURE');
    expect(elig.confirmNotice?.toLowerCase()).toContain('mobile');
  });

  it('both ready → no source blocker on eligibility', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z'));
    appendPageCapture(captureRecord('DESKTOP', CDN_DESKTOP, pageId, 'd1', '2026-01-01T00:00:00.000Z'));
    const elig = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    expect(elig.sourceCaptureValidation.allRequiredReady).toBe(true);
    expect(pageConceptReadinessIsSourceCaptureBlocked(elig.readiness)).toBe(false);
    expect(elig.confirmNotice).toBeNull();
    assertPageConceptEligibilityInvariants(elig);
  });

  it('accepts artifactUrl and artifactBase64', () => {
    const pageId = overviewPageId();
    const identity = resolveDesignPageIdentity({ projectSlug: 'ndxbook', pageId, screenId: 'overview' });
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm-url', '2026-01-02T00:00:00.000Z'));
    appendPageCapture(captureRecord('DESKTOP', DATA_PNG, pageId, 'd-b64', '2026-01-02T00:00:01.000Z'));
    const v = validatePageConceptSourceCaptures('ndxbook', identity.canonicalPageId);
    expect(v.mobile.ready && v.desktop.ready).toBe(true);
  });

  it('newest READY capture wins', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm-old', '2026-01-01T00:00:00.000Z'));
    appendPageCapture(captureRecord('MOBILE', DATA_PNG, pageId, 'm-new', '2026-01-03T00:00:00.000Z'));
    const { record } = resolveCurrentPageCapture('ndxbook', pageId, 'MOBILE');
    expect(record?.captureId).toBe('m-new');
  });

  it('non-displayable artifacts ignored; newest displayable wins', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', '', pageId, 'm-bad', '2026-01-05T00:00:00.000Z'));
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm-good', '2026-01-04T00:00:00.000Z'));
    const v = validatePageConceptSourceCaptures('ndxbook', pageId);
    expect(v.mobile.captureId).toBe('m-good');
  });

  it('writer and reader share canonical page identity', () => {
    const pageId = overviewPageId();
    const identity = resolveDesignPageIdentity({ projectSlug: 'ndxbook', pageId, screenId: 'overview' });
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z'));
    const resolved = resolveCurrentPageCapture('ndxbook', identity.registryPageId, 'MOBILE');
    expect(resolved.record?.pageId).toBe(identity.canonicalPageId);
  });

  it('source display and evaluate readiness agree when hydrated', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z'));
    appendPageCapture(captureRecord('DESKTOP', CDN_DESKTOP, pageId, 'd1', '2026-01-01T00:00:00.000Z'));
    const lines = pageConceptSourceCaptureLines('ndxbook', pageId);
    expect(lines.every((l) => l.state === 'READY')).toBe(true);
    expect(evaluatePageConceptReadiness('ndxbook', pageId)).toBe('READY_FOR_CREATIVE_INJECTION');
  });

  it('hydration checking suppresses source blocker', () => {
    const pageId = overviewPageId();
    const elig = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'checking',
    });
    expect(elig.blockerCode).toBeNull();
    expect(elig.confirmNotice).toBeNull();
    expect(elig.sourceCaptureLines[0]?.state).toBe('CHECKING');
    expect(elig.canGenerate).toBe(false);
  });

  it('READY + source blocker contradiction cannot pass invariants', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z'));
    appendPageCapture(captureRecord('DESKTOP', CDN_DESKTOP, pageId, 'd1', '2026-01-01T00:00:00.000Z'));
    const elig = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    const notice = pageConceptConfirmNoticeFromEligibility({
      ...elig,
      readiness: 'BLOCKED_NO_SOURCE_CAPTURE',
      blockedReason: 'Implementation source capture missing for Mobile and Desktop.',
    });
    expect(notice).toBeNull();
  });

  it('mobile/desktop package fingerprints match for same page', () => {
    const pageId = overviewPageId();
    appendPageCapture(captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z'));
    appendPageCapture(captureRecord('DESKTOP', CDN_DESKTOP, pageId, 'd1', '2026-01-01T00:00:00.000Z'));
    const a = buildPageConceptGenerationPackageFingerprint({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      route: '/projects/ndxbook',
    });
    const b = buildPageConceptGenerationPackageFingerprint({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      route: '/projects/ndxbook/overview',
    });
    assertPageConceptGenerationPackageParity(a, b);
    expect(a.mobileCaptureId).toBe('m1');
    expect(a.desktopCaptureId).toBe('d1');
  });

  it('isDisplayablePageConceptCapture matches validator ready flag', () => {
    const pageId = overviewPageId();
    const rec = captureRecord('MOBILE', CDN_MOBILE, pageId, 'm1', '2026-01-01T00:00:00.000Z');
    appendPageCapture(rec);
    const { record } = resolveCurrentPageCapture('ndxbook', pageId, 'MOBILE');
    expect(isDisplayablePageConceptCapture(record)).toBe(true);
  });
});
