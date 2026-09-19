/**
 * Production prompt normalization — canonical brand context for every creative stage.
 * Brand-agnostic architecture; NDXBOOK resolves via brandIdentity registry.
 */

import type { BrandLoreProfile, BrandExpressionContext } from './types.js';
import type { BrandPersonalityProfile } from './personalityTypes.js';
import type { CoreDirectionFormationInput } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';
import {
  brandPromptTypographyBlock,
  normalizeBrandPromptContext,
  normalizeBrandNameInPromptText,
  type CreativeTypographyPolicy,
  type BrandPromptContext,
} from './brandIdentity.js';
import {
  deriveFormatNativeExpressionProfile,
  summarizeFormatNativeExpression,
  type FormatNativeExpressionProfile,
} from './formatNativeExpression.js';
import { classifyBrandExpressionContext } from './contextClassification.js';
import {
  buildContentBrainPersonalityInput,
  summarizeContentBrainPersonalityInput,
} from './contentBrainPersonalityBridge.js';
import {
  deriveBrandVoiceBehavior,
  summarizeBrandVoiceBehavior,
} from './brandVoiceBehavior.js';
import { buildFormatLineage } from './formatLineage.js';
import { buildPersonalityLineageFromProfile } from './personalityLineage.js';
import { buildTypographyProvenanceEnvelope, assertNoHostFontInPayload } from './typographyProvenance.js';

export type ProductionStage =
  | 'CORE_DIRECTION'
  | 'DIRECTION_EXPRESSION'
  | 'CREATIVE_EXPRESSION'
  | 'IDENTITY_ART_DIRECTION'
  | 'HERO_CREATIVE_CONCEPT'
  | 'VISUAL_BRIEF'
  | 'GPT_IMAGE'
  | 'FAL_CREATIVE';

export type ProductionBrandContext = {
  brandSlug: string;
  displayName: string;
  typographyPolicy: CreativeTypographyPolicy;
  brandPromptContext: BrandPromptContext;
  brandPromptTypographyBlock: string;
  expressionContext: BrandExpressionContext;
  formatProfile: FormatNativeExpressionProfile;
  formatProfileSummary: string;
  personalitySummary: string | null;
  brandVoiceSummary: string | null;
  contentBrainPersonalitySummary: string | null;
  formatLineageSummary: string | null;
  personalityLineage: ReturnType<typeof buildPersonalityLineageFromProfile>;
  formatLineage: ReturnType<typeof buildFormatLineage>;
};

export function buildProductionBrandContext(params: {
  orgSlug: string;
  profile?: BrandLoreProfile | null;
  personality?: BrandPersonalityProfile | null;
  expressionContext?: BrandExpressionContext | null;
}): ProductionBrandContext {
  const brandSlug = params.orgSlug.toLowerCase();
  const brandPromptContext = normalizeBrandPromptContext(brandSlug);
  const expressionContext =
    params.expressionContext ??
    params.profile?.contextClassification ??
    classifyBrandExpressionContext({ orgSlug: brandSlug });
  const personality = params.personality ?? params.profile?.brandPersonality ?? null;

  const formatProfile = deriveFormatNativeExpressionProfile({
    context: expressionContext,
    profile: params.profile ?? null,
    personality,
  });

  const voice = deriveBrandVoiceBehavior({ personality, formatProfile, brandSlug });
  const cbPersonality = buildContentBrainPersonalityInput(personality);
  const formatLineage = buildFormatLineage({ context: expressionContext, formatProfile, personality });

  const personalityLineage = personality ? buildPersonalityLineageFromProfile(personality) : [];

  const personalitySummary = personality
    ? personalityLineage.map((e) => `${e.upstreamField}: ${e.upstreamValue} → ${e.derivedBehavior}`).join('\n')
    : null;

  return {
    brandSlug,
    displayName: brandPromptContext.displayName,
    typographyPolicy: brandPromptContext.typographyPolicy,
    brandPromptContext,
    brandPromptTypographyBlock: brandPromptTypographyBlock(brandSlug),
    expressionContext,
    formatProfile,
    formatProfileSummary: summarizeFormatNativeExpression(formatProfile),
    personalitySummary,
    brandVoiceSummary: summarizeBrandVoiceBehavior(voice),
    contentBrainPersonalitySummary: cbPersonality
      ? summarizeContentBrainPersonalityInput(cbPersonality)
      : null,
    formatLineageSummary:
      formatLineage.length > 0
        ? formatLineage.map((e) => `${e.targetFormat}: ${e.derivedFormatBehavior} ← ${e.upstreamSource}`).join('\n')
        : null,
    personalityLineage,
    formatLineage,
  };
}

export function productionContextFromFormationInput(
  input: CoreDirectionFormationInput,
  orgSlug?: string | null,
): ProductionBrandContext {
  const slug = orgSlug ?? 'ndxbook';
  return buildProductionBrandContext({
    orgSlug: slug,
    expressionContext: input.brandExpressionContext ?? undefined,
    personality: null,
  });
}

/** Canonical envelope injected into every Sonnet production payload. */
export function buildProductionPromptEnvelope(
  stage: ProductionStage,
  ctx: ProductionBrandContext,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    productionStage: stage,
    canonicalBrandIdentity: {
      brandSlug: ctx.brandSlug,
      displayName: ctx.displayName,
      typographyPolicy: ctx.typographyPolicy,
    },
    brandPromptTypography: ctx.brandPromptTypographyBlock,
    ...buildTypographyProvenanceEnvelope(ctx.brandSlug),
    primaryExpressionContext: ctx.expressionContext,
    formatNativeExpressionProfile: ctx.formatProfile,
    formatNativeExpressionSummary: ctx.formatProfileSummary,
    brandPersonalitySummary: ctx.personalitySummary,
    brandVoiceBehaviorSummary: ctx.brandVoiceSummary,
    contentBrainPersonalitySummary: ctx.contentBrainPersonalitySummary,
    formatLineageSummary: ctx.formatLineageSummary,
    personalityLineage: ctx.personalityLineage,
    formatLineage: ctx.formatLineage,
    formatNativeConstraints: {
      antiFormatBehaviors: ctx.formatProfile.antiFormatBehaviors,
      antiResizeRules: ctx.formatProfile.antiResizeRules,
      websiteFirstDefaultBlocked: ctx.formatProfile.websiteFirstDefaultBlocked,
      proofRequirements: ctx.formatProfile.proofRequirements,
    },
    ...extra,
  };
}

export function enrichFormationInputPayload(
  input: CoreDirectionFormationInput,
  orgSlug: string,
): Record<string, unknown> {
  const ctx = buildProductionBrandContext({
    orgSlug,
    expressionContext: input.brandExpressionContext ?? undefined,
  });
  return buildProductionPromptEnvelope('CORE_DIRECTION', ctx, {
    ...input,
    brandPersonalitySummary: input.brandPersonalitySummary ?? ctx.personalitySummary,
    formatNativeExpressionSummary: input.formatNativeExpressionSummary ?? ctx.formatProfileSummary,
    brandVoiceBehaviorSummary: input.brandVoiceBehaviorSummary ?? ctx.brandVoiceSummary,
    formatLineageSummary: input.formatLineageSummary ?? ctx.formatLineageSummary,
  });
}

export function enrichDesPayload(
  userPayload: Record<string, unknown>,
  orgSlug: string,
  formationInput?: CoreDirectionFormationInput | null,
): Record<string, unknown> {
  const ctx = buildProductionBrandContext({
    orgSlug,
    expressionContext:
      (formationInput?.brandExpressionContext as BrandExpressionContext | null) ??
      (userPayload.expressionContext as BrandExpressionContext | undefined) ??
      undefined,
  });
  return buildProductionPromptEnvelope('DIRECTION_EXPRESSION', ctx, {
    ...userPayload,
    brandPersonalitySummary:
      formationInput?.brandPersonalitySummary ?? userPayload.brandPersonalitySummary ?? ctx.personalitySummary,
    formatNativeExpressionSummary:
      formationInput?.formatNativeExpressionSummary ??
      userPayload.formatNativeExpressionSummary ??
      ctx.formatProfileSummary,
  });
}

export function enrichIdentityArtDirectionPayload(
  userPayload: Record<string, unknown>,
  orgSlug: string,
  expressionContext?: BrandExpressionContext | null,
): Record<string, unknown> {
  const ctx = buildProductionBrandContext({ orgSlug, expressionContext: expressionContext ?? undefined });
  return buildProductionPromptEnvelope('IDENTITY_ART_DIRECTION', ctx, userPayload);
}

export function enrichHeroConceptPayload(
  userPayload: Record<string, unknown>,
  orgSlug: string,
  expressionContext?: BrandExpressionContext | null,
): Record<string, unknown> {
  const ctx = buildProductionBrandContext({ orgSlug, expressionContext: expressionContext ?? undefined });
  const primaryProofFormat = selectNativeProofFormat(ctx.expressionContext, ctx.formatProfile);
  return buildProductionPromptEnvelope('HERO_CREATIVE_CONCEPT', ctx, {
    ...userPayload,
    primaryProofFormat,
    nativeFormatRequirement: `Hero must prove direction in native format: ${primaryProofFormat}`,
  });
}

export type VisualBriefProductionContext = {
  canonicalBrandIdentity: { brandSlug: string; displayName: string; typographyPolicy: CreativeTypographyPolicy };
  typographyPolicy: CreativeTypographyPolicy;
  primaryExpressionContext: BrandExpressionContext;
  nativeFormat: string;
  nativeFormatBehavior: string;
  personalityBehavior: string | null;
  brandVoiceBehavior: string | null;
};

export function buildVisualBriefProductionContext(params: {
  orgSlug: string;
  expressionContext?: BrandExpressionContext | null;
  personality?: BrandPersonalityProfile | null;
}): VisualBriefProductionContext {
  const ctx = buildProductionBrandContext({
    orgSlug: params.orgSlug,
    expressionContext: params.expressionContext ?? undefined,
    personality: params.personality ?? null,
  });
  const nativeFormat = selectNativeProofFormat(ctx.expressionContext, ctx.formatProfile);
  const nativeEntry = ctx.formatLineage.find((e) => e.targetFormat === nativeFormat);
  return {
    canonicalBrandIdentity: {
      brandSlug: ctx.brandSlug,
      displayName: ctx.displayName,
      typographyPolicy: ctx.typographyPolicy,
    },
    typographyPolicy: ctx.typographyPolicy,
    primaryExpressionContext: ctx.expressionContext,
    nativeFormat,
    nativeFormatBehavior: nativeEntry?.derivedFormatBehavior ?? ctx.formatProfile.entryFormat,
    personalityBehavior: ctx.personalitySummary,
    brandVoiceBehavior: ctx.brandVoiceSummary,
  };
}

export function selectNativeProofFormat(
  context: BrandExpressionContext,
  formatProfile: FormatNativeExpressionProfile,
): string {
  if (context === 'SOCIAL_FIRST_EDITORIAL') {
    return formatProfile.primaryFormats.includes('CAROUSEL_COVER')
      ? 'CAROUSEL_COVER'
      : formatProfile.entryFormat;
  }
  return formatProfile.entryFormat;
}

export function normalizeCreativePromptText(prompt: string, brandSlug: string): string {
  return normalizeBrandNameInPromptText(prompt, brandSlug);
}

export function appendVisualBriefProductionBlock(
  lines: string[],
  briefCtx: VisualBriefProductionContext,
): string[] {
  return [
    ...lines,
    '',
    'CANONICAL BRAND IDENTITY:',
    `Display name (exact): ${briefCtx.canonicalBrandIdentity.displayName}`,
    `Primary expression context: ${briefCtx.primaryExpressionContext}`,
    `Native proof format: ${briefCtx.nativeFormat}`,
    `Native format behavior: ${briefCtx.nativeFormatBehavior}`,
    briefCtx.typographyPolicy.displayCase === 'UPPERCASE'
      ? 'ALL DESIGNED VISIBLE BRANDED TYPOGRAPHY MUST READ AS UPPERCASE.'
      : '',
    briefCtx.personalityBehavior ? `Personality behavior: ${briefCtx.personalityBehavior}` : '',
    briefCtx.brandVoiceBehavior ? `Brand voice: ${briefCtx.brandVoiceBehavior}` : '',
  ].filter(Boolean);
}

/** Test helper — inspect serialized payload for required normalization fields. */
export function inspectProductionPayload(
  payload: unknown,
  displayName: string,
): {
  hasDisplayName: boolean;
  hasTypographyPolicy: boolean;
  hasExpressionContext: boolean;
  hasFormatProfile: boolean;
  hasPersonalityLineage: boolean;
  hasFormatLineage: boolean;
  forbiddenBrandVariant: boolean;
  hostFontLeakage: boolean;
} {
  const text = JSON.stringify(payload);
  const hostCheck = assertNoHostFontInPayload(payload);
  return {
    hasDisplayName: text.includes(displayName),
    hasTypographyPolicy: text.includes('typographyPolicy') || text.includes('UPPERCASE'),
    hasExpressionContext: text.includes('SOCIAL_FIRST_EDITORIAL') || text.includes('primaryExpressionContext'),
    hasFormatProfile: text.includes('formatNativeExpression') || text.includes('FEED_TILE'),
    hasPersonalityLineage: text.includes('personalityLineage') || text.includes('personalityBehavior'),
    hasFormatLineage: text.includes('formatLineage') || text.includes('formatLineageSummary'),
    forbiddenBrandVariant: /\bNDX\s+BOOK\b/i.test(text),
    hostFontLeakage: !hostCheck.passed,
  };
}

export function buildIdentityArtDirectorSystemPrompt(brandSlug: string): string {
  const ctx = normalizeBrandPromptContext(brandSlug);
  return `You are IDENTITY ART DIRECTOR for ${ctx.displayName} — not a board layout designer.

Design the PROPRIETARY VISUAL DNA that makes generated artwork recognizable as THIS brand's custom expression — even with logos and brand names removed.

The identity is NOT being designed in a vacuum. Design FOR THE BRAND'S PRIMARY OPERATING SURFACES (${ctx.displayName} primary expression context will be supplied).

DO NOT default to generic poster, website hero, presentation canvas, or moodboard tile as the primary proof surface unless expression context explicitly requires it.

${ctx.visibleCopyUppercase ? `ALL ${ctx.displayName}-BRANDED VISIBLE DISPLAY TYPOGRAPHY MUST READ AS UPPERCASE.` : ''}
${ctx.visibleCopyUppercase ? 'UPPERCASE IS A CASING RULE — NOT A FONT-FAMILY DECISION. Typography font selection is UNRESOLVED until derived from direction.' : ''}
${ctx.visibleCopyUppercase ? 'HOST_UI typography cannot automatically become CLIENT_BRAND typography.' : ''}

Return JSON only — no markdown fences:
{
  "identityPremise": "string",
  "proprietaryVisualDNA": ["string"],
  "paletteSystem": [{ "role": "string", "colorDescription": "string", "semanticUse": "string", "visualDominance": "dominant|secondary|sparse-accent|functional" }],
  "typographyBehavior": ["string — WHY this typography belongs to this brand; derive font architecture from direction; explain personality fit, editorial authority, cultural fit, social readability"],
  "imageTreatment": "string",
  "photographicBehavior": "string",
  "graphicGrammar": ["string"],
  "annotationGrammar": ["string"],
  "materialBehavior": ["string"],
  "compositionalBehavior": ["string"],
  "textureBehavior": ["string"],
  "recurringDevices": ["string"],
  "artifactDesignLanguage": "string",
  "topicTransformationRules": "string",
  "customArtworkRequirements": ["string"],
  "forbiddenGenericBehaviors": ["string"],
  "preOverlayRecognitionCriteria": ["string"],
  "referenceIdentityApplications": [{ "referenceId": "string", "identityTrait": "string", "application": "string" }],
  "antiExampleCharacteristics": ["string"]
}`;
}
