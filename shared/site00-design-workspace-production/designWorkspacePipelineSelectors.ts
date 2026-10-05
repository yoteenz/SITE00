/**
 * Deterministic pipeline gates — shared across rail, hero, panels, and readiness.
 */

import type { DesignWorkspacePipelineState } from './designWorkspacePipelineState.js';

export function canConfirmMobileAuthority(state: DesignWorkspacePipelineState): boolean {
  return state.mobileAuthorityStatus === 'SELECTED';
}

export function canCreateMobileExpression(state: DesignWorkspacePipelineState): boolean {
  return (
    state.mobileAuthorityStatus === 'CONFIRMED' &&
    (state.mobileExperienceStatus === 'NOT_STARTED' ||
      state.mobileExperienceStatus === 'PARTIAL' ||
      state.mobileExperienceStatus === 'STALE')
  );
}

export function canReviewMobileExperience(state: DesignWorkspacePipelineState): boolean {
  return (
    state.mobileExperienceStatus === 'READY_FOR_REVIEW' ||
    state.mobileExperienceStatus === 'PARTIAL' ||
    state.mobileExperienceStatus === 'GENERATING'
  );
}

export function canGenerateDesktop(state: DesignWorkspacePipelineState): boolean {
  return (
    state.mobileAuthorityStatus === 'CONFIRMED' &&
    state.mobileExperienceStatus === 'APPROVED' &&
    state.desktopViewportStatus !== 'GENERATING'
  );
}

export function canCreateDesktopExpression(state: DesignWorkspacePipelineState): boolean {
  return state.desktopViewportStatus === 'READY' && state.desktopExpressionStatus !== 'STALE';
}

export function canGenerateTablet(state: DesignWorkspacePipelineState): boolean {
  return (
    state.mobileAuthorityStatus === 'CONFIRMED' &&
    state.mobileExperienceStatus === 'APPROVED' &&
    state.tabletViewportStatus !== 'GENERATING'
  );
}

export function canCreateTabletExpression(state: DesignWorkspacePipelineState): boolean {
  return state.tabletViewportStatus === 'READY' && state.tabletExpressionStatus !== 'STALE';
}

export function canOpenPairReview(state: DesignWorkspacePipelineState): boolean {
  return (
    state.mobileAuthorityStatus === 'CONFIRMED' &&
    state.mobileExperienceStatus === 'APPROVED' &&
    state.desktopViewportStatus === 'READY' &&
    state.tabletViewportStatus === 'READY' &&
    state.desktopExpressionStatus === 'APPROVED' &&
    state.tabletExpressionStatus === 'APPROVED'
  );
}

export function canCreateFramework(state: DesignWorkspacePipelineState): boolean {
  return (
    (state.viewportFamilyStatus === 'APPROVED' || state.viewportFamilyStatus === 'READY') &&
    state.pageFamilyStatus === 'APPROVED' &&
    state.interactionMapStatus === 'APPROVED' &&
    (state.functionalExpansionStatus === 'APPROVED' ||
      state.functionalExpansionStatus === 'NOT_STARTED') &&
    state.frameworkStatus === 'NOT_STARTED'
  );
}

export function canGenerateAssets(state: DesignWorkspacePipelineState): boolean {
  return state.frameworkStatus === 'READY' && state.twinStatus === 'LIVE';
}

export function pipelineStageComplete(
  state: DesignWorkspacePipelineState,
  stageId: DesignWorkspacePipelineReadinessStageId,
): boolean {
  switch (stageId) {
    case 'mobile_concepts':
      return state.selectedMobileConceptId !== null;
    case 'mobile_authority':
      return state.mobileAuthorityStatus === 'CONFIRMED';
    case 'mobile_expressions':
      return state.mobileExperienceStatus === 'APPROVED';
    case 'desktop_viewport':
      return state.desktopViewportStatus === 'READY';
    case 'desktop_expressions':
      return state.desktopExpressionStatus === 'APPROVED';
    case 'tablet_viewport':
      return state.tabletViewportStatus === 'READY';
    case 'tablet_expressions':
      return state.tabletExpressionStatus === 'APPROVED';
    case 'pair_review':
      return state.viewportFamilyStatus === 'APPROVED';
    case 'page_family':
      return state.pageFamilyStatus === 'APPROVED';
    case 'interaction_map':
      return state.interactionMapStatus === 'APPROVED';
    case 'framework':
      return state.frameworkStatus === 'READY' || state.frameworkStatus === 'APPROVED';
    case 'assets':
      return state.assetGenerationStatus === 'READY';
    default:
      return false;
  }
}

export type DesignWorkspacePipelineReadinessStageId =
  | 'mobile_concepts'
  | 'mobile_authority'
  | 'mobile_expressions'
  | 'desktop_viewport'
  | 'desktop_expressions'
  | 'tablet_viewport'
  | 'tablet_expressions'
  | 'pair_review'
  | 'page_family'
  | 'interaction_map'
  | 'framework'
  | 'assets';

export const DESIGN_WORKSPACE_PIPELINE_READINESS_STAGE_ORDER: readonly DesignWorkspacePipelineReadinessStageId[] =
  [
    'mobile_concepts',
    'mobile_authority',
    'mobile_expressions',
    'desktop_viewport',
    'desktop_expressions',
    'tablet_viewport',
    'tablet_expressions',
    'pair_review',
    'page_family',
    'interaction_map',
    'framework',
    'assets',
  ];

export type DesignWorkspacePipelineReadinessRow = {
  id: DesignWorkspacePipelineReadinessStageId;
  order: number;
  label: string;
  status: DesignWorkspacePipelineState['mobileAuthorityStatus'];
  statusLine: string;
};

export function buildDesignWorkspacePipelineReadinessRows(
  state: DesignWorkspacePipelineState,
): readonly DesignWorkspacePipelineReadinessRow[] {
  const statusFor = (complete: boolean, current: boolean, raw: DesignWorkspacePipelineState['mobileExperienceStatus']) => {
    if (raw === 'STALE') return 'STALE' as const;
    if (raw === 'GENERATING') return 'GENERATING' as const;
    if (raw === 'FAILED') return 'FAILED' as const;
    if (complete) return 'APPROVED' as const;
    if (current) return 'READY_FOR_REVIEW' as const;
    return 'NOT_STARTED' as const;
  };

  const rows: DesignWorkspacePipelineReadinessRow[] = [
    {
      id: 'mobile_concepts',
      order: 1,
      label: 'MOBILE CONCEPTS',
      status: state.selectedMobileConceptId ? 'SELECTED' : 'NOT_STARTED',
      statusLine: state.selectedMobileConceptId ? 'CONCEPT SELECTED' : 'AWAITING SELECTION',
    },
    {
      id: 'mobile_authority',
      order: 2,
      label: 'MOBILE AUTHORITY',
      status: state.mobileAuthorityStatus,
      statusLine:
        state.mobileAuthorityStatus === 'CONFIRMED' ? 'AUTHORITY CONFIRMED'
        : state.mobileAuthorityStatus === 'SELECTED' ? 'SELECTED · NOT CONFIRMED'
        : 'NOT STARTED',
    },
    {
      id: 'mobile_expressions',
      order: 3,
      label: 'MOBILE EXPRESSIONS',
      status: state.mobileExperienceStatus,
      statusLine: `${state.experienceOutputCount} OUTPUTS · ${state.mobileExperienceStatus}`,
    },
    {
      id: 'desktop_viewport',
      order: 4,
      label: 'DESKTOP VIEWPORT',
      status: statusFor(state.desktopViewportStatus === 'READY', false, state.desktopViewportStatus),
      statusLine:
        state.desktopViewportStatus === 'READY' ? 'DESKTOP AUTHORITY READY'
        : state.desktopViewportStatus === 'GENERATING' ? 'GENERATING DESKTOP'
        : 'DESKTOP AUTHORITY NOT GENERATED',
    },
    {
      id: 'desktop_expressions',
      order: 5,
      label: 'DESKTOP EXPRESSIONS',
      status: state.desktopExpressionStatus,
      statusLine:
        state.desktopViewportStatus !== 'READY' ? 'DESKTOP AUTHORITY REQUIRED'
        : state.desktopExpressionStatus,
    },
    {
      id: 'tablet_viewport',
      order: 6,
      label: 'TABLET VIEWPORT',
      status: statusFor(state.tabletViewportStatus === 'READY', false, state.tabletViewportStatus),
      statusLine:
        state.tabletViewportStatus === 'READY' ? 'TABLET AUTHORITY READY'
        : state.tabletViewportStatus === 'GENERATING' ? 'GENERATING TABLET'
        : 'TABLET AUTHORITY NOT GENERATED',
    },
    {
      id: 'tablet_expressions',
      order: 7,
      label: 'TABLET EXPRESSIONS',
      status: state.tabletExpressionStatus,
      statusLine:
        state.tabletViewportStatus !== 'READY' ? 'TABLET AUTHORITY REQUIRED'
        : state.tabletExpressionStatus,
    },
    {
      id: 'pair_review',
      order: 8,
      label: 'PAIR REVIEW',
      status: state.viewportFamilyStatus,
      statusLine: canOpenPairReview(state) ? 'READY FOR PAIR REVIEW' : 'BLOCKED',
    },
    {
      id: 'page_family',
      order: 9,
      label: 'PAGE FAMILY',
      status: state.pageFamilyStatus,
      statusLine: `${state.pageFamilyChildCount} CHILD · ${state.pageFamilyGrandchildCount} GRANDCHILD · ${state.pageFamilyTotalPages} TOTAL`,
    },
    {
      id: 'interaction_map',
      order: 10,
      label: 'INTERACTION MAP',
      status: state.interactionMapStatus,
      statusLine: `${state.interactionCount} INTERACTIONS`,
    },
    {
      id: 'framework',
      order: 11,
      label: 'FRAMEWORK',
      status: state.frameworkStatus,
      statusLine: canCreateFramework(state) ? 'FRAMEWORK HANDOFF READY' : state.frameworkStatus,
    },
    {
      id: 'assets',
      order: 12,
      label: 'ASSETS',
      status: state.assetGenerationStatus,
      statusLine: canGenerateAssets(state) ? 'GENERATE ASSETS READY' : 'BLOCKED',
    },
  ];
  return rows;
}
