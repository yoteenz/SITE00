/**
 * Map alternate Anthropic provider schemas → founder-facing territory distillations.
 * V1 live run used a different field vocabulary than P0.5B canonical schema.
 */

import type { BrandCharacterTerritory } from './types.js';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function pickArray(obj: Record<string, unknown>, ...keys: string[]): string[] {
  for (const key of keys) {
    const v = obj[key];
    if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
    if (typeof v === 'string' && v.trim()) return [v.trim()];
  }
  return [];
}

/** Extract founder-facing territory distillations without mutating persisted record. */
export function extractTerritoryDistillation(character: BrandCharacterTerritory): {
  character: string;
  coreTension: string;
  intelligence: string;
  socialEnergy: string;
  humor: string;
  culturalPosition: string;
  audienceRelationship: string;
  taste: string;
  signatureBehavior: string;
  artifactPotential: string;
  whyThisBrand: string;
  mustNeverBecome: string[];
} {
  const core = asRecord(character.core);
  const intellectual = asRecord(character.intellectual);
  const social = asRecord(character.social);
  const humorWit = asRecord(character.humorWit);
  const cultural = asRecord(character.culturalIntelligence);
  const taste = asRecord(character.taste);
  const expressive = asRecord(character.expressiveBehavior);
  const artifact = asRecord(character.artifactRelationship);

  const characterEssence =
    pickString(core, 'characterEssence', 'fundamentalNature', 'characterPosition', 'centralDrive') ||
    pickString(core, 'characterThesis');

  const coreTension =
    pickString(core, 'characterContradiction', 'internalTension', 'centralDrive') ||
    pickString(core, 'characterPosition');

  const intelligence =
    pickString(intellectual, 'intelligenceStyle', 'thinkingStyle', 'signatureMove', 'intellectualTemperament') ||
    pickString(intellectual, 'relationshipToKnowledge');

  const socialEnergy =
    pickString(social, 'socialPresence', 'socialRole', 'howItEntersARoom', 'conversationalBehavior') ||
    pickString(social, 'participationBehavior');

  const humor =
    pickString(humorWit, 'humorLogic', 'humorMechanism', 'witStyle', 'humorFunction') ||
    pickString(humorWit, 'whatItFindsRidiculous');

  const culturalPosition =
    pickString(cultural, 'culturalPosition', 'culturalLens', 'howItReadsTheMoment', 'whatItNotices') ||
    pickString(cultural, 'culturalFluency');

  const audienceRelationship =
    pickString(social, 'audienceRelationship', 'relationshipToAudience', 'communityRelationship') ||
    pickString(social, 'howItHandlesDisagreement');

  const tasteValue =
    pickString(taste, 'tasteLogic', 'tasteAsCharacter', 'aestheticSensibility', 'whatItEndorses') ||
    pickString(taste, 'whatItRejects');

  const signatureBehavior =
    pickString(expressive, 'expressiveGestures', 'characteristicRhythm', 'howItOccupiesSpace') ||
    (Array.isArray(expressive.characteristicBehaviors)
      ? (expressive.characteristicBehaviors as string[]).slice(0, 1).join('')
      : '');

  const artifactPotential =
    pickString(artifact, 'makerPresence', 'artifactAsCharacterExpression', 'whatArtifactsDo', 'howArtifactsAreHeld') ||
    pickString(artifact, 'relationshipToArchive');

  const whyThisBrand = character.whyItIsNdxbook?.trim() || '';
  const mustNeverBecome = character.whatItMustNeverBecome?.length
    ? character.whatItMustNeverBecome
    : pickArray(asRecord(character as unknown as Record<string, unknown>), 'whatItMustNeverBecome');

  return {
    character: characterEssence,
    coreTension,
    intelligence,
    socialEnergy,
    humor,
    culturalPosition,
    audienceRelationship,
    taste: tasteValue,
    signatureBehavior,
    artifactPotential,
    whyThisBrand,
    mustNeverBecome: Array.isArray(mustNeverBecome)
      ? mustNeverBecome
      : typeof mustNeverBecome === 'string' && mustNeverBecome
        ? [mustNeverBecome]
        : [],
  };
}

/** Canonical UI field paths mapped to alternate provider keys for forensic recovery. */
export const PROVIDER_FIELD_ALTERNATES: Record<string, { section: string; alternates: string[] }> = {
  'core.characterThesis': { section: 'core', alternates: ['centralDrive', 'characterPosition', 'fundamentalNature'] },
  'core.characterEssence': { section: 'core', alternates: ['fundamentalNature', 'characterPosition', 'centralDrive'] },
  'intellectual.intelligenceStyle': {
    section: 'intellectual',
    alternates: ['thinkingStyle', 'signatureMove', 'intellectualTemperament'],
  },
  'social.conversationalBehavior': {
    section: 'social',
    alternates: ['socialRole', 'howItEntersARoom', 'howItHandlesDisagreement'],
  },
  'humorWit.humorLogic': { section: 'humorWit', alternates: ['humorMechanism', 'witStyle', 'humorFunction'] },
  'culturalIntelligence.culturalPosition': {
    section: 'culturalIntelligence',
    alternates: ['culturalLens', 'howItReadsTheMoment', 'whatItNotices'],
  },
  'social.audienceRelationship': {
    section: 'social',
    alternates: ['relationshipToAudience', 'howItHandlesDisagreement'],
  },
  'taste.tasteLogic': { section: 'taste', alternates: ['tasteAsCharacter', 'aestheticSensibility'] },
  'artifactRelationship.makerPresence': {
    section: 'artifactRelationship',
    alternates: ['artifactAsCharacterExpression', 'whatArtifactsDo', 'howArtifactsAreHeld'],
  },
};

export function recoverCanonicalFieldValue(
  character: BrandCharacterTerritory,
  fieldPath: string,
): { value: string | null; provenance: 'RECOVERED_FROM_ALTERNATE_PROVIDER_SCHEMA' | null } {
  const mapping = PROVIDER_FIELD_ALTERNATES[fieldPath];
  if (!mapping) {
    if (fieldPath === 'whyItIsNdxbook') {
      return { value: character.whyItIsNdxbook?.trim() || null, provenance: null };
    }
    return { value: null, provenance: null };
  }
  const section = asRecord((character as Record<string, unknown>)[mapping.section]);
  const canonicalKey = fieldPath.split('.')[1]!;
  const canonical = pickString(section, canonicalKey);
  if (canonical) return { value: canonical, provenance: null };
  const recovered = pickString(section, ...mapping.alternates);
  if (recovered) return { value: recovered, provenance: 'RECOVERED_FROM_ALTERNATE_PROVIDER_SCHEMA' };
  return { value: null, provenance: null };
}
