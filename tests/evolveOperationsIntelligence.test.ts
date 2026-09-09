/**
 * Evolve Operations Intelligence — acceptance scenarios A–H + integration checks.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  applyRetryGuard,
  assertMarginNotClientVisible,
  assertNoPaidAutoRegeneration,
  buildOperationalNotifications,
  classifyFailure,
  createEvolveOperationsIntelligence,
  dedupeNotifications,
  resetOperationalNotificationDedupe,
  deriveProjectHealth,
  deriveSpendState,
  detectProviderIncidents,
  enforceNoNegativeBalance,
  generateExecutiveBrief,
  generateProviderOutageFailures,
  generateThousandProjectFixtures,
  getPolicyRegistrySnapshot,
  inspectDecision,
  resolveEvolveOperationsPolicy,
  shouldSendNudge,
  aggregatePortfolioSummary,
  buildPortfolioPage,
  computeMarginSnapshot,
  FIXTURE_BAD_CROP,
  FIXTURE_GROWTH_PARTNER_LAUNCH,
  FIXTURE_MARGIN_WATCH_ERODING,
  FIXTURE_MARKETING_RETAINER_STALL,
  FIXTURE_SELF_DIRECTED_CREDIT_WATCH,
  FIXTURE_TRANSIENT_FAILURE,
  isMeaningfulProgress,
} from '../shared/site00-evolve-operations/index.js';
import { createOperationsEvent, EvolveOperationsAuditLog } from '../shared/site00-evolve-operations/events.js';
import { firewallProjectOpsView } from '../shared/site00-evolve-operations/clientFirewall.js';

const ROOT = join(import.meta.dirname, '..');

describe('EvolveOperationsPolicyRegistry', () => {
  it('1–2. spend state derivation and configurable thresholds', () => {
    const policy = resolveEvolveOperationsPolicy('EVOLVE_SOLO', 'SELF_DIRECTED');
    expect(policy.spendWarningPercent).toBe(70);
    expect(policy.spendCriticalPercent).toBe(90);

    const spend = FIXTURE_SELF_DIRECTED_CREDIT_WATCH.spend;
    const state = deriveSpendState(spend, 'EVOLVE_SOLO', 'SELF_DIRECTED');
    expect(state.health).toBe('WATCH');
    expect(state.usagePercent).toBe(85);
    expect(state.reasons.some((r) => r.code === 'WARNING_USAGE')).toBe(true);
  });

  it('registry snapshot', () => {
    const snap = getPolicyRegistrySnapshot();
    expect(snap.policyCount).toBeGreaterThan(5);
  });
});

describe('Scenario A — self-directed credit watch', () => {
  it('3–5. credit watch, exhaustion block, no negative balance', () => {
    const engine = createEvolveOperationsIntelligence();
    const view = engine.analyzeProject(FIXTURE_SELF_DIRECTED_CREDIT_WATCH);
    expect(view.spend.health).toBe('WATCH');
    expect(view.escalation).toBeNull();
    expect(view.clientSafe.alerts.some((a) => a.type === 'SPEND_WARNING')).toBe(true);

    const exhausted = {
      ...FIXTURE_SELF_DIRECTED_CREDIT_WATCH.spend,
      usedCredits: 100,
      remainingCredits: 0,
      hasTopUp: false,
    };
    const blocked = deriveSpendState(exhausted, 'EVOLVE_SOLO', 'SELF_DIRECTED');
    expect(blocked.health).toBe('SPEND_BLOCKED');
    expect(blocked.blockGeneration).toBe(true);
    expect(enforceNoNegativeBalance({ ...exhausted, remainingCredits: -1 })).toBe(false);
  });
});

describe('Scenario B — transient failure', () => {
  it('7–9. classify timeout, one safe retry, freeze on second', () => {
    const engine = createEvolveOperationsIntelligence();
    const first = engine.handleJobFailure(FIXTURE_TRANSIENT_FAILURE, 'PROVIDER TIMEOUT ETIMEDOUT', 0);
    expect(first.classification.failureClass).toBe('PROVIDER_TIMEOUT');
    expect(first.retryGuard.action).toBe('AUTO_RETRY');
    expect(first.retryGuard.allowed).toBe(true);

    const second = engine.handleJobFailure(FIXTURE_TRANSIENT_FAILURE, 'PROVIDER TIMEOUT ETIMEDOUT', 1);
    expect(second.retryGuard.allowed).toBe(false);
    expect(['FREEZE_JOB', 'ESCALATE']).toContain(second.retryGuard.action);
  });
});

describe('Scenario C — bad crop', () => {
  it('10–11. bad crop no retry, return to crop', () => {
    const classification = classifyFailure('BAD_CROP validation failed');
    expect(classification.failureClass).toBe('BAD_CROP');
    const guard = applyRetryGuard(classification, 0, 'EVOLVE_SOLO', 'SELF_DIRECTED');
    expect(guard.action).toBe('RETURN_TO_INPUT');
    expect(guard.allowed).toBe(false);
    expect(assertNoPaidAutoRegeneration(classification, false)).toBe(true);
  });
});

describe('Scenario D — growth partner launch risk', () => {
  it('12–14. high priority, founder escalation path, top queue', () => {
    const engine = createEvolveOperationsIntelligence();
    const view = engine.analyzeProject(FIXTURE_GROWTH_PARTNER_LAUNCH);
    expect(view.queueAssignments[0]?.queueId).toMatch(/NEEDS_YOU_NOW|HIGH_VALUE_CLIENTS/);
    expect(view.queueAssignments[0]?.priority.score).toBeGreaterThanOrEqual(50);
    expect(view.health.health).toMatch(/WAITING_ON_CLIENT|AT_RISK/);
  });
});

describe('Scenario E — provider outage', () => {
  it('23–24. provider incident grouping and dedupe', () => {
    resetOperationalNotificationDedupe();
    const failures = generateProviderOutageFailures(30);
    const incidents = detectProviderIncidents(failures, 25);
    expect(incidents).toHaveLength(1);
    expect(incidents[0]?.affectedJobCount).toBe(30);
    expect(incidents[0]?.unsafeRetriesPaused).toBe(true);

    const notifications = buildOperationalNotifications([], incidents, 'FOUNDER');
    expect(notifications).toHaveLength(1);
    expect(notifications[0]?.message).toContain('30 JOBS AFFECTED');
    resetOperationalNotificationDedupe();
    const deduped = dedupeNotifications([...notifications, ...notifications, ...notifications]);
    expect(deduped.length).toBe(1);
    expect(dedupeNotifications(notifications).length).toBe(0);
  });
});

describe('Scenario F — marketing retainer stall', () => {
  it('13–15. waiting on client, nudge eligible, no founder escalation by default', () => {
    const health = deriveProjectHealth(FIXTURE_MARKETING_RETAINER_STALL);
    expect(health.health).toBe('WAITING_ON_CLIENT');
    expect(health.waitingParty).toBe('CLIENT');

    const engine = createEvolveOperationsIntelligence();
    const view = engine.analyzeProject(FIXTURE_MARKETING_RETAINER_STALL);
    expect(view.escalation?.level).not.toBe('LEVEL_4_FOUNDER');

    const nudge = shouldSendNudge(FIXTURE_MARKETING_RETAINER_STALL, 'PENDING_APPROVAL', []);
    expect(nudge.send).toBe(true);
  });
});

describe('Scenario G — margin watch', () => {
  it('21–22. internal margin watch, client firewall', () => {
    const margin = computeMarginSnapshot(480_000, 312_000, 108_000, 50_000, 'DIRECTED_BUILD', 'SITE00_DIRECTED');
    expect(['WATCH', 'ERODING', 'UNPROFITABLE']).toContain(margin.health);

    const engine = createEvolveOperationsIntelligence();
    const view = engine.analyzeProject(FIXTURE_MARGIN_WATCH_ERODING);
    expect(view.internalMargin?.health).toBe('ERODING');
    expect(assertMarginNotClientVisible(view.internalMargin, 'CLIENT')).toBeNull();
    const client = firewallProjectOpsView(view);
    expect(client).not.toHaveProperty('internalMargin');
    expect(JSON.stringify(client)).not.toContain('providerCost');
  });
});

describe('Scenario H — 1,000 project portfolio', () => {
  it('29. portfolio aggregates performantly without unbounded default view', () => {
    const fixtures = generateThousandProjectFixtures();
    expect(fixtures).toHaveLength(1000);

    const engine = createEvolveOperationsIntelligence();
    const start = performance.now();
    const page = engine.analyzePortfolio(fixtures);
    const elapsed = performance.now() - start;

    expect(page.summary.activeProjects).toBeGreaterThan(0);
    expect(page.topSignals.length).toBeLessThanOrEqual(8);
    expect(page.queues.NEEDS_YOU_NOW.items.length).toBeLessThanOrEqual(20);
    expect(elapsed).toBeLessThan(5000);
  });

  it('pagination on queues', () => {
    const fixtures = generateThousandProjectFixtures();
    const engine = createEvolveOperationsIntelligence();
    const views = fixtures.map((f) => engine.analyzeProject(f));
    const page = buildPortfolioPage(views, [], [], []);
    expect(page.queues.CLIENT_ACTION_REQUIRED.total).toBeGreaterThanOrEqual(0);
    expect(page.queues.CLIENT_ACTION_REQUIRED.items.length).toBeLessThanOrEqual(20);
  });
});

describe('Project health intelligence', () => {
  it('16–18. health states, waiting parties, stall detection', () => {
    expect(isMeaningfulProgress('APPROVAL_COMPLETED')).toBe(true);
    expect(isMeaningfulProgress('page_refresh')).toBe(false);

    const site00Wait = {
      ...FIXTURE_SELF_DIRECTED_CREDIT_WATCH,
      approvalWaitingOn: 'SITE00' as const,
      approvalPendingSince: new Date(Date.now() - 25 * 3600000).toISOString(),
    };
    const health = deriveProjectHealth(site00Wait);
    expect(health.health).toBe('WAITING_ON_SITE00');
    expect(health.waitingParty).toBe('SITE00');
  });
});

describe('Directed and growth-partner policies differ', () => {
  it('6–7. directed spend policy vs self-directed', () => {
    const solo = deriveSpendState(FIXTURE_SELF_DIRECTED_CREDIT_WATCH.spend, 'EVOLVE_SOLO', 'SELF_DIRECTED');
    const directed = deriveSpendState(
      { ...FIXTURE_GROWTH_PARTNER_LAUNCH.spend, providerCostCents: 600_000 },
      'GROWTH_PARTNER',
      'SITE00_DIRECTED',
    );
    expect(solo.internalSummary).toContain('WATCH');
    expect(directed.blockGeneration).toBe(false);
    expect(directed.health).not.toBe('SPEND_BLOCKED');
  });
});

describe('Escalation and routing', () => {
  it('17–20. escalation levels and routing by issue type', () => {
    const engine = createEvolveOperationsIntelligence();
    const view = engine.analyzeProject(FIXTURE_GROWTH_PARTNER_LAUNCH);
    expect(view.queueAssignments[0]?.issueType).toBe('VIP_HIGH_RISK');
    expect(view.queueAssignments[0]?.assignee).toBe('FOUNDER');
  });
});

describe('Repeated failure escalation', () => {
  it('11. repeated failure escalates', () => {
    const input = {
      ...FIXTURE_TRANSIENT_FAILURE,
      repeatedFailureCount: 3,
      unresolvedBlockerCount: 1,
    };
    const health = deriveProjectHealth(input);
    expect(health.health).toBe('SYSTEM_BLOCKED');
  });
});

describe('Nudge cooldown', () => {
  it('25. automated nudge cooldown', () => {
    const recent = [{ projectId: FIXTURE_MARKETING_RETAINER_STALL.projectId, nudgeType: 'PENDING_APPROVAL', sentAt: new Date().toISOString() }];
    const blocked = shouldSendNudge(FIXTURE_MARKETING_RETAINER_STALL, 'PENDING_APPROVAL', recent);
    expect(blocked.send).toBe(false);
    expect(blocked.reasons.some((r) => r.code === 'COOLDOWN')).toBe(true);
  });
});

describe('Executive brief and audit', () => {
  it('26–27. executive brief and event audit log', () => {
    const summary = aggregatePortfolioSummary([]);
    const brief = generateExecutiveBrief(summary, [], [], ['+2 NEEDS ATTENTION'], ['AUTO-RETRIED 5 JOBS']);
    expect(brief.title).toBe('EVOLVE DAILY');
    expect(brief.whatSystemHandled).toContain('AUTO-RETRIED 5 JOBS');

    const log = new EvolveOperationsAuditLog();
    log.append(createOperationsEvent({ eventType: 'JOB_FAILED', projectId: 'p1', automaticAction: 'ESCALATE' }));
    expect(log.count()).toBe(1);
    expect(log.list({ projectId: 'p1' })).toHaveLength(1);
  });
});

describe('System inspector', () => {
  it('28. system inspector explains decisions', () => {
    const entry = inspectDecision('spend_policy', { usage: 85 }, { health: 'WATCH' }, 'evolve-solo-self-directed', [
      { code: 'WARNING', label: '85% USED' },
    ]);
    expect(entry.domain).toBe('spend_policy');
    expect(entry.policyId).toBe('evolve-solo-self-directed');
  });
});

describe('Integration — founder control room', () => {
  it('30. founder control room card and route', () => {
    const routes = readFileSync(join(ROOT, 'src/site00/config/routes.ts'), 'utf8');
    expect(routes).toContain("controlEvolveOperations: '/control/evolve-operations'");

    const overview = readFileSync(join(ROOT, 'src/site00/pages/control/ControlOverviewPage.tsx'), 'utf8');
    expect(overview).toContain('EvolveOperationsCard');

    const page = readFileSync(join(ROOT, 'src/site00/pages/control/EvolveOperationsPage.tsx'), 'utf8');
    expect(page).toContain('VISUAL_AUTHORITY_REQUIRED');
    expect(page).toContain('TODAY');
  });
});

describe('Integration — project control room and client home', () => {
  it('31–32. project ops panel and client-safe home signals', () => {
    const panel = readFileSync(join(ROOT, 'src/site00/components/control/evolveOperations/ProjectEvolveOpsPanel.tsx'), 'utf8');
    expect(panel).toContain('ProjectEvolveOpsPanel');

    const home = readFileSync(join(ROOT, 'src/site00/components/selfDirected/SelfDirectedOpsSignals.tsx'), 'utf8');
    expect(home).toContain('SelfDirectedOpsSignals');
    const engine = createEvolveOperationsIntelligence();
    const view = engine.analyzeProject(FIXTURE_SELF_DIRECTED_CREDIT_WATCH);
    const client = firewallProjectOpsView(view);
    expect(JSON.stringify(client)).not.toMatch(/providerCost|marginPercent|priorityScore/i);
  });
});

describe('Build integrity', () => {
  it('33. shared module exports orchestrator', () => {
    const index = readFileSync(join(ROOT, 'shared/site00-evolve-operations/index.ts'), 'utf8');
    expect(index).toContain('evolveOperationsIntelligence');
    expect(index).toContain('spendIntelligence');
    expect(index).toContain('failureLoopIntelligence');
  });
});
