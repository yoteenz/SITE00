import type { P0_VR_TWIN_V23R1_BUILD, RENDER_PRIMITIVES } from './constants.js';

export type RenderPrimitive = (typeof RENDER_PRIMITIVES)[number];

export type TwinV2RenderPrimitivePolicy = {
  text: 'DOM';
  button: 'DOM';
  nav: 'DOM';
  metric: 'DOM';
  progress: 'DOM_CSS';
  status: 'DOM_CSS';
  divider: 'CSS';
  border: 'CSS';
  icon: 'SVG';
  simpleGraphic: 'SVG_CSS';
  photo: 'IMAGE_ASSET';
  illustration: 'IMAGE_ASSET';
  texture: 'IMAGE_ASSET';
};

export type ExecutableConceptObject = {
  objectId: string;
  parentId: string | null;
  sectionId: string;
  role: string;
  type: string;
  bounds: { x: number; y: number; w: number; h: number };
  renderPrimitive: RenderPrimitive;
  textContent: string | null;
  typography: string | null;
  surface: string | null;
  color: string | null;
  border: string | null;
  assetSlotId: string | null;
  functionBindingId: string | null;
  interaction: string | null;
  zIndex: number;
  status: 'READY' | 'UNBOUND';
};

export type BlueprintDepthAudit = {
  topLevelSectionCount: number;
  totalObjectCount: number;
  maxDepth: number;
  objectsPerSection: Record<string, number>;
  shallow: boolean;
};

export type ConceptObjectExecutionPlan = {
  objectId: string;
  renderPrimitive: RenderPrimitive;
  component: string;
  sourceFile: string;
  styleSource: 'blueprint' | 'package';
  assetSource: string | null;
  functionSource: string | null;
  status: 'PLANNED' | 'BOUND';
};

export type ConceptObjectDomBinding = {
  objectId: string;
  domSelector: string;
  componentName: string;
  sourceFile: string;
  renderPrimitive: RenderPrimitive;
  assetSlotId: string | null;
  functionBindingId: string | null;
  status: 'BOUND' | 'UNBOUND';
};

export type SourceTranslationReceipt = {
  buildRef: typeof P0_VR_TWIN_V23R1_BUILD;
  conceptId: string;
  packageId: string;
  blueprintId: string;
  sectionCount: number;
  objectCount: number;
  domObjectCount: number;
  svgObjectCount: number;
  cssGraphicCount: number;
  imageAssetCount: number;
  authorityCropCount: number;
  forbiddenRasterCount: number;
  unboundObjectCount: number;
  status: 'PASS' | 'FAIL';
};

export type TwinV2RasterAuditEntry = {
  source: string;
  bounds: string;
  role: string;
  blueprintObjectId: string | null;
  containsUi: boolean;
  allowed: boolean;
  reason: string;
};

export type TwinV2RasterAudit = {
  entries: TwinV2RasterAuditEntry[];
  fullAuthorityUsed: boolean;
  status: 'PASS' | 'FAIL';
};

export type DOMRealityReceipt = {
  selectableTextObjects: number;
  expectedTextObjects: number;
  interactiveControls: number;
  expectedControls: number;
  liveProgressPrimitive: boolean;
  liveMetricsPrimitive: boolean;
  liveActivityPrimitive: boolean;
  sectionRasterCount: number;
  status: 'PASS' | 'FAIL';
};

export type ConceptObjectFidelityReceipt = {
  objectId: string;
  targetBounds: string;
  renderedBounds: string;
  targetPrimitive: RenderPrimitive;
  renderedPrimitive: RenderPrimitive;
  geometryMatch: number | null;
  styleMatch: number | null;
  assetMatch: number | null;
  status: 'PENDING' | 'PARTIAL' | 'PASS';
};

export type SectionRenderStrategyReport = {
  section: string;
  renderStrategy: 'DOM' | 'CSS' | 'SVG' | 'RASTER_CROP' | 'FULL_REGION_IMAGE' | 'PLACEHOLDER' | 'OTHER';
  priorStrategy?: string;
};

export type DomFirstTranslationArtifacts = {
  policy: TwinV2RenderPrimitivePolicy;
  depthAudit: BlueprintDepthAudit;
  expandedObjects: ExecutableConceptObject[];
  executionPlan: ConceptObjectExecutionPlan[];
  domBindings: ConceptObjectDomBinding[];
  sourceTranslationReceipt: SourceTranslationReceipt;
  rasterAudit: TwinV2RasterAudit;
  domRealityReceipt: DOMRealityReceipt;
  objectFidelity: ConceptObjectFidelityReceipt[];
  sectionStrategies: SectionRenderStrategyReport[];
};
