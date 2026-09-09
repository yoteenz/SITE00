/**
 * PageChildCohesionQA
 */

import type { RequiredChildSurface } from './types.js';
import { resolveAuthorityCascade } from './authorityCascade.js';

export function evaluatePageChildCohesionQA(surface: RequiredChildSurface): {
  passed: boolean;
  failureCodes: string[];
} {
  const failures: string[] = [];
  const cascade = resolveAuthorityCascade({ parentAuthorityId: surface.inheritance.parentAuthorityId });

  if (surface.inheritance.prohibitedFallbacks.includes('GENERIC_ADMIN_UI') && cascade.usedGenericFallback) {
    failures.push('PAGE_CHILD_GENERIC_UI_FALLBACK');
  }
  if (!surface.inheritance.typographyRules.includes('MARTIAN_MONO')) {
    failures.push('PAGE_CHILD_VISUAL_COHESION_FAILED');
  }

  return { passed: failures.length === 0, failureCodes: failures };
}
