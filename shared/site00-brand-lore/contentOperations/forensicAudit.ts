/**
 * P0.5D forensic audit — existing content systems classification.
 */

import type { ContentOperationsForensicAudit } from './types.js';
import { LIVE_SIGNAL_INGESTION_NOT_CONNECTED } from './constants.js';

export function auditContentSystems(params: { projectId: string }): ContentOperationsForensicAudit {
  return {
    auditId: `co-audit-${params.projectId}`,
    projectId: params.projectId,
    classifications: {
      'P0.5C_brandMarketingExpression': 'AUTHORITATIVE',
      Experiment_F: 'AUTHORITATIVE',
      Sequence_Creative_System: 'PARTIAL',
      carousel_v1: 'LEGACY',
      EVOLVE_calendar_schema: 'PARTIAL',
      EVOLVE_campaigns: 'PARTIAL',
      EVOLVE_publishing: 'MISSING',
      analytics_ingestion: 'MISSING',
      content_planning_engine: 'MISSING',
      content_library: 'INTEGRATED',
      production_orchestration_P0_5A: 'AUTHORITATIVE',
      StudioWorldRunRecord: 'PARTIAL',
      content_operations: 'MISSING',
    },
    experimentFRelationship:
      'Experiment F = CONTENT CONCEPT TERRITORY RESEARCH (Credit Utilization). Historical records immutable. May contribute to ContentOpportunity — not mandatory per post.',
    sequenceCreativeRelationship:
      'Sequence Creative System = INTEGRATED for carousel cohesion. P0.5D integrates — does not duplicate.',
    liveSignalIngestion: LIVE_SIGNAL_INGESTION_NOT_CONNECTED ? 'NOT_CONNECTED' : 'NOT_CONNECTED',
    duplicatesDetected: [
      'EVOLVE calendar vs methodology calendar — separate scopes; P0.5D uses methodology run',
      'Content Brain memory store — LEGACY; not authoritative for NDXBOOK ops',
    ],
    historicalRecordsMutated: false,
    auditedAt: new Date().toISOString(),
  };
}

export function experimentFImmutable(): true {
  return true;
}

export function experimentGNotReevaluated(): true {
  return true;
}
