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

export type TerritorySpecimen = {
  id: string;
  territoryId: string;
  specimenType:
    | 'brand_overview'
    | 'wordmark'
    | 'page_architecture'
    | 'volume_architecture'
    | 'social_916'
    | 'feed_cover'
    | 'typography'
    | 'color_material'
    | 'graphic_system'
    | 'motion_storyboard';
  title: string;
  status: CreativeAssetStatus;
  renderSpec: Record<string, unknown>;
  generationJobId: string | null;
  provenance: Record<string, unknown>;
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
