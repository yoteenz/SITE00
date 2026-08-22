import type { ProductionServiceAdapter } from './adapter.js';
import type {
  StudioWorldApprovalRequest,
  StudioWorldClientDeliverable,
  StudioWorldClientReview,
  StudioWorldClientStatus,
  StudioWorldProvisionRequest,
  StudioWorldProvisionResult,
} from './types.js';

/** In-memory mock campaigns for development — NEVER used when STUDIO_WORLD_ADAPTER=live. */
const mockCampaigns = new Map<
  string,
  {
    request: StudioWorldProvisionRequest;
    phase: string;
    clientActionRequired: boolean;
    clientActionLabel?: string;
    reviews: StudioWorldClientReview[];
    deliverables: StudioWorldClientDeliverable[];
  }
>();

function campaignIdFor(engagementId: string): string {
  return `sw-mock-${engagementId.slice(0, 8)}`;
}

export class MockStudioWorldAdapter implements ProductionServiceAdapter {
  readonly mode = 'mock' as const;

  async provisionCampaign(request: StudioWorldProvisionRequest): Promise<StudioWorldProvisionResult> {
    const existing = mockCampaigns.get(request.externalEngagementId);
    if (existing) {
      return { campaignId: campaignIdFor(request.externalEngagementId), status: 'ALREADY_EXISTS', clientPhase: existing.phase };
    }

    mockCampaigns.set(request.externalEngagementId, {
      request,
      phase: '02',
      clientActionRequired: false,
      reviews: [],
      deliverables: [],
    });

    return { campaignId: campaignIdFor(request.externalEngagementId), status: 'PROVISIONED', clientPhase: '02' };
  }

  async getClientStatus(campaignId: string): Promise<StudioWorldClientStatus> {
    const entry = [...mockCampaigns.entries()].find(([, v]) => campaignIdFor(v.request.externalEngagementId) === campaignId);
    if (!entry) {
      return {
        campaignId,
        clientPhase: '03',
        clientActionRequired: false,
        syncStatus: 'SYNCED',
        milestoneLabel: 'PRODUCTION ACTIVE',
        nextExpectedAction: 'SITE 00 IS PRODUCING YOUR CAMPAIGN.',
      };
    }
    const [, data] = entry;
    return {
      campaignId,
      clientPhase: data.phase,
      clientActionRequired: data.clientActionRequired,
      clientActionLabel: data.clientActionLabel,
      syncStatus: 'SYNCED',
      milestoneLabel: data.clientActionRequired ? 'YOUR SIGNAL IS REQUIRED' : 'PRODUCTION ACTIVE',
      nextExpectedAction: data.clientActionRequired
        ? data.clientActionLabel ?? 'ACTION REQUIRED'
        : 'SITE 00 IS MOVING YOUR CAMPAIGN FORWARD.',
    };
  }

  async listClientReviews(campaignId: string): Promise<StudioWorldClientReview[]> {
    const entry = [...mockCampaigns.entries()].find(([, v]) => campaignIdFor(v.request.externalEngagementId) === campaignId);
    return entry?.[1].reviews ?? [];
  }

  async listClientDeliverables(campaignId: string): Promise<StudioWorldClientDeliverable[]> {
    const entry = [...mockCampaigns.entries()].find(([, v]) => campaignIdFor(v.request.externalEngagementId) === campaignId);
    return entry?.[1].deliverables ?? [];
  }

  async submitClientAction(_request: StudioWorldApprovalRequest): Promise<{ ok: true }> {
    return { ok: true };
  }

  /** Dev helper — advance mock state for debug routes. */
  static setMockScenario(
    engagementId: string,
    scenario: 'production' | 'action-required' | 'review-ready' | 'deliverable-ready' | 'complete' | 'error',
  ): void {
    let data = mockCampaigns.get(engagementId);
    if (!data) {
      data = {
        request: {
          externalSystem: 'SITE_00',
          externalClientId: 'mock-client',
          externalEngagementId: engagementId,
          brandSetupRequired: false,
          engagementType: 'EVOLVE_MARKETING',
          serviceType: 'campaign',
        },
        phase: '03',
        clientActionRequired: false,
        reviews: [],
        deliverables: [],
      };
      mockCampaigns.set(engagementId, data);
    }

    switch (scenario) {
      case 'production':
        data.phase = '03';
        data.clientActionRequired = false;
        data.reviews = [];
        break;
      case 'action-required':
        data.phase = '03';
        data.clientActionRequired = true;
        data.clientActionLabel = 'UPLOAD REQUIRED ASSET';
        break;
      case 'review-ready':
        data.phase = '05';
        data.clientActionRequired = true;
        data.clientActionLabel = 'REVIEW CAMPAIGN';
        data.reviews = [
          {
            id: 'rev-mock-1',
            title: 'CAMPAIGN DIRECTION A',
            reviewType: 'direction',
            status: 'OPEN',
            allowsDirectionSelect: true,
            directions: [
              { id: 'A', label: 'DIRECTION A' },
              { id: 'B', label: 'DIRECTION B' },
              { id: 'C', label: 'DIRECTION C' },
            ],
          },
        ];
        break;
      case 'deliverable-ready':
        data.phase = '06';
        data.clientActionRequired = false;
        data.deliverables = [
          {
            id: 'del-mock-1',
            title: 'CAMPAIGN MASTER — FEED',
            format: 'MP4',
            aspectRatio: '9:16',
            version: 'V1',
            visibility: 'CLIENT_VISIBLE',
          },
        ];
        break;
      case 'complete':
        data.phase = '07';
        data.clientActionRequired = false;
        break;
      case 'error':
        data.clientActionRequired = false;
        break;
    }
  }
}
