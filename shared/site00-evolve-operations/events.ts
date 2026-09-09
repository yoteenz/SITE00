/**
 * Evolve operations event stream + audit log.
 */

import type { EvolveFailureClass, EvolveOperationsEvent, EvolveOperationsEventType, EvolveExplainReason } from './types.js';

let eventCounter = 0;

export function createOperationsEvent(params: {
  eventType: EvolveOperationsEventType;
  projectId?: string | null;
  accountId?: string | null;
  jobId?: string | null;
  classification?: EvolveFailureClass | null;
  policyApplied?: string | null;
  automaticAction?: string | null;
  initiatedBy?: EvolveOperationsEvent['initiatedBy'];
  spendImpactCents?: number;
  reasons?: EvolveExplainReason[];
  resolution?: string | null;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}): EvolveOperationsEvent {
  eventCounter += 1;
  return {
    id: `evt-${Date.now()}-${eventCounter}`,
    eventType: params.eventType,
    projectId: params.projectId ?? null,
    accountId: params.accountId ?? null,
    jobId: params.jobId ?? null,
    classification: params.classification ?? null,
    policyApplied: params.policyApplied ?? null,
    automaticAction: params.automaticAction ?? null,
    initiatedBy: params.initiatedBy ?? 'SYSTEM',
    spendImpactCents: params.spendImpactCents ?? 0,
    reasons: params.reasons ?? [],
    timestamp: params.timestamp ?? new Date().toISOString(),
    resolution: params.resolution ?? null,
    metadata: params.metadata,
  };
}

export class EvolveOperationsAuditLog {
  private events: EvolveOperationsEvent[] = [];

  append(event: EvolveOperationsEvent): void {
    this.events.push(event);
  }

  list(filter?: { projectId?: string; eventType?: EvolveOperationsEventType }): EvolveOperationsEvent[] {
    return this.events.filter((e) => {
      if (filter?.projectId && e.projectId !== filter.projectId) return false;
      if (filter?.eventType && e.eventType !== filter.eventType) return false;
      return true;
    });
  }

  count(): number {
    return this.events.length;
  }
}
