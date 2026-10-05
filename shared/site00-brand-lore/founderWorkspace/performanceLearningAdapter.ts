/**
 * Performance + Learning → Observation Room presentation adapter.
 */

import type {
  LearningSignalPresentation,
  PerformanceCreativePresentation,
} from '../../site00-studio-world-production/founderWorkspace/types.js';
import type { ContentOperationsRun } from '../contentOperations/types.js';

export function buildPerformanceSummary(run: ContentOperationsRun | null): {
  reach: number | null;
  saves: number | null;
  profileVisits: number | null;
  followers: number | null;
} {
  const records = run?.performanceRecords ?? [];
  if (!records.length) {
    return { reach: null, saves: null, profileVisits: null, followers: null };
  }
  const impressions = records.reduce((sum, r) => sum + (r.impressions ?? 0), 0);
  const saves = records.reduce((sum, r) => sum + (r.saves ?? 0), 0);
  const likes = records.reduce((sum, r) => sum + (r.likes ?? 0), 0);
  return {
    reach: impressions || null,
    saves: saves || null,
    profileVisits: likes || null,
    followers: null,
  };
}

export function buildContentThatHit(run: ContentOperationsRun | null): PerformanceCreativePresentation[] {
  const packages = run?.contentPackages ?? [];
  const records = run?.performanceRecords ?? [];
  const approved = packages.filter((p) => p.status === 'APPROVED' || p.status === 'PUBLISHED');

  return approved.map((pkg) => {
    const rec = records.find((r) => r.contentPackageId === pkg.id);
    const parts: string[] = [];
    if (rec?.impressions != null) parts.push(`${rec.impressions.toLocaleString()} reach`);
    if (rec?.saves != null) parts.push(`${rec.saves.toLocaleString()} saves`);
    if (rec?.likes != null) parts.push(`${rec.likes.toLocaleString()} likes`);
    return {
      id: pkg.id,
      title: pkg.altText ?? pkg.opportunityId,
      previewUrl: null,
      metricsSummary: parts.length ? parts.join(' · ') : 'Metrics pending',
      attention: rec ? 'INFORMATIONAL' : 'DEVELOPING',
    };
  });
}

export function buildLearningSignals(run: ContentOperationsRun | null): LearningSignalPresentation[] {
  return (run?.performanceLearning ?? []).map((l) => ({
    id: l.learningId,
    observation: l.observedPatterns[0] ?? 'Pattern under review',
    confidence: `${l.confidence} (n=${l.sampleSize})`,
    founderAccepted: l.founderAccepted,
  }));
}

export function buildAudienceSignals(run: ContentOperationsRun | null): string[] {
  const responses = run?.audienceResponses ?? [];
  const classifications = new Map<string, number>();
  for (const r of responses) {
    for (const c of r.classifications) {
      classifications.set(c, (classifications.get(c) ?? 0) + 1);
    }
  }
  return [...classifications.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count]) => `${label.replace(/_/g, ' ').toLowerCase()}: ${count > 2 ? 'High' : 'Emerging'}`);
}
