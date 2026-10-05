/**
 * P0.VR.RIGHT-RAIL-VISUAL-BUTTON-SYSTEM-RESTORE1 (superseded layout — canonical six-button rail)
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildGpt2ViewportFamilyHeroRailStages,
  CANONICAL_GPT2_HERO_RAIL_BUTTON_COUNT,
  countGpt2HeroRailActions,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import { heroRailButtonSurfaceForAction } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyRailButtonSurface.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function stagesForEmptySelection() {
  return buildGpt2ViewportFamilyHeroRailStages({
    pipelineSet: {
      pipelineSetId: 'ps-empty',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      targetType: 'PAGE',
      captureSetId: 'cap',
      functionContractId: 'fc',
      creativeInjection: null,
      gpt2AuthorityConcept: null,
      renditions: [],
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      mobileConcepts: [],
      createdAt: new Date().toISOString(),
    },
    selectedMobileConceptId: null,
    selectedGalleryCandidateId: null,
    selectedGalleryCandidateSlotLabel: null,
    generating: false,
    generationJobs: [],
    activeViewport: 'MOBILE',
    tabletInterpretationActive: false,
    desktopInterpretationActive: false,
  });
}

describe('P0.VR.RIGHT-RAIL-VISUAL-BUTTON-SYSTEM-RESTORE1', () => {
  it('mobile authority stage renders select and confirm only', () => {
    const mobile = stagesForEmptySelection().find((s) => s.id === 'mobile-authority')!;
    const ids = mobile.actions.map((a) => a.id);
    expect(ids).toEqual(['vf-select-mobile', 'vf-confirm-mobile']);
    expect(mobile.actions.every((a) => a.label.length > 0)).toBe(true);
    expect(mobile.actions.every((a) => heroRailButtonSurfaceForAction(a) === 'disabled' || !a.disabled)).toBe(true);
  });

  it('experience stage renders single expression action', () => {
    const experience = stagesForEmptySelection().find((s) => s.id === 'experience')!;
    expect(experience.actions.map((a) => a.id)).toEqual(['vf-expression']);
    expect(experience.actions[0]!.label).toBe('CREATE EXPRESSION');
    expect(experience.actions.every((a) => a.disabled)).toBe(true);
    expect(experience.actions.every((a) => Boolean(a.disabledReason))).toBe(true);
  });

  it('desktop and tablet stages render base + expression actions', () => {
    const desktop = stagesForEmptySelection().find((s) => s.id === 'desktop')!;
    const tablet = stagesForEmptySelection().find((s) => s.id === 'tablet')!;
    expect(desktop.actions.map((a) => a.id)).toEqual(['vf-run-desktop', 'vf-desktop-expression']);
    expect(tablet.actions.map((a) => a.id)).toEqual(['vf-run-tablet', 'vf-tablet-expression']);
  });

  it('pair stage renders pair review action', () => {
    const pair = stagesForEmptySelection().find((s) => s.id === 'pair')!;
    expect(pair.actions.map((a) => a.id)).toEqual(['vf-pair-review']);
  });

  it('canonical rail has eight total buttons when locked', () => {
    expect(countGpt2HeroRailActions(stagesForEmptySelection())).toBe(CANONICAL_GPT2_HERO_RAIL_BUTTON_COUNT);
  });

  it('disabled actions use disabled surface tier (legible, not lime-on-white ghost)', () => {
    const blocked = stagesForEmptySelection()
      .flatMap((s) => s.actions)
      .filter((a) => a.disabled);
    expect(blocked.length).toBeGreaterThan(3);
    for (const action of blocked) {
      expect(heroRailButtonSurfaceForAction(action)).toBe('disabled');
    }
  });

  it('rail component exposes blocker copy for disabled actions', () => {
    const rail = readFileSync(
      join(root, 'src/site00/components/designBench/opusDirect/DesignViewportFamilyHeroRail.tsx'),
      'utf8',
    );
    expect(rail).toContain('actionBlocker');
    expect(rail).toContain('data-action-disabled');
  });

  it('CSS keeps disabled hero workflow buttons filled and high-contrast', () => {
    const css = readFileSync(join(root, 'src/site00/styles/site00-twin-opus-direct.css'), 'utf8');
    expect(css).toContain('.tod-rail__actionBlocker');
    expect(css).toMatch(/\.tod-rail--heroWorkflow[\s\S]*color: #303030/);
  });
});
