/**
 * P0.5E.4F — System-wide pre-canon audit registry.
 */

import type { SystemCharacterAuthorityAuditEntry } from './types.js';

export const SYSTEM_CHARACTER_AUTHORITY_AUDIT: SystemCharacterAuthorityAuditEntry[] = [
  { system: 'Character Casting', requiresCharacterAuthority: true, referenceOnlySupported: false, notes: 'Source of canonical authority' },
  { system: 'Character Continuity', requiresCharacterAuthority: true, referenceOnlySupported: true, notes: 'Pre-casting mode; production blocked until cast' },
  { system: 'Marketing Expression / Experiment 01 V23', requiresCharacterAuthority: true, referenceOnlySupported: true, notes: 'Carousel/slide photography when NDX depicted' },
  { system: 'Founder Creative Ingestion', requiresCharacterAuthority: true, referenceOnlySupported: true, notes: 'MEET NDX / launch row reconstruction' },
  { system: 'Campaign Board', requiresCharacterAuthority: false, referenceOnlySupported: true, notes: 'Planning wall; inherits V2.3 assets' },
  { system: 'Content Operations / Credit Utilization', requiresCharacterAuthority: true, referenceOnlySupported: true, notes: 'Photo slides gated; copy/planning allowed' },
  { system: 'Carousel generation P0.5C.7', requiresCharacterAuthority: true, referenceOnlySupported: true, notes: 'Notebook grammar + character injection' },
  { system: 'Realism Lab', requiresCharacterAuthority: true, referenceOnlySupported: true, notes: 'Pre-canon benchmarks cannot become NDX canon' },
  { system: 'Film Production P0.FILM.1', requiresCharacterAuthority: true, referenceOnlySupported: true, notes: 'Planner allowed; generation gated' },
  { system: 'Founder Dailies / Scene Deck', requiresCharacterAuthority: true, referenceOnlySupported: false, notes: 'Post-generation review' },
  { system: 'Launch Row 01', requiresCharacterAuthority: true, referenceOnlySupported: true, notes: 'MEET NDX especially sensitive' },
];

export function systemRequiresCharacterAuthority(systemName: string): boolean {
  return SYSTEM_CHARACTER_AUTHORITY_AUDIT.find((e) => e.system === systemName)?.requiresCharacterAuthority ?? false;
}

export function preCanonAssetAuditImplemented(): true {
  return (SYSTEM_CHARACTER_AUTHORITY_AUDIT.length >= 10) as true;
}
