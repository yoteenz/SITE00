import type {
  CommandQueueItem,
  ManifestRequirementRow,
  WorkstreamRow,
  RequirementClassification,
  ExecutionStatus,
} from './types.js';
import { countsTowardReadiness, isCompleteRequirement } from './types.js';

type QueueContext = {
  organizationSlug: string;
  organizationName: string;
  requirements: ManifestRequirementRow[];
  workstreams: WorkstreamRow[];
  overrides: Set<string>;
  pendingApprovals: number;
};

const CATEGORY_PRIORITY: Record<string, number> = {
  NEEDS_YOU: 1,
  BLOCKED: 2,
  RUNNING: 3,
  WAITING_ON_CLIENT: 4,
  WAITING_ON_EXTERNAL_SYSTEM: 5,
  UPCOMING: 6,
  POST_LAUNCH: 7,
};

export function buildCommandQueue(ctx: QueueContext): CommandQueueItem[] {
  const items: CommandQueueItem[] = [];
  const wsById = new Map(ctx.workstreams.map((w) => [w.id, w]));

  for (const r of ctx.requirements) {
    const ws = r.workstream_id ? wsById.get(r.workstream_id) : null;
    const complete = isCompleteRequirement(r.classification, r.execution_status, ctx.overrides.has(r.id));

    if (complete) continue;

    if (r.classification === 'DEFERRED_BY_OWNER' || r.classification === 'OPTIONAL_POST_LAUNCH') {
      items.push({
        category: 'POST_LAUNCH',
        organizationSlug: ctx.organizationSlug,
        organizationName: ctx.organizationName,
        workstreamTitle: ws?.title ?? null,
        requirementTitle: r.title,
        actionLabel: 'EVOLVE',
        priority: CATEGORY_PRIORITY.POST_LAUNCH,
        reason: r.why_required ?? 'Deferred to post-launch roadmap',
        requirementId: r.id,
        workstreamId: r.workstream_id,
      });
      continue;
    }

    if (r.classification === 'BLOCKED' || r.execution_status === 'BLOCKED') {
      items.push({
        category: 'BLOCKED',
        organizationSlug: ctx.organizationSlug,
        organizationName: ctx.organizationName,
        workstreamTitle: ws?.title ?? null,
        requirementTitle: r.title,
        actionLabel: 'RESOLVE',
        priority: CATEGORY_PRIORITY.BLOCKED,
        reason: r.blocking_impact ?? 'Blocked requirement',
        requirementId: r.id,
        workstreamId: r.workstream_id,
      });
      continue;
    }

    if (r.execution_status === 'IN_PROGRESS') {
      items.push({
        category: 'RUNNING',
        organizationSlug: ctx.organizationSlug,
        organizationName: ctx.organizationName,
        workstreamTitle: ws?.title ?? null,
        requirementTitle: r.title,
        actionLabel: 'CONTINUE',
        priority: CATEGORY_PRIORITY.RUNNING,
        reason: 'Active work in progress',
        requirementId: r.id,
        workstreamId: r.workstream_id,
      });
      continue;
    }

    if (r.execution_status === 'READY_FOR_REVIEW') {
      items.push({
        category: 'NEEDS_YOU',
        organizationSlug: ctx.organizationSlug,
        organizationName: ctx.organizationName,
        workstreamTitle: ws?.title ?? null,
        requirementTitle: r.title,
        actionLabel: 'REVIEW',
        priority: CATEGORY_PRIORITY.NEEDS_YOU,
        reason: 'Ready for admin review',
        requirementId: r.id,
        workstreamId: r.workstream_id,
      });
      continue;
    }

    if (
      countsTowardReadiness(r.classification) &&
      r.execution_status === 'NOT_STARTED'
    ) {
      items.push({
        category: 'UPCOMING',
        organizationSlug: ctx.organizationSlug,
        organizationName: ctx.organizationName,
        workstreamTitle: ws?.title ?? null,
        requirementTitle: r.title,
        actionLabel: 'PLAN',
        priority: CATEGORY_PRIORITY.UPCOMING,
        reason: 'Required for launch — not yet started',
        requirementId: r.id,
        workstreamId: r.workstream_id,
      });
    }
  }

  if (ctx.pendingApprovals > 0) {
    items.unshift({
      category: 'NEEDS_YOU',
      organizationSlug: ctx.organizationSlug,
      organizationName: ctx.organizationName,
      workstreamTitle: null,
      requirementTitle: 'Manifest Approval',
      actionLabel: 'APPROVE',
      priority: 0,
      reason: `${ctx.pendingApprovals} manifest(s) awaiting approval`,
      requirementId: null,
      workstreamId: null,
    });
  }

  return items.sort((a, b) => a.priority - b.priority);
}

export function buildNextActions(
  ctx: QueueContext & { workstreams: WorkstreamRow[] },
): Array<{
  organizationSlug: string;
  organizationName: string;
  status: ExecutionStatus | string;
  owner: string | null;
  nextAction: string;
  blocker: string | null;
  dueDate: string | null;
  attentionState: string;
  priority: number;
}> {
  const queue = buildCommandQueue(ctx);
  const actions: Array<{
    organizationSlug: string;
    organizationName: string;
    status: ExecutionStatus | string;
    owner: string | null;
    nextAction: string;
    blocker: string | null;
    dueDate: string | null;
    attentionState: string;
    priority: number;
  }> = [];

  for (const item of queue.slice(0, 20)) {
    const req = item.requirementId
      ? ctx.requirements.find((r) => r.id === item.requirementId)
      : null;
    actions.push({
      organizationSlug: item.organizationSlug,
      organizationName: item.organizationName,
      status: req?.execution_status ?? 'PENDING',
      owner: req?.owner_email ?? null,
      nextAction: `${item.actionLabel}: ${item.requirementTitle}`,
      blocker: item.category === 'BLOCKED' ? item.reason : null,
      dueDate: req?.deferred_until ?? null,
      attentionState: item.category === 'NEEDS_YOU' ? 'CRITICAL' : 'NORMAL',
      priority: item.priority,
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

export function categorizeRequirement(
  classification: RequirementClassification,
  executionStatus: ExecutionStatus,
): string {
  if (classification === 'DEFERRED_BY_OWNER' || classification === 'OPTIONAL_POST_LAUNCH') {
    return 'POST_LAUNCH';
  }
  if (classification === 'BLOCKED' || executionStatus === 'BLOCKED') return 'BLOCKED';
  if (executionStatus === 'READY_FOR_REVIEW') return 'NEEDS_YOU';
  if (executionStatus === 'IN_PROGRESS') return 'RUNNING';
  return 'UPCOMING';
}
