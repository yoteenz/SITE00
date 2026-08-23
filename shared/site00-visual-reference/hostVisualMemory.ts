/**
 * Host visual memory seed/build helpers for SITE 00.
 */

import type { HostVisualMemory, VisualReferenceRecord } from './types.js';
import { SITE00_CAPTURE_ROUTES } from './visualCaptureManifest.js';
import { getViewportSpec } from './viewportConfig.js';

function hostStrictAuthority() {
  return {
    STYLE: 'STRICT' as const,
    COLOR: 'STRICT' as const,
    TYPOGRAPHY: 'STRICT' as const,
    SPATIAL_ATMOSPHERE: 'STRICT' as const,
    MATERIAL: 'STRONG' as const,
    LAYOUT: 'MODERATE' as const,
    NAVIGATION: 'STRONG' as const,
    FUNCTION: 'NONE' as const,
  };
}

function functionalOnlyAuthority() {
  return {
    STYLE: 'NONE' as const,
    COLOR: 'NONE' as const,
    TYPOGRAPHY: 'NONE' as const,
    LAYOUT: 'NONE' as const,
    HIERARCHY: 'FUNCTIONAL_ONLY' as const,
    NAVIGATION: 'FUNCTIONAL_ONLY' as const,
    FUNCTION: 'FUNCTIONAL_ONLY' as const,
  };
}

export function buildHostVisualMemoryReferenceSeed(params: {
  id: string;
  route: string;
  viewportClass: 'DESKTOP' | 'MOBILE' | 'WIDE_DESKTOP';
  roles: VisualReferenceRecord['referenceRoles'];
  label: string;
  sourceCommit?: string | null;
  storagePath?: string;
  publicUrl?: string | null;
  approvalStatus?: VisualReferenceRecord['approvalStatus'];
  sourceType?: VisualReferenceRecord['sourceType'];
  authority?: VisualReferenceRecord['authority'];
  authorityScopes?: VisualReferenceRecord['authorityScopes'];
}): VisualReferenceRecord {
  const spec = getViewportSpec(params.viewportClass);
  const now = new Date().toISOString();
  const storagePath =
    params.storagePath ??
    `visual-references/site00/host/${params.viewportClass.toLowerCase()}/${params.route.replace(/\//g, '_') || 'root'}.webp`;

  return {
    id: params.id,
    projectId: null,
    brandId: 'site00',
    surfaceId: params.route,
    route: params.route,
    sourceUrl: null,
    captureType: 'VIEWPORT',
    viewportClass: params.viewportClass,
    viewportWidth: spec.width,
    viewportHeight: spec.height,
    deviceScaleFactor: spec.deviceScaleFactor,
    capturedAt: now,
    sourceCommit: params.sourceCommit ?? 'vitest-seed',
    deploymentId: null,
    environment: 'seed',
    storagePath,
    publicUrl: params.publicUrl ?? `https://vitest.local/${storagePath}`,
    imageFingerprint: `fp-${params.id}`,
    pageFingerprint: `page-${params.route}-${params.viewportClass}`,
    referenceRoles: params.roles,
    authorityScopes: params.authorityScopes ?? ['HOST'],
    authority: params.authority ?? hostStrictAuthority(),
    approvalStatus: params.approvalStatus ?? 'APPROVED_REFERENCE',
    sourceType: params.sourceType ?? 'APPROVED_PRODUCTION_CAPTURE',
    provenance: 'host-visual-memory-seed',
    stalenessState: 'FRESH',
    supersedesReferenceId: null,
    notes: params.label,
    createdAt: now,
    updatedAt: now,
  };
}

export function createEmptyHostVisualMemory(): HostVisualMemory {
  return {
    memoryId: 'site00-host-visual-memory',
    brandId: 'site00',
    references: [],
    approvedHostBaselineIds: [],
    lastRefreshedAt: null,
    sourceCommit: null,
  };
}

export function seedDefaultHostVisualMemory(sourceCommit?: string | null): HostVisualMemory {
  const refs: VisualReferenceRecord[] = [
    buildHostVisualMemoryReferenceSeed({
      id: 'host-ref-control-desktop',
      route: SITE00_CAPTURE_ROUTES.control,
      viewportClass: 'DESKTOP',
      roles: ['HOST_SHELL', 'HOST_NAVIGATION', 'HOST_TYPOGRAPHY'],
      label: 'SITE 00 HOST SHELL — STRICT VISUAL AUTHORITY',
      sourceCommit,
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'APPROVED_PRODUCTION_CAPTURE',
    }),
    buildHostVisualMemoryReferenceSeed({
      id: 'host-ref-origin-desktop',
      route: SITE00_CAPTURE_ROUTES.origin,
      viewportClass: 'DESKTOP',
      roles: ['HOST_SPATIAL_ATMOSPHERE', 'HOST_COLOR_BEHAVIOR', 'HOST_MATERIAL_LANGUAGE'],
      label: 'SITE 00 ENVIRONMENT — SPATIAL ATMOSPHERE',
      sourceCommit,
    }),
    buildHostVisualMemoryReferenceSeed({
      id: 'host-ref-projects-desktop',
      route: SITE00_CAPTURE_ROUTES.projects,
      viewportClass: 'DESKTOP',
      roles: ['CURRENT_FUNCTIONAL_SURFACE', 'CURRENT_INFORMATION_HIERARCHY'],
      label: 'CURRENT PROJECTS PAGE — FUNCTIONAL ONLY',
      sourceCommit,
      authority: functionalOnlyAuthority(),
      authorityScopes: ['FUNCTIONAL'],
      sourceType: 'AUTOMATED_ROUTE_CAPTURE',
    }),
    buildHostVisualMemoryReferenceSeed({
      id: 'host-ref-ndxbook-desktop',
      route: SITE00_CAPTURE_ROUTES.ndxbookProject,
      viewportClass: 'DESKTOP',
      roles: ['HOST_SHELL', 'HOST_INFORMATION_DENSITY'],
      label: 'SITE 00 PROJECT SHELL',
      sourceCommit,
    }),
    buildHostVisualMemoryReferenceSeed({
      id: 'host-ref-projects-mobile',
      route: SITE00_CAPTURE_ROUTES.projects,
      viewportClass: 'MOBILE',
      roles: ['HOST_RESPONSIVE_BEHAVIOR', 'CURRENT_FUNCTIONAL_SURFACE'],
      label: 'MOBILE PROJECTS BASELINE',
      sourceCommit,
      authority: { ...functionalOnlyAuthority(), RESPONSIVE_BEHAVIOR: 'STRONG' },
      authorityScopes: ['FUNCTIONAL', 'HOST'],
    }),
    buildHostVisualMemoryReferenceSeed({
      id: 'host-ref-origin-mobile',
      route: SITE00_CAPTURE_ROUTES.origin,
      viewportClass: 'MOBILE',
      roles: ['HOST_RESPONSIVE_BEHAVIOR', 'HOST_NAVIGATION'],
      label: 'MOBILE HOST NAVIGATION',
      sourceCommit,
    }),
  ];

  return {
    memoryId: 'site00-host-visual-memory',
    brandId: 'site00',
    references: refs,
    approvedHostBaselineIds: ['host-ref-control-desktop', 'host-ref-origin-desktop'],
    lastRefreshedAt: new Date().toISOString(),
    sourceCommit: sourceCommit ?? 'vitest-seed',
  };
}

export function buildStructuralProofReference(params: {
  proofRecordId: string;
  storagePath: string;
  publicUrl: string | null;
}): VisualReferenceRecord {
  const now = new Date().toISOString();
  return {
    id: `structural-ref-${params.proofRecordId}`,
    projectId: 'ndxbook',
    brandId: 'site00',
    surfaceId: '/projects',
    route: '/projects',
    sourceUrl: null,
    captureType: 'SURFACE_BOUNDED',
    viewportClass: 'DESKTOP',
    viewportWidth: 1440,
    viewportHeight: 900,
    deviceScaleFactor: 1,
    capturedAt: now,
    sourceCommit: null,
    deploymentId: null,
    environment: 'visual-development',
    storagePath: params.storagePath,
    publicUrl: params.publicUrl,
    imageFingerprint: `structural-${params.proofRecordId}`,
    pageFingerprint: null,
    referenceRoles: ['STRUCTURAL_HIERARCHY', 'SPATIAL_BEHAVIOR', 'ARTWORK_PARTICIPATION', 'TARGET_COMPOSITION'],
    authorityScopes: ['STRUCTURAL'],
    authority: {
      HIERARCHY: 'STRONG',
      LAYOUT: 'MODERATE',
      ARTWORK_BEHAVIOR: 'STRONG',
      STYLE: 'STRUCTURAL_ONLY',
      COLOR: 'NEGATIVE_ONLY',
      TYPOGRAPHY: 'NONE',
      MATERIAL: 'NEGATIVE_ONLY',
    },
    approvalStatus: 'STRUCTURAL_REFERENCE',
    sourceType: 'GENERATED_VISUAL_DEVELOPMENT',
    provenance: 'experiment-e-failed-sci-fi-workbench-proof',
    stalenessState: 'FRESH',
    supersedesReferenceId: null,
    notes: 'STRUCTURAL REFERENCE — HIERARCHY ONLY — STYLE REJECTED (sci-fi command center failure)',
    createdAt: now,
    updatedAt: now,
  };
}

export function buildNegativeStyleProofReference(structuralRef: VisualReferenceRecord): VisualReferenceRecord {
  return {
    ...structuralRef,
    id: `${structuralRef.id}-negative`,
    referenceRoles: [...structuralRef.referenceRoles, 'NEGATIVE_REFERENCE', 'ANTI_DIRECTION'],
    authorityScopes: ['NEGATIVE'],
    authority: {
      ...structuralRef.authority,
      STYLE: 'NEGATIVE_ONLY',
      COLOR: 'NEGATIVE_ONLY',
      MATERIAL: 'NEGATIVE_ONLY',
    },
    approvalStatus: 'NEGATIVE_REFERENCE',
    notes: 'NEGATIVE STYLE REFERENCE — reject dark sci-fi command center aesthetic',
  };
}
