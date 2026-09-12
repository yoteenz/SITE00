import type { P0_VR_REPLICATION_3D_BOUNDARY_BUILD } from './constants.js';

export type VisualSourceClassification =
  | 'PAGE_AUTHORITY'
  | 'SHELL_AUTHORITY'
  | 'REGION_ASSET'
  | 'TYPOGRAPHY_REFERENCE'
  | 'HERO_MEDIA'
  | 'ICON_ASSET'
  | 'PROCEDURAL_CSS'
  | 'UNKNOWN';

export type CoordinateSpaceOrigin = 'PAGE_ROOT' | 'VIEWPORT' | 'TWIN_CONTENT_ROOT' | 'INVALID_NESTED';

export type RenderBoundaryFailureCode =
  | 'INVALID_MOUNT_ROOT'
  | 'NESTED_PAGE_RENDER'
  | 'HERO_SLOT_MISBOUND'
  | 'INVALID_COORDINATE_SPACE'
  | 'PAGE_AUTHORITY_MISUSED_AS_REGION_ASSET';

export type TwinMountTrace = {
  sessionId: string;
  twinRootSelector: string;
  mountNodeSelector: string;
  shellRootSelector: string;
  contentRootSelector: string;
  mountInsideShellChrome: boolean;
  mountInsideHeroMediaSlot: boolean;
  clippingAncestorSummary: string;
};

export type RegionOutputKind =
  | 'STRUCTURED_DOM'
  | 'HERO_MEDIA_ASSET'
  | 'PAGE_LEVEL_RENDER_CONTENT'
  | 'LITERAL_SCREENSHOT_ASSET'
  | 'PROCEDURAL';

export type RegionTargetAssignmentTrace = {
  regionId: string;
  slotId: string | null;
  targetSelector: string;
  outputKind: RegionOutputKind;
  sourceClassification: VisualSourceClassification;
  allowed: boolean;
  failureCode: RenderBoundaryFailureCode | null;
  notes: string;
};

export type CoordinateSpaceTrace = {
  regionId: string;
  coordinateOrigin: CoordinateSpaceOrigin;
  normalizedAgainst: 'AUTHORITY_PAGE' | 'SHELL_BAND' | 'HERO_INNER' | 'UNKNOWN';
  valid: boolean;
};

export type SourceClassificationReceipt = {
  assetRef: string;
  classification: VisualSourceClassification;
  isFullPageScreenshot: boolean;
};

export type AssetBindingCompatibilityResult = {
  slotId: string;
  compatible: boolean;
  failureCode: RenderBoundaryFailureCode | null;
  message: string;
};

export type ReplicationRenderBoundaryVerdict = {
  CONTENT_ROOT_VALID: boolean;
  PAGE_NESTING_DETECTED: boolean;
  HERO_SLOT_MISBOUND: boolean;
  COORDINATE_SPACE_INVALID: boolean;
};

export type ReplicationRenderBoundaryReceipt = {
  buildRef: typeof P0_VR_REPLICATION_3D_BOUNDARY_BUILD;
  sessionId: string;
  twinMount: TwinMountTrace;
  regionAssignments: RegionTargetAssignmentTrace[];
  coordinateSpaces: CoordinateSpaceTrace[];
  sourceClassifications: SourceClassificationReceipt[];
  bindingChecks: AssetBindingCompatibilityResult[];
  verdict: ReplicationRenderBoundaryVerdict;
  typedFailures: RenderBoundaryFailureCode[];
  founderMessage: string | null;
  status: 'PASS' | 'FAIL';
};
