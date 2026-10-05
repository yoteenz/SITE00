/**
 * C1.8 — Brand language identity (broader than CampaignVoiceProfile).
 */

export const BRAND_VOICE_CONFIDENCE_LEVELS = ['HIGH', 'MODERATE', 'LOW'] as const;
export type BrandVoiceConfidence = (typeof BRAND_VOICE_CONFIDENCE_LEVELS)[number];

export const BRAND_LANGUAGE_EVIDENCE_SOURCES = [
  'APPROVED_COPY',
  'WEBSITE_COPY',
  'SOCIAL_COPY',
  'FOUNDER_DIRECTION',
  'BRAND_PERSONALITY',
  'CAMPAIGN_CANON',
  'TAGLINES',
  'PRODUCT_LANGUAGE',
  'EMAIL_LANGUAGE',
  'CUSTOMER_LANGUAGE',
] as const;
export type BrandLanguageEvidenceSource = (typeof BRAND_LANGUAGE_EVIDENCE_SOURCES)[number];

export const SALES_INTENSITY_LEVELS = ['NONE', 'SOFT', 'MODERATE', 'DIRECT', 'AGGRESSIVE'] as const;
export type SalesIntensity = (typeof SALES_INTENSITY_LEVELS)[number];

export const COPY_RUNTIME_MODES = ['FULL_REASONING', 'HYBRID', 'DETERMINISTIC_FALLBACK'] as const;
export type CopyRuntimeMode = (typeof COPY_RUNTIME_MODES)[number];

export const COPY_APPROVAL_STATES = [
  'UNREVIEWED',
  'AWAITING_REVIEW',
  'APPROVED',
  'REVISION_REQUESTED',
  'FOUNDER_EDITED',
  'REJECTED',
] as const;
export type CopyApprovalState = (typeof COPY_APPROVAL_STATES)[number];

export const BRAND_LANGUAGE_FAILURE_CLASSES = [
  'NDXBOOK_VOICE_LEAK',
  'COPY_COULD_BELONG_TO_ANY_BRAND',
  'COPY_SOUNDS_LIKE_OTHER_BRAND',
  'CROSS_BRAND_VOICE_CONTAMINATION',
  'BRAND_VOICE_COLLAPSE',
  'AI_RHETORICAL_PATTERN_OVERUSE',
  'GENERIC_LUXURY_COPY',
  'OVEREXPLAINED_COOL_BRAND',
] as const;
export type BrandLanguageFailureClass = (typeof BRAND_LANGUAGE_FAILURE_CLASSES)[number];

export type BrandLanguageEvidence = {
  sourceType: BrandLanguageEvidenceSource;
  sourceId: string;
  textSample: string;
  approved: boolean;
  weight: number;
  recency: string;
  campaignScope: boolean;
  brandScope: boolean;
};

export type BrandLanguageIdentity = {
  brandId: string;
  brandName: string;
  brandArchetype: string;
  brandPersonalitySummary: string;
  emotionalTemperature: string;
  socialPosture: string;
  statusPosture: string;
  humorStyle: string;
  witStyle: string;
  romanceLevel: string;
  sensualityLevel: string;
  luxuryLevel: string;
  mysteryLevel: string;
  playfulness: string;
  warmth: string;
  distance: string;
  authority: string;
  rebellion: string;
  directness: string;
  provocation: string;
  optimism: string;
  earnestness: string;
  irony: string;
  restraint: string;
  languageDensity: string;
  sentenceRhythm: string;
  sentenceLength: string;
  vocabularyRegister: string;
  slangBehavior: string;
  emojiBehavior: string;
  punctuationBehavior: string;
  capitalizationBehavior: string;
  rhetoricalPreferences: string[];
  rhetoricalAvoidances: string[];
  ctaBehavior: string;
  sellingPosture: string;
  communityPosture: string;
  conversationPosture: string;
  signatureLanguage: string[];
  forbiddenLanguage: string[];
  brandSpecificPhrases: string[];
  antiBrandPhrases: string[];
  examplesOfInVoiceLanguage: string[];
  examplesOfOutOfVoiceLanguage: string[];
  confidence: BrandVoiceConfidence;
  sourceLineage: BrandLanguageEvidence[];
  salesIntensity: SalesIntensity;
  humorProfile: BrandHumorProfile;
  restraintProfile: BrandRestraintProfile;
  rhetoricalSignature: BrandRhetoricalSignature;
  personalityDimensions: CopyPersonalityDimensions;
};

export type BrandHumorProfile = {
  dry: number;
  deadpan: number;
  chaotic: number;
  camp: number;
  absurd: number;
  witty: number;
  sarcastic: number;
  selfAware: number;
  playful: number;
  none: number;
  dominantStyle: string;
};

export type BrandRestraintProfile = {
  allowsSilence: boolean;
  allowsFragments: boolean;
  allowsWithheldExplanation: boolean;
  minimalCtaPreferred: boolean;
  oneLineCopyPreferred: boolean;
  noEmojiPreferred: boolean;
};

export type BrandRhetoricalSignature = {
  mostlyFragments: boolean;
  rareQuestions: boolean;
  highMetaphor: boolean;
  dryUnderstatement: boolean;
  lushSensory: boolean;
  fastPunchlines: boolean;
  directImperatives: boolean;
  softConversational: boolean;
  description: string;
};

export type CopyPersonalityDimensions = {
  mystery: number;
  coolness: number;
  luxury: number;
  warmth: number;
  wit: number;
  humor: number;
  sensuality: number;
  authority: number;
  earnestness: number;
  rebellion: number;
  playfulness: number;
  distance: number;
  directness: number;
  provocation: number;
  salesIntensity: number;
  communityEnergy: number;
  emotionality: number;
};

export type BrandLanguageTerritory = {
  territoryName: string;
  voiceThesis: string;
  tone: string;
  sentenceBehavior: string;
  witBehavior: string;
  sellingBehavior: string;
  ctaBehavior: string;
  platformBehavior: string;
  exampleCaption: string;
  exampleHeadline: string;
  exampleCTA: string;
  whyItFitsBrand: string;
  risk: string;
  differenceFromOtherTerritories: string;
};

export type BrandSpecificityMarkers = {
  wordChoice: string[];
  rhythm: string;
  humorBehavior: string;
  luxuryPosture: string;
  emotionalRestraint: string;
  ctaPosture: string;
  signaturePhrasing: string[];
  audienceRelationship: string;
};

export type CopyTriangulationAssessment = {
  brandFit: boolean;
  postFit: boolean;
  platformFit: boolean;
  passed: boolean;
  notes: string;
};

export type CrossBrandVoiceDistance = {
  brandA: string;
  brandB: string;
  similarityScore: number;
  tooSimilar: boolean;
};

export type RhetoricalPatternLineage = {
  patterns: string[];
  overusedPatterns: string[];
  brandScoped: Record<string, string[]>;
};

export type CreativeBrainContext = {
  brandTruth: string;
  brandLanguageIdentity: BrandLanguageIdentity;
  campaignBrief: Record<string, unknown>;
  campaignCreativeDNA: { coreTension: string };
  campaignNarrative: string;
  unitRole: string;
  visualDirection: string;
  platform: string;
  audienceState: string;
  approvedPriorUnits: string[];
  relevantCorrections: string[];
  founderCreativeAppetite: string;
  postRole: string;
  onAssetCopy: string | null;
  visualMechanism: string;
  visualWithholds: string;
};

export type CopyPersonaLens =
  | 'BRAND_STRATEGIST'
  | 'EXECUTIVE_COPY_DIRECTOR'
  | 'SOCIAL_COPYWRITER'
  | 'LUXURY_COPYWRITER'
  | 'DIRECT_RESPONSE_COPYWRITER'
  | 'COMEDIC_COPYWRITER'
  | 'EDITORIAL_COPYWRITER'
  | 'PLATFORM_EDITOR'
  | 'RED_TEAM_COPY_CHIEF';

export type LuxuryLanguageAssessment = {
  precision: boolean;
  restraint: boolean;
  sensoryLanguage: boolean;
  statusPosture: boolean;
  confidence: boolean;
  noDesperation: boolean;
  rhythm: boolean;
  specificity: boolean;
  desire: boolean;
  craft: boolean;
  genericClichesDetected: boolean;
  passed: boolean;
};
