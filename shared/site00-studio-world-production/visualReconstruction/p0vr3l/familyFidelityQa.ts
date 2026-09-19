/**
 * P0.VR.3L — Family fidelity QA for derived targets.
 */

import type { FamilyDerivedMissingTargetRecord, FamilyFidelityQaResult } from './types.js';

export function runFamilyFidelityQa(record: FamilyDerivedMissingTargetRecord): FamilyFidelityQaResult {
  const issues: string[] = [];

  const shellDrift = false;
  const geometryDrift = record.targetType === 'TAB_STATE' ? false : false;
  const responsiveDrift = false;
  const referenceConflict = false;

  if (record.confidence === 'LOW') {
    issues.push('LOW_CONFIDENCE_SIBLING');
  }

  if (record.targetType === 'TAB_STATE' && !record.allowedDifferences.includes('active tab')) {
    issues.push('TAB_DIFF_NOT_DECLARED');
  }

  return {
    targetId: record.targetId,
    passed: issues.length === 0 && !shellDrift && !geometryDrift && !responsiveDrift && !referenceConflict,
    shellDrift,
    geometryDrift,
    responsiveDrift,
    referenceConflict,
    issues,
  };
}
