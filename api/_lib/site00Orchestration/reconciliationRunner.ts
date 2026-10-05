import type { InventoryFinding } from './repositoryInventory.js';
import type { EvidenceInsert } from './supabaseStore.js';
import type { ExecutionStatus, ReconciliationOutcome } from './types.js';

export function findingsToEvidence(
  orgId: string,
  findings: InventoryFinding[],
  repository: string,
  sourceCommit?: string,
): EvidenceInsert[] {
  return findings.map((f) => ({
    organization_id: orgId,
    evidence_type: f.evidence_type,
    title: f.title,
    description: f.description,
    source: 'github_repository_scan',
    repository,
    source_identifier: f.workstream_key ?? f.requirement_key ?? null,
    source_commit: sourceCommit ?? null,
    source_path: f.source_path,
    confidence: f.confidence,
    validation_type: 'REPOSITORY_SCAN',
    metadata: {
      workstream_key: f.workstream_key,
      requirement_key: f.requirement_key,
      does_not_imply_completion: true,
      ...f.metadata,
    },
  }));
}

export type ReconciliationSuggestion = {
  workstream_key: string;
  requirement_key?: string;
  declared_state: ExecutionStatus | string;
  suggested_state: ExecutionStatus | string;
  outcome: ReconciliationOutcome;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  reasoning: string[];
  evidence_titles: string[];
  launch_impact: string;
};

export function suggestWorkstreamReconciliation(input: {
  workstreamKey: string;
  requirementKey?: string;
  declaredState: string;
  findings: InventoryFinding[];
}): ReconciliationSuggestion {
  const related = input.findings.filter(
    (f) => f.workstream_key === input.workstreamKey || f.requirement_key === input.requirementKey,
  );

  const gap = related.find((f) => f.evidence_type === 'GAP_EVIDENCE');
  const stateHint = related.find((f) => f.metadata?.execution_status);
  const evidenceCount = related.filter((f) => f.evidence_type === 'WORKSTREAM_EVIDENCE').length;

  let suggested = input.declaredState;
  let outcome: ReconciliationOutcome = 'MISSING_EVIDENCE';
  let confidence: ReconciliationSuggestion['confidence'] = 'UNKNOWN';
  const reasoning: string[] = [];

  if (gap) {
    suggested = 'NOT_STARTED';
    outcome = 'REQUIRES_REVIEW';
    confidence = 'HIGH';
    reasoning.push(gap.description);
  } else if (stateHint?.metadata?.not_complete) {
    suggested = 'IN_PROGRESS';
    outcome = 'REQUIRES_REVIEW';
    confidence = 'HIGH';
    reasoning.push('Explicit state: work in progress, not complete');
  } else if (evidenceCount >= 2) {
    suggested = 'READY_FOR_REVIEW';
    outcome = 'PROBABLE';
    confidence = evidenceCount >= 3 ? 'HIGH' : 'MEDIUM';
    reasoning.push(`${evidenceCount} independent repository evidence items — does not imply completion`);
  } else if (evidenceCount === 1) {
    suggested = 'IN_PROGRESS';
    outcome = 'PROBABLE';
    confidence = 'LOW';
    reasoning.push('Single evidence source — naming/file presence only');
  } else {
    suggested = input.declaredState;
    outcome = 'MISSING_EVIDENCE';
    confidence = 'UNKNOWN';
    reasoning.push('Insufficient repository evidence');
  }

  return {
    workstream_key: input.workstreamKey,
    requirement_key: input.requirementKey,
    declared_state: input.declaredState,
    suggested_state: suggested,
    outcome,
    confidence,
    reasoning,
    evidence_titles: related.map((r) => r.title),
    launch_impact: outcome === 'REQUIRES_REVIEW' ? 'May affect readiness review' : 'Non-blocking until admin accepts',
  };
}

/** Evidence never auto-completes */
export function applySuggestionToRequirement(): null {
  return null;
}
