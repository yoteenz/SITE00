/**
 * P0.VR.DESIGN-WORKSPACE-PIPELINE-REACTIVITY-AND-STALE-STATE-ELIMINATION1
 */

import { describe, expect, it } from 'vitest';

import {
  compileDesignWorkspacePipelineState,
  type DesignWorkspacePipelineState,
} from '../shared/site00-design-workspace-production/designWorkspacePipelineState.js';
import {
  buildDesignWorkspacePipelineReadinessRows,
  canConfirmMobileAuthority,
  canCreateFramework,
  canGenerateAssets,
  canGenerateDesktop,
  canOpenPairReview,
} from '../shared/site00-design-workspace-production/designWorkspacePipelineSelectors.js';
import {
  resolveGalleryPipelineBanner,
  resolveViewportTabPipelineStatus,
  viewportControlsFromPipelineState,
} from '../shared/site00-design-workspace-production/designWorkspacePipelinePresentation.js';
import { buildGpt2ViewportFamilyHeroRailStages } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import { findGpt2HeroRailAction } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import { resolvePageConceptViewportGalleryActions } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportGalleryActions.js';
import { computeHeroAssemblyActions } from '../shared/site00-design-workspace-production/designHeroAssemblyActions.js';
import { buildDesignConceptIntelligenceDockModel } from '../shared/site00-design-workspace-production/pageConceptPipeline/designConceptIntelligenceDock.js';

const PROJECT = 'ndxbook';
const PAGE = 'overview';

function baseFamily(overrides: Record<string, unknown> = {}) {
  return {
    familyId: 'fam-1',
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
    ...overrides,
  };
}

function compile(overrides: {
  family?: ReturnType<typeof baseFamily>;
  pipelineSet?: Record<string, unknown>;
} = {}): DesignWorkspacePipelineState {
  const family = overrides.family ?? baseFamily();
  return compileDesignWorkspacePipelineState({
    projectId: PROJECT,
    pageId: PAGE,
    generationState: {
      targetType: 'PAGE',
      projectId: PROJECT,
      pageId: PAGE,
      projectContext: null,
      pageContext: null,
      functionContract: null,
      pipelineSet: {
        pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
        pipelineSetId: 'ps-1',
        selectedMobileConceptId: family.selectedMobileConceptId,
        viewportAuthorityFamily: family,
        experienceExpressionAuthority: {
          id: 'exp-1',
          status: 'APPROVED',
          sourceMobileArtifactId: family.mobileArtifactId!,
          sourceMobileAuthorityId: family.selectedMobileConceptId!,
          visualStates: [{ stateId: 's1', label: 'BASE', patternType: 'BASE_PAGE', previewImageUri: 'x', caption: '', materializationStatus: 'READY' }],
        } as never,
        createdAt: new Date().toISOString(),
        ...(overrides.pipelineSet ?? {}),
      } as never,
      generationJobs: [],
      generationStatus: 'IDLE',
      lastFailure: null,
      history: [],
      activeGenerationRunId: null,
      activeGenerationRunStartedAt: null,
      activeGenerationStage: null,
      liveProgress: null,
      cgptSubsteps: null,
    },
    production: {
      workflowStage: 'DESIGN',
      twinImplementationStatus: 'NONE',
    } as never,
    pageWorkflow: { twinImplementationStatus: 'NONE' } as never,
    twinRouteReachable: null,
  });
}

describe('P0.VR.DESIGN-WORKSPACE-PIPELINE-REACTIVITY-AND-STALE-STATE-ELIMINATION1', () => {
  it('compiles twelve canonical readiness stages from pipeline state', () => {
    const state = compile();
    const rows = buildDesignWorkspacePipelineReadinessRows(state);
    expect(rows).toHaveLength(12);
    expect(rows.map((r) => r.label)).toContain('MOBILE AUTHORITY');
    expect(rows.map((r) => r.label)).toContain('INTERACTION MAP');
  });

  it('mobile confirmation unlocks desktop generation and downstream selectors', () => {
    const selectedOnly = compile({
      family: baseFamily({ mobileAuthorityStatus: 'SELECTED', confirmedMobileConceptId: null }),
    });
    expect(canConfirmMobileAuthority(selectedOnly)).toBe(true);
    expect(canGenerateDesktop(selectedOnly)).toBe(false);

    const confirmed = compile();
    expect(canGenerateDesktop(confirmed)).toBe(true);
    expect(canOpenPairReview(confirmed)).toBe(false);
  });

  it('desktop generation readiness updates viewport tabs and gallery authority banner', () => {
    const withDesktop = compile({
      family: baseFamily({
        desktopArtifactId: 'art-d',
        desktopInterpretationId: 'int-d',
        status: 'DESKTOP_READY',
      }),
    });
    expect(resolveViewportTabPipelineStatus(withDesktop, 'DESKTOP')).toBe('READY');
    expect(resolveGalleryPipelineBanner(withDesktop, 'MOBILE')).toBe('AUTHORITY CONFIRMED');
    const controls = viewportControlsFromPipelineState(withDesktop);
    expect(controls.find((c) => c.viewport === 'DESKTOP')?.statusShort).toBe('READY');
  });

  it('stale desktop expression cannot satisfy pair review', () => {
    const stale = compile({
      family: baseFamily({
        desktopArtifactId: 'art-d-new',
        tabletArtifactId: 'art-t',
        status: 'AWAITING_FOUNDER_FAMILY_REVIEW',
      }),
      pipelineSet: {
        desktopExpressionAuthority: {
          id: 'de-1',
          viewport: 'DESKTOP',
          sourceViewportAuthorityArtifactId: 'art-d-old',
          status: 'APPROVED',
        },
        tabletExpressionAuthority: {
          id: 'te-1',
          viewport: 'TABLET',
          sourceViewportAuthorityArtifactId: 'art-t',
          status: 'APPROVED',
        },
      },
    });
    expect(stale.desktopExpressionStatus).toBe('STALE');
    expect(canOpenPairReview(stale)).toBe(false);
  });

  it('pair-ready family + page gates enable create framework on hero actions', () => {
    const ready = compile({
      family: baseFamily({
        desktopArtifactId: 'art-d',
        tabletArtifactId: 'art-t',
        status: 'APPROVED',
        viewportFamilyApprovalId: 'vf-ok',
      }),
      pipelineSet: {
        pageFamilyBlueprint: { blueprintId: 'bp', approvedAt: new Date().toISOString() },
        pageFamilyInteractionMap: {
          mapId: 'im',
          blueprintId: 'bp',
          approvedAt: new Date().toISOString(),
          records: Array.from({ length: 122 }, (_, i) => ({ interactionId: `ix-${i}` })),
        },
        desktopExpressionAuthority: {
          id: 'de-1',
          viewport: 'DESKTOP',
          sourceViewportAuthorityArtifactId: 'art-d',
          status: 'APPROVED',
        },
        tabletExpressionAuthority: {
          id: 'te-1',
          viewport: 'TABLET',
          sourceViewportAuthorityArtifactId: 'art-t',
          status: 'APPROVED',
        },
      },
    });
    expect(ready.interactionCount).toBe(122);
    expect(canOpenPairReview(ready)).toBe(true);
    expect(canCreateFramework(ready)).toBe(true);
    const hero = computeHeroAssemblyActions({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
      production: { promotedMobileConceptId: 'x', promotedDesktopConceptId: 'y' } as never,
      pageWorkflow: {} as never,
      twinRouteReachable: null,
      twinRoute: '/overview',
      hasPageConceptCandidates: true,
      grokGenerationInProgress: false,
      canonicalGpt2ViewportFamilyPipeline: true,
      viewportFamilyConfirmed: true,
      designWorkspacePipeline: ready,
    });
    expect(hero.createFramework.disabled).toBe(false);
  });

  it('twin live enables generate assets when framework ready', () => {
    const live = compile({
      pipelineSet: {
        liveRouteHashAfter: { liveRoute: '/t', hash: 'h', capturedAt: new Date().toISOString() },
      },
    });
    const patched = { ...live, frameworkStatus: 'READY' as const, twinStatus: 'LIVE' as const };
    expect(canGenerateAssets(patched)).toBe(true);
  });

  it('gallery drops select-mobile CTA after authority confirmed', () => {
    const actions = resolvePageConceptViewportGalleryActions({
      viewport: 'MOBILE',
      canonicalGpt2: true,
      mobileAuthorityConfirmed: true,
    });
    expect(actions.some((a) => a.id === 'select-mobile')).toBe(false);
  });

  it('rail downstream disabled flags align with pipeline selectors after mobile confirm', () => {
    const state = compile();
    const stages = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: {
        pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
        viewportAuthorityFamily: baseFamily(),
        experienceExpressionAuthority: { status: 'APPROVED' },
      } as never,
      selectedMobileConceptId: 'mc-a',
      selectedGalleryCandidateId: 'mc-a',
      selectedGalleryCandidateSlotLabel: 'CONCEPT A',
      generating: false,
      generationJobs: [],
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    });
    const desktop = findGpt2HeroRailAction(stages, 'vf-run-desktop');
    expect(canGenerateDesktop(state)).toBe(true);
    expect(desktop?.disabled).toBe(false);
  });

  it('concept dock handoff reads canonical pipeline next action', () => {
    const state = compile();
    const dock = buildDesignConceptIntelligenceDockModel({
      projectId: PROJECT,
      pageId: PAGE,
      viewport: 'MOBILE',
      targetRouteLabel: 'OVERVIEW',
      selectedCandidate: null,
      inspectedConcept: null,
      selectedMobileConceptId: 'mc-a',
      generationState: null,
      currentRunId: null,
      galleryCurrent: [],
      galleryHistory: [],
      viewportFamilyHeroRailStages: [],
      productionHistory: [],
      designWorkspacePipeline: state,
    });
    expect(dock.handoff.nextAction).toContain('DESKTOP');
  });
});
