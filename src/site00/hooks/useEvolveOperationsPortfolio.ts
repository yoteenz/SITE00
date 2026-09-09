import { useMemo } from 'react';
import {
  createEvolveOperationsIntelligence,
  generateProviderOutageFailures,
  generateThousandProjectFixtures,
  detectProviderIncidents,
  FIXTURE_GROWTH_PARTNER_LAUNCH,
  FIXTURE_MARGIN_WATCH,
  FIXTURE_MARKETING_RETAINER_STALL,
  FIXTURE_SELF_DIRECTED_CREDIT_WATCH,
} from '../../../shared/site00-evolve-operations/index.js';
import type { EvolvePortfolioPage, EvolveQueueId } from '../../../shared/site00-evolve-operations/types.js';

const DEMO_FIXTURES = [
  FIXTURE_SELF_DIRECTED_CREDIT_WATCH,
  FIXTURE_GROWTH_PARTNER_LAUNCH,
  FIXTURE_MARKETING_RETAINER_STALL,
  FIXTURE_MARGIN_WATCH,
];

export type EvolveOperationsTab = 'TODAY' | 'AT_RISK' | 'SPEND' | 'FAILURES' | 'CLIENT_WAITING' | 'SYSTEM_WAITING';

const TAB_QUEUE_MAP: Record<EvolveOperationsTab, EvolveQueueId[]> = {
  TODAY: ['NEEDS_YOU_NOW', 'HIGH_VALUE_CLIENTS', 'AT_RISK'],
  AT_RISK: ['AT_RISK', 'HIGH_VALUE_CLIENTS'],
  SPEND: ['SPEND_WATCH'],
  FAILURES: ['REPEATED_FAILURES', 'BLOCKED'],
  CLIENT_WAITING: ['CLIENT_ACTION_REQUIRED'],
  SYSTEM_WAITING: ['SITE00_ACTION_REQUIRED', 'SYSTEM_CAN_HANDLE'],
};

export function useEvolveOperationsPortfolio(options?: { scale?: boolean; tab?: EvolveOperationsTab }) {
  return useMemo(() => {
    const engine = createEvolveOperationsIntelligence();
    const inputs = options?.scale ? generateThousandProjectFixtures() : DEMO_FIXTURES;
    const incidents = detectProviderIncidents(generateProviderOutageFailures(30), 25);
    const page: EvolvePortfolioPage = engine.analyzePortfolio(inputs, incidents, [
      'AUTO-RETRIED 12 TRANSIENT FAILURES',
      'NUDGED 8 STALLED APPROVALS',
      'BLOCKED 3 UNSAFE REGENERATIONS',
    ]);

    const tab = options?.tab ?? 'TODAY';
    const queueIds = TAB_QUEUE_MAP[tab];
    const tabActions = queueIds.flatMap((qid) => page.queues[qid]?.items ?? []);

    return { page, tabActions, engine, scale: inputs.length };
  }, [options?.scale, options?.tab]);
}
