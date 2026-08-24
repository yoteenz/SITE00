/**
 * P0.5E.1 — NDXBOOK daily publishing cadence adapter (brand-specific policy).
 */

export const NDXBOOK_DAILY_PUBLISHING_RUN_ID = 'ndxbook-daily-publishing-cadence' as const;
export const NDX_DAILY_PUBLISHING_CADENCE_ID = 'ndx-daily-publishing-cadence-v1' as const;

export const NDX_INSTAGRAM_FEED_TARGET_PER_DAY = 3 as const;
export const NDX_INSTAGRAM_STORY_TARGET_PER_DAY = 4 as const;
export const NDX_INSTAGRAM_REEL_TARGET_PER_DAY = 1 as const;
export const NDX_INSTAGRAM_REEL_MAX_NORMAL_PER_DAY = 2 as const;

export const NDX_PRIMARY_EVENTS_PER_DAY = 3 as const;
export const NDX_WEEKLY_PRIMARY_EVENTS_TARGET = 21 as const;

export const NDX_DAILY_PUBLISHING_CADENCE_IMPLEMENTED = true as const;
export const THIRD_REEL_OPTIONAL_POLICY_IMPLEMENTED = true as const;
export const CADENCE_DOES_NOT_FORCE_FILLER = true as const;
export const NDX_WEEKLY_APPROVAL_FLOW_IMPLEMENTED = true as const;

/** Success-criteria aliases (spec section LXVII uses alternate naming for reel targets). */
export const NDX_INSTAGRAM_REEL_TARGET = NDX_INSTAGRAM_REEL_TARGET_PER_DAY;
export const NDX_INSTAGRAM_REEL_MAX_NORMAL = NDX_INSTAGRAM_REEL_MAX_NORMAL_PER_DAY;
