/**
 * Deterministic reference conflict resolution hierarchy.
 */

import type { VisualReferenceAuthorityLevel, VisualReferenceRecord } from './types.js';

const AUTHORITY_PRECEDENCE: VisualReferenceAuthorityLevel[] = [
  'STRICT',
  'STRONG',
  'MODERATE',
  'INSPIRATIONAL',
  'STRUCTURAL_ONLY',
  'FUNCTIONAL_ONLY',
  'NEGATIVE_ONLY',
  'NONE',
];

const SOURCE_PRECEDENCE = [
  'APPROVED_PRODUCTION_CAPTURE',
  'APPROVED_DESIGN_PROOF',
  'AUTOMATED_ROUTE_CAPTURE',
  'FOUNDER_SUPPLIED',
  'CLIENT_SUPPLIED',
  'HISTORICAL_REFERENCE',
  'GENERATED_VISUAL_DEVELOPMENT',
  'EXTERNAL_REFERENCE',
] as const;

const APPROVAL_PRECEDENCE = [
  'APPROVED_REFERENCE',
  'BRAND_CANON_REFERENCE',
  'PROJECT_CANON_REFERENCE',
  'STRUCTURAL_REFERENCE',
  'EXPERIMENTAL_REFERENCE',
  'NEGATIVE_REFERENCE',
] as const;

export function resolveAuthorityConflict(
  levelA: VisualReferenceAuthorityLevel | undefined,
  levelB: VisualReferenceAuthorityLevel | undefined,
): VisualReferenceAuthorityLevel {
  const a = levelA ?? 'NONE';
  const b = levelB ?? 'NONE';
  const idxA = AUTHORITY_PRECEDENCE.indexOf(a);
  const idxB = AUTHORITY_PRECEDENCE.indexOf(b);
  return idxA <= idxB ? a : b;
}

export function strictHostVisualReferenceOutranksStructuralStyle(
  hostRef: VisualReferenceRecord,
  structuralRef: VisualReferenceRecord,
): boolean {
  const hostStyle = hostRef.authority.STYLE ?? 'NONE';
  const structuralStyle = structuralRef.authority.STYLE ?? 'NONE';
  if (hostStyle === 'STRICT' && structuralStyle !== 'NEGATIVE_ONLY') return true;
  if (structuralStyle === 'STRUCTURAL_ONLY' || structuralStyle === 'NEGATIVE_ONLY') return true;
  return resolveAuthorityConflict(hostStyle, structuralStyle) === hostStyle;
}

export function functionalCanonOutranksVisualReference(): true {
  return true;
}

export function rankReferenceForSelection(ref: VisualReferenceRecord): number {
  const sourceIdx = SOURCE_PRECEDENCE.indexOf(ref.sourceType as (typeof SOURCE_PRECEDENCE)[number]);
  const approvalIdx = APPROVAL_PRECEDENCE.indexOf(ref.approvalStatus as (typeof APPROVAL_PRECEDENCE)[number]);
  const stalenessPenalty =
    ref.stalenessState === 'FRESH' ? 0 : ref.stalenessState === 'POSSIBLY_STALE' ? 10 : 20;
  return sourceIdx * 100 + approvalIdx * 10 + stalenessPenalty;
}

export function selectWinningReference(candidates: VisualReferenceRecord[]): VisualReferenceRecord | null {
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => rankReferenceForSelection(a) - rankReferenceForSelection(b));
  return sorted[0] ?? null;
}

/**
 * Conflict hierarchy (methodology):
 * 1. FUNCTIONAL CANON
 * 2. HOST CANON / CLIENT CANON
 * 3. EXPLICIT FOUNDER LOCKS
 * 4. APPROVED STRICT VISUAL REFERENCES
 * 5. APPROVED CLIENT REFERENCES
 * 6. APPROVED STRUCTURAL REFERENCES
 * 7. EXPERIMENTAL REFERENCES
 * 8. GENERATIVE INVENTION
 */
export const REFERENCE_CONFLICT_HIERARCHY = [
  'FUNCTIONAL_CANON',
  'HOST_CLIENT_CANON',
  'FOUNDER_LOCKS',
  'APPROVED_STRICT_VISUAL',
  'APPROVED_CLIENT',
  'APPROVED_STRUCTURAL',
  'EXPERIMENTAL',
  'GENERATIVE_INVENTION',
] as const;
