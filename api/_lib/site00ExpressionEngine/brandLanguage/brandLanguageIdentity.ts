/**
 * C1.8 — Brand language identity derivation from evidence hierarchy.
 */

import type {
  BrandLanguageIdentity,
  BrandLanguageEvidence,
  BrandLanguageTerritory,
  BrandVoiceConfidence,
} from '../../../shared/site00-expression-engine/brand-language/types.js';
import type { CampaignVoiceProfile } from '../../../shared/site00-expression-engine/campaign-copy/types.js';
import {
  MULTI_BRAND_BLIND_FIXTURES,
  MYSTERIOUS_FASHION_IDENTITY,
  NDXBOOK_REGRESSION_IDENTITY,
  VERDANT_ROW_IDENTITY,
} from './multiBrandBlindFixtures.js';
import { deriveMeridianBrandLanguageIdentity, MERIDIAN_ATELIER_BRAND_ID } from './c19BlindBrandFixture.js';

const ALL_KNOWN_IDENTITIES = [...MULTI_BRAND_BLIND_FIXTURES, VERDANT_ROW_IDENTITY, NDXBOOK_REGRESSION_IDENTITY];

export function deriveBrandLanguageIdentity(args: {
  brandId: string;
  brandName: string;
  tone?: string;
  positioning?: string;
  founderCreativeAppetite?: string;
  evidence?: BrandLanguageEvidence[];
  projectId?: string;
}): BrandLanguageIdentity {
  const fixture = ALL_KNOWN_IDENTITIES.find((b) => b.brandId === args.brandId);
  if (fixture) return { ...fixture, brandName: args.brandName || fixture.brandName };

  if (args.brandId === MERIDIAN_ATELIER_BRAND_ID) {
    const meridian = deriveMeridianBrandLanguageIdentity();
    return { ...meridian, brandName: args.brandName || meridian.brandName, sourceLineage: args.evidence ?? meridian.sourceLineage };
  }

  if (args.projectId === 'ndxbook') {
    return { ...NDXBOOK_REGRESSION_IDENTITY, brandName: args.brandName };
  }

  const evidence = args.evidence ?? [];
  const confidence = computeVoiceConfidence(evidence);
  const base = { ...MYSTERIOUS_FASHION_IDENTITY };
  return {
    ...base,
    brandId: args.brandId,
    brandName: args.brandName,
    brandPersonalitySummary: args.positioning ?? args.tone ?? base.brandPersonalitySummary,
    confidence,
    sourceLineage: evidence,
    emotionalTemperature: args.tone ?? base.emotionalTemperature,
  };
}

export function computeVoiceConfidence(evidence: BrandLanguageEvidence[]): BrandVoiceConfidence {
  const approved = evidence.filter((e) => e.approved);
  const weighted = approved.reduce((s, e) => s + e.weight, 0);
  if (weighted >= 8) return 'HIGH';
  if (weighted >= 4) return 'MODERATE';
  return 'LOW';
}

export function generateBrandLanguageTerritories(identity: BrandLanguageIdentity): BrandLanguageTerritory[] {
  if (identity.confidence === 'HIGH') {
    return [
      {
        territoryName: `${identity.brandArchetype} — canonical`,
        voiceThesis: identity.brandPersonalitySummary,
        tone: identity.emotionalTemperature,
        sentenceBehavior: identity.sentenceRhythm,
        witBehavior: identity.witStyle,
        sellingBehavior: identity.sellingPosture,
        ctaBehavior: identity.ctaBehavior,
        platformBehavior: 'medium-native',
        exampleCaption: identity.examplesOfInVoiceLanguage[0] ?? '',
        exampleHeadline: identity.brandSpecificPhrases[0] ?? '',
        exampleCTA: identity.ctaBehavior.split('·')[0]?.trim() ?? 'LEARN MORE',
        whyItFitsBrand: 'Derived from approved brand evidence',
        risk: 'LOW',
        differenceFromOtherTerritories: 'Canonical approved voice',
      },
    ];
  }

  return [
    {
      territoryName: `${identity.brandArchetype} — exploratory A`,
      voiceThesis: `Explore ${identity.emotionalTemperature} expression`,
      tone: identity.emotionalTemperature,
      sentenceBehavior: identity.sentenceRhythm,
      witBehavior: identity.witStyle,
      sellingBehavior: identity.sellingPosture,
      ctaBehavior: identity.ctaBehavior,
      platformBehavior: 'medium-native',
      exampleCaption: identity.examplesOfInVoiceLanguage[0] ?? 'Sample A',
      exampleHeadline: 'Headline A',
      exampleCTA: 'CTA A',
      whyItFitsBrand: 'Low confidence — territory A for founder review',
      risk: 'MODERATE',
      differenceFromOtherTerritories: 'Warmer than B',
    },
    {
      territoryName: `${identity.brandArchetype} — exploratory B`,
      voiceThesis: `Alternate ${identity.restraint} register`,
      tone: identity.emotionalTemperature,
      sentenceBehavior: 'alternate rhythm',
      witBehavior: identity.witStyle,
      sellingBehavior: identity.sellingPosture,
      ctaBehavior: identity.ctaBehavior,
      platformBehavior: 'medium-native',
      exampleCaption: identity.examplesOfInVoiceLanguage[1] ?? 'Sample B',
      exampleHeadline: 'Headline B',
      exampleCTA: 'CTA B',
      whyItFitsBrand: 'Low confidence — territory B for founder review',
      risk: 'MODERATE',
      differenceFromOtherTerritories: 'Cooler than A',
    },
  ];
}

export function deriveCampaignVoice(
  brandIdentity: BrandLanguageIdentity,
  campaignObjective: string,
): string {
  return `${brandIdentity.emotionalTemperature} — ${campaignObjective.slice(0, 60)}`;
}

export function deriveUnitVoice(
  brandIdentity: BrandLanguageIdentity,
  postRole: string,
  platform: string,
): string {
  const modulations: Record<string, string> = {
    PRODUCT_HERO: 'desire',
    BEHIND_THE_SCENES: 'humanity',
    EDUCATIONAL: 'clarity',
    UGC: 'community',
    LAUNCH: 'energy',
    SALE: 'directness',
    EDITORIAL: 'thought',
    MEME: 'humor',
  };
  return `${modulations[postRole] ?? 'native'} · ${platform} · ${brandIdentity.brandArchetype}`;
}

export function brandIdentityToCampaignVoiceProfile(
  identity: BrandLanguageIdentity,
  campaignVoice: string,
): CampaignVoiceProfile {
  return {
    brandVoice: identity.brandPersonalitySummary,
    campaignVoice,
    emotionalTemperature: identity.emotionalTemperature,
    sentenceRhythm: identity.sentenceRhythm,
    sentenceLength: identity.sentenceLength,
    vocabularyLevel: identity.vocabularyRegister,
    witLevel: identity.witStyle,
    directness: identity.directness,
    provocationLevel: identity.provocation,
    warmth: identity.warmth,
    authority: identity.authority,
    playfulness: identity.playfulness,
    restraint: identity.restraint,
    punctuationBehavior: identity.punctuationBehavior,
    emojiBehavior: identity.emojiBehavior,
    slangBehavior: identity.slangBehavior,
    capitalizationBehavior: identity.capitalizationBehavior,
    forbiddenLanguage: [...identity.forbiddenLanguage, ...identity.antiBrandPhrases],
    preferredRhetoricalDevices: identity.rhetoricalPreferences,
  };
}

export function extractBrandSpecificityMarkers(
  identity: BrandLanguageIdentity,
  caption: string,
): {
  wordChoice: string[];
  rhythm: string;
  humorBehavior: string;
  luxuryPosture: string;
  emotionalRestraint: string;
  ctaPosture: string;
  signaturePhrasing: string[];
  audienceRelationship: string;
} {
  const words = identity.signatureLanguage.filter((s) =>
    caption.toLowerCase().includes(s.toLowerCase().slice(0, 8)),
  );
  return {
    wordChoice: words.length ? words : identity.brandSpecificPhrases.slice(0, 2),
    rhythm: identity.sentenceRhythm,
    humorBehavior: identity.humorProfile.dominantStyle,
    luxuryPosture: identity.luxuryLevel,
    emotionalRestraint: identity.restraint,
    ctaPosture: identity.ctaBehavior,
    signaturePhrasing: identity.brandSpecificPhrases,
    audienceRelationship: identity.conversationPosture,
  };
}

export function strengthenBrandLanguageFromApprovedEdit(
  identity: BrandLanguageIdentity,
  approvedCaption: string,
): BrandLanguageIdentity {
  if (!approvedCaption.trim()) return identity;
  return {
    ...identity,
    examplesOfInVoiceLanguage: [...identity.examplesOfInVoiceLanguage, approvedCaption].slice(-5),
    confidence: identity.confidence === 'LOW' ? 'MODERATE' : identity.confidence,
  };
}
