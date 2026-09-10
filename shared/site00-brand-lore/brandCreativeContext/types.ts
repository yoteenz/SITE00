/**
 * P0.CBI.1 — Brand Creative Context + Campaign Intelligence Ingestion types.
 * NO BRAND CONTEXT = NO BRAND-SPECIFIC CAMPAIGN GENERATION.
 */

import type { FounderCreativeAppetiteProfile } from '../founderCreativeAppetite/types.js';

export const P0_CBI_1_BUILD = 'v274' as const;

export type ContextConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type BrandContextSourceType =
  | 'PROJECT_IDENTITY'
  | 'PROJECT_BIBLE'
  | 'PARENT_EXPERIENCE'
  | 'PRODUCT_SERVICE'
  | 'APPROVED_CREATIVE'
  | 'CAMPAIGN_HISTORY'
  | 'FOUNDER_JUDGMENT'
  | 'APPROVED_REFERENCE'
  | 'PROJECT_LORE'
  | 'CAMPAIGN_INPUT'
  | 'CONTENT_BRAIN'
  | 'FOUNDER_OVERRIDE'
  | 'BRAND_FAMILY'
  | 'PROJECT_REGISTRY';

export type BrandContextSourceRef = {
  sourceType: BrandContextSourceType;
  sourceId: string;
  sourceVersion: string | null;
  authorityLevel: number;
  fieldsContributed: string[];
  updatedAt: string;
};

export type ContextFieldValue<T = string> = {
  value: T;
  confidence: ContextConfidence;
  sourceRefs: BrandContextSourceRef[];
  isUnknown?: boolean;
};

export type BrandPersonalityDimensions = {
  warmth?: ContextFieldValue<number | null>;
  wit?: ContextFieldValue<number | null>;
  luxury?: ContextFieldValue<number | null>;
  edge?: ContextFieldValue<number | null>;
  directness?: ContextFieldValue<number | null>;
  playfulness?: ContextFieldValue<number | null>;
  intellectualism?: ContextFieldValue<number | null>;
  sensuality?: ContextFieldValue<number | null>;
  futurism?: ContextFieldValue<number | null>;
  nostalgia?: ContextFieldValue<number | null>;
  rawness?: ContextFieldValue<number | null>;
  polish?: ContextFieldValue<number | null>;
  irreverence?: ContextFieldValue<number | null>;
  specificity?: ContextFieldValue<number | null>;
};

export type BrandVisualIdentity = {
  palette: ContextFieldValue<string[]>;
  typography: ContextFieldValue<string | null>;
  logoBehavior: ContextFieldValue<string | null>;
  materials: ContextFieldValue<string[]>;
  lighting: ContextFieldValue<string | null>;
  photography: ContextFieldValue<string | null>;
  imageTreatment: ContextFieldValue<string | null>;
  graphicLanguage: ContextFieldValue<string | null>;
  environmentLanguage: ContextFieldValue<string | null>;
  recurringSignatures: ContextFieldValue<string[]>;
};

export type BrandToneVoice = {
  formality: ContextFieldValue<'FORMAL' | 'CASUAL' | 'MIXED' | 'UNKNOWN'>;
  copyDensity: ContextFieldValue<'MINIMAL' | 'MODERATE' | 'DENSE' | 'UNKNOWN'>;
  humor: ContextFieldValue<string | null>;
  wit: ContextFieldValue<string | null>;
  sentenceStyle: ContextFieldValue<string | null>;
  captionBehavior: ContextFieldValue<string | null>;
  tabooLanguage: ContextFieldValue<string[]>;
  preferredPatterns: ContextFieldValue<string[]>;
};

export type BrandAudienceContext = {
  primary: ContextFieldValue<string | null>;
  secondary: ContextFieldValue<string | null>;
  ageRange: ContextFieldValue<string | null>;
  culturalContext: ContextFieldValue<string | null>;
  mindset: ContextFieldValue<string | null>;
  aspirations: ContextFieldValue<string[]>;
  painPoints: ContextFieldValue<string[]>;
  buyingBehavior: ContextFieldValue<string | null>;
};

export type BrandWorldBuilding = {
  locations: ContextFieldValue<string[]>;
  districts: ContextFieldValue<string[]>;
  rooms: ContextFieldValue<string[]>;
  recurringEnvironments: ContextFieldValue<string[]>;
  characters: ContextFieldValue<string[]>;
  rituals: ContextFieldValue<string[]>;
  objects: ContextFieldValue<string[]>;
  lore: ContextFieldValue<string | null>;
  spatialMetaphors: ContextFieldValue<string[]>;
};

export type FounderBrandIntent = {
  desiredBecoming: ContextFieldValue<string | null>;
  desiredAvoidance: ContextFieldValue<string[]>;
  repeatedlyApproves: ContextFieldValue<string[]>;
  repeatedlyRejects: ContextFieldValue<string[]>;
  creativeAmbition: ContextFieldValue<string | null>;
  riskAppetite: ContextFieldValue<string | null>;
  culturalPositioning: ContextFieldValue<string | null>;
};

export type BrandOfferContext = {
  offerId: string;
  name: string;
  type: 'PRODUCT' | 'SERVICE' | 'OFFER' | 'EXPERIENCE' | 'MEMBERSHIP';
  status: 'ACTIVE' | 'LAUNCH' | 'DEFERRED' | 'DISCONTINUED';
  priority: 'HERO' | 'STANDARD' | 'LOW';
  priceTier: ContextFieldValue<string | null>;
  campaignEligible: boolean;
  constraints: string[];
};

export type BrandCampaignHistoryEntry = {
  campaignId: string;
  name: string;
  strategyUsed: string[];
  worldUsed: string | null;
  motifsUsed: string[];
  channelsUsed: string[];
  founderJudgment: string | null;
  conceptualYield: number | null;
  executionFidelity: number | null;
  performedAt: string;
};

export type BrandCampaignHistorySummary = {
  recentCampaigns: BrandCampaignHistoryEntry[];
  lastUsedStrategies: string[];
  lastUsedWorlds: string[];
  lastUsedMotifs: string[];
  affinitySignals: string[];
};

export type ApprovedCreativeReference = {
  referenceId: string;
  referenceType: string;
  whatFounderLiked: string[];
  transfer: string[];
  doNotTransfer: string[];
  brandApplicability: string;
};

export type BrandCreativeBoundary = {
  rule: string;
  scope: 'CAMPAIGN' | 'VISUAL' | 'COPY' | 'PRODUCT' | 'WORLD' | 'GLOBAL';
  severity: 'BLOCK' | 'WARN' | 'ADVISORY';
  reason: string;
  source: string;
};

export type BrandCreativeContextReadinessDimension =
  | 'identity'
  | 'audience'
  | 'offer'
  | 'visual'
  | 'voice'
  | 'experience'
  | 'creativeHistory'
  | 'founderIntent';

export type BrandCreativeContextReadinessStatus =
  | 'READY'
  | 'PARTIAL'
  | 'MISSING_CRITICAL'
  | 'CONFLICTED';

export type BrandCreativeContextReadiness = {
  overall: BrandCreativeContextReadinessStatus;
  dimensions: Record<
    BrandCreativeContextReadinessDimension,
    { status: BrandCreativeContextReadinessStatus; missing: string[] }
  >;
  canProceedWithLimitedContext: boolean;
  blockingReasons: string[];
  missingCritical: string[];
};

export type BrandContextConflict = {
  field: string;
  canonicalValue: string;
  conflictingValue: string;
  canonicalSource: BrandContextSourceType;
  conflictingSource: BrandContextSourceType;
  resolution: 'CANONICAL_WINS' | 'NEEDS_REVIEW';
  surfaced: boolean;
};

export type BrandCreativeContextVersion = {
  version: number;
  assembledAt: string;
  changeReason: string | null;
  priorVersion: number | null;
};

export type BrandContextDiffEntry = {
  field: string;
  changeType: 'ADDED' | 'CHANGED' | 'REMOVED' | 'CONFLICTED';
  before: unknown;
  after: unknown;
};

export type BrandContextDiff = {
  fromVersion: number;
  toVersion: number;
  added: BrandContextDiffEntry[];
  changed: BrandContextDiffEntry[];
  removed: BrandContextDiffEntry[];
  conflicted: BrandContextDiffEntry[];
  summary: string;
};

export type BrandInfluenceTrace = {
  contextField: string;
  source: string;
  creativeDecision: string;
  strength: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type BrandCreativeContext = {
  brandId: string;
  projectId: string;
  brandName: string;
  category: ContextFieldValue<string | null>;
  positioning: ContextFieldValue<string | null>;
  brandPromise: ContextFieldValue<string | null>;
  brandLore: ContextFieldValue<string | null>;
  differentiation: ContextFieldValue<string | null>;
  brandPersonality: BrandPersonalityDimensions;
  audience: BrandAudienceContext;
  productsServices: ContextFieldValue<string[]>;
  offers: BrandOfferContext[];
  pricePositioning: ContextFieldValue<string | null>;
  visualIdentity: BrandVisualIdentity;
  toneVoice: BrandToneVoice;
  experiencePrinciples: ContextFieldValue<string[]>;
  worldBuilding: BrandWorldBuilding;
  founderIntent: FounderBrandIntent;
  /** Reference — not a disconnected copy */
  creativeAppetite: FounderCreativeAppetiteProfile | null;
  campaignHistory: BrandCampaignHistorySummary;
  approvedReferences: ApprovedCreativeReference[];
  approvedMotifs: ContextFieldValue<string[]>;
  approvedWorlds: ContextFieldValue<string[]>;
  contentHistory: ContextFieldValue<string[]>;
  doNotUse: ContextFieldValue<string[]>;
  creativeBoundaries: BrandCreativeBoundary[];
  nonNegotiables: ContextFieldValue<string[]>;
  currentObjectives: ContextFieldValue<string[]>;
  sourceRefs: BrandContextSourceRef[];
  conflicts: BrandContextConflict[];
  readiness: BrandCreativeContextReadiness;
  confidence: ContextConfidence;
  lastAssembledAt: string;
  version: number;
  contextUpdateAvailable: boolean;
  founderOverrides: Record<string, unknown>;
};

export type CampaignGenerationContextEnvelope = {
  brandContext: BrandCreativeContext;
  brandContextVersion: number;
  objective: string;
  selectedOffers: BrandOfferContext[];
  campaignHistory: BrandCampaignHistorySummary;
  founderCreativeAppetite: FounderCreativeAppetiteProfile | null;
  channel: string | null;
  constraints: string[];
  influenceTrace: BrandInfluenceTrace[];
};

export type BrandContextIntakeStep =
  | 'WHO_ARE_YOU'
  | 'WHAT_DO_YOU_SELL'
  | 'WHO_IS_IT_FOR'
  | 'HOW_SHOULD_IT_FEEL'
  | 'HOW_SHOULD_IT_LOOK'
  | 'NEVER_BECOME'
  | 'WHAT_YOU_LOVE';

export type BrandContextIntakeDraft = {
  brandId: string;
  currentStep: BrandContextIntakeStep;
  answers: Partial<Record<BrandContextIntakeStep, Record<string, string | string[]>>>;
  updatedAt: string;
};

export type BrandSpecificityScore = {
  brandTruthUsage: number;
  offerSpecificity: number;
  audienceSpecificity: number;
  worldSpecificity: number;
  voiceSpecificity: number;
  historyAwareness: number;
  overall: number;
  genericPhrasesDetected: string[];
};

export type GenericBrandOutputIssue = {
  phrase: string;
  reason: string;
  severity: 'WARN' | 'FAIL';
};

export type BrandCreativeContextQAResult = {
  pass: boolean;
  offerAccuracy: boolean;
  audienceAccuracy: boolean;
  voiceFit: boolean;
  visualFit: boolean;
  worldFit: boolean;
  boundaryViolations: BrandCreativeBoundary[];
  crossProjectLeakage: string[];
  genericIssues: GenericBrandOutputIssue[];
  specificityScore: BrandSpecificityScore;
};

export type BrandCreativeContextAssemblerInput = {
  brandId: string;
  projectId?: string;
  /** Existing lore profile from IDNTY / reconciliation */
  loreProfile?: import('../types.js').BrandLoreProfile | null;
  /** Existing appetite profile */
  appetiteProfile?: FounderCreativeAppetiteProfile | null;
  /** Founder overrides — never silently overwrite canonical IDNTY */
  founderOverrides?: Record<string, unknown>;
  /** Campaign-specific input */
  campaignInput?: {
    objective?: string;
    selectedOfferIds?: string[];
  };
};

export type BrandCreativeContextAssemblerResult = {
  context: BrandCreativeContext;
  diff: BrandContextDiff | null;
  assembled: boolean;
  blocked: boolean;
  blockReason: string | null;
};
