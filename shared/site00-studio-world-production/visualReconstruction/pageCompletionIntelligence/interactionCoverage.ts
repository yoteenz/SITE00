/**
 * PageInteractionCoverage calculator
 */

import type { PageInteractionContract, PageInteractionCoverage } from './types.js';

export function calculateInteractionCoverage(contracts: PageInteractionContract[]): PageInteractionCoverage {
  const detected = contracts.length;
  const resolved = contracts.filter((c) => c.status !== 'AMBIGUOUS' && c.intent !== 'UNRESOLVED').length;
  const implemented = contracts.filter((c) => c.status === 'IMPLEMENTED' || c.status === 'RESOLVED').length;
  const qaPassed = contracts.filter((c) => c.status === 'RESOLVED').length;
  const blocked = contracts.filter((c) => c.status === 'BLOCKED' || c.status === 'AMBIGUOUS').length;
  const coveragePercent = detected ? Math.round((implemented / detected) * 100) : 100;

  return { detected, resolved, implemented, qaPassed, blocked, coveragePercent };
}
