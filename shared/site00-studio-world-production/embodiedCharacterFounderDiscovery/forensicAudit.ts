/**
 * P0.5E.4 — Generic forensic audit helpers.
 */

import { randomUUID } from 'node:crypto';
import type { AuditedTrait, CharacterForensicAudit, TraitAuthorityState } from './types.js';

export function auditTrait(params: {
  traitId: string;
  category: string;
  statement: string;
  authority?: TraitAuthorityState;
}): AuditedTrait {
  return {
    traitId: params.traitId,
    category: params.category,
    statement: params.statement,
    authority: params.authority ?? 'SYSTEM_SEEDED',
    confidence: params.authority === 'FOUNDER_CONFIRMED' ? 'STRONG' : 'HYPOTHESIS',
  };
}

export function buildForensicReport(traits: AuditedTrait[]): CharacterForensicAudit {
  const seeded = traits.filter((t) => t.authority === 'SYSTEM_SEEDED').length;
  const confirmed = traits.filter((t) => t.authority === 'FOUNDER_CONFIRMED' || t.authority === 'FOUNDER_REVISED').length;
  const unresolved = traits.filter(
    (t) => t.authority === 'UNRESOLVED' || t.authority === 'INFERRED_PENDING_CONFIRMATION' || t.confidence === 'UNRESOLVED',
  ).length;
  const visualPending = traits.filter((t) => t.category === 'VISUAL_HYPOTHESIS' && t.authority === 'SYSTEM_SEEDED').length;

  return {
    auditId: randomUUID(),
    auditedAt: new Date().toISOString(),
    totalSeededTraits: seeded,
    founderConfirmedTraits: confirmed,
    unresolvedTraits: unresolved,
    contradictionsRequiringDiscovery: traits.filter((t) => t.category === 'CONTRADICTION').length,
    visualHypothesesAwaitingConfirmation: visualPending,
    startingCastingReadiness: 'BLOCKED_FOUNDER_DISCOVERY_REQUIRED',
    traits,
  };
}

export function seededTraitsRemainNonCanon(traits: AuditedTrait[]): boolean {
  return traits
    .filter((t) => t.authority === 'SYSTEM_SEEDED')
    .every((t) => t.confidence !== 'CANON');
}
