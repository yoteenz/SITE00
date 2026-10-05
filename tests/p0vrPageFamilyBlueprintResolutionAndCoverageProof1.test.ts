/**
 * P0.VR.PAGE-FAMILY-BLUEPRINT-RESOLUTION-AND-COVERAGE-PROOF1
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { buildPageSystemReviewModel } from '../shared/site00-design-workspace-production/designPageSystemReview.js';
import {
  assertPageFamilyBlueprintCoverageComplete,
  buildOpusPageFamilyHandoff,
  buildPageFamilyCoverageReceipt,
  resolvePageFamilySkinStatus,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyBlueprint.js';
import { compilePageFamilyInteractionMap } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyInteractionMap.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
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
    captureId: 'cap-mobile-pfb-cov',
    viewport: 'MOBILE',
    artifactPath: 'data:image/png;base64,aaaa',
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

describe('P0.VR.PAGE-FAMILY-BLUEPRINT-RESOLUTION-AND-COVERAGE-PROOF1', () => {
  beforeEach(() => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('resolves numeric NDXBOOK overview family counts from Page System Review', async () => {
    const pageId = overviewPageId();
    const review = buildPageSystemReviewModel(PROJECT, pageId, 'MOBILE');
    const state = await pipelineThroughViewportApproval();
    const blueprint = state.pipelineSet!.pageFamilyBlueprint!;
    const receipt = buildPageFamilyCoverageReceipt(blueprint);

    expect(typeof receipt.CHILD_PAGE_COUNT).toBe('number');
    expect(typeof receipt.GRANDCHILD_PAGE_COUNT).toBe('number');
    expect(receipt.CHILD_PAGE_COUNT).toBe(review.children.length);
    expect(receipt.GRANDCHILD_PAGE_COUNT).toBe(review.grandchildren.length);
    expect(receipt.PARENT_PAGE_COUNT).toBe(1);
    expect(receipt.TOTAL_PAGE_COUNT).toBe(1 + review.children.length + review.grandchildren.length);
    expect(String(receipt.CHILD_PAGES)).not.toMatch(/from Page System Review/i);
    expect(receipt.UNDEFINED_PAGE_COUNT).toBe(0);
  });

  it('every known page appears in coverage matrix with archetype and inheritance', async () => {
    const state = await pipelineThroughViewportApproval();
    const blueprint = state.pipelineSet!.pageFamilyBlueprint!;
    expect(blueprint.coverageMatrix.rows.length).toBe(blueprint.nodes.length);
    for (const row of blueprint.coverageMatrix.rows) {
      expect(row.functionRole).toBeTruthy();
      expect(row.assignedArchetype).toBeTruthy();
      expect(row.inheritanceDirectiveId).toBeTruthy();
      expect(row.responsiveContractId).toBeTruthy();
      expect(row.coverageStatus).not.toBe('BLOCKED_UNDEFINED');
    }
  });

  it('skin is READY before founder approval and FINALIZED after', async () => {
    let state = await pipelineThroughViewportApproval();
    const contract = state.pipelineSet!.pageFamilySkinBehaviorContract!;
    expect(
      resolvePageFamilySkinStatus({
        skinContractApprovedAt: contract.approvedAt,
        blueprintApprovedAt: null,
      }),
    ).toBe('READY_FOR_FOUNDER_APPROVAL');

    const r = await runPageConceptViewportFamilyAction(state, { type: 'approvePageFamilyBlueprint' });
    expect(
      resolvePageFamilySkinStatus({
        skinContractApprovedAt: r.state.pipelineSet!.pageFamilySkinBehaviorContract!.approvedAt,
        blueprintApprovedAt: r.state.pipelineSet!.pageFamilyBlueprint!.approvedAt,
      }),
    ).toBe('FINALIZED');
  });

  it('blocks Opus handoff when coverage matrix is incomplete', async () => {
    const state = await pipelineThroughViewportApproval();
    const blueprint = {
      ...state.pipelineSet!.pageFamilyBlueprint!,
      approvedAt: new Date().toISOString(),
      coverageSummary: {
        ...state.pipelineSet!.pageFamilyBlueprint!.coverageSummary,
        undefinedPageCount: 1,
      },
    };
    const interactionMap = compilePageFamilyInteractionMap({
      blueprint,
      experienceContract: state.pipelineSet!.experienceExpressionContract,
    });
    expect(() =>
      buildOpusPageFamilyHandoff({
        blueprint,
        viewportFamilyId: 'fam-test',
        interactionMap: { ...interactionMap, approvedAt: new Date().toISOString() },
      }),
    ).toThrow(/PAGE_FAMILY_BLUEPRINT_INCOMPLETE|OPUS_PAGE_FAMILY_HANDOFF_INCOMPLETE/);
    blueprint.coverageSummary = {
      ...blueprint.coverageSummary,
      undefinedPageCount: 0,
    };
    expect(() => assertPageFamilyBlueprintCoverageComplete(blueprint)).not.toThrow();
  });

  it('Opus handoff reports 100% page coverage when blueprint approved', async () => {
    let state = await pipelineThroughViewportApproval();
    let r = await runPageConceptViewportFamilyAction(state, { type: 'approvePageFamilyBlueprint' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approvePageFamilyInteractionMap' });
    const handoff = r.state.pipelineSet!.opusPageFamilyHandoff!;
    expect(handoff.pageCoveragePercent).toBe(100);
    expect(handoff.undefinedPageCount).toBe(0);
    expect(handoff.handoffPreview.totalOpusShellsToCreate).toBeGreaterThan(0);
  });
});
