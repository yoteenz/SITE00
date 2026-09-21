/**
 * P0.VR.PAGE-FAMILY-SKIN-BEHAVIOR-CONTRACT1
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { buildPageSystemReviewModel } from '../shared/site00-design-workspace-production/designPageSystemReview.js';
import {
  assertComposerFamilyPatternDefined,
  assertComposerFamilyContractPresent,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptComposerFamilyGuard.js';
import { compilePageFamilyContractBundle } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilySkinBehavior.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { computePageConceptLiveImplementationHash } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveRouteHash.js';
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
    captureId: 'cap-mobile-pf',
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
    captureId: 'cap-desktop-pf',
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
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveExperienceExpression' });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'runDesktopInterpretation', dryRun: true });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveViewportFamily' });
  return r.state;
}

describe('P0.VR.PAGE-FAMILY-SKIN-BEHAVIOR-CONTRACT1', () => {
  beforeEach(() => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('requires approved viewport family before page family contract approval', async () => {
    const state = await pipelineThroughViewportApproval();
    expect(state.pipelineSet?.pageFamilySkinBehaviorContract).toBeTruthy();
    expect(state.pipelineSet?.pageFamilySkinBehaviorContract?.approvedAt).toBeNull();
    const review = buildPageSystemReviewModel(PROJECT, overviewPageId(), 'MOBILE');
    expect(review.children.length).toBeGreaterThanOrEqual(0);
    expect(state.pipelineSet?.pageFamilySkinBehaviorContract?.pageSystemReviewSnapshot.activePageId).toBe(
      overviewPageId(),
    );
  });

  it('parent child grandchild inheritance and responsive rules present', async () => {
    const state = await pipelineThroughViewportApproval();
    const contract = state.pipelineSet!.pageFamilySkinBehaviorContract!;
    expect(contract.inheritanceRules.parent.designDivergenceLevel).toBe('LOCKED');
    expect(contract.inheritanceRules.child.designDivergenceLevel).toBe('LOW');
    expect(contract.inheritanceRules.grandchild.designDivergenceLevel).toBe('LOW');
    expect(contract.responsiveInheritance.mobile.length).toBeGreaterThan(0);
    expect(contract.responsiveInheritance.tablet.length).toBeGreaterThan(0);
    expect(contract.responsiveInheritance.desktop.length).toBeGreaterThan(0);
  });

  it('Opus representative shells and twin package include family contract', async () => {
    const liveBefore = computePageConceptLiveImplementationHash(await pipelineThroughViewportApproval());
    let state = await pipelineThroughViewportApproval();
    let r = await runPageConceptViewportFamilyAction(state, { type: 'approvePageFamilySkinBehavior' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'markOpusRepresentativeShellsReady' });
    const shells = r.state.pipelineSet!.opusRepresentativeShellSet!;
    expect(shells.shells.some((s) => s.kind === 'PARENT' && s.status === 'READY')).toBe(true);
    expect(shells.shells.some((s) => s.kind === 'CHILD_DETAIL' && s.status === 'READY')).toBe(true);
    expect(shells.shells.some((s) => s.kind === 'GRANDCHILD_DETAIL' && s.status === 'READY')).toBe(true);
    expect(shells.shells.some((s) => s.kind === 'DRAWER_INSPECTOR' && s.status === 'READY')).toBe(true);
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'lockViewportFamily' });
    r = await runPageConceptViewportFamilyAction(r.state, { type: 'createTwinImplementationPackage' });
    const pkg = r.state.pipelineSet!.twinImplementationPackage!;
    expect(pkg.pageFamilySkinBehaviorContractId).toBe(r.state.pipelineSet!.pageFamilySkinBehaviorContract!.contractId);
    expect(pkg.representativeShellSetId).toBe(shells.setId);
    expect(computePageConceptLiveImplementationHash(r.state)).toBe(liveBefore);
  });

  it('Composer guard blocks undefined patterns and requires approved contract', () => {
    const skin = compileProjectSkinContract(PROJECT);
    const bundle = compilePageFamilyContractBundle({
      projectId: PROJECT,
      pageId: 'page-x',
      parentPageRole: 'overview',
      sourceViewportFamilyId: 'fam-test',
      experienceContract: {
        contractId: 'exp',
        projectId: PROJECT,
        pageId: 'page-x',
        selectedMobileConceptId: 'mc',
        skinContractVersion: skin.version,
        cgptBriefId: 'brief',
        overlayPatterns: ['drawer'],
        version: 'v1',
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      skinContract: skin,
      cgptBrief: {
        briefId: 'b',
        version: 'v1',
        contentHash: 'h',
        projectId: PROJECT,
        pageId: 'page-x',
        injectionId: 'inj',
        creativePremise: 'p',
        pagePurpose: 'purpose',
        audienceIntent: 'intent',
        pageStory: 'story',
        identitySignals: [],
        brandSignals: [],
        skinSignals: [],
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
        mandatoryBrandSignals: [],
        keyMessages: [],
        requiredContent: [],
        functionalRequirements: [],
        creativeLatitude: 'lat',
      },
      functionContract: {
        contractId: 'fn',
        route: '/x',
        regions: ['header'],
        interactions: ['tap'],
        immutableBehaviors: ['save'],
        version: 'v1',
      },
    });
    expect(() => assertComposerFamilyContractPresent(null)).toThrow(/COMPOSER_FAMILY_CONTRACT_REQUIRED/);
    expect(() =>
      assertComposerFamilyPatternDefined({
        patternKey: 'UNKNOWN_WIZARD_FLOW',
        contract: { ...bundle.contract, approvedAt: null },
        componentMap: bundle.componentMap,
      }),
    ).toThrow(/COMPOSER_FAMILY_CONTRACT_REQUIRED/);
    expect(() =>
      assertComposerFamilyPatternDefined({
        patternKey: 'UNKNOWN_WIZARD_FLOW',
        contract: { ...bundle.contract, approvedAt: new Date().toISOString() },
        componentMap: bundle.componentMap,
      }),
    ).toThrow(/PAGE_FAMILY_PATTERN_UNDEFINED/);
    expect(() =>
      assertComposerFamilyPatternDefined({
        patternKey: 'BUTTON',
        contract: { ...bundle.contract, approvedAt: new Date().toISOString() },
        componentMap: bundle.componentMap,
      }),
    ).not.toThrow();
  });
});
