/**
 * Experience Review panel is the generate/refine hub; hero rail only opens the panel.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildGpt2ViewportFamilyHeroRailStages } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';

const TWIN_WORKSPACE_TS = readFileSync(
  resolve('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts'),
  'utf8',
);
const SECTIONS_TSX = readFileSync(
  resolve('src/site00/components/designBench/pageConceptGenerator/experienceReview/ExperienceReviewSections.tsx'),
  'utf8',
);

describe('P0.VR.EXPERIENCE-PANEL-GENERATE-REFINE-HUB1', () => {
  it('hero rail OPEN / VIEW actions only open the experience review overlay', () => {
    expect(TWIN_WORKSPACE_TS).toContain("case 'vf-create-experience':");
    expect(TWIN_WORKSPACE_TS).toContain("case 'vf-review-experience':");
    expect(TWIN_WORKSPACE_TS).toContain('pageConceptGeneration.openExperienceReview();');
    expect(TWIN_WORKSPACE_TS).not.toMatch(
      /case 'vf-create-experience':[\s\S]*?dispatchViewportFamilyAction\(\{ type: 'generateExperienceExpression'/,
    );
    expect(TWIN_WORKSPACE_TS).not.toMatch(
      /case 'vf-review-experience':[\s\S]*?dispatchViewportFamilyAction\(\{ type: 'generateExperienceExpression'/,
    );
  });

  it('empty experience stage uses OPEN EXPERIENCE rail label', () => {
    const stage = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: {
        viewportAuthorityFamily: {
          selectedMobileConceptId: 'concept-b',
          confirmedMobileConceptId: 'concept-b',
          mobileAuthorityStatus: 'CONFIRMED',
          experienceExpressionStatus: 'NOT_STARTED',
          status: 'MOBILE_CONFIRMED',
          updatedAt: new Date().toISOString(),
        },
        mobileConcepts: [{ conceptId: 'concept-b', slot: 'MOBILE_CONCEPT_B' }],
      } as never,
      selectedMobileConceptId: 'concept-b',
      selectedGalleryCandidateId: 'concept-b',
      selectedGalleryCandidateSlotLabel: 'CONCEPT B',
      generating: false,
      generationJobs: [],
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    }).find((s) => s.id === 'experience')!;
    expect(stage.actions[0]?.label).toBe('OPEN EXPERIENCE');
    expect(stage.valueLine).toContain('OPEN PANEL TO GENERATE');
  });

  it('empty panel footer exposes generate for mobile thumb reach', () => {
    expect(SECTIONS_TSX).toContain('data-testid="experience-review-action-bar-generate"');
    expect(SECTIONS_TSX).toContain('GENERATE EXPERIENCE PACKAGE');
  });
});
