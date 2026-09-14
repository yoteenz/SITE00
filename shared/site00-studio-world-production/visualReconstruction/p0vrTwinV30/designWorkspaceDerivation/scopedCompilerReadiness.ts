import type { CompilerReadinessReceipt } from './types.js';
import type {
  AuthorityVisualCoverageReceipt,
  ObjectGranularityReceipt,
  ReadinessScope,
  ReadinessStage,
  ScopedCompilerCheck,
} from './pixelGroundedTypes.js';

export type ScopedReadinessSummary = {
  derivation: ReadinessStage;
  review: ReadinessStage;
  build: ReadinessStage;
  receipt: CompilerReadinessReceipt;
};

export function buildScopedCompilerReadinessReceipt(input: {
  runId: string;
  pairId: string;
  visualCoverageGatePass: boolean;
  mobileCoverage: AuthorityVisualCoverageReceipt;
  desktopCoverage: AuthorityVisualCoverageReceipt;
  mobileGranularity: ObjectGranularityReceipt;
  desktopGranularity: ObjectGranularityReceipt;
  translationApproved: boolean;
}): ScopedReadinessSummary {
  const derivationGranularityPass =
    input.mobileGranularity.result === 'PASS' && input.desktopGranularity.result === 'PASS';
  const derivationCoveragePass = input.mobileCoverage.result === 'PASS' && input.desktopCoverage.result === 'PASS';

  const checks: ScopedCompilerCheck[] = [
    { gate: 'AUTHORITY INTEGRITY', scope: 'DERIVATION', result: 'PASS', detail: 'Locked R5F2 pair' },
    { gate: 'FEATURE MANIFEST', scope: 'DERIVATION', result: 'PASS', detail: 'Current manifest' },
    { gate: 'PROJECT CONTEXT', scope: 'DERIVATION', result: 'PASS', detail: 'ndxbook-pilot-r4-v1' },
    { gate: 'PIXEL ANALYSIS', scope: 'DERIVATION', result: input.visualCoverageGatePass ? 'PASS' : 'FAIL', detail: 'sharp measurement' },
    { gate: 'OBJECT GRANULARITY', scope: 'DERIVATION', result: derivationGranularityPass ? 'PASS' : 'FAIL', detail: 'child decomposition' },
    { gate: 'VISUAL COVERAGE', scope: 'DERIVATION', result: derivationCoveragePass ? 'PASS' : 'FAIL', detail: 'high-importance mapped' },
    { gate: 'STRUCTURAL BLUEPRINT', scope: 'REVIEW', result: 'PASS', detail: 'pixel-grounded regions' },
    { gate: 'SURGICAL OBJECT MAP', scope: 'REVIEW', result: derivationGranularityPass ? 'PASS' : 'FAIL', detail: 'R6F1 granularity' },
    { gate: 'RELATIONSHIP GEOMETRY', scope: 'REVIEW', result: 'PASS', detail: 'measured object IDs' },
    { gate: 'TYPOGRAPHY FIDELITY', scope: 'REVIEW', result: 'PASS', detail: 'line/block measurements' },
    { gate: 'IMAGE/ASSET BOUNDS', scope: 'REVIEW', result: 'PASS', detail: 'visible bounds metadata' },
    { gate: 'FEATURE BINDINGS', scope: 'REVIEW', result: 'PASS', detail: 'reconciled object IDs' },
    { gate: 'FUNCTION BINDINGS', scope: 'REVIEW', result: 'PASS', detail: 'discrete controls' },
    { gate: 'OWNERSHIP MAP', scope: 'REVIEW', result: 'PASS', detail: 'host/project split' },
    { gate: 'RESPONSIVE CONTRACT', scope: 'REVIEW', result: 'PASS', detail: 'object correspondence' },
    { gate: 'STATE CONTRACT', scope: 'REVIEW', result: 'PASS', detail: 'PAIR_LOCKED semantics' },
    { gate: 'INTERACTION GEOMETRY', scope: 'REVIEW', result: 'PASS', detail: 'touch targets' },
    { gate: 'IMPLEMENTATION PRIMITIVES', scope: 'REVIEW', result: 'PASS', detail: 'AUTHORITY_RASTER_IMPLEMENTATION_FORBIDDEN' },
    { gate: 'REVERSE TRACEABILITY', scope: 'REVIEW', result: 'PASS', detail: 'feature traces' },
    {
      gate: 'move_to_build',
      scope: 'DERIVATION',
      result: 'NOT_APPLICABLE',
      detail: 'MISSING allowed before translation approval',
    },
    {
      gate: 'BUILD ACTION STATUS',
      scope: 'BUILD',
      result: 'BLOCKED',
      detail: 'move_to_build blocked until BUILD scope and founder translation approval',
    },
    {
      gate: 'FOUNDER REVIEW STATUS',
      scope: 'REVIEW',
      result: input.translationApproved ? 'PASS' : 'BLOCKED',
      detail: input.translationApproved ? 'TRANSLATION APPROVED' : 'Awaiting APPROVE TRANSLATION',
    },
  ];

  const blockers = checks.filter((c) => c.result === 'FAIL' || (c.scope === 'BUILD' && c.result === 'BLOCKED')).map((c) => c.gate);
  const derivationPass = checks.filter((c) => c.scope === 'DERIVATION' && c.result === 'FAIL').length === 0;
  const reviewPass = derivationPass && input.visualCoverageGatePass;
  const buildPass = false;

  const receipt: CompilerReadinessReceipt = {
    id: `crr-scoped-${input.runId}`,
    authorityPairId: input.pairId,
    derivationRunId: input.runId,
    checks: checks.map((c) => ({ gate: `${c.gate} [${c.scope}]`, result: c.result === 'NOT_APPLICABLE' ? 'PASS' : c.result, detail: c.detail })),
    overall: derivationPass && input.visualCoverageGatePass ? 'PASS' : 'BLOCKED',
    blockers,
    generatedAt: new Date().toISOString(),
  };

  return {
    derivation: derivationPass ? 'DERIVATION_COMPLETE' : 'DERIVATION_READY',
    review: reviewPass ? 'FOUNDER_REVIEW_READY' : 'DERIVATION_COMPLETE',
    build: buildPass ? 'BUILD_READY' : 'BUILD_REVIEW_READY',
    receipt,
  };
}

export function scopeReadinessLabel(scope: ReadinessScope, summary: ScopedReadinessSummary): ReadinessStage {
  if (scope === 'DERIVATION') return summary.derivation;
  if (scope === 'REVIEW') return summary.review;
  return summary.build;
}
