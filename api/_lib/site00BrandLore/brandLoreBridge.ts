/**
 * Bridge Brand Lore profiles into Creative Direction and admin surfaces.
 */

import type { BrandLoreProfile } from '../../../shared/site00-brand-lore/types.js';
import { evaluateCreativeDirectionReadiness, canBeginCreativeDirection } from '../../../shared/site00-brand-lore/readiness.js';
import { getLoreForIntake } from './loreService.js';

export async function loadBrandLoreForIntake(
  intakeType: 'IDENTITY' | 'BUILDER',
  intakeId: string,
): Promise<BrandLoreProfile | null> {
  return getLoreForIntake(intakeType, intakeId);
}

export function brandLoreReadinessGate(profile: BrandLoreProfile | null): {
  blocked: boolean;
  state: BrandLoreProfile['readinessState'];
  missingDomains: BrandLoreProfile['readinessMissingDomains'];
  message: string | null;
} {
  if (!profile) {
    return { blocked: false, state: 'CONTEXT_INCOMPLETE', missingDomains: [], message: null };
  }

  const { state, missingDomains } = evaluateCreativeDirectionReadiness(profile);
  const blocked = !canBeginCreativeDirection(state);

  return {
    blocked,
    state,
    missingDomains,
    message: blocked ? 'CONTEXT CALIBRATION REQUIRED' : null,
  };
}

/**
 * XXIV — NDX BOOK readiness bypass removed. Every org, including ndxbook, is gated the same way:
 * enforced whenever a Brand Lore profile exists (real or reconciled from Content Brain — see
 * ndxbookReconciliation.ts). `orgSlug` param kept for call-site compatibility / future per-org
 * overrides but no org is special-cased here anymore.
 */
export function shouldEnforceLoreReadinessGate(_orgSlug: string, profile: BrandLoreProfile | null): boolean {
  return profile !== null;
}

export function brandLoreLineageEntries(profile: BrandLoreProfile): string[] {
  const entries: string[] = [];
  if (profile.audienceRelationship.value?.length) {
    entries.push(`audienceRelationship: ${profile.audienceRelationship.value.join(' + ')}`);
  }
  if (profile.worldMetaphor.value) entries.push(`worldMetaphor: ${profile.worldMetaphor.value}`);
  if (profile.culturalOpposition.value?.length) entries.push(`culturalOpposition: ${profile.culturalOpposition.value.join(', ')}`);
  if (profile.coreObsessions.value) entries.push(`coreObsessions: ${profile.coreObsessions.value}`);
  if (profile.materialVocabulary.value?.length) entries.push(`materialVocabulary: ${profile.materialVocabulary.value.join(', ')}`);
  if (profile.audienceRitual.value?.length) entries.push(`audienceRitual: ${profile.audienceRitual.value.join(', ')}`);
  if (profile.creativeTensions.value?.length) entries.push(`creativeTensions: ${profile.creativeTensions.value.join(', ')}`);
  return entries;
}
