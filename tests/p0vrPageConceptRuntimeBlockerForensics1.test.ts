/**
 * P0.VR.PAGE-CONCEPT-RUNTIME-BLOCKER-FORENSICS1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import {
  derivePageConceptGenerationBlockingState,
  isPageConceptSourceCaptureRelatedNotice,
  sanitizePageConceptExecutionError,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationBlockingState.js';
import { buildPageConceptGenerationEligibility } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationEligibility.js';
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
  appendPageCapture({
    ...base,
    captureId: 'm1',
    viewport: 'MOBILE',
    artifactPath: 'https://cdn.site00.com/m.webp',
  });
  appendPageCapture({
    ...base,
    captureId: 'd1',
    viewport: 'DESKTOP',
    artifactPath: 'https://cdn.site00.com/d.webp',
  });
}

describe('P0.VR.PAGE-CONCEPT-RUNTIME-BLOCKER-FORENSICS1', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
  });

  it('confirm mode + canGenerate + stale capture error → no founder notice', () => {
    const pageId = overviewPageId();
    seedBoth(pageId);
    const eligibility = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    expect(eligibility.canGenerate).toBe(true);
    const stale = 'Capture the current Mobile and Desktop page before generating concepts.';
    expect(isPageConceptSourceCaptureRelatedNotice(stale)).toBe(true);
    const sanitized = sanitizePageConceptExecutionError(eligibility, stale);
    expect(sanitized).toBeNull();
    const blocking = derivePageConceptGenerationBlockingState({
      eligibility,
      executionError: stale,
      mode: 'confirm',
    });
    expect(blocking.founderNotice).toBeNull();
  });

  it('confirm mode + canGenerate + execution API error → founder notice visible', () => {
    const pageId = overviewPageId();
    seedBoth(pageId);
    const eligibility = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    const apiError = 'OPENAI API REQUEST FAILED';
    const blocking = derivePageConceptGenerationBlockingState({
      eligibility,
      executionError: apiError,
      mode: 'confirm',
    });
    expect(blocking.founderNotice).toBe(apiError);
  });

  it('regression: READY captures cannot render source-capture founder notice', () => {
    const pageId = overviewPageId();
    seedBoth(pageId);
    const eligibility = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    const blocking = derivePageConceptGenerationBlockingState({
      eligibility,
      executionError: null,
      mode: 'confirm',
    });
    expect(blocking.founderNotice).toBeNull();
    expect(eligibility.sourceCaptureLines.every((l) => l.state === 'READY')).toBe(true);
  });

  it('hook no longer falls back confirmNotice to stale error string', () => {
    const hook = readFileSync(
      join(import.meta.dirname, '../src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts'),
      'utf8',
    );
    expect(hook).toContain('derivePageConceptGenerationBlockingState');
    expect(hook).not.toMatch(/confirmNotice\s*=\s*[\s\S]*\?\?\s*error/);
    expect(hook).not.toContain('setError(generationEligibility.confirmNotice)');
  });

  it('red block renderer chain is panel notice from blockingState.founderNotice', () => {
    const overlay = readFileSync(
      join(
        import.meta.dirname,
        '../src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx',
      ),
      'utf8',
    );
    expect(overlay).toContain('blockingState?.founderNotice');
    expect(overlay).not.toMatch(/confirmNotice \?\? error/);
  });
});
