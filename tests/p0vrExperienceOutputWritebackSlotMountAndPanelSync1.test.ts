/**
 * P0.VR.EXPERIENCE-OUTPUT-WRITEBACK-SLOT-MOUNT-AND-PANEL-SYNC1
 */

import { describe, expect, it } from 'vitest';

import {
  applyExperiencePackageWritebackAfterGeneration,
  materializeExperienceExpressionOutput,
  reconcileAndMountExistingExperienceArtifacts,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceOutputSlotWriteback.js';
import { visualStateCardStatus } from '../shared/site00-design-workspace-production/pageConceptPipeline/experiencePackageMaterialization.js';
import type { ExperienceExpressionAuthority } from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

function shellAuthority(): ExperienceExpressionAuthority {
  return {
    id: 'peea-test',
    projectId: 'ndxbook',
    pageId: 'page-overview',
    sourceMobileAuthorityId: 'mob-art',
    sourceMobileArtifactId: 'mob-art',
    sourceConceptId: 'concept-1',
    status: 'PARTIAL_FAILURE',
    patterns: [],
    behaviorContract: '',
    visualStateContract: '',
    responsiveRules: [],
    visualStates: [
      {
        stateId: 'base',
        label: 'Base',
        patternType: 'BASE_PAGE',
        previewImageUri: 'data:base',
        caption: '',
        sourceProvider: 'INHERITED_MOBILE',
        materializationStatus: 'INHERITED',
      },
      {
        stateId: 'menu',
        label: 'Menu',
        patternType: 'MENU',
        previewImageUri: null,
        caption: '',
        sourceProvider: 'FAL_EXPERIENCE',
      },
      {
        stateId: 'entry-detail',
        label: 'Entry',
        patternType: 'DRAWER',
        previewImageUri: null,
        caption: '',
        sourceProvider: 'FAL_EXPERIENCE',
      },
      {
        stateId: 'project-access',
        label: 'Access',
        patternType: 'OVERLAY',
        previewImageUri: null,
        caption: '',
        sourceProvider: 'FAL_EXPERIENCE',
      },
    ],
    packagingPlan: {
      authorityId: 'peea-test',
      groupedOutputs: [{ stateId: 'menu' }, { stateId: 'entry-detail' }, { stateId: 'project-access' }],
      totalPlannedOutputs: 3,
      packagingReasoning: 'test',
      promptVersion: 'v1',
      candidatePrompts: [{ route: '/projects/design/ndxbook/overview' }],
    } as never,
  };
}

describe('P0.VR.EXPERIENCE-OUTPUT-WRITEBACK-SLOT-MOUNT-AND-PANEL-SYNC1', () => {
  it('materializeExperienceExpressionOutput mounts menu slot and updates aggregates', () => {
    let authority = shellAuthority();
    authority = materializeExperienceExpressionOutput({
      authority,
      expressionType: 'MENU_EXPANDED_NAV',
      stateId: 'menu',
      artifactId: 'pcga-EXP-MENU-abc-R1',
      artifactUri: 'data:menu-ready',
      providerRequestId: 'fal-99',
      sourceAuthorityId: 'concept-1',
    });
    const menu = authority.visualStates.find((v) => v.stateId === 'menu');
    expect(menu?.previewImageUri).toBe('data:menu-ready');
    expect(authority.packageOutputIndex?.outputs.MENU_EXPANDED_NAV?.status).toBe('READY');
    expect(authority.packageOutputIndex?.aggregates.falReadyCount).toBe(1);
    expect(visualStateCardStatus(menu!, authority.status, authority)).toBe('READY');
  });

  it('applyExperiencePackageWritebackAfterGeneration mounts from FAL job', () => {
    const authority = shellAuthority();
    const state = {
      projectId: 'ndxbook',
      pageId: 'page-overview',
      functionContract: { route: '/projects/design/ndxbook/overview', regions: [], interactions: [], immutableBehaviors: [] },
      pipelineSet: {
        viewportAuthorityFamily: { confirmedMobileConceptId: 'concept-1', selectedMobileConceptId: 'concept-1' },
      },
      generationJobs: [],
    } as unknown as PageConceptGenerationState;

    const next = applyExperiencePackageWritebackAfterGeneration({
      authority,
      state,
      jobs: [
        {
          artifactId: 'pcga-EXP-MENU-job1',
          projectId: 'ndxbook',
          pageId: 'page-overview',
          renditionSlot: 'RENDITION_A',
          viewport: 'MOBILE',
          captureSetId: 'c',
          projectContextVersion: '1',
          pageContextVersion: '1',
          functionContractId: 'fc',
          creativeInjectionId: 'ci',
          gpt2AuthorityConceptId: 'concept-1',
          renditionId: 'r1',
          provider: 'FAL_EXPERIENCE',
          model: 'm',
          providerJobId: 'fal-job',
          promptVersion: 'v1',
          createdAt: new Date().toISOString(),
          status: 'READY',
          artifactPath: null,
          imageUri: 'data:menu-from-job',
          width: 1,
          height: 1,
          displayTitle: 'MENU EXPANDED NAV',
        },
      ],
    });

    expect(next.visualStates.find((v) => v.stateId === 'menu')?.previewImageUri).toBe('data:menu-from-job');
    expect(next.packageOutputIndex?.outputs.MENU_EXPANDED_NAV?.artifactId).toBe('pcga-EXP-MENU-job1');
  });

  it('reconcileAndMountExistingExperienceArtifacts repairs orphaned menu without new provider calls', () => {
    const authority = shellAuthority();
    const state = {
      projectId: 'ndxbook',
      pageId: 'page-overview',
      functionContract: { route: '/projects/design/ndxbook/overview', regions: [], interactions: [], immutableBehaviors: [] },
      pipelineSet: { viewportAuthorityFamily: { confirmedMobileConceptId: 'concept-1' } },
      generationJobs: [
        {
          artifactId: 'pcga-EXP-MENU-recovered',
          projectId: 'ndxbook',
          pageId: 'alias-page-id',
          renditionSlot: 'RENDITION_A',
          viewport: 'MOBILE',
          captureSetId: 'c',
          projectContextVersion: '1',
          pageContextVersion: '1',
          functionContractId: 'fc',
          creativeInjectionId: 'ci',
          gpt2AuthorityConceptId: 'concept-1',
          renditionId: 'r1',
          provider: 'FAL_EXPERIENCE',
          model: 'm',
          providerJobId: 'fal-old',
          promptVersion: 'v1',
          createdAt: new Date().toISOString(),
          status: 'READY',
          artifactPath: null,
          imageUri: 'data:recovered-menu',
          width: 1,
          height: 1,
          displayTitle: 'MENU / EXPANDED NAV',
        },
      ],
    } as unknown as PageConceptGenerationState;

    const { authority: repaired, mountedCount } = reconcileAndMountExistingExperienceArtifacts({
      authority,
      state,
      route: '/projects/design/ndxbook/overview',
    });
    expect(repaired.visualStates.find((v) => v.stateId === 'menu')?.previewImageUri).toBe('data:recovered-menu');
    const slot = repaired.packageOutputIndex?.outputs.MENU_EXPANDED_NAV?.status;
    expect(slot).not.toBe('MISSING');
  });
});
