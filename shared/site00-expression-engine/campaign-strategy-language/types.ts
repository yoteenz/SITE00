/**
 * P0.CSI.1 — Campaign Strategy + Expression Language System types.
 * Campaign strategy ≠ visual style. Strategy is narrative/world behavior; expression language is flavor/temperature.
 */

import type { FounderCreativeAppetiteProfile } from '../../site00-brand-lore/founderCreativeAppetite/types.js';

export const P0_CSI_1_BUILD = 'v269' as const;

// ─── Enums / unions ─────────────────────────────────────────────────────────

export type CampaignStrategyType =
  | 'LIVED_IN_ENVIRONMENTAL'
  | 'HERO_PRODUCT_REVEAL'
  | 'CHARACTER_LED'
  | 'OBJECT_AS_CHARACTER'
  | 'PROCESS_ACCESS'
  | 'RECEIPT_PROOF'
  | 'CULTURAL_CALLBACK'
  | 'SOCIAL_OBSERVATION'
  | 'MICRO_NARRATIVE_SERIES'
  | 'ONE_LOCATION_STUDY'
  | 'VISUAL_GAME'
  | 'INTIMATE_DOCUMENTARY'
  | 'HIGH_CONCEPT_EDITORIAL'
  | 'EVERYDAY_LUXURY'
  | 'EVENTIZED_DROP'
  | 'FOUND_OBJECT_DISCOVERY'
  | 'TESTIMONIAL_AS_STORY'
  | 'TRANSFORMATION_ARC'
  | 'WORLD_BUILDING'
  | 'ANTI_CAMPAIGN_DEADPAN';

export type CampaignExpressionLanguage =
  | 'ORGANIC'
  | 'WITTY'
  | 'DEADPAN'
  | 'INTIMATE'
  | 'PLAYFUL'
  | 'POLISHED'
  | 'RAW'
  | 'EDITORIAL'
  | 'CINEMATIC'
  | 'DOCUMENTARY'
  | 'LUXURIOUS'
  | 'FLIRTY'
  | 'CAMP'
  | 'FUTURISTIC'
  | 'NOSTALGIC'
  | 'CHAOTIC'
  | 'CONTROLLED'
  | 'WARM'
  | 'COOL'
  | 'MINIMAL'
  | 'MAXIMAL'
  | 'ASPIRATIONAL'
  | 'RELATABLE'
  | 'INSIDER'
  | 'MYSTERIOUS'
  | 'SENSUAL'
  | 'IRREVERENT'
  | 'SENTIMENTAL'
  | 'OBSERVATIONAL'
  | 'INTELLECTUAL'
  | 'STREET'
  | 'GLAM'
  | 'QUIET'
  | 'LOUD'
  | 'ART_HOUSE'
  | 'POP'
  | 'FOUND_FOOTAGE'
  | 'VLOG_LIKE'
  | 'PAPARAZZI_LIKE'
  | 'STUDIO'
  | 'ENVIRONMENTAL';

export type ProductRoleInCampaign =
  | 'HERO'
  | 'CO_STAR'
  | 'PROP'
  | 'CLUE'
  | 'EASTER_EGG'
  | 'ENVIRONMENTAL_ELEMENT'
  | 'FUNCTIONAL_OBJECT'
  | 'TRANSFORMATION_TRIGGER'
  | 'PAYOFF'
  | 'BACKGROUND_PRESENCE';

export type HumanPresenceRole =
  | 'HERO'
  | 'CO_STAR'
  | 'HOST'
  | 'CHARACTER'
  | 'OBSERVER'
  | 'FOUNDER'
  | 'CUSTOMER'
  | 'HANDS_ONLY'
  | 'BODY_FRAGMENT'
  | 'VOICE_ONLY'
  | 'OFFSCREEN_PRESENCE'
  | 'NO_HUMAN';

export type EnvironmentRole =
  | 'BACKGROUND'
  | 'CO_STAR'
  | 'STORY_ENGINE'
  | 'METAPHOR'
  | 'CONSTRAINT'
  | 'RECURRING_WORLD'
  | 'REAL_LOCATION'
  | 'BUILT_SET'
  | 'FOUND_LOCATION';

export type RevealStrategy =
  | 'IMMEDIATE'
  | 'PROGRESSIVE'
  | 'DELAYED'
  | 'ACCIDENTAL'
  | 'HIDDEN_IN_PLAIN_SIGHT'
  | 'SERIAL'
  | 'REVERSE_REVEAL'
  | 'PARTIAL'
  | 'OBJECT_FIRST'
  | 'PERSON_FIRST'
  | 'ENVIRONMENT_FIRST';

export type CampaignShotRhythmBeat =
  | 'ESTABLISHING'
  | 'DETAIL'
  | 'PRODUCT_CLOSEUP'
  | 'HANDS'
  | 'FACE'
  | 'FULL_BODY'
  | 'ENVIRONMENT'
  | 'OBJECT'
  | 'MOTION'
  | 'REFLECTION'
  | 'BEHIND_THE_SCENES'
  | 'TEXTURE'
  | 'INTERACTION'
  | 'PAYOFF'
  | 'OUTTAKE'
  | 'CALLBACK';

export type CampaignObjective =
  | 'LAUNCH'
  | 'AWARENESS'
  | 'CONVERSION'
  | 'EDUCATION'
  | 'RETENTION'
  | 'COMMUNITY'
  | 'REINTRODUCTION'
  | 'PRODUCT_SPOTLIGHT'
  | 'BRAND_WORLD'
  | 'CULTURAL_MOMENT'
  | 'FOUNDERSHIP'
  | 'UGC'
  | 'SEASONAL'
  | 'EVENT'
  | 'DROP'
  | 'EDITORIAL'
  | 'REPOSITIONING';

export type CampaignChannel =
  | 'INSTAGRAM_FEED'
  | 'CAROUSEL'
  | 'STORY'
  | 'REEL'
  | 'TIKTOK'
  | 'YOUTUBE_SHORT'
  | 'EMAIL'
  | 'LANDING_PAGE'
  | 'OOH'
  | 'PRINT'
  | 'EDITORIAL_CHANNEL'
  | 'UGC'
  | 'PAID_SOCIAL';

export type CampaignCopyBehavior =
  | 'NO_COPY'
  | 'DEADPAN'
  | 'TEASING'
  | 'OBSERVATIONAL'
  | 'EDITORIAL'
  | 'DIRECT'
  | 'INTIMATE'
  | 'PLAYFUL'
  | 'MYSTERIOUS'
  | 'DOCUMENTARY';

export type CampaignRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPERIMENTAL';

export type CampaignRecommendationTier = 'SAFE' | 'FRESH' | 'WILD_CARD';

export type FounderCampaignJudgment = 'LOVE_IT' | 'PROMISING' | 'TOO_CLOSE' | 'NOT_BRAND';

export type DerivativeStatus =
  | 'PROPOSED'
  | 'STRUCTURE_CONFIRMED'
  | 'DESIGN_PENDING'
  | 'DESIGN_READY'
  | 'APPROVED'
  | 'BUILDING'
  | 'BUILT'
  | 'WIRED'
  | 'CAPTURE_PENDING'
  | 'CURRENT'
  | 'NEEDS_REVIEW'
  | 'BROKEN'
  | 'EXEMPT';

export type WiringStatus =
  | 'WIRED'
  | 'UNWIRED'
  | 'MISWIRED'
  | 'AMBIGUOUS'
  | 'PERMISSION_GATED'
  | 'EXEMPT';

export type ScaleLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VARIABLE';

// ─── Core profiles ──────────────────────────────────────────────────────────

export type CampaignFlavorProfile = {
  strategyTypes: CampaignStrategyType[];
  expressionLanguages: CampaignExpressionLanguage[];
  energyLevel: ScaleLevel;
  polishLevel: ScaleLevel | 'POLISHED_BUT_NOT_STERILE';
  productProminence: ScaleLevel | 'MEDIUM_VARIABLE';
  personalityProminence: ScaleLevel;
  environmentProminence: ScaleLevel;
  narrativeDensity: ScaleLevel;
  copyDensity: ScaleLevel;
  humorLevel: ScaleLevel;
  abstractionLevel: ScaleLevel;
  intimacyLevel: ScaleLevel;
  surpriseLevel: ScaleLevel;
  culturalSpecificity: ScaleLevel;
  visualRisk: CampaignRiskLevel;
  pace: ScaleLevel;
  revealStyle: RevealStrategy;
};

export type CampaignStrategyDefinition = {
  strategyType: CampaignStrategyType;
  name: string;
  description: string;
  traits: string[];
  defaultProfile: CampaignFlavorProfile;
  defaultProductRole: ProductRoleInCampaign;
  defaultHumanRole: HumanPresenceRole;
  defaultEnvironmentRole: EnvironmentRole;
  defaultRevealStrategy: RevealStrategy;
  defaultShotRhythm: CampaignShotRhythmBeat[];
  defaultSequenceGrammar: CampaignSequenceStep[];
  defaultCopyBehavior: CampaignCopyBehavior;
  compatibleExpressionLanguages: CampaignExpressionLanguage[];
  /** Visual style is separate — examples only, not the strategy itself */
  exampleVisualStyles: string[];
};

export type CampaignSequenceStep = {
  order: number;
  beat: string;
  shotRhythm?: CampaignShotRhythmBeat;
};

export type CampaignSequenceGrammar = {
  strategyType: CampaignStrategyType;
  steps: CampaignSequenceStep[];
};

export type CampaignStrategyStack = {
  primaryStrategy: CampaignStrategyType;
  secondaryStrategies: CampaignStrategyType[];
  expressionLanguages: CampaignExpressionLanguage[];
  conflicts: StrategyConflict[];
  synergies: string[];
  risk: CampaignRiskLevel;
  recommendedUse: string;
};

export type StrategyConflict = {
  kind: 'EXPRESSION_CONFLICT' | 'INTENSITY_CONFLICT' | 'REVEAL_CONFLICT';
  message: string;
  strategies: CampaignStrategyType[];
};

export type BrandCampaignRange = {
  brandSlug: string;
  displayName: string;
  safeRange: CampaignStrategyType[];
  stretchRange: CampaignStrategyType[];
  experimentalRange: CampaignStrategyType[];
  offBrandRange: CampaignStrategyType[];
  preferredExpressionLanguages: CampaignExpressionLanguage[];
};

export type CampaignBrandCompatibilityInput = {
  brandSlug: string;
  objective: CampaignObjective;
  channel?: CampaignChannel;
  appetite?: FounderCreativeAppetiteProfile | null;
  recentHistory?: CampaignExpressionHistoryEntry[];
  pricePoint?: 'LUXURY' | 'PREMIUM' | 'MASS' | 'UNKNOWN';
};

export type CampaignBrandCompatibilityResult = {
  recommendedStrategies: CampaignStrategyType[];
  recommendedExpressionLanguages: CampaignExpressionLanguage[];
  avoidances: string[];
  riskLevel: CampaignRiskLevel;
  brandFitScore: number;
};

export type CampaignNoveltyScore = {
  strategyNovelty: number;
  settingNovelty: number;
  sequenceNovelty: number;
  visualNovelty: number;
  copyNovelty: number;
  productRoleNovelty: number;
  overall: number;
};

export type CampaignFlavorRecommendation = {
  tier: CampaignRecommendationTier;
  strategyType: CampaignStrategyType;
  name: string;
  oneLineDescription: string;
  whyItFits: string;
  flavorTags: CampaignExpressionLanguage[];
  novelty: CampaignNoveltyScore;
  risk: CampaignRiskLevel;
  brandFitScore: number;
  stack: CampaignStrategyStack;
  profile: CampaignFlavorProfile;
  productRole: ProductRoleInCampaign;
  humanRole: HumanPresenceRole;
  environmentRole: EnvironmentRole;
};

export type CampaignFlavorRecommendationResult = {
  brandSlug: string;
  objective: CampaignObjective;
  recommendations: CampaignFlavorRecommendation[];
  safe: CampaignFlavorRecommendation | null;
  fresh: CampaignFlavorRecommendation | null;
  wildCard: CampaignFlavorRecommendation | null;
  rotationNote: string;
  varietyWarnings: string[];
  /** P0.CBI.1 */
  generationBlocked?: boolean;
  generationBlockMessage?: string | null;
  brandContextVersion?: number | null;
};

export type CampaignExpressionBrief = {
  briefId: string;
  brandSlug: string;
  objective: CampaignObjective;
  stack: CampaignStrategyStack;
  profile: CampaignFlavorProfile;
  productRole: ProductRoleInCampaign;
  humanRole: HumanPresenceRole;
  environmentRole: EnvironmentRole;
  revealStrategy: RevealStrategy;
  shotRhythm: CampaignShotRhythmBeat[];
  sequence: CampaignSequenceStep[];
  copyBehavior: CampaignCopyBehavior;
  channelAdaptations: CampaignChannelPlan[];
  doList: string[];
  doNotList: string[];
  recurringMotifs: RecurringCampaignMotif[];
  createdAt: string;
};

export type CampaignChannelPlan = {
  channel: CampaignChannel;
  role: string;
  adaptation: string;
};

export type RecurringCampaignMotif = {
  motifId: string;
  label: string;
  variationRule: string;
};

export type CampaignSettingStrategy = {
  locationType: string;
  storyPotential: ScaleLevel;
  productIntegrationOpportunities: string[];
  humanInteractionOpportunities: string[];
  visualVariety: ScaleLevel;
  productionEfficiency: ScaleLevel;
  brandFit: number;
};

export type CampaignFamily = {
  familyId: string;
  brandSlug: string;
  campaignName: string;
  strategyStack: CampaignStrategyStack;
  motifIds: string[];
  settingStrategy: CampaignSettingStrategy | null;
  postCount: number;
  consistencyChecks: CampaignFamilyConsistencyCheck[];
};

export type CampaignFamilyConsistencyCheck = {
  dimension: 'MOTIF' | 'SETTING' | 'CASTING' | 'PRODUCT' | 'EXPRESSION' | 'SEQUENCE';
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
};

export type OrganicCampaignGuardIssue = {
  code: string;
  message: string;
  severity: 'WARN' | 'FAIL';
};

export type OrganicCampaignScore = {
  livedInFeeling: number;
  environmentIntegration: number;
  shotDiversity: number;
  humanSpecificity: number;
  productSubtlety: number;
  sequenceNaturalness: number;
  overall: number;
};

export type CampaignExpressionHistoryEntry = {
  historyId: string;
  brandSlug: string;
  campaignId: string;
  strategyTypes: CampaignStrategyType[];
  expressionLanguages: CampaignExpressionLanguage[];
  settingSummary: string;
  productRole: ProductRoleInCampaign;
  humanRole: HumanPresenceRole;
  revealStyle: RevealStrategy;
  founderJudgment: FounderCampaignJudgment | null;
  performedAt: string;
};

export type FounderPreferenceAffinity = {
  brandSlug: string;
  strategyAffinities: Partial<Record<CampaignStrategyType, number>>;
  languageAffinities: Partial<Record<CampaignExpressionLanguage, number>>;
  updatedAt: string;
};

export type ConceptTerritorySeedHint = {
  territoryName: string;
  centralConcept: string;
  worldPremise: string;
  contentBehavior: string;
  primaryVisualMechanism: string;
  strategySource: CampaignStrategyType;
};

export type CampaignStrategyLanguageSystemInput = {
  brandSlug: string;
  objective: CampaignObjective;
  channel?: CampaignChannel;
  appetite?: FounderCreativeAppetiteProfile | null;
  clientMode?: boolean;
  /** Override history; defaults to store */
  history?: CampaignExpressionHistoryEntry[];
  /** P0.CBI.1 — brand creative context envelope */
  brandContext?: import('../../site00-brand-lore/brandCreativeContext/types.js').BrandCreativeContext | null;
  selectedOfferIds?: string[];
  /** Skip generation gate (tests only) */
  skipGenerationGate?: boolean;
};

export type CampaignGenerationGateResult = {
  allowed: boolean;
  message: string | null;
  readiness: import('../../site00-brand-lore/brandCreativeContext/types.js').BrandCreativeContextReadiness | null;
};

export type AntiCloningQAResult = {
  issues: string[];
  pass: boolean;
};

export type CreativeVariationPolicy = {
  brandSlug: string;
  allowedSafe: CampaignStrategyType[];
  allowedStretch: CampaignStrategyType[];
  allowedExperimental: CampaignStrategyType[];
  avoidRecentStrategies: CampaignStrategyType[];
  deviationBudget: 'LOW' | 'MEDIUM' | 'HIGH';
};
