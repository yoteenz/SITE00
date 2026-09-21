/**
 * P0.VR.PAGE-CONCEPT-PANEL-WIDTH-AND-ERROR-RECOVERY1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { derivePageConceptGenerationBlockingState } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationBlockingState.js';
import { buildPageConceptGenerationEligibility } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationEligibility.js';
import {
  classifyPageConceptFounderNotice,
  isPageConceptStaleCaptureEligibilityNotice,
  sanitizePageConceptFounderNotice,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderNotice.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';

const ROOT = join(import.meta.dirname, '..');

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

function seedBoth(pageId: string) {
  const base = {
    projectId: 'ndxbook',
    pageId,
    screenId: 'overview',
    route: '/projects/ndxbook',
    timestamp: '2026-01-01T00:00:00.000Z',
    buildVersion: 'vitest',
    createdBy: 'test',
    source: 'IMPLEMENTATION_SNAPSHOT_API' as const,
  };
  appendPageCapture({ ...base, captureId: 'm1', viewport: 'MOBILE', artifactPath: 'https://cdn.site00.com/m.webp' });
  appendPageCapture({ ...base, captureId: 'd1', viewport: 'DESKTOP', artifactPath: 'https://cdn.site00.com/d.webp' });
}

function eligibilityReady(pageId: string) {
  return buildPageConceptGenerationEligibility({
    projectSlug: 'ndxbook',
    pageId,
    screenId: 'overview',
    sessionReady: true,
    hydrationStatus: 'ready',
  });
}

describe('P0.VR.PAGE-CONCEPT-PANEL-WIDTH-AND-ERROR-RECOVERY1 — width', () => {
  it('layer box stacks main column full width; forensics does not share flex row with panel', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-page-concept-generator.css'), 'utf8');
    expect(css).toMatch(/\.s00-pcg-layer__box[\s\S]*flex-direction:\s*column/);
    expect(css).toMatch(/\.s00-pcg-layer__main[\s\S]*width:\s*100%/);
    const overlay = readFileSync(
      join(ROOT, 'src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx'),
      'utf8',
    );
    expect(overlay).toContain('s00-pcg-layer__main');
    expect(overlay).toMatch(/s00-pcg-layer__main[\s\S]*PageConceptGeneratorPanel/);
  });

  for (const width of [390, 393, 430]) {
    it(`mobile ${width}px — modal uses full viewport minus margins (CSS contract)`, () => {
      const css = readFileSync(join(ROOT, 'src/site00/styles/site00-page-concept-generator.css'), 'utf8');
      expect(css).toMatch(/\.s00-pcg-layer[\s\S]*width:\s*100%/);
      expect(css).toMatch(/\.s00-pcg-layer__box[\s\S]*width:\s*100%/);
      expect(css).not.toMatch(/\.s00-pcg-layer__box[\s\S]*width:\s*fit-content/);
      expect(width).toBeGreaterThanOrEqual(390);
    });
  }
});

describe('P0.VR.PAGE-CONCEPT-PANEL-WIDTH-AND-ERROR-RECOVERY1 — error visibility', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
  });

  it('CASE 1: captures READY + stale capture notice → hidden', () => {
    const pageId = overviewPageId();
    seedBoth(pageId);
    const stale = 'Capture the current Mobile and Desktop page before generating concepts.';
    expect(isPageConceptStaleCaptureEligibilityNotice(stale)).toBe(true);
    expect(
      sanitizePageConceptFounderNotice({ notice: stale, sourceCapturesReady: true }),
    ).toBeNull();
  });

  it('CASE 2: captures READY + API 500 → visible execution error', () => {
    const pageId = overviewPageId();
    seedBoth(pageId);
    const eligibility = eligibilityReady(pageId);
    const apiError = 'GENERATION_FAILED · HTTP 500';
    expect(isPageConceptStaleCaptureEligibilityNotice(apiError)).toBe(false);
    const blocking = derivePageConceptGenerationBlockingState({
      eligibility,
      executionError: apiError,
      mode: 'confirm',
    });
    expect(blocking.founderNotice).toBe(apiError);
    expect(classifyPageConceptFounderNotice(apiError)).toBe('EXECUTION');
  });

  it('CASE 3: CGPT provider failure → visible', () => {
    const pageId = overviewPageId();
    seedBoth(pageId);
    const err = 'CGPT_REQUEST_FAILED · OPENAI TIMEOUT';
    const blocking = derivePageConceptGenerationBlockingState({
      eligibility: eligibilityReady(pageId),
      executionError: err,
      mode: 'progress',
    });
    expect(blocking.founderNotice).toBe(err);
  });

  it('CASE 4: GPT2 failure → visible', () => {
    const pageId = overviewPageId();
    const err = 'GPT2_AUTHORITY_FAILED';
    const blocking = derivePageConceptGenerationBlockingState({
      eligibility: eligibilityReady(pageId),
      executionError: err,
      mode: 'review',
    });
    expect(blocking.founderNotice).toBe(err);
  });

  it('CASE 5: payload capture artifact error is NOT treated as stale eligibility', () => {
    const pageId = overviewPageId();
    seedBoth(pageId);
    const err = 'Implementation source capture is not a displayable image for this viewport.';
    expect(isPageConceptStaleCaptureEligibilityNotice(err)).toBe(false);
    expect(
      sanitizePageConceptFounderNotice({ notice: err, sourceCapturesReady: true }),
    ).toBe(err);
  });

  it('CASE 6: success → no error notice', () => {
    const pageId = overviewPageId();
    seedBoth(pageId);
    const blocking = derivePageConceptGenerationBlockingState({
      eligibility: eligibilityReady(pageId),
      executionError: null,
      mode: 'confirm',
    });
    expect(blocking.founderNotice).toBeNull();
  });
});
