/**
 * P0.5D.2 — Signal discovery diversity evaluation.
 */

import type { LiveWorldSignal, RawWebNewsCandidate, SignalDiscoveryDiversityEvaluation } from './types.js';

export function buildSignalDiscoveryDiversityEvaluation(params: {
  projectId: string;
  signals: LiveWorldSignal[];
  rawCandidates?: RawWebNewsCandidate[];
}): SignalDiscoveryDiversityEvaluation {
  const domainCounts: Record<string, number> = {};
  const publisherCounts: Record<string, number> = {};
  const queryCounts: Record<string, number> = {};

  for (const s of params.signals) {
    for (const d of s.domains) domainCounts[d] = (domainCounts[d] ?? 0) + 1;
    for (const src of s.sourceIds) publisherCounts[src] = (publisherCounts[src] ?? 0) + 1;
  }
  for (const c of params.rawCandidates ?? []) {
    if (c.query) queryCounts[c.query] = (queryCounts[c.query] ?? 0) + 1;
  }

  const total = params.signals.length || 1;
  const maxDomain = Math.max(0, ...Object.values(domainCounts));
  const maxPublisher = Math.max(0, ...Object.values(publisherCounts));
  const maxQuery = Math.max(0, ...Object.values(queryCounts));

  const domainConcentration = maxDomain / total;
  const publisherConcentration = maxPublisher / total;
  const queryFamilyConcentration = maxQuery / (params.rawCandidates?.length || 1);

  const dominantDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const dominantPublisher = Object.entries(publisherCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    evaluationId: `sdd-${params.projectId}`,
    projectId: params.projectId,
    domainConcentration,
    publisherConcentration,
    queryFamilyConcentration,
    overConcentrated: domainConcentration > 0.6 || publisherConcentration > 0.7,
    dominantDomain,
    dominantPublisher,
    evaluatedAt: new Date().toISOString(),
  };
}

export function syndicatedArticlesDoNotInflateDiversity(params: {
  syndicated: boolean;
  independentSourceCount: number;
}): boolean {
  return !params.syndicated || params.independentSourceCount >= 2;
}
