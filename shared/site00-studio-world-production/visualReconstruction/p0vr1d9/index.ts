/**
 * P0.VR.1D.9 — Functional vs visual shell separation methodology.
 */

export const P0_VR_1D9_LINEAGE = 'P0.VR.1D.9' as const;

export const STALE_AFTER_VISUAL_SHELL_REBUILD = 'STALE_AFTER_VISUAL_SHELL_REBUILD' as const;

export type FunctionalShellAuthority = {
  preserves: readonly string[];
};

export type VisualShellAuthority = {
  controls: readonly string[];
  scope: 'FULL_SCREEN_REFERENCE';
};

export const NDX_FUNCTIONAL_SHELL_AUTHORITY: FunctionalShellAuthority = {
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
};

export const NDX_VISUAL_SHELL_AUTHORITY: VisualShellAuthority = {
  scope: 'FULL_SCREEN_REFERENCE',
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
};

export function markStaleShellLocks(
  locks: Array<{ regionId: string; status: string }>,
): Array<{ regionId: string; status: string; priorStatus?: string }> {
  return locks.map((lock) =>
    lock.status === 'MATCHED'
      ? { ...lock, priorStatus: lock.status, status: STALE_AFTER_VISUAL_SHELL_REBUILD }
      : lock,
  );
}
