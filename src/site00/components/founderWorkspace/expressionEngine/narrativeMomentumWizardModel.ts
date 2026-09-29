import type {
  NarrativeEvidenceObject,
  NarrativeMomentumPlan,
  NarrativeValidationIssue,
} from '../../../../../shared/site00-expression-engine/narrative-momentum/types.js';

export const NME_WIZARD_STEP_COUNT = 6 as const;

export const NME_WIZARD_STEPS = [
  { id: 1 as const, code: '01', chapter: 'SHIFT', title: 'STORY SHIFT', nav: '01 / SHIFT', slug: 'story-shift', question: 'What changes in the viewer?' },
  { id: 2 as const, code: '02', chapter: 'BEATS', title: 'BEAT MAP', nav: '02 / BEATS', slug: 'beat-map', question: 'How does the story move beat by beat?' },
  { id: 3 as const, code: '03', chapter: 'PROOF', title: 'TENSION + PROOF', nav: '03 / PROOF', slug: 'tension-proof', question: 'Where does tension peak — and what proves it?' },
  { id: 4 as const, code: '04', chapter: 'REFRAME', title: 'REFRAME + OPEN LOOP', nav: '04 / REFRAME', slug: 'reframe-loop', question: 'Where does the audience land — and what stays open?' },
  { id: 5 as const, code: '05', chapter: 'FORMATS', title: 'FORMAT ADAPTATION', nav: '05 / FORMATS', slug: 'formats', question: 'How does this become reel and carousel?' },
  { id: 6 as const, code: '06', chapter: 'REVIEW', title: 'REVIEW + JUDGMENT', nav: '06 / REVIEW', slug: 'review', question: 'Ready to approve this narrative?' },
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

export type NmeChipTone = 'valid' | 'warn' | 'review' | 'muted';

export function tensionTone(stage: string): string {
  return stage.toLowerCase();
}

/** Short tension labels for the 7-column curve axis. */
export function tensionAxisLabel(stage: string): string {
  return stage === 'INTERRUPTION' ? 'INTERRUPT' : stage;
}

/** Y position (0 = floor, 1 = peak) for the tension curve. */
export function tensionLevel(stage: string): number {
  const map: Record<string, number> = {
    LOW: 0.06,
    RISING: 0.24,
    INTERRUPTION: 0.4,
    ESCALATION: 0.66,
    PEAK: 1,
    RELEASE: 0.52,
    RESIDUAL: 0.3,
  };
  return map[stage] ?? 0.4;
}

/** Evidence imagery for a beat (1-based order) cycled over the available Entry 002 frames. */
export function pickBeatImages(images: readonly string[], order: number, count = 1): string[] {
  if (!images.length) return [];
  return Array.from({ length: count }, (_, i) => images[(order - 1 + i) % images.length]!);
}
