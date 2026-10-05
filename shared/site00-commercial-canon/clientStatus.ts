/**
 * Part 21 — Derive client-facing status from FulfillmentStatus (no hardcoded IN PROGRESS).
 */

import type { FulfillmentStatus } from './types.js';
import { getFulfillmentAdapter } from './fulfillmentAdapter.js';
import type { ProjectBootstrapContext } from './types.js';

export function clientStatusLabelFromFulfillment(status: FulfillmentStatus): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'NOT STARTED';
    case 'INTAKE':
      return 'INTAKE IN PROGRESS';
    case 'READY':
      return 'READY TO BEGIN';
    case 'IN_PRODUCTION':
      return 'IN PRODUCTION';
    case 'AWAITING_CLIENT':
      return 'YOUR REVIEW NEEDED';
    case 'REVISION':
      return 'REVISION IN PROGRESS';
    case 'APPROVED':
      return 'APPROVED';
    case 'DELIVERING':
      return 'DELIVERING';
    case 'DELIVERED':
      return 'DELIVERED';
    case 'COMPLETE':
      return 'COMPLETE';
    case 'BLOCKED':
      return 'BLOCKED';
    default:
      return 'UNKNOWN';
  }
}

export function deriveClientStatusFromAdapter(ctx: ProjectBootstrapContext): {
  fulfillmentStatus: FulfillmentStatus;
  clientLabel: string;
} {
  const adapter = getFulfillmentAdapter(ctx.fulfillmentAdapterId);
  const fulfillmentStatus = adapter?.getClientStatus(ctx) ?? 'NOT_STARTED';
  return {
    fulfillmentStatus,
    clientLabel: clientStatusLabelFromFulfillment(fulfillmentStatus),
  };
}
