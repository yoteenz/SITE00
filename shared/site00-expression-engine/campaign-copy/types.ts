/**
 * C1.7 — Campaign copy director types.
 */

export const COPY_ROLES = [
  'EXTEND_VISUAL',
  'CONTRADICT_VISUAL',
  'ADD_CONTEXT',
  'ADD_RECEIPT',
  'ADD_HUMANITY',
  'PROVOKE',
  'INVITE_RESPONSE',
  'CONVERT',
  'LAND_THE_JOKE',
  'CREATE_AFTERSHOCK',
  'HAND_OFF_TO_NEXT_UNIT',
  'ADD_PROOF',
  'WITHHOLD',
  'CLARIFY',
  'CONFESS',
  'CHALLENGE',
  'NO_CAPTION',
  'MINIMAL_CAPTION',
] as const;
export type CopyRole = (typeof COPY_ROLES)[number];

export const COPY_VISUAL_RELATIONSHIPS = [
  'COMPLEMENT',
  'COUNTERPOINT',
  'CALLBACK',
  'ESCALATION',
  'PAYOFF',
  'MISDIRECTION',
  'CONTEXT',
  'SILENCE',
  'QUESTION',
  'CONTRADICTION',
  'AFTERSHOCK',
  'WITHHOLD',
] as const;
export type CopyVisualRelationship = (typeof COPY_VISUAL_RELATIONSHIPS)[number];

export const COPY_LEAD_MODES = [
  'COPY_LEADS_VISUAL',
  'VISUAL_LEADS_COPY',
  'INTERDEPENDENT',
  'COPY_AS_PAYOFF',
  'COPY_AS_AFTERSHOCK',
] as const;
export type CopyLeadMode = (typeof COPY_LEAD_MODES)[number];

export const COPY_CREATIVE_QUALITY_TIERS = ['VALID', 'STRONG', 'EXCEPTIONAL'] as const;
export type CopyCreativeQualityTier = (typeof COPY_CREATIVE_QUALITY_TIERS)[number];

export const COPY_FOUNDER_HANDHOLDING_RISK_LEVELS = ['LOW', 'MODERATE', 'HIGH'] as const;
export type CopyFounderHandholdingRisk = (typeof COPY_FOUNDER_HANDHOLDING_RISK_LEVELS)[number];

export const CTA_CLASSES = [
  'NONE',
  'REFLECT',
  'COMMENT',
  'SHARE',
  'SAVE',
  'DM',
  'CLICK',
  'SHOP',
  'SIGN_UP',
  'WATCH_NEXT',
  'READ_MORE',
  'JOIN',
  'VOTE',
  'SWIPE',
  'REPLY',
  'FOLLOW_SEQUENCE',
] as const;
export type CtaClass = (typeof CTA_CLASSES)[number];

export const HASHTAG_STRATEGIES = [
  'NONE',
  'MINIMAL_BRANDED',
  'SEARCH_DISCOVERY',
  'CAMPAIGN_TAG',
  'COMMUNITY_TAG',
  'PLATFORM_NATIVE',
] as const;
export type HashtagStrategy = (typeof HASHTAG_STRATEGIES)[number];

export const COPY_FAILURE_CLASSES = [
  'CAPTION_ONLY_DESCRIBES_ASSET',
  'COPY_REPEATS_VISUAL',
  'COPY_EXPLAINS_JOKE',
  'CTA_REPEATS_CAPTION',
  'ON_ASSET_AND_CAPTION_DUPLICATE',
  'PLATFORM_COPY_CLONED',
  'OVEREXPLAINED_CONCEPT',
  'COPY_TOO_GENERIC',
  'COPY_TOO_LONG',
  'COPY_TOO_SHORT',
  'COPY_NOT_PLATFORM_NATIVE',
  'COPY_NOT_BRAND_NATIVE',
  'COPY_TOO_SALESY',
  'COPY_TOO_SAFE',
  'COPY_TRIES_TOO_HARD',
  'CTA_UNEARNED',
  'CTA_TOO_GENERIC',
  'CTA_TOO_EARLY',
  'EVERY_POST_SELLS',
  'NO_CONVERSION_PATH',
  'CTA_BREAKS_TONE',
  'VOICE_DRIFT',
  'HASHTAG_SPAM',
  'NO_COPY_HANDOFF',
  'COPY_CLONED_ACROSS_FORMATS',
  'NDXBOOK_VOICE_LEAK',
  'COPY_COULD_BELONG_TO_ANY_BRAND',
  'COPY_SOUNDS_LIKE_OTHER_BRAND',
  'CROSS_BRAND_VOICE_CONTAMINATION',
  'BRAND_VOICE_COLLAPSE',
  'AI_RHETORICAL_PATTERN_OVERUSE',
  'GENERIC_LUXURY_COPY',
  'OVEREXPLAINED_COOL_BRAND',
] as const;
export type CopyFailureClass = (typeof COPY_FAILURE_CLASSES)[number];

export const COPY_CORRECTION_TAXONOMY = [
  'COPY_TOO_GENERIC',
  'COPY_REPEATS_VISUAL',
  'COPY_EXPLAINS_JOKE',
  'COPY_TOO_LONG',
  'COPY_TOO_SHORT',
  'COPY_NOT_PLATFORM_NATIVE',
  'COPY_NOT_BRAND_NATIVE',
  'COPY_TOO_SALESY',
  'COPY_TOO_SAFE',
  'COPY_TRIES_TOO_HARD',
  'CTA_UNEARNED',
  'CTA_TOO_GENERIC',
  'VOICE_DRIFT',
  'HASHTAG_SPAM',
  'NO_COPY_HANDOFF',
  'COPY_CLONED_ACROSS_FORMATS',
] as const;
export type CopyCorrectionTaxonomy = (typeof COPY_CORRECTION_TAXONOMY)[number];

export const COPY_STATUSES = ['DRAFT', 'AWAITING_FOUNDER_REVIEW', 'APPROVED', 'ARCHIVED'] as const;
export type CopyStatus = (typeof COPY_STATUSES)[number];

export type CampaignVoiceProfile = {
  brandVoice: string;
  campaignVoice: string;
  emotionalTemperature: string;
  sentenceRhythm: string;
  sentenceLength: string;
  vocabularyLevel: string;
  witLevel: string;
  directness: string;
  provocationLevel: string;
  warmth: string;
  authority: string;
  playfulness: string;
  restraint: string;
  punctuationBehavior: string;
  emojiBehavior: string;
  slangBehavior: string;
  capitalizationBehavior: string;
  forbiddenLanguage: string[];
  preferredRhetoricalDevices: string[];
};

export type CampaignCopyVersion = {
  versionLabel: string;
  copyText: Record<string, string>;
  rhetoricalStrategy: string;
  cta: CtaClass;
  status: CopyStatus;
  founderJudgment?: string;
  source: string;
  createdAt: string;
};

export type CampaignCopyPackage = {
  contentUnitId: string;
  medium: string;
  campaignRole: string;
  copyRole: CopyRole;
  onAssetCopy: string | null;
  caption: string | null;
  hook: string | null;
  headline: string | null;
  subhead: string | null;
  bodyCopy: string | null;
  cta: CtaClass;
  ctaCopy: string | null;
  commentStrategy: string | null;
  pinnedCommentStrategy: string | null;
  hashtagStrategy: HashtagStrategy;
  hashtags: string[];
  platformMetadata: Record<string, string>;
  altCopy: string | null;
  copyNotes: string;
  voiceProfile: CampaignVoiceProfile;
  copyVersion: string;
  copyStatus: CopyStatus;
  copyDirectionId: string;
  activeCopyVersionId: string;
  lineage: {
    campaignBriefId: string;
    campaignDirection: string;
    contentUnitId: string;
  };
};

export type CopyTerritory = {
  territoryId: string;
  rhetoricalBehavior: string;
  sampleLine: string;
  score: number;
};

export type CopyFirstAnswerChallenge = {
  attackVectors: Array<{ vector: string; diagnosis: string }>;
  resolution: 'KEEP' | 'DEEPEN' | 'HYBRIDIZE' | 'SUPERSEDE';
};

export type CopyChallenger = {
  challengerId: string;
  conceptName: string;
  caption: string;
  rhetoricalBehavior: string;
};

export type CopyMediumNecessityAssessment = {
  medium: string;
  whyCopyBelongsHere: string;
  lengthGuidance: string;
  platformNativeBehavior: string;
};

export type UnitCopyDirection = {
  unitId: string;
  medium: string;
  campaignRole: string;
  copyPackage: CampaignCopyPackage;
  territories: CopyTerritory[];
  winningTerritory: CopyTerritory;
  primaryCaption: string;
  altCaptionA: string;
  altCaptionB: string;
  visualRelationship: CopyVisualRelationship;
  copyLeadMode: CopyLeadMode;
  mediumNecessity: CopyMediumNecessityAssessment;
  firstAnswerChallenge: CopyFirstAnswerChallenge;
  redTeamCriticism: string;
  challenger: CopyChallenger;
  finalCaption: string;
  qualityTier: CopyCreativeQualityTier;
  founderHandholdingRisk: CopyFounderHandholdingRisk;
  failureClasses: CopyFailureClass[];
  evidenceRequired: boolean;
  versions: CampaignCopyVersion[];
  copyHandoff: {
    handoffType: string;
    handoffCopy: string;
    handoffQuestion: string;
  } | null;
};

export type CampaignPhraseLineage = {
  heroLines: string[];
  callbacks: string[];
  interjections: string[];
  campaignTaglines: string[];
  unitHeadlines: string[];
  retiredLines: string[];
  overusedPhrases: string[];
};

export type CampaignCopySequence = {
  unitOrder: string[];
  languageIntroduced: Record<string, string>;
  phrasesRepeatedIntentionally: string[];
  phrasesRetired: string[];
  openQuestions: string[];
  ctaUsedByUnit: Record<string, CtaClass>;
  rhetoricalBehaviorByUnit: Record<string, string>;
};

export type CampaignCopyCohesionQA = {
  voiceConsistency: boolean;
  mediumNativeBehavior: boolean;
  visualComplementarity: boolean;
  captionRoleClarity: boolean;
  rhetoricalVariation: boolean;
  ctaProgression: boolean;
  campaignSequence: boolean;
  brandSpecificity: boolean;
  repetitionRisk: boolean;
  conversionLogic: boolean;
  handoffStrength: boolean;
  passed: boolean;
  failureClasses: CopyFailureClass[];
};

export type CampaignCopyPackageOutput = {
  copyPackageId: string;
  campaignId: string;
  voiceProfile: CampaignVoiceProfile;
  brandLanguageIdentity?: import('../brand-language/types.js').BrandLanguageIdentity;
  copyRuntimeMode?: import('../brand-language/types.js').CopyRuntimeMode;
  unitCopyDirections: UnitCopyDirection[];
  copySequence: CampaignCopySequence;
  phraseLineage: CampaignPhraseLineage;
  cohesionQA: CampaignCopyCohesionQA;
  packageCopyQualityTier: CopyCreativeQualityTier;
  packageCopyHandholdingRisk: CopyFounderHandholdingRisk;
  productionGatePassed: boolean;
  textReasoningDispatchCount: number;
  copyReasoningDispatchCount?: number;
  provider?: string;
  model?: string;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  falDispatchCount: 0;
};
