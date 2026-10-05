import type { P0_VR_REPLICATION_4_BUILD } from './constants.js';

export type ForensicObjectType =
  | 'text'
  | 'image'
  | 'graphic'
  | 'icon'
  | 'line'
  | 'divider'
  | 'button'
  | 'nav-item'
  | 'bar'
  | 'badge'
  | 'container';

export type ForensicBlueprintObject = {
  objectId: string;
  label: string;
  parentSection: string;
  objectType: ForensicObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string | null;
  fontFamily: string | null;
  fontSize: number | null;
  fontWeight: number | null;
  lineHeight: number | null;
  letterSpacing: number | null;
  textTransform: string | null;
  border: string | null;
  background: string | null;
  assetRole: string | null;
  zIndex: number | null;
  notes: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  required: boolean;
};

export type ForensicColorSwatch = { token: string; hex: string; role: string };
export type ForensicTypographyStyle = {
  token: string;
  fontFamily: string;
  fontSizePx: number;
  fontWeight: number;
  textCase: string;
  lineHeight: number;
  letterSpacingPx: number;
};
export type ForensicLineSpec = { token: string; thicknessPx: number; colorHex: string; usage: string };

export type ForensicAuthorityBlueprint = {
  authorityId: string;
  pageId: string;
  viewport: string;
  sourceAuthorityAsset: string;
  sourceBlueprintAsset: string;
  objects: ForensicBlueprintObject[];
  colorPalette: ForensicColorSwatch[];
  typographyKey: ForensicTypographyStyle[];
  lineSpecs: ForensicLineSpec[];
  spacingSpecs: { token: string; valuePx: number; notes: string }[];
  contentViewport: { width: number; height: number };
  createdAt: string;
};

export type BlueprintDomBindingStatus = 'BOUND' | 'UNRESOLVED' | 'BLUEPRINT_OBJECT_UNRESOLVED';

export type BlueprintDomBinding = {
  objectId: string;
  domSelector: string;
  component: string;
  sourceFile: string;
  renderStrategy: 'DOM_TEXT' | 'DOM_GRAPHIC' | 'CSS_SHAPE' | 'IMG' | 'SVG' | 'HOST_COMPONENT';
  dynamicBinding: boolean;
  status: BlueprintDomBindingStatus;
};

export type BlueprintAssetBindingStatus = 'RESOLVED' | 'UNRESOLVED' | 'AUTHORITY_CROP' | 'PROJECT_ASSET';

export type BlueprintAssetBinding = {
  objectId: string;
  assetRole: string;
  expectedBounds: { x: number; y: number; width: number; height: number };
  sourceAsset: string | null;
  sourceStrategy: 'PROJECT' | 'LIBRARY' | 'AUTHORITY_CROP' | 'RECONSTRUCT' | 'NONE';
  crop: string | null;
  objectFit: string | null;
  objectPosition: string | null;
  status: BlueprintAssetBindingStatus;
};

export type BlueprintTranslationReceipt = {
  objectId: string;
  parsed: boolean;
  bound: boolean;
  sourceGenerated: boolean;
  assetResolved: boolean;
  rendered: boolean;
  geometryMatched: boolean;
  typographyMatched: boolean;
  colorMatched: boolean;
  status: 'PASS' | 'PARTIAL' | 'BLUEPRINT_OBJECT_UNRESOLVED' | 'FAIL';
  notes: string;
};

export type ObjectGeometryDelta = {
  objectId: string;
  targetX: number;
  targetY: number;
  targetWidth: number;
  targetHeight: number;
  actualX: number | null;
  actualY: number | null;
  actualWidth: number | null;
  actualHeight: number | null;
  deltaX: number | null;
  deltaY: number | null;
  deltaWidth: number | null;
  deltaHeight: number | null;
  status: 'WITHIN_TOLERANCE' | 'OUT_OF_TOLERANCE' | 'NOT_MEASURED';
};

export type ForensicConvergencePass = {
  passIndex: number;
  measuredObjectCount: number;
  outOfToleranceCount: number;
  cssPatchKeys: string[];
  notes: string;
};

export type ForensicBlueprintExecutionReport = {
  reportId: string;
  sessionId: string;
  buildRef: typeof P0_VR_REPLICATION_4_BUILD;
  blueprint: ForensicAuthorityBlueprint;
  domBindings: BlueprintDomBinding[];
  assetBindings: BlueprintAssetBinding[];
  translationReceipts: BlueprintTranslationReceipt[];
  geometryDeltas: ObjectGeometryDelta[];
  convergencePasses: ForensicConvergencePass[];
  mappedObjects: number;
  totalObjects: number;
  requiredCoverage: number;
  geometryMatchPct: number;
  typographyMatchPct: number;
  assetMatchPct: number;
  colorMatchPct: number;
  invalidReplicationRoot: boolean;
  wholePageScreenshotCheat: boolean;
  status: 'PASS' | 'PARTIAL' | 'FORENSIC_BLUEPRINT_EXECUTION_FAILED';
  failureStage: 'PARSING' | 'BINDING' | 'SOURCE' | 'ASSET' | 'TYPOGRAPHY' | 'GEOMETRY' | 'RENDER' | null;
  founderMessage: string | null;
  createdAt: string;
};
