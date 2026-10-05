import type { ProductionServiceAdapter } from './adapter.js';
import { STUDIO_WORLD_API_PATHS } from './contract.js';
import { studioWorldFetch } from './httpClient.js';
import type {
  StudioWorldApprovalRequest,
  StudioWorldClientDeliverable,
  StudioWorldClientReview,
  StudioWorldClientStatus,
  StudioWorldProvisionRequest,
  StudioWorldProvisionResult,
} from './types.js';

type ReviewsResponse = { reviews: StudioWorldClientReview[] };
type DeliverablesResponse = { deliverables: StudioWorldClientDeliverable[] };

export class LiveStudioWorldAdapter implements ProductionServiceAdapter {
  readonly mode = 'live' as const;

  async provisionCampaign(request: StudioWorldProvisionRequest): Promise<StudioWorldProvisionResult> {
    const result = await studioWorldFetch<StudioWorldProvisionResult>(STUDIO_WORLD_API_PATHS.provision, {
      method: 'POST',
      body: request,
      idempotencyKey: request.externalEngagementId,
    });

    if (result.status === 'ALREADY_EXISTS') {
      return { ...result, status: 'ALREADY_EXISTS' };
    }
    return result;
  }

  async getClientStatus(campaignId: string): Promise<StudioWorldClientStatus> {
    return studioWorldFetch<StudioWorldClientStatus>(STUDIO_WORLD_API_PATHS.status(campaignId));
  }

  async listClientReviews(campaignId: string): Promise<StudioWorldClientReview[]> {
    const res = await studioWorldFetch<ReviewsResponse>(STUDIO_WORLD_API_PATHS.reviews(campaignId));
    return res.reviews ?? [];
  }

  async listClientDeliverables(campaignId: string): Promise<StudioWorldClientDeliverable[]> {
    const res = await studioWorldFetch<DeliverablesResponse>(STUDIO_WORLD_API_PATHS.deliverables(campaignId));
    return res.deliverables ?? [];
  }

  async submitClientAction(request: StudioWorldApprovalRequest): Promise<{ ok: true }> {
    const { reviewId, ...body } = request;
    return studioWorldFetch<{ ok: true }>(STUDIO_WORLD_API_PATHS.reviewAction(reviewId), {
      method: 'POST',
      body,
    });
  }
}
