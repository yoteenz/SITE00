/**
 * P0.5E.4 — Forensic audit of P0.5E.3 seeded character content.
 */

import type { CharacterForensicAudit } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/types.js';
import type { NdxEmbodiedCharacterDiscoveryRun } from '../ndxEmbodiedCharacterDiscovery/types.js';
import { buildNdxFounderTraitForensicReport } from './ndxFounderTraitPropositions.js';

export function auditNdxEmbodiedCharacterFoundation(_base: NdxEmbodiedCharacterDiscoveryRun): CharacterForensicAudit {
  return buildNdxFounderTraitForensicReport();
}

export function seededContentRemainsProposalUntilFounderReview(audit: CharacterForensicAudit): boolean {
  return audit.totalSeededTraits > 0 && audit.startingCastingReadiness === 'BLOCKED_FOUNDER_DISCOVERY_REQUIRED';
}
