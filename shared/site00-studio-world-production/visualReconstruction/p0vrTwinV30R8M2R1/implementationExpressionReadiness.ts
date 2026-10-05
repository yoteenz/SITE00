import { CRITICAL_IMPLEMENTATION_REGIONS } from '../p0vrTwinV30R8M2/constants.js';
import { CRITICAL_GENERIC_FALLBACK_THRESHOLD } from './constants.js';
import type {
  GenericFallbackAudit,
  ImplementationExpressionIR,
  ImplementationExpressionReadinessReceipt,
} from './implementationExpressionTypes.js';

export function evaluateImplementationExpressionReadiness(input: {
  ir: Omit<ImplementationExpressionIR, 'readiness' | 'hash'>;
  fallbackAudit: GenericFallbackAudit;
}): ImplementationExpressionReadinessReceipt {
  const criticalRegionsMapped = CRITICAL_IMPLEMENTATION_REGIONS.filter(
    (id) => input.ir.regionExpressions[id]?.mapped,
  ).length;
  const criticalObjectsWithExpression = input.ir.objectExpressions.filter((o) =>
    o.authorityEvidence.evidenceConfidence >= 0.5,
  ).length;

  const blockers: string[] = [];
  if (criticalRegionsMapped < 8) blockers.push('CRITICAL_REGIONS_INCOMPLETE');
  if (input.ir.unresolvedItems.length) blockers.push('UNRESOLVED_EXPRESSION_ITEMS');
  if (input.ir.authorityConflicts.some((c) => c.resolution === 'UNRESOLVED')) {
    blockers.push('IMPLEMENTATION_AUTHORITY_CONFLICT');
  }
  if (input.fallbackAudit.criticalGenericFallbacks.length > CRITICAL_GENERIC_FALLBACK_THRESHOLD) {
    blockers.push('CRITICAL_GENERIC_FALLBACK');
  }

  let status: ImplementationExpressionReadinessReceipt['status'] = 'READY';
  if (blockers.includes('CRITICAL_GENERIC_FALLBACK') || blockers.includes('CRITICAL_REGIONS_INCOMPLETE')) {
    status = 'BLOCKED';
  } else if (blockers.length) {
    status = 'REVIEW_REQUIRED';
  }

  return {
    id: `expr-ready-${input.ir.id}`,
    status,
    criticalRegionsMapped,
    criticalObjectsWithExpression,
    unresolvedAuthorityConflicts: input.ir.authorityConflicts.filter((c) => c.resolution === 'UNRESOLVED').length,
    genericFallbackCount: input.fallbackAudit.entries.filter((e) => e.classification === 'GENERIC_FALLBACK').length,
    criticalGenericFallbackCount: input.fallbackAudit.criticalGenericFallbacks.length,
    blockers,
  };
}

export function assertExpressionReadinessForCompile(receipt: ImplementationExpressionReadinessReceipt): void {
  if (receipt.status === 'BLOCKED') {
    throw new Error(`IMPLEMENTATION_EXPRESSION_READINESS_BLOCKED:${receipt.blockers.join(',')}`);
  }
}
