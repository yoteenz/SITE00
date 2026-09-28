/**
 * P0.VR.RIGHT-RAIL-CANONICAL-WORKFLOW-RESTORE2
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildGpt2ViewportFamilyHeroRailStages,
  CANONICAL_GPT2_HERO_RAIL_BUTTON_COUNT,
  countGpt2HeroRailActions,
  listGpt2HeroRailActionIds,
  OBSOLETE_GPT2_HERO_RAIL_ACTION_IDS,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import { heroRailButtonSurfaceForAction } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyRailButtonSurface.js';
import {
  computeHeroAssemblyActions,
  type HeroAssemblyActionsInput,
} from '../shared/site00-design-workspace-production/designHeroAssemblyActions.js';
import {
  createInitialPageAuthorityWorkflow,
} from '../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { createInitialDesignProductionState } from '../shared/site00-design-workspace-production/designProductionStore.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function emptyPipeline() {
  return {
    pipelineSetId: 'ps-empty',
    projectId: 'ndxbook',
    pageId: 'page-overview',
    targetType: 'PAGE' as const,
    captureSetId: 'cap',
    functionContractId: 'fc',
    creativeInjection: null,
    gpt2AuthorityConcept: null,
    renditions: [],
    pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE' as const,
    mobileConcepts: [],
    createdAt: new Date().toISOString(),
  };
}

function baseStages(overrides: Partial<Parameters<typeof buildGpt2ViewportFamilyHeroRailStages>[0]> = {}) {
  return buildGpt2ViewportFamilyHeroRailStages({
    pipelineSet: emptyPipeline(),
    selectedMobileConceptId: null,
    selectedGalleryCandidateId: null,
    selectedGalleryCandidateSlotLabel: null,
    generating: false,
    generationJobs: [],
    activeViewport: 'MOBILE',
    tabletInterpretationActive: false,
    desktopInterpretationActive: false,
    ...overrides,
  });
}

describe('P0.VR.RIGHT-RAIL-CANONICAL-WORKFLOW-RESTORE2', () => {
  it('rail contains exactly eight canonical action slots', () => {
    const stages = baseStages();
    expect(countGpt2HeroRailActions(stages)).toBe(CANONICAL_GPT2_HERO_RAIL_BUTTON_COUNT);
    expect(CANONICAL_GPT2_HERO_RAIL_BUTTON_COUNT).toBe(8);
  });

  it('mobile has select + confirm only', () => {
    const mobile = baseStages().find((s) => s.id === 'mobile-authority')!;
    expect(mobile.actions.map((a) => a.id)).toEqual(['vf-select-mobile', 'vf-confirm-mobile']);
  });

  it('experience has one mutating create/view button', () => {
    const before = baseStages().find((s) => s.id === 'experience')!;
    expect(before.actions).toHaveLength(1);
    expect(before.actions[0]!.id).toBe('vf-expression');
    expect(before.actions[0]!.label).toBe('CREATE EXPRESSION');
  });

  it('desktop and tablet stages each expose base + expression controls', () => {
    const desktop = baseStages().find((s) => s.id === 'desktop')!;
    const tablet = baseStages().find((s) => s.id === 'tablet')!;
    expect(desktop.actions.map((a) => a.id)).toEqual(['vf-run-desktop', 'vf-desktop-expression']);
    expect(tablet.actions.map((a) => a.id)).toEqual(['vf-run-tablet', 'vf-tablet-expression']);
    expect(desktop.actions[0]!.label).toBe('GENERATE DESKTOP');
    expect(tablet.actions[0]!.label).toBe('GENERATE TABLET');
  });

  it('pair review is the final rail button', () => {
    const pair = baseStages().find((s) => s.id === 'pair')!;
    expect(pair.actions).toHaveLength(1);
    expect(pair.actions[0]!.id).toBe('vf-pair-review');
    expect(pair.actions[0]!.label).toBe('PAIR REVIEW');
  });

  it('removes obsolete review/regenerate/use-version stacks from rail ids', () => {
    const ids = listGpt2HeroRailActionIds(baseStages());
    for (const obsolete of OBSOLETE_GPT2_HERO_RAIL_ACTION_IDS) {
      expect(ids).not.toContain(obsolete);
    }
  });

  it('disabled buttons remain visible with disabled surface tier', () => {
    const blocked = baseStages()
      .flatMap((s) => s.actions)
      .filter((a) => a.disabled);
    expect(blocked.length).toBeGreaterThan(0);
    expect(blocked.every((a) => heroRailButtonSurfaceForAction(a) === 'disabled')).toBe(true);
  });

  it('hero create framework stays locked until viewport family confirmed (GPT2)', () => {
    const pageWorkflow = createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview');
    pageWorkflow.promoted.mobileConceptId = 'm1';
    pageWorkflow.promoted.desktopConceptId = 'd1';
    const production = {
      ...createInitialDesignProductionState('ndxbook'),
      promotedMobileConceptId: 'm1',
      promotedDesktopConceptId: 'd1',
    };
    const input: HeroAssemblyActionsInput = {
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      viewport: 'MOBILE',
      production,
      pageWorkflow,
      twinRouteReachable: false,
      twinRoute: '/projects/ndxbook',
      hasPageConceptCandidates: true,
      grokGenerationInProgress: false,
      canonicalGpt2ViewportFamilyPipeline: true,
      viewportFamilyConfirmed: false,
    };
    const locked = computeHeroAssemblyActions(input);
    expect(locked.createFramework.disabled).toBe(true);
    expect(locked.createFramework.disabledReason).toContain('PAIR REVIEW');

    const ready = computeHeroAssemblyActions({ ...input, viewportFamilyConfirmed: true });
    expect(ready.createFramework.disabled).toBe(false);
  });

  it('pair review popup and rail wiring exist in workspace sources', () => {
    const overlays = readFileSync(
      join(root, 'src/site00/components/designBench/opusDirect/TwinOpusDirectOverlays.tsx'),
      'utf8',
    );
    expect(overlays).toContain('VIEWPORT AUTHORITY PAIR REVIEW');
    expect(overlays).toContain('OV-PAIR-REVIEW');

    const panels = readFileSync(
      join(root, 'src/site00/components/designBench/production/designProductionOverlayPanels.tsx'),
      'utf8',
    );
    expect(panels).toContain('CONFIRM VIEWPORT FAMILY');
    expect(panels).toContain('MOBILE AUTHORITY');
    expect(panels).toContain('DESKTOP AUTHORITY');
    expect(panels).toContain('TABLET AUTHORITY');
    expect(panels).toContain('VIEW EXPERIENCE PACKAGE');

    const workspace = readFileSync(
      join(root, 'src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts'),
      'utf8',
    );
    expect(workspace).toContain("case 'vf-pair-review':");
    expect(workspace).toContain('confirmViewportFamilyGpt2');
  });

  it('hero workflow rail does not use independent overflow scroll', () => {
    const css = readFileSync(join(root, 'src/site00/styles/site00-twin-opus-direct.css'), 'utf8');
    const block = css.match(/\.tod-rail--heroWorkflow\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(block).toContain('overflow-y: hidden');
    expect(block).not.toMatch(/overflow-y:\s*auto/);
  });
});
