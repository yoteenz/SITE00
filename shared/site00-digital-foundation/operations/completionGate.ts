import type { ApprovalRecord } from '../types.js';
import type {
  DigitalFoundationExecutionTask,
  DigitalFoundationRunbook,
  DigitalFoundationVerificationResult,
  DigitalFoundationVerificationRule,
} from './types.js';
import { allRequiredRulesPass } from './verificationEngine.js';

export type CompletionGateResult =
  | { ok: true }
  | { ok: false; code: string; reasons: string[] };

export function assessCompletionGate(input: {
  runbook: DigitalFoundationRunbook | null;
  tasks: DigitalFoundationExecutionTask[];
  rules: DigitalFoundationVerificationRule[];
  verification_results: DigitalFoundationVerificationResult[];
  approvals: ApprovalRecord[];
  manual_overrides: Set<string>;
  ownership_present: boolean;
}): CompletionGateResult {
  const reasons: string[] = [];
  if (
    !input.runbook ||
    (input.runbook.status !== 'ACTIVE' &&
      input.runbook.status !== 'VERIFYING' &&
      input.runbook.status !== 'COMPLETE')
  ) {
    reasons.push('RUNBOOK_NOT_ACTIVE');
  }

  const requiredTasks = input.tasks.filter(
    (t) => t.status !== 'SKIPPED' && t.status !== 'SUPERSEDED' && t.task_type !== 'FOUNDATION_COMPLETION',
  );
  const incomplete = requiredTasks.filter((t) => t.status !== 'COMPLETE' && t.status !== 'VERIFIED');
  if (incomplete.length > 0) {
    reasons.push(`TASKS_INCOMPLETE:${incomplete.length}`);
  }

  if (!allRequiredRulesPass(input.rules, input.verification_results, input.manual_overrides)) {
    reasons.push('VERIFICATION_REQUIRED');
  }

  const pendingApprovals = input.approvals.filter((a) => a.status === 'REQUESTED');
  if (pendingApprovals.some((a) => a.subject.toLowerCase().includes('signature') || a.subject.toLowerCase().includes('domain'))) {
    reasons.push('APPROVALS_PENDING');
  }

  if (!input.ownership_present) {
    reasons.push('OWNERSHIP_RECORD_MISSING');
  }

  if (reasons.length > 0) return { ok: false, code: 'COMPLETION_GATE_FAILED', reasons };
  return { ok: true };
}
