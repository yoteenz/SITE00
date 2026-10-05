/**
 * Family-level monetization metadata (carried on family production contracts via the optional `monetization` field).
 * Only F01 has a contract today. A family with no metadata is treated as "no upgrade surface allowed".
 */

import type { FamilyMonetization } from '../../../../../shared/site00-monetization/contract.js';

/** F01 ENTRY — never a paywall: no plan selection, checkout, upgrade prompts or trial copy. */
export const JURNL_F01_MONETIZATION: FamilyMonetization = {
  defaultAccess: 'FULL',
  capabilityRequirements: ['CORE_ACCOUNT_SECURITY', 'CORE_PERSONAL_DATA_CONTROL'],
  premiumChildren: [],
  premiumInteractions: [],
  usageLimits: [],
  addOnEligibility: [],
  upgradeSurfaceAllowed: false,
  monetizationNotes:
    'ENTRY STAYS FOCUSED ON ACCOUNT CREATION, SIGN IN, SECURITY, PRIVACY AND DEVICE TRUST. NO PLAN SELECTION, CHECKOUT, UPGRADE PROMPTS OR TRIAL COPY. AI ACCESS TOGGLES ARE CONSENT CONTROLS, NOT PLAN FEATURES.',
  status: 'DRAFT',
};

/** Family monetization by family id (families without an entry allow no upgrade surface). */
export const JURNL_FAMILY_MONETIZATION: Readonly<Record<string, FamilyMonetization>> = {
  F01: JURNL_F01_MONETIZATION,
};

export const upgradeSurfaceAllowedIn = (familyId: string | null | undefined) => !!familyId && JURNL_FAMILY_MONETIZATION[familyId]?.upgradeSurfaceAllowed === true;
