/**
 * P0.VR.3A — SITE 00 self-design boundary (host vs website).
 */

import {
  DESIGN_WORKSPACE_HOST_COMPONENTS,
  SITE00_WEBSITE_TARGET_COMPONENT_PREFIXES,
} from '../p0vr3/constants.js';
import type { Site00SelfDesignBoundaryResult } from '../p0vr3/types.js';
import { SITE00_DESIGN_PROJECT_ID } from '../p0vr3/constants.js';

export function isDesignWorkspaceHostComponent(componentPath: string): boolean {
  return DESIGN_WORKSPACE_HOST_COMPONENTS.some(
    (host) => componentPath === host || componentPath.endsWith(host.split('/').pop() ?? ''),
  );
}

export function isSite00WebsiteTargetComponent(componentPath: string): boolean {
  if (isDesignWorkspaceHostComponent(componentPath)) return false;
  return SITE00_WEBSITE_TARGET_COMPONENT_PREFIXES.some((prefix) => componentPath.startsWith(prefix));
}

export function evaluateSite00SelfDesignBoundary(input: {
  projectId: string;
  targetComponentPath: string;
  screenId?: string;
}): Site00SelfDesignBoundaryResult {
  if (input.projectId !== SITE00_DESIGN_PROJECT_ID) {
    return {
      allowed: true,
      targetScope: 'SITE00_WEBSITE',
      reason: 'Non-SITE-00 project — standard project scope applies.',
      hostComponentsProtected: [],
    };
  }

  if (input.screenId === 'design-workspace-host') {
    return {
      allowed: false,
      targetScope: 'BLOCKED',
      reason: 'Design workspace host is classified HOST_INTERNAL — MATCH REFERENCE blocked unless founder explicitly overrides.',
      hostComponentsProtected: [...DESIGN_WORKSPACE_HOST_COMPONENTS],
    };
  }

  if (isDesignWorkspaceHostComponent(input.targetComponentPath)) {
    return {
      allowed: false,
      targetScope: 'DESIGN_WORKSPACE_HOST',
      reason: 'Target is Design workspace host shell — self-design must not mutate host UI.',
      hostComponentsProtected: [...DESIGN_WORKSPACE_HOST_COMPONENTS],
    };
  }

  if (isSite00WebsiteTargetComponent(input.targetComponentPath)) {
    return {
      allowed: true,
      targetScope: 'SITE00_WEBSITE',
      reason: 'Target is SITE 00 customer-facing website component.',
      hostComponentsProtected: [...DESIGN_WORKSPACE_HOST_COMPONENTS],
    };
  }

  return {
    allowed: true,
    targetScope: 'SITE00_WEBSITE',
    reason: 'Component path not classified as host — allowed with shared component impact check.',
    hostComponentsProtected: [...DESIGN_WORKSPACE_HOST_COMPONENTS],
  };
}

export function matchReferenceCanPatchHostAccidentally(input: {
  projectId: string;
  targetComponentPath: string;
}): boolean {
  const boundary = evaluateSite00SelfDesignBoundary(input);
  return !boundary.allowed && boundary.targetScope === 'DESIGN_WORKSPACE_HOST';
}

export function detectSharedComponentImpactForSite00(targetComponentPath: string): {
  requiresScopedVariant: boolean;
  affectedHostComponents: string[];
} {
  const hostOverlap = DESIGN_WORKSPACE_HOST_COMPONENTS.filter((host) =>
    targetComponentPath.includes(host.split('/').pop()?.replace('.tsx', '') ?? ''),
  );
  return {
    requiresScopedVariant: hostOverlap.length > 0,
    affectedHostComponents: hostOverlap,
  };
}
