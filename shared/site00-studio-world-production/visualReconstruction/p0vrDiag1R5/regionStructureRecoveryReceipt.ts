/**
 * P0.VR.DIAG.1R5B — Single-region structure recovery before/after receipt.
 */

export type RegionStructureRecoveryReceipt = {
  regionId: string;
  anchorsBefore: number;
  anchorsAfter: number;
  measurementsBefore: number;
  measurementsAfter: number;
  qualifiedBefore: number;
  qualifiedAfter: number;
  depthBefore: string;
  depthAfter: string;
  failureBefore?: string;
  failureAfter?: string;
  status: 'IMPROVED' | 'UNCHANGED' | 'BLOCKED';
  rootCause?: string;
};

export function buildRegionStructureRecoveryReceipt(input: {
  regionId: string;
  anchorsBefore: number;
  anchorsAfter: number;
  measurementsBefore: number;
  measurementsAfter: number;
  qualifiedBefore: number;
  qualifiedAfter: number;
  depthBefore: string;
  depthAfter: string;
  failureBefore?: string;
  failureAfter?: string;
}): RegionStructureRecoveryReceipt {
  const improved =
    input.anchorsAfter > input.anchorsBefore ||
    input.qualifiedAfter > input.qualifiedBefore ||
    (input.depthBefore !== input.depthAfter && input.depthAfter === 'SUFFICIENT');
  const status: RegionStructureRecoveryReceipt['status'] = improved
    ? 'IMPROVED'
    : input.failureAfter
      ? 'BLOCKED'
      : 'UNCHANGED';
  return {
    ...input,
    status,
    rootCause: input.failureAfter,
  };
}
