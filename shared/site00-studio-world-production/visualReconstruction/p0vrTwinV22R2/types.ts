import type { VISUAL_OWNERSHIP } from './constants.js';

export type VisualOwnership = (typeof VISUAL_OWNERSHIP)[number];

export type TwinV2CanvasBoundaryRegion = {
  regionId: string;
  ownership: VisualOwnership;
  label: string;
  boundsNorm: { x: number; y: number; w: number; h: number };
};

export type TwinV2CanvasBoundary = {
  pageId: string;
  viewport: 'mobile';
  hostRegions: TwinV2CanvasBoundaryRegion[];
  clientRegions: TwinV2CanvasBoundaryRegion[];
  sharedRegions: TwinV2CanvasBoundaryRegion[];
  excludedRegions: TwinV2CanvasBoundaryRegion[];
  contentCanvasBounds: { x: number; y: number; w: number; h: number };
  status: 'LOCKED' | 'DRAFT';
};

export type GeneratedHostArtifact = {
  objectId: string;
  conceptId: string;
  visualBounds: { x: number; y: number; w: number; h: number };
  artifactType: 'INVENTED_BOTTOM_NAV' | 'INVENTED_TOP_HEADER' | 'INVENTED_ACCOUNT_CONTROL' | 'DEVICE_CHROME';
  reasonExcluded: string;
  status: 'EXCLUDED_FROM_CLIENT_BUILD';
};

export type HostShellContract = {
  hostHeaderComponent: string;
  hostBottomNavComponent: string;
  globalControls: string[];
  safeAreaRules: { topInsetNorm: number; bottomInsetNorm: number };
  pageMountPoint: string;
  clientCanvasInsets: { top: number; bottom: number; left: number; right: number };
  persistentBehavior: string;
  version: string;
  status: 'LOCKED';
};

export type OwnershipResolutionReceipt = {
  conceptId: string;
  hostOwnedCount: number;
  clientOwnedCount: number;
  sharedCount: number;
  excludedGeneratedArtifacts: string[];
  unresolved: string[];
  status: 'RESOLVED' | 'PARTIAL';
};

export type HostShellCompositePreview = {
  previewKind: 'PRODUCT_COMPOSITE';
  conceptId: string;
  originalConceptImageUrl: string | null;
  clientCanvasImageUrl: string | null;
  hostShellContractVersion: string;
  notes: string;
};

export type SanitizedConceptBoundaryResult = {
  conceptId: string;
  originalBlueprintId: string;
  sanitizedBlueprintId: string;
  sanitizedBlueprint: import('../p0vrTwinV22/types.js').ConceptBlueprint;
  generatedHostArtifacts: GeneratedHostArtifact[];
  ownershipReceipt: OwnershipResolutionReceipt;
  canvasBoundary: TwinV2CanvasBoundary;
  hostShellContract: HostShellContract;
  compositePreview: HostShellCompositePreview;
  originalConceptImagePreserved: boolean;
};
