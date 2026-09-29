import type {
  NarrativeEvidenceObject,
  NarrativeMomentumPlan,
  NarrativeValidationIssue,
} from '../../../../../shared/site00-expression-engine/narrative-momentum/types.js';

export const NME_WIZARD_STEP_COUNT = 6 as const;

export const NME_WIZARD_STEPS = [
  { id: 1 as const, code: '01', chapter: 'SHIFT', nav: '01 / SHIFT', slug: 'story-shift', question: 'What changes in the viewer?' },
  { id: 2 as const, code: '02', chapter: 'BEATS', nav: '02 / BEATS', slug: 'beat-map', question: 'How does the story move beat by beat?' },
  { id: 3 as const, code: '03', chapter: 'PROOF', nav: '03 / PROOF', slug: 'tension-proof', question: 'Where does tension peak — and what proves it?' },
  { id: 4 as const, code: '04', chapter: 'REFRAME', nav: '04 / REFRAME', slug: 'reframe-loop', question: 'Where does the audience land — and what stays open?' },
  { id: 5 as const, code: '05', chapter: 'FORMATS', nav: '05 / FORMATS', slug: 'formats', question: 'How does this become reel and carousel?' },
  { id: 6 as const, code: '06', chapter: 'REVIEW', nav: '06 / REVIEW', slug: 'review', question: 'Ready to approve this narrative?' },
];

/** Visual QA flag id — generic SaaS drift (see sprint NDXBOOK art direction). */
export const NDX_NARRATIVE_GENERIC_UI_DRIFT = 'NDX_NARRATIVE_GENERIC_UI_DRIFT' as const;

export type NmeWizardStep = (typeof NME_WIZARD_STEPS)[number]['id'];

export const ENTRY_002_NME_DISPLAY_TITLE = 'OH, NOW IT WAS FUN?';

export function proofStatusChip(status: NarrativeEvidenceObject['status']): string {
  if (status === 'SOURCE_REQUIRED') return 'SOURCE NEEDED';
  if (status === 'VERIFIED_SOURCE') return 'VERIFIED';
  if (status === 'SOURCE_AVAILABLE' || status === 'FOUNDER_SUPPLIED') return 'AVAILABLE';
  if (status === 'DERIVED_COMPARISON') return 'DERIVED';
  return String(status).replace(/_/g, ' ');
}

export function summarizeProofStatus(evidence: readonly NarrativeEvidenceObject[]): {
  verified: number;
  sourceNeeded: number;
  total: number;
} {
  const total = evidence.length;
  const sourceNeeded = evidence.filter((e) => e.status === 'SOURCE_REQUIRED').length;
  const verified = evidence.filter((e) => e.status === 'VERIFIED_SOURCE' || e.status === 'DERIVED_COMPARISON').length;
  return { verified, sourceNeeded, total };
}

export function stepHasFlagWarning(step: NmeWizardStep, issues: readonly NarrativeValidationIssue[]): boolean {
  if (!issues.length) return false;
  if (step === 3) return issues.some((i) => i.flagId === 'PROOF_SOURCE_GAP' || i.flagId === 'TENSION_SEQUENCE_INCOHERENT');
  if (step === 6) return issues.some((i) => i.severity === 'WARNING' || i.severity === 'BLOCKING' || i.blocking);
  return false;
}

export function deriveNarrativeApprovalReadiness(
  plan: NarrativeMomentumPlan,
  issues: readonly NarrativeValidationIssue[],
): {
  ready: boolean;
  headline: string;
  blockers: string[];
} {
  const blockers: string[] = [];
  const evidence = plan.evidence ?? [];
  const primaryNeedsSource = evidence.filter((e) => e.strength === 'PRIMARY' && e.status === 'SOURCE_REQUIRED');
  if (primaryNeedsSource.length) {
    blockers.push(`${primaryNeedsSource.length} PRIMARY PROOF SOURCE REQUIRED`);
  }
  for (const issue of issues) {
    if (issue.blocking || issue.severity === 'BLOCKING') {
      blockers.push(issue.flagId.replace(/_/g, ' '));
    }
  }
  const tensionIssues = issues.filter((i) => i.flagId === 'TENSION_SEQUENCE_INCOHERENT' && i.severity !== 'INFO');
  if (tensionIssues.length) {
    blockers.push('TENSION SEQUENCE NEEDS REVIEW');
  }
  const ready = blockers.length === 0;
  return {
    ready,
    headline: ready ? 'READY TO APPROVE' : 'NARRATIVE APPROVAL BLOCKED',
    blockers,
  };
}

export function tensionSequenceValid(issues: readonly NarrativeValidationIssue[]): boolean {
  return !issues.some((i) => i.flagId === 'TENSION_SEQUENCE_INCOHERENT' && (i.blocking || i.severity === 'BLOCKING'));
}
