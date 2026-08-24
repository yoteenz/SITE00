/**
 * P0.5D.2 — Source coverage + blind spot evaluation.
 */

import type { LiveWorldSignal, SourceCoverageEvaluation } from './types.js';

const NDX_PRIORITY_DOMAINS = [
  'culture',
  'entertainment',
  'consumer behavior',
  'money',
  'workplace',
  'technology',
  'internet culture',
  'business',
  'fashion',
  'research',
  'design',
];

export function buildSourceCoverageEvaluation(params: {
  projectId: string;
  signals: LiveWorldSignal[];
  priorityDomains?: string[];
}): SourceCoverageEvaluation {
  const priority = params.priorityDomains ?? NDX_PRIORITY_DOMAINS;
  const domainCounts: Record<string, number> = {};
  const publisherCounts: Record<string, number> = {};

  for (const s of params.signals) {
    for (const d of s.domains) {
      domainCounts[d] = (domainCounts[d] ?? 0) + 1;
    }
    for (const src of s.sourceIds) {
      publisherCounts[src] = (publisherCounts[src] ?? 0) + 1;
    }
  }

  const covered = priority.filter((d) =>
    Object.keys(domainCounts).some((k) => k.toLowerCase().includes(d.toLowerCase())),
  );
  const weak = priority.filter((d) => {
    const count = Object.entries(domainCounts)
      .filter(([k]) => k.toLowerCase().includes(d.toLowerCase()))
      .reduce((sum, [, v]) => sum + v, 0);
    return count > 0 && count <= 1;
  });
  const uncovered = priority.filter((d) => !covered.includes(d));

  return {
    evaluationId: `sce-${params.projectId}`,
    projectId: params.projectId,
    coveredDomains: covered,
    weakDomains: weak,
    uncoveredDomains: uncovered,
    sourceConcentration: publisherCounts,
    knownBlindSpots: [
      'Search/attention movement — NOT_CONNECTED',
      'Direct community/social conversation — NOT_CONNECTED',
      'Non-English sources — limited',
      'Private/platform-native discourse — unavailable',
    ],
    evaluatedAt: new Date().toISOString(),
  };
}
