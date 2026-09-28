/**
 * P0.VR.RIGHT-RAIL-VISUAL-BUTTON-SYSTEM-RESTORE1
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { buildGpt2ViewportFamilyHeroRailStages } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import { heroRailButtonSurfaceForAction } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyRailButtonSurface.js';

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

function stagesForEmptySelection() {
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
  });
}

describe('P0.VR.RIGHT-RAIL-VISUAL-BUTTON-SYSTEM-RESTORE1', () => {
  it('mobile authority stage always renders select, confirm, and change actions', () => {
    const mobile = stagesForEmptySelection().find((s) => s.id === 'mobile-authority')!;
    const ids = mobile.actions.map((a) => a.id);
    expect(ids).toEqual(['vf-select-mobile', 'vf-confirm-mobile', 'vf-change-mobile']);
    expect(mobile.actions.every((a) => a.label.length > 0)).toBe(true);
    expect(mobile.actions.every((a) => heroRailButtonSurfaceForAction(a) === 'disabled' || !a.disabled)).toBe(true);
  });

  it('experience stage always renders open, review, and approve actions', () => {
    const experience = stagesForEmptySelection().find((s) => s.id === 'experience')!;
    const ids = experience.actions.map((a) => a.id);
    expect(ids).toEqual(['vf-create-experience', 'vf-review-experience', 'vf-approve-experience']);
    expect(experience.actions.every((a) => a.disabled)).toBe(true);
    expect(experience.actions.every((a) => Boolean(a.disabledReason))).toBe(true);
  });

  it('viewport family stage always renders review, approve, and lock actions', () => {
    const family = stagesForEmptySelection().find((s) => s.id === 'viewport-family')!;
    const ids = family.actions.map((a) => a.id);
    expect(ids).toEqual(['vf-review-family', 'vf-approve-family', 'vf-lock-family']);
  });

  it('tablet stage always renders generate and review actions (not empty when locked)', () => {
    const tablet = stagesForEmptySelection().find((s) => s.id === 'tablet')!;
    expect(tablet.actions.some((a) => a.id === 'vf-run-tablet')).toBe(true);
    expect(tablet.actions.some((a) => a.id === 'vf-review-tablet')).toBe(true);
    expect(tablet.actions.length).toBeGreaterThanOrEqual(2);
  });

  it('disabled actions use disabled surface tier (legible, not lime-on-white ghost)', () => {
    const blocked = stagesForEmptySelection()
      .flatMap((s) => s.actions)
      .filter((a) => a.disabled);
    expect(blocked.length).toBeGreaterThan(8);
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
