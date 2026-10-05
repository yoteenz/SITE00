/**
 * P0.VR.EXISTING-TRUTH-PLUS-FUNCTIONAL-EXPANSION-INTELLIGENCE1
 */

import { describe, expect, it } from 'vitest';

import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import {
  applyFounderFunctionalExpansionDecision,
  approvedExpansionPromptBlock,
  buildComposerExpansionImplementationContracts,
  buildOpusFunctionalExpansionHandoffLines,
  buildPageFunctionalExpansionIntelligence,
  injectApprovedFunctionalExpansionsIntoAuthority,
  promoteFalDiscoveryLabelToProposal,
  propagateApprovedExpansionToFamily,
  unapprovedExpansionsEnterFalPrompt,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageFunctionalExpansionIntelligence.js';
import {
  buildNdxbookFalDiscoveryAudit,
  isGenericFeatureCreep,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/ndxbookFunctionalExpansionIntelligence.js';
import { compileExperienceExpressionAuthority } from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import type { PageFamilyBlueprint } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyBlueprint.js';
import { pageConceptDecideFunctionalExpansion } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
import type {
  PageConceptCgptCreativeBrief,
  PageConceptGenerationState,
  PageCreativeInjection,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PROJECT = 'ndxbook';

const cgptBrief = {
  briefId: 'b1',
  version: 'v1',
  creativePremise: 'x',
  pageStory: 'x',
  compositionStrategy: 'x',
  interactionCharacter: 'archival',
  typographyStrategy: 'editorial',
  colorStrategy: 'warm',
  materialStrategy: 'paper',
} as PageConceptCgptCreativeBrief;

function stubBlueprint(pageId: string): PageFamilyBlueprint {
  return {
    blueprintId: 'bp-test',
    projectId: PROJECT,
    parentPageId: pageId,
    expansionNotes: [],
  } as PageFamilyBlueprint;
}

function overviewPageId(): string {
  return listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview')!.pageId;
}

function minimalState(pageId: string, intelligence: NonNullable<ReturnType<typeof buildPageFunctionalExpansionIntelligence>>): PageConceptGenerationState {
  const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
  return {
    targetType: 'PAGE',
    projectId: PROJECT,
    pageId,
    projectContext: null,
    pageContext: null,
    functionContract,
    pipelineSet: {
      pipelineSetId: 'ps-test',
      projectId: PROJECT,
      pageId,
      targetType: 'PAGE',
      captureSetId: 'cap',
      functionContractId: functionContract.contractId,
      creativeInjection: { injectionId: 'inj', interactionCharacter: 'archival' } as PageCreativeInjection,
      cgptCreativeBrief: { briefId: 'b', version: 'v1' } as PageConceptCgptCreativeBrief,
      gpt2AuthorityConcept: null,
      renditions: [],
      functionalExpansionIntelligence: intelligence,
    },
    generationJobs: [],
    generationStatus: 'MOBILE_AUTHORITY_CONFIRMED',
    lastFailure: null,
    history: [],
  };
}

describe('P0.VR.EXISTING-TRUTH-PLUS-FUNCTIONAL-EXPANSION-INTELLIGENCE1', () => {
  it('resolves existing product truth before capability analysis', () => {
    const pageId = overviewPageId();
    const fc = compilePageFunctionContract(PROJECT, pageId)!;
    const intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId, functionContract: fc })!;
    expect(intel.readiness.pageTruthResolved).toBe(true);
    expect(intel.existingPageTruths.length).toBeGreaterThan(0);
    expect(intel.capabilityAnalyses.length).toBe(intel.existingPageTruths.length);
    expect(intel.readiness.functionalGapsAnalyzed).toBe(true);
  });

  it('keeps expansions PROPOSED until Founder approval', () => {
    const pageId = overviewPageId();
    const intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    expect(intel.proposals.length).toBeGreaterThan(0);
    expect(intel.proposals.every((p) => p.status === 'PROPOSED')).toBe(true);
  });

  it('does not inject unapproved expansion titles into FAL authority prompts', () => {
    const pageId = overviewPageId();
    const fc = compilePageFunctionContract(PROJECT, pageId)!;
    const skin = compileProjectSkinContract(PROJECT);
    const intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId, functionContract: fc })!;
    const authority = compileExperienceExpressionAuthority({
      projectId: PROJECT,
      pageId,
      mobileConcept: {
        conceptId: 'c1',
        slot: 'MOBILE_CONCEPT_A',
        artifactId: 'a1',
        imageUri: 'data:image/png;base64,abc',
        status: 'READY',
        createdAt: new Date().toISOString(),
      },
      skinContract: skin,
      cgptBrief,
      injection: { injectionId: 'inj', interactionCharacter: 'archival' } as PageCreativeInjection,
      functionContract: fc,
    });
    const injected = injectApprovedFunctionalExpansionsIntoAuthority(authority, intel);
    const blob = injected.expressionPrompts?.map((p) => p.promptText).join('\n') ?? '';
    expect(unapprovedExpansionsEnterFalPrompt(blob, intel.proposals)).toBe(false);
    expect(blob).not.toContain('FOUNDER-APPROVED EXPANSION CONTENT');
  });

  it('injects approved expansions into prompts and updates blueprint notes', () => {
    const pageId = overviewPageId();
    const fc = compilePageFunctionContract(PROJECT, pageId)!;
    let intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId, functionContract: fc })!;
    const target = intel.proposals.find((p) => p.expansionId === 'pfe-recent-activity')!;
    intel = applyFounderFunctionalExpansionDecision(intel, target.expansionId, 'APPROVE');
    const blueprint = stubBlueprint(pageId);
    const propagated = propagateApprovedExpansionToFamily({
      intelligence: intel,
      blueprint,
      interactionMap: null,
      expansionId: target.expansionId,
    });
    expect(propagated.blueprint.expansionNotes?.some((n) => n.includes('RECENT ACTIVITY'))).toBe(true);
    expect(propagated.proposedInteractionRecords.length).toBeGreaterThan(0);
    const block = approvedExpansionPromptBlock(intel.proposals.filter((p) => p.status === 'FOUNDER_APPROVED'));
    expect(block).toContain('RECENT ACTIVITY');
  });

  it('captures child and grandchild impact on proposals', () => {
    const pageId = overviewPageId();
    const intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    const activity = intel.proposals.find((p) => p.title === 'RECENT ACTIVITY');
    expect(activity?.affectedChildren.length).toBeGreaterThan(0);
    expect(activity?.responsiveImpact.mobile).toMatch(/compact|drawer/i);
  });

  it('rejects generic feature creep proposals', () => {
    const pageId = overviewPageId();
    const intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    const grounded = intel.proposals.find((p) => /overview already/i.test(p.whyItFitsProduct))!;
    expect(grounded).toBeDefined();
    expect(isGenericFeatureCreep(grounded)).toBe(false);
    expect(
      isGenericFeatureCreep({
        ...grounded,
        whyItFitsProduct: 'Add social sharing because apps often have sharing.',
        problemObserved: 'generic saas',
      }),
    ).toBe(true);
  });

  it('audits FAL discoveries and can promote labels into proposals', () => {
    const audit = buildNdxbookFalDiscoveryAudit();
    expect(audit.some((r) => r.classification === 'USEFUL_EXPANSION_CANDIDATE')).toBe(true);
    const pageId = overviewPageId();
    let intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    const before = intel.proposals.length;
    intel = promoteFalDiscoveryLabelToProposal(intel, 'PROJECT ARCHIVE');
    expect(intel.proposals.length).toBeGreaterThanOrEqual(before);
  });

  it('excludes rejected proposals from approved prompt blocks', () => {
    const pageId = overviewPageId();
    let intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    const id = intel.proposals[0]!.expansionId;
    intel = applyFounderFunctionalExpansionDecision(intel, id, 'REJECT');
    const block = approvedExpansionPromptBlock(intel.proposals.filter((p) => p.status === 'FOUNDER_APPROVED'));
    expect(block).not.toContain(intel.proposals.find((p) => p.expansionId === id)!.title);
  });

  it('feeds Opus handoff lines for approved expansions', () => {
    const pageId = overviewPageId();
    let intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    intel = applyFounderFunctionalExpansionDecision(intel, intel.proposals[0]!.expansionId, 'APPROVE');
    const lines = buildOpusFunctionalExpansionHandoffLines(intel);
    expect(lines.some((l) => l.includes('APPROVED EXPANSIONS: 1'))).toBe(true);
  });

  it('builds Composer implementation contracts for approved expansions', () => {
    const pageId = overviewPageId();
    let intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    intel = applyFounderFunctionalExpansionDecision(intel, intel.proposals[0]!.expansionId, 'APPROVE');
    const contracts = buildComposerExpansionImplementationContracts(intel);
    expect(contracts.length).toBe(1);
    expect(contracts[0]!.routes.length).toBeGreaterThan(0);
    expect(contracts[0]!.responsiveBehavior.length).toBe(3);
  });

  it('orchestrates Founder approve via pageConceptDecideFunctionalExpansion', () => {
    const pageId = overviewPageId();
    const intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    const fc = compilePageFunctionContract(PROJECT, pageId)!;
    const blueprint = stubBlueprint(pageId);
    const state = minimalState(pageId, intel);
    state.pipelineSet!.pageFamilyBlueprint = blueprint;
    const expansionId = intel.proposals[0]!.expansionId;
    const result = pageConceptDecideFunctionalExpansion(state, expansionId, 'APPROVE');
    expect(
      result.state.pipelineSet?.functionalExpansionIntelligence?.proposals.find((p) => p.expansionId === expansionId)
        ?.status,
    ).toBe('FOUNDER_APPROVED');
    expect(result.state.pipelineSet?.composerFunctionalExpansionContracts?.length).toBeGreaterThan(0);
  });

  it('readiness gates Opus until proposals are reviewed', () => {
    const pageId = overviewPageId();
    const intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    expect(intel.readiness.readyForOpus).toBe(false);
    let reviewed = intel;
    for (const p of intel.proposals) {
      reviewed = applyFounderFunctionalExpansionDecision(reviewed, p.expansionId, 'DEFER');
    }
    expect(reviewed.readiness.expansionProposalsReviewed).toBe(true);
    expect(reviewed.readiness.readyForOpus).toBe(true);
  });
});
