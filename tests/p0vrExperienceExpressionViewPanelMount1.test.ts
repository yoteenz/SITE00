/**
 * FAL experience outputs mount in review panel; hero rail VIEW opens without re-generating.
 */

import { describe, expect, it } from 'vitest';

import { buildGpt2ViewportFamilyHeroRailStages } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import {
  pickRicherExperienceExpressionAuthority,
  shouldDispatchGenerateExperienceOnReviewOpen,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptExperienceReviewOpenPolicy.js';
import { preserveLocalViewportAuthorityFamilyProgressAfterServerMerge } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamilyPersistence.js';
import { resolveExperienceReviewPanelMode } from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceReviewPresentation.js';
import type { ExperienceExpressionAuthority } from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

function authorityStub(partial: Partial<ExperienceExpressionAuthority>): ExperienceExpressionAuthority {
  return {
    authorityId: 'exp-auth-1',
    status: 'READY_FOR_REVIEW',
    provider: 'FAL',
    sourceConceptId: 'concept-a',
    visualStates: [],
    packagingPlan: null,
    outputLineage: [],
    patterns: [],
    responsiveRules: [],
    ...partial,
  } as ExperienceExpressionAuthority;
}

describe('P0.VR.EXPERIENCE-EXPRESSION-VIEW-PANEL-MOUNT1', () => {
  it('hero rail switches CREATE to VIEW after FAL package is ready', () => {
    const authority = authorityStub({
      status: 'READY_FOR_REVIEW',
      visualStates: [
        {
          stateId: 'base',
          label: 'BASE PAGE',
          patternType: 'BASE_PAGE',
          previewImageUri: 'data:image/png;base64,aaa',
          caption: 'base',
          sourceProvider: 'INHERITED_MOBILE',
        },
        {
          stateId: 'menu',
          label: 'MENU',
          patternType: 'MENU',
          previewImageUri: 'data:image/png;base64,bbb',
          caption: 'menu',
          sourceProvider: 'FAL_EXPERIENCE',
        },
      ],
    });
    const pipelineSet = {
      viewportAuthorityFamily: {
        selectedMobileConceptId: 'concept-a',
        confirmedMobileConceptId: 'concept-a',
        mobileAuthorityStatus: 'CONFIRMED',
        experienceExpressionStatus: 'READY_FOR_REVIEW',
        status: 'MOBILE_CONFIRMED',
        updatedAt: new Date().toISOString(),
      },
      experienceExpressionAuthority: authority,
      mobileConcepts: [{ conceptId: 'concept-a', slot: 'MOBILE_CONCEPT_A' }],
    } as PageConceptGenerationState['pipelineSet'];

    const stage = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet,
      selectedMobileConceptId: 'concept-a',
      selectedGalleryCandidateId: 'concept-a',
      selectedGalleryCandidateSlotLabel: 'CONCEPT A',
      generating: false,
      generationJobs: [],
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    }).find((s) => s.id === 'experience')!;

    expect(stage.actions.some((a) => a.id === 'vf-create-experience')).toBe(false);
    const view = stage.actions.find((a) => a.id === 'vf-review-experience');
    expect(view?.label).toBe('VIEW EXPERIENCE');
    expect(shouldDispatchGenerateExperienceOnReviewOpen(pipelineSet)).toBe(false);
  });

  it('review panel mounts FAL previews when status is still GENERATING but outputs are materialized', () => {
    const authority = authorityStub({
      projectId: 'ndxbook',
      pageId: 'page-overview',
      status: 'GENERATING',
      visualStates: [
        {
          stateId: 'base',
          label: 'BASE PAGE',
          patternType: 'BASE_PAGE',
          previewImageUri: 'data:image/png;base64,aaa',
          caption: 'base',
          sourceProvider: 'INHERITED_MOBILE',
        },
        {
          stateId: 'menu',
          label: 'MENU',
          patternType: 'MENU',
          previewImageUri: 'data:image/png;base64,bbb',
          caption: 'menu',
          sourceProvider: 'FAL_EXPERIENCE',
        },
      ],
    });
    expect(resolveExperienceReviewPanelMode(authority)).toBe('READY');
  });

  it('prefers server READY authority over stale local GENERATING on gallery merge', () => {
    const localGenerating = authorityStub({
      status: 'GENERATING',
      visualStates: [
        {
          stateId: 'base',
          label: 'BASE PAGE',
          patternType: 'BASE_PAGE',
          previewImageUri: 'data:image/png;base64,aaa',
          caption: 'base',
          sourceProvider: 'INHERITED_MOBILE',
        },
      ],
    });
    const serverReady = authorityStub({
      status: 'READY_FOR_REVIEW',
      visualStates: [
        {
          stateId: 'base',
          label: 'BASE PAGE',
          patternType: 'BASE_PAGE',
          previewImageUri: 'data:image/png;base64,aaa',
          caption: 'base',
          sourceProvider: 'INHERITED_MOBILE',
        },
        {
          stateId: 'menu',
          label: 'MENU',
          patternType: 'MENU',
          previewImageUri: 'data:image/png;base64,bbb',
          caption: 'menu',
          sourceProvider: 'FAL_EXPERIENCE',
        },
      ],
    });
    expect(pickRicherExperienceExpressionAuthority(localGenerating, serverReady)?.status).toBe('READY_FOR_REVIEW');

    const base = {
      projectId: 'ndxbook',
      pageId: 'page-1',
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      pipelineSet: {
        selectedMobileConceptId: 'concept-a',
        viewportAuthorityFamily: {
          selectedMobileConceptId: 'concept-a',
          confirmedMobileConceptId: 'concept-a',
          mobileAuthorityStatus: 'CONFIRMED',
          experienceExpressionStatus: 'GENERATING',
          status: 'MOBILE_CONFIRMED',
          updatedAt: new Date().toISOString(),
        },
        experienceExpressionAuthority: localGenerating,
      },
    } as PageConceptGenerationState;

    const merged = {
      ...base,
      pipelineSet: {
        ...base.pipelineSet!,
        viewportAuthorityFamily: {
          ...base.pipelineSet!.viewportAuthorityFamily!,
          experienceExpressionStatus: 'READY_FOR_REVIEW',
        },
        experienceExpressionAuthority: serverReady,
      },
    };

    const out = preserveLocalViewportAuthorityFamilyProgressAfterServerMerge(base, merged);
    expect(out.pipelineSet?.experienceExpressionAuthority?.status).toBe('READY_FOR_REVIEW');
    expect(out.pipelineSet?.viewportAuthorityFamily?.experienceExpressionStatus).toBe('READY_FOR_REVIEW');
  });
});
