/**
 * P0.VR.EXPANDED-NAV-HIERARCHY-REFINEMENT1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as falExec from '../api/_lib/site00PageConcept/executePageConceptExperienceExpressionFal.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { buildExpandedNavHierarchyRefinementReceipt } from '../shared/site00-design-workspace-production/pageConceptPipeline/expandedNavHierarchyRefinementReceipt.js';
import {
  buildMenuExpandedNavHierarchyRefinementPromptBlock,
  buildNdxbookOverviewExpandedNavHierarchy,
  validateExpandedNavHierarchyManifestStructure,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/ndxbookExpandedNavHierarchy.js';
import { buildNdxbookOverviewExperienceContentManifests } from '../shared/site00-design-workspace-production/pageConceptPipeline/ndxbookExperienceContentManifest.js';
import { canonicalContentPromptBlock } from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceContentManifest.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

async function stateAfterMobileConfirmed() {
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
    captureId: 'cap-nav-hierarchy',
    viewport: 'MOBILE',
    artifactPath: 'data:image/png;base64,aaaa',
  });
  let state = loadPageConceptGenerationState(PROJECT, pageId);
  const result = await runPageConceptGeneration({
    state,
    founderConfirmedSpend: true,
    mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
    desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
  });
  state = {
    ...state,
    pipelineSet: result.pipelineSet,
    generationJobs: [...result.jobs],
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
  };
  const conceptId = result.pipelineSet!.mobileConcepts![0]!.conceptId;
  let r = await runPageConceptViewportFamilyAction(state, { type: 'selectMobileConcept', conceptId });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
  return r;
}

describe('P0.VR.EXPANDED-NAV-HIERARCHY-REFINEMENT1', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds canonical expanded nav hierarchy with Campaign Board nested under Content Ops', () => {
    const pageId = overviewPageId();
    const hierarchy = buildNdxbookOverviewExpandedNavHierarchy(PROJECT, pageId);
    expect(hierarchy.hierarchyLines.some((l) => l.includes('OVERVIEW'))).toBe(true);
    expect(hierarchy.hierarchyLines.some((l) => /CONTENT OPS/.test(l) && !l.includes('└'))).toBe(true);
    expect(hierarchy.hierarchyLines.some((l) => l.includes('└') && l.includes('CAMPAIGN BOARD'))).toBe(true);
    const validation = validateExpandedNavHierarchyManifestStructure(hierarchy);
    expect(validation.contentOpsParentRelationship).toBe('PASS');
    expect(validation.campaignBoardNested).toBe('PASS');
    expect(validation.campaignBoardNotTopLevel).toBe('PASS');
  });

  it('menu content manifest includes hierarchy lines (not flat siblings only)', () => {
    const pageId = overviewPageId();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const manifests = buildNdxbookOverviewExperienceContentManifests({
      projectId: PROJECT,
      pageId,
      functionContract: state.functionContract!,
    });
    const menu = manifests.find((m) => m.stateId === 'menu')!;
    expect(menu.navigationHierarchyLines?.length).toBeGreaterThan(6);
    const block = canonicalContentPromptBlock(menu);
    expect(block).toContain('NAVIGATION HIERARCHY');
    expect(block).toContain('CAMPAIGN BOARD');
    expect(block).toContain('do not flatten to siblings');
    const refinement = buildMenuExpandedNavHierarchyRefinementPromptBlock({
      hierarchyLines: menu.navigationHierarchyLines ?? [],
    });
    expect(refinement).toContain('KEEP THE CURRENT APPROVED EXPANDED-NAV DESIGN');
    expect(refinement).toContain('NESTED NAVIGATION EXPANSION');
  });

  it('single-state menu regeneration preserves other experience outputs and injects hierarchy prompt', async () => {
    const falSpy = vi.spyOn(falExec, 'renderExperienceExpressionFalTarget');
    let r = await stateAfterMobileConfirmed();
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'generateExperienceExpression', dryRun: true });
    const before = r.state.pipelineSet!.experienceExpressionAuthority!;
    const otherUris = new Map(
      before.visualStates.filter((s) => s.stateId !== 'menu').map((s) => [s.stateId, s.previewImageUri]),
    );

    r = await runPageConceptViewportFamilyAction(r.state, {
      type: 'regenerateExperienceExpressionState',
      stateId: 'menu',
      dryRun: true,
    });

    expect(falSpy.mock.calls.length).toBeGreaterThan(0);
    const lastCall = falSpy.mock.calls[falSpy.mock.calls.length - 1]![0];
    expect(lastCall.target.prompt).toContain('NESTED NAVIGATION EXPANSION');
    expect(lastCall.target.prompt).toContain('CONTENT OPS IN ITS EXPANDED STATE');
    expect(lastCall.referenceImageUri).toBeTruthy();

    const after = r.state.pipelineSet!.experienceExpressionAuthority!;
    for (const [stateId, uri] of otherUris) {
      const row = after.visualStates.find((s) => s.stateId === stateId);
      expect(row?.previewImageUri).toBe(uri);
    }

    const receipt = buildExpandedNavHierarchyRefinementReceipt({
      projectId: PROJECT,
      pageId: r.state.pageId,
      authorityBefore: before,
      authorityAfter: after,
      menuStateRegenerated: true,
    });
    expect(receipt.otherExperienceOutputsRegenerated).toBe('NO');
    expect(receipt.contentOpsParentVisible).toBe('PASS');
    expect(receipt.campaignBoardNested).toBe('PASS');
    expect(receipt.campaignBoardTopLevel).toBe('NO');
    expect(receipt.readyForFounderNavHierarchyQa).toBe('YES');
  });
});
