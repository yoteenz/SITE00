/**
 * Generic template resemblance audit — current NDXBOOK project home presentation.
 */

import type { GenericTemplateResemblanceAudit } from './types.js';

export function auditNdxbookProjectHomeTemplate(): GenericTemplateResemblanceAudit {
  const dimensions = [
    {
      dimension: 'INFORMATION_ARCHITECTURE',
      score: 'HIGH' as const,
      notes: ['Multiple equal sections with label/value rows — report-like scan pattern'],
    },
    {
      dimension: 'INTERACTION_MODEL',
      score: 'MEDIUM' as const,
      notes: ['Primary actions are link-out CTAs; limited in-page interaction grammar'],
    },
    {
      dimension: 'SPATIAL_MODEL',
      score: 'MEDIUM' as const,
      notes: ['Grid of sections inside host shell — not fully environmental'],
    },
    {
      dimension: 'CARD_DEPENDENCE',
      score: 'HIGH' as const,
      notes: ['site00-project-command__section bordered cards dominate layout'],
    },
    {
      dimension: 'NAVIGATION_MODEL',
      score: 'MEDIUM' as const,
      notes: ['Host nav + deep links; no project-native navigation metaphor'],
    },
    {
      dimension: 'HIERARCHY_MODEL',
      score: 'HIGH' as const,
      notes: ['Equal-weight tiles — KPI/dashboard composition habit'],
    },
    {
      dimension: 'MOBILE_TRANSLATION',
      score: 'HIGH' as const,
      notes: ['Sections stack vertically — desktop modules resized, not re-conceptualized'],
    },
    {
      dimension: 'ENVIRONMENTAL_INTEGRATION',
      score: 'LOW' as const,
      notes: ['Content reads as dashboard panel on host background rather than inhabited space'],
    },
  ];

  return {
    auditedAt: new Date().toISOString(),
    overallResemblance: 'HIGH',
    dimensions,
    primaryIssues: [
      'Repeated bordered section cards with equal visual weight',
      'Long report-like scrolling through conventional status rows',
      'Mobile stacks desktop module grid without experiential translation',
      'Rich intelligence delivered as database fields rather than interpreted project state',
    ],
  };
}

export function cardDefaultNotRequired(audit: GenericTemplateResemblanceAudit): boolean {
  const cardDim = audit.dimensions.find((d) => d.dimension === 'CARD_DEPENDENCE');
  return cardDim?.score === 'HIGH';
}
