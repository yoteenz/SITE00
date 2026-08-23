/**
 * NDXBOOK creative asset lineage — canonical record types.
 */

export const CREATIVE_ASSET_TYPES = [
  'HERO',
  'CAROUSEL_SLIDE',
  'FEED_POST',
  'STORY_FRAME',
  'REEL_FRAME',
  'REEL_COVER',
  'TIKTOK_FRAME',
  'MOTION_KEYFRAME',
  'BOARD',
  'SOCIAL_PROOF',
  'INFORMATION_ARTIFACT',
  'PHOTOGRAPHY_ASSET',
  'MATERIAL_ASSET',
  'TYPOGRAPHY_SPECIMEN',
  'GRAPHIC_DEVICE',
  'PHYSICAL_ARTIFACT',
  'OTHER',
] as const;

export type CreativeAssetType = (typeof CREATIVE_ASSET_TYPES)[number];

export const CREATIVE_SOURCE_TYPES = [
  'GENERATED',
  'CODE_NATIVE',
  'HYBRID',
  'FOUNDER_UPLOAD',
  'REFERENCE',
  'DERIVED',
  'ADAPTED',
] as const;

export type CreativeSourceType = (typeof CREATIVE_SOURCE_TYPES)[number];

export const CREATIVE_STAGES = [
  'VALIDATION',
  'WORLD_BUILDING',
  'CANON_FORMATION',
  'PRODUCTION',
  'PUBLISHED',
  'ARCHIVED',
] as const;

export type CreativeStage = (typeof CREATIVE_STAGES)[number];

export const REVIEW_STATES = [
  'UNREVIEWED',
  'LOVE_IT',
  'PROMISING_REFINE',
  'NOT_FOR_ME',
  'APPROVED',
  'REJECTED',
  'RETIRED',
] as const;

export type ReviewState = (typeof REVIEW_STATES)[number];

export const PRODUCTION_STATES = [
  'EXPERIMENTAL',
  'PRODUCTION_CANDIDATE',
  'CANONICAL',
  'ADAPTABLE',
  'RETIRED',
  'PUBLISHED',
  'CANON_REVIEW_REQUIRED',
] as const;

export type ProductionState = (typeof PRODUCTION_STATES)[number];

export const REUSE_STATES = [
  'ORIGINAL_USE_ONLY',
  'REUSABLE_AS_IS',
  'REUSABLE_WITH_ADAPTATION',
  'IDEA_ONLY',
  'VISUAL_DEVICE_ONLY',
  'COPY_MECHANIC_ONLY',
  'MOTION_MECHANIC_ONLY',
  'CONTENT_FRANCHISE_ONLY',
  'RETIRED',
] as const;

export type ReuseState = (typeof REUSE_STATES)[number];

export const CANON_STATUSES = [
  'NON_CANON',
  'DIRECTION_CANON',
  'BRAND_CANON_CANDIDATE',
  'BRAND_CANON',
  'CONTENT_CANON',
  'CONTENT_CANON_CANDIDATE',
] as const;

export type CanonStatus = (typeof CANON_STATUSES)[number];

export const CONCEPT_TYPES = [
  'CONTENT_FRANCHISE',
  'EDITORIAL_MECHANIC',
  'COPY_MECHANIC',
  'VISUAL_DEVICE',
  'MOTION_MECHANIC',
  'INTERACTION_MECHANIC',
  'CAROUSEL_STRUCTURE',
  'STORY_STRUCTURE',
  'REEL_STRUCTURE',
  'INFORMATION_ARCHITECTURE',
  'AUDIENCE_RITUAL',
  'ARTIFACT_CONCEPT',
  'CAMPAIGN_IDEA',
  'EPISODE_IDEA',
  'SERIES_IDEA',
] as const;

export type ConceptType = (typeof CONCEPT_TYPES)[number];

export const CONCEPT_REUSE_ASSESSMENTS = [
  'PORTABLE',
  'PORTABLE_WITH_TRANSLATION',
  'WORLD_SPECIFIC',
  'BRAND_CANON_CANDIDATE',
  'RETIRE',
] as const;

export type ConceptReuseAssessment = (typeof CONCEPT_REUSE_ASSESSMENTS)[number];

export const FRANCHISE_STATUSES = [
  'PROPOSED',
  'FOUNDER_LIKES',
  'CANON_CANDIDATE',
  'CANONICAL',
  'RETIRED',
] as const;

export type FranchiseStatus = (typeof FRANCHISE_STATUSES)[number];

export const FRANCHISE_TRANSLATION_POLICIES = [
  'KEEP_ORIGINAL_EXPRESSION',
  'TRANSLATE_TO_WINNING_WORLD',
  'IDEA_ONLY',
  'RETIRE',
] as const;

export type FranchiseTranslationPolicy = (typeof FRANCHISE_TRANSLATION_POLICIES)[number];

export const SALVAGE_CLASSIFICATIONS = [
  'REUSE_AS_IS',
  'REUSE_WITH_ADAPTATION',
  'SALVAGE_IDEA_ONLY',
  'SALVAGE_CONTENT_FRANCHISE',
  'SALVAGE_COPY_MECHANIC',
  'SALVAGE_MOTION_MECHANIC',
  'SALVAGE_VISUAL_DEVICE',
  'RETIRE',
] as const;

export type SalvageClassification = (typeof SALVAGE_CLASSIFICATIONS)[number];

export const EDITORIAL_IDEA_TYPES = [
  'TOPIC',
  'EPISODE',
  'CAROUSEL',
  'REEL',
  'STORY',
  'SERIES',
  'QUESTION',
  'REACTION',
  'GUIDE',
  'DATA',
  'OTHER',
] as const;

export type EditorialIdeaType = (typeof EDITORIAL_IDEA_TYPES)[number];

export const EDITORIAL_IDEA_STATUSES = [
  'RAW',
  'PROMISING',
  'CANON_CANDIDATE',
  'PLANNED',
  'USED',
  'RETIRED',
] as const;

export type EditorialIdeaStatus = (typeof EDITORIAL_IDEA_STATUSES)[number];

export const TRAIT_TYPES = [
  'TYPOGRAPHY',
  'COLOR',
  'COMPOSITION',
  'GRAPHIC_DEVICE',
  'MOTION',
  'PHOTOGRAPHY',
  'COPY',
  'ARTIFACT',
  'INFORMATION_DESIGN',
  'OTHER',
] as const;

export type BrandCanonTraitType = (typeof TRAIT_TYPES)[number];

export const DUPLICATE_RELATIONSHIPS = ['POSSIBLE_DUPLICATE', 'RELATED_CONCEPT', 'DISTINCT'] as const;

export type DuplicateRelationship = (typeof DUPLICATE_RELATIONSHIPS)[number];

export const PUBLISHING_READINESS_STATES = ['NOT_READY', 'NEEDS_REVIEW', 'READY_TO_PUBLISH'] as const;

export type PublishingReadinessState = (typeof PUBLISHING_READINESS_STATES)[number];

export type DirectionLineage = {
  directionId: string;
  directionName: string;
  formationId: string | null;
  formationVersion: number | null;
  canonicalAtCreation: boolean;
  worldId: string;
  worldVersion: string;
  experimentClassification: string | null;
};

export type ContentLineage = {
  topicId: string | null;
  topicName: string | null;
  contentFranchiseId: string | null;
  episodeId: string | null;
  carouselId: string | null;
  slideNumber: number | null;
  format: string | null;
  nativeFormatReason: string | null;
};

export type IntelligenceLineage = {
  brandLoreVersion: number | null;
  brandLoreFingerprint: string | null;
  personalityFingerprint: string | null;
  expressionContext: string | null;
  directionExpressionSystemId: string | null;
  creativeExpressionSystemId: string | null;
  identityArtDirectionId: string | null;
  visualBriefId: string | null;
  promptHash: string | null;
};

export type GenerationLineage = {
  provider: string | null;
  model: string | null;
  requestId: string | null;
  generationVersion: string | null;
  parentAssetIds: string[];
  referenceAssetIds: string[];
  imageConditioningUsed: boolean;
  promptVersion: string | null;
  generatedAt: string | null;
  generationCostUsd: number | null;
  storagePath: string | null;
};

export type AssetRelationship = {
  parentAssetId: string | null;
  derivedAssetIds: string[];
  adaptationType: string | null;
};

export type CreativeAssetRecord = {
  assetId: string;
  orgId: string;
  projectId: string;
  brandSlug: string;
  brandDisplayName: string;
  assetType: CreativeAssetType;
  sourceType: CreativeSourceType;
  creativeStage: CreativeStage;
  directionLineage: DirectionLineage;
  contentLineage: ContentLineage;
  intelligenceLineage: IntelligenceLineage;
  generationLineage: GenerationLineage;
  reviewState: ReviewState;
  productionState: ProductionState;
  reuseState: ReuseState;
  canonStatus: CanonStatus;
  relationship: AssetRelationship;
  creativeFamilyId: string | null;
  brandCanonVersionAtGeneration: number;
  contentCanonVersionAtGeneration: number;
  founderNotes: string | null;
  internalNotes: string | null;
  salvageClassification: SalvageClassification | null;
  publishingReadiness: PublishingReadiness | null;
  historicalSourceRef: string | null;
  immutable: true;
  createdAt: string;
  updatedAt: string;
};

export type CreativeConceptRecord = {
  conceptId: string;
  brandSlug: string;
  orgId: string;
  originDirectionId: string;
  originDirectionName: string;
  originWorldId: string;
  conceptType: ConceptType;
  name: string;
  description: string;
  whyItWorks: string;
  originalExpression: string;
  portableCore: string;
  directionSpecificElements: string[];
  visualDependencies: string[];
  voiceDependencies: string[];
  formatDependencies: string[];
  topicDependencies: string[];
  reuseAssessment: ConceptReuseAssessment;
  founderJudgment: ReviewState | null;
  canonStatus: CanonStatus;
  salvageClassification: SalvageClassification | null;
  createdAt: string;
  updatedAt: string;
};

export type ContentFranchiseRecord = {
  franchiseId: string;
  brandSlug: string;
  orgId: string;
  name: string;
  originDirectionId: string;
  originWorldId: string;
  description: string;
  editorialPromise: string;
  audienceValue: string;
  repeatability: string;
  nativeFormats: string[];
  topicRange: string[];
  voiceBehavior: string;
  visualBehavior: string;
  motionBehavior: string;
  frequencyPotential: string;
  evergreenPotential: string;
  reactivePotential: string;
  saveabilityPotential: string;
  status: FranchiseStatus;
  translationPolicy: FranchiseTranslationPolicy;
  createdAt: string;
  updatedAt: string;
};

export type EditorialIdeaRecord = {
  ideaId: string;
  brandSlug: string;
  orgId: string;
  originDirectionId: string;
  originWorldId: string;
  ideaType: EditorialIdeaType;
  title: string;
  premise: string;
  whyItMatters: string;
  audienceValue: string;
  contentPotential: string;
  suggestedFormats: string[];
  suggestedFranchises: string[];
  portableCore: string;
  status: EditorialIdeaStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreativeFamily = {
  familyId: string;
  brandSlug: string;
  orgId: string;
  topicId: string;
  directionId: string;
  directionName: string;
  worldId: string;
  name: string;
  primaryAssetId: string | null;
  memberAssetIds: string[];
  memberConceptIds: string[];
  memberFranchiseIds: string[];
  status: 'ACTIVE' | 'ARCHIVED' | 'SALVAGED' | 'TRANSLATED' | 'REUSED';
  createdAt: string;
  updatedAt: string;
};

export type BrandCanonTrait = {
  traitId: string;
  brandSlug: string;
  orgId: string;
  traitType: BrandCanonTraitType;
  sourceDirectionId: string;
  sourceWorldId: string;
  description: string;
  rationale: string;
  founderApproved: boolean;
  promotedAt: string | null;
  status: 'PROPOSED' | 'APPROVED' | 'RETIRED';
  createdAt: string;
  updatedAt: string;
};

export type GoverningCreativeWorld = {
  canonicalDirectionId: string;
  canonicalDirectionName: string;
  canonicalWorldId: string;
  canonicalTypographySystem: string;
  canonicalColorSystem: string;
  canonicalCompositionSystem: string;
  canonicalPhotographySystem: string;
  canonicalGraphicGrammar: string;
  canonicalArtifactLanguage: string;
  canonicalMotionLanguage: string;
  canonicalVoiceBehavior: string;
  canonicalSocialBehavior: string;
  canonicalFormatBehavior: string;
};

export type WinningWorldPromotionPlan = {
  planId: string;
  brandSlug: string;
  orgId: string;
  winningDirectionId: string;
  winningWorldId: string;
  winningDirectionName: string;
  founderDecisionId: string | null;
  promotionTimestamp: string | null;
  status: 'DRAFT' | 'FOUNDER_APPROVED' | 'PROMOTED' | 'CANCELLED';
  governingCreativeWorld: GoverningCreativeWorld;
  autoTriggered: false;
  createdAt: string;
  updatedAt: string;
};

export type LaunchSeedSet = {
  launchSeedSetId: string;
  brandSlug: string;
  orgId: string;
  winningDirectionId: string | null;
  selectedAssets: string[];
  selectedConcepts: string[];
  selectedFranchises: string[];
  launchOrder: string[];
  notes: string | null;
  status: 'DRAFT' | 'FOUNDER_REVIEW' | 'READY' | 'USED';
  createdAt: string;
  updatedAt: string;
};

export type PublishingReadiness = {
  visualApproved: boolean;
  copyApproved: boolean;
  factChecked: boolean;
  sourceChecked: boolean;
  formatReady: boolean;
  cropReady: boolean;
  captionReady: boolean;
  altTextReady: boolean;
  rightsClear: boolean;
  brandCanonCompatible: boolean;
  founderApproved: boolean;
  state: PublishingReadinessState;
};

export type BrandCanonState = {
  brandSlug: string;
  orgId: string;
  brandCanonVersion: number;
  contentCanonVersion: number;
  governingWorldId: string | null;
  winningDirectionId: string | null;
  winningDirectionName: string | null;
  brandCanonLayers: string[];
  contentCanonLayers: string[];
  updatedAt: string;
};

export type TranslatedConceptPreview = {
  originalIdea: string;
  originalExpression: string;
  portableCore: string;
  winningWorldTranslation: string;
  whatChanges: string[];
  whatStays: string[];
  contaminationTest: { passed: boolean; notes: string[] };
};

export type SalvageReviewItem = {
  itemId: string;
  itemKind: 'ASSET' | 'CONCEPT' | 'FRANCHISE' | 'IDEA';
  originDirectionId: string;
  originDirectionName: string;
  title: string;
  classification: SalvageClassification | null;
  founderAction: 'KEEP_AS_IS' | 'TRANSLATE_INTO_WINNING_WORLD' | 'KEEP_IDEA_ONLY' | 'RETIRE' | null;
  translationPreview: TranslatedConceptPreview | null;
};

export type SalvageReviewProgress = {
  brandSlug: string;
  winningDirectionId: string;
  losingDirectionId: string;
  losingDirectionName: string;
  items: SalvageReviewItem[];
  completed: boolean;
};

export type ForensicAuditReport = {
  auditedAt: string;
  brandSlug: string;
  assetsDiscovered: number;
  conceptsDiscovered: number;
  ephemeralRisks: string[];
  missingLineage: string[];
  historicalPreservation: string[];
  migrationPlan: string[];
  storagePaths: Record<string, string>;
  experimentRecords: Record<string, number>;
};

export type CreativeLineageLibraryFilters = {
  section?:
    | 'ALL'
    | 'CANONICAL'
    | 'PRODUCTION_CANDIDATES'
    | 'CAROUSELS'
    | 'FEED'
    | 'STORIES'
    | 'REELS'
    | 'MOTION'
    | 'FRANCHISES'
    | 'CONCEPTS'
    | 'ADAPTABLE'
    | 'RETIRED';
  directionId?: string;
  worldId?: string;
  topicId?: string;
  format?: string;
  franchiseId?: string;
  productionState?: ProductionState;
  reuseState?: ReuseState;
  canonStatus?: CanonStatus;
  reviewState?: ReviewState;
};

export type CreativeLineageLibraryPayload = {
  assets: CreativeAssetRecord[];
  concepts: CreativeConceptRecord[];
  franchises: ContentFranchiseRecord[];
  families: CreativeFamily[];
  editorialIdeas: EditorialIdeaRecord[];
  brandCanonState: BrandCanonState | null;
  launchSeedSet: LaunchSeedSet | null;
  promotionPlan: WinningWorldPromotionPlan | null;
  salvageReviews: SalvageReviewProgress[];
  forensicAudit: ForensicAuditReport | null;
};
