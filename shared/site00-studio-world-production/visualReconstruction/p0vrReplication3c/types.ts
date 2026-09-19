/**
 * P0.VR.REPLICATION.3C — Asset realization + literal source execution types.
 */

export const ASSET_RESOLUTION_STRATEGIES = [
  'EXISTING_PROJECT_ASSET',
  'EXISTING_LIBRARY_ASSET',
  'AUTHORITY_REGION_DERIVATION',
  'AUTHORITY_CROP',
  'GENERATED_RECONSTRUCTION',
  'PROCEDURAL_DOM_GRAPHIC',
  'UNRESOLVED',
] as const;

export type AssetResolutionStrategy = (typeof ASSET_RESOLUTION_STRATEGIES)[number];

export const REPLICATION_3C_FAILURE_CODES = [
  'ASSET_SEARCH_NO_MATCH',
  'ASSET_DERIVATION_FAILED',
  'ASSET_GENERATION_FAILED',
  'ASSET_BIND_FAILED',
  'SOURCE_STRUCTURE_COLLAPSE',
  'LITERAL_LAYOUT_INVALID',
  'VISION_RECOMPARE_FAILED',
  'UNRESOLVED_VISUAL_ASSET',
  'LITERAL_EXECUTION_CAPABILITY_LIMIT',
] as const;

export type Replication3CFailureCode = (typeof REPLICATION_3C_FAILURE_CODES)[number];

export type ReplicationAssetSlot = {
  slotId: string;
  regionId: string;
  authorityBounds: string;
  assetType: 'photography' | 'graphic' | 'icon' | 'decorative-crop';
  visualRole: string;
  required: boolean;
  authorityEvidence: string;
  candidateAssets: string[];
  selectedStrategy: AssetResolutionStrategy;
  selectedAsset: string | null;
  cropSpec: {
    backgroundSize?: string;
    backgroundPosition?: string;
    objectFit?: string;
  } | null;
  fitMode: 'cover' | 'contain' | 'fill';
  positionSpec: string | null;
  status: 'BOUND' | 'UNRESOLVED_VISUAL_ASSET' | 'PENDING';
  failureReason: string | null;
  /** P0.VR.REPLICATION.3C-R1 — persisted crop URL (data URL or CDN). */
  materializedPublicUrl?: string | null;
  bindingStage?: import('../p0vrReplication3cR1/types.js').AssetBindingStage | null;
  materializationTrace?: import('../p0vrReplication3cR1/types.js').AssetMaterializationTrace | null;
};

export type AssetResolutionReceipt = {
  slotId: string;
  strategy: AssetResolutionStrategy;
  candidateCount: number;
  selectedAsset: string | null;
  source: string;
  cropApplied: boolean;
  bound: boolean;
  rendered: boolean;
  status: 'OK' | Replication3CFailureCode;
  notes: string;
  bindingStage?: import('../p0vrReplication3cR1/types.js').AssetBindingStage | null;
  visible?: boolean;
};

export type LiteralLayoutInstruction = {
  elementId: string;
  type: 'subregion' | 'text' | 'image' | 'graphic' | 'control';
  parentId: string | null;
  xRelation: string;
  yRelation: string;
  widthRelation: string;
  heightRelation: string;
  alignment: string;
  overlap: string | null;
  zOrder: number;
  padding: string | null;
  gap: string | null;
  surface: string | null;
  border: string | null;
  overflow: string | null;
  crop: string | null;
  positioningMode: 'grid' | 'flex' | 'absolute';
};

export type LiteralSourceExecutionReceipt = {
  regionId: string;
  literalSpecConsumed: boolean;
  layoutInstructionCount: number;
  assetSlotCount: number;
  assetResolvedCount: number;
  sourceElementCount: number;
  collapsed: boolean;
  rendered: boolean;
  visionCompared: boolean;
  correctionPasses: number;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  failureCode: Replication3CFailureCode | null;
};

export type Replication3CReport = {
  reportId: string;
  sessionId: string;
  buildRef: string;
  assetSlots: ReplicationAssetSlot[];
  assetReceipts: AssetResolutionReceipt[];
  layoutInstructions: LiteralLayoutInstruction[];
  executionReceipts: LiteralSourceExecutionReceipt[];
  heroHumanRecognizable: boolean;
  capabilityLimit: boolean;
  capabilityFailure: 'ASSET_REALIZATION' | 'SOURCE_EXECUTION' | null;
  priorTwinVersionPreserved: string | null;
  newTwinVersionId: string;
  createdAt: string;
  /** P0.VR.REPLICATION.3C-R1 */
  materializationTraces?: import('../p0vrReplication3cR1/types.js').AssetMaterializationTrace[];
  proofSlotVisible?: boolean;
  activeTwinVersionId?: string;
  sourceBuildVersion?: string;
};
