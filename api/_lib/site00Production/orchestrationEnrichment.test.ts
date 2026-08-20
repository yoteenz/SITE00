import { describe, expect, it } from 'vitest';

describe('orchestration enrichment mapping', () => {
  it('maps NEEDS_YOU category to CRITICAL severity', async () => {
    const { enrichControlCommandWithOrchestration } = await import('./orchestrationEnrichment.js');
    process.env.ORCHESTRATION_USE_MEMORY = '1';
    const base = {
      operator: { displayName: 'TEST', role: 'ADMIN' },
      metrics: [],
      priorityQueue: [],
      matrixStages: [],
      productionMatrix: [],
      activity: [],
      upcomingReviews: [],
      launchQueue: [],
      systemHealth: { overall: 'UNKNOWN' as const, summary: 'TEST', systems: [] },
      alertCount: 0,
      productionSpineSummary: [],
    };
    const enriched = await enrichControlCommandWithOrchestration(base);
    if (enriched.orchestration) {
      expect(enriched.metrics.some((m) => m.id === 'needs-you')).toBe(true);
      expect(enriched.orchestration.portfolio.length).toBeGreaterThan(0);
    }
  });
});
