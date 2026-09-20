/**
 * P0.VR.PAGE-CONCEPT-IMPOSSIBLE-BLOCKER-ERADICATION1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { buildPageConceptGenerationEligibility } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationEligibility.js';
import {
  pageConceptDomContradictionProbe,
  sanitizePageConceptFounderNotice,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderNotice.js';
import {
  loadPageConceptGenerationState,
  PAGE_CONCEPT_GENERATION_STORAGE_PREFIX,
  sanitizePersistedPageConceptGenerationPartial,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { pageConceptGeneratorNoticeLines } from '../shared/site00-design-workspace-production/designPageConceptGeneratorShell.js';
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

describe('P0.VR.PAGE-CONCEPT-IMPOSSIBLE-BLOCKER-ERADICATION1', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
  });

  it('screenshot regression: READY/READY + legacy notice → no founder notice', () => {
    const pageId = overviewPageId();
    appendPageCapture({
      captureId: 'm1',
      projectId: 'ndxbook',
      pageId,
      screenId: 'overview',
      viewport: 'MOBILE',
      route: '/projects/ndxbook',
      timestamp: '2026-01-01T00:00:00.000Z',
      buildVersion: 't',
      artifactPath: 'https://cdn.site00.com/m.webp',
      createdBy: 't',
      source: 'IMPLEMENTATION_SNAPSHOT_API',
    });
    appendPageCapture({
      captureId: 'd1',
      projectId: 'ndxbook',
      pageId,
      screenId: 'overview',
      viewport: 'DESKTOP',
      route: '/projects/ndxbook',
      timestamp: '2026-01-01T00:00:00.000Z',
      buildVersion: 't',
      artifactPath: 'https://cdn.site00.com/d.webp',
      createdBy: 't',
      source: 'IMPLEMENTATION_SNAPSHOT_API',
    });
    const eligibility = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    const legacy = 'Capture the current Mobile and Desktop page before generating concepts.';
    const sanitized = sanitizePageConceptFounderNotice({
      notice: legacy,
      sourceCapturesReady: true,
      generationEligibility: eligibility,
    });
    expect(sanitized).toBeNull();
  });

  it('persisted lastFailure BLOCKED_NO_SOURCE_CAPTURE is stripped on load', () => {
    const pageId = overviewPageId();
    localStorage.setItem(
      `site00:page-concept-generation:v1:ndxbook:${pageId}`,
      JSON.stringify({
        targetType: 'PAGE',
        projectId: 'ndxbook',
        pageId,
        generationStatus: 'IDLE',
        lastFailure: { message: 'BLOCKED_NO_SOURCE_CAPTURE', at: '2020-01-01T00:00:00.000Z' },
        generationJobs: [],
        history: [],
      }),
    );
    const loaded = loadPageConceptGenerationState('ndxbook', pageId);
    expect(loaded.lastFailure).toBeNull();
    expect(localStorage.getItem(`${PAGE_CONCEPT_GENERATION_STORAGE_PREFIX}ndxbook:${pageId}`)).toBeTruthy();
  });

  it('panel render path: sanitized notice is null before pageConceptGeneratorNoticeLines', () => {
    const notice = sanitizePageConceptFounderNotice({
      notice: 'Capture the current Mobile and Desktop page before generating concepts.',
      sourceCapturesReady: true,
    });
    expect(notice).toBeNull();
    const panel = readFileSync(
      join(import.meta.dirname, '../src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx'),
      'utf8',
    );
    expect(panel).toContain('sanitizePageConceptFounderNotice');
    expect(panel).toContain('founderNotice ?');
  });

  it('dom contradiction probe fails on impossible combo', () => {
    const hit = pageConceptDomContradictionProbe({
      sourceCaptureLines: [
        { viewport: 'MOBILE', label: 'MOBILE CAPTURE', state: 'READY' },
        { viewport: 'DESKTOP', label: 'DESKTOP CAPTURE', state: 'READY' },
      ],
      renderedText: 'BLOCKED · SOURCE CAPTURE REQUIRED CAPTURE THE CURRENT MOBILE',
    });
    expect(hit).toBe('SOURCE CAPTURE REQUIRED');
  });

  it('formatted headline alone is capture-related for sanitize', () => {
    const lines = pageConceptGeneratorNoticeLines(
      'Capture the current Mobile and Desktop page before generating concepts.',
    );
    expect(lines.headline).toContain('SOURCE CAPTURE REQUIRED');
    expect(
      sanitizePageConceptFounderNotice({
        notice: lines.headline,
        sourceCapturesReady: true,
      }),
    ).toBeNull();
  });

  it('persisted partial sanitizer drops capture eligibility failures only', () => {
    const kept = sanitizePersistedPageConceptGenerationPartial({
      lastFailure: { message: 'CGPT_TIMEOUT', at: '2026-01-01T00:00:00.000Z' },
    });
    expect(kept.lastFailure?.message).toBe('CGPT_TIMEOUT');
    const dropped = sanitizePersistedPageConceptGenerationPartial({
      lastFailure: { message: 'BLOCKED_NO_SOURCE_CAPTURE', at: '2026-01-01T00:00:00.000Z' },
    });
    expect(dropped.lastFailure).toBeNull();
  });

  it('overlay uses sanitize without confirmNotice fallback', () => {
    const overlay = readFileSync(
      join(import.meta.dirname, '../src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx'),
      'utf8',
    );
    expect(overlay).toContain('sanitizePageConceptFounderNotice');
    expect(overlay).not.toMatch(/confirmNotice \?\? error/);
  });
});
