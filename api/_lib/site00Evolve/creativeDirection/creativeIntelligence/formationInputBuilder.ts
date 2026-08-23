/**
 * Builds canonical CoreDirectionFormationInput from Brand Lore + Content Brain.
 * Only includes fields actually available — never fabricates missing data.
 */

import { computeBrandLoreFingerprint } from '../../../../../shared/site00-brand-lore/fingerprint.js';
import type { BrandLoreProfile } from '../../../../../shared/site00-brand-lore/types.js';
import {
  deriveFormatNativeExpressionProfile,
  summarizeFormatNativeExpression,
} from '../../../../../shared/site00-brand-lore/formatNativeExpression.js';
import {
  deriveBrandVoiceBehavior,
  summarizeBrandVoiceBehavior,
} from '../../../../../shared/site00-brand-lore/brandVoiceBehavior.js';
import {
  buildContentBrainPersonalityInput,
  summarizeContentBrainPersonalityInput,
} from '../../../../../shared/site00-brand-lore/contentBrainPersonalityBridge.js';
import { buildFormatLineage } from '../../../../../shared/site00-brand-lore/formatLineage.js';
import { NDXBOOK_CORE_DIRECTIONS } from '../coreDirectionDefinitions.js';
import {
  shouldIncludeCreativeAppetiteInFormation,
} from '../../../../../shared/site00-brand-lore/founderCreativeAppetite/experimentExclusion.js';
import {
  summarizeCreativeAppetiteForFormation,
} from '../../../../../shared/site00-brand-lore/founderCreativeAppetite/synthesis.js';
import { computeCreativeAppetiteFingerprint } from '../../../../../shared/site00-brand-lore/founderCreativeAppetite/fingerprint.js';
import type { IntelligenceBriefSection } from '../types.js';
import type { CoreDirectionFormationInput, ExistingCreativeExploration } from './types.js';

function fieldValue<T>(field: { value: T } | undefined | null): T | null {
  if (!field) return null;
  return field.value ?? null;
}

function founderConfirmedEntries(profile: BrandLoreProfile): string[] {
  const entries: string[] = [];
  const fields: Array<[string, unknown]> = [
    ['brandWorld', fieldValue(profile.brandWorld)],
    ['audienceRelationship', fieldValue(profile.audienceRelationship)],
    ['brandBelief', fieldValue(profile.brandBelief)],
    ['culturalOpposition', fieldValue(profile.culturalOpposition)],
    ['coreObsessions', fieldValue(profile.coreObsessions)],
    ['worldMetaphor', fieldValue(profile.worldMetaphor)],
    ['emotionalPromise', fieldValue(profile.emotionalPromise)],
    ['creativeTensions', fieldValue(profile.creativeTensions)],
  ];

  for (const [key, value] of fields) {
    const field = (profile as unknown as Record<string, { founderConfirmationState?: string }>)[key];
    if (field?.founderConfirmationState === 'CONFIRMED' && value) {
      entries.push(`${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`);
    }
  }
  return entries;
}

export function buildLegacyProposedExplorations(): ExistingCreativeExploration[] {
  return Object.values(NDXBOOK_CORE_DIRECTIONS).map((d) => ({
    label: 'LEGACY_PROPOSED_EXPLORATION' as const,
    directionName: d.directionName,
    oneLineThesis: d.oneLineThesis,
    bigIdea: d.bigIdea,
    source: 'ndxbook-static-territories',
  }));
}

export function buildCoreDirectionFormationInput(params: {
  profile: BrandLoreProfile;
  projectId?: string | null;
  contentBrainSections?: IntelligenceBriefSection[];
  formationVersion?: number;
  includeLegacyExplorations?: boolean;
  orgSlug?: string | null;
  experimentId?: string | null;
  intelligenceSnapshotVersion?: number | null;
}): CoreDirectionFormationInput {
  const { profile, projectId = profile.projectId, contentBrainSections = [], formationVersion = 1 } = params;

  const includeAppetite = shouldIncludeCreativeAppetiteInFormation({
    experimentId: params.experimentId ?? null,
    intelligenceSnapshotVersion: params.intelligenceSnapshotVersion ?? null,
  });
  const appetite = profile.founderCreativeAppetite ?? null;
  const founderCreativeAppetiteSummary =
    includeAppetite && appetite ? summarizeCreativeAppetiteForFormation(appetite) : null;
  const creativeAppetiteFingerprint =
    includeAppetite && appetite ? computeCreativeAppetiteFingerprint(appetite) : null;

  const contentBrainSummary =
    contentBrainSections.length > 0
      ? contentBrainSections.map((s) => `${s.label}: ${s.value}`).join('\n')
      : null;

  const personality = profile.brandPersonality;
  const brandPersonalitySummary = personality
    ? [
        personality.socialInstinct.value?.length
          ? `socialInstinct: ${personality.socialInstinct.value.join(', ')}`
          : null,
        personality.witBehavior.value?.length ? `wit: ${personality.witBehavior.value.join(', ')}` : null,
        personality.confidenceBehavior.value?.length
          ? `confidence: ${personality.confidenceBehavior.value.join(', ')}`
          : null,
        personality.humanityBehavior.value?.length
          ? `humanity: ${personality.humanityBehavior.value.join(', ')}`
          : null,
        personality.disagreementBehavior.value?.length
          ? `disagreement: ${personality.disagreementBehavior.value.join(', ')}`
          : null,
        personality.observationalBehavior.value
          ? `observation: ${personality.observationalBehavior.value}`
          : null,
        personality.antiPersonality.value ? `antiPersonality: ${personality.antiPersonality.value}` : null,
        personality.signatureMoves.value?.length
          ? `signatureMoves: ${personality.signatureMoves.value.join('; ')}`
          : null,
      ]
        .filter(Boolean)
        .join('\n')
    : null;

  const expressionContext = profile.contextClassification ?? 'OTHER';
  const formatProfile = deriveFormatNativeExpressionProfile({
    context: expressionContext,
    profile,
    personality,
  });
  const formatNativeExpressionSummary = summarizeFormatNativeExpression(formatProfile);
  const voice = deriveBrandVoiceBehavior({
    personality,
    formatProfile,
    brandSlug: params.orgSlug ?? null,
  });
  const brandVoiceBehaviorSummary = summarizeBrandVoiceBehavior(voice);
  const cbPersonality = buildContentBrainPersonalityInput(personality);
  const contentBrainPersonalitySummary = cbPersonality
    ? summarizeContentBrainPersonalityInput(cbPersonality)
    : null;
  const formatLineage = buildFormatLineage({
    context: expressionContext,
    formatProfile,
    personality,
  });
  const formatLineageSummary =
    formatLineage.length > 0
      ? formatLineage.map((e) => `${e.targetFormat}: ${e.derivedFormatBehavior} ← ${e.upstreamSource}`).join('\n')
      : null;

  return {
    organizationId: profile.organizationId ?? '',
    projectId: projectId ?? profile.projectId,
    brandLoreProfileId: profile.id,
    brandLoreProfileVersion: profile.profileVersion,
    brandLoreFingerprint: computeBrandLoreFingerprint(profile),
    brandExpressionContext: profile.contextClassification,
    brandPurpose: fieldValue(profile.brandWorld),
    audienceRelationship: fieldValue(profile.audienceRelationship),
    brandBelief: fieldValue(profile.brandBelief),
    culturalOpposition: fieldValue(profile.culturalOpposition),
    coreObsessions: fieldValue(profile.coreObsessions),
    emotionalPromise: fieldValue(profile.emotionalPromise),
    creativeTensions: fieldValue(profile.creativeTensions),
    worldMetaphor: fieldValue(profile.worldMetaphor),
    materialVocabulary: fieldValue(profile.materialVocabulary),
    symbolicVocabulary: fieldValue(profile.symbolicVocabulary),
    referenceLineage: fieldValue(profile.referenceLineage),
    currentReferenceSignals: fieldValue(profile.currentReferenceSignals),
    authenticLanguageSamples: fieldValue(profile.authenticLanguageSamples),
    antiLanguage: fieldValue(profile.antiLanguage),
    socialSignal: fieldValue(profile.socialSignal),
    audienceRitual: fieldValue(profile.audienceRitual),
    memoryGoal: fieldValue(profile.memoryGoal),
    desiredMythology: fieldValue(profile.desiredMythology),
    futureWorld: fieldValue(profile.futureWorld),
    creativeAntiPatterns: fieldValue(profile.creativeAntiPatterns),
    contentBrainSummary,
    brandPersonalitySummary,
    formatNativeExpressionSummary,
    brandVoiceBehaviorSummary,
    contentBrainPersonalitySummary,
    formatLineageSummary,
    founderConfirmedCanon: founderConfirmedEntries(profile),
    referenceEvidence: profile.referenceEvidence ?? [],
    existingCreativeExplorations: params.includeLegacyExplorations === false ? [] : buildLegacyProposedExplorations(),
    formationVersion,
    orgSlug: params.orgSlug ?? null,
    founderCreativeAppetiteSummary,
    creativeAppetiteFingerprint,
    intelligenceSnapshotVersion: params.intelligenceSnapshotVersion ?? undefined,
  };
}

export function buildFormationIdempotencyKey(input: CoreDirectionFormationInput, promptVersion: string): string {
  return [
    input.organizationId,
    input.projectId ?? 'none',
    input.brandLoreFingerprint,
    String(input.formationVersion),
    promptVersion,
  ].join(':');
}
