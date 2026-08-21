/**
 * Brand Lore service — orchestrates synthesis, persistence, and retrieval.
 */

import type { BrandLoreProfile } from '../../../shared/site00-brand-lore/types.js';
import {
  synthesizeBrandLoreProfile,
  mergePreservingFounderConfirmations,
  mergeCalibrationIntoProfile,
  extractOperationalProjectTypes,
  extractOperationalGoals,
  type LoreSynthesisInput,
} from './loreSynthesis.js';
import { synthesizeBuilderExperienceProfile } from './experienceSynthesis.js';
import * as store from './storeAdapter.js';
import { getSupabaseAdmin, hasSupabaseServiceRole } from '../supabase.js';
import { buildNdxbookReconciledProfile, contentBrainSourceIntakeId } from './ndxbookReconciliation.js';

export { resetBrandLoreMemoryStore } from './memoryStore.js';

export type IntakeLorePayload = {
  loreAnswers?: Record<string, string | string[]>;
  loreCompletedSteps?: string[];
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
  if (Object.keys(loreAnswers).length === 0) return null;

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
    sourceIntakeId: params.intakeId,
    organizationId,
    projectId: params.projectId ?? null,
    orgSlug: params.orgSlug ?? null,
    operationalAnswers: {
      projectTypes: extractOperationalProjectTypes(operational),
      goals: extractOperationalGoals(operational),
    },
    existingProfileId: existing?.id ?? (params.draftPayload.brandLoreProfileId as string | null),
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
 * NDX BOOK readiness gate closure (XXIV-XXVIII): returns the real Brand Lore profile for the org.
 * If a genuine IDENTITY/BUILDER-sourced profile already exists, it always wins (XXVII — reconciled
 * Content Brain intelligence must never sit on top of / override real founder lore). Otherwise,
 * reconciles pre-existing Content Brain intelligence into a durable, honestly-partial profile so
 * readiness reflects reality instead of silently reporting "no gate" (the removed bypass).
 */
export async function getOrReconcileBrandLoreForOrg(
  orgId: string,
  orgSlug: string,
): Promise<BrandLoreProfile | null> {
  const existing = await store.getBrandLoreProfileByOrgId(orgId);
  if (existing && existing.sourceIntakeType !== 'CONTENT_BRAIN') return existing;
  if (orgSlug !== 'ndxbook') return existing;

  const reconciledExisting = await store.getBrandLoreProfileByIntake(
    'CONTENT_BRAIN',
    contentBrainSourceIntakeId(orgId),
  );
  if (reconciledExisting) return reconciledExisting;

  const reconciled = buildNdxbookReconciledProfile(orgId);
  return store.saveBrandLoreProfile(reconciled);
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
}): Promise<BrandLoreProfile> {
  const existing = await getOrReconcileBrandLoreForOrg(params.orgId, params.orgSlug);
  const mergedRawAnswers = { ...(existing?.rawLoreAnswers ?? {}), ...params.answers };

  const fresh = synthesizeBrandLoreProfile({
    loreAnswers: mergedRawAnswers,
    sourceIntakeId: existing?.sourceIntakeId ?? `calibration:${params.orgId}`,
    organizationId: params.orgId,
    projectId: existing?.projectId ?? null,
    orgSlug: params.orgSlug,
    existingProfileId: existing?.id ?? null,
  });

  const profile = existing ? mergeCalibrationIntoProfile(existing, fresh) : fresh;
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
