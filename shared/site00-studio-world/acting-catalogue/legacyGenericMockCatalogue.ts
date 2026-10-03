/**
 * Retired generic seed actors (GENERIC_MOCK) — not used as Production casting resident dataset after ingest1.
 * Kept for migration audit references only.
 */

import type { StudioWorldActor } from './types.js';

export const LEGACY_GENERIC_MOCK_CATALOGUE_IDS = [
  'sw-actor-044',
  'sw-actor-008',
  'sw-actor-031',
  'sw-actor-052',
  'sw-actor-019',
  'sw-actor-063',
] as const;

/** Former seed roster entries (excluding SW-017 which is preserved client-cast talent). */
export const LEGACY_GENERIC_MOCK_ACTORS: readonly StudioWorldActor[] = [];
