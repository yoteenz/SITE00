import type { P0_VR_REPLICATION_4R2_BUILD } from './constants.js';

export type HeroCollisionFailureCode =
  | 'HERO_TEXT_COLLISION'
  | 'HERO_DUPLICATE_CONTENT'
  | 'HERO_UNEXPECTED_OVERLAP'
  | 'HERO_ZINDEX_CONFLICT'
  | 'HERO_CLIPPING'
  | 'HERO_WRONG_PARENT'
  | 'HERO_OBJECT_COLLAPSE'
  | 'HERO_ASSET_BOUNDS_MISMATCH';

export type HeroObjectId =
  | 'H01'
  | 'H02'
  | 'H03'
  | 'H04'
  | 'H05'
  | 'H06'
  | 'H07'
  | 'H08'
  | 'H09'
  | 'H10'
  | 'H11'
  | 'H12'
  | 'H13'
  | 'H14';

export type HeroObjectContract = {
  objectId: HeroObjectId;
  blueprintObjectId: string;
  role: string;
  parent: 'hero-root';
  authorityBounds: { x: number; y: number; width: number; height: number };
  domSelector: string;
  sourceFile: string;
  renderStrategy: 'DOM_TEXT' | 'DOM_BUTTON' | 'CSS_SHAPE' | 'IMG_CROP' | 'OVERLAY_GRAPHIC' | 'GRID';
  assetBinding: string | null;
  typographySpec: string | null;
  surfaceSpec: string | null;
  zIndex: number;
  overflowPolicy: 'VISIBLE' | 'HIDDEN' | 'CLIP' | 'MASK';
  status: 'BOUND' | 'UNRESOLVED';
};

export type HeroTextSourceTrace = {
  objectId: HeroObjectId;
  text: string;
  source: 'DOM_LITERAL' | 'AUTHORITY_IMAGE' | 'NONE';
  dynamicBinding: boolean;
  renderCount: number;
  lineCount: number;
  status: 'PASS' | 'HERO_DUPLICATE_CONTENT';
};

export type HeroCollisionPair = {
  objectA: HeroObjectId;
  objectB: HeroObjectId;
  failureCode: HeroCollisionFailureCode;
  notes: string;
};

export type HeroCollisionAudit = {
  pairsChecked: number;
  collisions: HeroCollisionPair[];
  passed: boolean;
};

export type HeroZLayerEntry = {
  layer: number;
  label: string;
  objectIds: HeroObjectId[];
};

export type HeroZLayerMap = {
  layers: HeroZLayerEntry[];
};

export type HeroAuthorityGeometry = {
  objectId: HeroObjectId;
  targetX: number;
  targetY: number;
  targetWidth: number;
  targetHeight: number;
  targetBaseline: number | null;
  targetLineCount: number;
  targetZ: number;
  targetParent: string;
};

export type HeroRenderedGeometry = {
  objectId: HeroObjectId;
  actualX: number | null;
  actualY: number | null;
  actualWidth: number | null;
  actualHeight: number | null;
  actualBaseline: number | null;
  actualLineCount: number | null;
  actualZ: number | null;
  actualParent: string | null;
};

export type HeroGeometryDelta = {
  objectId: HeroObjectId;
  deltaX: number | null;
  deltaY: number | null;
  deltaWidth: number | null;
  deltaHeight: number | null;
  baselineDelta: number | null;
  lineCountMatch: boolean;
  zMatch: boolean;
  parentMatch: boolean;
  status: 'WITHIN_TOLERANCE' | 'OUT_OF_TOLERANCE' | 'NOT_MEASURED';
};

export type HeroCorrectionPass = {
  passIndex: number;
  focus: 'PARENT_COLUMNS' | 'TEXT_CTA_OVERLAYS' | 'ASSETS_MICRO';
  collisionCount: number;
  duplicateTextCount: number;
  notes: string;
};

export type HeroSurgicalLockReport = {
  buildRef: typeof P0_VR_REPLICATION_4R2_BUILD;
  sessionId: string;
  objectCount: number;
  domCoveragePct: number;
  contracts: HeroObjectContract[];
  textTraces: HeroTextSourceTrace[];
  collisionAudit: HeroCollisionAudit;
  zLayerMap: HeroZLayerMap;
  authorityGeometry: HeroAuthorityGeometry[];
  geometryDeltas: HeroGeometryDelta[];
  correctionPasses: HeroCorrectionPass[];
  screenshotInScreen: boolean;
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  typedFailures: HeroCollisionFailureCode[];
  founderMessage: string | null;
};
