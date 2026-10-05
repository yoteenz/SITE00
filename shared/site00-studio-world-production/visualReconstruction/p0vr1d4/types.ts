/**
 * P0.VR.1D.4 — Region identity + mapped DOM delta types.
 */

import type { CodePatchInstruction, ReferenceDomDelta, ReferenceDomDeltaEntry } from '../p0vr1d1/types.js';
import type { ViewportClass } from '../p0vr1d/types.js';
import type { NdxProjectHubLiveReconstructionReport } from '../p0vr1d2/types.js';

export type VisualRegionMappingSource =
  | 'EXACT_SEMANTIC'
  | 'COMPONENT_REGISTRY'
  | 'MANUAL_CANONICAL_MAP'
  | 'INFERRED'
  | 'LEGACY_ALIAS';

export type VisualRegionIdentity = {
  canonicalRegionId: string;
  screenId: string;
  route: string;
  semanticRole: string;
  viewportClass: ViewportClass;
};

export type ReferenceDomRegionMapEntry = {
  referenceRegionId: string;
  canonicalRegionId: string;
  domSelector: string;
  route: string;
  screenId: string;
  confidence: number;
  mappingSource: VisualRegionMappingSource;
};

export type ReferenceDomRegionMap = {
  mapId: string;
  screenId: string;
  route: string;
  entries: ReferenceDomRegionMapEntry[];
};

export type FounderVisualBoardType = 'DESKTOP_MOOD_BOARD' | 'MOBILE_MOOD_BOARD';

export type FounderVisualBoardStatus = 'ACTIVE_REFERENCE' | 'SUPERSEDED' | 'MISSING';

export type FounderVisualBoardReference = {
  boardId: string;
  projectId: string;
  assetId: string;
  storagePath: string;
  resolvedUrl: string | null;
  localPath: string | null;
  boardType: FounderVisualBoardType;
  viewportClass: ViewportClass;
  source: 'FOUNDER_UPLOAD' | 'CANONICAL_LOCAL' | 'SUPABASE' | 'ENV_OVERRIDE';
  status: FounderVisualBoardStatus;
  uploadedAt: string | null;
};

export type MappedReferenceDomDelta = ReferenceDomDelta & {
  mappedRegionCount: number;
  unmappedReferenceRegions: string[];
  unmappedDomRegions: string[];
};

export type MappedDomDeltaEntry = ReferenceDomDeltaEntry & {
  canonicalRegionId: string;
  domSelector: string | null;
  mappingSource: VisualRegionMappingSource;
  status: 'MATCHED' | 'DRIFTING';
};

export type ActionableCodePatch = CodePatchInstruction & {
  canonicalRegionId: string;
  componentId: string;
  filePath: string | null;
  styleSource: string | null;
};

export type AppliedCodePatchResult = {
  instructionId: string;
  applied: boolean;
  filePath: string;
  reason: string;
};

export type NdxProjectHubAlignedLiveReport = NdxProjectHubLiveReconstructionReport & {
  regionMaps: ReferenceDomRegionMap[];
  mappedDeltas: MappedReferenceDomDelta[];
  actionablePatches: ActionableCodePatch[];
  appliedPatches: AppliedCodePatchResult[];
  founderBoardReferences: FounderVisualBoardReference[];
  failFounderReferenceMissing: boolean;
  fixtureSubstitutionUsed: boolean;
  actualFounderBoardsPersisted?: boolean;
  largestDesktopDelta?: number;
  largestMobileDelta?: number;
  invalidRegionLocks?: string[];
  unmappedLockedRegions?: string[];
};
