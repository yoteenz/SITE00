/**
 * Coerce partial/malformed Anthropic character payloads into full territory shape.
 * Prevents UI crashes when model output omits nested groups or uses string arrays loosely.
 */

import type {
  BrandCharacterCore,
  BrandCharacterCulturalIntelligence,
  BrandCharacterEmotional,
  BrandCharacterExpressiveBehavior,
  BrandCharacterHumorWit,
  BrandCharacterIntellectual,
  BrandCharacterLanguage,
  BrandCharacterSocial,
  BrandCharacterTaste,
  BrandCharacterTerritory,
  CharacterArtifactRelationship,
} from './types.js';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean).join('; ') || fallback;
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function fillSection<T extends Record<string, string>>(
  raw: unknown,
  defaults: T,
  fieldMap?: Partial<Record<keyof T, string>>,
): T {
  const obj = asRecord(raw);
  const out = { ...defaults };
  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const sourceKey = fieldMap?.[key] ?? (key as string);
    out[key] = asString(obj[sourceKey], defaults[key]) as T[keyof T];
  }
  return out;
}

const DEFAULT_CORE: BrandCharacterCore = {
  characterThesis: '',
  characterEssence: '',
  characterContradiction: '',
  internalTension: '',
  worldview: '',
  orientationTowardWorld: '',
  whatItNotices: '',
  whatItValues: '',
  whatItRejects: '',
  whatItFindsInteresting: '',
  whatItFindsBoring: '',
  whatItTakesSeriously: '',
  whatItRefusesToTakeSeriously: '',
};

export type CoercibleCharacterPayload = {
  name?: unknown;
  core?: unknown;
  intellectual?: unknown;
  social?: unknown;
  emotional?: unknown;
  humorWit?: unknown;
  humor_wit?: unknown;
  culturalIntelligence?: unknown;
  cultural_intelligence?: unknown;
  language?: unknown;
  taste?: unknown;
  expressiveBehavior?: unknown;
  expressive_behavior?: unknown;
  artifactRelationship?: unknown;
  artifact_relationship?: unknown;
  whyItIsNdxbook?: unknown;
  why_it_is_ndxbook?: unknown;
  whatItMustNeverBecome?: unknown;
  what_it_must_never_become?: unknown;
  antiCharacterRules?: unknown;
  anti_character_rules?: unknown;
  notThis?: unknown;
  not_this?: unknown;
  [key: string]: unknown;
};

export type CoercedCharacterPayload = {
  name: string;
  core: BrandCharacterCore;
  intellectual: BrandCharacterIntellectual;
  social: BrandCharacterSocial;
  emotional: BrandCharacterEmotional;
  humorWit: BrandCharacterHumorWit;
  culturalIntelligence: BrandCharacterCulturalIntelligence;
  language: BrandCharacterLanguage;
  taste: BrandCharacterTaste;
  expressiveBehavior: BrandCharacterExpressiveBehavior;
  artifactRelationship: CharacterArtifactRelationship;
  whyItIsNdxbook: string;
  whatItMustNeverBecome: string[];
  antiCharacterRules: string[];
  notThis: string[];
};

export function coerceCharacterPayload(raw: CoercibleCharacterPayload): CoercedCharacterPayload {
  const root = asRecord(raw);
  const name = asString(raw.name ?? root.characterName ?? root.title, 'UNNAMED CHARACTER');

  const core = fillSection(raw.core ?? root, DEFAULT_CORE);

  if (!core.characterThesis) {
    core.characterThesis = asString(root.characterThesis ?? root.character_thesis ?? root.thesis, name);
  }
  if (!core.characterEssence) {
    core.characterEssence = asString(root.characterEssence ?? root.character_essence ?? root.essence, '');
  }

  return {
    name,
    core,
    intellectual: fillSection(raw.intellectual ?? root.intellectualCharacter ?? root, {
      intelligenceStyle: '',
      curiosityBehavior: '',
      knowledgePosture: '',
      reasoningBehavior: '',
      relationshipToCertainty: '',
      relationshipToComplexity: '',
      relationshipToExpertise: '',
      relationshipToDiscovery: '',
      relationshipToMemory: '',
    }),
    social: fillSection(raw.social ?? root.socialCharacter ?? root, {
      socialPresence: '',
      audienceRelationship: '',
      intimacyDistance: '',
      statusBehavior: '',
      authorityBehavior: '',
      participationBehavior: '',
      conversationalBehavior: '',
      communityRelationship: '',
      relationshipToAttention: '',
    }),
    emotional: fillSection(raw.emotional ?? root.emotionalCharacter ?? root, {
      emotionalRange: '',
      emotionalBaseline: '',
      emotionalVolatility: '',
      restraintBehavior: '',
      enthusiasmBehavior: '',
      irritationBehavior: '',
      delightBehavior: '',
      seriousnessBehavior: '',
      vulnerabilityBoundary: '',
    }),
    humorWit: fillSection(raw.humorWit ?? raw.humor_wit ?? root.humorWit ?? root, {
      humorLogic: '',
      witMechanism: '',
      comedicTemperature: '',
      ironyRelationship: '',
      absurdityRelationship: '',
      shadeBehavior: '',
      teasingBehavior: '',
      understatementBehavior: '',
      exaggerationBehavior: '',
      whatTheBrandWouldNeverJokeAbout: '',
    }),
    culturalIntelligence: fillSection(
      raw.culturalIntelligence ?? raw.cultural_intelligence ?? root.culturalIntelligence ?? root,
      {
        culturalPosition: '',
        culturalFluency: '',
        culturalReferenceBehavior: '',
        referenceDensity: '',
        referenceSelectionLogic: '',
        subculturalRelationship: '',
        temporalCultureRelationship: '',
        internetCultureRelationship: '',
        historicalCultureRelationship: '',
        culturalMemoryBehavior: '',
        appropriationGuardrails: '',
        culturalAuthenticityRules: '',
      },
    ),
    language: fillSection(raw.language ?? root.languageCharacter ?? root, {
      verbalCadence: '',
      sentenceBehavior: '',
      vocabularyBehavior: '',
      shorthandBehavior: '',
      explanationThreshold: '',
      namingBehavior: '',
      interruptionBehavior: '',
      annotationBehavior: '',
      emphasisBehavior: '',
      silenceBehavior: '',
      captionBehavior: '',
      linguisticTexture: '',
    }),
    taste: fillSection(raw.taste ?? root.tasteCharacter ?? root, {
      tasteLogic: '',
      beautyRelationship: '',
      uglinessRelationship: '',
      polishRelationship: '',
      messRelationship: '',
      preciousnessRelationship: '',
      irreverenceRelationship: '',
      restraintVsExcess: '',
      orderVsChaos: '',
      permanenceVsEphemerality: '',
      highLowCultureRelationship: '',
    }),
    expressiveBehavior: {
      ...fillSection(raw.expressiveBehavior ?? raw.expressive_behavior ?? root.expressiveBehavior ?? root, {
        expressiveGestures: '',
        recurringBehaviors: '',
        artifactBehavior: '',
        imageBehavior: '',
        typographyBehavior: '',
        colorBehavior: '',
        compositionBehavior: '',
        materialBehavior: '',
        motionBehavior: '',
      }),
      soundBehavior: asString(
        asRecord(raw.expressiveBehavior ?? raw.expressive_behavior ?? root.expressiveBehavior).soundBehavior,
        '',
      ) || null,
    },
    artifactRelationship: fillSection(
      raw.artifactRelationship ?? raw.artifact_relationship ?? root.artifactRelationship ?? root,
      {
        makerPresence: '',
        reactionEvidence: '',
        judgmentEvidence: '',
        selectionEvidence: '',
        interventionEvidence: '',
        accumulationEvidence: '',
        traceOfHandling: '',
        explainabilityPrinciple: '',
      },
    ),
    whyItIsNdxbook: asString(
      raw.whyItIsNdxbook ?? raw.why_it_is_ndxbook ?? root.whyItIsNdxbook ?? root.whyIsNdxbook,
      '',
    ),
    whatItMustNeverBecome: asStringArray(
      raw.whatItMustNeverBecome ?? raw.what_it_must_never_become ?? root.whatItMustNeverBecome,
    ),
    antiCharacterRules: asStringArray(raw.antiCharacterRules ?? raw.anti_character_rules ?? root.antiCharacterRules),
    notThis: asStringArray(raw.notThis ?? raw.not_this ?? root.notThis),
  };
}

export function migrateCharacterTerritory(character: BrandCharacterTerritory): BrandCharacterTerritory {
  const coerced = coerceCharacterPayload(character as CoercibleCharacterPayload);
  return {
    ...character,
    ...coerced,
  };
}
