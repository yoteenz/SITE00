/**
 * P0.VR.PAGE-FAMILY-BLUEPRINT-BEFORE-OPUS1
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { buildPageSystemReviewModel } from '../shared/site00-design-workspace-production/designPageSystemReview.js';
import {
  compilePageFamilyBlueprint,
  validatePageFamilyBlueprint,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyBlueprint.js';
import { assertComposerPageInFamilyBlueprint } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptComposerFamilyGuard.js';
import { compilePageFamilyContractBundle } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilySkinBehavior.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { computePageConceptLiveImplementationHash } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveRouteHash.js';
import { assertOpusShellTargetSurface } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptTwinLiveFirewall.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
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
    captureId: 'cap-mobile-pfb',
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
    captureId: 'cap-desktop-pfb',
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

describe('P0.VR.PAGE-FAMILY-BLUEPRINT-BEFORE-OPUS1', () => {
  beforeEach(() => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('requires approved viewport family before blueprint is compiled', async () => {
    const state = await pipelineThroughViewportApproval();
    expect(state.pipelineSet?.viewportAuthorityFamily?.viewportFamilyApprovalId).toBeTruthy();
    expect(state.generationStatus).toBe('PAGE_FAMILY_BLUEPRINT_REVIEW');
    expect(state.pipelineSet?.pageFamilyBlueprint).toBeTruthy();
    expect(state.pipelineSet?.pageFamilyBlueprint?.approvedAt).toBeNull();
  });

  it('represents all children and grandchildren from page system review', async () => {
    const state = await pipelineThroughViewportApproval();
    const review = buildPageSystemReviewModel(PROJECT, overviewPageId(), 'MOBILE');
    const blueprint = state.pipelineSet!.pageFamilyBlueprint!;
    expect(blueprint.parentCount).toBe(1);
    expect(blueprint.childCount).toBe(review.children.length);
    expect(blueprint.grandchildCount).toBe(review.grandchildren.length);
    expect(blueprint.totalPageCount).toBeGreaterThan(1);
    expect(blueprint.hierarchyReceipt.hierarchyDiscoveryStatus).toBe('RESOLVED');
    const validation = validatePageFamilyBlueprint(blueprint, review);
    expect(validation.ok).toBe(true);
    for (const node of blueprint.nodes) {
      expect(node.functionRole).toBeTruthy();
      expect(node.inheritance.inherited.length).toBeGreaterThan(0);
      expect(node.divergenceLevel).toBeTruthy();
    }
  });

  it('blocks Opus handoff until founder approves blueprint', async () => {
    let state = await pipelineThroughViewportApproval();
    await expect(
      runPageConceptViewportFamilyAction(state, { type: 'markOpusRepresentativeShellsReady' }),
    ).rejects.toThrow(/PAGE_FAMILY_BLUEPRINT_APPROVAL_REQUIRED/);
    let r = await runPageConceptViewportFamilyAction(state, { type: 'approvePageFamilyBlueprint' });
    state = r.state;
    expect(state.pipelineSet?.pageFamilyBlueprint?.approvedAt).toBeTruthy();
    expect(state.pipelineSet?.opusPageFamilyHandoff).toBeNull();
    expect(state.pipelineSet?.pageFamilySkinBehaviorContract?.approvedAt).toBeTruthy();
    r = await runPageConceptViewportFamilyAction(state, { type: 'approvePageFamilyInteractionMap' });
    state = r.state;
    expect(state.pipelineSet?.opusPageFamilyHandoff).toBeTruthy();
    r = await runPageConceptViewportFamilyAction(state, { type: 'markOpusRepresentativeShellsReady' });
    expect(r.state.pipelineSet?.opusRepresentativeShellSet?.readyAt).toBeTruthy();
  });

  it('includes blueprint and handoff in twin package without live mutation', async () => {
    const liveBefore = computePageConceptLiveImplementationHash(await pipelineThroughViewportApproval());
    let state = await pipelineThroughViewportApproval();
    let r = await runPageConceptViewportFamilyAction(state, { type: 'approvePageFamilyBlueprint' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'approvePageFamilyInteractionMap' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'markOpusRepresentativeShellsReady' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'lockViewportFamily' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'createTwinImplementationPackage' });
    const pkg = r.state.pipelineSet!.twinImplementationPackage!;
    expect(pkg.pageFamilyBlueprintId).toBe(r.state.pipelineSet!.pageFamilyBlueprint!.blueprintId);
    expect(pkg.opusPageFamilyHandoffId).toBe(r.state.pipelineSet!.opusPageFamilyHandoff!.handoffId);
    expect(computePageConceptLiveImplementationHash(r.state)).toBe(liveBefore);
    assertOpusShellTargetSurface('TWIN');
  });

  it('Composer guard blocks undefined child page expression', () => {
    const pageId = overviewPageId();
    const skin = compileProjectSkinContract(PROJECT);
    const cgptBrief = {
      briefId: 'b',
      version: 'v1',
      contentHash: 'h',
      projectId: PROJECT,
      pageId,
      injectionId: 'inj',
      creativePremise: 'p',
      pagePurpose: 'purpose',
      audienceIntent: 'intent',
      pageStory: 'story',
      identitySignals: [] as string[],
      brandSignals: [] as string[],
      skinSignals: [] as string[],
      compositionStrategy: 'comp',
      hierarchyStrategy: 'hier',
      typographyStrategy: 'type',
      colorStrategy: 'color',
      materialStrategy: 'mat',
      imageryStrategy: 'img',
      interactionCharacter: 'char',
      visualTerritory: 'terr',
      imageStrategy: 'img',
      pageSurprise: 'surprise',
      mobileDirection: 'mob',
      desktopDirection: 'desk',
      mandatoryBrandSignals: [] as string[],
      keyMessages: [] as string[],
      requiredContent: [] as string[],
      functionalRequirements: [] as string[],
      creativeLatitude: 'lat',
    };
    const experienceContract = {
      contractId: 'exp',
      projectId: PROJECT,
      pageId,
      selectedMobileConceptId: 'mc',
      skinContractVersion: skin.version,
      cgptBriefId: 'brief',
      overlayPatterns: ['drawer'],
      version: 'v1',
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const functionContract = {
      contractId: 'fn',
      route: '/x',
      regions: ['header'],
      interactions: ['tap'],
      immutableBehaviors: ['save'],
      version: 'v1',
    };
    const bundle = compilePageFamilyContractBundle({
      projectId: PROJECT,
      pageId,
      parentPageRole: 'overview',
      sourceViewportFamilyId: 'fam-test',
      experienceContract,
      skinContract: skin,
      cgptBrief,
      functionContract,
    });
    const blueprint = {
      ...compilePageFamilyBlueprint({
        projectId: PROJECT,
        parentPageId: pageId,
        sourceViewportFamilyId: 'fam-test',
        skinContract: bundle.contract,
        experienceContract,
        cgptBrief,
        functionContract,
      }),
      approvedAt: new Date().toISOString(),
    };
    expect(() =>
      assertComposerPageInFamilyBlueprint({ pageId: 'unknown-child-page', blueprint }),
    ).toThrow(/PAGE_FAMILY_EXPRESSION_UNDEFINED/);
    expect(() => assertComposerPageInFamilyBlueprint({ pageId, blueprint })).not.toThrow();
  });
});
