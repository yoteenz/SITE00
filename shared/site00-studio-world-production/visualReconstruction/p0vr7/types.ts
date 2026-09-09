/**
 * P0.VR.7 — Reference fidelity contract + screenshot design authority engine.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export const P0_VR_7_LINEAGE = 'P0.VR.7' as const;

export const AUTHORITY_MODES = [
  'DESIGN_AUTHORITY',
  'INSPIRATION',
  'CONTENT_REFERENCE',
  'ASSET_REFERENCE',
] as const;
export type AuthorityMode = (typeof AUTHORITY_MODES)[number];

export const FIDELITY_MODES = ['EXACT', 'HIGH', 'INTERPRETIVE'] as const;
export type FidelityMode = (typeof FIDELITY_MODES)[number];

export const FIDELITY_CONTRACT_STATUSES = [
  'REFERENCE_UPLOADED',
  'REFERENCE_ANALYZING',
  'REFERENCE_DECOMPOSED',
  'INTERPRETATION_REVIEW',
  'REFERENCE_CONFIRMED',
  'IMPLEMENTING',
  'RENDER_QA_REQUIRED',
  'VISUAL_DRIFT_FOUND',
  'CORRECTING',
  'HIGH_MATCH',
  'FOUNDER_REVIEW',
  'VERIFIED',
] as const;
export type FidelityContractStatus = (typeof FIDELITY_CONTRACT_STATUSES)[number];

export const REFERENCE_FIDELITY_STATUSES = [
  'NOT_EVALUATED',
  'MAJOR_DRIFT',
  'PARTIAL_MATCH',
  'HIGH_MATCH',
  'VERIFIED',
] as const;
export type ReferenceFidelityStatus = (typeof REFERENCE_FIDELITY_STATUSES)[number];

export const VIEWPORT_AUTHORITY_STATUSES = ['EXACT', 'INFERRED'] as const;
export type ViewportAuthorityStatus = (typeof VIEWPORT_AUTHORITY_STATUSES)[number];

export const REFERENCE_VISUAL_DRIFT_TYPES = [
  'SHELL_DRIFT',
  'GEOMETRY_DRIFT',
  'TYPOGRAPHY_DRIFT',
  'SPACING_DRIFT',
  'ASSET_DRIFT',
  'COLOR_DRIFT',
  'COMPONENT_DRIFT',
  'DENSITY_DRIFT',
  'RESPONSIVE_DRIFT',
  'STATE_DRIFT',
] as const;
export type ReferenceVisualDriftType = (typeof REFERENCE_VISUAL_DRIFT_TYPES)[number];

export const QA_REGIONS = [
  'HEADER',
  'HERO',
  'NAV',
  'MAIN_CONTENT',
  'FOOTER',
  'BOTTOM_NAV',
] as const;
export type QaRegion = (typeof QA_REGIONS)[number];

export const QA_DIMENSIONS = [
  'GLOBAL_GEOMETRY',
  'COMPONENT_POSITION',
  'COMPONENT_SIZE',
  'TYPOGRAPHY_SCALE',
  'LINE_HEIGHT',
  'SPACING',
  'COLOR',
  'BORDER',
  'RADIUS',
  'ASSET_POSITION',
  'ASSET_SCALE',
  'VISUAL_WEIGHT',
  'DENSITY',
] as const;
export type QaDimension = (typeof QA_DIMENSIONS)[number];

export const LIVE_UI_ROLES = [
  'HEADER',
  'PROJECT_SWITCHER',
  'PAGE_TITLE',
  'HERO_OBJECT',
  'TAB_BAR',
  'VIEWPORT_CONTROL',
  'STEPPER',
  'UPLOAD_CARD',
  'CTA',
  'ACTIVITY_ROW',
  'BOTTOM_NAV',
  'BUTTON',
  'INPUT',
  'STATUS_LABEL',
  'FORM_CONTROL',
] as const;
export type LiveUiSemanticRole = (typeof LIVE_UI_ROLES)[number];

export const TYPOGRAPHY_ROLES = [
  'DISPLAY',
  'SECTION_HEADING',
  'LABEL',
  'BODY',
  'META',
  'BUTTON',
  'STATUS',
] as const;
export type TypographyRole = (typeof TYPOGRAPHY_ROLES)[number];

export const ASSET_MANIFEST_TYPES = [
  'HERO_ORB',
  'BACKGROUND_IMAGE',
  'PROJECT_CARD_VISUAL',
  'NAV_ICON',
  'DECORATIVE_OBJECT',
  'PHOTO',
  'LOGO_MARK',
  'ICON',
  'GRAPHIC',
] as const;
export type AssetManifestType = (typeof ASSET_MANIFEST_TYPES)[number];

export type RegionClassification = 'LIVE_DOM_UI' | 'IMAGE_LIKE_ASSET';

export type ReferenceGeometryProfile = {
  referenceWidth: number;
  referenceHeight: number;
  contentWidth: number;
  contentX: number;
  contentY: number;
  topMargin: number;
  bottomMargin: number;
  leftMargin: number;
  rightMargin: number;
  headerHeight: number;
  heroHeight: number;
  primaryNavY: number;
  contentStartY: number;
  footerY: number;
  bottomNavHeight: number;
  normalized: {
    contentWidthRatio: number;
    headerHeightRatio: number;
    heroHeightRatio: number;
    bottomNavHeightRatio: number;
  };
};

export type ReferenceComponentGeometry = {
  componentId: string;
  semanticRole: LiveUiSemanticRole | string;
  x: number;
  y: number;
  width: number;
  height: number;
  normalizedX: number;
  normalizedY: number;
  normalizedWidth: number;
  normalizedHeight: number;
  alignment: 'LEFT' | 'CENTER' | 'RIGHT' | 'STRETCH';
  parentId: string | null;
  zOrder: number;
  classification: RegionClassification;
};

export type ReferenceTypographyProfile = {
  role: TypographyRole;
  fontFamilyCandidate: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'UPPERCASE' | 'NONE' | 'CAPITALIZE';
  alignment: 'LEFT' | 'CENTER' | 'RIGHT';
  maxWidth: number | null;
};

export type ReferenceSpacingProfile = {
  sectionGap: number;
  cardGap: number;
  internalPadding: number;
  horizontalPadding: number;
  verticalPadding: number;
  controlGap: number;
  tabGap: number;
  gridGap: number;
};

export type ReferenceVisualMaterialProfile = {
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  borderWidth: number;
  radius: number;
  shadow: string | null;
  opacity: number;
  accentColor: string;
  dividerStyle: string;
};

export type ReferenceAssetManifestEntry = {
  assetSlotId: string;
  semanticRole: string;
  assetType: AssetManifestType;
  boundingBox: { x: number; y: number; width: number; height: number };
  crop: { x: number; y: number; width: number; height: number } | null;
  transparencyExpected: boolean;
  sourceReference: string;
  targetBinding: string | null;
  status: 'DETECTED' | 'CONFIRMED' | 'BOUND' | 'PENDING';
};

export type DesignReferenceDecomposition = {
  decompositionId: string;
  contractId: string;
  globalGeometry: ReferenceGeometryProfile;
  components: ReferenceComponentGeometry[];
  typography: ReferenceTypographyProfile[];
  spacing: ReferenceSpacingProfile;
  materials: ReferenceVisualMaterialProfile;
  assetManifest: ReferenceAssetManifestEntry[];
  liveUiRegionCount: number;
  imageAssetRegionCount: number;
  analyzedAt: string;
};

export type ReferenceImplementationPlan = {
  planId: string;
  contractId: string;
  referenceAuthority: FidelityMode;
  regions: string[];
  assetsDetected: number;
  liveUiRegions: number;
  currentVisualsToReplace: number;
  functionalComponentsToPreserve: number;
  implementationOrder: string[];
  createdAt: string;
};

export type ReferenceViewportAuthority = {
  viewport: DesignViewportClass;
  referenceId: string;
  authorityStatus: ViewportAuthorityStatus;
  geometryProfile: ReferenceGeometryProfile;
  assetManifest: ReferenceAssetManifestEntry[];
};

export type ReferenceVisualDriftFinding = {
  driftType: ReferenceVisualDriftType;
  region: QaRegion | string;
  componentId?: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type VisualCorrectionPlan = {
  planId: string;
  contractId: string;
  findings: ReferenceVisualDriftFinding[];
  targets: Array<{
    region: string;
    corrections: string[];
  }>;
  createdAt: string;
};

export type RegionQaScore = {
  region: QaRegion;
  dimensions: Partial<Record<QaDimension, ReferenceFidelityStatus>>;
  overall: ReferenceFidelityStatus;
};

export type DesignReferenceScreenshotQA = {
  qaId: string;
  contractId: string;
  viewport: DesignViewportClass;
  route: string;
  executed: boolean;
  fidelityStatus: ReferenceFidelityStatus;
  numericScore: number | null;
  regionScores: RegionQaScore[];
  driftFindings: ReferenceVisualDriftFinding[];
  iterationCount: number;
  capturedAt: string | null;
  comparedAt: string | null;
};

export type DesignReferenceFidelityContract = {
  contractId: string;
  referenceId: string;
  projectId: string;
  pageId: string;
  route: string;
  viewport: DesignViewportClass;
  authorityMode: AuthorityMode;
  fidelityMode: FidelityMode;
  preserveFunction: boolean;
  preserveData: boolean;
  preserveRouting: boolean;
  preservePermissions: boolean;
  allowVisualRebuild: boolean;
  allowLayoutReplacement: boolean;
  allowCurrentVisualProtection: boolean;
  requireGeometryAnalysis: boolean;
  requireAssetAnalysis: boolean;
  requireTypographyAnalysis: boolean;
  requireScreenshotQA: boolean;
  requireFounderApproval: boolean;
  minimumFidelityScore: number | null;
  systemFidelityInstruction: string;
  founderInstructionAdditive: string | null;
  status: FidelityContractStatus;
  decomposition: DesignReferenceDecomposition | null;
  implementationPlan: ReferenceImplementationPlan | null;
  viewportAuthorities: ReferenceViewportAuthority[];
  latestScreenshotQa: DesignReferenceScreenshotQA | null;
  latestFidelityStatus: ReferenceFidelityStatus;
  driftFindings: ReferenceVisualDriftFinding[];
  correctionPlan: VisualCorrectionPlan | null;
  iterationCount: number;
  founderConfirmedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExecutionFidelityHandoff = {
  handoffId: string;
  contractId: string;
  systemInstruction: string;
  founderInstruction: string | null;
  geometryProfile: ReferenceGeometryProfile;
  assetManifest: ReferenceAssetManifestEntry[];
  implementationPlan: ReferenceImplementationPlan;
  qaRequirements: {
    requireScreenshotQA: boolean;
    regions: QaRegion[];
    dimensions: QaDimension[];
  };
  preserveFlags: {
    function: boolean;
    data: boolean;
    routing: boolean;
    permissions: boolean;
  };
  rebuildFlags: {
    visual: boolean;
    layout: boolean;
    protectCurrentVisuals: boolean;
  };
};
