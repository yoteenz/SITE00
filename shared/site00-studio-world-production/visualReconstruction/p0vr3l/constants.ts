/**
 * P0.VR.3L-SITE00 — Missing-target family derivation + shell propagation constants.
 */

export const P0_VR_3L_LINEAGE = 'P0.VR.3L-SITE00' as const;

export const FAMILY_SOURCE_SNAPSHOT_LABEL = 'FAMILY SOURCE · EXISTING IMPLEMENTATION' as const;

export const COMPOSER_DERIVED_DRAFT_LABEL = 'CURRENT · COMPOSER DERIVED DRAFT' as const;

export const DEFAULT_PROPAGATION_SCOPE = 'TARGET_ONLY' as const;

export const SHELL_PROPAGATION_CONFIRMATION_REQUIRED = {
  DESIGN_FAMILY: true,
  SHARED_SHELL_GLOBAL: true,
} as const;
