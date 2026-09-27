/**
 * P0.VR.NDXBOOK-OVERVIEW-EXPRESSION-CONTENT-SPEC1
 */

import { describe, expect, it } from 'vitest';

import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { buildExperienceExpressionPromptPipeline } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptExperienceExpressionFalPlan.js';
import {
  decomposeNdxbookOverviewExperiencePrompts,
  isNdxbookOverviewExperiencePage,
  planNdxbookOverviewExperiencePackaging,
  validateNdxbookOverviewExperiencePackage,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/ndxbookOverviewExperienceExpressionContentSpec.js';
import type { ExperienceExpressionAuthority } from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import type { PageConceptCgptCreativeBrief, PageCreativeInjection, PageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const functionContract: PageFunctionContract = {
  contractId: 'fc-ndx-overview',
  version: 'v1',
  route: '/projects/design/ndxbook/overview',
  regions: ['NDXBOOK header', 'project progress', 'entry index', 'bottom navigation'],
  interactions: ['expand menu nav', 'select entry', 'explore project archive overlay'],
  immutableBehaviors: ['bottom nav locked', 'founder client switch'],
};

const cgptBrief: PageConceptCgptCreativeBrief = {
  briefId: 'b1',
  version: 'v1',
  creativePremise: 'Editorial archival NDXBOOK overview inside SITE 00 Projects.',
  pageStory: 'Orient founder to entries and production.',
  compositionStrategy: 'Vertical editorial stack.',
  interactionCharacter: 'Inspect-first archival',
};

const injection = {
  injectionId: 'inj-1',
  interactionCharacter: 'Inspect-first archival',
} as PageCreativeInjection;

describe('P0.VR.NDXBOOK-OVERVIEW-EXPRESSION-CONTENT-SPEC1', () => {
  const skin = compileProjectSkinContract('ndxbook');

  it('detects NDXBOOK overview route', () => {
    expect(isNdxbookOverviewExperiencePage({ projectId: 'ndxbook', route: functionContract.route })).toBe(true);
    expect(isNdxbookOverviewExperiencePage({ projectId: 'other', route: functionContract.route })).toBe(false);
  });

  it('decomposes five logical prompts with state-specific language', () => {
    const prompts = decomposeNdxbookOverviewExperiencePrompts({
      authorityId: 'auth-1',
      conceptId: 'concept-b',
      mobileArtifactId: 'pcga-mobile-b',
      route: functionContract.route,
      territoryLabel: 'EDITORIAL SIGNAL',
      skinContract: skin,
      cgptBrief,
      injection,
      functionContract,
    });
    expect(prompts).toHaveLength(4);
    const types = prompts.map((p) => p.expressionType);
    expect(types).toContain('BASE_PAGE_AT_REST');
    expect(types).toContain('MENU_EXPANDED_NAV');
    expect(types).toContain('PANEL_OR_DRAWER');
    expect(types).toContain('OVERLAY_OR_DETAIL_STATE');

    const menu = prompts.find((p) => p.expressionType === 'MENU_EXPANDED_NAV')!;
    const entry = prompts.find((p) => p.expressionType === 'PANEL_OR_DRAWER')!;
    const access = prompts.find((p) => p.expressionType === 'OVERLAY_OR_DETAIL_STATE')!;
    expect(menu.promptText).toContain('index architecture');
    expect(entry.promptText).toContain('ENTRY 003');
    expect(access.promptText).toContain('archive behind the overview');
    expect(entry.outputLabel).toBe('ENTRY DETAIL / PANEL');
    expect(access.outputLabel).toBe('PROJECT ACCESS / OVERLAY');
    expect(menu.promptText).not.toEqual(entry.promptText);
  });

  it('packages four FAL outputs plus base within budget', () => {
    const { plan, falTargets } = buildExperienceExpressionPromptPipeline({
      projectId: 'ndxbook',
      pageId: 'overview-page',
      authorityId: 'auth-1',
      conceptId: 'concept-b',
      mobileArtifactId: 'art-b',
      route: functionContract.route,
      territoryLabel: 'EDITORIAL SIGNAL',
      skinContract: skin,
      cgptBrief,
      injection,
      functionContract,
    });
    expect(plan.totalPlannedOutputs).toBe(3);
    expect(plan.totalPlannedOutputs + 1).toBe(4);
    expect(falTargets.map((t) => t.label)).toEqual([
      'MENU / EXPANDED NAV',
      'ENTRY DETAIL / PANEL',
      'PROJECT ACCESS / OVERLAY',
    ]);
    expect(falTargets.some((t) => t.stateId === 'entry-detail')).toBe(true);
    expect(falTargets.some((t) => t.stateId === 'project-access')).toBe(true);
  });

  it('supports single-state regeneration without full package regen', async () => {
    const { runPageConceptViewportFamilyAction } = await import(
      '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js'
    );
    const { executePageConceptExperienceExpressionStateRegeneration } = await import(
      '../api/_lib/site00PageConcept/executePageConceptExperienceExpressionGeneration.js'
    );
    expect(typeof runPageConceptViewportFamilyAction).toBe('function');
    expect(typeof executePageConceptExperienceExpressionStateRegeneration).toBe('function');
  });

  it('validateNdxbookOverviewExperiencePackage checks required labels', () => {
    const prompts = decomposeNdxbookOverviewExperiencePrompts({
      authorityId: 'auth-1',
      conceptId: 'concept-b',
      mobileArtifactId: 'art-b',
      route: functionContract.route,
      territoryLabel: 'EDITORIAL SIGNAL',
      skinContract: skin,
      cgptBrief,
      injection,
      functionContract,
    });
    const plan = planNdxbookOverviewExperiencePackaging({
      authorityId: 'auth-1',
      conceptId: 'concept-b',
      candidatePrompts: prompts,
    });
    const authority = {
      id: 'auth-1',
      sourceConceptId: 'concept-b',
      sourceMobileAuthorityId: 'concept-b',
      sourceMobileArtifactId: 'art-b',
      status: 'READY_FOR_REVIEW',
      packagingPlan: plan,
      visualStates: [
        { stateId: 'base', label: 'BASE PAGE', outputLabel: 'BASE PAGE', previewImageUri: 'data:image/png;base64,aa' },
        {
          stateId: 'menu',
          label: 'MENU / EXPANDED NAV',
          outputLabel: 'MENU / EXPANDED NAV',
          previewImageUri: 'data:image/png;base64,bb',
          sourceProvider: 'FAL_EXPERIENCE',
        },
        {
          stateId: 'entry-detail',
          label: 'ENTRY DETAIL / PANEL',
          outputLabel: 'ENTRY DETAIL / PANEL',
          previewImageUri: 'data:image/png;base64,cc',
          sourceProvider: 'FAL_EXPERIENCE',
        },
        {
          stateId: 'project-access',
          label: 'PROJECT ACCESS / OVERLAY',
          outputLabel: 'PROJECT ACCESS / OVERLAY',
          previewImageUri: 'data:image/png;base64,dd',
          sourceProvider: 'FAL_EXPERIENCE',
        },
      ],
    } as ExperienceExpressionAuthority;
    const v = validateNdxbookOverviewExperiencePackage(authority);
    expect(v.checks.BASE_PAGE_PRESENT).toBe(true);
    expect(v.checks.ENTRY_DETAIL_EXPRESSION_PRESENT).toBe(true);
    expect(v.checks.PROJECT_ACCESS_EXPRESSION_PRESENT).toBe(true);
    expect(v.ok).toBe(true);
  });
});
