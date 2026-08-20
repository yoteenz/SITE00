/** Deterministic next-best-action prioritization */

import type {
  CommandCategory,
  MarketingChannelRow,
  MarketingProfileRow,
  NextBestAction,
} from './types.js';

type NBAInput = {
  orgSlug: string;
  orgName: string;
  profile: MarketingProfileRow | undefined;
  channels: MarketingChannelRow[];
  blockers: Array<{ label: string; detail: string }>;
  opportunities: Array<{ label: string; detail: string }>;
  pendingApprovals: number;
  productionCount: number;
};

export function buildNextBestActions(input: NBAInput): NextBestAction[] {
  const actions: NextBestAction[] = [];
  let rank = 1;
  const route = `/admin/site00/orchestration/${input.orgSlug}/evolve`;

  if (input.pendingApprovals > 0) {
    actions.push({
      rank: rank++,
      category: 'NEEDS_YOU',
      title: `Approve ${input.pendingApprovals} marketing item(s)`,
      reason: 'Human approval required before production or publishing',
      source: 'APPROVAL_QUEUE',
      dependency: null,
      objectiveRelationship: input.profile?.primary_objective ?? null,
      route: `${route}?tab=approvals`,
      priority: 10,
    });
  }

  if (input.profile?.marketing_maturity === 'ASSESSMENT_REQUIRED') {
    actions.push({
      rank: rank++,
      category: 'NEEDS_YOU',
      title: 'Complete Marketing Assessment',
      reason: 'Assessment establishes objectives, channel priorities, and manifest',
      source: 'MARKETING_ASSESSMENT',
      dependency: null,
      objectiveRelationship: input.profile.primary_objective,
      route,
      priority: 20,
    });
  }

  for (const b of input.blockers) {
    if (b.label.includes('DEFERRED')) continue;
    actions.push({
      rank: rank++,
      category: 'BLOCKED',
      title: b.label,
      reason: b.detail,
      source: 'CHANNEL_BLOCKER',
      dependency: b.label,
      objectiveRelationship: input.profile?.primary_objective ?? null,
      route,
      priority: 30,
    });
  }

  if (input.productionCount > 0) {
    actions.push({
      rank: rank++,
      category: 'RUNNING',
      title: `${input.productionCount} Studio World production request(s) in progress`,
      reason: 'Creative production underway via Studio World bridge',
      source: 'PRODUCTION_BRIDGE',
      dependency: null,
      objectiveRelationship: null,
      route: `${route}?tab=production`,
      priority: 40,
    });
  }

  const deferredSocial = input.channels.filter((c) => c.channel_state === 'DEFERRED' && c.owner_decision === 'DEFERRED_BY_OWNER');
  for (const d of deferredSocial) {
    actions.push({
      rank: rank++,
      category: 'DEFERRED',
      title: `${d.channel_key} marketing — deferred by owner`,
      reason: d.notes ?? 'Owner decision — not a blocker',
      source: 'OWNER_DECISION',
      dependency: null,
      objectiveRelationship: null,
      route,
      priority: 90,
    });
  }

  if (input.profile?.strategy_status === 'NOT_STARTED' && input.profile.marketing_maturity !== 'ASSESSMENT_REQUIRED') {
    actions.push({
      rank: rank++,
      category: 'UPCOMING',
      title: 'Establish launch marketing objectives',
      reason: 'Strategy not yet formalized into approved manifest',
      source: 'STRATEGY',
      dependency: 'Marketing Assessment',
      objectiveRelationship: input.profile.primary_objective,
      route: `${route}?tab=strategy`,
      priority: 50,
    });
  }

  for (const o of input.opportunities.slice(0, 2)) {
    if (o.label.includes('Assessment')) continue;
    actions.push({
      rank: rank++,
      category: 'UPCOMING',
      title: o.label,
      reason: o.detail,
      source: 'RECOMMENDATION',
      dependency: null,
      objectiveRelationship: input.profile?.primary_objective ?? null,
      route,
      priority: 60,
    });
  }

  actions.sort((a, b) => a.priority - b.priority);
  return actions.map((a, i) => ({ ...a, rank: i + 1 }));
}

export function categoryLabel(c: CommandCategory): string {
  return c.replace(/_/g, ' ');
}
