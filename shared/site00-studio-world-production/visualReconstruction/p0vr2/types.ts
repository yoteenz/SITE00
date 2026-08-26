/**
 * P0.VR.2 — Master Design Reconstruction Workspace types.
 */

import type { VisualReferenceScope } from '../p0vr1d7/types.js';
import type { ScreenImplementationSpec } from '../p0vr1d1/types.js';
import type { PageVisualDecomposition } from '../p0vr1d/types.js';

export const CANONICAL_REFERENCE_STATUSES = [
  'DRAFT',
  'ACTIVE_CANONICAL',
  'SUPERSEDED',
  'HISTORICAL',
] as const;

export type CanonicalReferenceStatus = (typeof CANONICAL_REFERENCE_STATUSES)[number];

export const VIEWPORT_CLASSES = ['mobile', 'tablet', 'desktop', 'ultrawide'] as const;
export type DesignViewportClass = (typeof VIEWPORT_CLASSES)[number];

export const SITE00_ROUTE_CLASSIFICATIONS = [
  'CUSTOMER_FACING',
  'CLIENT_WORKFLOW',
  'FOUNDER_WORKSPACE',
  'HOST_INTERNAL',
  'SYSTEM_INTERNAL',
  'DEV_ONLY',
  'DEPRECATED',
] as const;
export type Site00RouteClassification = (typeof SITE00_ROUTE_CLASSIFICATIONS)[number];

export const DESIGN_RECORD_KINDS = [
  'ROUTE',
  'INTERACTION_STATE',
  'SITE00_REQUIRED_MISSING_ROUTE',
  'SITE00_IMPLIED_REQUIRED_ROUTE',
] as const;
export type DesignRecordKind = (typeof DESIGN_RECORD_KINDS)[number];

export const ROUTE_FAMILIES = [
  'ORIGIN',
  'IDENTITY',
  'BUILDER',
  'SYSTEM',
  'BLUEPRINT',
  'ASSET_VAULT',
  'ACCOUNT',
  'INFORMATION',
  'WAITING_ROOM',
  'EVOLVE',
  'CONTROL',
  'OTHER',
] as const;
export type RouteFamily = (typeof ROUTE_FAMILIES)[number];

export const DESIGN_PAGE_PRIORITIES = ['CRITICAL', 'PRIMARY', 'SECONDARY', 'SUPPORTING'] as const;
export type DesignPagePriority = (typeof DESIGN_PAGE_PRIORITIES)[number];

export const DEPENDENCY_CLOSURE_STATUSES = [
  'COMPLETE',
  'INCOMPLETE',
  'BROKEN',
  'MISSING_ROUTE',
  'ORPHANED',
] as const;
export type DependencyClosureStatus = (typeof DEPENDENCY_CLOSURE_STATUSES)[number];

export const REFERENCE_QUALITY_LABELS = [
  'CANONICAL_GOOD',
  'USABLE',
  'PARTIAL',
  'LOW_RESOLUTION',
  'OUTDATED',
  'WRONG_SHELL',
  'WRONG_VIEWPORT',
  'SHOULD_REPLACE',
  'MISSING',
] as const;
export type ReferenceQualityLabel = (typeof REFERENCE_QUALITY_LABELS)[number];

export const IMPLEMENTATION_COVERAGE_STATUSES = [
  'IMPLEMENTED',
  'PARTIAL',
  'BROKEN',
  'MISSING',
  'UNKNOWN',
] as const;
export type ImplementationCoverageStatus = (typeof IMPLEMENTATION_COVERAGE_STATUSES)[number];

export const RECONSTRUCTION_PASS_STATES = [
  'NOT_STARTED',
  'DECOMPOSED',
  'READY_TO_REBUILD',
  'REBUILDING',
  'NEEDS_CORRECTION',
  'FOUNDER_REVIEW',
  'VISUAL_PASS',
  'BLOCKED',
] as const;

export type ReconstructionPassState = (typeof RECONSTRUCTION_PASS_STATES)[number];

export const IMPLEMENTATION_MATCH_STATUSES = [
  'NOT_STARTED',
  'NEEDS_MATCH',
  'MATCHED',
  'STALE_AGAINST_NEW_REFERENCE',
  'BLOCKED',
] as const;

export type ImplementationMatchStatus = (typeof IMPLEMENTATION_MATCH_STATUSES)[number];

export const FOUNDER_VISUAL_JUDGMENTS = ['MATCHES', 'CLOSE', 'NOT_RIGHT', 'REBUILD_AGAIN'] as const;
export type FounderVisualJudgment = (typeof FOUNDER_VISUAL_JUDGMENTS)[number];

export const REFERENCE_ASSET_REGION_KINDS = [
  'DOM_UI',
  'TYPOGRAPHIC',
  'EXISTING_IMAGE_ASSET',
  'GENERATED_IMAGE_ASSET',
  'SVG_ICON',
  'MATERIAL_TEXTURE',
] as const;

export type ReferenceAssetRegionKind = (typeof REFERENCE_ASSET_REGION_KINDS)[number];

export type CanonicalVisualReference = {
  referenceId: string;
  projectId: string;
  screenId: string;
  route: string;
  viewportClass: DesignViewportClass;
  viewportWidth: number;
  viewportHeight: number;
  scope: VisualReferenceScope | 'ICON';
  scopeTargetId: string;
  assetId: string;
  storagePath: string;
  version: number;
  status: CanonicalReferenceStatus;
  createdAt: string;
  createdBy: string;
  supersedes: string | null;
  notes?: string;
};

export type MobileVisualReferenceAuthority = CanonicalVisualReference & { viewportClass: 'mobile' };
export type DesktopVisualReferenceAuthority = CanonicalVisualReference & { viewportClass: 'desktop' };

export type FunctionPreservingVisualRebuildContract = {
  preserveRoutes: boolean;
  preserveData: boolean;
  preserveState: boolean;
  preserveActions: boolean;
  preserveAccessibility: boolean;
  preserveBusinessLogic: boolean;
  allowShellReplacement: boolean;
  allowLayoutReplacement: boolean;
  allowCSSReplacement: boolean;
  allowSVGGeometryReplacement: boolean;
  allowAssetReplacement: boolean;
};

export type VisualReconstructionComposerBrief = {
  briefId: string;
  projectId: string;
  screenId: string;
  route: string;
  viewportClass: DesignViewportClass;
  viewportWidth: number;
  viewportHeight: number;
  scope: VisualReferenceScope | 'ICON';
  referenceId: string;
  referenceStoragePath: string;
  referenceImageUrl: string;
  targetDomRoots: string[];
  preservedBehaviors: string[];
  replaceableVisualRegions: string[];
  assetDependencies: string[];
  qaThresholds: { structural: number; visual: number; pixel: number };
  preservationContract: FunctionPreservingVisualRebuildContract;
  visualReplacementContract: FunctionPreservingVisualRebuildContract;
  coreRule: 'REFERENCE_IS_DESIGN_AUTHORITY';
  parentGeometryFirst: true;
  textDescriptionIsPrimaryAuthority: false;
  actualReferenceRequired: true;
  generatedAt: string;
};

export type VisualImplementationCanon = {
  canonId: string;
  projectId: string;
  screenId: string;
  route: string;
  viewportClass: DesignViewportClass;
  referenceId: string;
  referenceVersion: number;
  implementationVersion: string;
  visualScore: number;
  renderSnapshotPath: string | null;
  approvalDate: string;
  founderJudgment: FounderVisualJudgment;
  status: 'ACTIVE' | 'STALE_AGAINST_NEW_REFERENCE' | 'SUPERSEDED';
};

export type VisualReconstructionRun = {
  runId: string;
  projectId: string;
  screenId: string;
  route: string;
  viewportClass: DesignViewportClass;
  referenceId: string;
  passState: ReconstructionPassState;
  iteration: number;
  overallScore: number | null;
  shellScore: number | null;
  startedAt: string;
  completedAt: string | null;
  composerBriefId: string;
  patchesApplied: string[];
  assetsChanged: string[];
  founderJudgment: FounderVisualJudgment | null;
};

export type DesignScreenDefinition = {
  screenId: string;
  displayName: string;
  routePattern: string;
  scopeTargetId: string;
  supportsIconMode?: boolean;
  sharedComponentPaths?: string[];
  /** P0.VR.3 — absolute host route (no :projectSlug substitution) */
  absoluteRoute?: boolean;
  routeFamily?: RouteFamily;
  classification?: Site00RouteClassification;
  recordKind?: DesignRecordKind;
  priority?: DesignPagePriority;
  parentScreenId?: string;
  componentName?: string;
  sourceEvidence?: string[];
  dependencyClosure?: DependencyClosureStatus;
  backgroundAssetId?: string | null;
  backgroundStatus?: 'LOCKED' | 'MISSING' | 'DRAFT' | null;
  showInDefaultSelector?: boolean;
  supportsUltrawide?: boolean;
};

export type DesignViewportMatrixCell = {
  referenceStatus: 'ACTIVE' | 'MISSING' | 'DRAFT';
  referenceVersion: number | null;
  referenceQuality?: ReferenceQualityLabel;
  implementationStatus: ImplementationMatchStatus;
  implementationCoverage?: ImplementationCoverageStatus;
};

export type DesignScreenMatrixRow = {
  screenId: string;
  displayName: string;
  route: string;
  routeFamily?: RouteFamily;
  classification?: Site00RouteClassification;
  recordKind?: DesignRecordKind;
  mobile: DesignViewportMatrixCell;
  tablet: DesignViewportMatrixCell;
  desktop: DesignViewportMatrixCell;
  ultrawide?: DesignViewportMatrixCell;
};

export type VisualReferenceAssetResolution = {
  regionId: string;
  kind: ReferenceAssetRegionKind;
  resolution: 'EXACT_EXISTING' | 'APPROVED_PIPELINE' | 'REFERENCE_CROP' | 'FAL_IMAGE_REFERENCE' | 'BLOCKED';
  assetPath: string | null;
  falAllowed: boolean;
  textOnlyBlocked: boolean;
};

export type SharedComponentImpactReport = {
  componentPath: string;
  affectedRoutes: string[];
  recommendation: 'PATCH_GLOBALLY' | 'SCOPED_VARIANT' | 'BLOCK';
  message: string;
};

export type StaleVisualLockRecord = {
  lockId: string;
  regionId: string;
  previousStatus: string;
  invalidationReason: 'STALE_AFTER_REFERENCE_CHANGE' | 'STALE_AFTER_SHELL_REBUILD';
  invalidatedAt: string;
};

export type DesignWorkspaceSelection = {
  projectId: string;
  screenId: string;
  route: string;
  viewportClass: DesignViewportClass;
  referenceId: string | null;
};

export type ScopedDesignImplementationBundle = {
  reference: CanonicalVisualReference;
  decomposition: PageVisualDecomposition | null;
  implementationSpec: ScreenImplementationSpec | null;
  composerBrief: VisualReconstructionComposerBrief;
  run: VisualReconstructionRun;
};

export type P0VR2FailureCode =
  | 'FAIL_CANONICAL_REFERENCE_MISSING'
  | 'FAIL_REFERENCE_SCOPE_UNKNOWN'
  | 'FAIL_REFERENCE_NOT_PASSED_TO_RECONSTRUCTION'
  | 'FAIL_TEXT_DESCRIPTION_OVERRIDES_REFERENCE'
  | 'FAIL_INCORRECT_VISUAL_SHELL_PROTECTED'
  | 'FAIL_FUNCTIONAL_BEHAVIOR_MUTATED'
  | 'FAIL_PARENT_GEOMETRY_NOT_FIXED_FIRST'
  | 'FAIL_STALE_LOCK_BLOCKS_REBUILD'
  | 'FAIL_REFERENCE_ASSET_NOT_RESOLVED'
  | 'FAIL_FAL_TEXT_ONLY_WITH_REFERENCE_AVAILABLE'
  | 'FAIL_FULL_SCREEN_IMAGE_USED_AS_IMPLEMENTATION'
  | 'FAIL_SHARED_COMPONENT_IMPACT_UNSCOPED'
  | 'FAIL_MOBILE_DESKTOP_AUTHORITY_CONFLATED'
  | 'FAIL_IMPLEMENTATION_CANON_STALE';
