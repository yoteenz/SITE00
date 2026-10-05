import type {
  StudioWorldApprovalRequest,
  StudioWorldClientDeliverable,
  StudioWorldClientReview,
  StudioWorldClientStatus,
  StudioWorldProvisionRequest,
  StudioWorldProvisionResult,
} from './types.js';

/** Server-side Studio World integration — single entry point for all external production calls. */
export interface ProductionServiceAdapter {
  readonly mode: 'mock' | 'live';
  provisionCampaign(request: StudioWorldProvisionRequest): Promise<StudioWorldProvisionResult>;
  getClientStatus(campaignId: string): Promise<StudioWorldClientStatus>;
  listClientReviews(campaignId: string): Promise<StudioWorldClientReview[]>;
  listClientDeliverables(campaignId: string): Promise<StudioWorldClientDeliverable[]>;
  submitClientAction(request: StudioWorldApprovalRequest): Promise<{ ok: true }>;
}

export function translateStudioWorldError(err: unknown): { code: string; clientMessage: string } {
  if (err instanceof Error) {
    if (err.message.includes('timeout') || err.message.includes('ETIMEDOUT')) {
      return { code: 'STUDIO_CONNECTION_DELAYED', clientMessage: 'Studio connection delayed. SITE 00 is retrying.' };
    }
    if (err.message.includes('409') || err.message.includes('ALREADY_EXISTS')) {
      return { code: 'PROJECT_ALREADY_INITIALIZED', clientMessage: 'This campaign is already initialized.' };
    }
    if (err.message.includes('401') || err.message.includes('403')) {
      return { code: 'INTERNAL_CONNECTION_ERROR', clientMessage: 'Internal connection error. Our team has been notified.' };
    }
  }
  return { code: 'PRODUCTION_SETUP_REQUIRES_ATTENTION', clientMessage: 'Production setup requires attention. Our team is on it.' };
}
