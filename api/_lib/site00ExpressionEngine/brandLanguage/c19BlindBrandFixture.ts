/**
 * C1.9 — Fresh blind brand fixture (Meridian Atelier).
 * Thin brief only — no winning concept, world, copy, or visual metaphor pre-supplied.
 */

import type { BrandLanguageIdentity, BrandLanguageEvidence } from '../../../shared/site00-expression-engine/brand-language/types.js';
import type { ThinMultiUnitBrief } from '../seniorCreativeJudgment/blindMultiUnitFixtures.js';

export const MERIDIAN_ATELIER_BRAND_ID = 'meridian-atelier-c19';

/** Isolated fictional bespoke fragrance atelier — not Verdant Row, NDXBOOK, Solstice, or C1.8 fixtures. */
export const MERIDIAN_ATELIER_LAUNCH_BRIEF: ThinMultiUnitBrief = {
  briefId: 'meridian-atelier-nocturne-drop-2026',
  brandName: 'Meridian Atelier',
  projectId: MERIDIAN_ATELIER_BRAND_ID,
  campaignId: 'nocturne-parfum-drop-q3',
  brandTruth:
    'Meridian Atelier treats scent as architecture for memory — not decoration. Each composition is built like a room you enter, not a product you wear.',
  campaignObjective:
    'Launch Nocturne Parfum — convert curious luxury seekers into believers that fragrance can feel like private space, not status theater.',
  targetAudience:
    'Design-literate adults 28–45 who buy fewer things but demand craft, silence, and sensory intelligence over loud luxury.',
  productOrService:
    'Limited-run bespoke parfum with architectural note progression and private atelier consultation.',
  launchContext: 'Autumn evening launch — when people crave interiority, warmth, and ritual without spectacle.',
  tone: 'Sensual restraint, architectural precision, quiet authority — never shouty luxury or meme humor.',
  businessGoal: 'Drive waitlist signups and consultation bookings without discount language or influencer gloss.',
  constraints: [
    'No celebrity face',
    'No discount codes in hero assets',
    'Must feel owned by Meridian — not generic niche perfumery',
  ],
  requiredChannels: ['REEL', 'CAROUSEL', 'STORY', 'X', 'EMAIL'],
  founderCreativeAppetite: 'High craft risk — mystery and sensuality ok if specificity leads.',
};

function evidence(
  sourceType: BrandLanguageEvidence['sourceType'],
  text: string,
  weight: number,
): BrandLanguageEvidence {
  return {
    sourceType,
    sourceId: `meridian-${sourceType.toLowerCase()}`,
    textSample: text,
    approved: true,
    weight,
    recency: '2026-09-08',
    campaignScope: false,
    brandScope: true,
  };
}

/** Personality seed from brief — not a pre-written campaign concept. */
export function deriveMeridianBrandLanguageIdentity(): BrandLanguageIdentity {
  const lineage: BrandLanguageEvidence[] = [
    evidence('BRAND_PERSONALITY', MERIDIAN_ATELIER_LAUNCH_BRIEF.brandTruth, 2),
    evidence('FOUNDER_DIRECTION', MERIDIAN_ATELIER_LAUNCH_BRIEF.tone, 2),
    evidence('PRODUCT_LANGUAGE', MERIDIAN_ATELIER_LAUNCH_BRIEF.productOrService, 1),
  ];

  return {
    brandId: MERIDIAN_ATELIER_BRAND_ID,
    brandName: MERIDIAN_ATELIER_LAUNCH_BRIEF.brandName,
    brandArchetype: 'The Architect of Atmosphere',
    brandPersonalitySummary:
      'Quiet luxury through spatial scent — memory as room, not accessory. Precision without performance.',
    emotionalTemperature: 'cool-warm twilight',
    socialPosture: 'invitation not broadcast',
    statusPosture: 'understated mastery',
    humorStyle: 'rare dry aside',
    witStyle: 'architectural understatement',
    romanceLevel: 'sensual not sentimental',
    sensualityLevel: 'textured, oblique',
    luxuryLevel: 'high',
    mysteryLevel: 'moderate-high',
    playfulness: 'low',
    warmth: 'controlled',
    distance: 'intimate but not familiar',
    authority: 'craft-led',
    rebellion: 'anti-loud-luxury',
    directness: 'moderate',
    provocation: 'quiet',
    optimism: 'restrained hope',
    earnestness: 'medium',
    irony: 'minimal',
    restraint: 'high',
    languageDensity: 'sparse-medium',
    sentenceRhythm: 'measured cadence, room between phrases',
    sentenceLength: 'short to medium',
    vocabularyRegister: 'elevated sensory',
    slangBehavior: 'none',
    emojiBehavior: 'none',
    punctuationBehavior: 'minimal em dash, no exclamation stacks',
    capitalizationBehavior: 'sentence case',
    rhetoricalPreferences: ['spatial metaphor', 'withheld reveal', 'sensory specificity'],
    rhetoricalAvoidances: ['shop now urgency', 'generic niche perfumery', 'NDX receipt voice'],
    ctaBehavior: 'soft invitation — enter, discover, reserve',
    sellingPosture: 'consultation and waitlist, never desperation',
    communityPosture: 'private circle',
    conversationPosture: 'whispered expertise',
    signatureLanguage: ['room', 'architecture', 'nocturne', 'atelier', 'memory', 'composition'],
    forbiddenLanguage: ['luxury redefined', 'smell amazing', 'must-have', 'game-changer', 'vibes'],
    brandSpecificPhrases: ['scent as architecture', 'private space', 'note progression'],
    antiBrandPhrases: ['shop now', 'limited time', 'influencer favorite', 'dupe'],
    examplesOfInVoiceLanguage: [],
    examplesOfOutOfVoiceLanguage: ['Smell incredible for less!', 'Your new signature scent awaits!!!'],
    confidence: 'LOW',
    sourceLineage: lineage,
    salesIntensity: 'SOFT',
    humorProfile: {
      dry: 0.6,
      deadpan: 0.4,
      chaotic: 0,
      camp: 0,
      absurd: 0,
      witty: 0.3,
      sarcastic: 0.1,
      selfAware: 0.2,
      playful: 0.1,
      none: 0.5,
      dominantStyle: 'dry architectural aside',
    },
    restraintProfile: {
      allowsSilence: true,
      allowsFragments: true,
      allowsWithheldExplanation: true,
      minimalCtaPreferred: true,
      oneLineCopyPreferred: false,
      noEmojiPreferred: true,
    },
    rhetoricalSignature: {
      mostlyFragments: false,
      rareQuestions: true,
      highMetaphor: true,
      dryUnderstatement: true,
      lushSensory: true,
      fastPunchlines: false,
      directImperatives: false,
      softConversational: false,
      description: 'Spatial sensory restraint — rooms, not products',
    },
    personalityDimensions: {
      mystery: 0.7,
      coolness: 0.6,
      luxury: 0.85,
      warmth: 0.45,
      wit: 0.35,
      humor: 0.15,
      sensuality: 0.75,
      authority: 0.7,
      earnestness: 0.5,
      rebellion: 0.4,
      playfulness: 0.1,
      distance: 0.55,
      directness: 0.45,
      provocation: 0.35,
      salesIntensity: 0.25,
      communityEnergy: 0.3,
      emotionality: 0.55,
    },
  };
}

export function isC19ExcludedBrand(brandId: string): boolean {
  const excluded = [
    'verdant-row',
    'ndxbook',
    'blind-mysterious-fashion',
    'blind-luxury-beauty',
    'blind-playful-consumer',
    'blind-direct-service',
    'solstice-audio',
    'entry-003',
  ];
  return excluded.includes(brandId);
}
