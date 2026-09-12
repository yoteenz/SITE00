/**
 * P0.VR.REPLICATION.2 — Non-intrusive twin debug indicator modes.
 */

export const TWIN_BADGE_MODES = ['OUTSIDE_SHELL_STRIP', 'OVERLAY_MINIMAL'] as const;
export type TwinBadgeMode = (typeof TWIN_BADGE_MODES)[number];

export const DEFAULT_TWIN_BADGE_MODE: TwinBadgeMode = 'OUTSIDE_SHELL_STRIP';
