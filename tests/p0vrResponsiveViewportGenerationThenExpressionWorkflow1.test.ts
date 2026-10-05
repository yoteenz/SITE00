/**
 * P0.VR.RESPONSIVE-VIEWPORT-GENERATION-THEN-EXPRESSION-WORKFLOW1
 */

import { describe, expect, it } from 'vitest';

import {
  buildGpt2ViewportFamilyHeroRailStages,
  CANONICAL_GPT2_HERO_RAIL_BUTTON_COUNT,
  countGpt2HeroRailActions,
  findGpt2HeroRailAction,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import {
  pageConceptApplyDesktopInterpretation,
  pageConceptGenerateViewportExpression,
  pageConceptApproveViewportExpression,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
function familyConfirmedWithExperienceApproved() {
  return {
    familyId: 'fam',
    cgptBriefId: 'b',
    cgptBriefVersion: '1',
    selectedMobileConceptId: 'mc-a',
    confirmedMobileConceptId: 'mc-a',
    mobileArtifactId: 'art-m',
    mobileAuthorityStatus: 'CONFIRMED' as const,
    desktopArtifactId: null,
    tabletArtifactId: null,
    experienceExpressionContractId: 'eec',
    experienceExpressionVersion: '1',
    experienceExpressionStatus: 'APPROVED' as const,
    skinContractVersion: '1',
    skinContractId: null,
    status: 'EXPERIENCE_DEFINED' as const,
    tabletInterpretationId: null,
    tabletVersion: null,
    desktopInterpretationId: null,
    desktopVersion: null,
    viewportFamilyApprovalId: null,
    familyLockId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function rail(pipelineSet: object | null) {
  return buildGpt2ViewportFamilyHeroRailStages({
    pipelineSet: pipelineSet as never,
    selectedMobileConceptId: 'mc-a',
    selectedGalleryCandidateId: 'mc-a',
    selectedGalleryCandidateSlotLabel: 'CONCEPT A',
    generating: false,
    generationJobs: [],
    activeViewport: 'MOBILE',
    tabletInterpretationActive: false,
    desktopInterpretationActive: false,
  });
}

describe('P0.VR.RESPONSIVE-VIEWPORT-GENERATION-THEN-EXPRESSION-WORKFLOW1', () => {
  it('canonical rail has eight workflow controls in desktop-before-tablet order', () => {
    const stages = rail(null);
    expect(countGpt2HeroRailActions(stages)).toBe(CANONICAL_GPT2_HERO_RAIL_BUTTON_COUNT);
    expect(stages.map((s) => s.id)).toEqual(['mobile-authority', 'experience', 'desktop', 'tablet', 'pair']);
    const ids = stages.flatMap((s) => s.actions.map((a) => a.id));
    expect(ids).toEqual([
      'vf-select-mobile',
      'vf-confirm-mobile',
      'vf-expression',
      'vf-run-desktop',
      'vf-desktop-expression',
      'vf-run-tablet',
      'vf-tablet-expression',
      'vf-pair-review',
    ]);
  });

  it('desktop expression stays disabled until desktop base screen exists', () => {
    const ps = {
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      viewportAuthorityFamily: familyConfirmedWithExperienceApproved(),
      experienceExpressionAuthority: {
        id: 'mexp',
        status: 'APPROVED',
        visualStates: [{ stateId: 'base', label: 'Base', patternType: 'BASE_PAGE', previewImageUri: null, caption: 'x' }],
        approvedAt: new Date().toISOString(),
      },
    };
    const desktopExpr = findGpt2HeroRailAction(rail(ps), 'vf-desktop-expression')!;
    expect(desktopExpr.disabled).toBe(true);
    expect(desktopExpr.disabledReason).toMatch(/base screen first/i);
  });

  it('desktop base apply does not require tablet artifact', () => {
    const state = {
      projectId: 'p',
      pageId: 'page',
      generationStatus: 'IDLE',
      pipelineSet: {
        viewportAuthorityFamily: familyConfirmedWithExperienceApproved(),
      },
    };
    const applied = pageConceptApplyDesktopInterpretation(state as never, {
      job: { artifactId: 'desktop-art', provider: 'GPT2_DESKTOP', status: 'READY' } as never,
      interpretationId: 'pg2d-1',
      version: 'v1',
    });
    expect(applied.state.pipelineSet?.viewportAuthorityFamily?.desktopArtifactId).toBe('desktop-art');
    expect(applied.state.pipelineSet?.viewportAuthorityFamily?.tabletArtifactId).toBeNull();
  });

  it('viewport expression generation requires desktop base artifact', () => {
    const state = {
      projectId: 'p',
      pageId: 'page',
      generationStatus: 'IDLE',
      pipelineSet: {
        viewportAuthorityFamily: familyConfirmedWithExperienceApproved(),
        experienceExpressionAuthority: {
          id: 'mexp',
          status: 'APPROVED',
          visualStates: [],
          approvedAt: new Date().toISOString(),
        },
      },
    };
    expect(() => pageConceptGenerateViewportExpression(state as never, 'DESKTOP')).toThrow(/DESKTOP_VIEWPORT_AUTHORITY/);
  });

  it('regenerating desktop base clears desktop expression package', () => {
    let state = {
      projectId: 'p',
      pageId: 'page',
      generationStatus: 'IDLE',
      pipelineSet: {
        viewportAuthorityFamily: {
          ...familyConfirmedWithExperienceApproved(),
          desktopArtifactId: 'd-old',
        },
        desktopExpressionAuthority: {
          id: 'dexp',
          viewport: 'DESKTOP',
          status: 'APPROVED',
          visualStates: [],
          approvedAt: new Date().toISOString(),
        },
      },
    };
    const applied = pageConceptApplyDesktopInterpretation(state as never, {
      job: { artifactId: 'd-new', provider: 'GPT2_DESKTOP', status: 'READY' } as never,
      interpretationId: 'pg2d-1',
      version: 'v1',
    });
    expect(applied.state.pipelineSet?.desktopExpressionAuthority).toBeNull();
  });

  it('pair review disabled until viewport expressions approved', () => {
    const ps = {
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      viewportAuthorityFamily: {
        ...familyConfirmedWithExperienceApproved(),
        desktopArtifactId: 'd1',
        tabletArtifactId: 't1',
      },
      experienceExpressionAuthority: { id: 'm', status: 'APPROVED', visualStates: [], approvedAt: 'x' },
      desktopExpressionAuthority: {
        id: 'd',
        viewport: 'DESKTOP',
        status: 'READY_FOR_REVIEW',
        visualStates: [],
        approvedAt: null,
      },
      tabletExpressionAuthority: {
        id: 't',
        viewport: 'TABLET',
        status: 'APPROVED',
        visualStates: [],
        approvedAt: 'x',
      },
    };
    const pair = findGpt2HeroRailAction(rail(ps), 'vf-pair-review')!;
    expect(pair.disabled).toBe(true);
  });

  it('pair review active when bases and expressions approved', () => {
    const ps = {
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      viewportAuthorityFamily: {
        ...familyConfirmedWithExperienceApproved(),
        desktopArtifactId: 'd1',
        tabletArtifactId: 't1',
      },
      experienceExpressionAuthority: { id: 'm', status: 'APPROVED', visualStates: [], approvedAt: 'x' },
      desktopExpressionAuthority: {
        id: 'd',
        viewport: 'DESKTOP',
        status: 'APPROVED',
        visualStates: [],
        approvedAt: 'x',
      },
      tabletExpressionAuthority: {
        id: 't',
        viewport: 'TABLET',
        status: 'APPROVED',
        visualStates: [],
        approvedAt: 'x',
      },
    };
    const pair = findGpt2HeroRailAction(rail(ps), 'vf-pair-review')!;
    expect(pair.disabled).toBe(false);
  });

  it('approve desktop expression marks package approved', () => {
    const gen = pageConceptGenerateViewportExpression(
      {
        projectId: 'p',
        pageId: 'page',
        generationStatus: 'IDLE',
        pipelineSet: {
          viewportAuthorityFamily: {
            ...familyConfirmedWithExperienceApproved(),
            desktopArtifactId: 'd1',
          },
          experienceExpressionAuthority: {
            id: 'mexp',
            status: 'APPROVED',
            visualStates: [{ stateId: 's', label: 'S', patternType: 'BASE_PAGE', previewImageUri: null, caption: 'c' }],
            approvedAt: 'x',
          },
        },
      } as never,
      'DESKTOP',
    );
    const approved = pageConceptApproveViewportExpression(gen.state, 'DESKTOP');
    expect(approved.state.pipelineSet?.desktopExpressionAuthority?.status).toBe('APPROVED');
  });
});
