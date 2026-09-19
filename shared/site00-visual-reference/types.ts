/**
 * Visual Reference Intelligence — core types for Studio World.
 * Visual Memory ≠ Canon. Every reference declares what it is authoritative for.
 */

import type { VisualReferenceCaptureMetadata } from './captureAuthTypes.js';

export type VisualReferenceSourceType =
  | 'AUTOMATED_ROUTE_CAPTURE'
  | 'FOUNDER_SUPPLIED'
  | 'CLIENT_SUPPLIED'
  | 'APPROVED_DESIGN_PROOF'
  | 'APPROVED_PRODUCTION_CAPTURE'
  | 'GENERATED_VISUAL_DEVELOPMENT'
  | 'HISTORICAL_REFERENCE'
  | 'EXTERNAL_REFERENCE';

export type VisualReferenceApprovalStatus =
  | 'APPROVED_REFERENCE'
  | 'BRAND_CANON_REFERENCE'
  | 'PROJECT_CANON_REFERENCE'
  | 'EXPERIMENTAL_REFERENCE'
  | 'STRUCTURAL_REFERENCE'
  | 'NEGATIVE_REFERENCE';

export type VisualReferenceRole =
  | 'HOST_SHELL'
  | 'HOST_NAVIGATION'
  | 'HOST_TYPOGRAPHY'
  | 'HOST_COLOR_BEHAVIOR'
  | 'HOST_SPATIAL_ATMOSPHERE'
  | 'HOST_MATERIAL_LANGUAGE'
  | 'HOST_INFORMATION_DENSITY'
  | 'HOST_RESPONSIVE_BEHAVIOR'
  | 'CLIENT_VISUAL_IDENTITY'
  | 'CLIENT_TYPOGRAPHY'
  | 'CLIENT_COLOR_BEHAVIOR'
  | 'CLIENT_ARTWORK'
  | 'CLIENT_MATERIAL_LANGUAGE'
  | 'CLIENT_IMAGE_BEHAVIOR'
  | 'CLIENT_GRAPHIC_GRAMMAR'
  | 'CURRENT_FUNCTIONAL_SURFACE'
  | 'CURRENT_INFORMATION_HIERARCHY'
  | 'CURRENT_NAVIGATION'
  | 'CURRENT_INTERACTION_STATE'
  | 'TARGET_COMPOSITION'
  | 'STRUCTURAL_HIERARCHY'
  | 'SPATIAL_BEHAVIOR'
  | 'ARTWORK_PARTICIPATION'
  | 'MOTION_REFERENCE'
  | 'APPROVED_DESIGN_DIRECTION'
  | 'NEGATIVE_REFERENCE'
  | 'ANTI_DIRECTION';

export type VisualReferenceAuthorityLevel =
  | 'STRICT'
  | 'STRONG'
  | 'MODERATE'
  | 'INSPIRATIONAL'
  | 'STRUCTURAL_ONLY'
  | 'FUNCTIONAL_ONLY'
  | 'NEGATIVE_ONLY'
  | 'NONE';

export type VisualReferenceAuthorityDimension =
  | 'STYLE'
  | 'COLOR'
  | 'TYPOGRAPHY'
  | 'MATERIAL'
  | 'SPATIAL_ATMOSPHERE'
  | 'LAYOUT'
  | 'HIERARCHY'
  | 'NAVIGATION'
  | 'FUNCTION'
  | 'ARTWORK_BEHAVIOR'
  | 'RESPONSIVE_BEHAVIOR';

export type VisualReferenceAuthority = Partial<
  Record<VisualReferenceAuthorityDimension, VisualReferenceAuthorityLevel>
>;

export type VisualReferenceAuthorityScope = 'HOST' | 'CLIENT' | 'FUNCTIONAL' | 'STRUCTURAL' | 'NEGATIVE';

export type ViewportClass = 'DESKTOP' | 'WIDE_DESKTOP' | 'MOBILE';

export type CaptureType = 'VIEWPORT' | 'FULL_PAGE' | 'SURFACE_BOUNDED';

export type CaptureState =
  | 'DEFAULT'
  | 'EMPTY'
  | 'LOADING'
  | 'REVIEW_REQUIRED'
  | 'ACTIVE_WORK'
  | 'ERROR'
  | 'SUCCESS'
  | 'GENERATION_IN_PROGRESS'
  | 'FOUNDER_REVIEW';

export type StalenessState = 'FRESH' | 'POSSIBLY_STALE' | 'STALE' | 'SUPERSEDED';

export type VisualGenerationIntent =
  | 'SITE00_PROJECTS_INDEX_DESIGN_PROOF'
  | 'NDXBOOK_PROJECT_HOME_DESIGN_PROOF';

export type VisualGenerationMode =
  | 'TEXT_TO_IMAGE'
  | 'REFERENCE_CONDITIONED'
  | 'IMAGE_EDIT'
  | 'MULTI_REFERENCE_CONDITIONED'
  | 'COMPOSITIONAL_REFERENCE_CONDITIONED';

export type VisualReferenceRecord = {
  id: string;
  projectId: string | null;
  brandId: string | null;
  surfaceId: string | null;
  route: string;
  sourceUrl: string | null;
  captureType: CaptureType;
  viewportClass: ViewportClass;
  viewportWidth: number;
  viewportHeight: number;
  deviceScaleFactor: number;
  capturedAt: string;
  sourceCommit: string | null;
  deploymentId: string | null;
  environment: string;
  storagePath: string;
  publicUrl: string | null;
  imageFingerprint: string;
  pageFingerprint: string | null;
  referenceRoles: VisualReferenceRole[];
  authorityScopes: VisualReferenceAuthorityScope[];
  authority: VisualReferenceAuthority;
  approvalStatus: VisualReferenceApprovalStatus;
  sourceType: VisualReferenceSourceType;
  provenance: string;
  stalenessState: StalenessState;
  supersedesReferenceId: string | null;
  notes: string | null;
  captureMetadata?: VisualReferenceCaptureMetadata | null;
  createdAt: string;
  updatedAt: string;
};

export type VisualCaptureManifestEntry = {
  route: string;
  viewportClass: ViewportClass;
  captureState: CaptureState;
  referenceRoles: VisualReferenceRole[];
  authorityScopes: VisualReferenceAuthorityScope[];
  authority: VisualReferenceAuthority;
  approvalStatus: VisualReferenceApprovalStatus;
  sourceType: VisualReferenceSourceType;
  label: string;
  required: boolean;
};

export type VisualCaptureManifest = {
  generationIntent: VisualGenerationIntent;
  targetSurface: string;
  targetDevice: ViewportClass;
  entries: VisualCaptureManifestEntry[];
  fingerprint: string;
  compiledAt: string;
};

export type VisualReferencePackageEntry = {
  referenceId: string;
  storagePath: string;
  publicUrl: string | null;
  role: VisualReferenceRole;
  roles: VisualReferenceRole[];
  authority: VisualReferenceAuthority;
  authorityScopes: VisualReferenceAuthorityScope[];
  approvalStatus: VisualReferenceApprovalStatus;
  sourceType: VisualReferenceSourceType;
  whyIncluded: string;
  preserve: string[];
  ignore: string[];
  doNotInherit: string[];
  label: string;
};

export type VisualReferencePackage = {
  generationIntent: VisualGenerationIntent;
  targetSurface: string;
  targetDevice: ViewportClass;
  references: VisualReferencePackageEntry[];
  authorityInstructions: string[];
  preserveInstructions: string[];
  transformInstructions: string[];
  ignoreInstructions: string[];
  antiDirectionInstructions: string[];
  clientHostBoundary: string;
  functionalConstraints: string[];
  strictHostVisualConditioning: boolean;
  generationMode: VisualGenerationMode;
  fingerprint: string;
  compiledAt: string;
};

export type HostVisualMemory = {
  memoryId: 'site00-host-visual-memory';
  brandId: 'site00';
  references: VisualReferenceRecord[];
  approvedHostBaselineIds: string[];
  lastRefreshedAt: string | null;
  sourceCommit: string | null;
};

export type ClientVisualMemory = {
  memoryId: string;
  projectId: string;
  brandId: string;
  references: VisualReferenceRecord[];
  lastRefreshedAt: string | null;
};

export type ProofReferenceClassification = {
  structuralAuthority: boolean;
  styleAuthority: boolean;
  negativeStyle: boolean;
  approvalStatus: VisualReferenceApprovalStatus;
};

export type DesignProofLineageEntry = {
  proofRecordId: string;
  parentProofRecordId: string | null;
  revisionReason: string | null;
  proofLabel: 'PROOF_A' | 'PROOF_B' | null;
  referencePackageFingerprint: string | null;
  referenceConditioned: boolean;
  composedProofStoragePath: string | null;
  classification: ProofReferenceClassification | null;
  createdAt: string;
};

export const FOUNDER_MANUAL_SCREENSHOT_COLLECTION_REQUIRED = false;
