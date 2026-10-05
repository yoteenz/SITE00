/**
 * P0.R.1 — Configurable premium custom avatar entitlement (no hardcoded pricing).
 */

import type { CustomAvatarEntitlementState } from './types.js';

export const CUSTOM_ASTRAL_AVATAR_PRODUCT_KEY = 'CUSTOM_ASTRAL_AVATAR' as const;

/** Configurable policy — wire to commerce when product config exists */
export const CUSTOM_AVATAR_ENTITLEMENT_POLICY = {
  productKey: CUSTOM_ASTRAL_AVATAR_PRODUCT_KEY,
  /** Candidates granted per purchase before selection */
  candidatesPerPurchase: 3,
  /** Additional regeneration requires entitlement/credit */
  regenerationRequiresCredit: true,
  /** Reference uploads stored privately by default */
  referenceImagesPrivateByDefault: true,
  /** Generated assets require explicit user selection before ACTIVE */
  requiresUserSelection: true,
  /** Curated library avatars require founder review before APPROVED_LIBRARY_ASSET */
  libraryRequiresFounderReview: true,
} as const;

export function canStartCustomAvatarGeneration(state: CustomAvatarEntitlementState): boolean {
  return state === 'PURCHASED' || state === 'REGENERATION_PURCHASE_REQUIRED';
}

export function canSelectCustomAvatarCandidate(state: CustomAvatarEntitlementState): boolean {
  return state === 'READY_FOR_SELECTION';
}

export function nextStateAfterGenerationComplete(
  current: CustomAvatarEntitlementState,
): CustomAvatarEntitlementState {
  if (current === 'PURCHASED' || current === 'GENERATION_PENDING') return 'READY_FOR_SELECTION';
  return current;
}

export function nextStateAfterSelection(): CustomAvatarEntitlementState {
  return 'ACTIVE';
}
