import type { BlockedReason } from './types.js';

export type LedgerGenerationRow = {
  generation_mode?: string | null;
  mode?: string | null;
  generation_class?: string | null;
  credits_spent?: number | null;
  dispatch_status?: string | null;
  blocked_reason?: string | null;
  reference_required?: boolean | null;
  reference_found?: boolean | null;
  reference_input_attached?: boolean | null;
  failure_class?: string | null;
  qa_status?: string | null;
};

export type LedgerCostMetrics = {
  referenceGuidedGenerations: number;
  textToImageNetNewGenerations: number;
  referenceRequiredItems: number;
  referenceBoundItems: number;
  referenceMissingBlocked: number;
  referenceBindingFailuresPrevented: number;
  invalidGenerationModeBlocked: number;
  invalidGenerationsPostmortem: number;
  creditsAvoidedByReferenceGate: number;
  invalidGenerationCredits: number;
  referenceGuidedCredits: number;
  netNewTextToImageCredits: number;
  recoveryCredits: number;
};

const BLOCKED_REASONS_AVOID: readonly BlockedReason[] = [
  'REFERENCE_MISSING',
  'REFERENCE_BINDING_FAILURE_PREVENTED',
  'INVALID_GENERATION_MODE',
  'CROSS_PROJECT_REFERENCE_DENIED',
  'PROVIDER_REFERENCE_UNSUPPORTED',
  'REFERENCE_FILE_CORRUPT',
  'REFERENCE_RESOLUTION_FAILED',
];

function modeOf(row: LedgerGenerationRow): string {
  return (row.generation_mode ?? row.mode ?? '').toLowerCase();
}

export function aggregateLedgerMetrics(rows: readonly LedgerGenerationRow[]): LedgerCostMetrics {
  const m: LedgerCostMetrics = {
    referenceGuidedGenerations: 0,
    textToImageNetNewGenerations: 0,
    referenceRequiredItems: 0,
    referenceBoundItems: 0,
    referenceMissingBlocked: 0,
    referenceBindingFailuresPrevented: 0,
    invalidGenerationModeBlocked: 0,
    invalidGenerationsPostmortem: 0,
    creditsAvoidedByReferenceGate: 0,
    invalidGenerationCredits: 0,
    referenceGuidedCredits: 0,
    netNewTextToImageCredits: 0,
    recoveryCredits: 0,
  };

  for (const row of rows) {
    const credits = row.credits_spent ?? 0;
    const dispatch = row.dispatch_status ?? '';
    const blocked = row.blocked_reason ?? '';

    if (row.reference_required) m.referenceRequiredItems += 1;
    if (row.reference_found && row.reference_input_attached) m.referenceBoundItems += 1;

    if (dispatch === 'INVALID_GENERATION_POSTMORTEM' || row.failure_class === 'REFERENCE_BINDING_FAILURE') {
      m.invalidGenerationsPostmortem += 1;
      m.invalidGenerationCredits += credits;
      continue;
    }

    if (dispatch === 'BLOCKED' || credits === 0) {
      if (blocked === 'REFERENCE_MISSING') m.referenceMissingBlocked += 1;
      if (blocked === 'REFERENCE_BINDING_FAILURE_PREVENTED') m.referenceBindingFailuresPrevented += 1;
      if (blocked === 'INVALID_GENERATION_MODE') m.invalidGenerationModeBlocked += 1;
      if (BLOCKED_REASONS_AVOID.includes(blocked as BlockedReason)) {
        m.creditsAvoidedByReferenceGate += row.credits_spent === 0 ? 0 : credits;
      }
      continue;
    }

    const mode = modeOf(row);
    if (mode === 'reference_guided' || mode === 'image2image') {
      m.referenceGuidedGenerations += 1;
      m.referenceGuidedCredits += credits;
    } else if (mode === 'text_to_image_net_new' || mode === 'text2image') {
      if (row.reference_required) {
        m.invalidGenerationsPostmortem += 1;
        m.invalidGenerationCredits += credits;
      } else {
        m.textToImageNetNewGenerations += 1;
        m.netNewTextToImageCredits += credits;
      }
    }

    if (row.generation_class === 'RECOVERY') m.recoveryCredits += credits;
  }

  return m;
}
