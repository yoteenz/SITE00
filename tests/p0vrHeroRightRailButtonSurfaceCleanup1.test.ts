/**
 * P0.VR.HERO-RIGHT-RAIL-BUTTON-SURFACE-CLEANUP1
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { buildGpt2ViewportFamilyHeroRailStages } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import {
  heroRailActionRequiresFilledSurface,
  heroRailActionToneMatchesLabelContract,
  heroRailButtonSurfaceForAction,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyRailButtonSurface.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const directCss = readFileSync(join(root, 'src/site00/styles/site00-twin-opus-direct.css'), 'utf8');
const listCss = readFileSync(join(root, 'src/site00/styles/site00-twin-opus-list.css'), 'utf8');
const railComponent = readFileSync(
  join(root, 'src/site00/components/designBench/opusDirect/DesignViewportFamilyHeroRail.tsx'),
  'utf8',
);

function sampleStages() {
  return buildGpt2ViewportFamilyHeroRailStages({
    pipelineSet: {
      pipelineSetId: 'ps-1',
      projectId: 'p',
      pageId: 'page',
      targetType: 'PAGE',
      captureSetId: 'c',
      functionContractId: 'f',
      creativeInjection: null,
      gpt2AuthorityConcept: null,
      renditions: [],
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      mobileConcepts: [
        {
          conceptId: 'mc-b',
          slot: 'MOBILE_CONCEPT_B',
          artifactId: 'art-b',
          imageUri: null,
          status: 'READY',
          createdAt: new Date().toISOString(),
        },
      ],
      viewportAuthorityFamily: {
        familyId: 'fam',
        cgptBriefId: 'b',
        cgptBriefVersion: '1',
        selectedMobileConceptId: 'mc-b',
        selectedMobileVersion: 'v1',
        mobileArtifactId: 'art-b',
        mobileAuthorityStatus: 'CONFIRMED',
        confirmedMobileConceptId: 'mc-b',
        confirmedMobileArtifactId: 'art-b',
        tabletArtifactId: null,
        desktopArtifactId: null,
        tabletInterpretationId: null,
        tabletVersion: null,
        desktopInterpretationId: null,
        desktopVersion: null,
        experienceExpressionContractId: 'ee-1',
        experienceExpressionVersion: '1',
        experienceExpressionStatus: 'READY_FOR_REVIEW',
        skinContractVersion: '1',
        skinContractId: null,
        status: 'MOBILE_AUTHORITY_CONFIRMED',
        viewportFamilyApprovalId: null,
        familyLockId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      experienceExpressionAuthority: {
        id: 'peea-1',
        projectId: 'p',
        pageId: 'page',
        sourceMobileAuthorityId: 'mc-b',
        sourceMobileArtifactId: 'art-b',
        sourceConceptId: 'mc-b',
        status: 'READY_FOR_REVIEW',
        patterns: [],
        behaviorContract: 'x',
        visualStateContract: 'y',
        responsiveRules: [],
        visualStates: [],
        generatedAt: new Date().toISOString(),
        approvedAt: null,
      },
      createdAt: new Date().toISOString(),
    },
    selectedMobileConceptId: 'mc-b',
    selectedGalleryCandidateId: 'mc-b',
    selectedGalleryCandidateSlotLabel: 'CONCEPT B',
    generating: false,
    generationJobs: [],
    activeViewport: 'MOBILE',
    tabletInterpretationActive: false,
    desktopInterpretationActive: false,
  });
}

describe('P0.VR.HERO-RIGHT-RAIL-BUTTON-SURFACE-CLEANUP1', () => {
  it('primary actions use lime surface tier', () => {
    const approve = sampleStages()
      .flatMap((s) => s.actions)
      .find((a) => a.id === 'vf-approve-experience');
    expect(approve?.tone).toBe('lime');
    expect(heroRailButtonSurfaceForAction(approve!)).toBe('primary');
  });

  it('secondary review actions use ink (black) surface tier', () => {
    const review = sampleStages()
      .flatMap((s) => s.actions)
      .find((a) => a.id === 'vf-review-experience');
    expect(review?.tone).toBe('ink');
    expect(heroRailButtonSurfaceForAction(review!)).toBe('secondary');
  });

  it('tertiary change authority uses ghost surface tier', () => {
    const change = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: {
        pipelineSetId: 'ps-1',
        projectId: 'p',
        pageId: 'page',
        targetType: 'PAGE',
        captureSetId: 'c',
        functionContractId: 'f',
        creativeInjection: null,
        gpt2AuthorityConcept: null,
        renditions: [],
        viewportAuthorityFamily: {
          familyId: 'fam',
          cgptBriefId: 'b',
          cgptBriefVersion: '1',
          selectedMobileConceptId: 'mc-b',
          selectedMobileVersion: 'v1',
          mobileArtifactId: 'art-b',
          mobileAuthorityStatus: 'SELECTED',
          tabletArtifactId: null,
          desktopArtifactId: null,
          tabletInterpretationId: null,
          tabletVersion: null,
          desktopInterpretationId: null,
          desktopVersion: null,
          experienceExpressionContractId: null,
          experienceExpressionVersion: null,
          skinContractVersion: '1',
          skinContractId: null,
          status: 'MOBILE_SELECTED',
          viewportFamilyApprovalId: null,
          familyLockId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      },
      selectedMobileConceptId: 'mc-b',
      selectedGalleryCandidateId: 'mc-b',
      selectedGalleryCandidateSlotLabel: 'CONCEPT B',
      generating: false,
      generationJobs: [],
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    })
      .flatMap((s) => s.actions)
      .find((a) => a.id === 'vf-change-mobile');
    expect(change?.tone).toBe('ghost');
    expect(heroRailButtonSurfaceForAction(change!)).toBe('tertiary');
  });

  it('disabled gate actions use muted surface tier (not lime text)', () => {
    const lockedTablet = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: {
        pipelineSetId: 'ps-1',
        projectId: 'p',
        pageId: 'page',
        targetType: 'PAGE',
        captureSetId: 'c',
        functionContractId: 'f',
        creativeInjection: null,
        gpt2AuthorityConcept: null,
        renditions: [],
        viewportAuthorityFamily: {
          familyId: 'fam',
          cgptBriefId: 'b',
          cgptBriefVersion: '1',
          selectedMobileConceptId: 'mc-b',
          selectedMobileVersion: 'v1',
          mobileArtifactId: 'art-b',
          mobileAuthorityStatus: 'CONFIRMED',
          confirmedMobileConceptId: 'mc-b',
          tabletArtifactId: null,
          desktopArtifactId: null,
          tabletInterpretationId: null,
          tabletVersion: null,
          desktopInterpretationId: null,
          desktopVersion: null,
          experienceExpressionContractId: null,
          experienceExpressionVersion: null,
          skinContractVersion: '1',
          skinContractId: null,
          status: 'MOBILE_AUTHORITY_CONFIRMED',
          viewportFamilyApprovalId: null,
          familyLockId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      },
      selectedMobileConceptId: 'mc-b',
      selectedGalleryCandidateId: 'mc-b',
      selectedGalleryCandidateSlotLabel: 'CONCEPT B',
      generating: false,
      generationJobs: [],
      activeViewport: 'TABLET',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    })
      .flatMap((s) => s.actions)
      .find((a) => a.id === 'vf-run-tablet');
    expect(lockedTablet?.disabled).toBe(true);
    expect(lockedTablet?.tone).toBe('ghost');
    expect(heroRailButtonSurfaceForAction(lockedTablet!)).toBe('disabled');
  });

  it('all rail actions satisfy label/tone contract and filled surface rule', () => {
    for (const action of sampleStages().flatMap((s) => s.actions)) {
      expect(heroRailActionRequiresFilledSurface(action)).toBe(true);
      expect(heroRailActionToneMatchesLabelContract(action)).toBe(true);
    }
  });

  it('CSS restores primary/secondary/tertiary/disabled hero workflow surfaces', () => {
    expect(directCss).toContain('.tod-rail--heroWorkflow .tod-rail__action--surface-primary');
    expect(directCss).toContain('background: var(--tod-lime)');
    expect(directCss).toContain('.tod-rail--heroWorkflow .tod-rail__action--surface-secondary');
    expect(directCss).toContain('background: #000');
    expect(directCss).toContain('.tod-rail--heroWorkflow .tod-rail__action--surface-tertiary');
    expect(directCss).toContain('.tod-rail--heroWorkflow .tod-rail__action--surface-disabled');
    expect(listCss).toContain('.tod-lv-rail--heroWorkflow .tod-lv-rail__action--surface-primary');
    expect(listCss).toContain('.tod-lv-rail--heroWorkflow .tod-lv-rail__action--surface-disabled');
  });

  it('rail buttons expose data-action-surface for QA', () => {
    expect(railComponent).toContain('data-action-surface={surface}');
    expect(railComponent).toContain('heroRailButtonSurfaceForAction');
  });

  it('hero workflow buttons stay full width in rail column', () => {
    expect(directCss).toMatch(/\.tod-rail--heroWorkflow \.tod-rail__vfStage \.tod-rail__action[\s\S]*width: 100%/);
    expect(listCss).toMatch(/\.tod-lv-rail--heroWorkflow \.tod-lv-rail__vfStage \.tod-lv-rail__action[\s\S]*width: 100%/);
  });
});
