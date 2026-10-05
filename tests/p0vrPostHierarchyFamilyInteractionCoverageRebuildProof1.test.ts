/**
 * P0.VR.POST-HIERARCHY-FAMILY-INTERACTION-COVERAGE-REBUILD-PROOF1
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import {
  assertPostHierarchyInteractionCoverageProof,
  buildPageFamilyInteractionCoverageProof,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageFamilyInteractionCoverageProof.js';
import { buildPageFamilyInteractionReviewPresentation } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageFamilyInteractionReviewPresentation.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';

const PROJECT = 'ndxbook';
const PRIOR_ONE_PAGE_TOTAL = 44;

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
    captureId: 'cap-mobile-post-ix',
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
    captureId: 'cap-desktop-post-ix',
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

describe('P0.VR.POST-HIERARCHY-FAMILY-INTERACTION-COVERAGE-REBUILD-PROOF1', () => {
  beforeEach(() => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('rebuilds interaction totals across all 7 canonical pages (not stale 44)', async () => {
    const state = await pipelineThroughViewportApproval();
    const blueprint = state.pipelineSet!.pageFamilyBlueprint!;
    const map = state.pipelineSet!.pageFamilyInteractionMap!;
    expect(blueprint.nodes.length).toBe(7);
    expect(blueprint.hierarchyReceipt.totalPageCount).toBe(7);
    expect(map.coverageMatrix.rows.length).toBe(7);

    const proof = buildPageFamilyInteractionCoverageProof({ map, blueprint });

    expect(proof.canonicalPageCount).toBe(7);
    expect(proof.interactionMapPageCount).toBe(7);
    expect(proof.receipt.totalInteractions).toBeGreaterThan(PRIOR_ONE_PAGE_TOTAL);
    expect(proof.receipt.totalInteractions).toBe(122);
    expect(proof.receipt.mappedInteractions).toBe(122);
    expect(proof.receipt.inheritedInteractions).toBe(78);
    expect(proof.receipt.pageSpecificInteractions).toBe(44);
    expect(proof.receipt.overriddenInteractions).toBe(0);
    expect(proof.receipt.unmappedInteractions).toBe(0);
    expect(proof.receipt.orphanedInteractions).toBe(0);
    expect(proof.staleOnePageTotalRejected).toBe(true);

    assertPostHierarchyInteractionCoverageProof(proof);
  });

  it('provides per-page breakdown with 100% coverage on each canonical page', async () => {
    const state = await pipelineThroughViewportApproval();
    expect(state.pipelineSet!.pageFamilyBlueprint!.nodes.length).toBe(7);
    const proof = buildPageFamilyInteractionCoverageProof({
      map: state.pipelineSet!.pageFamilyInteractionMap!,
      blueprint: state.pipelineSet!.pageFamilyBlueprint!,
    });
    const overview = proof.pageBreakdown.find((r) => r.pageKey === 'OVERVIEW')!;
    const campaign = proof.pageBreakdown.find((r) => r.pageKey === 'CAMPAIGN BOARD')!;
    expect(overview.total).toBe(44);
    expect(overview.pageSpecific).toBe(44);
    expect(overview.inherited).toBe(0);
    expect(campaign.total).toBe(13);
    expect(campaign.inherited).toBe(13);
    expect(proof.pageBreakdown.every((r) => r.coveragePercent === 100)).toBe(true);
  });

  it('resolves navigation and cross-page hierarchy transitions', async () => {
    const state = await pipelineThroughViewportApproval();
    const proof = buildPageFamilyInteractionCoverageProof({
      map: state.pipelineSet!.pageFamilyInteractionMap!,
      blueprint: state.pipelineSet!.pageFamilyBlueprint!,
    });
    expect(proof.deadNavigationTargets).toBe(0);
    expect(proof.totalNavigationActions).toBeGreaterThan(0);
    expect(proof.resolvedNavigationActions).toBe(proof.totalNavigationActions);
    expect(proof.crossPageTransitions.every((t) => t.resolved)).toBe(true);
    expect(
      proof.crossPageTransitions.some(
        (t) => t.fromPageName === 'Content Ops' && t.toPageName === 'Campaign Board',
      ),
    ).toBe(true);
  });

  it('Page System Review presentation matches rebuilt family-wide map totals', async () => {
    const state = await pipelineThroughViewportApproval();
    const map = state.pipelineSet!.pageFamilyInteractionMap!;
    const presentation = buildPageFamilyInteractionReviewPresentation({
      blueprint: state.pipelineSet!.pageFamilyBlueprint!,
      interactionMap: map,
    })!;
    expect(presentation.summary.total).toBe(122);
    expect(presentation.byPage.length).toBe(7);
    const psr = readFileSync(
      resolve('src/site00/components/designBench/opusDirect/DesignPageSystemReviewSection.tsx'),
      'utf8',
    );
    expect(psr).toContain('PAGE_FAMILY_INTERACTION_MAP');
    expect(psr).toContain('interactionPresentation');
  });

  it('build readiness passes post-hierarchy interaction coverage gates', async () => {
    const state = await pipelineThroughViewportApproval();
    const proof = buildPageFamilyInteractionCoverageProof({
      map: state.pipelineSet!.pageFamilyInteractionMap!,
      blueprint: state.pipelineSet!.pageFamilyBlueprint!,
    });
    expect(proof.pageFamilyBuildReadiness).toBe('READY');
    expect(proof.whyNoInteractionsAreInherited).toBeNull();
    expect(proof.experienceLinkedInteractionCount).toBeGreaterThan(0);
  });
});
