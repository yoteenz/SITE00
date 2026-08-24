/**
 * P0.5E.4 — Character discovery ledger (lineage-preserving).
 */

import { randomUUID } from 'node:crypto';
import type {
  CharacterDiscoveryLedgerEntry,
  CharacterTruthConfidenceState,
  DiscoveryDomainId,
  FounderDiscoveryJudgment,
  TraitAuthorityState,
} from './types.js';

export function appendLedgerEntry(params: {
  ledger: CharacterDiscoveryLedgerEntry[];
  proposal: string;
  source: TraitAuthorityState;
  currentStatement: string;
  authority: TraitAuthorityState;
  confidence: CharacterTruthConfidenceState;
  domainsAffected?: DiscoveryDomainId[];
  founderJudgment?: FounderDiscoveryJudgment | null;
  founderRevision?: string | null;
  contradictionsCreated?: string[];
  downstreamImplications?: string[];
  priorEntryId?: string | null;
}): CharacterDiscoveryLedgerEntry[] {
  const prior = params.ledger.find((e) => e.entryId === params.priorEntryId) ?? params.ledger.at(-1);
  const entry: CharacterDiscoveryLedgerEntry = {
    entryId: randomUUID(),
    proposal: params.proposal,
    source: params.source,
    founderJudgment: params.founderJudgment ?? null,
    founderRevision: params.founderRevision ?? null,
    currentStatement: params.currentStatement,
    at: new Date().toISOString(),
    authority: params.authority,
    confidence: params.confidence,
    contradictionsCreated: params.contradictionsCreated ?? [],
    domainsAffected: params.domainsAffected ?? [],
    downstreamImplications: params.downstreamImplications ?? [],
    priorEntryId: prior?.entryId ?? null,
  };
  return [...params.ledger, entry];
}

export function rejectedIdeasRemainInLedger(ledger: CharacterDiscoveryLedgerEntry[]): boolean {
  return ledger.some((e) => e.authority === 'FOUNDER_REJECTED' || e.confidence === 'REJECTED');
}

export function ledgerPreservesLineage(ledger: CharacterDiscoveryLedgerEntry[]): boolean {
  return ledger.every((e, i) => i === 0 || e.priorEntryId !== null);
}
