/**
 * P0.5E.5 — NDX Character Continuity Pipeline constants.
 */

export const NDX_CHARACTER_CONTINUITY_RUN_ID = 'ndx-character-continuity-p05e5' as const;
/** Must not collide with NDX_EMBODIED_CHARACTER_DISCOVERY_DB_ID (0015). */
export const NDX_CHARACTER_CONTINUITY_DB_ID = 'c4e1a2b3-0016-4000-8000-000000000001';
export const NDX_CHARACTER_CONTINUITY_MODE = 'NDX_CHARACTER_CONTINUITY' as const;

export const NDX_CHARACTER_CONTINUITY_ROUTE = '/projects/ndxbook/character/continuity' as const;
export const NDX_CHARACTER_CONTINUITY_REVIEW_ROUTE = '/projects/ndxbook/character/continuity/review' as const;

export const NDX_CHARACTER_CONTINUITY_ADAPTER_IMPLEMENTED = true as const;
