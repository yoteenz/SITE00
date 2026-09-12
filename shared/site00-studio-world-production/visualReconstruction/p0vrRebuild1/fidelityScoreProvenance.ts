/**
 * P0.VR.REBUILD.1 — Fidelity scores with provenance (UNKNOWN ≠ 100).
 */

import type { FidelityScoreProvenance } from './types.js';
import type { VisualConvergenceScore } from '../p0vrDiag1/types.js';

function safeScore(value: number | null | undefined, measured: boolean): number | null {
  if (!measured || value == null || Number.isNaN(value)) return null;
  return value;
}

export function buildFidelityScoreProvenance(input: {
  convergenceBefore: VisualConvergenceScore | null | undefined;
  convergenceAfter: VisualConvergenceScore | null | undefined;
  compositionCoveragePass: boolean;
}): FidelityScoreProvenance[] {
  const before = input.convergenceBefore;
  const after = input.convergenceAfter;
  const hasAfter = Boolean(after);

  return [
    {
      dimension: 'COMPOSITION',
      before: null,
      after: input.compositionCoveragePass ? 85 : null,
      source: 'AuthorityCompositionCoverage',
      evidenceCount: input.compositionCoveragePass ? 1 : 0,
      confidence: input.compositionCoveragePass ? 'MEDIUM' : 'UNKNOWN',
      status: input.compositionCoveragePass ? 'INFERRED' : 'NOT_COMPARED',
    },
    {
      dimension: 'GEOMETRY',
      before: safeScore(before?.geometry ?? null, Boolean(before)),
      after: safeScore(after?.geometry ?? null, hasAfter),
      source: 'VisualConvergenceScore',
      evidenceCount: hasAfter ? 1 : 0,
      confidence: hasAfter ? 'MEDIUM' : 'UNKNOWN',
      status: hasAfter ? 'MEASURED' : 'UNKNOWN',
    },
    {
      dimension: 'SPACING',
      before: safeScore(before?.spacing ?? null, Boolean(before)),
      after: safeScore(after?.spacing ?? null, hasAfter),
      source: 'VisualConvergenceScore',
      evidenceCount: hasAfter ? 1 : 0,
      confidence: hasAfter ? 'MEDIUM' : 'UNKNOWN',
      status: hasAfter ? 'MEASURED' : 'UNKNOWN',
    },
    {
      dimension: 'TYPOGRAPHY',
      before: safeScore(before?.typography ?? null, Boolean(before)),
      after: safeScore(after?.typography ?? null, hasAfter),
      source: 'VisualConvergenceScore',
      evidenceCount: hasAfter ? 1 : 0,
      confidence: hasAfter ? 'LOW' : 'UNKNOWN',
      status: hasAfter ? 'INFERRED' : 'UNKNOWN',
    },
    {
      dimension: 'HIERARCHY',
      before: null,
      after: input.compositionCoveragePass ? 80 : null,
      source: 'AuthorityRegionBlueprint',
      evidenceCount: input.compositionCoveragePass ? 8 : 0,
      confidence: input.compositionCoveragePass ? 'MEDIUM' : 'UNKNOWN',
      status: input.compositionCoveragePass ? 'INFERRED' : 'NOT_COMPARED',
    },
  ];
}

/** Display label — never show 100 for unknown. */
export function formatProvenanceScore(row: FidelityScoreProvenance): string {
  if (row.status === 'UNKNOWN' || row.status === 'NOT_COMPARED' || row.after == null) return '—';
  return String(row.after);
}
