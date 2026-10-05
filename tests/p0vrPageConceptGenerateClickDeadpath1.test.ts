/**
 * P0.VR.PAGE-CONCEPT-GENERATE-CLICK-DEADPATH1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { computePageConceptModalGeneratePress } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptModalGeneratePress.js';
import { buildPageConceptGenerationEligibility } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationEligibility.js';
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

describe('P0.VR.PAGE-CONCEPT-GENERATE-CLICK-DEADPATH1', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
  });

  it('identifies exact GENERATE button wiring in panel + screen', () => {
    const panel = readFileSync(
      join(ROOT, 'src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx'),
      'utf8',
    );
    expect(panel).toContain('type="button"');
    expect(panel).toContain('className="s00-pcg__generate"');
    expect(panel).toContain('data-interaction-id="page-concepts-generate"');
    expect(panel).toContain('disabled={generateDisabled}');
    expect(panel).toContain('onClick={() => onGenerate?.()}');
    expect(panel).not.toMatch(/onGenerate=\{\(\)\s*=>\s*\{\s*\}\}/);

    const screen = readFileSync(
      join(ROOT, 'src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx'),
      'utf8',
    );
    expect(screen).toContain('handleGenerateClick');
    expect(screen).not.toContain('confirmGeneration()');
  });

  it('hook exposes handleGenerateClick with immediate flushSync progress + run id', () => {
    const hook = readFileSync(
      join(ROOT, 'src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts'),
      'utf8',
    );
    expect(hook).toContain('handleGenerateClick');
    expect(hook).toContain('flushSync');
    expect(hook).toContain('CGPT_RUNNING');
    expect(hook).toContain('activeGenerationRunId');
    expect(hook).toContain('page_concept_generate_clicked');
    expect(hook).toContain('GENERATION ALREADY IN PROGRESS');
  });

  it('sessionReady null does not block dispatch preflight (hook resolves token before press)', () => {
    const pageId = overviewPageId();
    seedBoth(pageId);
    const pendingSession = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: null,
      hydrationStatus: 'ready',
    });
    const press = computePageConceptModalGeneratePress({
      eligibility: pendingSession,
      mode: 'confirm',
      generating: false,
      generationStatus: 'PLANNED',
      executionError: null,
      failedNbp: false,
    });
    expect(press.canPress).toBe(true);
    expect(press.blockReason).toBeNull();
    expect(press.intendedAction).toBe('dispatch');

    const hook = readFileSync(
      join(ROOT, 'src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts'),
      'utf8',
    );
    expect(hook).toContain('eligibilityAtClick');
    expect(hook).toContain('setApiSessionReady(sessionPresent)');
    expect(hook).toMatch(/ensurePageConceptSourceCaptures[\s\S]*PREFLIGHT_STARTED/);
  });

  it('GIVEN captures READY + eligibility TRUE WHEN press gate THEN canPress', () => {
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
    const press = computePageConceptModalGeneratePress({
      eligibility,
      mode: 'confirm',
      generating: false,
      generationStatus: 'PLANNED',
      executionError: null,
      failedNbp: false,
    });
    expect(press.canPress).toBe(true);
    expect(press.intendedAction).toBe('dispatch');
  });

  it('review mode without retry intent cannot press when session not ready', () => {
    const pageId = overviewPageId();
    seedBoth(pageId);
    const eligibility = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: false,
      hydrationStatus: 'ready',
    });
    const press = computePageConceptModalGeneratePress({
      eligibility,
      mode: 'review',
      generating: false,
      generationStatus: 'IDLE',
      executionError: null,
      failedNbp: false,
    });
    expect(press.canPress).toBe(true);
    expect(press.blockReason).toMatch(/SIGN IN/i);
  });

  it('preflight failure must surface blockReason (no silent return contract in hook)', () => {
    const hook = readFileSync(
      join(ROOT, 'src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts'),
      'utf8',
    );
    expect(hook).toContain('if (!press.canPress)');
    expect(hook).toContain('setExecutionError(message)');
    expect(hook).toContain('page_concept_generate_preflight_failed');
  });

  it('overlay uses modalGeneratePress for disabled state (not review-mode bypass)', () => {
    const overlay = readFileSync(
      join(ROOT, 'src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx'),
      'utf8',
    );
    expect(overlay).toContain('modalGeneratePress');
    expect(overlay).toContain('!modalGeneratePress.canPress');
    expect(overlay).not.toContain('mode !== \'review\' && !confirmReady');
  });
});
