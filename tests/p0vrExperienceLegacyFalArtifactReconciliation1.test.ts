/**
 * P0.VR.EXPERIENCE-LEGACY-FAL-ARTIFACT-RECONCILIATION-AND-REVIEW-UX-FIX1
 */

import { describe, expect, it } from 'vitest';

import type { ExperienceExpressionAuthority } from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import {
  canonicalExperienceRouteId,
  normalizeLegacyExperienceExpressionType,
  reconcileExistingExperienceArtifacts,
  routesMatchForExperienceRecovery,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceLegacyFalArtifactReconciliation.js';
import {
  buildExperienceReviewPackageStatus,
  resolveExperienceReviewPanelMode,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceReviewPresentation.js';
import { applyExperienceReviewHydrationToState } from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceReviewHydration.js';
import type { PageConceptGeneratedArtifact, PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

function falJob(input: {
  stateId: string;
  pageId: string;
  projectId?: string;
  conceptId?: string;
  suffix: string;
}): PageConceptGeneratedArtifact {
  const artifactId = `pcga-EXP-${input.stateId.toUpperCase().replace(/-/g, '-')}-legacy1`;
  return {
    artifactId,
    projectId: input.projectId ?? 'ndxbook',
    pageId: input.pageId,
    renditionSlot: 'RENDITION_A',
    viewport: 'MOBILE',
    captureSetId: 'cap',
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractId: 'fc',
    creativeInjectionId: 'inj',
    gpt2AuthorityConceptId: input.conceptId ?? 'concept-a',
    renditionId: `pex-${input.stateId}`,
    provider: 'FAL_EXPERIENCE',
    model: 'vitest',
    providerJobId: `job-${input.stateId}`,
    promptVersion: 'page-experience-expression-fal-v2-modular',
    createdAt: new Date().toISOString(),
    status: 'READY',
    artifactPath: null,
    imageUri: `data:image/png;base64,${input.suffix}`,
    width: 780,
    height: 1688,
    displayTitle: input.stateId,
  };
}

function authorityShell(): ExperienceExpressionAuthority {
  return {
    id: 'peea-ndxbook-overview',
    projectId: 'ndxbook',
    pageId: 'registry-overview',
    sourceMobileAuthorityId: 'art-a',
    sourceMobileArtifactId: 'art-a',
    sourceConceptId: 'concept-a',
    status: 'NOT_STARTED',
    patterns: [],
    behaviorContract: '',
    visualStateContract: '',
    responsiveRules: [],
    visualStates: [
      {
        stateId: 'base',
        label: 'BASE PAGE',
        patternType: 'BASE_PAGE',
        previewImageUri: 'data:image/png;base64,base',
        caption: 'base',
        sourceProvider: 'INHERITED_MOBILE',
      },
      {
        stateId: 'menu',
        label: 'MENU / EXPANDED NAV',
        patternType: 'MENU',
        previewImageUri: null,
        caption: 'pending',
        sourceProvider: 'FAL_EXPERIENCE',
      },
      {
        stateId: 'entry-detail',
        label: 'ENTRY DETAIL / PANEL',
        patternType: 'DRAWER',
        previewImageUri: null,
        caption: 'pending',
        sourceProvider: 'FAL_EXPERIENCE',
      },
      {
        stateId: 'project-access',
        label: 'PROJECT ACCESS / OVERLAY',
        patternType: 'OVERLAY',
        previewImageUri: null,
        caption: 'pending',
        sourceProvider: 'FAL_EXPERIENCE',
      },
    ],
    packagingPlan: { groupedOutputs: [{}, {}, {}], totalPlannedOutputs: 3, packagingReasoning: 't', candidatePrompts: [] } as never,
  };
}

function baseState(jobs: PageConceptGeneratedArtifact[]): PageConceptGenerationState {
  return {
    projectId: 'ndxbook',
    pageId: 'registry-overview',
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    generationJobs: jobs,
    pipelineSet: {
      viewportAuthorityFamily: {
        selectedMobileConceptId: 'concept-a',
        confirmedMobileConceptId: 'concept-a',
        mobileAuthorityStatus: 'CONFIRMED',
        experienceExpressionStatus: 'NOT_STARTED',
        status: 'MOBILE_CONFIRMED',
        updatedAt: new Date().toISOString(),
      },
      experienceExpressionAuthority: authorityShell(),
      mobileConcepts: [{ conceptId: 'concept-a', slot: 'MOBILE_CONCEPT_A', imageUri: 'data:image/png;base64,base', artifactId: 'art-a' }],
    } as never,
    functionContract: { route: '/projects/ndxbook', contractId: 'fc', regions: [], interactions: [], immutableBehaviors: [] },
  };
}

describe('P0.VR.EXPERIENCE-LEGACY-FAL-ARTIFACT-RECONCILIATION-AND-REVIEW-UX-FIX1', () => {
  it('normalizes legacy expression labels to canonical types', () => {
    expect(normalizeLegacyExperienceExpressionType('EXPANDED_NAV')).toBe('MENU_EXPANDED_NAV');
    expect(normalizeLegacyExperienceExpressionType('ENTRY_PANEL')).toBe('ENTRY_DETAIL_PANEL');
    expect(normalizeLegacyExperienceExpressionType('ACCESS_OVERLAY')).toBe('PROJECT_ACCESS_OVERLAY');
  });

  it('matches ndxbook overview route aliases', () => {
    const a = canonicalExperienceRouteId({ projectId: 'ndxbook', route: '/projects/ndxbook' });
    const b = canonicalExperienceRouteId({ projectId: 'ndxbook', route: '/projects/ndxbook/overview', screenId: 'overview' });
    expect(a).toBe('ndxbook:overview');
    expect(b).toBe('ndxbook:overview');
    expect(routesMatchForExperienceRecovery(a, b)).toBe(true);
  });

  it('recovers FAL jobs stored under legacy pageId bucket', () => {
    const jobs = [
      falJob({ stateId: 'menu', pageId: 'ndxbook-overview-legacy', suffix: 'm' }),
      falJob({ stateId: 'entry-detail', pageId: 'ndxbook-overview-legacy', suffix: 'e' }),
      falJob({ stateId: 'project-access', pageId: 'ndxbook-overview-legacy', suffix: 'p' }),
    ];
    const { authority, receipt } = reconcileExistingExperienceArtifacts({
      authority: authorityShell(),
      state: baseState(jobs),
      extraJobs: jobs,
    });
    expect(receipt.menu).toBe('RECOVERED');
    expect(receipt.entryDetail).toBe('RECOVERED');
    expect(receipt.projectAccess).toBe('RECOVERED');
    expect(authority.visualStates.filter((v) => v.previewImageUri?.trim()).length).toBe(4);
    expect(authority.status).not.toBe('NOT_STARTED');
  });

  it('reports PARTIAL package status when only base is inherited initially then recovers', () => {
    const onlyBase = authorityShell();
    const statusBefore = buildExperienceReviewPackageStatus(onlyBase);
    expect(statusBefore.statusLabel).toBe('PARTIAL');
    expect(resolveExperienceReviewPanelMode(onlyBase)).toBe('PARTIAL');
  });

  it('hydration attaches legacy reconciliation receipt and confirmed missing list', () => {
    const jobs = [falJob({ stateId: 'menu', pageId: 'other-overview-key', suffix: 'm' })];
    const { state } = applyExperienceReviewHydrationToState(baseState(jobs), { extraExperienceFalJobs: jobs });
    const authority = state.pipelineSet!.experienceExpressionAuthority!;
    expect(authority.legacyReconciliationReceipt?.menu).toBe('RECOVERED');
    expect(authority.visualStates.find((v) => v.stateId === 'menu')?.previewImageUri).toContain('m');
  });

  it('does not count base as FAL generated in package strip counts', () => {
    const jobs = [
      falJob({ stateId: 'menu', pageId: 'registry-overview', suffix: 'm' }),
      falJob({ stateId: 'entry-detail', pageId: 'registry-overview', suffix: 'e' }),
      falJob({ stateId: 'project-access', pageId: 'registry-overview', suffix: 'p' }),
    ];
    const { authority } = reconcileExistingExperienceArtifacts({ authority: authorityShell(), state: baseState(jobs) });
    const status = buildExperienceReviewPackageStatus(authority);
    expect(status.inherited).toBe(1);
    expect(status.falReady).toBe(3);
    expect(status.materialized).toBe(4);
  });
});
