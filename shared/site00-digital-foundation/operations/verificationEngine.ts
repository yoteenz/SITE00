import { randomUUID } from 'node:crypto';
import type {
  DigitalFoundationVerificationResult,
  DigitalFoundationVerificationRule,
  VerificationStatus,
} from './types.js';

export function evaluateVerificationRule(
  rule: DigitalFoundationVerificationRule,
  observed: { current_value?: string | null; pass?: boolean },
): DigitalFoundationVerificationResult {
  let status: VerificationStatus = 'NOT_RUN';
  let detail: string | null = null;
  if (observed.pass === true) {
    status = 'PASS';
    rule.match_state = rule.expected_value ? 'MATCH' : 'MATCH';
    rule.current_value = observed.current_value ?? rule.expected_value;
  } else if (observed.pass === false) {
    status = 'FAIL';
    rule.match_state = 'MISMATCH';
    rule.current_value = observed.current_value ?? null;
    detail = 'Expected state not achieved';
  }
  return {
    result_id: randomUUID(),
    rule_id: rule.rule_id,
    artifact_id: rule.artifact_id,
    status,
    detail,
    manual_override: false,
    manual_override_reason: null,
    actor: null,
    ran_at: new Date().toISOString(),
  };
}

export function allRequiredRulesPass(
  rules: DigitalFoundationVerificationRule[],
  results: DigitalFoundationVerificationResult[],
  overrides: Set<string>,
): boolean {
  const byRule = new Map(results.map((r) => [r.rule_id, r]));
  for (const rule of rules.filter((r) => r.required)) {
    if (overrides.has(rule.rule_id)) continue;
    const res = byRule.get(rule.rule_id);
    if (!res || (res.status !== 'PASS' && res.status !== 'MANUAL_CONFIRMATION_REQUIRED')) {
      return false;
    }
  }
  return true;
}
