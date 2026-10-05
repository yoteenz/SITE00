/**
 * Detect project accent bleeding into host-critical surfaces.
 */

import { HOST_CRITICAL_SURFACES } from './constants.js';
import type { ProjectAccentBleedEvaluation } from './types.js';

export function evaluateProjectAccentBleed(appliedTo: string[]): ProjectAccentBleedEvaluation {
  const failures: string[] = [];
  for (const target of appliedTo) {
    const normalized = target.toLowerCase().replace(/\s+/g, '_');
    if (HOST_CRITICAL_SURFACES.some((h) => normalized.includes(h) || h.includes(normalized))) {
      failures.push('FAIL_PROJECT_ACCENT_BLEED');
    }
  }
  return { passed: failures.length === 0, failures: [...new Set(failures)] };
}
