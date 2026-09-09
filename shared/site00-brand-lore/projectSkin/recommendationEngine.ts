/**
 * MasterSkinRecommendationEngine — grounded recommendations (not random, not field-only).
 */

import { MASTER_SKIN_CATALOG_IDS } from './constants.js';
import { listMasterSkins } from './catalog.js';
import type {
  ExpressionProfile,
  ExpressionProfileTag,
  FieldIndustryTag,
  MasterSkinRecommendationResult,
} from './types.js';

export type SkinRecommendationInput = {
  fieldTags: FieldIndustryTag[];
  brandPersonality?: ExpressionProfileTag[];
  expressionProfile?: Partial<ExpressionProfile>;
  audience?: string;
  projectType?: string;
  visualReferences?: string[];
  moduleMix?: string[];
  /** Existing identity ingestion — do not re-ask founder */
  identityPrimaryColor?: string | null;
  identityPersonalityTags?: ExpressionProfileTag[];
};

function scoreSkin(input: {
  skinId: string;
  skinName: string;
  supportedFields: FieldIndustryTag[];
  expressionTags: ExpressionProfileTag[];
  fieldTags: FieldIndustryTag[];
  personalityTags: ExpressionProfileTag[];
}): { score: number; matchedFields: FieldIndustryTag[]; matchedExpressionTags: ExpressionProfileTag[] } {
  const matchedFields = input.fieldTags.filter((f) => input.supportedFields.includes(f));
  const matchedExpressionTags = input.personalityTags.filter((t) => input.expressionTags.includes(t));

  let score = 0.2;
  score += matchedFields.length * 0.15;
  score += matchedExpressionTags.length * 0.12;

  if (input.skinId === MASTER_SKIN_CATALOG_IDS.CULTURAL_EDITORIAL) {
    if (input.fieldTags.includes('CREATIVE') || input.fieldTags.includes('MEDIA')) score += 0.25;
    if (input.personalityTags.some((t) => ['INVESTIGATIVE', 'CINEMATIC', 'ARCHIVAL'].includes(t))) score += 0.2;
  }

  if (input.skinId === MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL) {
    if (input.fieldTags.includes('HEALTH') || input.fieldTags.includes('MEDICAL')) score += 0.25;
    if (input.personalityTags.some((t) => ['CALM', 'TRUSTED', 'HUMAN', 'PRECISE'].includes(t))) score += 0.25;
    if (input.fieldTags.includes('BEAUTY') && !input.personalityTags.includes('LUXURY')) score -= 0.15;
  }

  if (input.skinId === MASTER_SKIN_CATALOG_IDS.LUXURY_CLINICAL) {
    if (input.fieldTags.includes('BEAUTY') || input.fieldTags.includes('WELLNESS')) score += 0.2;
    if (input.personalityTags.some((t) => ['LUXURY', 'POLISHED', 'ASPIRATIONAL', 'SOFT'].includes(t))) score += 0.3;
  }

  if (input.skinId === MASTER_SKIN_CATALOG_IDS.TECHNICAL_OPERATIONS) {
    if (input.fieldTags.includes('LOGISTICS') || input.fieldTags.includes('PROFESSIONAL_SERVICES')) score += 0.25;
    if (input.personalityTags.some((t) => ['TECHNICAL', 'OPERATIONAL', 'DIRECT', 'EFFICIENT'].includes(t))) score += 0.25;
  }

  return { score: Math.min(1, score), matchedFields, matchedExpressionTags };
}

export function recommendMasterSkins(input: SkinRecommendationInput): MasterSkinRecommendationResult {
  const personalityTags = [
    ...(input.brandPersonality ?? []),
    ...(input.identityPersonalityTags ?? []),
    ...(input.expressionProfile?.tags ?? []),
  ];

  const ranked = listMasterSkins()
    .map((skin) => {
      const { score, matchedFields, matchedExpressionTags } = scoreSkin({
        skinId: skin.id,
        skinName: skin.name,
        supportedFields: skin.supportedFields,
        expressionTags: skin.expressionTags,
        fieldTags: input.fieldTags,
        personalityTags,
      });
      return {
        skinId: skin.id,
        skinName: skin.name,
        confidence: score,
        reasoningSummary: buildReasoning(skin.name, matchedFields, matchedExpressionTags),
        matchedFields,
        matchedExpressionTags,
      };
    })
    .filter((r) => r.confidence >= 0.35)
    .sort((a, b) => b.confidence - a.confidence);

  const top = ranked[0] ?? {
    skinId: MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL,
    skinName: 'Clinical Editorial',
    confidence: 0.4,
    reasoningSummary: 'Default high-trust professional expression.',
    matchedFields: input.fieldTags,
    matchedExpressionTags: personalityTags.slice(0, 3),
  };

  return {
    rankedSkins: ranked.slice(0, 5),
    confidence: top.confidence,
    reasoningSummary: top.reasoningSummary,
    recommendedSkinId: top.skinId,
  };
}

function buildReasoning(
  skinName: string,
  matchedFields: FieldIndustryTag[],
  matchedExpressionTags: ExpressionProfileTag[],
): string {
  const parts: string[] = [`${skinName} matches`];
  if (matchedFields.length) parts.push(`field: ${matchedFields.join(', ')}`);
  if (matchedExpressionTags.length) parts.push(`expression: ${matchedExpressionTags.join(', ')}`);
  return parts.join(' · ');
}

/** Doctor demo acceptance — must recommend clinical editorial, not cultural editorial. */
export function recommendForDoctorDemo(): MasterSkinRecommendationResult {
  return recommendMasterSkins({
    fieldTags: ['HEALTH', 'MEDICAL'],
    brandPersonality: ['CALM', 'PRECISE', 'HUMAN', 'TRUSTED', 'EDUCATIONAL'],
    audience: 'PATIENTS',
  });
}

/** Med spa — luxury clinical, not generic clinical editorial. */
export function recommendForMedSpaDemo(): MasterSkinRecommendationResult {
  return recommendMasterSkins({
    fieldTags: ['HEALTH', 'BEAUTY', 'WELLNESS'],
    brandPersonality: ['POLISHED', 'SOFT', 'ASPIRATIONAL', 'LUXURY'],
  });
}
