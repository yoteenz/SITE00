/**
 * P0.VR.FUNCTIONAL-EXPANSION-UPSTREAM-OF-AUTHORITY-CONCEPTS1
 */

import { describe, expect, it } from 'vitest';

import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import {
  compilePageCreativeContext,
  compileProjectCreativeContext,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageConceptCgptCreativeBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import {
  applyFounderFunctionalExpansionDecision,
  buildPageFunctionalExpansionIntelligence,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageFunctionalExpansionIntelligence.js';
import {
  approveAllProposedExpansionsForTests,
  approvedFunctionalSetForAllMobileConcepts,
  buildApprovedFuturePageTruth,
  buildApprovedFutureStateGpt2PromptBlock,
  createPostConceptExpansionCandidate,
  experiencePromptInventsUnapprovedFunction,
  functionalExpansionGateBlocksGpt2Generation,
  gpt2PromptContainsUnapprovedExpansionProposals,
  majorExpansionInvalidatesMobileAuthority,
  preparePreConceptGpt2PipelineArtifacts,
  recompilePageArchitectureWithApprovedExpansions,
  recompileScreenshotFunctionMapWithApprovedExpansions,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPreConceptFunctionalExpansion.js';
import { compilePageConceptPageArchitectureBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import { interpretScreenshotFunctionality } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptScreenshotFunctionalPageMap.js';
import { compileGpt2MobileProviderPrompt } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileProviderPromptCompiler.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import type {
  PageConceptCgptCreativeBrief,
  PageCreativeContext,
  PageCreativeInjection,
  ProjectCreativeContext,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import {
  buildGpt2MobileProviderReferenceBundle,
  mockGpt2MobileProviderReferenceBundleForTest,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileReferenceAuthority.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  return listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview')!.pageId;
}

function stubInjection(): PageCreativeInjection {
  return {
    injectionId: 'inj-upstream',
    creativeThesis: 'Editorial overview',
    creativePremise: 'Editorial overview',
    pagePurposeInterpretation: 'Orient founder',
    interactionCharacter: 'archival',
    spatialDirection: 'vertical register',
    hierarchyDirection: 'type-led',
    assetStrategy: 'evidence plates',
    mobileDirection: 'scroll narrative',
    distinctiveMove: 'signal band',
    informationPriority: 'entries first',
    avoidList: [],
  } as PageCreativeInjection;
}

function stubBrief(): PageConceptCgptCreativeBrief {
  return {
    briefId: 'brief-upstream',
    version: 'v1',
    creativePremise: 'Editorial overview',
    pageStory: 'Project overview',
    compositionStrategy: 'register',
    interactionCharacter: 'archival',
    typographyStrategy: 'editorial',
    colorStrategy: 'warm',
    materialStrategy: 'paper',
  } as PageConceptCgptCreativeBrief;
}

describe('P0.VR.FUNCTIONAL-EXPANSION-UPSTREAM-OF-AUTHORITY-CONCEPTS1', () => {
  it('runs expansion analysis before mobile generation gate', () => {
    const pageId = overviewPageId();
    const intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    expect(intel.readiness.functionalGapsAnalyzed).toBe(true);
    expect(intel.readiness.pageTruthResolved).toBe(true);
    expect(functionalExpansionGateBlocksGpt2Generation(intel)).toBe(true);
  });

  it('blocks GPT2 when unreviewed PROPOSED expansions remain', () => {
    const pageId = overviewPageId();
    const intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    expect(functionalExpansionGateBlocksGpt2Generation(intel)).toBe(true);
    const reviewed = approveAllProposedExpansionsForTests(intel, 'FOUNDER_REJECTED');
    expect(functionalExpansionGateBlocksGpt2Generation(reviewed)).toBe(false);
  });

  it('includes approved expansions in GPT2 prompt block for all concepts', () => {
    const pageId = overviewPageId();
    let intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    const approvedId = intel.proposals.find((p) => p.title === 'RECENT ACTIVITY')?.expansionId;
    expect(approvedId).toBeTruthy();
    intel = applyFounderFunctionalExpansionDecision(intel, approvedId!, 'APPROVE');
    const future = buildApprovedFuturePageTruth(intel);
    const block = buildApprovedFutureStateGpt2PromptBlock({ futureTruth: future, intelligence: intel });
    expect(block).toContain('RECENT ACTIVITY');
    expect(block).toContain('APPROVED FUTURE-STATE PAGE TRUTH');
    expect(approvedFunctionalSetForAllMobileConcepts(intel)).toContain(approvedId);
  });

  it('excludes rejected expansions from GPT2 prompt block', () => {
    const pageId = overviewPageId();
    let intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    const rejected = intel.proposals[0]!;
    intel = applyFounderFunctionalExpansionDecision(intel, rejected.expansionId, 'REJECT');
    intel = approveAllProposedExpansionsForTests(intel, 'FOUNDER_REJECTED');
    const block = buildApprovedFutureStateGpt2PromptBlock({
      futureTruth: buildApprovedFuturePageTruth(intel),
      intelligence: intel,
    });
    expect(block).not.toMatch(new RegExp(`\\b${rejected.title}\\b`));
  });

  it('recompiles page architecture after approval', () => {
    const pageId = overviewPageId();
    const fc = compilePageFunctionContract(PROJECT, pageId)!;
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const injection = stubInjection();
    const brief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract: fc,
    });
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext,
      pageContext,
      functionContract: fc,
      injection,
      cgptCreativeBrief: brief,
      captureSetId: 'cap-upstream',
    });
    let intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId, functionContract: fc })!;
    intel = approveAllProposedExpansionsForTests(intel);
    const next = recompilePageArchitectureWithApprovedExpansions({ brief: arch, intelligence: intel });
    expect(next.mobileRegionMap.length).toBeGreaterThan(arch.mobileRegionMap.length);
    expect(next.translatedPagePurpose.some((l) => l.includes('Founder-approved future function'))).toBe(true);
  });

  it('recompiles screenshot function map after approval', async () => {
    const pageId = overviewPageId();
    const fc = compilePageFunctionContract(PROJECT, pageId)!;
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const injection = stubInjection();
    const brief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract: fc,
    });
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext,
      pageContext,
      functionContract: fc,
      injection,
      cgptCreativeBrief: brief,
      captureSetId: 'cap-upstream',
    });
    const bundle = await buildGpt2MobileProviderReferenceBundle({
      captureSetId: 'cap-upstream',
      functionalCaptureBase64: Buffer.from('vitest-functional-capture', 'utf8').toString('base64'),
      functionalAssetId: 'cap-upstream:mobile',
      functionalSourcePath: 'capture-set/cap-upstream/mobile.png',
      fallbackViewport: { width: 390, height: 844 },
    });
    const map = interpretScreenshotFunctionality({
      captureSetId: 'cap-upstream',
      providerReferenceBundle: bundle,
      projectContext,
      pageContext,
      functionContract: fc,
      pageArchitectureBrief: arch,
    });
    let intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId, functionContract: fc })!;
    intel = approveAllProposedExpansionsForTests(intel);
    const next = recompileScreenshotFunctionMapWithApprovedExpansions({ map, intelligence: intel });
    expect(next.regions.length).toBeGreaterThan(map.regions.length);
    expect(next.functionalInvariants.some((l) => l.includes('founder-approved'))).toBe(true);
  });

  it('uses identical approved functional set across A/B/C prompt compilation', () => {
    const pageId = overviewPageId();
    const fc = compilePageFunctionContract(PROJECT, pageId)!;
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const injection = stubInjection();
    const brief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract: fc,
    });
    const skin = compileProjectSkinContract(PROJECT);
    let intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId, functionContract: fc })!;
    intel = approveAllProposedExpansionsForTests(intel);
    const preparedArch = compilePageConceptPageArchitectureBrief({
      projectContext,
      pageContext,
      functionContract: fc,
      injection,
      cgptCreativeBrief: brief,
      captureSetId: 'cap-upstream',
    });
    const prepared = preparePreConceptGpt2PipelineArtifacts({
      pageArchitectureBrief: preparedArch,
      intelligence: intel,
    });
    const refs = mockGpt2MobileProviderReferenceBundleForTest();
    let functionMap = interpretScreenshotFunctionality({
      captureSetId: 'cap-upstream',
      providerReferenceBundle: refs,
      projectContext,
      pageContext,
      functionContract: fc,
      pageArchitectureBrief: prepared.pageArchitectureBrief,
    });
    functionMap = recompileScreenshotFunctionMapWithApprovedExpansions({ map: functionMap, intelligence: intel });
    const slots = ['MOBILE_CONCEPT_A', 'MOBILE_CONCEPT_B', 'MOBILE_CONCEPT_C'] as const;
    const prompts = slots.map((slot) =>
      compileGpt2MobileProviderPrompt({
        slot,
        cgptBrief: brief,
        pageArchitectureBrief: prepared.pageArchitectureBrief,
        skinContract: skin,
        functionContract: fc,
        pageContext,
        injection,
        bottomContinuityApplied: true,
        mobileViewport: { width: 390, height: 844 },
        screenshotFunctionalPageMap: functionMap,
        approvedFuturePageTruth: prepared.approvedFuturePageTruth,
        functionalExpansionIntelligence: intel,
      }).prompt,
    );
    const approvedTitles = intel.proposals.filter((p) => p.status === 'FOUNDER_APPROVED').map((p) => p.title);
    expect(approvedTitles.length).toBeGreaterThan(0);
    for (const title of approvedTitles) {
      for (const prompt of prompts) {
        expect(prompt).toContain(title);
      }
    }
    expect(approvedFunctionalSetForAllMobileConcepts(intel).length).toBe(approvedTitles.length);
    expect(gpt2PromptContainsUnapprovedExpansionProposals(prompts[0]!, intel)).toBe(false);
  });

  it('detects experience prompts inventing unapproved PROPOSED functions', () => {
    const pageId = overviewPageId();
    const intel = buildPageFunctionalExpansionIntelligence({ projectId: PROJECT, anchorPageId: pageId })!;
    const proposedTitle = intel.proposals.find((p) => p.status === 'PROPOSED')!.title;
    expect(experiencePromptInventsUnapprovedFunction({ promptText: `Show ${proposedTitle} panel`, intelligence: intel })).toBe(true);
    const reviewed = approveAllProposedExpansionsForTests(intel, 'FOUNDER_REJECTED');
    expect(experiencePromptInventsUnapprovedFunction({ promptText: `Show ${proposedTitle} panel`, intelligence: reviewed })).toBe(false);
  });

  it('keeps post-concept discoveries as proposals only', () => {
    const candidate = createPostConceptExpansionCandidate({
      title: 'NEW SIGNAL RAIL',
      origin: 'EXPERIENCE_GENERATION',
      rationale: 'Observed during FAL',
    });
    expect(candidate.status).toBe('PROPOSED');
  });

  it('invalidates mobile authority on major post-concept expansion', () => {
    const candidate = createPostConceptExpansionCandidate({
      title: 'PRIMARY NAV REWORK',
      origin: 'CONCEPT_GENERATION',
      rationale: 'Changes above-fold nav model',
      materiality: 'MAJOR',
    });
    expect(majorExpansionInvalidatesMobileAuthority({ candidate, mobileAuthorityConfirmed: true })).toBe(true);
    expect(
      majorExpansionInvalidatesMobileAuthority({
        candidate: { ...candidate, materiality: 'MINOR' },
        mobileAuthorityConfirmed: true,
      }),
    ).toBe(false);
  });
});
