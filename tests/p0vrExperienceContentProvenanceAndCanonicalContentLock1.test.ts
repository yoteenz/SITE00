/**
 * P0.VR.EXPERIENCE-CONTENT-PROVENANCE-AND-CANONICAL-CONTENT-LOCK1
 */

import { describe, expect, it } from 'vitest';

import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import {
  auditExperienceContentForAuthority,
  buildExperienceContentManifestsForPage,
  canonicalContentPromptBlock,
  COMPOSER_EXPERIENCE_CONTENT_GUARD,
  experienceContentBlocksApproval,
  validateExperienceContentContinuity,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceContentManifest.js';
import {
  auditNdxbookLegacyPromptInventedLabels,
  buildNdxbookOverviewExperienceContentManifests,
  ndxbookExperienceContentAuditReceiptAnswers,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/ndxbookExperienceContentManifest.js';
import { decomposeNdxbookOverviewExperiencePrompts } from '../shared/site00-design-workspace-production/pageConceptPipeline/ndxbookOverviewExperienceExpressionContentSpec.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import type { PageConceptCgptCreativeBrief, PageCreativeInjection } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  return listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview')!.pageId;
}

const cgptBrief = {
  briefId: 'b1',
  version: 'v1',
  creativePremise: 'x',
  pageStory: 'x',
  compositionStrategy: 'x',
  interactionCharacter: 'archival',
} as PageConceptCgptCreativeBrief;

const injection = { injectionId: 'inj', interactionCharacter: 'archival' } as PageCreativeInjection;

describe('P0.VR.EXPERIENCE-CONTENT-PROVENANCE-AND-CANONICAL-CONTENT-LOCK1', () => {
  it('builds content manifests for every NDXBOOK experience state', () => {
    const pageId = overviewPageId();
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const manifests = buildNdxbookOverviewExperienceContentManifests({
      projectId: PROJECT,
      pageId,
      functionContract,
    });
    expect(manifests.map((m) => m.stateId).sort()).toEqual(['base', 'entry-detail', 'menu', 'project-access'].sort());
    expect(manifests.every((m) => m.provenanceStatus === 'READY' || m.undefinedRequirements.length > 0)).toBe(true);
  });

  it('injects canonical content block into FAL prompts', () => {
    const pageId = overviewPageId();
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const skin = compileProjectSkinContract(PROJECT);
    const prompts = decomposeNdxbookOverviewExperiencePrompts({
      authorityId: 'a1',
      conceptId: 'c1',
      mobileArtifactId: 'art',
      route: functionContract.route,
      pageId,
      territoryLabel: 'EDITORIAL',
      skinContract: skin,
      cgptBrief,
      injection,
      functionContract,
    });
    const menu = prompts.find((p) => p.stateId === 'menu')!;
    expect(menu.promptText).toContain('CANONICAL CONTENT — USE EXACTLY');
    expect(menu.promptText).not.toMatch(/ENTRIES, EVIDENCE, PRODUCTION/);
  });

  it('does not treat in-production prose as simplified nav PRODUCTION', () => {
    const prose = 'Normal navigation, entry index, in-production state — control image for AT REST vs ACTIVE.';
    const found = auditNdxbookLegacyPromptInventedLabels(prose);
    expect(found.some((f) => f.label === 'PRODUCTION')).toBe(false);
  });

  it('detects legacy invented product labels', () => {
    const legacy =
      'ALL ENTRIES, EVIDENCE, ACTIVE PRODUCTION, KEY SIGNALS, OVERVIEW, ENTRIES, EVIDENCE, PRODUCTION';
    const found = auditNdxbookLegacyPromptInventedLabels(legacy);
    expect(found.some((f) => f.label === 'ALL ENTRIES')).toBe(true);
    expect(found.some((f) => f.label === 'KEY SIGNALS')).toBe(true);
    expect(found.some((f) => f.label === 'ENTRIES')).toBe(true);
  });

  it('does not flag manifest-canonical destination labels as invented in audit', () => {
    const pageId = overviewPageId();
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const manifests = buildNdxbookOverviewExperienceContentManifests({
      projectId: PROJECT,
      pageId,
      functionContract,
    });
    const menuManifest = manifests.find((m) => m.stateId === 'menu')!;
    const promptWithCanonical = canonicalContentPromptBlock(menuManifest);
    const audit = auditExperienceContentForAuthority({
      id: 'a1',
      projectId: PROJECT,
      pageId,
      sourceMobileAuthorityId: 'c1',
      sourceMobileArtifactId: 'art',
      sourceConceptId: 'c1',
      status: 'READY_FOR_REVIEW',
      patterns: [],
      behaviorContract: '',
      visualStateContract: '',
      responsiveRules: [],
      visualStates: [{ stateId: 'menu', label: 'MENU', patternType: 'MENU', previewImageUri: 'x', caption: '', sourceProvider: 'FAL_EXPERIENCE' }],
      generatedAt: null,
      approvedAt: null,
      expressionPrompts: [
        {
          id: 'p1',
          authorityId: 'a1',
          conceptId: 'c1',
          route: functionContract.route,
          expressionType: 'MENU_EXPANDED_NAV',
          promptText: promptWithCanonical,
          preserveBlock: '',
          changeBlock: '',
          outputIntent: '',
          combinableWith: [],
          priority: 1,
          primaryGoal: '',
          interactionSurface: '',
          antiDriftRules: [],
          stateId: 'menu',
        },
      ],
      experienceContentManifests: manifests,
    } as never);
    expect(audit.inventedProductContent).toBe(0);
  });

  it('blocks approval when invented product content remains in prompts', () => {
    const pageId = overviewPageId();
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const manifests = buildExperienceContentManifestsForPage({
      projectId: PROJECT,
      pageId,
      route: functionContract.route,
      functionContract,
    });
    const authority = {
      id: 'a1',
      projectId: PROJECT,
      pageId,
      sourceMobileAuthorityId: 'c1',
      sourceMobileArtifactId: 'art',
      sourceConceptId: 'c1',
      status: 'READY_FOR_REVIEW' as const,
      patterns: [],
      behaviorContract: '',
      visualStateContract: '',
      responsiveRules: [],
      visualStates: [
        {
          stateId: 'menu',
          label: 'MENU / EXPANDED NAV',
          patternType: 'MENU' as const,
          previewImageUri: 'x',
          caption: '',
          sourceProvider: 'FAL_EXPERIENCE' as const,
        },
      ],
      generatedAt: null,
      approvedAt: null,
      expressionPrompts: [
        {
          id: 'p1',
          authorityId: 'a1',
          conceptId: 'c1',
          route: functionContract.route,
          expressionType: 'MENU_EXPANDED_NAV',
          promptText: 'OVERVIEW, ENTRIES, EVIDENCE, PRODUCTION',
          preserveBlock: '',
          changeBlock: '',
          outputIntent: '',
          combinableWith: [],
          priority: 1,
          primaryGoal: '',
          interactionSurface: '',
          antiDriftRules: [],
          stateId: 'menu',
        },
      ],
      experienceContentManifests: manifests,
    };
    const gate = experienceContentBlocksApproval(authority);
    expect(gate.blocked).toBe(true);
    expect(gate.code).toBe('EXPERIENCE_CONTENT_INVENTED');
  });

  it('passes content continuity when prompts use manifest-only taxonomy', () => {
    const pageId = overviewPageId();
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const skin = compileProjectSkinContract(PROJECT);
    const manifests = buildNdxbookOverviewExperienceContentManifests({
      projectId: PROJECT,
      pageId,
      functionContract,
    });
    const menuManifest = manifests.find((m) => m.stateId === 'menu')!;
    const cleanPrompt = canonicalContentPromptBlock(menuManifest);
    const authority = {
      id: 'a1',
      projectId: PROJECT,
      pageId,
      sourceMobileAuthorityId: 'c1',
      sourceMobileArtifactId: 'art',
      sourceConceptId: 'c1',
      status: 'READY_FOR_REVIEW' as const,
      patterns: [],
      behaviorContract: '',
      visualStateContract: '',
      responsiveRules: [],
      visualStates: [
        {
          stateId: 'menu',
          label: 'MENU',
          patternType: 'MENU' as const,
          previewImageUri: 'x',
          caption: '',
        },
      ],
      generatedAt: null,
      approvedAt: null,
      expressionPrompts: [
        {
          id: 'p1',
          authorityId: 'a1',
          conceptId: 'c1',
          route: functionContract.route,
          expressionType: 'MENU_EXPANDED_NAV',
          promptText: cleanPrompt,
          preserveBlock: '',
          changeBlock: '',
          outputIntent: '',
          combinableWith: [],
          priority: 1,
          primaryGoal: '',
          interactionSurface: '',
          antiDriftRules: [],
          stateId: 'menu',
        },
      ],
      experienceContentManifests: manifests,
    };
    const receipt = validateExperienceContentContinuity(authority);
    expect(receipt.ok).toBe(true);
    expect(receipt.audit.inventedProductContent).toBe(0);
  });

  it('documents receipt answers for legacy invented labels', () => {
    const answers = ndxbookExperienceContentAuditReceiptAnswers();
    expect(answers['ALL ENTRIES']).toBe('INVENTED');
    expect(answers['KEY SIGNALS']).toBe('INVENTED');
    expect(answers.ENTRIES).toBe('INVENTED');
    expect(answers['EXPORT PROJECT LOG']).toBe('INVENTED');
  });

  it('includes composer guard string for handoff', () => {
    expect(COMPOSER_EXPERIENCE_CONTENT_GUARD).toContain('ExperienceContentManifest');
  });

  it('audit tracks missing vs canonical navigation destinations', () => {
    const pageId = overviewPageId();
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const manifests = buildNdxbookOverviewExperienceContentManifests({
      projectId: PROJECT,
      pageId,
      functionContract,
    });
    const audit = auditExperienceContentForAuthority({
      id: 'a1',
      projectId: PROJECT,
      pageId,
      sourceMobileAuthorityId: 'c1',
      sourceMobileArtifactId: 'art',
      sourceConceptId: 'c1',
      status: 'READY_FOR_REVIEW',
      patterns: [],
      behaviorContract: '',
      visualStateContract: '',
      responsiveRules: [],
      visualStates: [],
      generatedAt: null,
      approvedAt: null,
      expressionPrompts: decomposeNdxbookOverviewExperiencePrompts({
        authorityId: 'a1',
        conceptId: 'c1',
        mobileArtifactId: 'art',
        route: functionContract.route,
        pageId,
        territoryLabel: 'EDITORIAL',
        skinContract: compileProjectSkinContract(PROJECT),
        cgptBrief,
        injection,
        functionContract,
      }),
      experienceContentManifests: manifests,
    });
    expect(audit.inventedProductContent).toBe(0);
    expect(audit.states.find((s) => s.stateId === 'menu')?.outputAction).not.toBe('REGENERATE');
  });
});
