/**
 * P0.VR.PAGE-CONCEPT-GENERATION-GATE-SINGLE-SOURCE1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { buildPagePipelineControllerModel } from '../shared/site00-design-workspace-production/designPagePipelineController.js';
import {
  buildPageConceptGenerationEligibility,
  pageConceptGenerationGateFromEligibility,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationEligibility.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import type { DesignProductionState } from '../shared/site00-design-workspace-production/types.js';

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

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject('ndxbook').find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

function capture(viewport: 'MOBILE' | 'DESKTOP', pageId: string, id: string) {
  appendPageCapture({
    captureId: id,
    projectId: 'ndxbook',
    pageId,
    screenId: 'overview',
    viewport,
    route: '/projects/ndxbook',
    timestamp: '2026-01-01T00:00:00.000Z',
    buildVersion: 'vitest',
    artifactPath: `https://cdn.site00.com/${id}.webp`,
    createdBy: 'test',
    source: 'IMPLEMENTATION_SNAPSHOT_API',
  });
}

const emptyProduction = {} as DesignProductionState;

describe('P0.VR.PAGE-CONCEPT-GENERATION-GATE-SINGLE-SOURCE1', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
  });

  it('both captures ready → gate enables CTA, no stale capture copy', () => {
    const pageId = overviewPageId();
    capture('MOBILE', pageId, 'm1');
    capture('DESKTOP', pageId, 'd1');
    const eligibility = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    const gate = pageConceptGenerationGateFromEligibility(eligibility, false);
    expect(gate.canPressGenerate).toBe(true);
    expect(gate.blockerMessage).toBeNull();
    expect(gate.blockerMessage ?? '').not.toMatch(/capture the current mobile and desktop/i);
  });

  it('mobile only → desktop blocker on gate', () => {
    const pageId = overviewPageId();
    capture('MOBILE', pageId, 'm1');
    const eligibility = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    const gate = pageConceptGenerationGateFromEligibility(eligibility, false);
    expect(gate.canPressGenerate).toBe(false);
    expect(gate.blockerMessage?.toLowerCase()).toContain('desktop');
  });

  it('pipeline next action matches eligibility when concepts missing', () => {
    const pageId = overviewPageId();
    capture('MOBILE', pageId, 'm1');
    capture('DESKTOP', pageId, 'd1');
    const eligibility = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    const pipeline = buildPagePipelineControllerModel({
      projectId: 'ndxbook',
      pageId,
      production: emptyProduction,
      twinRouteReachable: null,
      pageConceptGeneration: eligibility,
    });
    expect(pipeline.currentStageId).toBe('page_concepts');
    expect(pipeline.nextAction.handler).toBe('generatePageConcepts');
    expect(pipeline.nextAction.disabledReason).toBeNull();
  });

  it('pipeline disables generate when gate blocked', () => {
    const pageId = overviewPageId();
    const eligibility = buildPageConceptGenerationEligibility({
      projectSlug: 'ndxbook',
      pageId,
      screenId: 'overview',
      sessionReady: true,
      hydrationStatus: 'ready',
    });
    const pipeline = buildPagePipelineControllerModel({
      projectId: 'ndxbook',
      pageId,
      production: emptyProduction,
      twinRouteReachable: null,
      pageConceptGeneration: eligibility,
    });
    expect(pipeline.nextAction.disabledReason).toMatch(/capture/i);
    expect(pipeline.nextAction.buttonLabel).toBe('GENERATE PAGE CONCEPTS');
  });

  it('workspace and gallery views consume pageConceptGenerationGate only', () => {
    const workspace = read('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('pageConceptGenerationGateFromEligibility');
    expect(workspace).not.toContain('galleryGenerateDisabled');
    const canonical = read('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
    expect(canonical).toContain('pageConceptGenerationGate.canPressGenerate');
    expect(canonical).not.toContain('galleryGenerateDisabled');
  });
});
