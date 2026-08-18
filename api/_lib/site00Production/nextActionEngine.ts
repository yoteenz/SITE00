import type { ActionPriority, NextActionRow } from './types.js';
import type { DeliverableReadinessResult, ProjectReadinessGraph, StructuredBlocker } from './readinessTypes.js';

type FeedbackCtx = { id: string; body: string };

export function computeNextActionsFromReadiness(input: {
  project: { id: string; slug: string; name: string; payment_state: string; provisioning_state: string };
  readiness: ProjectReadinessGraph;
  pendingApprovals: number;
  feedback: FeedbackCtx[];
}): Omit<NextActionRow, 'id' | 'created_at' | 'resolved_at'>[] {
  const actions: Omit<NextActionRow, 'id' | 'created_at' | 'resolved_at'>[] = [];
  const base = `/admin/site00/projects/${input.project.id}`;

  for (const d of input.readiness.deliverables) {
    if (d.overall === 'ready' && d.deliverable_key === 'homepage_visual_direction') {
      actions.push({
        project_id: input.project.id,
        action_type: 'GENERATE_BRIEF',
        priority: 'HIGH',
        title: 'HOMEPAGE ART DIRECTION CAN NOW BE GENERATED.',
        reason: 'ALL READINESS DIMENSIONS SATISFIED FOR HOMEPAGE ART DIRECTION.',
        dependency: null,
        destination: `${base}/studio`,
        metadata: { deliverableKey: d.deliverable_key },
      });
    }

    if (d.overall === 'ready' && d.deliverable_key === 'backend_build') {
      actions.push({
        project_id: input.project.id,
        action_type: 'OPEN_STUDIO',
        priority: 'HIGH',
        title: 'BACKEND IMPLEMENTATION IS NOW READY TO BEGIN.',
        reason: 'SUPABASE ACCESS AND DEPENDENCIES ARE SATISFIED.',
        dependency: null,
        destination: `${base}/studio`,
        metadata: { deliverableKey: d.deliverable_key },
      });
    }
  }

  for (const b of input.readiness.blockers) {
    if (b.type === 'access' && b.owner === 'client') {
      actions.push({
        project_id: input.project.id,
        action_type: b.action_type ?? 'REQUEST_ACCESS',
        priority: mapSeverity(b.severity),
        title: b.reason.toUpperCase(),
        reason: `SERVICE ACCESS BLOCKS PRODUCTION: ${b.service_key?.toUpperCase() ?? 'SERVICE'}.`,
        dependency: b.service_key?.toUpperCase() ?? null,
        destination: b.action_route ?? `${base}/access`,
        metadata: { serviceKey: b.service_key, blockerId: b.id },
      });
    }

    if (b.type === 'dependency') {
      const mobile = input.readiness.deliverables.find((x) => x.deliverable_key === 'mobile_adaptation');
      if (mobile && b.dependency_id === 'homepage_visual_direction') {
        actions.push({
          project_id: input.project.id,
          action_type: 'REVIEW_DESKTOP',
          priority: 'MEDIUM',
          title: 'MOBILE ADAPTATION BLOCKED BY DESKTOP APPROVAL.',
          reason: b.reason.toUpperCase(),
          dependency: 'HOMEPAGE VISUAL DIRECTION',
          destination: `${base}/approvals`,
          metadata: { deliverableKey: 'mobile_adaptation' },
        });
      }
    }
  }

  for (const fb of input.feedback) {
    actions.push({
      project_id: input.project.id,
      action_type: 'REVIEW_FEEDBACK',
      priority: 'HIGH',
      title: 'CLIENT FEEDBACK RECEIVED.',
      reason: fb.body.slice(0, 120).toUpperCase(),
      dependency: null,
      destination: `${base}/approvals`,
      metadata: { feedbackId: fb.id },
    });
  }

  if (input.project.payment_state === 'CONFIRMED' && input.project.provisioning_state === 'NOT_STARTED') {
    actions.push({
      project_id: input.project.id,
      action_type: 'START_PROVISIONING',
      priority: 'HIGH',
      title: 'PAYMENT CONFIRMED — PROVISIONING CAN BEGIN.',
      reason: 'CLIENT PROVISIONING FLOW SHOULD BE UNLOCKED.',
      dependency: 'PAYMENT CONFIRMED',
      destination: `/project/${input.project.slug}/provisioning`,
      metadata: {},
    });
  }

  if (input.pendingApprovals > 0) {
    actions.push({
      project_id: input.project.id,
      action_type: 'REVIEW_APPROVALS',
      priority: 'MEDIUM',
      title: `${input.pendingApprovals} ITEMS WAITING FOR ADMIN DECISION.`,
      reason: 'CENTRAL APPROVAL DESK HAS PENDING REVIEWS.',
      dependency: null,
      destination: '/admin/site00/approvals',
      metadata: { count: input.pendingApprovals },
    });
  }

  return sortByPriority(dedupeActions(actions));
}

function mapSeverity(s: StructuredBlocker['severity']): ActionPriority {
  const map: Record<string, ActionPriority> = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  };
  return map[s] ?? 'MEDIUM';
}

function dedupeActions(
  actions: Omit<NextActionRow, 'id' | 'created_at' | 'resolved_at'>[],
): Omit<NextActionRow, 'id' | 'created_at' | 'resolved_at'>[] {
  const seen = new Set<string>();
  return actions.filter((a) => {
    const key = `${a.action_type}:${a.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortByPriority(
  actions: Omit<NextActionRow, 'id' | 'created_at' | 'resolved_at'>[],
): Omit<NextActionRow, 'id' | 'created_at' | 'resolved_at'>[] {
  const order: Record<ActionPriority, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return [...actions].sort((a, b) => order[a.priority] - order[b.priority]);
}

/** @deprecated Use computeNextActionsFromReadiness */
export { computeNextActionsFromReadiness as computeNextActions };
