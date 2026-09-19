/**
 * Format-native expression profile — derived production context from Primary Expression Context.
 * NOT new canon; compiles from Brand Lore + Personality + expression classification.
 */

import type { BrandExpressionContext, BrandLoreProfile } from './types.js';
import type { BrandPersonalityProfile } from './personalityTypes.js';

export type FormatProofPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type SocialFormatKey =
  | 'FEED_TILE'
  | 'CAROUSEL_COVER'
  | 'CAROUSEL_SEQUENCE'
  | 'STORY_FRAME'
  | 'STORY_SEQUENCE'
  | 'REEL_HOOK'
  | 'REEL_FRAME'
  | 'TIKTOK_VERTICAL'
  | 'MOTION_KEYFRAME'
  | 'CONTENT_FRANCHISE'
  | 'COMMENT_REPLY_BEHAVIOR'
  | 'SAVEABLE_REFERENCE_POST';

export type FormatNativeExpressionProfile = {
  primaryContext: BrandExpressionContext;
  primaryFormats: string[];
  secondaryFormats: string[];
  formatPriorities: Record<string, FormatProofPriority>;
  audienceConsumptionBehavior: string;
  entryFormat: string;
  repeatFormat: string;
  conversionOrEngagementBehavior: string;
  motionExpectation: string;
  thumbnailBehavior: string;
  sequenceBehavior: string;
  saveShareBehavior: string;
  commentInteractionBehavior: string;
  longFormBehavior: string;
  shortFormBehavior: string;
  physicalExtensionBehavior: string;
  antiFormatBehaviors: string[];
  proofRequirements: string[];
  antiResizeRules: string[];
  websiteFirstDefaultBlocked: boolean;
};

const SOCIAL_PRIMARY: SocialFormatKey[] = [
  'FEED_TILE',
  'CAROUSEL_COVER',
  'CAROUSEL_SEQUENCE',
  'STORY_FRAME',
  'STORY_SEQUENCE',
  'REEL_HOOK',
  'REEL_FRAME',
  'TIKTOK_VERTICAL',
  'MOTION_KEYFRAME',
  'CONTENT_FRANCHISE',
  'SAVEABLE_REFERENCE_POST',
];

const SOCIAL_PROOF_PRIORITY: Record<string, FormatProofPriority> = {
  FEED_TILE: 'HIGH',
  CAROUSEL_COVER: 'HIGH',
  CAROUSEL_SEQUENCE: 'HIGH',
  STORY_FRAME: 'HIGH',
  STORY_SEQUENCE: 'HIGH',
  REEL_HOOK: 'HIGH',
  REEL_FRAME: 'HIGH',
  TIKTOK_VERTICAL: 'HIGH',
  MOTION_KEYFRAME: 'HIGH',
  CONTENT_FRANCHISE: 'HIGH',
  SAVEABLE_REFERENCE_POST: 'HIGH',
  COMMENT_REPLY_BEHAVIOR: 'MEDIUM',
  TYPOGRAPHY_SPECIMEN: 'MEDIUM',
  MATERIAL_SPECIMEN: 'MEDIUM',
  WEBSITE_PAGE: 'LOW',
  GENERIC_POSTER: 'LOW',
  DESKTOP_MOCKUP: 'LOW',
};

const ECOMMERCE_PRIMARY = [
  'PRODUCT_IMAGE',
  'PDP_MODULE',
  'CAMPAIGN_SOCIAL',
  'PACKAGING',
  'MERCHANDISING',
];

const SERVICE_PRIMARY = [
  'TRUST_SURFACE',
  'PROCESS_PROOF',
  'INTAKE',
  'SOCIAL_PROOF',
  'CONVERSION_MOMENT',
];

const APP_PRIMARY = [
  'INTERFACE',
  'ONBOARDING',
  'FEATURE_MOMENT',
  'PRODUCT_MOTION',
  'NOTIFICATION',
];

const ANTI_RESIZE = [
  'FORMAT ADAPTATION ≠ RESIZING — each native format translates identity through its own behavior',
  'Do not crop one composition across feed, Story, carousel, and Reel and call it adaptation',
];

const ANTI_WEBSITE_FIRST_SOCIAL = [
  'Do not default to website hero as primary creative proof for a social-first brand',
  'Do not use arbitrary poster or desktop mockup as the primary direction proof',
  'Do not treat moodboard tile as creative endpoint without social-native specimens',
];

export function resolveFormatProofPriorities(
  context: BrandExpressionContext,
): Record<string, FormatProofPriority> {
  switch (context) {
    case 'SOCIAL_FIRST_EDITORIAL':
      return { ...SOCIAL_PROOF_PRIORITY };
    case 'ECOMMERCE_FIRST':
      return Object.fromEntries(ECOMMERCE_PRIMARY.map((f) => [f, 'HIGH' as FormatProofPriority]));
    case 'SERVICE_BUSINESS':
      return Object.fromEntries(SERVICE_PRIMARY.map((f) => [f, 'HIGH' as FormatProofPriority]));
    case 'PRODUCT_PLATFORM':
      return Object.fromEntries(APP_PRIMARY.map((f) => [f, 'HIGH' as FormatProofPriority]));
    default:
      return { GENERIC_ARTIFACT: 'MEDIUM', WEBSITE_PAGE: 'LOW' };
  }
}

export function deriveFormatNativeExpressionProfile(params: {
  context: BrandExpressionContext;
  profile?: BrandLoreProfile | null;
  personality?: BrandPersonalityProfile | null;
}): FormatNativeExpressionProfile {
  const { context, personality } = params;
  const socialInstinct = personality?.socialInstinct.value ?? [];

  switch (context) {
    case 'SOCIAL_FIRST_EDITORIAL':
      return {
        primaryContext: context,
        primaryFormats: [...SOCIAL_PRIMARY],
        secondaryFormats: ['TYPOGRAPHY_SPECIMEN', 'MATERIAL_SPECIMEN', 'PHYSICAL_ARTIFACT'],
        formatPriorities: resolveFormatProofPriorities(context),
        audienceConsumptionBehavior:
          'Scroll-first discovery; save/share/screenshot value; franchise recognition in feed',
        entryFormat: 'FEED_TILE',
        repeatFormat: 'CONTENT_FRANCHISE',
        conversionOrEngagementBehavior: 'Hook → progressive reveal → save or share',
        motionExpectation: 'Native hook frames; editorial interruption in motion',
        thumbnailBehavior: 'Decisive hierarchy at small scale; one claim readable instantly',
        sequenceBehavior: 'Carousel and Story advance argument — not resize of single frame',
        saveShareBehavior: 'Reference posts worth saving; screenshot-worthy annotations',
        commentInteractionBehavior:
          socialInstinct.includes('debate') || socialInstinct.includes('conversation')
            ? 'Designed reply artifacts where relevant — not blind uppercase on conversation'
            : 'Reply behavior optional; designed artifacts stay uppercase',
        longFormBehavior: 'Carousel / thread progression',
        shortFormBehavior: 'Feed tile + Story + Reel hooks',
        physicalExtensionBehavior: 'Print artifact as supporting proof only',
        antiFormatBehaviors: [...ANTI_WEBSITE_FIRST_SOCIAL],
        proofRequirements: [
          'Prove feed behavior',
          'Prove carousel progression',
          'Prove Story sequence',
          'Prove Reel/TikTok hook behavior',
        ],
        antiResizeRules: [...ANTI_RESIZE],
        websiteFirstDefaultBlocked: true,
      };
    case 'ECOMMERCE_FIRST':
      return {
        primaryContext: context,
        primaryFormats: [...ECOMMERCE_PRIMARY],
        secondaryFormats: ['FEED_TILE', 'CAMPAIGN_SOCIAL'],
        formatPriorities: resolveFormatProofPriorities(context),
        audienceConsumptionBehavior: 'Product discovery and conversion surfaces',
        entryFormat: 'PRODUCT_IMAGE',
        repeatFormat: 'PDP_MODULE',
        conversionOrEngagementBehavior: 'Merchandising clarity → purchase confidence',
        motionExpectation: 'Product-in-context motion; not editorial abstraction',
        thumbnailBehavior: 'Product legibility and offer clarity',
        sequenceBehavior: 'Campaign story across PDP modules',
        saveShareBehavior: 'Wishlist/save product references',
        commentInteractionBehavior: 'UGC and review social proof',
        longFormBehavior: 'Lookbook / campaign narrative',
        shortFormBehavior: 'Product social snippets',
        physicalExtensionBehavior: 'Packaging and unboxing',
        antiFormatBehaviors: ['Do not prove ecommerce brand primarily through editorial poster'],
        proofRequirements: ['Product image', 'PDP module', 'Campaign social'],
        antiResizeRules: [...ANTI_RESIZE],
        websiteFirstDefaultBlocked: false,
      };
    case 'SERVICE_BUSINESS':
      return {
        primaryContext: context,
        primaryFormats: [...SERVICE_PRIMARY],
        secondaryFormats: ['FEED_TILE', 'WEBSITE_PAGE'],
        formatPriorities: resolveFormatProofPriorities(context),
        audienceConsumptionBehavior: 'Trust-building before conversion',
        entryFormat: 'TRUST_SURFACE',
        repeatFormat: 'PROCESS_PROOF',
        conversionOrEngagementBehavior: 'Proof → intake → booking/contact',
        motionExpectation: 'Process clarity over spectacle',
        thumbnailBehavior: 'Human trust signals legible at small scale',
        sequenceBehavior: 'Process steps in carousel or Story',
        saveShareBehavior: 'Save contact/checklist references',
        commentInteractionBehavior: 'Social proof and FAQ replies',
        longFormBehavior: 'Case study progression',
        shortFormBehavior: 'Trust snippets and proof moments',
        physicalExtensionBehavior: 'On-site / fleet / facility proof',
        antiFormatBehaviors: ['Do not default to abstract moodboard without trust surfaces'],
        proofRequirements: ['Trust surface', 'Process', 'Conversion moment'],
        antiResizeRules: [...ANTI_RESIZE],
        websiteFirstDefaultBlocked: false,
      };
    case 'PRODUCT_PLATFORM':
      return {
        primaryContext: context,
        primaryFormats: [...APP_PRIMARY],
        secondaryFormats: ['FEED_TILE', 'WEBSITE_PAGE'],
        formatPriorities: resolveFormatProofPriorities(context),
        audienceConsumptionBehavior: 'In-product repeat use',
        entryFormat: 'ONBOARDING',
        repeatFormat: 'FEATURE_MOMENT',
        conversionOrEngagementBehavior: 'Activation → habit → expansion',
        motionExpectation: 'Product motion and micro-interaction grammar',
        thumbnailBehavior: 'Feature clarity in app store / social',
        sequenceBehavior: 'Onboarding sequence',
        saveShareBehavior: 'Share feature outputs',
        commentInteractionBehavior: 'Support/community replies',
        longFormBehavior: 'Feature walkthrough',
        shortFormBehavior: 'Hook demos',
        physicalExtensionBehavior: 'Device-native only',
        antiFormatBehaviors: ['Do not prove app primarily through generic poster'],
        proofRequirements: ['Interface', 'Onboarding', 'Feature moment'],
        antiResizeRules: [...ANTI_RESIZE],
        websiteFirstDefaultBlocked: false,
      };
    default:
      return {
        primaryContext: context,
        primaryFormats: ['PRIMARY_ARTIFACT'],
        secondaryFormats: ['SUPPORTING_ARTIFACT'],
        formatPriorities: resolveFormatProofPriorities(context),
        audienceConsumptionBehavior: 'Context-dependent',
        entryFormat: 'PRIMARY_ARTIFACT',
        repeatFormat: 'PRIMARY_ARTIFACT',
        conversionOrEngagementBehavior: 'Context-dependent',
        motionExpectation: 'Context-dependent',
        thumbnailBehavior: 'Legible at primary channel scale',
        sequenceBehavior: 'Native to primary channel',
        saveShareBehavior: 'Native to primary channel',
        commentInteractionBehavior: 'Native to primary channel',
        longFormBehavior: 'Native to primary channel',
        shortFormBehavior: 'Native to primary channel',
        physicalExtensionBehavior: 'Optional',
        antiFormatBehaviors: [],
        proofRequirements: ['Primary channel specimen'],
        antiResizeRules: [...ANTI_RESIZE],
        websiteFirstDefaultBlocked: false,
      };
  }
}

export function summarizeFormatNativeExpression(profile: FormatNativeExpressionProfile): string {
  return [
    `primaryContext: ${profile.primaryContext}`,
    `primaryFormats: ${profile.primaryFormats.join(', ')}`,
    `entryFormat: ${profile.entryFormat}`,
    `antiFormatBehaviors: ${profile.antiFormatBehaviors.join('; ')}`,
    `antiResizeRules: ${profile.antiResizeRules[0] ?? ''}`,
    `websiteFirstDefaultBlocked: ${profile.websiteFirstDefaultBlocked}`,
  ].join('\n');
}

export function formatsAreResizeOnlyAliases(formats: string[]): boolean {
  if (formats.length < 2) return false;
  const normalized = formats.map((f) => f.replace(/_(COVER|SEQUENCE|FRAME|HOOK)$/, ''));
  return new Set(normalized).size === 1;
}
