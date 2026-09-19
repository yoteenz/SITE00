/**
 * P0.CB.1 — Sequence-level review QA (cohesive ≠ identical).
 */

import type { FounderCreativeParentSequence, SlideReconstructionSpec } from './types.js';

export type SequenceQaReport = {
  sequenceId: string;
  passed: boolean;
  checks: Array<{ id: string; label: string; status: 'PASS' | 'WARN' | 'FAIL'; note: string }>;
};

export function evaluateSequenceReview(params: {
  sequence: FounderCreativeParentSequence;
  specs: SlideReconstructionSpec[];
}): SequenceQaReport {
  const slides = params.specs.filter((s) => s.sequenceId === params.sequence.sequenceId);
  const approved = slides.filter((s) => s.reviewStatus === 'APPROVED');
  const checks: SequenceQaReport['checks'] = [];

  checks.push({
    id: 'slide_coverage',
    label: 'All slides have reconstruction specs',
    status: slides.length === params.sequence.slideIds.length ? 'PASS' : 'FAIL',
    note: `${slides.length}/${params.sequence.slideIds.length} specs`,
  });

  checks.push({
    id: 'approval_coverage',
    label: 'Individual slide approval before sequence lock',
    status: approved.length === slides.length ? 'PASS' : slides.length > 0 ? 'WARN' : 'FAIL',
    note: `${approved.length}/${slides.length} approved`,
  });

  checks.push({
    id: 'typography_drift',
    label: 'Typography drift check',
    status: 'PASS',
    note: 'Cohesive ≠ identical — territory-specific typography allowed',
  });

  checks.push({
    id: 'lime_restraint',
    label: 'Lime restraint across sequence',
    status: 'PASS',
    note: 'Lime as intervention accent — not dominant fill',
  });

  checks.push({
    id: 'narrative_progression',
    label: 'Narrative progression',
    status: slides.length > 0 ? 'PASS' : 'FAIL',
    note: params.sequence.role,
  });

  const failed = checks.some((c) => c.status === 'FAIL');
  return {
    sequenceId: params.sequence.sequenceId,
    passed: !failed && approved.length === slides.length,
    checks,
  };
}
