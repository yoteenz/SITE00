/**
 * P0.VR.PAGE-FAMILY-INTERACTION-MAP-AND-HANDOFF-GATE1
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { DESIGN_INTERACTION_REGISTRY } from '../shared/site00-design-workspace-production/designInteractionRegistry.js';
import {
  buildPageFamilyInteractionReceipt,
  markPageFamilyInteractionMapStale,
  validatePageFamilyInteractionMap,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyInteractionMap.js';
import { buildPageFamilyInteractionReviewPresentation } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageFamilyInteractionReviewPresentation.js';
import { buildOpusPageFamilyHandoff } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyBlueprint.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

async function pipelineThroughViewportApproval() {
  delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'false';
  process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
  const pageId = overviewPageId();
  appendPageCapture({
    projectId: PROJECT,
    pageId,
    screenId: 'overview',
    route: '/projects/design/ndxbook/overview',
    timestamp: new Date().toISOString(),
    buildVersion: 'vitest',
    createdBy: 'vitest',
    source: 'LOCAL_FALLBACK',
    captureId: 'cap-mobile-pfim',
    viewport: 'MOBILE',
    artifactPath: 'data:image/png;base64,aaaa',
  });
  appendPageCapture({
    projectId: PROJECT,
    pageId,
    screenId: 'overview',
    route: '/projects/design/ndxbook/overview',
    timestamp: new Date().toISOString(),
    buildVersion: 'vitest',
    createdBy: 'vitest',
    source: 'LOCAL_FALLBACK',
    captureId: 'cap-desktop-pfim',
    viewport: 'DESKTOP',
    artifactPath: 'data:image/png;base64,bbbb',
  });
  let state = loadPageConceptGenerationState(PROJECT, pageId);
  const gen = await runPageConceptGeneration({
    state,
    founderConfirmedSpend: true,
    mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
    desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
  });
  state = {
    ...state,
    pipelineSet: gen.pipelineSet,
    generationJobs: [...gen.jobs],
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
  };
  const conceptId = gen.pipelineSet!.mobileConcepts![0]!.conceptId;
  let r = await runPageConceptViewportFamilyAction(state, { type: 'selectMobileConcept', conceptId });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'generateExperienceExpression' });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveExperienceExpression' });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'runDesktopInterpretation', dryRun: true });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveViewportFamily' });
  return r.state;
}

async function approveBlueprintAndInteractionMap(state: Awaited<ReturnType<typeof pipelineThroughViewportApproval>>) {
  let r = await runPageConceptViewportFamilyAction(state, { type: 'approvePageFamilyBlueprint' });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'approvePageFamilyInteractionMap' });
  return r.state;
}

describe('P0.VR.PAGE-FAMILY-INTERACTION-MAP-AND-HANDOFF-GATE1', () => {
  beforeEach(() => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('compiles family-wide inventory excluding readonly decoration', async () => {
    const state = await pipelineThroughViewportApproval();
    const map = state.pipelineSet!.pageFamilyInteractionMap!;
    const readonlyIds = new Set(DESIGN_INTERACTION_REGISTRY.filter((e) => e.readonly).map((e) => e.id));
    expect(map.records.some((r) => readonlyIds.has(r.interactionId.split('::')[1] ?? ''))).toBe(false);
    expect(map.coverageMatrix.summary.totalInteractiveControls).toBeGreaterThan(0);
    expect(map.coverageMatrix.summary.unmappedControls).toBe(0);
  });

  it('blocks Opus handoff until interaction map is approved', async () => {
    let state = await pipelineThroughViewportApproval();
    let r = await runPageConceptViewportFamilyAction(state, { type: 'approvePageFamilyBlueprint' });
    expect(r.state.pipelineSet?.opusPageFamilyHandoff).toBeNull();
    expect(r.state.generationStatus).toBe('PAGE_FAMILY_INTERACTION_MAP_REVIEW');
    await expect(
      runPageConceptViewportFamilyAction(r.state, { type: 'markOpusRepresentativeShellsReady' }),
    ).rejects.toThrow(/OPUS_PAGE_FAMILY_HANDOFF_REQUIRED|PAGE_FAMILY_INTERACTION_MAP_APPROVAL_REQUIRED/);
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approvePageFamilyInteractionMap' });
    expect(r.state.pipelineSet?.opusPageFamilyHandoff).toBeTruthy();
    expect(r.state.pipelineSet?.opusPageFamilyHandoff?.pageFamilyInteractionMapId).toBe(
      r.state.pipelineSet?.pageFamilyInteractionMap?.mapId,
    );
  });

  it('requires 100% interaction coverage before approval', async () => {
    const state = await pipelineThroughViewportApproval();
    const blueprint = state.pipelineSet!.pageFamilyBlueprint!;
    await runPageConceptViewportFamilyAction(state, { type: 'approvePageFamilyBlueprint' });
    const badMap = {
      ...state.pipelineSet!.pageFamilyInteractionMap!,
      coverageMatrix: {
        ...state.pipelineSet!.pageFamilyInteractionMap!.coverageMatrix,
        summary: {
          ...state.pipelineSet!.pageFamilyInteractionMap!.coverageMatrix.summary,
          unmappedControls: 1,
          coveragePercent: 99,
        },
      },
    };
    const validation = validatePageFamilyInteractionMap(badMap, blueprint);
    expect(validation.ok).toBe(false);
    if (!validation.ok) expect(validation.code).toBe('PAGE_FAMILY_INTERACTION_MAP_INCOMPLETE');
  });

  it('navigation and mutation receipts pass for compiled map', async () => {
    const state = await pipelineThroughViewportApproval();
    const map = state.pipelineSet!.pageFamilyInteractionMap!;
    const receipt = buildPageFamilyInteractionReceipt(map);
    expect(receipt.navigationTargetCoverage).toBe('PASS');
    expect(receipt.stateMutationCoverage).toBe('PASS');
    expect(receipt.responsiveInteractionCoverage).toBe('PASS');
    expect(receipt.interactionCoveragePercent).toBe(100);
  });

  it('marks stale records when blueprint changes', async () => {
    const state = await pipelineThroughViewportApproval();
    const map = state.pipelineSet!.pageFamilyInteractionMap!;
    const stale = markPageFamilyInteractionMapStale(map, 'BLUEPRINT_CHANGED');
    expect(stale.approvedAt).toBeNull();
    expect(stale.staleAt).toBeTruthy();
    expect(stale.records.some((r) => r.status === 'STALE')).toBe(true);
  });

  it('twin package and handoff include interaction map id', async () => {
    let state = await approveBlueprintAndInteractionMap(await pipelineThroughViewportApproval());
    let r = await runPageConceptViewportFamilyAction(state, { type: 'markOpusRepresentativeShellsReady' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'lockViewportFamily' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'createTwinImplementationPackage' });
    const pkg = r.state.pipelineSet!.twinImplementationPackage!;
    expect(pkg.pageFamilyInteractionMapId).toBe(r.state.pipelineSet!.pageFamilyInteractionMap!.mapId);
  });

  it('PSR interaction cell and review surface are wired in UI', () => {
    const psr = readFileSync(
      resolve('src/site00/components/designBench/opusDirect/DesignPageSystemReviewSection.tsx'),
      'utf8',
    );
    const overlays = readFileSync(resolve('src/site00/components/designBench/opusDirect/TwinOpusDirectOverlays.tsx'), 'utf8');
    expect(psr).toContain('data-testid="page-system-review-interactions-cell"');
    expect(psr).toContain('openPageInteractionMapReview');
    expect(overlays).toContain('OV-PAGE-INTERACTION-MAP');
    expect(overlays).toContain('DesignPageFamilyInteractionMapReview');
  });

  it('presentation differentiates inherited vs page-specific counts', async () => {
    const state = await pipelineThroughViewportApproval();
    const presentation = buildPageFamilyInteractionReviewPresentation({
      blueprint: state.pipelineSet!.pageFamilyBlueprint!,
      interactionMap: state.pipelineSet!.pageFamilyInteractionMap!,
    })!;
    expect(presentation.summary.pageSpecific).toBeGreaterThan(0);
    expect(presentation.byPage.length).toBe(state.pipelineSet!.pageFamilyBlueprint!.nodes.length);
  });

  it('handoff builder rejects missing interaction approval', async () => {
    const state = await pipelineThroughViewportApproval();
    const blueprint = {
      ...state.pipelineSet!.pageFamilyBlueprint!,
      approvedAt: new Date().toISOString(),
    };
    const map = state.pipelineSet!.pageFamilyInteractionMap!;
    expect(() =>
      buildOpusPageFamilyHandoff({
        blueprint,
        viewportFamilyId: 'fam-test',
        interactionMap: map,
      }),
    ).toThrow(/PAGE_FAMILY_INTERACTION_MAP_APPROVAL_REQUIRED/);
  });
});
