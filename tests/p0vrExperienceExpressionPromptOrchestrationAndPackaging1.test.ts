/**
 * P0.VR.EXPERIENCE-EXPRESSION-PROMPT-ORCHESTRATION-AND-PACKAGING1
 */

import { describe, expect, it } from 'vitest';

import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import {
  assertModularPromptContract,
  buildExperienceExpressionPromptPipeline,
  decomposeExperienceExpressionPrompts,
  planExperienceExpressionPackaging,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptExperienceExpressionFalPlan.js';
import { buildPageGpt2ViewportInterpretationPackage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2ViewportInterpretationPackage.js';
import type { PageConceptCgptCreativeBrief, PageCreativeInjection, PageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const functionContract: PageFunctionContract = {
  contractId: 'fc-overview',
  version: 'v1',
  route: '/projects/design/ndxbook/overview',
  regions: ['hero', 'nav menu', 'content drawer panel', 'modal overlay inspect'],
  interactions: ['open menu', 'slide drawer', 'open modal dialog'],
  immutableBehaviors: ['bottom nav locked', 'no publish share drift'],
};

const cgptBrief: PageConceptCgptCreativeBrief = {
  briefId: 'brief-1',
  version: 'v1',
  creativePremise: 'Editorial archival index for NDXBOOK overview.',
  pageStory: 'Founder reviews project intelligence.',
  compositionStrategy: 'Vertical editorial stack.',
  interactionCharacter: 'Calm inspect-first',
};

const injection: PageCreativeInjection = {
  injectionId: 'inj-1',
  interactionCharacter: 'Calm inspect-first',
  immutableRequirements: ['Preserve overview hierarchy'],
};

describe('P0.VR.EXPERIENCE-EXPRESSION-PROMPT-ORCHESTRATION-AND-PACKAGING1', () => {
  const skin = compileProjectSkinContract('ndxbook');

  it('creates one modular prompt per major expression type', () => {
    const prompts = decomposeExperienceExpressionPrompts({
      authorityId: 'auth-1',
      conceptId: 'concept-b',
      route: functionContract.route,
      territoryLabel: 'EDITORIAL SIGNAL',
      skinContract: skin,
      cgptBrief,
      injection,
      functionContract,
    });
    const types = prompts.map((p) => p.expressionType);
    expect(types).toContain('BASE_PAGE_AT_REST');
    expect(types).toContain('MENU_EXPANDED_NAV');
    expect(types).toContain('PANEL_OR_DRAWER');
    expect(types).toContain('OVERLAY_OR_DETAIL_STATE');
    expect(prompts.filter((p) => p.expressionType !== 'BASE_PAGE_AT_REST').length).toBeGreaterThanOrEqual(3);
    for (const p of prompts) {
      if (p.expressionType === 'BASE_PAGE_AT_REST') continue;
      expect(p.promptText).toContain('EXPRESSION TYPE:');
      expect(p.promptText).toContain('PRIMARY GOAL:');
      expect(p.promptText).toContain(p.conceptId);
      expect(p.promptText).not.toContain('describe everything');
    }
  });

  it('packages outputs within 5 total and rejects broad legacy prompts', () => {
    const { plan, falTargets } = buildExperienceExpressionPromptPipeline({
      projectId: 'other-project',
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
    expect(plan.totalPlannedOutputs).toBeGreaterThanOrEqual(1);
    expect(plan.totalPlannedOutputs).toBeLessThanOrEqual(4);
    expect(falTargets.length).toBe(plan.totalPlannedOutputs);
    expect(plan.totalPlannedOutputs + 1).toBeLessThanOrEqual(5);
    expect(() =>
      assertModularPromptContract(
        'SITE 00 — EXPERIENCE EXPRESSION (same page, approved mobile authority as visual anchor)\nRoute: /x',
        'MENU_EXPANDED_NAV',
      ),
    ).toThrow(/EXPERIENCE_BROAD_PROMPT_REJECTED/);
  });

  it('does not combine overlay with menu (unrelated grouping)', () => {
    const prompts = decomposeExperienceExpressionPrompts({
      authorityId: 'auth-2',
      conceptId: 'concept-b',
      route: functionContract.route,
      territoryLabel: 'T',
      skinContract: skin,
      cgptBrief,
      injection,
      functionContract,
    });
    const plan = planExperienceExpressionPackaging({
      authorityId: 'auth-2',
      conceptId: 'concept-b',
      candidatePrompts: prompts,
    });
    for (const group of plan.groupedOutputs) {
      const hasOverlay = group.groupedExpressionTypes.includes('OVERLAY_OR_DETAIL_STATE');
      const hasMenu = group.groupedExpressionTypes.includes('MENU_EXPANDED_NAV');
      if (hasOverlay && group.groupedExpressionTypes.length > 1) {
        expect(hasMenu).toBe(false);
      }
    }
  });

  it('includes experience package lineage in tablet/desktop prompt handoff', () => {
    const overlayPatterns = [
      'EXPERIENCE VISUAL PACKAGE:',
      'PACKAGING: modular v2',
      'MENU / EXPANDED NAV [SINGLE]: MENU_EXPANDED_NAV',
    ];
    const pkg = buildPageGpt2ViewportInterpretationPackage({
      target: 'TABLET',
      mobileAuthorityBase64: 'aaa',
      selectedMobileConceptId: 'concept-b',
      mobileArtifactId: 'art-b',
      mobileRationale: 'Concept B authority',
      tabletInterpretationId: null,
      tabletArtifactBase64: null,
      creativeInjection: injection,
      cgptBrief,
      functionContract,
      skinContract: skin,
      experienceContract: {
        contractId: 'ee-1',
        projectId: 'ndxbook',
        pageId: 'overview',
        selectedMobileConceptId: 'concept-b',
        skinContractVersion: skin.version,
        cgptBriefId: cgptBrief.briefId,
        overlayPatterns,
        version: 'v1',
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      pageContextSummary: 'overview',
      pageContentSummary: 'content',
    });
    expect(pkg.prompt).toContain('MENU / EXPANDED NAV');
    expect(pkg.prompt).toContain('EXPERIENCE EXPRESSION');
    expect(pkg.lineage.experienceExpressionContractId).toBe('ee-1');
  });
});
