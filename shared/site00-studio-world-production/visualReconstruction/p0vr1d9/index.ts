/**
 * P0.VR.1D.9 — Mobile page shell reconstruction + Campaign/Lab frame replacement.
 */

export {
  P0_VR_1D9_LINEAGE,
  FAIL_EXISTING_SHELL_INCORRECTLY_PROTECTED,
  FAIL_REFERENCE_SHELL_NOT_IMPLEMENTED,
  FAIL_CONTENT_WRAPPER_WIDTH_DRIFT,
  FAIL_HEADER_SHELL_GEOMETRY_DRIFT,
  FAIL_PAGE_GUTTER_DRIFT,
  FAIL_SECTION_FRAME_DRIFT,
  FAIL_BOTTOM_NAV_SHELL_DRIFT,
  FAIL_GIANT_CONTAINER_NOT_IN_REFERENCE,
  FAIL_CHILD_LOCKED_BEFORE_PARENT_GEOMETRY,
  FAIL_STALE_LOCK_BLOCKING_SHELL_REBUILD,
  NDX_MOBILE_REFERENCE_VIEWPORT,
  NDX_CAMPAIGN_BOARD_SHELL_ROUTE,
  NDX_LAB_EXPERIMENT_01_SHELL_ROUTE,
  NDX_CAMPAIGN_SHELL_VR_REGION_IDS,
  NDX_LAB_SHELL_VR_REGION_IDS,
  PARENT_SHELL_REGION_ORDER,
} from './constants.js';
export { PARENT_GEOMETRY_FIRST } from './parentGeometryFirst.js';
export {
  CAMPAIGN_MOBILE_VISUAL_SHELL_SPEC,
  LAB_MOBILE_VISUAL_SHELL_SPEC,
  FUNCTIONAL_SHELL_AUTHORITY,
  CAMPAIGN_VISUAL_SHELL_AUTHORITY,
  LAB_VISUAL_SHELL_AUTHORITY,
  resolveMobileVisualShellSpec,
  mobileVisualShellSpecToCssVars,
  functionalAndVisualShellAuthoritySeparated,
} from './mobileScreenVisualShellSpec.js';
export { buildCampaignFullScreenImplementationSpec } from './campaignScreenImplementationSpec.js';
export { buildLabFullScreenImplementationSpec } from './labScreenImplementationSpec.js';
export {
  evaluateVisualShellMatch,
  shellGeometryPassesBeforeChildLocks,
} from './visualShellMatchEvaluation.js';
export {
  markStaleLocksAfterShellReconstruction,
  staleLockDoesNotBlockRebuild,
} from './invalidateStaleShellLocks.js';
export {
  filterChildLocksUntilParentGeometryPasses,
  parentGeometryFirstViolation,
} from './parentGeometryFirst.js';
export { runNdxMobileShellReconstructionPass } from './runNdxMobileShellReconstructionPass.js';
export type {
  FunctionalShellAuthority,
  VisualShellAuthority,
  MobileScreenVisualShellSpec,
  VisualShellMatchEvaluation,
  VisualShellMatchMetric,
  ShellRegionLockExtension,
  NdxMobileShellReconstructionReport,
} from './types.js';

/** P0.VR.1D.10 compatibility — stale lock marker for rollout tests. */
export const STALE_AFTER_VISUAL_SHELL_REBUILD = 'STALE_AFTER_VISUAL_SHELL_REBUILD' as const;

export const NDX_FUNCTIONAL_SHELL_AUTHORITY = {
  preserves: [
    'route',
    'project state',
    'data fetching',
    'live counts',
    'actions',
    'notifications',
    'ellipsis project menu',
    'bottom-nav routing',
    'workflow logic',
    'accessibility behavior',
  ],
} as const;

export const NDX_VISUAL_SHELL_AUTHORITY = {
  scope: 'FULL_SCREEN_REFERENCE' as const,
  controls: [
    'page background',
    'header dimensions',
    'content bounds',
    'horizontal gutters',
    'section widths',
    'vertical rhythm',
    'borders/dividers',
    'bottom nav frame',
    'safe area',
    'visual hierarchy',
  ],
} as const;

export function markStaleShellLocks(
  locks: Array<{ regionId: string; status: string }>,
): Array<{ regionId: string; status: string; priorStatus?: string }> {
  return locks.map((lock) =>
    lock.status === 'MATCHED'
      ? { ...lock, priorStatus: lock.status, status: STALE_AFTER_VISUAL_SHELL_REBUILD }
      : lock,
  );
}
