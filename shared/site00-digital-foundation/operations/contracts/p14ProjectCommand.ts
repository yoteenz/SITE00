import type {
  ApprovalRecord,
  ClientActionRequest,
  DigitalFoundationArtifact,
  DigitalFoundationLead,
  DigitalFoundationQuote,
  OwnershipRecord,
  ProjectStageRecord,
} from '../../types.js';
import type {
  DigitalFoundationExecutionTask,
  DigitalFoundationRunbook,
  DigitalFoundationVerificationResult,
  ProjectForecast,
} from '../types.js';
import { extractBlockers } from '../blockers.js';

export type ProjectCommandSnapshot = {
  artifact: DigitalFoundationArtifact;
  lead: DigitalFoundationLead;
  purchased_scope: DigitalFoundationQuote | null;
  runbook: DigitalFoundationRunbook | null;
  tasks: DigitalFoundationExecutionTask[];
  stages: ProjectStageRecord[];
  client_actions: ClientActionRequest[];
  approvals: ApprovalRecord[];
  blockers: ReturnType<typeof extractBlockers>;
  forecast: ProjectForecast | null;
  ownership_record: OwnershipRecord | null;
  verification_results: DigitalFoundationVerificationResult[];
};

export function projectCommandAnswers(snapshot: ProjectCommandSnapshot) {
  return {
    what_did_they_buy: snapshot.purchased_scope?.selected_addons ?? [],
    what_has_been_done: snapshot.tasks.filter((t) => t.status === 'COMPLETE' || t.status === 'VERIFIED').map((t) => t.title),
    what_is_happening_now: snapshot.tasks.find((t) => t.status === 'IN_PROGRESS')?.title ?? null,
    what_is_blocked: snapshot.blockers,
    what_client_owes: snapshot.client_actions.filter((c) => c.status === 'OPEN').map((c) => c.title),
    what_we_owe_client: snapshot.tasks.filter((t) => t.status === 'READY' && t.execution_mode !== 'CLIENT_ACTION').map((t) => t.title),
    current_forecast: snapshot.forecast,
    needs_approval: snapshot.approvals.filter((a) => a.status === 'REQUESTED'),
    deliverable_state: snapshot.ownership_record,
  };
}
