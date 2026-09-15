import type { GROK_JOB_STAGES } from './constants.js';
import type { GrokBenchmarkInputReceipt, GrokDesignBenchProviderFailure } from './modelContract.js';

export type GrokDesignBenchStage = (typeof GROK_JOB_STAGES)[number];

export type GrokDesignBenchMime = 'image/png' | 'image/jpeg' | 'image/webp';

export interface GrokDesignBenchReferenceAuthority {
  runId: string;
  imageUrl: string;
  storageRef: string;
  sha256: string;
  width: number;
  height: number;
  mime: GrokDesignBenchMime;
  filename: string;
  byteLength: number;
  uploadedAt: string;
  immutableForRun: true;
}

export interface GrokDesignBenchTiming {
  queuedAt: string | null;
  startedAt: string | null;
  providerStartedAt: string | null;
  providerCompletedAt: string | null;
  completedAt: string | null;
  queueDurationMs: number | null;
  modelDurationMs: number | null;
  postProcessingDurationMs: number | null;
  totalDurationMs: number | null;
  uploadDurationMs?: number | null;
}

export interface GrokVisualPreviewLayer {
  id: string;
  type: 'rect' | 'text' | 'image' | 'line' | 'ellipse' | 'group';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  opacity?: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  imageRole?: string;
  zIndex?: number;
}

export interface VisualInterfacePreview {
  kind: 'FIGMA_STYLE_ARTBOARD';
  frameWidth: number;
  frameHeight: number;
  background: string;
  layers: GrokVisualPreviewLayer[];
  notes: string;
}

export interface PageFrameSpec {
  sourceViewportWidth: number;
  sourceViewportHeight: number;
  designFrameWidth: number;
  designFrameHeight: number;
  pageBackground: string;
  contentBounds: { x: number; y: number; width: number; height: number };
  outerMargins: { top: number; right: number; bottom: number; left: number };
  columnGrid: { columns: number; gutter: number; margin: number };
  gutters: number;
  majorSectionPositions: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface SectionTreeNode {
  id: string;
  name: string;
  kind: 'PAGE' | 'SECTION' | 'GROUP' | 'COMPONENT';
  children: SectionTreeNode[];
}

export interface ComponentTreeNode {
  componentId: string;
  name: string;
  parentId: string | null;
  role: string;
  siblingOrder: number;
  x: number;
  y: number;
  width: number;
  height: number;
  normalizedGeometry: { x: number; y: number; width: number; height: number };
  layoutBehavior: string;
  alignment: string;
  visualPriority: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'MUTED';
}

export interface LayoutGeometrySpec {
  sectionDimensions: Array<{ id: string; width: number; height: number; relativeWidth: number; relativeHeight: number }>;
  rowColumnRelationships: string[];
  gaps: Record<string, number>;
  padding: Record<string, number>;
  alignmentAnchors: string[];
  nesting: string[];
  repeatedDimensions: string[];
  overlaps: string[];
  positioningBehavior: string;
}

export interface TypographyToken {
  id: string;
  role: string;
  fontCategory: string;
  size: number;
  weight: number | string;
  lineHeight: number | string;
  tracking: string;
  casing: string;
  alignment: string;
  lineCount: number;
  wrapBehavior: string;
}

export interface TypographySystem {
  hierarchy: TypographyToken[];
  notes: string;
}

export interface ColorSystem {
  pageBackground: string;
  surfaceColors: string[];
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  accents: string[];
  statusColors: string[];
  bordersDividers: string[];
  sampled: boolean;
}

export interface SpacingSystem {
  outerMargin: number;
  sectionGap: number;
  panelPadding: number;
  componentGaps: number;
  inlineGaps: number;
  metadataSpacing: number;
  denseRegions: string[];
  openRegions: string[];
}

export interface BorderRadiusSurfaceSystem {
  borderWidths: number[];
  borderColors: string[];
  radii: number[];
  surfaceHierarchy: string[];
  fills: string[];
  shadows: string[];
  separators: string[];
  selectedActiveSurfaces: string[];
}

export interface AssetPlacement {
  assetId: string;
  assetRole: string;
  componentAssociation: string;
  targetBounds: { x: number; y: number; width: number; height: number };
  aspectRatio: string;
  crop: string;
  focalPosition: string;
  objectFit: string;
  framing: string;
}

export interface ControlStateEntry {
  controlId: string;
  name: string;
  states: Array<
    'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'SELECTED' | 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'NEUTRAL'
  >;
  visibleSupport: string;
}

export interface VisualHierarchyMap {
  firstVisualFocus: string;
  secondVisualFocus: string;
  tertiaryInformation: string;
  dominantRegions: string[];
  subordinateRegions: string[];
  highContrastAnchors: string[];
  visualWeightRelationships: string[];
}

export interface GrokComposerImplementationHandoff {
  title: string;
  summary: string;
  buildOrder: string[];
  componentImplementationNotes: string[];
  layoutNotes: string[];
  typographyNotes: string[];
  colorNotes: string[];
  assetNotes: string[];
  stateNotes: string[];
  doNotReinterpret: string[];
  acceptanceChecks: string[];
}

export interface DoNotChangeRules {
  rules: string[];
}

export interface FigmaStyleInterfaceTranslationPackage {
  visualInterfacePreview: VisualInterfacePreview;
  pageFrameSpec: PageFrameSpec;
  sectionTree: SectionTreeNode;
  componentTree: ComponentTreeNode[];
  layoutGeometrySpec: LayoutGeometrySpec;
  typographySystem: TypographySystem;
  colorSystem: ColorSystem;
  spacingSystem: SpacingSystem;
  borderRadiusSurfaceSystem: BorderRadiusSurfaceSystem;
  assetPlacementMap: AssetPlacement[];
  controlStateSystem: ControlStateEntry[];
  visualHierarchyMap: VisualHierarchyMap;
  implementationHandoff: GrokComposerImplementationHandoff;
  doNotChangeRules: DoNotChangeRules;
}

export interface GrokDesignBenchCost {
  reported: boolean;
  currency: 'USD' | null;
  amount: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  note: string;
}

export interface GrokDesignBenchRun {
  runId: string;
  projectId: string;
  model: 'GROK';
  provider: 'xai';
  providerLabel: 'xAI';
  providerModel: 'grok-4.6';
  modelId: 'grok-4.6';
  webSearchEnabled: false;
  stage: GrokDesignBenchStage;
  stageLabel: string;
  progressPercent: number;
  etaApproximate: boolean;
  estimatedRemainingMs: number | null;
  error: string | null;
  reference: GrokDesignBenchReferenceAuthority | null;
  package: FigmaStyleInterfaceTranslationPackage | null;
  timing: GrokDesignBenchTiming;
  cost: GrokDesignBenchCost;
  inputReceipt: GrokBenchmarkInputReceipt | null;
  providerFailure: GrokDesignBenchProviderFailure | null;
  composerInvoked: false;
  otherModelOutputAccessed: false;
  testBDataRead: false;
  lastStateChangeAt?: string | null;
  providerRequestStatus?: 'NOT_STARTED' | 'IN_FLIGHT' | 'RETURNED' | 'TIMEOUT' | 'CANCELLED' | 'FAILED';
  cancelStatus?: null | 'CANCEL_REQUESTED' | 'CANCELLED';
  etaKind?: 'COUNTDOWN' | 'TAKING_LONGER' | 'POSSIBLE_STALL';
  stall?: {
    stalled: boolean;
    stalledStage: string | null;
    lastStateChange: string | null;
    providerRequestStatus: string;
  } | null;
  outputBytes?: number | null;
  requestInputBytes?: number | null;
  responseId?: string | null;
  finishStatus?: string | null;
  maxOutputTokens?: number | null;
  responseTruncated?: boolean;
}

export interface GrokDesignBenchIsolationContract {
  inheritsTwinV3: false;
  inheritsTwinV4: false;
  inheritsTestB: false;
  inheritsSolOutput: false;
  composerInvoked: false;
  alternateProviderFallback: false;
}

export type GrokDesignBenchResultTab =
  | 'VISUAL_DESIGN'
  | 'FIGMA_SPEC'
  | 'COMPONENTS'
  | 'TOKENS'
  | 'ASSETS'
  | 'HIERARCHY'
  | 'IMPLEMENTATION_HANDOFF'
  | 'RUN_METRICS';
