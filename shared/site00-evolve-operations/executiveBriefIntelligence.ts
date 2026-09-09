/**
 * ExecutiveBriefIntelligence — daily / on-demand founder summary.
 */

import type {
  EvolveExecutiveBrief,
  EvolveOperationalAction,
  EvolvePortfolioSummary,
  EvolveProviderIncident,
} from './types.js';

export function generateExecutiveBrief(
  summary: EvolvePortfolioSummary,
  founderActions: EvolveOperationalAction[],
  incidents: EvolveProviderIncident[],
  whatChanged: string[],
  whatSystemHandled: string[],
  generatedAt = new Date().toISOString(),
): EvolveExecutiveBrief {
  return {
    generatedAt,
    title: 'EVOLVE DAILY',
    sections: [
      {
        id: 'portfolio',
        label: 'PORTFOLIO',
        items: [
          { label: 'ACTIVE PROJECTS', value: summary.activeProjects },
          { label: 'NEEDS ATTENTION', value: summary.needsAttention },
          { label: 'HIGH-PRIORITY DIRECTED CLIENTS', value: summary.highValueAtRisk },
        ],
      },
      {
        id: 'incidents',
        label: 'PROVIDER INCIDENTS',
        items: incidents.map((i) => ({
          label: i.providerName,
          value: i.affectedJobCount,
          detail: i.unsafeRetriesPaused ? 'RETRIES PAUSED' : undefined,
        })),
      },
      {
        id: 'system',
        label: 'SYSTEM HANDLED',
        items: whatSystemHandled.map((s) => ({ label: s, value: '✓' })),
      },
      {
        id: 'spend',
        label: 'SPEND',
        items: [
          { label: 'SPEND WATCH', value: summary.spendWatch },
          { label: 'MARGIN WATCH', value: summary.marginWatch },
        ],
      },
    ],
    founderDecisionsRequired: founderActions.filter((a) => a.queueId === 'NEEDS_YOU_NOW').slice(0, 10),
    whatChanged,
    whatSystemHandled,
  };
}
