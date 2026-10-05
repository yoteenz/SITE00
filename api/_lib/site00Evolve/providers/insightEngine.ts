/** Evidence-backed insights with confidence grading */

import type { InsightConfidence } from './types.js';

export function gradeInsightConfidence(opts: {
  sampleSize: number;
  measurementComplete: boolean;
  dataFreshnessHours?: number;
  attributionConfidence?: string;
}): InsightConfidence {
  if (opts.sampleSize < 1 || !opts.measurementComplete) return 'INSUFFICIENT_EVIDENCE';
  if (opts.sampleSize < 3) return 'LOW';
  if (opts.dataFreshnessHours && opts.dataFreshnessHours > 168) return 'LOW';
  if (opts.attributionConfidence === 'UNCERTAIN') return 'LOW';
  if (opts.sampleSize >= 10) return 'HIGH';
  return 'MEDIUM';
}

export function buildEvidenceInsight(opts: {
  title: string;
  summary: string;
  evidence: unknown[];
  confidence: InsightConfidence;
  connectionIds: string[];
}) {
  return {
    insight_type: 'PERFORMANCE_LEARNING',
    title: opts.title,
    summary: opts.summary,
    evidence: opts.evidence,
    confidence: opts.confidence,
    recommendation: opts.confidence === 'INSUFFICIENT_EVIDENCE' ? null : 'Review evidence before acting',
    recommendation_status: 'SUGGESTED',
    metadata: {
      source_connections: opts.connectionIds,
      kind: 'INFERENCE',
      content_brain_boundary: 'SUGGESTED_ONLY',
    },
  };
}
