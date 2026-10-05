/**
 * Project monetization registry (host-readable data). The DESIGN workspace can inspect, per project:
 * feature · access class · capability · paywall · upgrade surface. Projects without monetization return null.
 */

import { buildMonetizationInspection, type ProjectMonetizationContract } from '../../shared/site00-monetization/index.js';
import { JURNL_MONETIZATION_CONTRACT } from './jurnl/data/monetization/contract';
import { getIngestedProject } from './registry';

const MONETIZATION: Record<string, ProjectMonetizationContract> = {
  jurnl: JURNL_MONETIZATION_CONTRACT,
};

export function projectMonetization(slug: string): ProjectMonetizationContract | null {
  return MONETIZATION[slug.toLowerCase()] ?? null;
}

/** Structural inspection rows (no dashboard yet). Empty for projects that do not monetize. */
export function projectMonetizationInspection(slug: string) {
  const c = projectMonetization(slug);
  if (!c) return [];
  return buildMonetizationInspection(c, getIngestedProject(slug)?.displayName ?? slug.toUpperCase());
}
