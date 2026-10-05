/**
 * P0.VR.NDXBOOK-PAGE-FAMILY-HIERARCHY-DISCOVERY-AND-INGESTION-FIX1
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { buildPageSystemReviewModel } from '../shared/site00-design-workspace-production/designPageSystemReview.js';
import {
  discoverProjectPageFamilyLayout,
  type PageFamilyHierarchyReceipt,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/projectPageFamilyHierarchyDiscovery.js';
import { buildPageFamilyCoverageReceipt } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyBlueprint.js';
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
    captureId: 'cap-mobile-hier',
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
    captureId: 'cap-desktop-hier',
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

describe('P0.VR.NDXBOOK-PAGE-FAMILY-HIERARCHY-DISCOVERY-FIX1', () => {
  beforeEach(() => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('discovers multiple canonical NDXBOOK pages (not current route only)', () => {
    const layout = discoverProjectPageFamilyLayout(PROJECT, overviewPageId());
    expect(layout.discoveryStatus).toBe('RESOLVED');
    expect(layout.receipt.totalPageCount).toBe(7);
    expect(layout.receipt.childPageCount).toBe(5);
    expect(layout.receipt.grandchildPageCount).toBe(1);
    expect(layout.receipt.childPages.length).toBeGreaterThan(0);
    expect(layout.receipt.grandchildPages.some((g) => g.includes('Campaign Board'))).toBe(true);
  });

  it('Page System Review and Blueprint share one tree', async () => {
    const state = await pipelineThroughViewportApproval();
    const pageId = overviewPageId();
    const review = buildPageSystemReviewModel(PROJECT, pageId, 'MOBILE');
    const blueprint = state.pipelineSet!.pageFamilyBlueprint!;
    expect(review.directChildCount).toBe(blueprint.childCount);
    expect(review.grandchildCount).toBe(blueprint.grandchildCount);
    expect(blueprint.hierarchyReceipt.hierarchyDiscoveryStatus).toBe('RESOLVED');
  });

  it('blocks false 100% when hierarchy unresolved would have been 1/1', () => {
    const layout = discoverProjectPageFamilyLayout(PROJECT, overviewPageId());
    expect(layout.receipt.sourceCountReconciled).toBe('PASS');
    expect(layout.receipt.blockedReason).toBeNull();
    expect(layout.receipt.childPageCount).not.toBe(0);
  });

  it('receipt enumerates child and grandchild page names', () => {
    const receipt: PageFamilyHierarchyReceipt = discoverProjectPageFamilyLayout(
      PROJECT,
      overviewPageId(),
    ).receipt;
    expect(receipt.childPages).toContain('Content Ops');
    expect(receipt.grandchildPages.some((line) => line.includes('Content Ops'))).toBe(true);
  });

  it('coverage receipt uses full canonical page totals after viewport approval', async () => {
    const state = await pipelineThroughViewportApproval();
    const blueprint = state.pipelineSet!.pageFamilyBlueprint!;
    const coverage = buildPageFamilyCoverageReceipt(blueprint);
    expect(coverage.TOTAL_PAGE_COUNT).toBeGreaterThan(1);
    expect(coverage.CHILD_PAGE_COUNT).toBeGreaterThan(0);
    expect(blueprint.hierarchyReceipt.hierarchyDiscoveryStatus).toBe('RESOLVED');
  });

  it('interaction map spans all blueprint nodes', async () => {
    const state = await pipelineThroughViewportApproval();
    const blueprint = state.pipelineSet!.pageFamilyBlueprint!;
    const map = state.pipelineSet!.pageFamilyInteractionMap!;
    const pageIds = new Set(blueprint.nodes.map((n) => n.pageId));
    const mapPages = new Set(map.records.map((r) => r.pageId));
    for (const id of pageIds) {
      expect(mapPages.has(id)).toBe(true);
    }
  });
});
