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
  provenance: { source: 'CONTENT_BRAIN'; entryCount: number };
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
  | 'wordmark';

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
  | 'wordmark';

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
  | 'wordmark';

export type TerritorySpecimenType = IndexSignalSpecimenType | EditorialUtilitySpecimenType | KineticFieldSpecimenType;

/** Truthful generation/approval state for a real FAL-produced visual asset. GENERATED never implies APPROVED. */
export type CreativeAssetApprovalState = 'GENERATED' | 'PROPOSED' | 'APPROVED';

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
  /** Present only when a real FAL-generated asset has been produced for this specimen. Never auto-approved. */
  imageAsset?: TerritorySpecimenImageAsset | null;
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
  legacyReference: {
    indigoSlate: { status: 'REFERENCE_ONLY'; promotedToCanon: false };
    laceMastery: { status: 'REJECTED_MISATTRIBUTED' };
    page001LegacyVisual: { status: 'EXPERIMENTAL_NOT_APPROVED' };
  };
  created_at: string;
  updated_at: string;
};
