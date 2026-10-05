/**
 * QueueRoutingIntelligence — route by issue type, assignee model.
 */

import type {
  EvolveAssignee,
  EvolveIssueType,
  EvolveOperationalAction,
  EvolveOperationalPriority,
  EvolveProjectHealthResult,
  EvolveProjectOpsInput,
  EvolveQueueAssignment,
  EvolveQueueId,
  EvolveSpendState,
} from './types.js';

function routeForIssue(issueType: EvolveIssueType): EvolveAssignee {
  switch (issueType) {
    case 'BILLING_CREDITS':
      return 'SITE00_SUPPORT';
    case 'PROVIDER_FAILURE':
      return 'TECHNICAL_SPECIALIST';
    case 'CREATIVE_JUDGMENT':
      return 'CREATIVE_SPECIALIST';
    case 'CLIENT_APPROVAL_DELAY':
      return 'CLIENT';
    case 'DEADLINE_RISK':
      return 'PROJECT_OWNER';
    case 'TECHNICAL_IMPLEMENTATION':
      return 'TECHNICAL_SPECIALIST';
    case 'VIP_HIGH_RISK':
      return 'FOUNDER';
  }
}

function queueForIssue(
  issueType: EvolveIssueType,
  health: EvolveProjectHealthResult,
  priority: EvolveOperationalPriority,
): EvolveQueueId {
  if (priority.founderInterventionRequired && priority.score >= 60) return 'NEEDS_YOU_NOW';
  if (issueType === 'VIP_HIGH_RISK') return 'HIGH_VALUE_CLIENTS';
  if (issueType === 'PROVIDER_FAILURE') return 'REPEATED_FAILURES';
  if (issueType === 'BILLING_CREDITS') return 'SPEND_WATCH';
  if (health.health === 'WAITING_ON_CLIENT') return 'CLIENT_ACTION_REQUIRED';
  if (health.health === 'WAITING_ON_SITE00') return 'SITE00_ACTION_REQUIRED';
  if (health.health === 'SYSTEM_BLOCKED') return 'BLOCKED';
  if (health.health === 'AT_RISK' || health.health === 'STALLED') return 'AT_RISK';
  if (priority.band === 'CRITICAL') return 'NEEDS_YOU_NOW';
  return 'SYSTEM_CAN_HANDLE';
}

export function classifyIssueType(
  input: EvolveProjectOpsInput,
  health: EvolveProjectHealthResult,
  spend: EvolveSpendState,
): EvolveIssueType {
  if (
    input.servicePackage === 'GROWTH_PARTNER' ||
    input.servicePackage === 'AGENCY_ENTERPRISE' ||
    input.servicePackage === 'MARKETING_RETAINER'
  ) {
    if (health.health === 'AT_RISK' && input.launchUrgencyDays != null && input.launchUrgencyDays <= 1) {
      return 'VIP_HIGH_RISK';
    }
  }
  if (spend.health === 'SPEND_BLOCKED' || spend.health === 'LIMIT_REACHED') return 'BILLING_CREDITS';
  if (input.repeatedFailureCount >= 2 || input.lastFailureClass != null) return 'PROVIDER_FAILURE';
  if (health.waitingParty === 'CLIENT') return 'CLIENT_APPROVAL_DELAY';
  if (input.launchUrgencyDays != null && input.launchUrgencyDays <= 2) return 'DEADLINE_RISK';
  if (health.health === 'SYSTEM_BLOCKED') return 'TECHNICAL_IMPLEMENTATION';
  if (input.openReviewCount > 0) return 'CREATIVE_JUDGMENT';
  return 'TECHNICAL_IMPLEMENTATION';
}

export function routeOperationalIssue(
  input: EvolveProjectOpsInput,
  health: EvolveProjectHealthResult,
  spend: EvolveSpendState,
  priority: EvolveOperationalPriority,
): EvolveQueueAssignment {
  const issueType = classifyIssueType(input, health, spend);
  const queueId = queueForIssue(issueType, health, priority);
  const assignee = routeForIssue(issueType);

  return {
    queueId,
    assignee,
    issueType,
    priority,
    route: `/control/evolve-operations?project=${input.projectId}&queue=${queueId}`,
    title: `${input.projectName} — ${issueType.replace(/_/g, ' ')}`,
    summary: health.nextRecommendedAction ?? health.reasons[0]?.label ?? 'REVIEW REQUIRED',
  };
}

export function buildOperationalAction(
  input: EvolveProjectOpsInput,
  assignment: EvolveQueueAssignment,
  id?: string,
): EvolveOperationalAction {
  return {
    id: id ?? `action-${input.projectId}-${assignment.queueId}`,
    projectId: input.projectId,
    accountId: input.accountId,
    queueId: assignment.queueId,
    assignee: assignment.assignee,
    title: assignment.title,
    summary: assignment.summary,
    reasons: assignment.priority.reasons,
    priority: assignment.priority,
    route: assignment.route,
    createdAt: new Date().toISOString(),
    snoozedUntil: null,
    resolvedAt: null,
  };
}
