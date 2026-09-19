/**
 * Visual capture manifest — derives routes to capture from generation intent.
 */

import { createHash } from 'node:crypto';
import type { VisualCaptureManifest, VisualCaptureManifestEntry, VisualGenerationIntent, ViewportClass } from './types.js';

/** Real SITE 00 routes — discovered from routes.ts, not invented. */
export const SITE00_CAPTURE_ROUTES = {
  projects: '/projects',
  origin: '/',
  control: '/control',
  ndxbookProject: '/projects/ndxbook',
} as const;

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

function compileSite00ProjectsIndexEntries(targetDevice: ViewportClass): VisualCaptureManifestEntry[] {
  const desktopEntries: VisualCaptureManifestEntry[] = [
    {
      route: SITE00_CAPTURE_ROUTES.projects,
      viewportClass: 'DESKTOP',
      captureState: 'DEFAULT',
      referenceRoles: ['CURRENT_FUNCTIONAL_SURFACE', 'CURRENT_INFORMATION_HIERARCHY'],
      authorityScopes: ['FUNCTIONAL'],
      authority: functionalOnlyAuthority(),
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'AUTOMATED_ROUTE_CAPTURE',
      label: 'CURRENT PROJECTS PAGE',
      required: true,
    },
    {
      route: SITE00_CAPTURE_ROUTES.origin,
      viewportClass: 'DESKTOP',
      captureState: 'DEFAULT',
      referenceRoles: ['HOST_SPATIAL_ATMOSPHERE', 'HOST_SHELL', 'HOST_COLOR_BEHAVIOR'],
      authorityScopes: ['HOST'],
      authority: hostStrictAuthority(),
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'APPROVED_PRODUCTION_CAPTURE',
      label: 'SITE 00 ENVIRONMENT',
      required: true,
    },
    {
      route: SITE00_CAPTURE_ROUTES.ndxbookProject,
      viewportClass: 'DESKTOP',
      captureState: 'DEFAULT',
      referenceRoles: ['HOST_SHELL', 'HOST_NAVIGATION', 'HOST_INFORMATION_DENSITY'],
      authorityScopes: ['HOST'],
      authority: hostStrictAuthority(),
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'APPROVED_PRODUCTION_CAPTURE',
      label: 'SITE 00 PROJECT SHELL',
      required: true,
    },
    {
      route: SITE00_CAPTURE_ROUTES.control,
      viewportClass: 'DESKTOP',
      captureState: 'DEFAULT',
      referenceRoles: ['HOST_SHELL', 'HOST_NAVIGATION', 'HOST_TYPOGRAPHY'],
      authorityScopes: ['HOST'],
      authority: hostStrictAuthority(),
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'APPROVED_PRODUCTION_CAPTURE',
      label: 'SITE 00 HOST SHELL',
      required: true,
    },
  ];

  const mobileEntries: VisualCaptureManifestEntry[] = [
    {
      route: SITE00_CAPTURE_ROUTES.projects,
      viewportClass: 'MOBILE',
      captureState: 'DEFAULT',
      referenceRoles: ['CURRENT_FUNCTIONAL_SURFACE', 'HOST_RESPONSIVE_BEHAVIOR'],
      authorityScopes: ['FUNCTIONAL', 'HOST'],
      authority: { ...functionalOnlyAuthority(), RESPONSIVE_BEHAVIOR: 'STRONG' },
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'AUTOMATED_ROUTE_CAPTURE',
      label: 'MOBILE PROJECTS BASELINE',
      required: false,
    },
    {
      route: SITE00_CAPTURE_ROUTES.origin,
      viewportClass: 'MOBILE',
      captureState: 'DEFAULT',
      referenceRoles: ['HOST_SPATIAL_ATMOSPHERE', 'HOST_RESPONSIVE_BEHAVIOR', 'HOST_NAVIGATION'],
      authorityScopes: ['HOST'],
      authority: { ...hostStrictAuthority(), RESPONSIVE_BEHAVIOR: 'STRONG' },
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'APPROVED_PRODUCTION_CAPTURE',
      label: 'MOBILE HOST ENVIRONMENT',
      required: false,
    },
    {
      route: SITE00_CAPTURE_ROUTES.ndxbookProject,
      viewportClass: 'MOBILE',
      captureState: 'DEFAULT',
      referenceRoles: ['HOST_SHELL', 'HOST_NAVIGATION', 'HOST_RESPONSIVE_BEHAVIOR'],
      authorityScopes: ['HOST'],
      authority: { ...hostStrictAuthority(), RESPONSIVE_BEHAVIOR: 'STRONG' },
      approvalStatus: 'APPROVED_REFERENCE',
      sourceType: 'APPROVED_PRODUCTION_CAPTURE',
      label: 'MOBILE PROJECT SHELL',
      required: false,
    },
  ];

  if (targetDevice === 'MOBILE') {
    return [...mobileEntries, ...desktopEntries.filter((e) => e.required)];
  }
  return desktopEntries;
}

export function compileVisualCaptureManifest(params: {
  generationIntent: VisualGenerationIntent;
  targetDevice?: ViewportClass;
}): VisualCaptureManifest {
  const targetDevice = params.targetDevice ?? 'DESKTOP';
  let entries: VisualCaptureManifestEntry[] = [];

  if (params.generationIntent === 'SITE00_PROJECTS_INDEX_DESIGN_PROOF') {
    entries = compileSite00ProjectsIndexEntries(targetDevice);
  } else {
    entries = compileSite00ProjectsIndexEntries(targetDevice);
  }

  const fingerprint = createHash('sha256')
    .update(JSON.stringify({ intent: params.generationIntent, device: targetDevice, entries: entries.map((e) => e.route) }))
    .digest('hex')
    .slice(0, 16);

  return {
    generationIntent: params.generationIntent,
    targetSurface: params.generationIntent === 'SITE00_PROJECTS_INDEX_DESIGN_PROOF' ? '/projects' : '/projects/ndxbook',
    targetDevice,
    entries,
    fingerprint,
    compiledAt: new Date().toISOString(),
  };
}

export function manifestSelectsRelevantRoutesOnly(manifest: VisualCaptureManifest): boolean {
  return manifest.entries.length > 0 && manifest.entries.length < 20;
}
