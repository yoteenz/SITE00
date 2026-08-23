/**
 * Brand Lore service — orchestrates synthesis, persistence, and retrieval.
 */

import type { BrandLoreField, BrandLoreProfile } from '../../../shared/site00-brand-lore/types.js';
import {
  synthesizeBrandLoreProfile,
  mergePreservingFounderConfirmations,
  mergeCalibrationIntoProfile,
  extractOperationalProjectTypes,
  extractOperationalGoals,
  LORE_FIELD_KEYS,
  type LoreSynthesisInput,
} from './loreSynthesis.js';
import { synthesizeBuilderExperienceProfile } from './experienceSynthesis.js';
import * as store from './storeAdapter.js';
import { getSupabaseAdmin, hasSupabaseServiceRole } from '../supabase.js';
import { buildNdxbookReconciledProfile, contentBrainSourceIntakeId } from './ndxbookReconciliation.js';
import { reconcileNdxbookPersonality } from '../../../shared/site00-brand-lore/ndxbookPersonalityReconciliation.js';

export { resetBrandLoreMemoryStore } from './memoryStore.js';

export type IntakeLorePayload = {
  loreAnswers?: Record<string, string | string[]>;
  loreCompletedSteps?: string[];
  personalityAnswers?: Record<string, string | string[]>;
  personalityCompletedSteps?: string[];
  experienceAnswers?: Record<string, string | string[]>;
  experienceCompletedSteps?: string[];
  brandLoreProfileId?: string | null;
  inheritedLoreSnapshot?: Partial<BrandLoreProfile> | null;
};

/**
 * IntakeRecord (shared/site00-intakes) has no organizationId column — only projectId. Resolve the
 * owning organization from the linked site00_projects row so BrandLoreProfile.organizationId is
 * ever actually populated (previously always null — see XXV NDX BOOK reconciliation dependency on
 * this working). Guarded so tests (VITEST=true, no live Supabase project rows) short-circuit.
 */
async function resolveOrganizationIdForProject(projectId: string | null | undefined): Promise<string | null> {
  if (!projectId) return null;
  if (process.env.VITEST === 'true' || !hasSupabaseServiceRole()) return null;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('site00_projects')
      .select('organization_id')
      .eq('id', projectId)
      .maybeSingle();
    if (error || !data) return null;
    return (data.organization_id as string | null) ?? null;
  } catch {
    return null;
  }
}

export async function upsertLoreFromIdentityIntake(params: {
  intakeId: string;
  draftPayload: Record<string, unknown>;
  organizationId?: string | null;
  projectId?: string | null;
  orgSlug?: string | null;
}): Promise<BrandLoreProfile | null> {
  const loreAnswers = (params.draftPayload.loreAnswers ?? {}) as Record<string, string | string[]>;
  const personalityAnswers = (params.draftPayload.personalityAnswers ?? {}) as Record<
    string,
    string | string[]
  >;
  if (Object.keys(loreAnswers).length === 0 && Object.keys(personalityAnswers).length === 0) {
    return null;
  }

  const stateAnswers = (params.draftPayload.answers ?? {}) as Record<
    string,
    Record<string, string | string[]>
  >;
  const identityState = String(params.draftPayload.identityState ?? '');
  const operational = stateAnswers[identityState] ?? {};

  const existing = await store.getBrandLoreProfileByIntake('IDENTITY', params.intakeId);
  const organizationId = params.organizationId ?? (await resolveOrganizationIdForProject(params.projectId));

  const input: LoreSynthesisInput = {
    loreAnswers,
    personalityAnswers,
    sourceIntakeId: params.intakeId,
    organizationId,
    projectId: params.projectId ?? null,
    orgSlug: params.orgSlug ?? null,
    operationalAnswers: {
      projectTypes: extractOperationalProjectTypes(operational),
      goals: extractOperationalGoals(operational),
    },
    existingProfileId: existing?.id ?? (params.draftPayload.brandLoreProfileId as string | null),
    priorProfile: existing,
  };

  const freshlySynthesized = synthesizeBrandLoreProfile(input);
  // Every autosave re-derives the whole profile from raw answers — merge so an unrelated
  // FOUNDER_CONFIRMED field from a prior save is never silently reverted to PENDING (XII).
  const profile = mergePreservingFounderConfirmations(existing, freshlySynthesized);
  return store.saveBrandLoreProfile(profile);
}

export async function getLoreForIntake(
  intakeType: 'IDENTITY' | 'BUILDER',
  intakeId: string,
): Promise<BrandLoreProfile | null> {
  return store.getBrandLoreProfileByIntake(intakeType, intakeId);
}

/** Most-recently-updated Brand Lore profile for an organization — used by Creative Direction
 * readiness gating (no bypass — see brandLoreBridge.ts). */
export async function getBrandLoreProfileForOrg(orgId: string): Promise<BrandLoreProfile | null> {
  return store.getBrandLoreProfileByOrgId(orgId);
}

/**
 * Truthful-readiness self-heal (Section III of the Core Direction Reformation sprint spec):
 * re-derives every synthesized BrandLoreField from the profile's OWN durably-persisted
 * `rawLoreAnswers` and re-evaluates readiness against that recomputation. This exists because a
 * computed field can drift out of sync with its own raw source answer (e.g. a synthesis-logic
 * change deployed between two calibration submissions leaves an earlier field stale even though
 * the raw answer that should drive it was always correct) — readiness must never stay falsely
 * blocked once the underlying answers actually satisfy a domain.
 *
 * Reuses mergeCalibrationIntoProfile so a freshly-derived field only ever fills a gap or corrects
 * drift — it never erases a FOUNDER_CONFIRMED value, and never blanks a field the recomputation
 * itself failed to derive when the existing field already had content.
 */
export function reconcileProfileFromRawAnswers(
  profile: BrandLoreProfile,
  orgSlug: string | null,
): BrandLoreProfile {
  if (!profile.rawLoreAnswers || Object.keys(profile.rawLoreAnswers).length === 0) return profile;

  const fresh = synthesizeBrandLoreProfile({
    loreAnswers: profile.rawLoreAnswers,
    personalityAnswers: profile.brandPersonality?.rawPersonalityAnswers ?? {},
    sourceIntakeId: profile.sourceIntakeId,
    organizationId: profile.organizationId,
    projectId: profile.projectId,
    orgSlug,
    existingProfileId: profile.id,
  });

  const reconciled = mergeCalibrationIntoProfile(profile, fresh);
  // Context classification depends on operational-intake signals (project types/goals) this
  // resync pass does not have access to — never regress an already-derived classification just
  // because a targeted resync lacks that original context.
  reconciled.contextClassification = profile.contextClassification ?? reconciled.contextClassification;
  return reconciled;
}

/** True when a resync (see reconcileProfileFromRawAnswers) actually changed something observable
 * — a synthesized field value or the readiness verdict — as opposed to a no-op recomputation that
 * would otherwise cause a spurious durable write on every read. */
function profileComputedStateDrifted(before: BrandLoreProfile, after: BrandLoreProfile): boolean {
  if (before.readinessState !== after.readinessState) return true;
  if (JSON.stringify(before.readinessMissingDomains) !== JSON.stringify(after.readinessMissingDomains)) return true;
  for (const key of LORE_FIELD_KEYS) {
    const beforeValue = (before[key] as BrandLoreField | undefined)?.value;
    const afterValue = (after[key] as BrandLoreField | undefined)?.value;
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) return true;
  }
  return false;
}

/**
 * NDX BOOK readiness gate closure (XXIV-XXVIII): returns the real Brand Lore profile for the org.
 * If a genuine IDENTITY/BUILDER-sourced profile already exists, it always wins (XXVII — reconciled
 * Content Brain intelligence must never sit on top of / override real founder lore). Otherwise,
 * reconciles pre-existing Content Brain intelligence into a durable, honestly-partial profile so
 * readiness reflects reality instead of silently reporting "no gate" (the removed bypass).
 *
 * Every resolved profile is also passed through reconcileProfileFromRawAnswers (Section III) —
 * when that recomputation detects real drift between raw answers and their synthesized fields,
 * the corrected profile is persisted once so readiness is truthful for every subsequent read, not
 * just the current request.
 */
export async function getOrReconcileBrandLoreForOrg(
  orgId: string,
  orgSlug: string,
): Promise<BrandLoreProfile | null> {
  const existing = await store.getBrandLoreProfileByOrgId(orgId);
  let resolved: BrandLoreProfile | null = existing;

  if (!existing || existing.sourceIntakeType === 'CONTENT_BRAIN') {
    if (orgSlug === 'ndxbook') {
      const reconciledExisting = await store.getBrandLoreProfileByIntake(
        'CONTENT_BRAIN',
        contentBrainSourceIntakeId(orgId),
      );
      resolved = reconciledExisting ?? (await store.saveBrandLoreProfile(buildNdxbookReconciledProfile(orgId)));
    }
  }

  if (!resolved) return resolved;

  const reconciled = reconcileProfileFromRawAnswers(resolved, orgSlug);
  if (profileComputedStateDrifted(resolved, reconciled)) {
    return store.saveBrandLoreProfile(reconciled);
  }
  return resolved;
}

/**
 * NDX BOOK targeted calibration submission (XXIX/XXX) — accepts ONLY the missing-domain answers a
 * client/founder just gave (via the client calibration surface) and merges them into the org's
 * durable Brand Lore profile. Never fabricates other domains; never re-asks what's already known.
 */
export async function submitOrgLoreCalibration(params: {
  orgId: string;
  orgSlug: string;
  answers: Record<string, string | string[]>;
  personalityAnswers?: Record<string, string | string[]>;
}): Promise<BrandLoreProfile> {
  const existing = await getOrReconcileBrandLoreForOrg(params.orgId, params.orgSlug);
  const mergedRawAnswers = { ...(existing?.rawLoreAnswers ?? {}), ...params.answers };
  const mergedPersonalityAnswers = {
    ...(existing?.brandPersonality?.rawPersonalityAnswers ?? {}),
    ...(params.personalityAnswers ?? {}),
  };

  const fresh = synthesizeBrandLoreProfile({
    loreAnswers: mergedRawAnswers,
    personalityAnswers: Object.keys(mergedPersonalityAnswers).length ? mergedPersonalityAnswers : undefined,
    sourceIntakeId: existing?.sourceIntakeId ?? `calibration:${params.orgId}`,
    organizationId: params.orgId,
    projectId: existing?.projectId ?? null,
    orgSlug: params.orgSlug,
    existingProfileId: existing?.id ?? null,
  });

  const profile = existing ? mergeCalibrationIntoProfile(existing, fresh) : fresh;
  return store.saveBrandLoreProfile(profile);
}

export async function submitOrgPersonalityCalibration(params: {
  orgId: string;
  orgSlug: string;
  personalityAnswers: Record<string, string | string[]>;
}): Promise<BrandLoreProfile> {
  return submitOrgLoreCalibration({
    orgId: params.orgId,
    orgSlug: params.orgSlug,
    answers: {},
    personalityAnswers: params.personalityAnswers,
  });
}

export async function submitOrgCreativeAppetite(params: {
  orgId: string;
  orgSlug: string;
  appetiteAnswers: Record<string, string | string[]>;
}): Promise<BrandLoreProfile> {
  const { submitOrgCreativeAppetite: submit } = await import('./creativeAppetiteService.js');
  return submit(params);
}

export async function confirmFounderPersonalityField(
  profileId: string,
  fieldKey: keyof import('../../../shared/site00-brand-lore/personalityTypes.js').BrandPersonalityProfile,
): Promise<BrandLoreProfile | null> {
  const profile = await store.getBrandLoreProfileById(profileId);
  if (!profile?.brandPersonality) return profile;
  const field = profile.brandPersonality[fieldKey];
  if (!field || typeof field !== 'object' || !('founderConfirmationState' in field)) return profile;
  field.founderConfirmationState = 'CONFIRMED';
  field.classification = 'FOUNDER_CONFIRMED';
  profile.updatedAt = new Date().toISOString();
  return store.saveBrandLoreProfile(profile);
}

export async function confirmFounderLoreField(
  profileId: string,
  fieldKey: keyof BrandLoreProfile,
): Promise<BrandLoreProfile | null> {
  return store.confirmLoreField(profileId, fieldKey);
}

/** Builder inherits Identity lore — server-side, not localStorage-only. */
export async function resolveInheritedLoreForBuilder(params: {
  identityIntakeId?: string | null;
}): Promise<Partial<BrandLoreProfile> | null> {
  if (!params.identityIntakeId) return null;
  const profile = await store.getBrandLoreProfileByIntake('IDENTITY', params.identityIntakeId);
  if (!profile) return null;
  return {
    emotionalPromise: profile.emotionalPromise,
    worldMetaphor: profile.worldMetaphor,
    creativeTensions: profile.creativeTensions,
    materialVocabulary: profile.materialVocabulary,
    creativeAntiPatterns: profile.creativeAntiPatterns,
    audienceRelationship: profile.audienceRelationship,
    socialSignal: profile.socialSignal,
    brandBelief: profile.brandBelief,
    contextClassification: profile.contextClassification,
    brandPersonality: profile.brandPersonality,
  };
}

export function buildInheritedLoreSummary(lore: Partial<BrandLoreProfile> | null): string | null {
  if (!lore?.worldMetaphor?.value) return null;
  const world = lore.worldMetaphor.value;
  const role = lore.audienceRelationship?.value;
  if (role) return `WORLD: ${world} · ROLE: ${role}`;
  return `WORLD: ${world}`;
}

export async function upsertExperienceFromBuilderIntake(params: {
  intakeId: string;
  draftPayload: Record<string, unknown>;
}): Promise<import('../../../shared/site00-brand-lore/types.js').BuilderExperienceProfile | null> {
  const experienceAnswers = (params.draftPayload.experienceAnswers ?? {}) as Record<string, string | string[]>;
  if (Object.keys(experienceAnswers).length === 0) return null;

  const inherited = (params.draftPayload.inheritedLoreSnapshot ?? null) as Partial<BrandLoreProfile> | null;
  return synthesizeBuilderExperienceProfile(experienceAnswers, inherited);
}
