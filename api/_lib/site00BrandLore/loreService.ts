/**
 * Brand Lore service — orchestrates synthesis, persistence, and retrieval.
 */

import type { BrandLoreProfile } from '../../../shared/site00-brand-lore/types.js';
import {
  synthesizeBrandLoreProfile,
  extractOperationalProjectTypes,
  extractOperationalGoals,
  type LoreSynthesisInput,
} from './loreSynthesis.js';
import { synthesizeBuilderExperienceProfile } from './experienceSynthesis.js';
import * as store from './memoryStore.js';

export { resetBrandLoreMemoryStore } from './memoryStore.js';

export type IntakeLorePayload = {
  loreAnswers?: Record<string, string | string[]>;
  loreCompletedSteps?: string[];
  experienceAnswers?: Record<string, string | string[]>;
  experienceCompletedSteps?: string[];
  brandLoreProfileId?: string | null;
  inheritedLoreSnapshot?: Partial<BrandLoreProfile> | null;
};

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

  const input: LoreSynthesisInput = {
    loreAnswers,
    sourceIntakeId: params.intakeId,
    organizationId: params.organizationId ?? null,
    projectId: params.projectId ?? null,
    orgSlug: params.orgSlug ?? null,
    operationalAnswers: {
      projectTypes: extractOperationalProjectTypes(operational),
      goals: extractOperationalGoals(operational),
    },
    existingProfileId: existing?.id ?? (params.draftPayload.brandLoreProfileId as string | null),
  };

  const profile = synthesizeBrandLoreProfile(input);
  return store.saveBrandLoreProfile(profile);
}

export async function getLoreForIntake(
  intakeType: 'IDENTITY' | 'BUILDER',
  intakeId: string,
): Promise<BrandLoreProfile | null> {
  return store.getBrandLoreProfileByIntake(intakeType, intakeId);
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
