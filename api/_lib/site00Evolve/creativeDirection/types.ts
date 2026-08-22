/** Shared EVOLVE Creative Direction types — organization-agnostic lifecycle */

export type CreativeDirectionLifecycle =
  | 'PROPOSED'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUESTED'
  | 'SELECTED'
  | 'APPROVED';

export type CreativeAssetStatus =
  | 'SPEC_RENDERED'
  | 'GENERATION_QUEUED'
  | 'GENERATED'
  | 'REVIEW'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'APPROVED';

export type FounderDecisionType = 'APPROVE' | 'REFINE' | 'HYBRIDIZE' | 'REJECT';

export type QualitativeRating = 'STRONG' | 'MODERATE' | 'RISK' | 'UNKNOWN';

export type IntelligenceBriefSection = {
  key: string;
  label: string;
  value: string;
  provenance: 'CANONICAL' | 'FOUNDER_CONFIRMED' | 'RECOVERED_CANON';
};

/**
 * Dominant public-expression context for a brand — classified once per Creative Brief,
 * before any territory is produced, so Creative Direction does not force every brand
 * through the same (often website-first) presentation. See
 * docs/site00/CREATIVE_DIRECTION_METHODOLOGY.md.
 */
export type BrandExpressionContext =
  | 'SOCIAL_FIRST_EDITORIAL'
  | 'ECOMMERCE_FIRST'
  | 'SERVICE_BUSINESS'
  | 'PRODUCT_PLATFORM'
  | 'CREATOR_BRAND'
  | 'ENTERTAINMENT_MEDIA'
  | 'HOSPITALITY'
  | 'PHYSICAL_RETAIL'
  | 'HYBRID';

/** Priority order of proof surfaces for a SOCIAL_FIRST_EDITORIAL brand — website is deliberately absent. */
export const SOCIAL_FIRST_EDITORIAL_PROOF_PRIORITY = [
  'FEED_BEHAVIOR',
  'POST_FAMILIES',
  'CAROUSEL_SYSTEMS',
  'STORY_SYSTEMS',
  'REEL_SHORT_FORM_SYSTEMS',
  'PHOTOGRAPHY_ART_DIRECTION',
  'GRAPHIC_DEVICES',
  'TYPOGRAPHY_BEHAVIOR',
  'RECURRING_EDITORIAL_FRANCHISES',
  'MOTION_PRINCIPLES',
  'CAMPAIGN_EXTENSIBILITY',
] as const;

export type CreativeBrief = {
  id: string;
  organizationSlug: string;
  synthesizedAt: string;
  mustCommunicate: string[];
  mustFeelLike: string[];
  mustNotFeelLike: string[];
  visualTensions: string[];
  taxonomyInfluence: string[];
  scaleConsiderations: string[];
  differentiation: string[];
  voiceConstraints: { preserve: string[]; reject: string[] };
  classification: 'PROPOSED';
  provenance: {
    source: 'CONTENT_BRAIN' | 'BRAND_LORE' | 'BLENDED';
    entryCount: number;
    brandLoreProfileId?: string | null;
  };
  /** Optional — brands classified before this field existed remain valid without it. */
  primaryContext?: BrandExpressionContext;
  /** Brand expression context — from lore classification, not website-default. */
  brandContextClassification?: string | null;
  /** Internal readiness — never a fake percentage. */
  brandLoreReadiness?: 'CONTEXT_INCOMPLETE' | 'CONTEXT_PARTIAL' | 'CORE_DIRECTION_READY' | null;
  brandLoreLineage?: string[];
};

export type TerritoryRendererKey = 'index_signal' | 'editorial_utility' | 'kinetic_field';

export type IndexSignalSpecimenType =
  | 'brand_index_card'
  | 'page_catalog_system'
  | 'page_001_indexed'
  | 'volume_registry'
  | 'cross_reference_map'
  | 'social_knowledge_card_916'
  | 'feed_index_tile'
  | 'navigation_archive_strip'
  | 'typography_system'
  | 'graphic_language'
  | 'motion_storyboard'
  | 'wordmark'
  // Signal editorial-behavior branches (Section II, Direction 02)
  | 'signal_pulse'
  | 'signal_readout'
  | 'signal_pattern'
  | 'signal_scan'
  | 'signal_forecast'
  | 'signal_alert'
  | 'signal_transmission'
  | 'signal_coordinate'
  | 'signal_projection';

export type EditorialUtilitySpecimenType =
  | 'magazine_volume_opener'
  | 'feature_article_opener'
  | 'knowledge_page'
  | 'page_001_editorial'
  | 'quote_insight_card'
  | 'social_carousel_cover'
  | 'instagram_feed_tile'
  | 'volume_color_system'
  | 'typography_spread'
  | 'article_sequence'
  | 'motion_storyboard'
  | 'wordmark'
  // Nine editorial branches (Section II, Direction 01)
  | 'branch_burn_page'
  | 'branch_receipts'
  | 'branch_margin_notes'
  | 'branch_the_list'
  | 'branch_the_file'
  | 'branch_the_insert'
  | 'branch_redaction'
  | 'branch_centerfold'
  | 'branch_back_page';

export type KineticFieldSpecimenType =
  | 'motion_title_frame'
  | 'hook_frame_916'
  | 'page_001_kinetic'
  | 'motion_sequence_3frame'
  | 'page_number_transition'
  | 'volume_stinger'
  | 'social_feed_tile'
  | 'signal_graphic'
  | 'typography_system'
  | 'dark_light_inversion'
  | 'motion_storyboard'
  | 'wordmark'
  // Motion-principle branches (Section II, Direction 03)
  | 'motion_push'
  | 'motion_pull'
  | 'motion_ripple'
  | 'motion_collision'
  | 'motion_current'
  | 'motion_trajectory'
  | 'motion_build'
  | 'motion_break'
  | 'motion_aftermath'
  | 'motion_momentum';

export type TerritorySpecimenType = IndexSignalSpecimenType | EditorialUtilitySpecimenType | KineticFieldSpecimenType;

/**
 * Mandatory background-treatment declaration for any generated visual —
 * never left implicit. See docs/site00/CREATIVE_DIRECTION_METHODOLOGY.md §5.
 */
export type BackgroundTreatment =
  | 'KEEP_BACKGROUND'
  | 'REMOVE_BACKGROUND'
  | 'GENERATE_TRANSPARENT_IF_SUPPORTED'
  | 'MASK_AND_COMPOSITE'
  | 'FULL_BLEED';

export type AssetClassification = 'CODE_NATIVE' | 'GENERATED_ASSET' | 'EXISTING_ASSET' | 'HYBRID_COMPOSITION';
export type FidelityMode = 'EXACT_RECONSTRUCTION' | 'DIRECTED_VARIATION' | 'NET_NEW_GENERATION';

/** Normalized (percentage) placement for one asset within one composition — desktop and mobile authored independently, never proportionally derived. */
export type CompositePlacement = {
  xPct: number;
  yPct: number;
  widthPct: number;
  rotationDeg?: number;
  anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  zIndex: number;
};

export type CompositeMap = {
  assetId: string;
  desktop: CompositePlacement;
  mobile: CompositePlacement;
  overlapRelationship?: string;
  shadow?: string;
  safeArea?: string;
};

/** Generated/hybrid image attached to a specimen — optional so SVG-only rendering always remains valid (structural specimens never require FAL). */
export type SpecimenImageAsset = {
  assetId: string;
  url: string;
  classification: AssetClassification;
  generationMethod: string;
  backgroundTreatment: BackgroundTreatment;
  fidelityMode: FidelityMode;
  model: string;
  approvalState: 'GENERATED' | 'APPROVED';
  compositeMap?: CompositeMap;
};

/**
 * Core Direction Board schema — Stage A (Direction Formation). See
 * docs/site00/CORE_DIRECTION_METHODOLOGY.md §2–3. Populated for every territory
 * BEFORE any branch/expansion work exists; this is what answers "do we believe
 * this world?" at the Founder Core-Direction Gate — deeper than a palette or a
 * one-line thesis alone.
 */
export type CoreDirectionDefinition = {
  directionName: string;
  bigIdea: string;
  oneLineThesis: string;
  brandConnection: string;
  /** The conceptual ancestor — a cultural object, behavior, system, or ritual, not aesthetic inspiration. */
  culturalReference: string;
  emotionalPromise: string;
  visualMetaphor: string;
  governingBehavior: string;
  materialImageryLanguage: string;
  typographicAttitude: string;
  coreColorLogic: string;
  signatureDevices: string[];
  /** The single visual expression that most clearly proves the concept. */
  primaryBrandArtifact: string;
  /** Why this does not feel like a generic trend that could belong to any brand. */
  proprietaryQuality: string;
  /** What this concept must never become. */
  antiDirection: string[];
};

/**
 * Core DNA — the expansion grammar extracted from an APPROVED Core Direction
 * Board (§6). Never populated for a territory that has not reached
 * CORE_DIRECTION_APPROVED — see extractCoreDna() in coreDirection.ts and
 * VisualDnaContract.conceptDna, which is the canonical gated implementation
 * of this extraction for a real engagement.
 */
export type CoreDNA = {
  conceptRules: string[];
  visualRules: string[];
  compositionRules: string[];
  imageRules: string[];
  materialRules: string[];
  typographyRules: string[];
  colorRules: string[];
  motionRules: string[];
  contentBehavior: string[];
  signatureDevices: string[];
  prohibitedDrift: string[];
};

/** Section 08 — the seven questions every branch must answer before it may exist. */
export type BranchLineageTest = {
  emergesFromCoreConcept: boolean;
  explainableWithoutColorAlone: boolean;
  preservesCoreDna: boolean;
  introducesMeaningfulVariation: boolean;
  servesActualPurpose: boolean;
  recognizableWithoutBrandName: boolean;
  distinctFromSiblings: boolean;
  notes: string;
};

/** Section 07 — the mandatory declaration every branch must carry before it may be expanded into production. */
export type BranchLineageDeclaration = {
  branchName: string;
  specimenType: TerritorySpecimenType;
  branchPurpose: string;
  coreLineage: string;
  conceptualTranslation: string;
  visualLineage: string;
  differentiation: string;
  primaryBehavior: string;
  assetRequirements: string;
  motionBehavior?: string;
  channelApplicability: string[];
  lineageTest: BranchLineageTest;
};

export function branchPassesLineageTest(declaration: BranchLineageDeclaration): boolean {
  const t = declaration.lineageTest;
  return (
    t.emergesFromCoreConcept &&
    t.explainableWithoutColorAlone &&
    t.preservesCoreDna &&
    t.introducesMeaningfulVariation &&
    t.servesActualPurpose &&
    t.recognizableWithoutBrandName &&
    t.distinctFromSiblings
  );
}

/** Founder-facing gate vocabulary — docs/site00/CORE_DIRECTION_METHODOLOGY.md §5. */
export type CoreDirectionGateStatus =
  | 'CORE_DIRECTION_PENDING'
  | 'CORE_DIRECTION_REVISION_REQUESTED'
  | 'CORE_DIRECTION_APPROVED'
  | 'CORE_DIRECTION_REJECTED';

/**
 * Maps the existing CreativeDirectionLifecycle enum onto the founder-facing gate
 * vocabulary — additive only. The underlying lifecycle values are NOT renamed
 * (many consumers/tests depend on them); this is a derived display/decision layer.
 * SELECTED (a HYBRIDIZE outcome) stays PENDING because Visual DNA is not locked
 * (APPROVED) until an explicit APPROVE decision — see visualDnaContract.ts.
 */
export function coreDirectionGateStatus(lifecycleState: CreativeDirectionLifecycle): CoreDirectionGateStatus {
  switch (lifecycleState) {
    case 'REVISION_REQUESTED':
      return 'CORE_DIRECTION_REVISION_REQUESTED';
    case 'APPROVED':
      return 'CORE_DIRECTION_APPROVED';
    case 'PROPOSED':
    case 'UNDER_REVIEW':
    case 'SELECTED':
    default:
      return 'CORE_DIRECTION_PENDING';
  }
}

export type ExpansionFreedom = { level: 'LOW' | 'HIGH'; conceptDriftTolerance: 'LOW' | 'HIGH' };

/** Section 12 — creative freedom model: flips from LOW to HIGH exactly at CORE_DIRECTION_APPROVED, never before. */
export function expansionFreedomFor(lifecycleState: CreativeDirectionLifecycle): ExpansionFreedom {
  const approved = coreDirectionGateStatus(lifecycleState) === 'CORE_DIRECTION_APPROVED';
  return { level: approved ? 'HIGH' : 'LOW', conceptDriftTolerance: 'LOW' };
}

/** Truthful generation/approval state for a real FAL-produced visual asset. GENERATED never implies APPROVED. */
export type CreativeAssetApprovalState = 'GENERATED' | 'PROPOSED' | 'APPROVED';

/** Persisted manifest shape used by assetGeneration.ts (Supabase-backed governed generation). */
export type TerritorySpecimenImageAsset = {
  url: string;
  storagePath: string;
  model: string;
  volume: string;
  role: 'PAGE_001_PRIMARY' | 'PAGE_001_SECONDARY' | 'VOLUME_PROOF' | 'TEXTURE_MATERIAL';
  brief: string;
  negativePrompt: string;
  generatedAt: string;
  approvalState: CreativeAssetApprovalState;
  provenance: Record<string, unknown>;
};

export type TerritorySpecimen = {
  id: string;
  territoryId: string;
  specimenType: TerritorySpecimenType;
  title: string;
  status: CreativeAssetStatus;
  renderSpec: Record<string, unknown>;
  generationJobId: string | null;
  provenance: Record<string, unknown>;
  /** Present only for HYBRID_COMPOSITION / GENERATED_ASSET specimens; absent specimens render SVG-only. */
  imageAsset?: SpecimenImageAsset | null;
};

export type CreativeTerritory = {
  id: string;
  index: 1 | 2 | 3;
  name: string;
  thesis: string;
  strategicRationale: string;
  emotionalCharacter: string;
  visualPrinciples: string[];
  colorLogic: Record<string, string>;
  typographyLogic: Record<string, string>;
  compositionBehavior: string;
  graphicLanguage: string[];
  imageLanguage: string;
  informationHierarchy: string;
  motionBehavior: string;
  socialBehavior: string;
  crossVolumeBehavior: string;
  strengths: string[];
  risks: string[];
  ndxbookDistinctiveness: string;
  relationshipToCanon: string;
  lifecycleState: CreativeDirectionLifecycle;
  legacyReferenceUsed: boolean;
  rendererKey: TerritoryRendererKey;
  specimens: TerritorySpecimen[];
  evolveAnalysis: Record<string, QualitativeRating>;
  /** Stage A — Direction Formation. Required for every territory before any branch exists. */
  coreDirection: CoreDirectionDefinition;
  /** Stage B — Direction Expansion declarations for this territory's branches, each lineage-tested against coreDirection. */
  branchLineage: BranchLineageDeclaration[];
};

export type TerritoryComparison = {
  dimensions: string[];
  territories: Array<{
    territoryId: string;
    name: string;
    ratings: Record<string, QualitativeRating>;
  }>;
  evolveRecommendation: {
    territoryId: string;
    rationale: string;
    isApproval: false;
  };
};

export type HybridSelection = {
  territoryId: string;
  elements: string[];
};

export type FounderDecision = {
  type: FounderDecisionType;
  at: string;
  by: string;
  selectedTerritoryId: string | null;
  hybridSelections: HybridSelection[];
  refinementNotes: string | null;
  rejectedTerritoryIds: string[];
  provenance: Record<string, unknown>;
};

export type VisualDnaContract = {
  status: 'INCOMPLETE' | 'PROPOSED' | 'APPROVED';
  brandMark: Record<string, unknown>;
  color: Record<string, unknown>;
  typography: Record<string, unknown>;
  composition: Record<string, unknown>;
  graphicLanguage: Record<string, unknown>;
  imagery: Record<string, unknown>;
  contentArchitecture: Record<string, unknown>;
  motion: Record<string, unknown>;
  channelAdaptation: Record<string, unknown>;
  aiGeneration: Record<string, unknown>;
  provenance: Record<string, unknown>;
  /** Section 06 — only ever non-null once status reaches APPROVED (Founder Core-Direction Gate). See coreDirection.ts extractCoreDna(). */
  conceptDna: CoreDNA | null;
};

export type Page001ReadinessGate = {
  visualDnaApproved: boolean;
  productionEligible: boolean;
  blockedReason: string | null;
};

export type CreativeDirectionEngagement = {
  id: string;
  organization_id: string;
  organization_slug: string;
  lifecycle_state: CreativeDirectionLifecycle;
  lineage: string[];
  knownIntelligence: IntelligenceBriefSection[];
  openQuestions: string[];
  creativeBrief: CreativeBrief;
  territories: CreativeTerritory[];
  comparison: TerritoryComparison;
  founderDecision: FounderDecision | null;
  visualDna: VisualDnaContract;
  page001Gate: Page001ReadinessGate;
  /** Brand lore readiness gate — blocks auto-generation when incomplete (non-NDXBOOK intake flows). */
  brandLoreReadiness?: {
    state: 'CONTEXT_INCOMPLETE' | 'CONTEXT_PARTIAL' | 'CORE_DIRECTION_READY';
    blocked: boolean;
    message: string | null;
    missingDomains: string[];
  } | null;
  /** Intelligence lineage (Section IV) — which Brand Lore profile/version produced the current
   * territories, and a content fingerprint so calibration changes can be detected even when
   * profileVersion increments for unrelated reasons (e.g. a truthful-readiness resync). Null only
   * when no Brand Lore profile exists yet for this org (pre-calibration, non-NDXBOOK orgs). */
  brandLoreFormation?: {
    brandLoreProfileId: string;
    brandLoreProfileVersion: number;
    brandLoreFingerprint: string;
    formedAt: string;
    formationVersion: number;
  } | null;
  /** Truthful staleness signal (Section IV/V) — CURRENT when the territories were formed from the
   * Brand Lore fingerprint currently on file; STALE_INTELLIGENCE when calibration answers have
   * changed since formation and no territory has been founder-approved yet (eligible for
   * reformation). Frozen at whatever it was the moment a territory is APPROVED — an approved
   * Core Direction is a governance boundary and must never be silently relabeled stale. */
  intelligenceStatus: 'CURRENT' | 'STALE_INTELLIGENCE' | 'UNKNOWN';
  legacyReference: {
    indigoSlate: { status: 'REFERENCE_ONLY'; promotedToCanon: false };
    laceMastery: { status: 'REJECTED_MISATTRIBUTED' };
    page001LegacyVisual: { status: 'EXPERIMENTAL_NOT_APPROVED' };
  };
  created_at: string;
  updated_at: string;
};
