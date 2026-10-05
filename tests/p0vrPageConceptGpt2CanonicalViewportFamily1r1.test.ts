/**
 * P0.VR.PAGE-CONCEPT-GPT2-CANONICAL-VIEWPORT-FAMILY1R1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildPageConceptGenerationPlan } from '../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import {
  PAGE_CONCEPT_CANONICAL_PIPELINE_ID,
  PAGE_CONCEPT_LEGACY_PIPELINE_ID,
  inferPageConceptPipelineLineage,
  pageConceptLegacyNbpEnabled,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCanonicalPipeline.js';
import {
  assertComposerPreFinalTargetSurface,
  assertGrokAssetTargetSurface,
  assertLiveWriteAllowed,
  assertOpusShellTargetSurface,
  liveWriteAllowed,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptTwinLiveFirewall.js';
import {
  mobileConceptArtifactId,
  resolveDesignTwinRoute,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';
import { validateLivePromotionPackage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLivePromotion.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import * as cgpt from '../api/_lib/site00PageConcept/generatePageCreativeInjection.js';
import * as gpt2 from '../api/_lib/site00PageConcept/generatePageGpt2AuthorityConcept.js';
import * as nbp from '../api/_lib/site00PageConcept/renderPageNbpJob.js';

const ROOT = join(import.meta.dirname, '..');
const PROJECT = 'ndxbook';

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

function seedCaptures(projectId: string, pageId: string) {
  const base = {
    projectId,
    pageId,
    screenId: 'overview',
    route: '/projects/design/ndxbook/overview',
    timestamp: new Date().toISOString(),
    buildVersion: 'vitest',
    createdBy: 'vitest',
    source: 'LOCAL_FALLBACK' as const,
  };
  appendPageCapture({
    ...base,
    captureId: 'cap-mobile-vitest',
    viewport: 'MOBILE',
    artifactPath: 'data:image/png;base64,aaaa',
  });
  appendPageCapture({
    ...base,
    captureId: 'cap-desktop-vitest',
    viewport: 'DESKTOP',
    artifactPath: 'data:image/png;base64,bbbb',
  });
}

describe('P0.VR.PAGE-CONCEPT-GPT2-CANONICAL-VIEWPORT-FAMILY1R1', () => {
  const prevLegacy = process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;

  afterEach(() => {
    if (prevLegacy === undefined) delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
    else process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP = prevLegacy;
    vi.restoreAllMocks();
  });

  it('dual-render test implementation removed from repo', () => {
    expect(read('api/_lib/site00PageConcept/executePageConceptGenerationRun.ts')).not.toContain(
      'executePageConceptDualRenderTest',
    );
    expect(() => read('shared/site00-design-workspace-production/pageConceptPipeline/pageConceptDualRenderTest.ts')).toThrow();
  });

  it('canonical plan: 1 CGPT, 3 GPT2 mobile, 0 NBP jobs by default', () => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
    const pageId = overviewPageId();
    seedCaptures(PROJECT, pageId);
    const plan = buildPageConceptGenerationPlan(PROJECT, pageId, { trustIncomingCaptures: true });
    expect(plan.cgptCalls).toBe(1);
    expect(plan.gpt2Calls).toBe(3);
    expect(plan.nbpJobs).toBe(0);
    expect(plan.pipelineLineage).toBe(PAGE_CONCEPT_CANONICAL_PIPELINE_ID);
  });

  it('orchestrator canonical: CGPT×1, GPT2 mobile×3, NBP×0', async () => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
    const pageId = overviewPageId();
    seedCaptures(PROJECT, pageId);
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const cgptSpy = vi.spyOn(cgpt, 'generatePageCreativeInjection');
    const gpt2Spy = vi.spyOn(gpt2, 'generatePageGpt2AuthorityConcept');
    const nbpSpy = vi.spyOn(nbp, 'renderPageNbpJob');

    const result = await runPageConceptGeneration({
      state,
      founderConfirmedSpend: true,
      mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
      desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
    });

    expect(cgptSpy).toHaveBeenCalledTimes(1);
    expect(gpt2Spy).not.toHaveBeenCalled();
    expect(nbpSpy).not.toHaveBeenCalled();
    expect(result.jobs).toHaveLength(3);
    expect(result.jobs.every((j) => j.provider === 'GPT2_MOBILE')).toBe(true);
    expect(result.pipelineSet.mobileConcepts).toHaveLength(3);
    expect(result.pipelineSet.pipelineLineage).toBe(PAGE_CONCEPT_CANONICAL_PIPELINE_ID);
    expect(result.pipelineSet.gpt2AuthorityConcept).toBeNull();
    expect(
      new Set(result.jobs.map((j) => j.artifactId)),
    ).toEqual(
      new Set([
        mobileConceptArtifactId('MOBILE_CONCEPT_A'),
        mobileConceptArtifactId('MOBILE_CONCEPT_B'),
        mobileConceptArtifactId('MOBILE_CONCEPT_C'),
      ]),
    );
  });

  it('legacy lineage inference preserves NBP runs', () => {
    expect(
      inferPageConceptPipelineLineage({
        generationJobs: [{ provider: 'NBP', artifactId: 'pcga-RENDITION_A-MOBILE' }],
      }),
    ).toBe(PAGE_CONCEPT_LEGACY_PIPELINE_ID);
  });

  it('twin/live firewall guards block live and non-twin targets', () => {
    expect(() => assertOpusShellTargetSurface('LIVE')).toThrow(/OPUS_SHELL_BLOCKED/);
    expect(() => assertComposerPreFinalTargetSurface('LIVE')).toThrow(/COMPOSER_IMPLEMENTATION_BLOCKED/);
    expect(() => assertGrokAssetTargetSurface('LIVE')).toThrow(/GROK_ASSET_BLOCKED/);
    expect(liveWriteAllowed({ founderLivePromotionApprovalId: 'x', explicitLivePromotionAction: false })).toBe(false);
    expect(() =>
      assertLiveWriteAllowed({ founderLivePromotionApprovalId: null, explicitLivePromotionAction: true }),
    ).toThrow(/LIVE_WRITE_BLOCKED/);
  });

  it('live promotion package requires approval + rollback metadata', () => {
    const ok = validateLivePromotionPackage({
      packageId: 'lpp-1',
      projectId: PROJECT,
      pageId: overviewPageId(),
      twinBuildId: 'tb-1',
      twinLivePromotionApprovalId: 'appr-1',
      liveRoute: '/live',
      twinRoute: resolveDesignTwinRoute('ndxbook', overviewPageId()),
      rollbackSnapshotId: 'rb-1',
      createdAt: new Date().toISOString(),
    });
    expect(ok.ok).toBe(true);
  });

  it('shell copy no longer promises 3 NBP / 6 viewport NBP outputs', () => {
    const shell = read('shared/site00-design-workspace-production/designPageConceptGeneratorShell.ts');
    expect(shell).toContain('3 GPT2');
    expect(shell).not.toContain('3 NBP');
    expect(shell).not.toContain('6 VIEWPORT');
    expect(shell).not.toContain('DUAL_RENDER');
  });

  it('legacy NBP orchestration only when env flag set', () => {
    process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP = 'true';
    expect(pageConceptLegacyNbpEnabled()).toBe(true);
    const pageId = overviewPageId();
    seedCaptures(PROJECT, pageId);
    const plan = buildPageConceptGenerationPlan(PROJECT, pageId, { trustIncomingCaptures: true });
    expect(plan.nbpJobs).toBe(6);
  });
});
