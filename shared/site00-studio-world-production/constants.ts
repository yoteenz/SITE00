/**
 * P0.5A — Production methodology corrections constants.
 */

export const P0_5A_METHODOLOGY_VERSION = 'P0.5A_PRODUCTION_METHODOLOGY_CORRECTIONS' as const;

export const PRODUCT_EXPRESSION_IMPLEMENTED = false as const;

export const COMPOSER_ORCHESTRATION_IMPLEMENTED = true as const;

export const WORLD_FORMATION_IMPLEMENTED = false as const;

export const FROZEN_EXPERIMENT_IDS = ['EXPERIMENT_D', 'EXPERIMENT_F_FORMATION_SNAPSHOT'] as const;

export type FrozenExperimentId = (typeof FROZEN_EXPERIMENT_IDS)[number];

/** Provenance marker for records derived from existing implementation without prospective approval. */
export const MIGRATED_FROM_EXISTING_IMPLEMENTATION = 'MIGRATED_FROM_EXISTING_IMPLEMENTATION' as const;
